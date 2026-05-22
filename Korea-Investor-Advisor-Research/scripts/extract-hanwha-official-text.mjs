import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = resolve(
  process.env.HANWHA_INVENTORY ?? join(rootDir, "raw", "manifests", "hanwha.local-sources.json")
);
const reportPath = resolve(
  process.env.HANWHA_EXTRACT_REPORT ?? join(rootDir, "raw", "manifests", "hanwha.extraction-report.json")
);
const textOutputDir = resolve(process.env.HANWHA_EXTRACT_TEXT_DIR ?? join(rootDir, "raw", "extracted", "hanwha", "official"));
const writeText = process.env.HANWHA_EXTRACT_WRITE_TEXT === "1";
const selectedIds = new Set(
  String(process.env.HANWHA_EXTRACT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
const officialCandidates = inventory.entries.filter((entry) =>
  entry.processingDecision === "extract-to-markdown-and-wiki-candidate" &&
  entry.extension === "pdf" &&
  (selectedIds.size === 0 || selectedIds.has(entry.id))
);

const results = [];
for (const entry of officialCandidates) {
  const sourcePath = resolve(rootDir, entry.localPath);
  const startedAt = Date.now();

  try {
    const extracted = await extractPdfText(sourcePath);
    const normalizedText = normalizeText(extracted.pages.map((page) => page.text).join("\n\n"));
    const result = {
      manifestId: entry.id,
      title: entry.title,
      localPath: entry.localPath,
      sha256: entry.sha256,
      sourceCategory: entry.sourceCategory,
      inferredSourceRole: entry.inferredSourceRole,
      folderYear: entry.folderYear,
      documentDate: entry.documentDate,
      extractionStatus: "ok",
      pageCount: extracted.pageCount,
      textCharCount: normalizedText.length,
      textSha256: sha256(normalizedText),
      lowTextWarning: normalizedText.length < 500,
      extractionMs: Date.now() - startedAt,
      markdownPath: writeText ? relative(rootDir, markdownPathFor(entry)) : null,
      nextAction: "review-extracted-text-and-promote-atomic-claims"
    };

    if (writeText) {
      await mkdir(textOutputDir, { recursive: true });
      await writeFile(markdownPathFor(entry), renderMarkdown(entry, extracted), "utf8");
    }

    results.push(result);
  } catch (error) {
    results.push({
      manifestId: entry.id,
      title: entry.title,
      localPath: entry.localPath,
      sha256: entry.sha256,
      sourceCategory: entry.sourceCategory,
      inferredSourceRole: entry.inferredSourceRole,
      folderYear: entry.folderYear,
      documentDate: entry.documentDate,
      extractionStatus: "error",
      error: error instanceof Error ? error.message : String(error),
      extractionMs: Date.now() - startedAt,
      nextAction: "manual-review"
    });
  }
}

const report = {
  schemaVersion: "pdf-extraction-report.v0.1",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  inventoryPath: relative(rootDir, inventoryPath),
  extractionPolicy:
    "Default output records extraction metadata only. Set HANWHA_EXTRACT_WRITE_TEXT=1 for local full-text markdown review.",
  textOutputIncluded: writeText,
  totals: {
    candidates: officialCandidates.length,
    ok: results.filter((result) => result.extractionStatus === "ok").length,
    error: results.filter((result) => result.extractionStatus === "error").length,
    lowTextWarnings: results.filter((result) => result.lowTextWarning).length,
    extractedChars: results.reduce((sum, result) => sum + (result.textCharCount ?? 0), 0)
  },
  skipped: {
    thirdPartyAnalyst: inventory.entries.filter((entry) => entry.inferredSourceRole === "third_party_analyst").length,
    manualTypeCheck: inventory.entries.filter((entry) => entry.processingDecision === "manual-type-check-before-extraction").length
  },
  results
};

await mkdir(resolve(reportPath, ".."), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Hanwha extraction report written: ${relative(rootDir, reportPath)}`);
console.log(`${report.totals.ok}/${report.totals.candidates} official PDFs extracted; ${report.totals.lowTextWarnings} low-text warning(s).`);
if (!writeText) console.log("Full-text markdown was not written. Set HANWHA_EXTRACT_WRITE_TEXT=1 for local review output.");

async function extractPdfText(path) {
  const data = new Uint8Array(await readFile(path));
  const task = pdfjs.getDocument({
    data,
    disableFontFace: true,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true
  });
  const document = await task.promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent({ disableCombineTextItems: false });
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/gu, " ")
      .trim();
    pages.push({ pageNumber, text, charCount: text.length, textSha256: sha256(normalizeText(text)) });
  }

  return { pageCount: document.numPages, pages };
}

function renderMarkdown(entry, extracted) {
  const lines = [
    "---",
    `manifest_id: "${entry.id}"`,
    `title: "${entry.title.replaceAll("\"", "\\\"")}"`,
    `group_id: "hanwha"`,
    `source_role: "${entry.inferredSourceRole}"`,
    `source_category: "${entry.sourceCategory}"`,
    `source_sha256: "${entry.sha256}"`,
    `document_date: "${entry.documentDate ?? ""}"`,
    `extracted_at: "${new Date().toISOString()}"`,
    "---",
    "",
    `# ${entry.title}`,
    "",
    "> Local extraction output for human review. Do not redistribute unless source rights are verified.",
    "",
    `Source file: \`${entry.localPath}\``,
    "",
    ...extracted.pages.flatMap((page) => [
      `## Page ${page.pageNumber}`,
      "",
      page.text || "_No extractable text detected._",
      ""
    ])
  ];
  return `${lines.join("\n")}\n`;
}

function markdownPathFor(entry) {
  const safeName = basename(entry.filename ?? entry.title)
    .replace(/\.pdf$/iu, "")
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 90);
  return join(textOutputDir, `${entry.id}-${safeName}.md`);
}

function normalizeText(text) {
  return text.normalize("NFC").replace(/\s+/gu, " ").trim();
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}
