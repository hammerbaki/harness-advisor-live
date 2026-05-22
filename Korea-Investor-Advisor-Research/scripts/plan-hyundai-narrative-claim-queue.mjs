import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventory = await readJson("raw/manifests/hyundai-motor.local-sources.json");
const extraction = await readJson("raw/manifests/hyundai-motor.extraction-report.json");
const outputPath = "raw/manifests/hyundai-motor.narrative-claim-queue.json";
const docPath = "docs/55_hyundai_motor_narrative_claim_queue.md";
const reviewReadyIntakeStates = new Set([
  "ready_for_extraction_or_claim_review",
  "ready_for_extraction_or_claim_review_source_page"
]);

const extractionById = new Map((extraction.results ?? []).map((result) => [result.manifestId, result]));
const skippedDuplicateEntries = (inventory.entries ?? []).filter((entry) =>
  entry.processingDecision === "duplicate-reference-only" || entry.intakeReadiness === "duplicate_reference_only"
);
const records = (inventory.entries ?? [])
  .filter((entry) => entry.sourceRole === "official_issuer")
  .filter((entry) => entry.processingDecision !== "duplicate-reference-only")
  .map((entry, index) => {
    const result = extractionById.get(entry.id);
    const lowText = Boolean(result?.lowTextWarning);
    const extractionOk = result?.extractionStatus === "ok";
    const ready = reviewReadyIntakeStates.has(entry.intakeReadiness) && extractionOk && !lowText;
    return {
      id: `hyundai-ncq-${String(index + 1).padStart(3, "0")}`,
      groupId: "hyundai-motor",
      companyId: entry.companyId,
      koreanName: entry.koreanName,
      sourceManifestId: entry.id,
      sourceTitle: entry.title,
      documentType: entry.documentType,
      period: entry.period,
      requestPackage: entry.requestPackage,
      sourcePageUrl: entry.sourcePageUrl,
      publicDocumentUrl: entry.publicDocumentUrl,
      dartReceiptUrl: entry.dartReceiptUrl,
      documentUrlStatus: entry.documentUrlStatus,
      rightsLevel: entry.rightsLevel,
      extractionStatus: result?.extractionStatus ?? "not_extracted",
      textCharCount: result?.textCharCount ?? 0,
      textSha256: result?.textSha256 ?? null,
      lowTextWarning: lowText,
      queueState: ready ? "ready_for_human_claim_review" : "blocked_before_claim_review",
      blockedReason: ready ? null : blockedReason({ entry, result }),
      suggestedClaimTypes: suggestedClaimTypes(entry),
      selectionReason: entry.selectionReason,
      nextAction: ready
        ? "review extracted markdown and promote atomic source-backed claims with evidence locators"
        : nextAction({ entry, result })
    };
  });

const output = {
  schemaVersion: "narrative-claim-queue.v0.1",
  groupId: "hyundai-motor",
  generatedAt: new Date().toISOString(),
  inputArtifacts: {
    localSources: "raw/manifests/hyundai-motor.local-sources.json",
    extractionReport: "raw/manifests/hyundai-motor.extraction-report.json"
  },
  policy:
    "Hyundai Motor narrative sources are not runtime knowledge. They become runtime-eligible only after a human reviewer promotes atomic claims with companyId, companyScope, evidence locator, forward-looking label, and rights-safe source metadata. Source-page provenance is acceptable for dynamic IR pages when the file checksum, title, period, extraction hash, and source page URL are preserved.",
  totals: {
    records: records.length,
    readyForHumanClaimReview: records.filter((record) => record.queueState === "ready_for_human_claim_review").length,
    blockedBeforeClaimReview: records.filter((record) => record.queueState === "blocked_before_claim_review").length,
    lowTextWarnings: records.filter((record) => record.lowTextWarning).length,
    skippedDuplicates: skippedDuplicateEntries.length,
    byCompanyId: countBy(records, (record) => record.companyId ?? "unknown"),
    byDocumentType: countBy(records, (record) => record.documentType ?? "unknown"),
    byQueueState: countBy(records, (record) => record.queueState)
  },
  skipped: {
    duplicateReferenceOnly: skippedDuplicateEntries.map((entry) => ({
      sourceManifestId: entry.id,
      duplicateOf: entry.duplicateOf,
      companyId: entry.companyId,
      koreanName: entry.koreanName,
      title: entry.title,
      localPath: entry.localPath
    }))
  },
  records
};

await writeJson(outputPath, output);
await writeMarkdown(docPath, renderDoc(output));
console.log(`Hyundai Motor narrative claim queue written: ${outputPath}`);
console.log(`${output.totals.readyForHumanClaimReview} ready, ${output.totals.blockedBeforeClaimReview} blocked.`);

async function readJson(path) {
  return JSON.parse(await readFile(join(rootDir, path), "utf8"));
}

async function writeJson(path, value) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeMarkdown(path, markdown) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function blockedReason({ entry, result }) {
  if (!reviewReadyIntakeStates.has(entry.intakeReadiness)) return entry.intakeReadiness;
  if (!result) return "missing_extraction_result";
  if (result.extractionStatus !== "ok") return `extraction_${result.extractionStatus}`;
  if (result.lowTextWarning) return "low_text_or_image_like_pdf_requires_ocr_or_manual_review";
  return "manual_review_required";
}

function nextAction({ entry, result }) {
  if (result?.lowTextWarning) return "run OCR or supply text-bearing substitute before narrative claim promotion";
  if (!reviewReadyIntakeStates.has(entry.intakeReadiness)) return "fix intake metadata before claim review";
  return "manual source review";
}

function suggestedClaimTypes(entry) {
  if (entry.documentType === "business_report") return ["financial_context", "risk_factor", "business_segment"];
  if (entry.documentType === "earnings_presentation") return ["financial_update", "segment_performance", "guidance_or_outlook"];
  if (entry.documentType === "investor_presentation") return ["business_strategy", "capital_allocation", "portfolio_direction"];
  if (entry.documentType === "strategy_presentation") return ["guidance_or_outlook", "business_strategy"];
  if (entry.documentType === "value_up_plan") return ["shareholder_return", "value_up_plan", "capital_allocation"];
  return ["source_review"];
}

function renderDoc(queue) {
  const rows = queue.records.map((record) => [
    `\`${record.id}\``,
    record.koreanName,
    record.sourceTitle,
    record.documentType,
    record.documentUrlStatus,
    record.queueState,
    record.blockedReason ?? "",
    String(record.textCharCount)
  ]);
  return [
    "# Hyundai Motor Narrative Claim Queue",
    "",
    `Generated: ${queue.generatedAt}`,
    "",
    "This artifact keeps Hyundai Motor Group IR/PDF sources out of runtime answers until human claim review is complete. It is intentionally separate from the DART financial seed claims.",
    "",
    "## Summary",
    "",
    `- Records: ${queue.totals.records}`,
    `- Ready for human claim review: ${queue.totals.readyForHumanClaimReview}`,
    `- Blocked before claim review: ${queue.totals.blockedBeforeClaimReview}`,
    `- Low-text/OCR warnings: ${queue.totals.lowTextWarnings}`,
    `- Skipped duplicate reference files: ${queue.totals.skippedDuplicates ?? 0}`,
    "",
    "## Queue Rows",
    "",
    table(["ID", "Company", "Source", "Type", "URL status", "State", "Blocked reason", "Text chars"], rows),
    "",
    "## Use Boundary",
    "",
    "Queue rows are not runtime claims. Runtime promotion requires atomic claim text, evidence locator, source URL, company scope, forward-looking label when needed, and reviewer approval.",
    ""
  ].join("\n");
}

function table(headers, rows) {
  if (rows.length === 0) return "No rows.\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`)
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
