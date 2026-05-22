import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, open, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const defaultInputDir = resolve(knowledgeBaseRoot, "lg_knowledge");
const inputDir = resolve(process.env.LG_KNOWLEDGE_DIR ?? defaultInputDir);
const outputPath = resolve(process.env.LG_INVENTORY_OUT ?? join(rootDir, "raw", "manifests", "lg.local-sources.json"));
const identifierManifestPath = resolve(
  process.env.LG_IDENTIFIER_MANIFEST ?? join(rootDir, "raw", "manifests", "lg.identifier-verification.json")
);
const intakeTemplatePath = resolve(
  process.env.LG_SOURCE_INTAKE_TEMPLATE ?? join(rootDir, "raw", "manifests", "lg.source-intake-template.json")
);
const explicitLedgerPath = process.env.LG_DOCUMENT_URL_LIST ? resolve(process.env.LG_DOCUMENT_URL_LIST) : null;

const identifierManifest = JSON.parse(await readFile(identifierManifestPath, "utf8"));
const intakeTemplate = JSON.parse(await readFile(intakeTemplatePath, "utf8"));
const recordsByCompany = new Map((identifierManifest.records ?? []).map((record) => [record.companyId, record]));
const companyFolderMap = new Map(allTemplateCompanies().map((company) => [company.folderName, company.companyId]));
const companyByHeading = buildHeadingMap();

const ledgerPaths = explicitLedgerPath ? [explicitLedgerPath] : await discoverLedgerPaths(inputDir);
const ledgerRecords = dedupeLedgerRecords((await Promise.all(ledgerPaths.map(readLedgerRecords))).flat());
const ledgerIndex = indexLedgerRecords(ledgerRecords);

const files = existsSync(inputDir)
  ? (await collectFiles(inputDir)).filter((path) => !basename(path).startsWith(".") && !isControlFile(path))
  : [];

const entries = [];
for (const absolutePath of files.sort(localeCompare)) {
  const pathParts = relative(inputDir, absolutePath).split(sep).map((part) => part.normalize("NFC"));
  const extension = extname(absolutePath).replace(".", "").toLowerCase() || "none";
  const sizeBytes = (await stat(absolutePath)).size;
  const sha256 = await hashFile(absolutePath);
  const isPdf = await isPdfFile(absolutePath);
  const companyFolder = inferCompanyFolder(pathParts);
  const inferredCompanyId = companyFolder ? companyFolderMap.get(companyFolder) ?? null : null;
  const localPathFromRoot = relative(rootDir, absolutePath).normalize("NFC");
  const localPathFromInput = relative(inputDir, absolutePath).normalize("NFC");
  const ledgerMatch = matchLedgerRecord({
    companyId: inferredCompanyId,
    filename: basename(absolutePath),
    localPathFromInput,
    absolutePath
  });
  const companyId = ledgerMatch?.companyId ?? inferredCompanyId;
  const identifier = companyId ? recordsByCompany.get(companyId) : null;
  const title = cleanCell(ledgerMatch?.title) || stripExtension(basename(absolutePath)).normalize("NFC");
  const documentType = normalizeDocumentType(ledgerMatch?.documentType) || inferDocumentType({ title, extension, pathParts });
  const period = cleanCell(ledgerMatch?.date) || inferPeriod(title);
  const sourcePageUrl = cleanUrl(ledgerMatch?.sourcePageUrl) || defaultSourcePageFor(companyId);
  const publicDocumentUrl = cleanUrl(ledgerMatch?.publicDocumentUrl) || constructedPublicUrl({ companyId, ledgerMatch });
  const dartReceiptUrl = cleanUrl(ledgerMatch?.dartReceiptUrl);
  const rceptNo = inferRceptNo(dartReceiptUrl) ?? inferRceptNo(publicDocumentUrl);
  const requestPackage = cleanCell(ledgerMatch?.requestPackage) || requestPackageFor(documentType);
  const selectionReason = cleanCell(ledgerMatch?.selectionReason) || defaultSelectionReason({ documentType, period });
  const rightsLevel = rightsLevelFor({ publicDocumentUrl, sourcePageUrl, ledgerMatch });
  const documentUrlStatus = documentUrlStatusFor({ publicDocumentUrl, sourcePageUrl, dartReceiptUrl });

  entries.push({
    id: `lg-local-${sha256.slice(0, 12)}`,
    groupId: "lg",
    companyId,
    companyFolder,
    koreanName: identifier?.koreanName ?? cleanCell(ledgerMatch?.company) ?? companyFolder,
    title,
    filename: basename(absolutePath).normalize("NFC"),
    localPath: localPathFromRoot,
    ledgerLocalFile: cleanCell(ledgerMatch?.localFile) || localPathFromInput,
    extension,
    sizeBytes,
    sha256,
    isPdf,
    documentType,
    period,
    sourceRole: "official_issuer",
    sourceReliability: "primary",
    sourcePageUrl,
    publicDocumentUrl,
    dartReceiptUrl,
    rceptNo,
    requestPackage,
    selectionReason,
    rightsLevel,
    documentUrlStatus,
    intakeReadiness: intakeReadinessFor({
      companyId,
      selectionReason,
      publicDocumentUrl,
      sourcePageUrl,
      dartReceiptUrl
    }),
    processingDecision: processingDecision({ extension, isPdf }),
    redistributionPolicy: redistributionPolicyFor(rightsLevel),
    paperUseLevel: paperUseLevel({ extension, isPdf, publicDocumentUrl, sourcePageUrl, selectionReason }),
    notes: notesFor({ extension, isPdf, companyId, documentType, ledgerMatch, publicDocumentUrl, sourcePageUrl }),
    _ledgerKey: ledgerMatch?._key ?? null
  });
}

const byChecksum = groupBy(entries, (entry) => entry.sha256);
for (const duplicates of byChecksum.values()) {
  if (duplicates.length <= 1) continue;
  const canonicalEntry = duplicates
    .map((entry, index) => ({ entry, index, score: duplicateCanonicalScore(entry) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].entry;
  let duplicateIndex = 1;
  for (const duplicate of duplicates) {
    if (duplicate === canonicalEntry) continue;
    duplicate.duplicateOf = canonicalEntry.id;
    duplicate.id = `${duplicate.id}-dup${duplicateIndex}`;
    duplicateIndex += 1;
    duplicate.processingDecision = "duplicate-reference-only";
    duplicate.intakeReadiness = "duplicate_reference_only";
    duplicate.paperUseLevel = "manifest_only_duplicate";
    duplicate.notes = [...(duplicate.notes ?? []), `duplicate of ${canonicalEntry.id}; not eligible for extraction or claim promotion`];
  }
}

const matchedLedgerKeys = new Set(entries.map((entry) => entry._ledgerKey).filter(Boolean));
const unmatchedLedgerRecords = ledgerRecords
  .filter((record) => record._key && !matchedLedgerKeys.has(record._key) && !record.placeholder)
  .map(({ _key, ...record }) => ({
    ...record,
    reconciliationStatus: "ledger_record_not_matched_to_local_file"
  }));

for (const entry of entries) delete entry._ledgerKey;

const inventory = {
  schemaVersion: "local-source-inventory.v0.2",
  groupId: "lg",
  generatedAt: new Date().toISOString(),
  sourceRoot: relative(rootDir, inputDir).normalize("NFC"),
  inputExists: existsSync(inputDir),
  identifierManifestPath: relative(rootDir, identifierManifestPath).normalize("NFC"),
  sourceIntakeTemplatePath: relative(rootDir, intakeTemplatePath).normalize("NFC"),
  documentUrlListPaths: ledgerPaths.map((path) => relative(rootDir, path).normalize("NFC")),
  status: entries.length > 0 ? "inventory-created" : "awaiting-source-package",
  outputPolicy:
    "This manifest inventories LG local source candidates and reconciles them with document-level URLs where available. It does not grant redistribution rights.",
  promotionPolicy:
    "No source is runtime knowledge until an atomic source-backed claim is promoted with companyId, companyScope, evidence locator, and rights-safe source metadata.",
  lgAdapterNotes: intakeTemplate.downloadAdapterNotes ?? [],
  totals: {
    entries: entries.length,
    localFiles: entries.length,
    localPdfFiles: entries.filter((entry) => entry.extension === "pdf").length,
    validLocalPdfFiles: entries.filter((entry) => entry.extension === "pdf" && entry.isPdf).length,
    invalidLocalPdfFiles: entries.filter((entry) => entry.extension === "pdf" && !entry.isPdf).length,
    nonPdfFiles: entries.filter((entry) => entry.extension !== "pdf").length,
    bytes: entries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
    byCompany: countBy(entries, (entry) => entry.koreanName ?? "unknown"),
    byDecision: countBy(entries, (entry) => entry.processingDecision),
    byDocumentType: countBy(entries, (entry) => entry.documentType),
    byDocumentUrlStatus: countBy(entries, (entry) => entry.documentUrlStatus),
    byIntakeReadiness: countBy(entries, (entry) => entry.intakeReadiness),
    byRightsLevel: countBy(entries, (entry) => entry.rightsLevel ?? "missing"),
    duplicateChecksumGroups: [...byChecksum.values()].filter((group) => group.length > 1).length,
    ledgerRecords: ledgerRecords.filter((record) => !record.placeholder).length,
    unmatchedLedgerRecords: unmatchedLedgerRecords.length
  },
  urlReconciliation: {
    policy:
      "Document-level URLs or official source-page routes are recorded for review. Runtime promotion still requires a source-backed claim and evidence locator.",
    unmatchedLedgerRecords
  },
  entries
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

console.log(`LG local source inventory written: ${relative(rootDir, outputPath)}`);
console.log(
  `${inventory.totals.entries} entries, ${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles} valid PDFs, ` +
    `${inventory.totals.nonPdfFiles} non-PDF file(s), ${inventory.totals.ledgerRecords} ledger record(s), ` +
    `${inventory.totals.unmatchedLedgerRecords} unmatched ledger record(s).`
);
if (!existsSync(inputDir)) console.log(`Input folder not found yet: ${relative(rootDir, inputDir)}`);
if (ledgerPaths.length === 0) console.log(`Document URL ledger not found yet under: ${relative(rootDir, inputDir)}`);

function allTemplateCompanies() {
  return [
    ...(intakeTemplate.firstSliceCompanies ?? []),
    ...(intakeTemplate.optionalSecondWaveCompanies ?? [])
  ];
}

function buildHeadingMap() {
  const map = new Map();
  for (const company of allTemplateCompanies()) {
    map.set(company.koreanName, company);
    map.set(company.displayName, company);
    if (company.koreanName === "LG") map.set("(주)LG", company);
  }
  map.set("LG Energy Solution", allTemplateCompanies().find((company) => company.companyId === "lg-energy-solution"));
  map.set("LG H&H", allTemplateCompanies().find((company) => company.companyId === "lg-hnh"));
  map.set("LG Display", allTemplateCompanies().find((company) => company.companyId === "lg-display"));
  map.set("LG Innotek", allTemplateCompanies().find((company) => company.companyId === "lg-innotek"));
  map.set("LG U+", allTemplateCompanies().find((company) => company.companyId === "lg-uplus"));
  map.set("LG CNS", allTemplateCompanies().find((company) => company.companyId === "lg-cns"));
  return map;
}

async function discoverLedgerPaths(dir) {
  if (!existsSync(dir)) return [];
  const files = await collectFiles(dir);
  return files
    .filter((path) => {
      const name = basename(path).normalize("NFC").toLowerCase();
      return extname(path).toLowerCase() === ".md" &&
        (name === "document_urls.md" || name.startsWith("document_urls_") || name.includes("문서 단위 url 목록"));
    })
    .sort(localeCompare);
}

async function readLedgerRecords(ledgerPath) {
  const text = await readFile(ledgerPath, "utf8");
  const lines = text.split(/\r?\n/u);
  let currentCompany = null;
  let currentSourcePageUrl = null;
  let headers = null;
  const records = [];

  for (const line of lines) {
    const heading = line.match(/^##\s+\d+\.\s+(.+)$/u);
    if (heading) {
      currentCompany = inferCompanyFromHeading(heading[1]);
      currentSourcePageUrl = null;
      headers = null;
      continue;
    }

    const irPage = line.match(/\*\*IR 페이지:\*\*\s*(https?:\/\/\S+)/u);
    if (irPage) {
      currentSourcePageUrl = irPage[1].trim();
      continue;
    }

    if (!line.trim().startsWith("|")) {
      if (headers && line.trim() === "") headers = null;
      continue;
    }

    const cells = splitMarkdownRow(line);
    if (cells.length < 3) continue;
    if (cells.every((cell) => /^:?-{2,}:?$/u.test(cell.trim()))) continue;
    if (cells.includes("파일명")) {
      headers = cells;
      continue;
    }
    if (!headers || !currentCompany) continue;

    const row = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const fileName = cleanCell(row["파일명"]);
    if (!fileName || fileName.includes("추가 분기 자료 포함")) {
      records.push({
        ledgerPath: relative(rootDir, ledgerPath).normalize("NFC"),
        company: currentCompany.koreanName,
        companyId: currentCompany.companyId,
        title: fileName,
        placeholder: true
      });
      continue;
    }
    const publicDocumentUrl = cleanUrl(row["원본 URL"]) || urlFromFileId(currentCompany.companyId, cleanCell(row.fileId));
    const record = {
      ledgerPath: relative(rootDir, ledgerPath).normalize("NFC"),
      company: currentCompany.koreanName,
      companyId: currentCompany.companyId,
      localFile: fileName,
      title: stripExtension(fileName),
      sourcePageUrl: currentSourcePageUrl,
      publicDocumentUrl,
      dartReceiptUrl: null,
      date: cleanCell(row["날짜"]),
      documentType: normalizeDocumentType(row["유형"]),
      requestPackage: requestPackageFor(normalizeDocumentType(row["유형"])),
      selectionReason: cleanCell(row["선정 이유"]),
      rightsLevel: publicDocumentUrl ? "public-official-download-metadata-citable" : "public-official-source-page-metadata-citable",
      note: cleanCell(row.fileId) ? `download fileId: ${cleanCell(row.fileId)}` : null
    };
    record._key = ledgerKey(record.companyId, record.localFile, record.publicDocumentUrl, record.date);
    records.push(record);
  }

  return records;
}

function inferCompanyFromHeading(text) {
  for (const [label, company] of companyByHeading.entries()) {
    if (company && text.includes(label)) return company;
  }
  return null;
}

function splitMarkdownRow(line) {
  return line
    .trim()
    .replace(/^\|/u, "")
    .replace(/\|$/u, "")
    .split("|")
    .map((cell) => cleanCell(cell));
}

function dedupeLedgerRecords(records) {
  const byKey = new Map();
  for (const record of records) {
    const key = record._key ?? [
      record.companyId,
      normalizeKey(record.localFile),
      normalizeKey(record.publicDocumentUrl),
      normalizeKey(record.date),
      normalizeKey(record.title)
    ].join("::");
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        ...record,
        ledgerPaths: [record.ledgerPath].filter(Boolean)
      });
      continue;
    }
    existing.ledgerPaths = [...new Set([...(existing.ledgerPaths ?? []), record.ledgerPath].filter(Boolean))];
    existing.ledgerPath = existing.ledgerPaths.join(", ");
  }
  return [...byKey.values()];
}

function indexLedgerRecords(records) {
  const byCompanyAndStem = new Map();
  const byCompanyAndUrl = new Map();
  for (const record of records) {
    if (record.placeholder) continue;
    const stemKey = `${record.companyId}::${normalizeFilename(record.localFile)}`;
    byCompanyAndStem.set(stemKey, record);
    const noYearStemKey = `${record.companyId}::${normalizeFilenameNoYear(record.localFile)}`;
    if (!byCompanyAndStem.has(noYearStemKey)) byCompanyAndStem.set(noYearStemKey, record);
    if (record.publicDocumentUrl) byCompanyAndUrl.set(`${record.companyId}::${normalizeKey(record.publicDocumentUrl)}`, record);
  }
  return { byCompanyAndStem, byCompanyAndUrl };
}

function matchLedgerRecord({ companyId, filename }) {
  if (!companyId) return null;
  const stemKey = `${companyId}::${normalizeFilename(filename)}`;
  const match = ledgerIndex.byCompanyAndStem.get(stemKey) ??
    ledgerIndex.byCompanyAndStem.get(`${companyId}::${normalizeFilenameNoYear(filename)}`);
  if (match) {
    match._key = match._key ?? ledgerKey(match.companyId, match.localFile, match.publicDocumentUrl, match.date);
  }
  return match ?? null;
}

async function collectFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const paths = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) paths.push(...await collectFiles(fullPath));
    else if (entry.isFile()) paths.push(fullPath);
  }
  return paths;
}

async function hashFile(path) {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolveHash(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function isPdfFile(path) {
  if (extname(path).toLowerCase() !== ".pdf") return false;
  const handle = await open(path, "r");
  try {
    const buffer = Buffer.alloc(5);
    await handle.read(buffer, 0, 5, 0);
    return buffer.toString("latin1") === "%PDF-";
  } finally {
    await handle.close();
  }
}

function inferCompanyFolder(pathParts) {
  const first = pathParts[0];
  return companyFolderMap.has(first) ? first : null;
}

function isControlFile(path) {
  const name = basename(path).normalize("NFC").toLowerCase();
  return extname(path).toLowerCase() === ".md" &&
    (name === "readme.md" ||
      name === "document_urls.md" ||
      name === "ir_urls_verified.md" ||
      name.includes("문서 단위 url 목록"));
}

function cleanCell(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/\s+/gu, " ")
    .replace(/^[-–—]+$/u, "")
    .trim();
}

function cleanUrl(value) {
  const text = cleanCell(value);
  if (!text || text === "—") return null;
  return text.startsWith("http") ? text : null;
}

function stripExtension(value) {
  return String(value ?? "").replace(/\.[^.]+$/u, "");
}

function normalizeFilename(value) {
  return stripExtension(cleanCell(value))
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s._-]+/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "");
}

function normalizeFilenameNoYear(value) {
  return normalizeFilename(value).replace(/^20\d{2}/u, "");
}

function normalizeKey(value) {
  return cleanCell(value).normalize("NFKC").toLowerCase();
}

function normalizeDocumentType(value) {
  const text = cleanCell(value).toLowerCase();
  if (!text) return null;
  if (text.includes("earnings")) return "earnings_release";
  if (text.includes("annual") || text.includes("사업보고서") || text.includes("영업보고서")) return "annual_report";
  if (text.includes("quarter")) return "quarterly_report";
  if (text.includes("half")) return "half_year_report";
  if (text.includes("value")) return "value_up_plan";
  if (text.includes("investor")) return "investor_presentation";
  if (text.includes("agm")) return "agm";
  return text.replace(/[^a-z0-9_]+/gu, "_");
}

function inferDocumentType({ title, extension, pathParts }) {
  const path = pathParts.join("/").toLowerCase();
  const lower = title.toLowerCase();
  if (path.includes("value_up") || lower.includes("valueup") || title.includes("기업가치")) return "value_up_plan";
  if (path.includes("annual_reports") || title.includes("사업보고서") || title.includes("영업보고서")) return "annual_report";
  if (title.includes("반기보고서")) return "half_year_report";
  if (title.includes("분기보고서")) return "quarterly_report";
  if (path.includes("investor_presentations") || lower.includes("ir_book") || title.includes("회사소개")) return "investor_presentation";
  if (lower.includes("agm") || title.includes("주주총회")) return "agm";
  if (path.includes("earnings") || lower.includes("earnings") || title.includes("실적") || title.includes("경영실적")) return "earnings_release";
  return extension === "xlsx" ? "spreadsheet_source" : "source_document";
}

function inferPeriod(title) {
  const normalized = title.normalize("NFC");
  const quarter = normalized.match(/(20\d{2})[_\s.-]*Q([1-4])/iu);
  if (quarter) return `${quarter[1]} Q${quarter[2]}`;
  const year = normalized.match(/(20\d{2})/u);
  return year ? year[1] : null;
}

function defaultSourcePageFor(companyId) {
  const pages = {
    "lg-electronics": "https://www.lge.co.kr/presentation",
    "lg-energy-solution": "https://www.lgensol.com/kr/investors/earnings-announcement",
    "lg-chem": "https://www.lgchem.com/company/investment-information/ir-events",
    "lg-hnh": "https://www.lghnh.com/ir/finance.jsp",
    "lg-display": "https://www.lgdisplay.com/kor/company/investment/ir-activity",
    "lg-innotek": "https://www.lginnotek.com/kr/ir/report",
    "lg-uplus": "https://www.lguplus.com/about/ko/investing/ir-resources/performance-data",
    "lg-cns": "https://www.lgcns.com/kr/company/ir/ir-info",
    "lg-corp": "https://www.lgcorp.com/ir/dataroom/report/irdata"
  };
  return pages[companyId] ?? null;
}

function urlFromFileId(companyId, fileId) {
  if (!fileId || fileId === "—") return null;
  if (companyId === "lg-innotek") return `https://www.lginnotek.com/download/${fileId}.do`;
  if (companyId === "lg-corp") return `https://www.lgcorp.com/ir/dataroom/report/annual/files/${fileId}`;
  return null;
}

function constructedPublicUrl({ companyId, ledgerMatch }) {
  return urlFromFileId(companyId, cleanCell(ledgerMatch?.note).replace(/^download fileId:\s*/u, ""));
}

function inferRceptNo(url) {
  const match = String(url ?? "").match(/rcpNo=(\d{14})/u);
  return match ? match[1] : null;
}

function requestPackageFor(documentType) {
  if (["annual_report", "quarterly_report", "half_year_report"].includes(documentType)) return "PKG-02";
  if (documentType === "earnings_release") return "PKG-03";
  if (documentType === "value_up_plan") return "PKG-04";
  if (documentType === "investor_presentation") return "PKG-05";
  if (documentType === "agm") return "PKG-06";
  return "PKG-03";
}

function defaultSelectionReason({ documentType, period }) {
  const periodLabel = period ? `${period} ` : "";
  if (documentType === "earnings_release") return `${periodLabel}실적과 부문별 수익성 검토를 위한 공식 IR 자료`;
  if (documentType === "annual_report") return `${periodLabel}연간 사업·재무·리스크 맥락 검토를 위한 공식 보고서`;
  if (documentType === "value_up_plan") return `${periodLabel}기업가치 제고·주주환원 정책 검토를 위한 공식 자료`;
  if (documentType === "investor_presentation") return `${periodLabel}사업 포트폴리오와 전략 방향 검토를 위한 공식 IR 자료`;
  if (documentType === "agm") return `${periodLabel}주주총회 의안·결과 확인을 위한 공식 자료`;
  return `${periodLabel}LG 공식 IR 자료`;
}

function rightsLevelFor({ publicDocumentUrl, sourcePageUrl }) {
  if (publicDocumentUrl) return "public-official-download-metadata-citable";
  if (sourcePageUrl) return "public-official-source-page-metadata-citable";
  return "local-official-file-needs-url";
}

function documentUrlStatusFor({ publicDocumentUrl, sourcePageUrl, dartReceiptUrl }) {
  if (dartReceiptUrl) return "dart_viewer_url";
  if (publicDocumentUrl) return "document_level_url";
  if (sourcePageUrl) return "source_page_only";
  return "missing_url";
}

function intakeReadinessFor({ companyId, selectionReason, publicDocumentUrl, sourcePageUrl, dartReceiptUrl }) {
  if (!companyId) return "missing_company_id";
  if (!selectionReason) return "missing_selection_reason";
  if (!publicDocumentUrl && !sourcePageUrl && !dartReceiptUrl) return "needs_document_or_source_url";
  return "ready_for_extraction_or_claim_review";
}

function processingDecision({ extension, isPdf }) {
  if (extension === "pdf") return isPdf ? "extract-to-markdown-and-wiki-candidate" : "exclude-invalid-pdf";
  if (extension === "xlsx" || extension === "xls") return "convert-or-extract-source";
  return "manual-review";
}

function redistributionPolicyFor(rightsLevel) {
  if (rightsLevel?.startsWith("public-official")) return "cite_metadata_and_short_excerpts_only";
  return "manifest_only_until_rights_are_cleared";
}

function paperUseLevel({ extension, isPdf, publicDocumentUrl, sourcePageUrl, selectionReason }) {
  if (extension !== "pdf") return "metadata_only_until_converted";
  if (!isPdf) return "exclude_invalid_pdf";
  if (!selectionReason) return "review_only_missing_selection_reason";
  if (!publicDocumentUrl && !sourcePageUrl) return "review_only_missing_public_route";
  return "eligible_for_manifest_and_review_queue";
}

function notesFor({ extension, isPdf, companyId, documentType, ledgerMatch, publicDocumentUrl, sourcePageUrl }) {
  const notes = [];
  if (!companyId) notes.push("companyId could not be inferred from folder or ledger");
  if (extension === "pdf" && !isPdf) notes.push("file extension is PDF but header is not %PDF-");
  if (extension === "xlsx") notes.push("spreadsheet source requires conversion/manual review before claim promotion");
  if (!ledgerMatch) notes.push("not matched to a document_urls ledger row; metadata inferred from folder and filename");
  if (documentType === "value_up_plan") notes.push("forward-looking value-up claims require explicit plan/progress labelling");
  if (!publicDocumentUrl && sourcePageUrl) notes.push("source-page-only route; public document URL should be added before runtime claim promotion when possible");
  return notes;
}

function duplicateCanonicalScore(entry) {
  return [
    entry.publicDocumentUrl,
    entry.sourcePageUrl,
    entry.selectionReason,
    entry.documentUrlStatus === "document_level_url",
    entry.extension === "pdf" && entry.isPdf
  ].filter(Boolean).length;
}

function ledgerKey(companyId, localFile, publicDocumentUrl, date) {
  return [companyId, normalizeFilename(localFile), normalizeKey(publicDocumentUrl), normalizeKey(date)].join("::");
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function localeCompare(a, b) {
  return a.localeCompare(b, "ko-KR");
}
