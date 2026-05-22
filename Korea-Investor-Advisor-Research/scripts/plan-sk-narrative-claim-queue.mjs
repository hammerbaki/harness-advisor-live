import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = process.env.SK_INVENTORY ?? "raw/manifests/sk.local-sources.json";
const extractionPath = process.env.SK_EXTRACT_REPORT ?? "raw/manifests/sk.extraction-report.json";
const sourceClaimsPath = process.env.SK_SOURCE_CLAIMS ?? "raw/manifests/sk.source-backed-claims.json";
const outputPath = process.env.SK_NARRATIVE_QUEUE_OUT ?? "raw/manifests/sk.narrative-claim-queue.json";
const docPath = process.env.SK_NARRATIVE_QUEUE_DOC ?? "docs/48_sk_narrative_claim_queue.md";

const inventory = await readJson(inventoryPath);
const extraction = await readJson(extractionPath);
const financialClaims = await readJson(sourceClaimsPath);
const inventoryById = new Map((inventory.entries ?? []).map((entry) => [entry.id, entry]));
const extractionByCompany = groupBy(extraction.results ?? [], (entry) => entry.companyId ?? "unknown");

const themes = [
  {
    id: "sk-hynix-value-up-memory-readiness",
    companyId: "sk-hynix",
    koreanName: "SK하이닉스",
    answerUse: ["memory cycle context", "value-up and capital policy", "financial-report support"],
    suggestedWikiTarget: "wiki/groups/sk/companies/sk-hynix.md",
    preferredDocumentTypes: ["value_up_plan", "review_report", "semiannual_report", "audit_report"],
    candidateClaimFamilies: [
      "value-up and shareholder-return policy from official value-up material",
      "financial-report baseline for memory-cycle recovery questions",
      "HBM and AI-memory strategy only after OCR or text-bearing source verification"
    ],
    explicitBlockerFamilies: ["strategy_presentation"]
  },
  {
    id: "sk-innovation-energy-battery-earnings",
    companyId: "sk-innovation",
    koreanName: "SK이노베이션",
    answerUse: ["energy and battery earnings context", "portfolio pressure signals", "quarterly performance explanation"],
    suggestedWikiTarget: "wiki/groups/sk/companies/sk-innovation.md",
    preferredDocumentTypes: ["earnings_presentation"],
    candidateClaimFamilies: [
      "quarterly earnings drivers and segment pressure from official earnings releases",
      "energy and battery performance context bounded to released periods",
      "portfolio-transition interpretation only when stated in official material"
    ],
    explicitBlockerFamilies: []
  },
  {
    id: "sk-inc-portfolio-value-up-holding-company",
    companyId: "sk-inc",
    koreanName: "SK",
    answerUse: ["holding-company portfolio context", "value-up plan", "capital allocation and shareholder-return review"],
    suggestedWikiTarget: "wiki/groups/sk/companies/sk-inc.md",
    preferredDocumentTypes: ["business_report", "value_up_plan", "earnings_presentation", "audit_report"],
    candidateClaimFamilies: [
      "holding-company portfolio and investment-company framing",
      "value-up and capital-allocation policy from official value-up material",
      "quarterly holding-company performance context from text-bearing earnings briefings"
    ],
    explicitBlockerFamilies: ["review_report", "sustainability_report"]
  },
  {
    id: "sk-telecom-telecom-ai-value-up",
    companyId: "sk-telecom",
    koreanName: "SK텔레콤",
    answerUse: ["telecom financial context", "AI and data-center narrative review", "value-up and shareholder-return review"],
    suggestedWikiTarget: "wiki/groups/sk/companies/sk-telecom.md",
    preferredDocumentTypes: ["earnings_press_release", "value_up_plan", "earnings_presentation"],
    candidateClaimFamilies: [
      "telecom earnings and margin context from text-bearing press releases",
      "value-up and shareholder-return policy from official value-up material",
      "AI or data-center claims only where extracted text provides explicit support"
    ],
    explicitBlockerFamilies: ["earnings_presentation"]
  }
];

const records = themes.map((theme) => buildThemeRecord(theme));
const output = {
  schemaVersion: "narrative-claim-queue.v0.1",
  groupId: "sk",
  generatedAt: new Date().toISOString(),
  inputArtifacts: {
    sourceInventory: inventoryPath,
    extractionReport: extractionPath,
    financialSeedClaims: sourceClaimsPath
  },
  commonSchemaPolicy:
    "SK uses a group-specific intake adapter only at the raw source boundary. This queue follows the same narrative-claim-queue schema used for other groups before source-backed claim promotion.",
  promotionPolicy:
    "This queue is not runtime knowledge. Runtime promotion requires companyId, companyScope, public document URL, extraction hash, period/reporting basis, bounded claim type, evidence locator, forward-looking label when needed, and reviewer approval.",
  totals: {
    records: records.length,
    readyForHumanClaimReview: records.filter((record) => record.queueState === "ready_for_human_claim_review").length,
    partiallyReadyForHumanClaimReview: records.filter((record) => record.queueState === "partially_ready_for_human_claim_review").length,
    blockedBeforeClaimReview: records.filter((record) => record.queueState === "blocked_before_claim_review").length,
    readySources: records.flatMap((record) => record.readySources).length,
    blockedSources: records.flatMap((record) => record.blockedSources).length,
    lowTextSources: records.flatMap((record) => record.blockedSources).filter((source) => source.blockReason === "low_text_or_image_pdf").length,
    extractionErrorSources: records.flatMap((record) => record.blockedSources).filter((source) => source.blockReason === "extraction_error").length,
    urlPendingSources: records.flatMap((record) => record.blockedSources).filter((source) => source.blockReason === "document_url_pending").length,
    existingFinancialSeedClaims: (financialClaims.records ?? []).length,
    byCompany: countBy(records, (record) => record.koreanName)
  },
  records
};

await writeJson(outputPath, output);
await writeFile(join(rootDir, docPath), renderDoc(output), "utf8");

console.log(`SK narrative claim queue written: ${outputPath}`);
console.log(`Readable readiness note written: ${docPath}`);
console.log(
  `${output.totals.records} themes; ${output.totals.readySources} ready source(s), ` +
    `${output.totals.blockedSources} blocked source(s).`
);

function buildThemeRecord(theme) {
  const results = extractionByCompany.get(theme.companyId) ?? [];
  const readySources = [];
  const blockedSources = [];

  for (const result of results) {
    const inventoryEntry = inventoryById.get(result.manifestId);
    if (inventoryEntry?.duplicateOf) {
      blockedSources.push(toBlockedSource(result, "duplicate_local_file", inventoryEntry));
      continue;
    }
    if (result.extractionStatus !== "ok") {
      blockedSources.push(toBlockedSource(result, "extraction_error", inventoryEntry));
      continue;
    }
    if (result.documentUrlStatus !== "matched_from_document_url_list") {
      blockedSources.push(toBlockedSource(result, "document_url_pending", inventoryEntry));
      continue;
    }
    if (result.lowTextWarning || (result.textCharCount ?? 0) < 500) {
      blockedSources.push(toBlockedSource(result, "low_text_or_image_pdf", inventoryEntry));
      continue;
    }

    const priority = sourcePriority(theme, result);
    readySources.push({
      manifestId: result.manifestId,
      title: result.title,
      documentType: result.documentType,
      period: result.period,
      publicDocumentUrl: result.publicDocumentUrl,
      sourcePageUrl: result.sourcePageUrl,
      markdownPath: result.markdownPath,
      textSha256: result.textSha256,
      textCharCount: result.textCharCount,
      priority,
      sourceUse: sourceUseFor(result),
      promotionReadiness: priority > 0 ? "ready_for_evidence_locator_review" : "supporting_review_only"
    });
  }

  readySources.sort((a, b) => b.priority - a.priority || b.textCharCount - a.textCharCount);
  blockedSources.sort((a, b) => a.blockReason.localeCompare(b.blockReason, "ko-KR") || a.title.localeCompare(b.title, "ko-KR"));

  const primaryReadySources = readySources.filter((source) => source.promotionReadiness === "ready_for_evidence_locator_review");
  const blockers = [...new Set(blockedSources.map((source) => source.blockReason))];
  const queueState =
    primaryReadySources.length === 0
      ? "blocked_before_claim_review"
      : blockers.length > 0
        ? "partially_ready_for_human_claim_review"
        : "ready_for_human_claim_review";

  return {
    id: theme.id,
    groupId: "sk",
    companyId: theme.companyId,
    companyScope: "listed_company",
    koreanName: theme.koreanName,
    answerUse: theme.answerUse,
    suggestedWikiTarget: theme.suggestedWikiTarget,
    verificationState: "narrative_claim_queue_not_runtime_eligible",
    queueState,
    candidateClaimFamilies: theme.candidateClaimFamilies,
    readySources,
    blockedSources,
    blockers,
    promotionRule:
      "Draft atomic narrative claims only after the reviewer selects a source, quotes an evidence locator, preserves companyId/period/reporting basis, and labels forward-looking statements.",
    nextAction: nextActionFor({ theme, primaryReadySources, blockers })
  };
}

function sourcePriority(theme, result) {
  let score = 0;
  const preferredIndex = theme.preferredDocumentTypes.indexOf(result.documentType);
  if (preferredIndex >= 0) score += 20 - preferredIndex * 2;
  if (/2025/u.test(result.period ?? "")) score += 4;
  if (/2024/u.test(result.period ?? "")) score += 2;
  if ((result.textCharCount ?? 0) > 10000) score += 3;
  if ((result.textCharCount ?? 0) > 100000) score += 2;
  if (theme.explicitBlockerFamilies.includes(result.documentType)) score -= 15;
  return score;
}

function sourceUseFor(result) {
  if (result.documentType === "value_up_plan") return "shareholder-value and capital-policy review";
  if (result.documentType === "earnings_press_release") return "quarterly earnings and investor-facing summary review";
  if (result.documentType === "earnings_presentation") return "earnings presentation review";
  if (result.documentType === "business_report") return "business-report baseline and risk context review";
  if (result.documentType === "audit_report") return "accounting baseline and audit-context review";
  if (result.documentType === "review_report" || result.documentType === "semiannual_report") return "interim-report baseline review";
  if (result.documentType === "strategy_presentation") return "strategy narrative review after text/OCR validation";
  return "supporting review";
}

function toBlockedSource(result, blockReason, inventoryEntry) {
  return {
    manifestId: result.manifestId,
    title: result.title,
    documentType: result.documentType,
    period: result.period,
    publicDocumentUrl: result.publicDocumentUrl ?? inventoryEntry?.publicDocumentUrl ?? null,
    markdownPath: result.markdownPath ?? null,
    textCharCount: result.textCharCount ?? null,
    extractionStatus: result.extractionStatus,
    lowTextWarning: result.lowTextWarning ?? false,
    blockReason,
    nextAction: blockedNextAction(blockReason, result)
  };
}

function blockedNextAction(blockReason, result) {
  if (blockReason === "duplicate_local_file") return "use canonical file with same checksum";
  if (blockReason === "extraction_error") return "redownload official PDF or use alternate source if this claim family is needed";
  if (blockReason === "document_url_pending") return "confirm exact public document URL before claim promotion";
  if (blockReason === "low_text_or_image_pdf") {
    return result.documentType === "strategy_presentation"
      ? "run OCR or obtain official transcript/text-bearing deck before strategy claim promotion"
      : "use text-bearing press release or OCR before claim promotion";
  }
  return "manual review";
}

function nextActionFor({ theme, primaryReadySources, blockers }) {
  if (primaryReadySources.length === 0) {
    return `collect or OCR text-bearing official source material for ${theme.koreanName}`;
  }
  if (blockers.length > 0) {
    return "review ready sources first and keep blocked sources out of runtime promotion";
  }
  return "draft atomic candidate claims with evidence locators";
}

function renderDoc(queue) {
  const lines = [
    "# SK Narrative Claim Queue",
    "",
    `Generated: ${queue.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document records SK narrative source readiness before runtime claim promotion. It is a review ledger, not user-facing knowledge. The same claim-queue schema should be used for every group after group-specific source intake normalizes raw files.",
    "",
    "## Summary",
    "",
    `- Queue themes: ${queue.totals.records}`,
    `- Ready sources for evidence-locator review: ${queue.totals.readySources}`,
    `- Blocked sources: ${queue.totals.blockedSources}`,
    `- Low-text or image-PDF sources: ${queue.totals.lowTextSources}`,
    `- Extraction-error sources: ${queue.totals.extractionErrorSources}`,
    `- URL-pending sources: ${queue.totals.urlPendingSources}`,
    `- Existing financial seed claims: ${queue.totals.existingFinancialSeedClaims}`,
    "",
    "## Theme Queue",
    "",
    "| Company | Theme | State | Ready sources | Blocked sources | Next action |",
    "| --- | --- | --- | ---: | ---: | --- |"
  ];

  for (const record of queue.records) {
    lines.push(
      `| ${record.koreanName} | \`${record.id}\` | \`${record.queueState}\` | ${record.readySources.length} | ${record.blockedSources.length} | ${record.nextAction} |`
    );
  }

  lines.push("", "## Promotion Boundary", "");
  lines.push(
    "A queued source can support a runtime claim only after the reviewer writes an atomic claim with a public document URL, extraction hash, evidence locator, period/reporting basis, companyId, companyScope, and forward-looking label when needed. The queue itself must not be exposed as customer-facing evidence."
  );

  lines.push("", "## Company Notes", "");
  for (const record of queue.records) {
    lines.push(`### ${record.koreanName}`, "");
    lines.push(`State: \`${record.queueState}\``, "");
    lines.push("Candidate claim families:", "");
    for (const family of record.candidateClaimFamilies) lines.push(`- ${family}`);
    lines.push("", "Ready source examples:", "");
    for (const source of record.readySources.slice(0, 5)) {
      lines.push(`- ${source.title} (${source.documentType}, ${source.period ?? "period unknown"})`);
    }
    if (record.readySources.length === 0) lines.push("- none");
    lines.push("", "Blocked source issues:", "");
    const blockedCounts = countBy(record.blockedSources, (source) => source.blockReason);
    for (const [reason, count] of Object.entries(blockedCounts)) lines.push(`- ${reason}: ${count}`);
    if (record.blockedSources.length === 0) lines.push("- none");
    lines.push("");
  }

  lines.push(
    "## Source References",
    "",
    "- `raw/manifests/sk.local-sources.json`",
    "- `raw/manifests/sk.extraction-report.json`",
    "- `raw/manifests/sk.narrative-claim-queue.json`",
    "- `docs/47_sk_source_inventory_and_ingestion.md`"
  );
  return `${lines.join("\n")}\n`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
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
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
