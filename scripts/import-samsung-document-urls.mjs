import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inputPath =
  process.env.SAMSUNG_DOCUMENT_URL_LIST ??
  "/Users/jj/Downloads/삼성그룹 6개사 IR 자료 — 문서 단위 URL 목록.md";
const intakePath = process.env.SAMSUNG_DOCUMENT_URL_INTAKE ?? "raw/manifests/samsung.document-url-intake.json";
const reportPath = process.env.SAMSUNG_DOCUMENT_URL_IMPORT_REPORT ?? "raw/manifests/samsung.document-url-import-report.json";
const dartExtractionPath = process.env.SAMSUNG_DART_FILING_EXTRACT_REPORT ?? "raw/manifests/samsung.dart-filing-extraction-report.json";

const importedAt = new Date().toISOString();
const markdown = await readAnyText(inputPath);
const intake = await readJson(intakePath);
const dartExtraction = existsSync(join(rootDir, dartExtractionPath)) ? await readJson(dartExtractionPath) : null;
const extractedDartByManifestId = new Map(
  (dartExtraction?.results ?? [])
    .filter((result) => result.extractionStatus === "ok" && result.markdownPath && result.textSha256)
    .map((result) => [result.manifestId, result])
);
const parsed = parseMarkdownUrlList(markdown);
const titleMatches = new Set();
const rceptMatches = new Set();
const pendingNotesByTitle = new Map(parsed.pendingRows.map((row) => [row.titleKey, row]));
const directRowsByTitle = groupBy(parsed.directRows, (row) => row.titleKey);
const dartRowsByRceptNo = new Map(parsed.dartRows.map((row) => [row.rceptNo, row]));
const unmatchedDuplicateTitles = [];

for (const [titleKey, rows] of directRowsByTitle) {
  if (rows.length > 1) unmatchedDuplicateTitles.push({ title: rows[0].title, rows });
}

const entries = (intake.entries ?? []).map((entry) => {
  if (entry.rceptNo) return importDartRow(entry);
  return importDirectDocumentRow(entry);
});

const matchedDirectTitleKeys = new Set(titleMatches);
const unmatchedDirectRows = parsed.directRows
  .filter((row) => !matchedDirectTitleKeys.has(row.titleKey))
  .map((row) => summarizeParsedRow(row));
const unmatchedDartRows = parsed.dartRows
  .filter((row) => !rceptMatches.has(row.rceptNo))
  .map((row) => summarizeParsedRow(row));

const output = {
  ...intake,
  generatedAt: importedAt,
  importSource: {
    inputPath,
    importedAt,
    parser: "scripts/import-samsung-document-urls.mjs",
    rule:
      "Only exact document-level http(s) URLs are attached to local PDF rows. Non-URL notes such as same-as-report are recorded but not promoted automatically."
  },
  totals: {
    entries: entries.length,
    pendingUserUrls: entries.filter((entry) => entry.urlStatus === "pending_user_url").length,
    suppliedPublicUrls: entries.filter((entry) => entry.urlStatus === "public_url_supplied").length,
    dartViewerUrls: entries.filter((entry) => entry.urlStatus === "dart_viewer_url_supplied").length,
    readyForClaimReview: entries.filter((entry) => entry.promotionReadiness === "ready_for_claim_review").length,
    blockedMissingDocumentUrl: entries.filter((entry) => entry.promotionReadiness === "blocked_missing_document_url").length,
    blockedPendingDartExtraction: entries.filter((entry) => entry.promotionReadiness === "blocked_pending_dart_extraction").length,
    byCompany: countBy(entries, (entry) => entry.koreanName ?? "unknown"),
    byDocumentType: countBy(entries, (entry) => entry.documentType ?? "unknown")
  },
  entries
};

const report = {
  schemaVersion: "document-url-import-report.v0.1",
  groupId: "samsung",
  generatedAt: importedAt,
  inputPath,
  intakePath,
  parsed: {
    directRows: parsed.directRows.length,
    dartRows: parsed.dartRows.length,
    pendingRows: parsed.pendingRows.length,
    supplementalRows: parsed.supplementalRows.length
  },
  matched: {
    localDocumentUrls: titleMatches.size,
    dartViewerRows: rceptMatches.size
  },
  remaining: {
    pendingUserUrls: output.totals.pendingUserUrls,
    blockedMissingDocumentUrl: output.totals.blockedMissingDocumentUrl,
    blockedPendingDartExtraction: output.totals.blockedPendingDartExtraction
  },
  unmatchedDirectRows,
  unmatchedDartRows,
  pendingRows: parsed.pendingRows.map((row) => summarizeParsedRow(row)),
  supplementalRows: parsed.supplementalRows.map((row) => summarizeParsedRow(row)),
  duplicateDirectTitles: unmatchedDuplicateTitles,
  policyNotes: [
    "A broad IR index URL does not satisfy document-level provenance.",
    "A note that a PPT is the same URL as a report is not promoted unless the public URL is an exact match to the local artifact being used.",
    "DART viewer URLs are sufficient as public filing references, but text extraction is still required before narrative claims become review-ready."
  ]
};

await writeJson(intakePath, output);
await writeJson(reportPath, report);

console.log(`Samsung document URLs imported from: ${inputPath}`);
console.log(
  `${titleMatches.size} local document URL(s), ${rceptMatches.size} DART viewer row(s) matched. ` +
    `${output.totals.pendingUserUrls} URL(s) remain pending.`
);
console.log(`Import report written: ${reportPath}`);

function importDirectDocumentRow(entry) {
  const key = normalizeTitle(entry.title);
  const rows = directRowsByTitle.get(key) ?? [];
  const row = rows[0] ?? null;
  const pending = pendingNotesByTitle.get(key) ?? null;

  if (!row) {
    return {
      ...entry,
      userNote: pending
        ? appendNote(
            entry.userNote,
            `Document URL list noted this file but did not provide an exact http(s) document URL: ${pending.note}`
          )
        : entry.userNote
    };
  }

  titleMatches.add(key);
  return {
    ...entry,
    sourcePageUrl: row.sourcePageUrl ?? entry.sourcePageUrl,
    publicDocumentUrl: row.publicDocumentUrl,
    urlStatus: "public_url_supplied",
    promotionReadiness: "ready_for_claim_review",
    importedFrom: inputPath,
    urlValidationStatus: "not_network_validated",
    userNote: appendNote(entry.userNote, `Document-level URL supplied from ${basenameForNote(inputPath)}.`),
    lastReviewedAt: importedAt
  };
}

function importDartRow(entry) {
  const row = dartRowsByRceptNo.get(entry.rceptNo);
  if (!row) return entry;

  rceptMatches.add(row.rceptNo);
  const dartExtractionResult = extractedDartByManifestId.get(entry.sourceId);
  return {
    ...entry,
    sourcePageUrl: row.sourcePageUrl ?? entry.sourcePageUrl,
    publicDocumentUrl: row.publicDocumentUrl,
    urlStatus: "dart_viewer_url_supplied",
    promotionReadiness: dartExtractionResult ? "ready_for_claim_review" : "blocked_pending_dart_extraction",
    dcmNo: row.dcmNo,
    pdfDownloadUrl: `https://dart.fss.or.kr/pdf/download/main.do?rcp_no=${row.rceptNo}&dcm_no=${row.dcmNo}`,
    dartExtractionStatus: dartExtractionResult?.extractionStatus ?? null,
    dartMarkdownPath: dartExtractionResult?.markdownPath ?? null,
    dartTextSha256: dartExtractionResult?.textSha256 ?? null,
    importedFrom: inputPath,
    userNote: appendNote(
      appendNote(entry.userNote, `DART dcmNo supplied from ${basenameForNote(inputPath)}.`),
      dartExtractionResult ? "DART filing text extraction completed; ready for human claim review." : ""
    ),
    lastReviewedAt: importedAt
  };
}

function parseMarkdownUrlList(text) {
  const directRows = [];
  const dartRows = [];
  const pendingRows = [];
  const supplementalRows = [];
  let sourcePageUrl = null;
  let companyHeading = null;
  const lines = text.split(/\r?\n/u);

  lines.forEach((line, index) => {
    const headingMatch = line.match(/^##\s+\d+\.\s+(.+)$/u);
    if (headingMatch) companyHeading = headingMatch[1].trim();

    const sourceMatch = line.match(/\*\*출처 페이지:\*\*\s+(https?:\/\/\S+)/u);
    if (sourceMatch) sourcePageUrl = stripTrailingPunctuation(sourceMatch[1]);

    if (!line.trim().startsWith("|")) return;
    const cells = splitMarkdownTableRow(line);
    if (cells.length < 2 || isSeparatorRow(cells) || isHeaderRow(cells)) return;

    const urls = cells.filter((cell) => /^https?:\/\//u.test(stripMarkup(cell)));
    const firstCell = stripMarkup(cells[0]);

    if (looksLikeDartRow(cells)) {
      const publicDocumentUrl = stripTrailingPunctuation(stripMarkup(cells[1]));
      const rceptNo = stripMarkup(cells[2]);
      const dcmNo = stripMarkup(cells[3]);
      dartRows.push({
        companyHeading,
        lineNumber: index + 1,
        title: firstCell,
        titleKey: normalizeTitle(firstCell),
        sourcePageUrl,
        publicDocumentUrl,
        rceptNo,
        dcmNo
      });
      return;
    }

    if (!/\.pdf$/iu.test(firstCell)) {
      if (urls.length > 0) {
        supplementalRows.push({
          companyHeading,
          lineNumber: index + 1,
          title: firstCell,
          titleKey: normalizeTitle(firstCell),
          sourcePageUrl,
          publicDocumentUrl: stripTrailingPunctuation(stripMarkup(urls.at(-1))),
          note: "supplemental table row without local PDF filename"
        });
      }
      return;
    }

    const title = firstCell.replace(/\.pdf$/iu, "");
    if (urls.length === 0) {
      pendingRows.push({
        companyHeading,
        lineNumber: index + 1,
        title,
        titleKey: normalizeTitle(title),
        sourcePageUrl,
        note: stripMarkup(cells.slice(1).join(" | "))
      });
      return;
    }

    directRows.push({
      companyHeading,
      lineNumber: index + 1,
      title,
      titleKey: normalizeTitle(title),
      sourcePageUrl,
      publicDocumentUrl: stripTrailingPunctuation(stripMarkup(urls.at(-1)))
    });
  });

  return { directRows, dartRows, pendingRows, supplementalRows };
}

function looksLikeDartRow(cells) {
  return (
    cells.length >= 4 &&
    stripMarkup(cells[1]).includes("dart.fss.or.kr/dsaf001/main.do") &&
    /^\d{14}$/u.test(stripMarkup(cells[2])) &&
    /^\d+$/u.test(stripMarkup(cells[3]))
  );
}

function splitMarkdownTableRow(line) {
  return line
    .trim()
    .replace(/^\|/u, "")
    .replace(/\|$/u, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isHeaderRow(cells) {
  return cells.some((cell) => ["파일명", "문서 단위 URL", "DART 뷰어 URL", "URL 유형"].includes(stripMarkup(cell)));
}

function isSeparatorRow(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/u.test(stripMarkup(cell)));
}

function normalizeTitle(value) {
  return stripMarkup(String(value ?? ""))
    .replace(/\.pdf$/iu, "")
    .normalize("NFC")
    .replace(/\s+/gu, "")
    .trim()
    .toLowerCase();
}

function stripMarkup(value) {
  return String(value ?? "")
    .replace(/`/gu, "")
    .replace(/\*/gu, "")
    .trim();
}

function stripTrailingPunctuation(value) {
  return String(value ?? "").replace(/[),.]+$/u, "");
}

function summarizeParsedRow(row) {
  return {
    companyHeading: row.companyHeading,
    lineNumber: row.lineNumber,
    title: row.title,
    sourcePageUrl: row.sourcePageUrl,
    publicDocumentUrl: row.publicDocumentUrl ?? null,
    rceptNo: row.rceptNo ?? null,
    dcmNo: row.dcmNo ?? null,
    note: row.note ?? null
  };
}

function appendNote(existing, note) {
  const current = String(existing ?? "").trim();
  if (!current) return note;
  if (current.includes(note)) return current;
  return `${current} ${note}`;
}

function basenameForNote(path) {
  return String(path).split("/").at(-1);
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  return groups;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function readAnyText(path) {
  const fullPath = isAbsolute(path) ? path : join(rootDir, path);
  return readFile(fullPath, "utf8");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
