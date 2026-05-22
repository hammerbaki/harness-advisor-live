import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventory = await readJson("raw/manifests/hanwha.local-sources.json");
const extraction = await readJson("raw/manifests/hanwha.extraction-report.json");
const outputPath = "raw/manifests/hanwha.narrative-claim-queue.json";
const docPath = "docs/77_hanwha_narrative_claim_queue.md";
const reviewReadyIntakeStates = new Set([
  "ready_for_extraction_or_claim_review",
  "ready_for_extraction_or_claim_review_source_page"
]);

const extractionById = new Map((extraction.results ?? []).map((result) => [result.manifestId, result]));
const records = (inventory.entries ?? [])
  .filter((entry) => entry.inferredSourceRole === "official_issuer")
  .filter((entry) => entry.processingDecision === "extract-to-markdown-and-wiki-candidate")
  .map((entry, index) => {
    const result = extractionById.get(entry.id);
    const lowText = Boolean(result?.lowTextWarning);
    const extractionOk = result?.extractionStatus === "ok";
    const ready = reviewReadyIntakeStates.has(entry.intakeReadiness) && extractionOk && !lowText;
    return {
      id: `hanwha-ncq-${String(index + 1).padStart(3, "0")}`,
      groupId: "hanwha",
      companyId: entry.companyId,
      companyScope: entry.companyScope,
      koreanName: koreanNameFor(entry.companyId),
      sourceManifestId: entry.id,
      sourceTitle: entry.title,
      sourceCategory: entry.sourceCategory,
      period: entry.documentDate ?? entry.folderYear ?? null,
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
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  inputArtifacts: {
    localSources: "raw/manifests/hanwha.local-sources.json",
    extractionReport: "raw/manifests/hanwha.extraction-report.json"
  },
  policy:
    "Hanwha narrative sources are not runtime knowledge. They become runtime-eligible only after a human reviewer promotes atomic claims with companyId, companyScope, evidence locator, forward-looking label, and rights-safe source metadata. Source-page provenance is acceptable for official IR pages when the local file checksum, title, period, extraction hash, and source page URL are preserved.",
  totals: {
    records: records.length,
    readyForHumanClaimReview: records.filter((record) => record.queueState === "ready_for_human_claim_review").length,
    blockedBeforeClaimReview: records.filter((record) => record.queueState === "blocked_before_claim_review").length,
    lowTextWarnings: records.filter((record) => record.lowTextWarning).length,
    byCompanyId: countBy(records, (record) => record.companyId ?? "unknown"),
    bySourceCategory: countBy(records, (record) => record.sourceCategory ?? "unknown"),
    byQueueState: countBy(records, (record) => record.queueState),
    byBlockedReason: countBy(records.filter((record) => record.blockedReason), (record) => record.blockedReason)
  },
  records
};

await writeJson(outputPath, output);
await writeMarkdown(docPath, renderDoc(output));
console.log(`Hanwha narrative claim queue written: ${outputPath}`);
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
  if (!reviewReadyIntakeStates.has(entry.intakeReadiness)) return "fix source provenance or intake metadata before claim review";
  return "manual source review";
}

function suggestedClaimTypes(entry) {
  if (entry.sourceCategory === "annual_report" || entry.sourceCategory === "periodic_report") return ["financial_context", "risk_factor", "business_segment"];
  if (entry.sourceCategory === "quarterly_report") return ["financial_update", "risk_factor", "business_segment"];
  if (entry.sourceCategory === "audit_report") return ["financial_control", "audit_context"];
  if (entry.sourceCategory === "earnings_material" || entry.sourceCategory === "ir_material") return ["financial_update", "segment_performance", "management_outlook"];
  if (entry.sourceCategory === "investor_presentation") return ["business_strategy", "portfolio_direction", "capital_allocation"];
  if (entry.sourceCategory === "value_up") return ["shareholder_return", "value_up_plan", "capital_allocation"];
  if (entry.sourceCategory === "governance") return ["governance", "capital_action"];
  return ["source_review"];
}

function koreanNameFor(companyId) {
  const names = {
    hanwha: "한화",
    "hanwha-aerospace": "한화에어로스페이스",
    "hanwha-solutions": "한화솔루션",
    "hanwha-systems": "한화시스템",
    "hanwha-ocean": "한화오션",
    "hanwha-life": "한화생명",
    "hanwha-investment-securities": "한화투자증권",
    "hanwha-galleria": "한화갤러리아"
  };
  return names[companyId] ?? companyId ?? "unknown";
}

function renderDoc(queue) {
  const rows = queue.records.map((record) => [
    `\`${record.id}\``,
    record.koreanName,
    record.sourceTitle,
    record.sourceCategory,
    record.documentUrlStatus,
    record.queueState,
    record.blockedReason ?? "",
    String(record.textCharCount)
  ]);
  return [
    "# Hanwha Narrative Claim Queue",
    "",
    `Generated: ${queue.generatedAt}`,
    "",
    "This artifact keeps Hanwha and Hanwha affiliate IR/PDF sources out of runtime answers until human claim review is complete. It is intentionally separate from DART financial seed claims and previously promoted source-backed seed claims.",
    "",
    "## Summary",
    "",
    `- Records: ${queue.totals.records}`,
    `- Ready for human claim review: ${queue.totals.readyForHumanClaimReview}`,
    `- Blocked before claim review: ${queue.totals.blockedBeforeClaimReview}`,
    `- Low-text/OCR warnings: ${queue.totals.lowTextWarnings}`,
    "",
    "## Queue Rows",
    "",
    table(["ID", "Company", "Source", "Type", "URL status", "State", "Blocked reason", "Text chars"], rows),
    "",
    "## Use Boundary",
    "",
    "Queue rows are not runtime claims. Runtime promotion requires atomic claim text, evidence locator, source URL or accepted source-page provenance, company scope, forward-looking label when needed, and reviewer approval.",
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
