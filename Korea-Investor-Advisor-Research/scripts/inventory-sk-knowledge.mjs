import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const defaultInputDir = resolve(knowledgeBaseRoot, "sk_knowledge");
const inputDir = resolve(process.env.SK_KNOWLEDGE_DIR ?? defaultInputDir);
const outputPath = resolve(
  process.env.SK_INVENTORY_OUT ?? join(rootDir, "raw", "manifests", "sk.local-sources.json")
);
const identifierManifestPath = resolve(
  process.env.SK_IDENTIFIER_MANIFEST ?? join(rootDir, "raw", "manifests", "sk.identifier-verification.json")
);
const urlListPath = resolve(
  process.env.SK_DOCUMENT_URL_LIST ??
    join(inputDir, "SK그룹 4개사 IR 자료 — 문서 단위 URL 목록.md")
);

const companyFolderMap = {
  sk_hynix: "sk-hynix",
  sk_innovation: "sk-innovation",
  sk_inc: "sk-inc",
  sk_telecom: "sk-telecom",
  sk_square: "sk-square"
};

const companySourcePages = {
  "sk-hynix": "https://www.skhynix.com/ir/UI-FR-IR06/",
  "sk-innovation": "https://www.skinnovation.com/ir/earning",
  "sk-inc": "https://sk-inc.com/kr/ir/irArchive.aspx",
  "sk-telecom": "https://www.sktelecom.com/investor/lib/announce.do",
  "sk-square": "https://www.sksquare.com/kor/ir/business.do"
};

const identifierManifest = JSON.parse(await readFile(identifierManifestPath, "utf8"));
const identifierByCompany = new Map(identifierManifest.records.map((record) => [record.companyId, record]));
const urlRecords = await readUrlRecords(urlListPath);
const urlRecordsByCompany = groupBy(urlRecords, (record) => record.companyId ?? "unknown");

const files = (await collectFiles(inputDir)).filter((path) => !basename(path).startsWith(".") && !isControlFile(path));
const entries = [];

for (const absolutePath of files.sort(localeCompare)) {
  const pathParts = relative(inputDir, absolutePath).split(sep).map((part) => part.normalize("NFC"));
  const extension = extname(absolutePath).replace(".", "").toLowerCase();
  const sizeBytes = (await stat(absolutePath)).size;
  const sha256 = await hashFile(absolutePath);
  const bytesHead = await readHead(absolutePath, 5);
  const isPdf = bytesHead.toString("latin1") === "%PDF-";
  const companyFolder = inferCompanyFolder(pathParts);
  const companyId = companyFolder ? companyFolderMap[companyFolder] ?? null : null;
  const identifier = companyId ? identifierByCompany.get(companyId) : null;
  const title = stripExtension(basename(absolutePath)).normalize("NFC");
  const documentType = inferDocumentType({ title, extension, pathParts });
  const period = inferPeriod(title);
  const sourceRole = inferSourceRole(documentType, extension, companyId);
  const urlMatch = companyId && extension === "pdf" ? matchUrlRecord({ title, period, documentType, companyId }) : null;
  const requestPackage = requestPackageFor(documentType, companyId);
  const selectionReason = urlMatch?.selectionReason ?? defaultSelectionReason({ documentType, period, companyId });

  entries.push({
    id: `sk-local-${sha256.slice(0, 12)}`,
    groupId: "sk",
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
    sourcePageUrl: urlMatch?.sourcePageUrl ?? companySourcePages[companyId] ?? null,
    publicDocumentUrl: urlMatch?.documentUrl ?? null,
    documentUrlStatus: documentUrlStatusFor({ extension, companyId, urlMatch }),
    urlMatchScore: urlMatch?.score ?? null,
    urlMatchTitle: urlMatch?.title ?? null,
    requestPackage,
    selectionReason,
    rceptNo: urlMatch?.rceptNo ?? null,
    processingDecision: processingDecision({ extension, isPdf, sourceRole, documentType }),
    needsDocumentUrl: extension === "pdf" && !urlMatch,
    redistributionPolicy: "manifest-only until public source URL and redistribution rights are verified",
    paperUseLevel: paperUseLevel({ extension, isPdf, sourceRole, urlMatch }),
    notes: notesFor({ extension, isPdf, companyId, documentType, period, urlMatch })
  });
}

const byChecksum = groupBy(entries.filter((entry) => entry.sha256), (entry) => entry.sha256);
for (const duplicates of byChecksum.values()) {
  if (duplicates.length <= 1) continue;
  const canonical = duplicates[0].id;
  duplicates.forEach((duplicate, index) => {
    if (index === 0) return;
    duplicate.duplicateOf = canonical;
    duplicate.id = `${duplicate.id}-dup${index}`;
  });
}

const matchedUrlIds = new Set(entries.map((entry) => entry.urlMatchTitle ? `${entry.companyId}:${entry.urlMatchTitle}:${entry.publicDocumentUrl}` : null).filter(Boolean));
const unmatchedUrlRecords = urlRecords
  .filter((record) => !matchedUrlIds.has(`${record.companyId}:${record.title}:${record.documentUrl}`))
  .map((record) => ({
    ...record,
    reconciliationStatus: record.isPlaceholderUrl ? "excluded_placeholder_url" : "url_record_not_matched_to_local_file"
  }));

const inventory = {
  schemaVersion: "local-source-inventory.v0.2",
  groupId: "sk",
  generatedAt: new Date().toISOString(),
  sourceRoot: relative(rootDir, inputDir).normalize("NFC"),
  identifierManifestPath: relative(rootDir, identifierManifestPath).normalize("NFC"),
  documentUrlListPath: relative(rootDir, urlListPath).normalize("NFC"),
  outputPolicy:
    "This file inventories local SK source candidates and reconciles them with document-level URLs. It does not grant redistribution rights.",
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
    duplicateChecksumGroups: [...byChecksum.values()].filter((group) => group.length > 1).length,
    urlListRecords: urlRecords.length,
    urlListRecordsByCompany: countBy(urlRecords, (record) => record.companyId ?? "unknown"),
    unmatchedUrlRecords: unmatchedUrlRecords.length,
    placeholderUrlRecords: urlRecords.filter((record) => record.isPlaceholderUrl).length
  },
  urlReconciliation: {
    policy:
      "Document-level URLs are used for claim-promotion eligibility. Unmatched local PDFs may still be extracted for review, but cannot become runtime claims until URL reconciliation is complete.",
    unmatchedUrlRecords
  },
  entries
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");

console.log(`SK local source inventory written: ${relative(rootDir, outputPath)}`);
console.log(
  `${inventory.totals.entries} entries: ${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles} valid local PDFs, ` +
    `${inventory.totals.urlListRecords} URL record(s), ${inventory.totals.unmatchedUrlRecords} unmatched URL record(s), ` +
    `${formatBytes(inventory.totals.bytes)} local bytes.`
);

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
      sourcePageUrl = companySourcePages[companyId] ?? null;
      continue;
    }

    const sourcePage = line.match(/\*\*(?:IR 자료실 메인 페이지|IR Materials 메인 페이지|실적발표 메인 페이지|출처 페이지|IR 메인 페이지|Presentation 페이지):\*\*\s+(https?:\/\/\S+)/u);
    if (sourcePage) {
      sourcePageUrl = sourcePage[1];
      continue;
    }

    if (!line.startsWith("|") || /---/u.test(line)) continue;
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 2 || /^파일명$/u.test(cells[0])) continue;

    const urlCell = cells.find((cell) => /https?:\/\//u.test(cell));
    if (!urlCell || !companyId) continue;
    const url = (urlCell.match(/https?:\/\/[^\s|)]+/u) ?? [null])[0];
    if (!url) continue;
    const rceptNo = (cells.join(" ").match(/\b(20\d{12,14})\b/u) ?? [null, null])[1];
    records.push({
      companyId,
      title: cells[0].replace(/\s+\*\(.+?\)\*/u, "").trim(),
      date: inferDateFromCells(cells),
      sourcePageUrl,
      documentUrl: url,
      selectionReason: cells.at(-1) && !/https?:\/\//u.test(cells.at(-1)) ? cells.at(-1) : null,
      rceptNo,
      isPlaceholderUrl: /\[UUID\]/iu.test(urlCell),
      urlSource: relative(rootDir, path).normalize("NFC")
    });
  }
  return records;
}

function companyIdFromHeading(text) {
  if (/SK\s*Inc|SK주식회사/u.test(text)) return "sk-inc";
  if (/하이닉스|hynix/iu.test(text)) return "sk-hynix";
  if (/텔레콤|telecom/iu.test(text)) return "sk-telecom";
  if (/이노베이션|innovation/iu.test(text)) return "sk-innovation";
  if (/스퀘어|square/iu.test(text)) return "sk-square";
  return null;
}

function inferDateFromCells(cells) {
  const dateCell = cells.find((cell) => /\b20\d{2}-\d{2}-\d{2}\b/u.test(cell));
  return dateCell ? (dateCell.match(/\b20\d{2}-\d{2}-\d{2}\b/u) ?? [null])[0] : null;
}

function matchUrlRecord({ title, period, documentType, companyId }) {
  const candidates = (urlRecordsByCompany.get(companyId) ?? []).filter((record) => !record.isPlaceholderUrl);
  const titleTokens = tokenSet(title);
  let best = null;
  for (const record of candidates) {
    const recordTokens = tokenSet(record.title);
    const common = [...titleTokens].filter((token) => recordTokens.has(token)).length;
    const recordDocumentType = inferDocumentType({ title: record.title, extension: "pdf", pathParts: [] });
    const typeCompatible = documentType !== "unknown" && documentType === recordDocumentType;
    const periodBonus = period && normalizeLoose(record.title).includes(normalizeLoose(period)) ? 3 : 0;
    const typeBonus = typeCompatible ? 3 : 0;
    const exactishBonus = includesLoose(title, record.title) || includesLoose(record.title, title) ? 5 : 0;
    if (!typeCompatible && exactishBonus === 0) continue;
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
      .replace(/^\d{4}-\d{2}-\d{2}/u, "")
      .replace(/[_()[\],.-]+/gu, " ")
      .toLowerCase()
      .split(/\s+/u)
      .map((token) => token.trim())
      .filter((token) => token && !["kor", "kr", "pdf"].includes(token))
  );
}

function normalizeLoose(value) {
  return value
    .normalize("NFKC")
    .replace(/\.[Pp][Dd][Ff]$/u, "")
    .replace(/^\d{4}-\d{2}-\d{2}/u, "")
    .replace(/[^0-9a-zA-Z가-힣]+/gu, "")
    .toLowerCase();
}

function includesLoose(a, b) {
  const aa = normalizeLoose(a);
  const bb = normalizeLoose(b);
  return aa.length > 0 && bb.length > 0 && (aa.includes(bb) || bb.includes(aa));
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

function inferCompanyFolder(pathParts) {
  if (pathParts[0] === "sk_ir") return pathParts[1] ?? null;
  return companyFolderMap[pathParts[0]] ? pathParts[0] : null;
}

function inferDocumentType({ title, extension, pathParts }) {
  const pathText = pathParts.join(" ").normalize("NFC");
  if (extension === "md") return "research_note";
  if (/value[-_\s]?up|기업가치[\s_]?제고|Corporate_Value-up/iu.test(title)) return "value_up_plan";
  if (/Semiannual|반기/iu.test(title)) return "semiannual_report";
  if (/Review_Report|검토보고서/iu.test(title)) return "review_report";
  if (/사업보고서|business_report/iu.test(pathText) || /사업보고서/iu.test(title)) return "business_report";
  if (/감사보고서|audit_report|Annual_Audit/iu.test(pathText) || /감사보고서|Annual[_\s]Audit|Audit[_\s]Report/iu.test(title)) return "audit_report";
  if (/PressRelease|Press_Release|Press Release/iu.test(title)) return "earnings_press_release";
  if (/Tech[_\s-]?Seminar|AI[_\s-]?Market|HBM/iu.test(title)) return "strategy_presentation";
  if (/Earnings|InvestorBriefing|Investor_Briefing|실적발표|Presentation|IR_materials|presentation/iu.test(pathText) || /Earnings|InvestorBriefing|Investor_Briefing|Presentation/iu.test(title)) {
    return "earnings_presentation";
  }
  if (/CEO_Speech|CEO Speech/iu.test(title)) return "shareholder_meeting_speech";
  if (/ESG|Sustainability/iu.test(title)) return "sustainability_report";
  return "unknown";
}

function inferPeriod(title) {
  const cleanedTitle = title.replace(/^\d{4}-\d{2}-\d{2}/u, "");
  const koreanQuarter = cleanedTitle.match(/(20\d{2})년[_\s-]?([1-4])분기/u);
  if (koreanQuarter) return `${koreanQuarter[1]}Q${koreanQuarter[2]}`;
  const yearQuarter = cleanedTitle.match(/(20\d{2})[_\s-]?([1-4])Q/iu) ?? cleanedTitle.match(/([1-4])Q[_\s-]?(20\d{2})/iu);
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
    "earnings_presentation",
    "earnings_press_release",
    "business_report",
    "audit_report",
    "semiannual_report",
    "review_report",
    "value_up_plan",
    "strategy_presentation",
    "sustainability_report",
    "shareholder_meeting_speech"
  ].includes(documentType)) {
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

function documentUrlStatusFor({ extension, companyId, urlMatch }) {
  if (extension !== "pdf") return "not_required";
  if (!companyId) return "unknown_company_no_url_match";
  return urlMatch ? "matched_from_document_url_list" : "pending_url_reconciliation";
}

function requestPackageFor(documentType, companyId) {
  if (companyId === "sk-square") return "SK-PKG-06";
  if (companyId === "sk-hynix") return "SK-PKG-02";
  if (companyId === "sk-innovation") return "SK-PKG-03";
  if (companyId === "sk-inc") return "SK-PKG-04";
  if (companyId === "sk-telecom") return "SK-PKG-05";
  if (["business_report", "audit_report", "semiannual_report", "review_report"].includes(documentType)) return "SK-PKG-01";
  return "SK-PKG-01";
}

function defaultSelectionReason({ documentType, period, companyId }) {
  const suffix = period ? ` (${period} 기준)` : "";
  if (documentType === "earnings_presentation" || documentType === "earnings_press_release") {
    return `분기 실적과 사업 포트폴리오 변화를 확인하기 위한 공식 IR 자료${suffix}`;
  }
  if (["business_report", "audit_report", "semiannual_report", "review_report"].includes(documentType)) {
    return `재무성과와 회계 신뢰성을 확인하기 위한 공식 보고서${suffix}`;
  }
  if (documentType === "value_up_plan") return `주주환원과 기업가치 제고 방향을 확인하기 위한 공식 자료${suffix}`;
  if (documentType === "strategy_presentation") return `핵심 사업 전략과 투자 내러티브를 확인하기 위한 공식 발표자료${suffix}`;
  if (companyId === "sk-square") return `SK스퀘어 포트폴리오 가치와 자본배분을 확인하기 위한 공식 자료${suffix}`;
  return `SK 계열사별 공식 근거 패키지 보강을 위한 자료${suffix}`;
}

function paperUseLevel({ extension, isPdf, sourceRole, urlMatch }) {
  if (extension === "pdf" && !isPdf) return "do-not-use-invalid-file";
  if (sourceRole === "official_issuer" && urlMatch) return "usable-after-extraction-and-claim-review";
  if (sourceRole === "official_issuer") return "review-only-until-document-url-reconciled";
  return "supporting-metadata-only";
}

function notesFor({ extension, isPdf, companyId, documentType, period, urlMatch }) {
  const notes = [];
  if (extension === "pdf" && !isPdf) notes.push("file extension is .pdf but file signature is not PDF");
  if (!companyId) notes.push("not stored under a recognized SK company folder");
  if (documentType === "unknown") notes.push("document type not inferred from filename");
  if (!period && extension === "pdf") notes.push("period not inferred from filename");
  if (extension === "pdf" && !urlMatch) notes.push("needs document-level public URL reconciliation before claim promotion");
  if (urlMatch) notes.push("document-level public URL matched from user-supplied SK URL list");
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
