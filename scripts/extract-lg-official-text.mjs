import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = resolve(process.env.LG_INVENTORY ?? join(rootDir, "raw", "manifests", "lg.local-sources.json"));
const reportPath = resolve(process.env.LG_EXTRACT_REPORT ?? join(rootDir, "raw", "manifests", "lg.extraction-report.json"));
const textOutputDir = resolve(process.env.LG_EXTRACT_TEXT_DIR ?? join(rootDir, "raw", "extracted", "lg", "official"));
const writeText = process.env.LG_EXTRACT_WRITE_TEXT === "1";
const selectedIds = new Set(
  String(process.env.LG_EXTRACT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

const inventory = existsSync(inventoryPath)
  ? JSON.parse(await readFile(inventoryPath, "utf8"))
  : {
      schemaVersion: "local-source-inventory.v0.2",
      groupId: "lg",
      entries: [],
      status: "missing-inventory"
    };

const candidates = (inventory.entries ?? []).filter((entry) =>
  entry.processingDecision === "extract-to-markdown-and-wiki-candidate" &&
  entry.extension === "pdf" &&
  entry.isPdf === true &&
  (selectedIds.size === 0 || selectedIds.has(entry.id))
);
const nonPdfOfficialCandidates = (inventory.entries ?? []).filter((entry) =>
  entry.processingDecision === "convert-or-extract-source"
);
const invalidPdfFiles = (inventory.entries ?? []).filter((entry) => entry.processingDecision === "exclude-invalid-pdf");
const sourcePageOnlyCandidates = candidates.filter((entry) => entry.documentUrlStatus === "source_page_only");

const results = [];
for (const entry of candidates) {
  const sourcePath = resolve(rootDir, entry.localPath);
  const startedAt = Date.now();

  try {
    const extracted = await extractPdfText(sourcePath);
    const normalizedText = normalizeText(extracted.pages.map((page) => page.text).join("\n\n"));
    const result = {
      manifestId: entry.id,
      groupId: "lg",
      companyId: entry.companyId,
      koreanName: entry.koreanName,
      title: entry.title,
      localPath: entry.localPath,
      sha256: entry.sha256,
      documentType: entry.documentType,
      period: entry.period,
      sourceRole: entry.sourceRole,
      sourcePageUrl: entry.sourcePageUrl,
      publicDocumentUrl: entry.publicDocumentUrl,
      dartReceiptUrl: entry.dartReceiptUrl,
      documentUrlStatus: entry.documentUrlStatus,
      requestPackage: entry.requestPackage,
      selectionReason: entry.selectionReason,
      rightsLevel: entry.rightsLevel,
      extractionStatus: "ok",
      pageCount: extracted.pageCount,
      textCharCount: normalizedText.length,
      textSha256: sha256(normalizedText),
      lowTextWarning: normalizedText.length < 500,
      extractionMs: Date.now() - startedAt,
      markdownPath: writeText ? relative(rootDir, markdownPathFor(entry)) : null,
      promotionBoundary:
        entry.intakeReadiness === "ready_for_extraction_or_claim_review"
          ? "eligible-for-human-claim-review-after-evidence-locator"
          : "review-only-until-intake-gaps-are-resolved",
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
      groupId: "lg",
      companyId: entry.companyId,
      koreanName: entry.koreanName,
      title: entry.title,
      localPath: entry.localPath,
      sha256: entry.sha256,
      documentType: entry.documentType,
      period: entry.period,
      sourceRole: entry.sourceRole,
      extractionStatus: "error",
      error: error instanceof Error ? error.message : String(error),
      extractionMs: Date.now() - startedAt,
      nextAction: "manual-review"
    });
  }
}

const report = {
  schemaVersion: "pdf-extraction-report.v0.1",
  groupId: "lg",
  generatedAt: new Date().toISOString(),
  inventoryPath: relative(rootDir, inventoryPath),
  extractionPolicy:
    "Default output records extraction metadata only. Set LG_EXTRACT_WRITE_TEXT=1 for local full-text markdown review.",
  textOutputIncluded: writeText,
  promotionPolicy:
    "Extracted markdown is review material. Runtime source-backed claims require public document URL or official source route, evidence locator, period/reporting basis, rights-safe source metadata, and reviewer approval.",
  totals: {
    candidates: candidates.length,
    ok: results.filter((result) => result.extractionStatus === "ok").length,
    error: results.filter((result) => result.extractionStatus === "error").length,
    lowTextWarnings: results.filter((result) => result.lowTextWarning).length,
    extractedChars: results.reduce((sum, result) => sum + (result.textCharCount ?? 0), 0),
    sourcePageOnlyCandidates: sourcePageOnlyCandidates.length,
    nonPdfOfficialCandidates: nonPdfOfficialCandidates.length,
    invalidPdfFiles: invalidPdfFiles.length,
    byCompany: countBy(results, (result) => result.koreanName ?? "unknown"),
    byDocumentType: countBy(results, (result) => result.documentType ?? "unknown")
  },
  skipped: {
    nonPdfOfficialCandidates: nonPdfOfficialCandidates.map((entry) => ({
      manifestId: entry.id,
      title: entry.title,
      extension: entry.extension,
      nextAction: "convert-to-text-or-manual-review"
    })),
    invalidPdfManifestIds: invalidPdfFiles.map((entry) => entry.id)
  },
  results
};

await mkdir(dirname(reportPath), { recursive: true });
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`LG extraction report written: ${relative(rootDir, reportPath)}`);
console.log(`${report.totals.ok}/${report.totals.candidates} official PDFs extracted; ${report.totals.lowTextWarnings} low-text warning(s).`);
console.log(`${report.totals.nonPdfOfficialCandidates} non-PDF official candidate(s) need conversion or manual review.`);
if (!writeText) console.log("Full-text markdown was not written. Set LG_EXTRACT_WRITE_TEXT=1 for local review output.");

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
    `title: "${escapeYaml(entry.title)}"`,
    `group_id: "lg"`,
    `company_id: "${entry.companyId ?? ""}"`,
    `source_role: "${entry.sourceRole}"`,
    `document_type: "${entry.documentType}"`,
    `period: "${entry.period ?? ""}"`,
    `source_sha256: "${entry.sha256}"`,
    `source_page_url: "${entry.sourcePageUrl ?? ""}"`,
    `public_document_url: "${entry.publicDocumentUrl ?? ""}"`,
    `dart_receipt_url: "${entry.dartReceiptUrl ?? ""}"`,
    `document_url_status: "${entry.documentUrlStatus ?? ""}"`,
    `rights_level: "${entry.rightsLevel ?? ""}"`,
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

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function escapeYaml(value) {
  return String(value ?? "").replaceAll("\"", "\\\"");
}
