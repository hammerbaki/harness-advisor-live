import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const defaultInputDir = resolve(knowledgeBaseRoot, "hanhwa_knowledge");
const inputDir = resolve(process.env.HANWHA_KNOWLEDGE_DIR ?? defaultInputDir);
const outputPath = resolve(
  process.env.HANWHA_INVENTORY_OUT ??
    join(rootDir, "raw", "manifests", "hanwha.local-sources.json")
);

const analystBrands = [
  "NH투자증권",
  "SK증권",
  "삼성증권",
  "대신증권",
  "키움증권",
  "한화투자증권"
];

const officialIssuerHints = ["(주)한화", "㈜한화", "[한화]", "한화 "];
const companyFolderMap = {
  hanwha_aerospace: { companyId: "hanwha-aerospace", companyScope: "listed_company" },
  hanwha_solutions: { companyId: "hanwha-solutions", companyScope: "listed_company" },
  hanwha_systems: { companyId: "hanwha-systems", companyScope: "listed_company" },
  hanwha_ocean: { companyId: "hanwha-ocean", companyScope: "listed_company" }
};
const explicitLedgerPath = process.env.HANWHA_SOURCE_INDEX
  ? resolve(process.env.HANWHA_SOURCE_INDEX)
  : null;
const companyMatchers = [
  { companyId: "hanwha-solutions", companyScope: "listed_company", patterns: ["한화솔루션", "큐셀", "Qcell"] },
  { companyId: "hanwha-aerospace", companyScope: "listed_company", patterns: ["한화에어로스페이스", "한화에어로", "에어로스페이스", "K9"] },
  { companyId: "hanwha-systems", companyScope: "listed_company", patterns: ["한화시스템", "시스템"] },
  { companyId: "hanwha-ocean", companyScope: "listed_company", patterns: ["한화오션", "대우조선", "DSME"] },
  { companyId: "hanwha-life", companyScope: "listed_company", patterns: ["한화생명", "생명"] },
  { companyId: "hanwha-investment-securities", companyScope: "listed_company", patterns: ["한화투자증권", "한화증권"] },
  { companyId: "hanwha-galleria", companyScope: "listed_company", patterns: ["한화갤러리아", "갤러리아"] },
  { companyId: "hanwha-estate", companyScope: "nonlisted_company", patterns: ["한화에스테이트", "에스테이트"] },
  { companyId: "hanwha", companyScope: "issuer_company", patterns: ["(주)한화", "㈜한화", "[한화]", "한화"] }
];

async function main() {
  const ledgerPaths = explicitLedgerPath ? [explicitLedgerPath] : await discoverLedgerPaths(inputDir);
  const ledgerRecords = dedupeLedgerRecords((await Promise.all(ledgerPaths.map(readLedgerRecords))).flat());
  const ledgerByLocalPath = indexLedgerRecords(ledgerRecords);
  const files = (await collectFiles(inputDir)).filter((path) => !isControlFile(path));
  const entries = [];

  for (const absolutePath of files.sort(localeCompare)) {
    const sha256 = await hashFile(absolutePath);
    const pathParts = relative(inputDir, absolutePath).split(sep).map((part) => part.normalize("NFC"));
    const inferredCompanyIdFromPath = companyFolderMap[pathParts[0]]?.companyId ?? null;
    const localPathFromInput = relative(inputDir, absolutePath).normalize("NFC");
    const localPathFromRoot = relative(rootDir, absolutePath).normalize("NFC");
    const ledgerMatch = matchLedgerRecord({
      ledgerByLocalPath,
      localPathFromInput,
      localPathFromRoot,
      absolutePath,
      inferredCompanyId: inferredCompanyIdFromPath
    });
    const title = cleanCell(ledgerMatch?.title) || stripExtension(basename(absolutePath)).normalize("NFC");
    const category = categoryFromLedgerType(ledgerMatch?.documentType, title) ?? inferCategory(pathParts);
    const folderYear = inferFolderYear(pathParts);
    const role = inferSourceRole(title, category);
    const documentDate = cleanCell(ledgerMatch?.date) || inferDocumentDate(title);
    const extension = extname(absolutePath).replace(".", "").toLowerCase();
    const company = companyScopeForLedgerOrPath({ ledgerMatch, title, pathParts, role, category });
    const requestPackage = cleanCell(ledgerMatch?.requestPackage) || requestPackageFor(category, role);
    const selectionReason = cleanCell(ledgerMatch?.selectionReason) || defaultSelectionReason({ category, role, folderYear, documentDate });
    const sizeBytes = await fileSize(absolutePath);
    const isPdf = extension === "pdf" ? await hasPdfHeader(absolutePath) : false;
    const sourcePageUrl = cleanUrl(ledgerMatch?.sourcePageUrl);
    const publicDocumentUrl = cleanUrl(ledgerMatch?.publicDocumentUrl);
    const dartReceiptUrl = cleanUrl(ledgerMatch?.dartReceiptUrl);
    const rightsLevel = cleanCell(ledgerMatch?.rightsLevel) || (role === "third_party_analyst" ? "licensed-third-party-metadata-only" : "public-official");

    entries.push({
      id: `hanwha-local-${sha256.slice(0, 12)}`,
      groupId: "hanwha",
      companyId: company.companyId,
      companyScope: company.companyScope,
      title,
      filename: basename(absolutePath).normalize("NFC"),
      localPath: localPathFromRoot,
      ledgerLocalFile: cleanCell(ledgerMatch?.localFile) || null,
      extension: extension || "none",
      isPdf,
      sizeBytes,
      sha256,
      folderYear,
      documentDate,
      sourceCategory: category,
      sourceRole: role,
      inferredSourceRole: role,
      sourceReliability: role === "official_issuer" ? "primary" : role === "third_party_analyst" ? "secondary" : "unknown",
      sourcePageUrl,
      publicDocumentUrl,
      dartReceiptUrl,
      requestPackage,
      selectionReason,
      rightsLevel,
      documentUrlStatus: documentUrlStatusFor({ sourcePageUrl, publicDocumentUrl, dartReceiptUrl }),
      intakeReadiness: intakeReadinessFor({
        companyId: company.companyId,
        requestPackage,
        selectionReason,
        rightsLevel,
        sourcePageUrl,
        publicDocumentUrl,
        dartReceiptUrl
      }),
      redistributionPolicy: redistributionPolicyFor(rightsLevel, role),
      processingDecision: processingDecision(role, category, extension),
      needsPublicUrl: !sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl,
      paperUseLevel: paperUseLevel(role),
      notes: notesFor({
        role,
        category,
        extension,
        documentDate,
        pathParts,
        ledgerMatch,
        sourcePageUrl,
        publicDocumentUrl,
        dartReceiptUrl,
        requestPackage,
        selectionReason,
        rightsLevel
      })
    });
  }

  const byChecksum = groupBy(entries, (entry) => entry.sha256);
  for (const duplicates of byChecksum.values()) {
    if (duplicates.length <= 1) continue;
    duplicates.sort((a, b) => localeCompare(a.localPath, b.localPath));
    const canonical = duplicates[0].id;
    for (const duplicate of duplicates.slice(1)) {
      const duplicatePathToken = sha256Text(duplicate.localPath).slice(0, 6);
      duplicate.id = `${canonical}-dup-${duplicatePathToken}`;
      duplicate.duplicateOf = canonical;
      duplicate.notes.push(`content duplicate of ${canonical}; retained as a separate local source path`);
    }
  }

  const matchedLedgerKeys = new Set(entries.map((entry) => entry.ledgerLocalFile ? normalizePathKey(entry.ledgerLocalFile) : null).filter(Boolean));
  const unmatchedLedgerRecords = ledgerRecords
    .filter((record) => record.localFile && !matchedLedgerKeys.has(normalizePathKey(record.localFile)))
    .map((record) => ({
      ...record,
      reconciliationStatus: "ledger_record_not_matched_to_local_file"
    }));

  const inventory = {
    schemaVersion: "local-source-inventory.v0.2",
    groupId: "hanwha",
    generatedAt: new Date().toISOString(),
    sourceRoot: relative(rootDir, inputDir).normalize("NFC"),
    sourceIntakeTemplatePath: "raw/manifests/hanwha.source-intake-template.json",
    documentUrlListPaths: ledgerPaths.map((path) => relative(rootDir, path).normalize("NFC")),
    outputPolicy:
      "This file inventories local source candidates only. Do not treat it as permission to redistribute source documents.",
    promotionPolicy:
      "No source is runtime knowledge until an atomic source-backed claim is promoted with companyId, companyScope, evidence locator, and rights-safe source metadata. Exact document URLs are preferred; official source-page provenance is acceptable for dynamic issuer downloads when title, period, checksum, extraction hash, and evidence locator are recorded.",
    totals: {
      files: entries.length,
      entries: entries.length,
      bytes: entries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
      byCompany: countBy(entries, (entry) => entry.companyId),
      byCategory: countBy(entries, (entry) => entry.sourceCategory),
      byRole: countBy(entries, (entry) => entry.inferredSourceRole),
      byDecision: countBy(entries, (entry) => entry.processingDecision),
      byDocumentUrlStatus: countBy(entries, (entry) => entry.documentUrlStatus ?? "unknown"),
      byIntakeReadiness: countBy(entries, (entry) => entry.intakeReadiness ?? "unknown"),
      byRightsLevel: countBy(entries, (entry) => entry.rightsLevel ?? "missing"),
      ledgerRecords: ledgerRecords.length,
      unmatchedLedgerRecords: unmatchedLedgerRecords.length,
      duplicateChecksumGroups: [...byChecksum.values()].filter((group) => group.length > 1).length
    },
    urlReconciliation: {
      policy:
        "Public source provenance is required for claim-promotion eligibility. Document-level URLs and DART viewer URLs are preferred. Source-page-only records are acceptable when the issuer uses dynamic downloads and the exact local document is fixed by title, period, checksum, extraction hash, and evidence locator.",
      unmatchedLedgerRecords
    },
    entries
  };

  await mkdir(resolve(outputPath, ".."), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`);
  console.log(`Hanwha local source inventory written: ${relative(rootDir, outputPath)}`);
  console.log(
    `${inventory.totals.files} files, ${formatBytes(inventory.totals.bytes)}, ` +
      `${inventory.totals.ledgerRecords} ledger record(s), ${inventory.totals.unmatchedLedgerRecords} unmatched ledger record(s), ` +
      `${inventory.totals.duplicateChecksumGroups} duplicate checksum group(s)`
  );
}

async function collectFiles(dir) {
  const output = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await collectFiles(absolutePath));
    if (entry.isFile()) output.push(absolutePath);
  }
  return output;
}

async function discoverLedgerPaths(dir) {
  if (!existsSync(dir)) return [];
  const files = await collectFiles(dir);
  return files
    .filter((path) => {
      const name = basename(path).normalize("NFC").toLowerCase();
      return extname(path).toLowerCase() === ".md" &&
        (name === "source_index.md" ||
          name.startsWith("source_index_") ||
          name === "document_urls.md" ||
          name.startsWith("document_urls_") ||
          name.includes("문서 단위 url 목록"));
    })
    .sort(localeCompare);
}

async function readLedgerRecords(path) {
  if (!existsSync(path)) return [];
  const markdown = await readFile(path, "utf8");
  const records = [];
  let headers = null;
  for (const rawLine of markdown.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) continue;
    const cells = parseTableCells(line);
    if (cells.length < 2) continue;
    const normalizedCells = cells.map(normalizeHeader);
    if (normalizedCells.includes("localFile") || normalizedCells.includes("sourcePageUrl") || normalizedCells.includes("dartReceiptUrl")) {
      headers = normalizedCells;
      continue;
    }
    if (cells.every((cell) => /^:?-{3,}:?$/u.test(cell))) continue;
    if (!headers || cells.length !== headers.length) continue;
    const record = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = cleanCell(cells[index]);
    });
    if (!record.title && !record.localFile && !record.publicDocumentUrl && !record.dartReceiptUrl) continue;
    records.push({
      company: record.company ?? null,
      companyId: normalizeKnownCompanyId(record.companyId) ?? inferCompanyIdFromCompanyName(record.company),
      localFile: record.localFile ?? null,
      sourcePageUrl: cleanUrl(record.sourcePageUrl),
      publicDocumentUrl: cleanUrl(record.publicDocumentUrl),
      dartReceiptUrl: cleanUrl(record.dartReceiptUrl),
      title: record.title ?? null,
      date: record.date ?? record.dateOrPeriod ?? null,
      documentType: record.documentType ?? null,
      requestPackage: record.requestPackage ?? null,
      selectionReason: record.selectionReason ?? null,
      rightsLevel: record.rightsLevel ?? null,
      note: record.note ?? null,
      ledgerPath: relative(rootDir, path).normalize("NFC")
    });
  }
  return records;
}

function dedupeLedgerRecords(records) {
  const byKey = new Map();
  for (const record of records) {
    const key = [
      record.companyId,
      normalizePathKey(record.localFile),
      normalizePathKey(record.publicDocumentUrl),
      normalizePathKey(record.dartReceiptUrl),
      cleanCell(record.title),
      cleanCell(record.date)
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
  const exact = new Map();
  const basenameBuckets = new Map();
  for (const record of records) {
    if (!record.localFile) continue;
    const exactKey = normalizePathKey(record.localFile);
    if (exactKey) exact.set(exactKey, record);

    const basenameKey = normalizePathKey(basename(record.localFile));
    if (basenameKey) {
      const bucket = basenameBuckets.get(basenameKey) ?? [];
      bucket.push(record);
      basenameBuckets.set(basenameKey, bucket);
    }
  }

  const uniqueBasename = new Map();
  for (const [key, bucket] of basenameBuckets.entries()) {
    if (bucket.length === 1) uniqueBasename.set(key, bucket[0]);
  }
  return { exact, uniqueBasename };
}

function matchLedgerRecord({ ledgerByLocalPath, localPathFromInput, localPathFromRoot, absolutePath, inferredCompanyId }) {
  const keys = [
    normalizePathKey(localPathFromInput),
    normalizePathKey(localPathFromRoot)
  ];
  for (const key of keys) {
    if (ledgerByLocalPath.exact.has(key)) return ledgerByLocalPath.exact.get(key);
  }

  const basenameKey = normalizePathKey(basename(absolutePath));
  if (basenameKey && ledgerByLocalPath.uniqueBasename.has(basenameKey)) {
    const basenameMatch = ledgerByLocalPath.uniqueBasename.get(basenameKey);
    if (!inferredCompanyId || basenameMatch.companyId === inferredCompanyId) return basenameMatch;
  }
  return null;
}

function parseTableCells(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function normalizeHeader(value) {
  const key = String(value ?? "")
    .normalize("NFKC")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/[`*_]/gu, "")
    .replace(/\s+/gu, "")
    .replace(/[-/]/gu, "_")
    .toLowerCase();
  const map = {
    company: "company",
    회사: "company",
    companyid: "companyId",
    company_id: "companyId",
    localfile: "localFile",
    local_file: "localFile",
    sourcepageurl: "sourcePageUrl",
    source_page_url: "sourcePageUrl",
    directdocumenturl: "publicDocumentUrl",
    direct_document_url: "publicDocumentUrl",
    publicdocumenturl: "publicDocumentUrl",
    public_document_url: "publicDocumentUrl",
    dartreceipturl: "dartReceiptUrl",
    dart_receipt_url: "dartReceiptUrl",
    title: "title",
    제목: "title",
    date: "date",
    날짜: "date",
    기간: "date",
    dateorperiod: "dateOrPeriod",
    date_or_period: "dateOrPeriod",
    documenttype: "documentType",
    document_type: "documentType",
    requestpackage: "requestPackage",
    request_package: "requestPackage",
    selectionreason: "selectionReason",
    selection_reason: "selectionReason",
    rightslevel: "rightsLevel",
    rights_level: "rightsLevel",
    note: "note"
  };
  return map[key] ?? null;
}

function isControlFile(path) {
  const name = basename(path).normalize("NFC").toLowerCase();
  return name === "readme.md" ||
    name === ".ds_store" ||
    name === "source_index.md" ||
    name.startsWith("source_index_") ||
    name === "document_urls.md" ||
    name.startsWith("document_urls_") ||
    name.includes("문서 단위 url 목록");
}

async function hashFile(path) {
  const hash = createHash("sha256");
  await new Promise((resolvePromise, reject) => {
    const stream = createReadStream(path);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", resolvePromise);
  });
  return hash.digest("hex");
}

function sha256Text(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function fileSize(path) {
  const { stat } = await import("node:fs/promises");
  return (await stat(path)).size;
}

async function hasPdfHeader(path) {
  return await new Promise((resolvePromise, reject) => {
    const stream = createReadStream(path, { start: 0, end: 4 });
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => {
      resolvePromise(Buffer.concat(chunks).toString("utf8") === "%PDF-");
    });
  });
}

function inferCategory(pathParts) {
  if (pathParts.includes("annual_reports")) return "annual_report";
  if (pathParts.includes("audit_reports")) return "audit_report";
  if (pathParts.includes("quarterly_reports")) return "quarterly_report";
  if (pathParts.includes("earnings")) return "earnings_material";
  if (pathParts.includes("investor_presentations")) return "investor_presentation";
  if (pathParts.includes("value_up")) return "value_up";
  if (pathParts.includes("capital_actions")) return "capital_action";
  if (pathParts.includes("governance")) return "governance";
  if (pathParts.includes("sustainability")) return "sustainability";
  if (pathParts.includes("Periodic_Reports")) return "periodic_report";
  if (pathParts.includes("IR_Materials")) return "ir_material";
  if (pathParts.includes("Governance")) return "governance";
  return "unknown";
}

function inferFolderYear(pathParts) {
  const year = pathParts.find((part) => /^\d{4}$/u.test(part));
  return year ? Number(year) : null;
}

function inferSourceRole(title, category) {
  if (analystBrands.some((brand) => title.includes(brand))) return "third_party_analyst";
  if ([
    "periodic_report",
    "governance",
    "annual_report",
    "audit_report",
    "quarterly_report",
    "earnings_material",
    "investor_presentation",
    "value_up",
    "capital_action",
    "sustainability"
  ].includes(category)) return "official_issuer";
  if (officialIssuerHints.some((hint) => title.includes(hint))) return "official_issuer";
  return "unknown";
}

function inferCompanyScope(title, pathParts, role, category) {
  const folderCompany = companyFolderMap[pathParts[0]];
  if (folderCompany) return folderCompany;
  const targetTitle =
    role === "third_party_analyst"
      ? analystBrands.reduce((text, brand) => text.replace(brand, ""), title)
      : title;
  const scopedPathParts = role === "third_party_analyst" ? pathParts.slice(0, -1) : pathParts;
  const haystack = [targetTitle, ...scopedPathParts].join(" ").normalize("NFC");
  for (const matcher of companyMatchers) {
    if (matcher.patterns.some((pattern) => haystack.includes(pattern))) {
      return { companyId: matcher.companyId, companyScope: matcher.companyScope };
    }
  }
  if (role === "third_party_analyst") {
    return { companyId: "hanwha", companyScope: "research_support" };
  }
  if (role === "official_issuer" || category === "governance" || category === "periodic_report") {
    return { companyId: "hanwha", companyScope: "issuer_company" };
  }
  return { companyId: "hanwha", companyScope: "group_reference" };
}

function companyScopeForLedgerOrPath({ ledgerMatch, title, pathParts, role, category }) {
  const folderCompany = companyFolderMap[pathParts[0]];
  const ledgerCompanyId = ledgerMatch?.companyId;
  if (folderCompany && (!ledgerCompanyId || ledgerCompanyId === "hanwha")) return folderCompany;
  if (ledgerCompanyId) return { companyId: ledgerCompanyId, companyScope: companyScopeFor(ledgerCompanyId) };
  return inferCompanyScope(title, pathParts, role, category);
}

function requestPackageFor(category, role) {
  if (["annual_report", "audit_report", "quarterly_report", "periodic_report"].includes(category)) return "PKG-02";
  if (["earnings_material", "investor_presentation", "ir_material"].includes(category)) return "PKG-03";
  if (["value_up", "capital_action"].includes(category)) return "PKG-04";
  if (category === "governance") return "PKG-05";
  if (role === "third_party_analyst") return "PKG-06";
  return "UNCLASSIFIED";
}

function defaultSelectionReason({ category, role, folderYear, documentDate }) {
  const basis = documentDate ?? folderYear ?? null;
  const suffix = basis ? ` (${basis} 기준)` : "";
  if (["annual_report", "periodic_report"].includes(category)) return `연간 사업 현황과 공식 재무성과를 확인하기 위한 보고서${suffix}`;
  if (["audit_report", "quarterly_report"].includes(category)) return `기간별 재무제표 신뢰성과 회계 기준을 확인하기 위한 보고서${suffix}`;
  if (category === "earnings_material") return `분기 실적과 사업별 변화를 확인하기 위한 공식 실적 자료${suffix}`;
  if (category === "investor_presentation") return `사업 전략과 수주·파이프라인 내러티브를 확인하기 위한 공식 IR 자료${suffix}`;
  if (category === "value_up") return `기업가치 제고와 주주환원 방향을 확인하기 위한 공식 자료${suffix}`;
  if (category === "capital_action") return `증자·배당·분할 등 자본배분 이벤트를 확인하기 위한 공식 자료${suffix}`;
  if (category === "governance") return `지배구조와 공시 통제 기준을 확인하기 위한 공식 자료${suffix}`;
  if (role === "third_party_analyst") return `증권사 해석 차이를 비교하기 위한 검토용 2차 자료${suffix}`;
  return `한화 계열사별 근거 패키지 보강을 위한 자료${suffix}`;
}

function inferDocumentDate(title) {
  const compact = title.match(/(20\d{2})(\d{2})(\d{2})/u);
  if (compact) return `${compact[1]}-${compact[2]}-${compact[3]}`;
  const dotted = title.match(/(20\d{2})[.](\d{2})[.](\d{2})/u);
  if (dotted) return `${dotted[1]}-${dotted[2]}-${dotted[3]}`;
  return null;
}

function processingDecision(role, category, extension) {
  if (extension !== "pdf") return "manual-type-check-before-extraction";
  if (role === "official_issuer") return "extract-to-markdown-and-wiki-candidate";
  if (role === "third_party_analyst") return "metadata-and-short-notes-only";
  if (category === "ir_material") return "manual-source-review";
  return "hold-until-classified";
}

function paperUseLevel(role) {
  if (role === "official_issuer") return "usable-after-source-provenance-verification";
  if (role === "third_party_analyst") return "licensed-review-only";
  return "do-not-use-until-classified";
}

function notesFor({
  role,
  category,
  extension,
  documentDate,
  pathParts,
  ledgerMatch,
  sourcePageUrl,
  publicDocumentUrl,
  dartReceiptUrl,
  requestPackage,
  selectionReason,
  rightsLevel
}) {
  const notes = [];
  if (pathParts.includes("Unknown_Year")) notes.push("source year is folder-unknown; infer from document metadata or source URL");
  if (!documentDate) notes.push("document date not inferred from filename");
  if (extension !== "pdf") notes.push("file has no PDF extension; verify media type before extraction");
  if (role === "third_party_analyst") notes.push("analyst report content may be licensed; avoid redistributing full text");
  if (category === "periodic_report") notes.push("prefer DART receipt number and public filing URL as canonical source key");
  if (!ledgerMatch) notes.push("source provenance ledger row not matched; exact document URL is preferred but official IR page plus checksum is acceptable");
  if (sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) notes.push("source-page-only provenance accepted; preserve title, period, checksum, extraction hash, and evidence locator");
  if (!sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) notes.push("source provenance still needed before claim promotion");
  if (!requestPackage) notes.push("request package missing");
  if (!selectionReason) notes.push("selection reason missing");
  if (!rightsLevel) notes.push("rights level missing");
  return notes;
}

function categoryFromLedgerType(documentType, title) {
  const normalized = cleanCell(documentType).replace(/\s+/gu, "_").toLowerCase();
  if (!normalized) return null;
  const aliases = {
    annual_report: "annual_report",
    business_report: "annual_report",
    audit_report: "audit_report",
    quarterly_report: "quarterly_report",
    semiannual_report: "quarterly_report",
    earnings_release: "earnings_material",
    earnings_presentation: "earnings_material",
    presentation: /기업가치|value.?up|주주환원/iu.test(title) ? "value_up" : "investor_presentation",
    investor_presentation: "investor_presentation",
    value_up: "value_up",
    value_up_plan: "value_up",
    capital_action: "capital_action",
    analyst_report: "ir_material",
    governance_document: "governance",
    governance: "governance"
  };
  return aliases[normalized] ?? null;
}

function companyScopeFor(companyId) {
  if (companyId === "hanwha") return "issuer_company";
  if (companyId === "hanwha-estate") return "nonlisted_company";
  return "listed_company";
}

function documentUrlStatusFor({ sourcePageUrl, publicDocumentUrl, dartReceiptUrl }) {
  if (publicDocumentUrl) return "public_document_url_supplied";
  if (dartReceiptUrl) return "dart_receipt_url_supplied";
  if (sourcePageUrl) return "source_page_url_supplied";
  return "missing_source_provenance";
}

function intakeReadinessFor({ companyId, requestPackage, selectionReason, rightsLevel, sourcePageUrl, publicDocumentUrl, dartReceiptUrl }) {
  if (!companyId) return "blocked_missing_company_id";
  if (!requestPackage) return "blocked_missing_request_package";
  if (!selectionReason) return "blocked_missing_selection_reason";
  if (!rightsLevel) return "blocked_missing_rights_level";
  if (!sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) return "blocked_missing_source_provenance";
  if (rightsLevel === "licensed-third-party-metadata-only") return "metadata_only_not_runtime_claim";
  if (publicDocumentUrl || dartReceiptUrl) return "ready_for_extraction_or_claim_review";
  return "ready_for_extraction_or_claim_review_source_page";
}

function redistributionPolicyFor(rightsLevel, role) {
  if (rightsLevel === "licensed-third-party-metadata-only" || role === "third_party_analyst") {
    return "metadata-only; do not redistribute full text or promote as official issuer claim";
  }
  if (rightsLevel === "public-official") return "manifest-and-short-excerpt-only; cite official source page or public document URL";
  return "manifest-only until rights are reviewed";
}

function cleanUrl(value) {
  const clean = cleanCell(value);
  if (!/^https?:\/\//iu.test(clean)) return null;
  return clean.replace(/[).,\]]+$/u, "");
}

function cleanCell(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/\\\|/gu, "|")
    .trim();
}

function normalizePathKey(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/^\.?\//u, "")
    .replaceAll("\\", "/")
    .toLowerCase();
}

function normalizeKnownCompanyId(value) {
  const id = cleanCell(value);
  return [
    "hanwha",
    "hanwha-aerospace",
    "hanwha-solutions",
    "hanwha-systems",
    "hanwha-ocean",
    "hanwha-life",
    "hanwha-investment-securities",
    "hanwha-galleria",
    "hanwha-estate"
  ].includes(id) ? id : null;
}

function inferCompanyIdFromCompanyName(value) {
  const name = cleanCell(value);
  if (/에어로스페이스|aerospace/iu.test(name)) return "hanwha-aerospace";
  if (/솔루션|solutions/iu.test(name)) return "hanwha-solutions";
  if (/시스템|systems/iu.test(name)) return "hanwha-systems";
  if (/오션|ocean/iu.test(name)) return "hanwha-ocean";
  if (/생명|life/iu.test(name)) return "hanwha-life";
  if (/투자증권/iu.test(name)) return "hanwha-investment-securities";
  if (/갤러리아/iu.test(name)) return "hanwha-galleria";
  if (/에스테이트/iu.test(name)) return "hanwha-estate";
  if (/한화|hanwha/iu.test(name)) return "hanwha";
  return null;
}

function stripExtension(name) {
  const extension = extname(name);
  return extension ? name.slice(0, -extension.length) : name;
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function countBy(items, keyFn) {
  return Object.fromEntries(
    [...groupBy(items, keyFn).entries()]
      .map(([key, value]) => [key, value.length])
      .sort(([a], [b]) => localeCompare(String(a), String(b)))
  );
}

function localeCompare(a, b) {
  return a.localeCompare(b, "ko-KR");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
