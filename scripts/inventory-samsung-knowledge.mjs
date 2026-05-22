import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const defaultInputDir = resolve(knowledgeBaseRoot, "samsung_knowledge");
const inputDir = resolve(process.env.SAMSUNG_KNOWLEDGE_DIR ?? defaultInputDir);
const outputPath = resolve(
  process.env.SAMSUNG_INVENTORY_OUT ??
    join(rootDir, "raw", "manifests", "samsung.local-sources.json")
);
const identifierManifestPath = resolve(
  process.env.SAMSUNG_IDENTIFIER_MANIFEST ??
    join(rootDir, "raw", "manifests", "samsung.identifier-verification.json")
);
const urlListPath = resolve(
  process.env.SAMSUNG_DOCUMENT_URL_LIST ??
    join(inputDir, "삼성그룹 6개사 IR 자료 문서 단위 URL 목록.md")
);

const companyFolderMap = {
  "삼성전자": "samsung-electronics",
  "삼성SDI": "samsung-sdi",
  "삼성물산": "samsung-ct",
  "삼성바이오로직스": "samsung-biologics",
  "삼성전기": "samsung-electro-mechanics",
  "삼성생명": "samsung-life",
  "삼성화재": "samsung-fire-marine"
};

const dartViewerFilings = [
  {
    companyId: "samsung-life",
    koreanName: "삼성생명",
    reportName: "사업보고서 (2025.12)",
    period: "2025.12",
    receiptDate: "2026-03-11",
    rceptNo: "20260311004614"
  },
  {
    companyId: "samsung-life",
    koreanName: "삼성생명",
    reportName: "분기보고서 (2025.09)",
    period: "2025.09",
    receiptDate: "2025-11-14",
    rceptNo: "20251114002091"
  },
  {
    companyId: "samsung-life",
    koreanName: "삼성생명",
    reportName: "반기보고서 (2025.06)",
    period: "2025.06",
    receiptDate: "2025-08-13",
    rceptNo: "20250813000585"
  },
  {
    companyId: "samsung-life",
    koreanName: "삼성생명",
    reportName: "분기보고서 (2025.03)",
    period: "2025.03",
    receiptDate: "2025-05-15",
    rceptNo: "20250515002067"
  },
  {
    companyId: "samsung-life",
    koreanName: "삼성생명",
    reportName: "사업보고서 (2024.12)",
    period: "2024.12",
    receiptDate: "2025-03-12",
    rceptNo: "20250312001063"
  },
  {
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    reportName: "사업보고서 (2025.12)",
    period: "2025.12",
    receiptDate: "2026-03-12",
    rceptNo: "20260312001399"
  },
  {
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    reportName: "분기보고서 (2025.09)",
    period: "2025.09",
    receiptDate: "2025-11-14",
    rceptNo: "20251114002900"
  },
  {
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    reportName: "반기보고서 (2025.06)",
    period: "2025.06",
    receiptDate: "2025-08-14",
    rceptNo: "20250814004098"
  },
  {
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    reportName: "분기보고서 (2025.03)",
    period: "2025.03",
    receiptDate: "2025-05-15",
    rceptNo: "20250515002709"
  },
  {
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    reportName: "사업보고서 (2024.12)",
    period: "2024.12",
    receiptDate: "2025-03-11",
    rceptNo: "20250311001055"
  }
];

const identifierManifest = JSON.parse(await readFile(identifierManifestPath, "utf8"));
const identifierByCompany = new Map(identifierManifest.records.map((record) => [record.companyId, record]));
const urlRecords = await readUrlRecords(urlListPath);
const urlRecordsByCompany = groupBy(urlRecords, (record) => record.companyId ?? "unknown");

const files = (await collectFiles(inputDir)).filter((path) => !basename(path).startsWith(".") && !isControlFile(path));
const localEntries = [];

for (const absolutePath of files.sort(localeCompare)) {
  const pathParts = relative(inputDir, absolutePath).split(sep).map((part) => part.normalize("NFC"));
  const extension = extname(absolutePath).replace(".", "").toLowerCase();
  const sizeBytes = (await stat(absolutePath)).size;
  const sha256 = await hashFile(absolutePath);
  const bytesHead = await readHead(absolutePath, 5);
  const isPdf = bytesHead.toString("latin1") === "%PDF-";
  const companyFolder = pathParts.length > 1 ? pathParts[0] : null;
  const companyId = companyFolder ? companyFolderMap[companyFolder] ?? null : null;
  const title = stripExtension(basename(absolutePath)).normalize("NFC");
  const documentType = inferDocumentType(title, extension);
  const period = inferPeriod(title);
  const sourceRole = inferSourceRole(documentType, extension, companyId);
  const identifier = companyId ? identifierByCompany.get(companyId) : null;
  const urlMatch = companyId && extension === "pdf" ? matchUrlRecord({ title, period, documentType, companyId }) : null;
  const requestPackage = requestPackageFor(documentType);
  const selectionReason = urlMatch?.selectionReason ?? defaultSelectionReason({ documentType, period });

  localEntries.push({
    id: `samsung-local-${sha256.slice(0, 12)}`,
    groupId: "samsung",
    companyId,
    companyFolder,
    koreanName: identifier?.koreanName ?? companyFolder,
    title,
    filename: basename(absolutePath).normalize("NFC"),
    localPath: relative(rootDir, absolutePath).normalize("NFC"),
    extension: extension || "none",
    sizeBytes,
    sha256,
    isPdf,
    documentType,
    period,
    sourceRole,
    sourceReliability: sourceRole === "official_issuer" ? "primary" : "supporting",
    sourcePageUrl: urlMatch?.sourcePageUrl ?? identifier?.irUrl ?? null,
    publicDocumentUrl: urlMatch?.documentUrl ?? null,
    documentUrlStatus: documentUrlStatusFor({ extension, companyId, urlMatch }),
    urlMatchScore: urlMatch?.score ?? null,
    urlMatchTitle: urlMatch?.title ?? null,
    requestPackage,
    selectionReason,
    rceptNo: null,
    processingDecision: processingDecision({ extension, isPdf, sourceRole, documentType }),
    needsDocumentUrl: extension === "pdf" && !urlMatch,
    redistributionPolicy: "manifest-only until public source URL and redistribution rights are verified",
    paperUseLevel: paperUseLevel({ extension, isPdf, sourceRole, urlMatch }),
    notes: notesFor({ extension, isPdf, companyId, documentType, period, urlMatch })
  });
}

const dartEntries = dartViewerFilings.map((filing) => {
  const identifier = identifierByCompany.get(filing.companyId);
  return {
    id: `samsung-dart-${filing.rceptNo}`,
    groupId: "samsung",
    companyId: filing.companyId,
    companyFolder: filing.koreanName,
    koreanName: filing.koreanName,
    title: `${filing.koreanName} ${filing.reportName}`,
    filename: null,
    localPath: null,
    extension: "dart-viewer",
    sizeBytes: 0,
    sha256: null,
    isPdf: null,
    documentType: inferDocumentType(filing.reportName, "dart-viewer"),
    period: filing.period,
    sourceRole: "official_dart_filing",
    sourceReliability: "primary",
    sourcePageUrl: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${filing.rceptNo}`,
    rceptNo: filing.rceptNo,
    receiptDate: filing.receiptDate,
    dartCode: identifier?.dartCode ?? null,
    processingDecision: "extract-via-dart-document-pipeline",
    needsDocumentUrl: false,
    redistributionPolicy: "DART public viewer URL; downloaded document text remains local review material until redistribution policy is checked",
    paperUseLevel: "usable-after-extraction",
    notes: ["DART viewer URL is the canonical public source for this filing."]
  };
});

const entries = [...localEntries, ...dartEntries];
const byChecksum = groupBy(localEntries.filter((entry) => entry.sha256), (entry) => entry.sha256);
for (const duplicates of byChecksum.values()) {
  if (duplicates.length <= 1) continue;
  const canonical = duplicates[0].id;
  for (const duplicate of duplicates.slice(1)) duplicate.duplicateOf = canonical;
}

const inventory = {
  schemaVersion: "local-source-inventory.v0.2",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  sourceRoot: relative(rootDir, inputDir).normalize("NFC"),
  identifierManifestPath: relative(rootDir, identifierManifestPath).normalize("NFC"),
  outputPolicy:
    "This file inventories local Samsung source candidates and DART viewer filings. It does not grant redistribution rights.",
  documentUrlListPath: relative(rootDir, urlListPath).normalize("NFC"),
  totals: {
    entries: entries.length,
    localFiles: localEntries.length,
    localPdfFiles: localEntries.filter((entry) => entry.extension === "pdf").length,
    validLocalPdfFiles: localEntries.filter((entry) => entry.extension === "pdf" && entry.isPdf).length,
    invalidLocalPdfFiles: localEntries.filter((entry) => entry.extension === "pdf" && !entry.isPdf).length,
    dartViewerFilings: dartEntries.length,
    bytes: localEntries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
    byCompany: countBy(entries, (entry) => entry.koreanName ?? "unknown"),
    byDecision: countBy(entries, (entry) => entry.processingDecision),
    byDocumentType: countBy(entries, (entry) => entry.documentType),
    byDocumentUrlStatus: countBy(entries, (entry) => entry.documentUrlStatus ?? "not_required"),
    urlListRecords: urlRecords.length,
    duplicateChecksumGroups: [...byChecksum.values()].filter((group) => group.length > 1).length
  },
  entries
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

console.log(`Samsung local source inventory written: ${relative(rootDir, outputPath)}`);
console.log(
  `${inventory.totals.entries} entries: ${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles} valid local PDFs, ` +
    `${inventory.totals.dartViewerFilings} DART viewer filing(s), ${formatBytes(inventory.totals.bytes)} local bytes.`
);
if (inventory.totals.invalidLocalPdfFiles > 0) {
  console.log(`${inventory.totals.invalidLocalPdfFiles} invalid PDF extension file(s) will be excluded from extraction.`);
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

function isControlFile(path) {
  const name = basename(path).normalize("NFC").toLowerCase();
  return name === "readme.md" ||
    name === ".ds_store" ||
    name === "document_urls.md" ||
    name.startsWith("document_urls_") ||
    name.includes("문서 단위 url 목록");
}

async function readUrlRecords(path) {
  let markdown = "";
  try {
    markdown = await readFile(path, "utf8");
  } catch {
    return [];
  }

  const records = [];
  let companyId = null;
  let sourcePageUrl = null;
  for (const rawLine of markdown.split(/\r?\n/u)) {
    const line = rawLine.trim();
    const heading = line.match(/^##\s+\d+\.\s+(.+)$/u);
    if (heading) {
      companyId = companyIdFromHeading(heading[1]);
      sourcePageUrl = identifierByCompany.get(companyId)?.irUrl ?? null;
      continue;
    }

    const sourcePage = line.match(/\*\*(?:출처 페이지|실적발표 페이지|IR 자료실 메인 페이지|IR Materials 메인 페이지|IR 메인 페이지):\*\*\s+(https?:\/\/\S+)/u);
    if (sourcePage) {
      sourcePageUrl = sourcePage[1];
      continue;
    }

    if (!line.startsWith("|") || /---/u.test(line)) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 2 || /^파일명$/u.test(cells[0]) || !companyId) continue;

    const urlCell = cells.find((cell) => /https?:\/\//u.test(cell));
    if (!urlCell) continue;
    const url = (urlCell.match(/https?:\/\/[^\s|)]+/u) ?? [null])[0];
    if (!url) continue;

    records.push({
      companyId,
      title: cells[0].replace(/\s+\*\(.+?\)\*/u, "").trim(),
      sourcePageUrl,
      documentUrl: url,
      selectionReason: cells.at(-1) && !/https?:\/\//u.test(cells.at(-1)) ? cells.at(-1) : null,
      urlSource: relative(rootDir, path).normalize("NFC")
    });
  }
  return records;
}

function companyIdFromHeading(text) {
  if (/전자|electronics/iu.test(text)) return "samsung-electronics";
  if (/SDI/iu.test(text)) return "samsung-sdi";
  if (/물산|C&T/iu.test(text)) return "samsung-ct";
  if (/바이오로직스|biologics/iu.test(text)) return "samsung-biologics";
  if (/전기|electro/iu.test(text)) return "samsung-electro-mechanics";
  if (/생명|life/iu.test(text)) return "samsung-life";
  if (/화재|fire/iu.test(text)) return "samsung-fire-marine";
  return null;
}

function matchUrlRecord({ title, period, documentType, companyId }) {
  const candidates = (urlRecordsByCompany.get(companyId) ?? []).filter((record) => record.documentUrl);
  const titleTokens = tokenSet(title);
  let best = null;
  for (const record of candidates) {
    const recordTokens = tokenSet(record.title);
    const common = [...titleTokens].filter((token) => recordTokens.has(token)).length;
    const recordDocumentType = inferDocumentType(record.title, "pdf");
    const typeCompatible = documentType !== "unknown" && documentType === recordDocumentType;
    const periodBonus = period && normalizeLoose(record.title).includes(normalizeLoose(period)) ? 3 : 0;
    const typeBonus = typeCompatible ? 3 : 0;
    const exactishBonus = includesLoose(title, record.title) || includesLoose(record.title, title) ? 5 : 0;
    if (!typeCompatible && exactishBonus === 0 && common < 2) continue;
    const score = common + periodBonus + typeBonus + exactishBonus;
    if (!best || score > best.score) best = { ...record, score };
  }
  return best && best.score >= 3 ? best : null;
}

function tokenSet(value) {
  return new Set(
    value
      .normalize("NFKC")
      .replace(/\.[Pp][Dd][Ff]$/u, "")
      .replace(/[_()[\],.-]+/gu, " ")
      .toLowerCase()
      .split(/\s+/u)
      .map((token) => token.trim())
      .filter((token) => token && !["kor", "eng", "kr", "pdf"].includes(token))
  );
}

function normalizeLoose(value) {
  return value
    .normalize("NFKC")
    .replace(/\.[Pp][Dd][Ff]$/u, "")
    .replace(/[^0-9a-zA-Z가-힣]+/gu, "")
    .toLowerCase();
}

function includesLoose(a, b) {
  const aa = normalizeLoose(a);
  const bb = normalizeLoose(b);
  return aa.length > 0 && bb.length > 0 && (aa.includes(bb) || bb.includes(aa));
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

function inferDocumentType(title, extension) {
  if (extension === "md") return "research_note";
  if (/실적발표/u.test(title)) return "earnings_presentation";
  if (/사업보고서/u.test(title)) return "business_report";
  if (/감사보고서/u.test(title)) return "audit_report";
  if (/반기보고서|반기_검토보고서/u.test(title)) return "semiannual_report";
  if (/분기보고서|[13]Q_보고서|1Q_검토보고서|3Q_검토보고서|보고서 \(2025\.03\)|보고서 \(2025\.09\)/u.test(title)) return "quarterly_report";
  if (/검토보고서/u.test(title)) return "review_report";
  if (/주주서한/u.test(title)) return "shareholder_letter";
  if (/영업보고서/u.test(title)) return "operating_report";
  return "unknown";
}

function inferPeriod(title) {
  const yearQuarter = title.match(/(20\d{2})[_\s-]?([1-4])Q/iu);
  if (yearQuarter) return `${yearQuarter[1]}Q${yearQuarter[2]}`;
  const yearMonth = title.match(/(20\d{2})[.](0[369]|12)/u);
  if (yearMonth) return `${yearMonth[1]}.${yearMonth[2]}`;
  const year = title.match(/(20\d{2})/u);
  return year ? year[1] : null;
}

function inferSourceRole(documentType, extension, companyId) {
  if (extension === "md") return "research_support";
  if (!companyId) return "supporting";
  if (["earnings_presentation", "business_report", "audit_report", "semiannual_report", "quarterly_report", "review_report", "shareholder_letter", "operating_report"].includes(documentType)) {
    return "official_issuer";
  }
  return "supporting";
}

function processingDecision({ extension, isPdf, sourceRole, documentType }) {
  if (extension === "pdf" && !isPdf) return "exclude-nontext-recording-or-invalid-pdf";
  if (extension === "pdf" && sourceRole === "official_issuer") return "extract-to-markdown-and-wiki-candidate";
  if (extension === "md") return "manifest-support-note";
  if (documentType === "unknown") return "manual-source-review";
  return "hold-until-classified";
}

function paperUseLevel({ extension, isPdf, sourceRole, urlMatch }) {
  if (extension === "pdf" && !isPdf) return "do-not-use-invalid-file";
  if (sourceRole === "official_issuer" && urlMatch) return "usable-after-extraction-and-claim-review";
  if (sourceRole === "official_issuer") return "review-only-until-document-url-reconciled";
  if (sourceRole === "official_dart_filing") return "usable-after-extraction";
  return "supporting-metadata-only";
}

function documentUrlStatusFor({ extension, companyId, urlMatch }) {
  if (extension !== "pdf") return "not_required";
  if (!companyId) return "unknown_company_no_url_match";
  return urlMatch ? "matched_from_document_url_list" : "pending_url_reconciliation";
}

function requestPackageFor(documentType) {
  if (["business_report", "annual_report", "operating_report", "audit_report", "semiannual_report", "quarterly_report", "review_report"].includes(documentType)) {
    return "PKG-02";
  }
  if (documentType === "earnings_presentation") return "PKG-03";
  if (["shareholder_letter", "governance_report"].includes(documentType)) return "PKG-04";
  return "PKG-03";
}

function defaultSelectionReason({ documentType, period }) {
  const suffix = period ? ` (${period} 기준)` : "";
  if (documentType === "earnings_presentation") return `분기 실적과 사업부 수요 변화를 확인하기 위한 공식 IR 자료${suffix}`;
  if (["business_report", "operating_report"].includes(documentType)) return `연간 사업 현황과 재무성과를 확인하기 위한 공식 보고서${suffix}`;
  if (["audit_report", "review_report", "semiannual_report", "quarterly_report"].includes(documentType)) {
    return `재무제표 신뢰성과 기간별 회계 기준을 확인하기 위한 공식 보고서${suffix}`;
  }
  if (documentType === "research_note") return "수집 경로와 문서 URL을 검증하기 위한 보조 메타데이터";
  return `회사별 공식 근거 패키지 보강을 위한 자료${suffix}`;
}

function notesFor({ extension, isPdf, companyId, documentType, period, urlMatch }) {
  const notes = [];
  if (extension === "pdf" && !isPdf) {
    notes.push("file extension is .pdf but file signature is not PDF");
    notes.push("excluded from knowledge dictionary; use PPT/subtitle/report substitutes where available");
  }
  if (!companyId) notes.push("not stored under a recognized company folder");
  if (documentType === "unknown") notes.push("document type not inferred from filename");
  if (!period && extension === "pdf") notes.push("period not inferred from filename");
  if (extension === "pdf" && !urlMatch) notes.push("needs document-level public URL before claim promotion");
  if (urlMatch) notes.push("document-level public URL matched from user-supplied Samsung URL list");
  return notes;
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
