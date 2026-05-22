import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = process.env.SAMSUNG_INVENTORY ?? "raw/manifests/samsung.local-sources.json";
const schemaPath = process.env.DOCUMENT_URL_SCHEMA ?? "configs/document-url-intake-schema.json";
const outputPath = process.env.SAMSUNG_DOCUMENT_URL_INTAKE_OUT ?? "raw/manifests/samsung.document-url-intake.json";
const dartExtractionPath = process.env.SAMSUNG_DART_FILING_EXTRACT_REPORT ?? "raw/manifests/samsung.dart-filing-extraction-report.json";

const inventory = await readJson(inventoryPath);
const schema = await readJson(schemaPath);
const previous = existsSync(join(rootDir, outputPath)) ? await readJson(outputPath) : null;
const previousBySource = new Map((previous?.entries ?? []).map((entry) => [entry.sourceId, entry]));
const dartExtraction = existsSync(join(rootDir, dartExtractionPath)) ? await readJson(dartExtractionPath) : null;
const extractedDartByManifestId = new Map(
  (dartExtraction?.results ?? [])
    .filter((result) => result.extractionStatus === "ok" && result.markdownPath && result.textSha256)
    .map((result) => [result.manifestId, result])
);

const entries = (inventory.entries ?? [])
  .filter((entry) =>
    entry.processingDecision === "extract-to-markdown-and-wiki-candidate" ||
    entry.processingDecision === "extract-via-dart-document-pipeline"
  )
  .map((entry) => buildUrlEntry(entry, previousBySource.get(entry.id)));

const output = {
  schemaVersion: "document-url-intake.v0.1",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  inventoryPath,
  schemaPath,
  policy:
    "This manifest is the intake ledger for public document URLs. Local extracted PDFs remain review-only until publicDocumentUrl is supplied and validated.",
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
  instructionsForUser: [
    "Fill publicDocumentUrl for local PDF rows when you find the exact document-level public URL.",
    "Keep sourcePageUrl as the broader IR page URL.",
    "Do not paste API keys or private download URLs.",
    "If a document URL cannot be found, leave publicDocumentUrl null and keep urlStatus pending_user_url."
  ],
  schemaRules: schema.rules,
  entries
};

validate(output);
await writeJson(outputPath, output);

console.log(`Samsung document URL intake written: ${outputPath}`);
console.log(
  `${output.totals.entries} entries; ${output.totals.pendingUserUrls} pending user URL(s), ` +
    `${output.totals.dartViewerUrls} DART viewer URL(s), ${output.totals.readyForClaimReview} ready for claim review.`
);

function buildUrlEntry(entry, previous) {
  const isDartViewer = entry.processingDecision === "extract-via-dart-document-pipeline";
  const dartExtractionResult = isDartViewer ? extractedDartByManifestId.get(entry.id) : null;
  const previousUrl = normalizeNullable(previous?.publicDocumentUrl);
  const publicDocumentUrl = isDartViewer ? entry.sourcePageUrl : previousUrl;
  const urlStatus = isDartViewer
    ? "dart_viewer_url_supplied"
    : publicDocumentUrl
      ? "public_url_supplied"
      : "pending_user_url";
  const promotionReadiness = isDartViewer
    ? dartExtractionResult
      ? "ready_for_claim_review"
      : "blocked_pending_dart_extraction"
    : publicDocumentUrl
      ? "ready_for_claim_review"
      : "blocked_missing_document_url";

  return {
    sourceId: entry.id,
    groupId: "samsung",
    companyId: entry.companyId,
    koreanName: entry.koreanName,
    title: entry.title,
    documentType: entry.documentType,
    period: entry.period,
    sourceRole: entry.sourceRole,
    localPath: entry.localPath,
    sourcePageUrl: entry.sourcePageUrl,
    publicDocumentUrl,
    urlStatus,
    promotionReadiness,
    rceptNo: entry.rceptNo ?? null,
    receiptDate: entry.receiptDate ?? null,
    dartExtractionStatus: dartExtractionResult?.extractionStatus ?? null,
    dartMarkdownPath: dartExtractionResult?.markdownPath ?? null,
    dartTextSha256: dartExtractionResult?.textSha256 ?? null,
    sourceSha256: entry.sha256 ?? null,
    rightsPolicy:
      previous?.rightsPolicy ??
      (isDartViewer
        ? "DART public viewer URL may be cited; extracted full text remains local review material unless redistribution rights are verified."
        : "Public source URL may be cited; local extracted full text must not be redistributed unless rights are verified."),
    userNote: dartExtractionResult
      ? appendNote(previous?.userNote, "DART filing text extraction completed; ready for human claim review.")
      : previous?.userNote ?? "",
    lastReviewedAt: previous?.lastReviewedAt ?? null
  };
}

function validate(output) {
  for (const entry of output.entries) {
    for (const field of schema.requiredFields ?? []) {
      if (!(field in entry)) throw new Error(`${entry.sourceId} missing required field ${field}`);
    }
    if (!schema.urlStatusValues.includes(entry.urlStatus)) {
      throw new Error(`${entry.sourceId} invalid urlStatus ${entry.urlStatus}`);
    }
    if (!schema.promotionReadinessValues.includes(entry.promotionReadiness)) {
      throw new Error(`${entry.sourceId} invalid promotionReadiness ${entry.promotionReadiness}`);
    }
    if (entry.urlStatus === "public_url_supplied" && !/^https?:\/\//u.test(entry.publicDocumentUrl ?? "")) {
      throw new Error(`${entry.sourceId} publicDocumentUrl must be http(s)`);
    }
    if (entry.urlStatus === "pending_user_url" && entry.promotionReadiness !== "blocked_missing_document_url") {
      throw new Error(`${entry.sourceId} pending URL must block promotion`);
    }
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeNullable(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function appendNote(existing, addition) {
  const prior = String(existing ?? "").trim();
  if (!addition) return prior;
  if (!prior) return addition;
  if (prior.includes(addition)) return prior;
  return `${prior} ${addition}`;
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
