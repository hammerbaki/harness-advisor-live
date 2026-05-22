import { createHash } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const defaultInputDir = resolve(knowledgeBaseRoot, "hyundai_knowledge");
const inputDir = resolve(process.env.HYUNDAI_KNOWLEDGE_DIR ?? defaultInputDir);
const outputPath = resolve(
  process.env.HYUNDAI_INVENTORY_OUT ??
    join(rootDir, "raw", "manifests", "hyundai-motor.local-sources.json")
);
const identifierManifestPath = resolve(
  process.env.HYUNDAI_IDENTIFIER_MANIFEST ??
    join(rootDir, "raw", "manifests", "hyundai-motor.identifier-verification.json")
);
const intakeTemplatePath = resolve(
  process.env.HYUNDAI_SOURCE_INTAKE_TEMPLATE ??
    join(rootDir, "raw", "manifests", "hyundai-motor.source-intake-template.json")
);
const explicitLedgerPath = process.env.HYUNDAI_DOCUMENT_URL_LIST
  ? resolve(process.env.HYUNDAI_DOCUMENT_URL_LIST)
  : null;

const identifierManifest = JSON.parse(await readFile(identifierManifestPath, "utf8"));
const intakeTemplate = JSON.parse(await readFile(intakeTemplatePath, "utf8"));
const recordsByCompany = new Map((identifierManifest.records ?? []).map((record) => [record.companyId, record]));
const companyFolderMap = buildCompanyFolderMap(intakeTemplate);
const ledgerPaths = explicitLedgerPath ? [explicitLedgerPath] : await discoverLedgerPaths(inputDir);
const ledgerRecords = dedupeLedgerRecords((await Promise.all(ledgerPaths.map(readLedgerRecords))).flat());
const ledgerByLocalPath = indexLedgerRecords(ledgerRecords);

const files = existsSync(inputDir)
  ? (await collectFiles(inputDir)).filter((path) => !basename(path).startsWith(".") && !isControlFile(path))
  : [];

const entries = [];
for (const absolutePath of files.sort(localeCompare)) {
  const pathParts = relative(inputDir, absolutePath).split(sep).map((part) => part.normalize("NFC"));
  const extension = extname(absolutePath).replace(".", "").toLowerCase();
  const sizeBytes = (await stat(absolutePath)).size;
  const sha256 = await hashFile(absolutePath);
  const bytesHead = await readHead(absolutePath, 8);
  const isPdf = bytesHead.toString("latin1", 0, 5) === "%PDF-";
  const companyFolder = inferCompanyFolder(pathParts);
  const inferredCompanyId = companyFolder ? companyFolderMap.get(companyFolder) ?? null : null;
  const localPathFromRoot = relative(rootDir, absolutePath).normalize("NFC");
  const localPathFromInput = relative(inputDir, absolutePath).normalize("NFC");
  const ledgerMatch = matchLedgerRecord({ localPathFromInput, localPathFromRoot, absolutePath, inferredCompanyId });
  const companyId = ledgerMatch?.companyId ?? inferredCompanyId;
  const identifier = companyId ? recordsByCompany.get(companyId) : null;
  const title = cleanCell(ledgerMatch?.title) || stripExtension(basename(absolutePath)).normalize("NFC");
  const documentType = normalizeDocumentType(ledgerMatch?.documentType) || inferDocumentType({ title, extension, pathParts });
  const period = cleanCell(ledgerMatch?.date) || inferPeriod(title);
  const sourceRole = inferSourceRole(documentType, extension, companyId);
  const sourcePageUrl = cleanUrl(ledgerMatch?.sourcePageUrl);
  const publicDocumentUrl = cleanUrl(ledgerMatch?.publicDocumentUrl);
  const dartReceiptUrl = cleanUrl(ledgerMatch?.dartReceiptUrl);
  const rceptNo = inferRceptNo(dartReceiptUrl) ?? inferRceptNo(publicDocumentUrl) ?? inferRceptNo(ledgerMatch?.note);
  const rightsLevel = cleanCell(ledgerMatch?.rightsLevel) || "missing";
  const requestPackage = cleanCell(ledgerMatch?.requestPackage) || null;
  const selectionReason = cleanCell(ledgerMatch?.selectionReason) || null;

  entries.push({
    id: `hyundai-local-${sha256.slice(0, 12)}`,
    groupId: "hyundai-motor",
    companyId,
    companyFolder,
    koreanName: identifier?.koreanName ?? cleanCell(ledgerMatch?.company) ?? companyFolder,
    title,
    filename: basename(absolutePath).normalize("NFC"),
    localPath: localPathFromRoot,
    ledgerLocalFile: cleanCell(ledgerMatch?.localFile) || null,
    extension: extension || "none",
    sizeBytes,
    sha256,
    isPdf,
    documentType,
    period,
    sourceRole,
    sourceReliability: sourceRole.startsWith("official") ? "primary" : "supporting",
    sourcePageUrl,
    publicDocumentUrl,
    dartReceiptUrl,
    rceptNo,
    requestPackage,
    selectionReason,
    rightsLevel,
    documentUrlStatus: documentUrlStatusFor({ sourcePageUrl, publicDocumentUrl, dartReceiptUrl }),
    intakeReadiness: intakeReadinessFor({
      companyId,
      requestPackage,
      selectionReason,
      rightsLevel,
      sourcePageUrl,
      publicDocumentUrl,
      dartReceiptUrl
    }),
    processingDecision: processingDecision({ extension, isPdf, sourceRole, documentType }),
    redistributionPolicy: redistributionPolicyFor(rightsLevel),
    paperUseLevel: paperUseLevelFor({
      companyId,
      extension,
      isPdf,
      sourceRole,
      publicDocumentUrl,
      dartReceiptUrl,
      rightsLevel,
      selectionReason
    }),
    notes: notesFor({
      extension,
      isPdf,
      companyId,
      documentType,
      period,
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

const byChecksum = groupBy(entries.filter((entry) => entry.sha256), (entry) => entry.sha256);
for (const duplicates of byChecksum.values()) {
  if (duplicates.length <= 1) continue;
  const canonicalEntry = duplicates
    .map((entry, index) => ({ entry, index, score: duplicateCanonicalScore(entry) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].entry;
  const canonical = canonicalEntry.id;
  let duplicateIndex = 1;
  duplicates.forEach((duplicate) => {
    if (duplicate === canonicalEntry) return;
    duplicate.duplicateOf = canonical;
    duplicate.id = `${duplicate.id}-dup${duplicateIndex}`;
    duplicateIndex += 1;
    if (!duplicate.ledgerLocalFile) {
      duplicate.processingDecision = "duplicate-reference-only";
      duplicate.intakeReadiness = "duplicate_reference_only";
      duplicate.paperUseLevel = "manifest_only_duplicate";
      duplicate.notes = [
        ...(duplicate.notes ?? []),
        `duplicate of ${canonical}; not eligible for extraction or claim promotion`
      ];
    }
  });
}

function duplicateCanonicalScore(entry) {
  return [
    entry.ledgerLocalFile,
    entry.publicDocumentUrl || entry.dartReceiptUrl,
    entry.sourcePageUrl,
    entry.requestPackage,
    entry.selectionReason,
    entry.rightsLevel && entry.rightsLevel !== "missing"
  ].filter(Boolean).length;
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
  groupId: "hyundai-motor",
  generatedAt: new Date().toISOString(),
  sourceRoot: relative(rootDir, inputDir).normalize("NFC"),
  inputExists: existsSync(inputDir),
  identifierManifestPath: relative(rootDir, identifierManifestPath).normalize("NFC"),
  sourceIntakeTemplatePath: relative(rootDir, intakeTemplatePath).normalize("NFC"),
  documentUrlListPaths: ledgerPaths.map((path) => relative(rootDir, path).normalize("NFC")),
  status: entries.length > 0 ? "inventory-created" : "awaiting-source-package",
  outputPolicy:
    "This manifest inventories Hyundai Motor Group local source candidates and reconciles them with public source provenance. It does not grant redistribution rights.",
  promotionPolicy:
    "No source is runtime knowledge until an atomic source-backed claim is promoted with companyId, companyScope, evidence locator, and rights-safe source metadata. Exact document URLs are preferred; official source-page provenance is acceptable when dynamic issuer downloads are identified by title, period, checksum, and extraction hash.",
  totals: {
    entries: entries.length,
    localFiles: entries.length,
    localPdfFiles: entries.filter((entry) => entry.extension === "pdf").length,
    validLocalPdfFiles: entries.filter((entry) => entry.extension === "pdf" && entry.isPdf).length,
    invalidLocalPdfFiles: entries.filter((entry) => entry.extension === "pdf" && !entry.isPdf).length,
    bytes: entries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
    byCompany: countBy(entries, (entry) => entry.koreanName ?? "unknown"),
    byDecision: countBy(entries, (entry) => entry.processingDecision),
    byDocumentType: countBy(entries, (entry) => entry.documentType),
    byDocumentUrlStatus: countBy(entries, (entry) => entry.documentUrlStatus),
    byIntakeReadiness: countBy(entries, (entry) => entry.intakeReadiness),
    byRightsLevel: countBy(entries, (entry) => entry.rightsLevel ?? "missing"),
    duplicateChecksumGroups: [...byChecksum.values()].filter((group) => group.length > 1).length,
    ledgerRecords: ledgerRecords.length,
    unmatchedLedgerRecords: unmatchedLedgerRecords.length
  },
  urlReconciliation: {
    policy:
      "Public source provenance is required for claim-promotion eligibility. Document-level URLs and DART viewer URLs are preferred. Source-page-only records are acceptable when the issuer uses dynamic downloads and the exact local document is fixed by title, period, checksum, extraction hash, and evidence locator.",
    unmatchedLedgerRecords
  },
  entries
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

console.log(`Hyundai Motor local source inventory written: ${relative(rootDir, outputPath)}`);
console.log(
  `${inventory.totals.entries} entries, ${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles} valid PDFs, ` +
    `${inventory.totals.ledgerRecords} ledger record(s), ${inventory.totals.unmatchedLedgerRecords} unmatched ledger record(s).`
);
if (!existsSync(inputDir)) console.log(`Input folder not found yet: ${relative(rootDir, inputDir)}`);
if (ledgerPaths.length === 0) console.log(`Document URL ledger not found yet under: ${relative(rootDir, inputDir)}`);

async function discoverLedgerPaths(dir) {
  if (!existsSync(dir)) return [];
  const files = await collectFiles(dir);
  return files
    .filter((path) => {
      const name = basename(path).normalize("NFC").toLowerCase();
      return extname(path).toLowerCase() === ".md" &&
        (name === "document_urls.md" ||
          name === "source_index.md" ||
          name.startsWith("source_index_") ||
          name.startsWith("document_urls_") ||
          name.includes("문서 단위 url 목록"));
    })
    .sort(localeCompare);
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

async function readLedgerRecords(path) {
  if (!existsSync(path)) return [];
  const markdown = await readFile(path, "utf8");
  const records = [];
  let headers = null;
  let currentCompanyId = null;
  let currentCompanyName = null;

  for (const rawLine of markdown.split(/\r?\n/u)) {
    const line = rawLine.trim();
    const headingCompany = inferCompanyFromHeading(line);
    if (headingCompany) {
      currentCompanyId = headingCompany.companyId;
      currentCompanyName = headingCompany.company;
    }
    if (!line.startsWith("|")) continue;
    const cells = parseTableCells(line);
    if (cells.length < 2) continue;
    const normalizedCells = cells.map(normalizeHeader);
    if (normalizedCells.includes("localFile") || normalizedCells.includes("sourcePageUrl") || normalizedCells.includes("dartReceiptUrl")) {
      headers = normalizedCells;
      continue;
    }
    if (cells.every((cell) => /^:?-{3,}:?$/u.test(cell))) continue;
    if (!headers) continue;
    if (cells.length !== headers.length) continue;
    const record = {};
    headers.forEach((header, index) => {
      if (!header) return;
      record[header] = cleanCell(cells[index]);
    });
    if (!record.title && !record.localFile && !record.publicDocumentUrl && !record.dartReceiptUrl) continue;
    const documentType = normalizeDocumentType(record.documentType);
    records.push({
      company: record.company ?? currentCompanyName ?? null,
      companyId: normalizeCompanyId(record.companyId) ?? inferCompanyIdFromCompanyName(record.company) ?? currentCompanyId,
      localFile: record.localFile ?? null,
      sourcePageUrl: cleanUrl(record.sourcePageUrl),
      publicDocumentUrl: cleanUrl(record.publicDocumentUrl),
      dartReceiptUrl: cleanUrl(record.dartReceiptUrl),
      title: record.title ?? null,
      date: record.date ?? null,
      documentType: documentType ?? record.documentType ?? null,
      requestPackage: record.requestPackage ?? inferRequestPackage(documentType),
      selectionReason: record.selectionReason ?? null,
      rightsLevel: record.rightsLevel ?? inferRightsLevel({
        sourcePageUrl: record.sourcePageUrl,
        publicDocumentUrl: record.publicDocumentUrl,
        dartReceiptUrl: record.dartReceiptUrl
      }),
      note: record.note ?? null,
      ledgerPath: relative(rootDir, path).normalize("NFC")
    });
  }

  return records;
}

function parseTableCells(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function inferCompanyFromHeading(line) {
  if (/^#{1,3}\s*\d*[-.\s]*.*현대모비스/iu.test(line)) return { companyId: "hyundai-mobis", company: "현대모비스" };
  if (/^#{1,3}\s*\d*[-.\s]*.*기아|^#{1,3}\s*\d*[-.\s]*.*KIA/iu.test(line)) return { companyId: "kia", company: "기아" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대글로비스|^#{1,3}\s*\d*[-.\s]*.*Glovis/iu.test(line)) return { companyId: "hyundai-glovis", company: "현대글로비스" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대로템|^#{1,3}\s*\d*[-.\s]*.*Rotem/iu.test(line)) return { companyId: "hyundai-rotem", company: "현대로템" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대오토에버|^#{1,3}\s*\d*[-.\s]*.*AutoEver/iu.test(line)) return { companyId: "hyundai-autoever", company: "현대오토에버" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대위아|^#{1,3}\s*\d*[-.\s]*.*Wia/iu.test(line)) return { companyId: "hyundai-wia", company: "현대위아" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대건설|^#{1,3}\s*\d*[-.\s]*.*Engineering.*Construction|^#{1,3}\s*\d*[-.\s]*.*HDEC/iu.test(line)) return { companyId: "hyundai-eandc", company: "현대건설" };
  if (/^#{1,3}\s*\d*[-.\s]*.*이노션|^#{1,3}\s*\d*[-.\s]*.*Innocean/iu.test(line)) return { companyId: "innocean", company: "이노션" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대차증권|^#{1,3}\s*\d*[-.\s]*.*Motor Securities|^#{1,3}\s*\d*[-.\s]*.*HMSEC/iu.test(line)) return { companyId: "hyundai-motor-securities", company: "현대차증권" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대비앤지스틸|^#{1,3}\s*\d*[-.\s]*.*BNG/iu.test(line)) return { companyId: "hyundai-bng-steel", company: "현대비앤지스틸" };
  if (/^#{1,3}\s*\d*[-.\s]*.*현대자동차|^#{1,3}\s*\d*[-.\s]*.*Hyundai Motor Company/iu.test(line)) {
    return { companyId: "hyundai-motor", company: "현대자동차" };
  }
  return null;
}

function normalizeHeader(value) {
  const key = value
    .normalize("NFKC")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/[`*_]/gu, "")
    .replace(/\s+/gu, "")
    .replace(/[-/]/gu, "_")
    .toLowerCase();

  const map = {
    company: "company",
    회사: "company",
    계열사: "company",
    companyid: "companyId",
    company_id: "companyId",
    localfile: "localFile",
    local_file: "localFile",
    파일: "localFile",
    로컬파일: "localFile",
    sourcepageurl: "sourcePageUrl",
    source_page_url: "sourcePageUrl",
    원본페이지url: "sourcePageUrl",
    출처페이지url: "sourcePageUrl",
    출처페이지: "sourcePageUrl",
    directdocumenturl: "publicDocumentUrl",
    direct_document_url: "publicDocumentUrl",
    publicdocumenturl: "publicDocumentUrl",
    public_document_url: "publicDocumentUrl",
    문서url: "publicDocumentUrl",
    다운로드url: "publicDocumentUrl",
    dartreceipturl: "dartReceiptUrl",
    dart_receipt_url: "dartReceiptUrl",
    darturl: "dartReceiptUrl",
    dart: "dartReceiptUrl",
    접수url: "dartReceiptUrl",
    title: "title",
    제목: "title",
    date: "date",
    날짜: "date",
    기간: "date",
    documenttype: "documentType",
    document_type: "documentType",
    문서유형: "documentType",
    requestpackage: "requestPackage",
    request_package: "requestPackage",
    요청패키지: "requestPackage",
    selectionreason: "selectionReason",
    selection_reason: "selectionReason",
    선정이유: "selectionReason",
    수집근거: "selectionReason",
    rightslevel: "rightsLevel",
    rights_level: "rightsLevel",
    권리라벨: "rightsLevel",
    권리: "rightsLevel",
    note: "note",
    비고: "note",
    메모: "note"
  };

  return map[key] ?? null;
}

function buildCompanyFolderMap(template) {
  const map = new Map();
  for (const company of [...(template.firstSliceCompanies ?? []), ...(template.optionalSecondWaveCompanies ?? [])]) {
    for (const folder of [company.folderName, ...(company.folderAliases ?? [])].filter(Boolean)) {
      map.set(folder, company.companyId);
      map.set(folder?.split("/").at(-1), company.companyId);
    }
    map.set(company.companyId, company.companyId);
    if (company.koreanName) map.set(company.koreanName, company.companyId);
  }
  map.set("현대자동차", "hyundai-motor");
  map.set("현대차", "hyundai-motor");
  map.set("기아", "kia");
  map.set("현대모비스", "hyundai-mobis");
  map.set("현대글로비스", "hyundai-glovis");
  map.set("현대로템", "hyundai-rotem");
  map.set("현대오토에버", "hyundai-autoever");
  map.set("현대위아", "hyundai-wia");
  map.set("현대건설", "hyundai-eandc");
  map.set("hyundai_construction", "hyundai-eandc");
  map.set("hyundai_securities", "hyundai-motor-securities");
  map.set("이노션", "innocean");
  map.set("현대차증권", "hyundai-motor-securities");
  map.set("현대비앤지스틸", "hyundai-bng-steel");
  map.set("현대제철", "hyundai-steel");
  return map;
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

function matchLedgerRecord({ localPathFromInput, localPathFromRoot, absolutePath, inferredCompanyId }) {
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

function normalizePathKey(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/^\.?\//u, "")
    .replaceAll("\\", "/")
    .toLowerCase();
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

async function readHead(path, length) {
  const handle = await import("node:fs/promises").then((fs) => fs.open(path, "r"));
  try {
    const buffer = Buffer.alloc(length);
    await handle.read(buffer, 0, length, 0);
    return buffer;
  } finally {
    await handle.close();
  }
}

function isControlFile(path) {
  const name = basename(path).normalize("NFC").toLowerCase();
  return name === "readme.md" ||
    name === ".ds_store" ||
    name === "additional_companies.md" ||
    name === "source_index.md" ||
    name.startsWith("source_index_") ||
    name === "document_urls.md" ||
    name.startsWith("document_urls_") ||
    name.includes("문서 단위 url 목록");
}

function inferCompanyFolder(pathParts) {
  for (const part of pathParts) {
    if (companyFolderMap.has(part)) return part;
  }
  return null;
}

function inferCompanyIdFromCompanyName(value) {
  const name = cleanCell(value);
  if (!name) return null;
  if (/현대차증권|motor\s*securities|hmsec/iu.test(name)) return "hyundai-motor-securities";
  if (/비앤지|bng/iu.test(name)) return "hyundai-bng-steel";
  if (/오토에버|autoever/iu.test(name)) return "hyundai-autoever";
  if (/현대로템|rotem/iu.test(name)) return "hyundai-rotem";
  if (/현대위아|\bwia\b/iu.test(name)) return "hyundai-wia";
  if (/현대건설|hdec|engineering.*construction|construction/iu.test(name)) return "hyundai-eandc";
  if (/이노션|innocean/iu.test(name)) return "innocean";
  if (/글로비스/u.test(name)) return "hyundai-glovis";
  if (/제철/u.test(name)) return "hyundai-steel";
  if (/모비스/u.test(name)) return "hyundai-mobis";
  if (/기아|kia/iu.test(name)) return "kia";
  if (/현대차|현대자동차|hyundai/iu.test(name)) return "hyundai-motor";
  return null;
}

function normalizeCompanyId(value) {
  const clean = cleanCell(value);
  return recordsByCompany.has(clean) ? clean : null;
}

function normalizeDocumentType(value) {
  const clean = cleanCell(value);
  if (!clean) return null;
  const normalized = clean.replace(/\s+/gu, "_").toLowerCase();
  const aliases = {
    annual_report: "business_report",
    audit_report: "business_report",
    business_report: "business_report",
    quarterly_report: "quarterly_report",
    semiannual_report: "semiannual_report",
    half_year_report: "semiannual_report",
    earnings_release: "earnings_presentation",
    earnings_presentation: "earnings_presentation",
    guidance: "strategy_presentation",
    investor_presentation: "investor_presentation",
    value_up: "value_up_plan",
    value_up_plan: "value_up_plan"
  };
  if (aliases[normalized]) return aliases[normalized];
  const allowed = new Set([
    "business_report",
    "quarterly_report",
    "semiannual_report",
    "earnings_presentation",
    "investor_presentation",
    "value_up_plan",
    "shareholder_return",
    "governance_document",
    "sustainability_report",
    "strategy_presentation",
    "press_release",
    "research_note"
  ]);
  if (allowed.has(normalized)) return normalized;
  return null;
}

function inferRequestPackage(documentType) {
  if (["business_report", "quarterly_report", "semiannual_report"].includes(documentType)) return "PKG-02";
  if (["earnings_presentation", "investor_presentation", "strategy_presentation"].includes(documentType)) return "PKG-03";
  if (["value_up_plan", "shareholder_return"].includes(documentType)) return "PKG-04";
  if (["governance_document"].includes(documentType)) return "PKG-05";
  return null;
}

function inferRightsLevel({ sourcePageUrl, publicDocumentUrl, dartReceiptUrl }) {
  const joined = `${sourcePageUrl ?? ""} ${publicDocumentUrl ?? ""} ${dartReceiptUrl ?? ""}`;
  if (/hyundai\.com|worldwide\.kia\.com|mobis\.com|hyundai[-.]?rotem|hyundai[-.]?autoever|hyundai[-.]?wia|hdec\.kr|glovis|innocean|hmsec|bngsteel|dart\.fss\.or\.kr/iu.test(joined)) return "public-official";
  return null;
}

function inferDocumentType({ title, extension, pathParts }) {
  const pathText = pathParts.join(" ").normalize("NFC");
  if (extension === "md") return "research_note";
  if (/value[-_\s]?up|기업가치[\s_]?제고|주주환원|배당|자사주|capital[_\s-]?allocation/iu.test(title)) return "value_up_plan";
  if (/사업보고서|annual|business[_\s-]?report/iu.test(pathText) || /사업보고서|annual|business[_\s-]?report/iu.test(title)) return "business_report";
  if (/반기|semiannual/iu.test(title)) return "semiannual_report";
  if (/분기|quarterly|[1-4]q|earnings/iu.test(title) && /보고서|report/iu.test(title)) return "quarterly_report";
  if (/실적|earnings|presentation|ir[_\s-]?deck/iu.test(pathText) || /실적|earnings|presentation|investor/iu.test(title)) return "earnings_presentation";
  if (/investor[_\s-]?day|ceo[_\s-]?investor|strategy|전략|ev|hybrid|mobility/iu.test(title)) return "strategy_presentation";
  if (/governance|지배구조|정관|이사회|주주총회/iu.test(title)) return "governance_document";
  if (/sustainability|esg|지속가능/iu.test(title)) return "sustainability_report";
  if (/press|보도자료/iu.test(title)) return "press_release";
  return "unknown";
}

function inferPeriod(title) {
  const cleanedTitle = title.replace(/^\d{4}-\d{2}-\d{2}/u, "");
  const koreanQuarter = cleanedTitle.match(/(20\d{2})년?[_\s.-]?([1-4])분기/u);
  if (koreanQuarter) return `${koreanQuarter[1]}Q${koreanQuarter[2]}`;
  const yearQuarter = cleanedTitle.match(/(20\d{2})[_\s.-]?([1-4])Q/iu) ?? cleanedTitle.match(/([1-4])Q[_\s.-]?(20\d{2})/iu);
  if (yearQuarter) {
    const year = yearQuarter[1].startsWith("20") ? yearQuarter[1] : yearQuarter[2];
    const quarter = yearQuarter[1].startsWith("20") ? yearQuarter[2] : yearQuarter[1];
    return `${year}Q${quarter}`;
  }
  const yearMonth = cleanedTitle.match(/(20\d{2})[.](0[369]|12)/u);
  if (yearMonth) return `${yearMonth[1]}.${yearMonth[2]}`;
  const year = cleanedTitle.match(/(20\d{2})/u);
  return year ? year[1] : null;
}

function inferSourceRole(documentType, extension, companyId) {
  if (extension === "md") return "research_support";
  if (!companyId) return "supporting";
  if ([
    "business_report",
    "quarterly_report",
    "semiannual_report",
    "earnings_presentation",
    "investor_presentation",
    "value_up_plan",
    "shareholder_return",
    "governance_document",
    "sustainability_report",
    "strategy_presentation",
    "press_release"
  ].includes(documentType)) {
    return "official_issuer";
  }
  return "supporting";
}

function processingDecision({ extension, isPdf, sourceRole, documentType }) {
  if (extension === "pdf" && !isPdf) return "exclude-invalid-pdf";
  if (extension === "pdf" && sourceRole === "official_issuer") return "extract-to-markdown-and-wiki-candidate";
  if (["ppt", "pptx", "html", "htm"].includes(extension) && sourceRole === "official_issuer") return "convert-or-extract-source";
  if (extension === "md") return "manifest-support-note";
  if (documentType === "unknown") return "manual-source-review";
  return "hold-until-classified";
}

function documentUrlStatusFor({ sourcePageUrl, publicDocumentUrl, dartReceiptUrl }) {
  if (publicDocumentUrl) return "document_url_supplied";
  if (dartReceiptUrl) return "dart_viewer_url_supplied";
  if (sourcePageUrl) return "source_page_url_supplied";
  return "missing_source_provenance";
}

function intakeReadinessFor({ companyId, requestPackage, selectionReason, rightsLevel, sourcePageUrl, publicDocumentUrl, dartReceiptUrl }) {
  if (!companyId) return "blocked_unknown_company";
  if (!requestPackage) return "blocked_missing_request_package";
  if (!selectionReason) return "blocked_missing_selection_reason";
  if (!rightsLevel || rightsLevel === "missing") return "blocked_missing_rights_level";
  if (/restricted|do-not-ingest/iu.test(rightsLevel)) return "blocked_restricted_rights";
  if (!sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) return "blocked_missing_source_provenance";
  if (!publicDocumentUrl && !dartReceiptUrl) return "ready_for_extraction_or_claim_review_source_page";
  return "ready_for_extraction_or_claim_review";
}

function paperUseLevelFor({ companyId, extension, isPdf, sourceRole, publicDocumentUrl, dartReceiptUrl, rightsLevel, selectionReason }) {
  if (!companyId) return "do-not-use-until-company-routed";
  if (extension === "pdf" && !isPdf) return "do-not-use-invalid-file";
  if (/restricted|do-not-ingest/iu.test(rightsLevel ?? "")) return "do-not-use-restricted";
  if (!selectionReason) return "review-only-until-selection-reason-added";
  if (sourceRole === "official_issuer" && (publicDocumentUrl || dartReceiptUrl)) return "usable-after-extraction-and-claim-review";
  if (sourceRole === "official_issuer") return "usable-after-extraction-and-claim-review-with-source-page-provenance";
  return "supporting-metadata-only";
}

function redistributionPolicyFor(rightsLevel) {
  if (rightsLevel === "public-official") return "manifest and public URL may be cited; extracted full text remains local unless rights are verified";
  if (/licensed/iu.test(rightsLevel ?? "")) return "metadata-only unless license permits model use and redistribution";
  if (/restricted/iu.test(rightsLevel ?? "")) return "restricted-do-not-ingest";
  return "manifest-only until rights level is confirmed";
}

function notesFor({ extension, isPdf, companyId, documentType, period, ledgerMatch, sourcePageUrl, publicDocumentUrl, dartReceiptUrl, requestPackage, selectionReason, rightsLevel }) {
  const notes = [];
  if (!ledgerMatch) notes.push("no matching document_urls.md ledger row");
  if (extension === "pdf" && !isPdf) notes.push("file extension is .pdf but file signature is not PDF");
  if (!companyId) notes.push("not stored under a recognized Hyundai Motor Group company folder and no valid companyId ledger value");
  if (documentType === "unknown") notes.push("document type not inferred from filename or ledger");
  if (!period && extension === "pdf") notes.push("period not inferred from filename or ledger");
  if (!sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) notes.push("needs source page, document URL, or DART receipt URL before claim promotion");
  if (sourcePageUrl && !publicDocumentUrl && !dartReceiptUrl) notes.push("source-page-only provenance accepted; preserve title, period, checksum, extraction hash, and evidence locator");
  if (!requestPackage) notes.push("missing request_package from source request protocol");
  if (!selectionReason) notes.push("missing one-line selection_reason");
  if (!rightsLevel || rightsLevel === "missing") notes.push("missing rights_level");
  return notes;
}

function inferRceptNo(value) {
  return (String(value ?? "").match(/\b(20\d{12,14})\b/u) ?? [null, null])[1];
}

function cleanCell(value) {
  const clean = String(value ?? "")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/`/gu, "")
    .trim();
  return clean || null;
}

function cleanUrl(value) {
  const match = String(value ?? "").match(/https?:\/\/[^\s|)]+/u);
  return match ? match[0] : null;
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
