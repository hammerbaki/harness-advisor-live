import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/u, "");

const outputPath = "raw/manifests/product-paper-readiness-audit.json";
const docPath = "docs/86_product_and_paper_readiness.md";

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const evalFiles = [
  "evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/results/hyundai-motor-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/results/lg-reference-slice-v0.1.autoeval-baseline.2026-05-05.json",
  "evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json"
];

const firstSlice = await readJson("raw/manifests/first-slice-readiness-audit.json");
const groupData = await readJson("raw/manifests/group-data-completion-audit.json");
const promotion = await readJson("raw/manifests/review-approved-runtime-promotion.json");
const documentAudit = await readJson("raw/manifests/document-consolidation-audit.json");
const liveAnswerAudit = await readJsonIfExists("raw/manifests/live-answer-quality-audit.json");
const humanReviewPacket = await readJsonIfExists("raw/manifests/human-answer-review-packet.json");

const claimManifests = Object.fromEntries(await Promise.all(groupIds.map(async (groupId) => {
  const manifest = await readJson(`raw/manifests/${groupId}.source-backed-claims.json`);
  const records = manifest.records ?? [];
  return [groupId, {
    records: records.length,
    reviewApprovedRecords: records.filter((record) => record.paperUseLevel === "source-backed-review-approved-claim").length,
    companies: new Set(records.map((record) => record.companyId).filter(Boolean)).size
  }];
})));

const evals = (await Promise.all(evalFiles.map(readJsonIfExists))).filter(Boolean).map((result) => ({
  file: evalFiles.find((file) => existsSync(join(rootDir, file)) && safeReadGroup(file) === result.groupId) ?? null,
  groupId: result.groupId,
  scenarioSetId: result.scenarioSetId,
  scenarioCount: result.summary?.scenarioCount ?? 0,
  averageScore: result.summary?.averageScore ?? null,
  paperBaselineCount: result.summary?.paperBaselineCount ?? 0,
  requiredFailureCount: result.summary?.requiredFailureCount ?? 0,
  baselineStatus: result.summary?.baselineStatus ?? "unknown"
}));

const coreEvalPass = evals.length === 5 &&
  evals.every((item) => item.requiredFailureCount === 0 && item.paperBaselineCount === item.scenarioCount);

const firstSlicePass =
  firstSlice.totals?.companies === 25 &&
  firstSlice.totals?.openGaps === 0 &&
  firstSlice.totals?.companiesWithSourceBackedClaims === 25 &&
  firstSlice.totals?.companiesWithWikiPages === 25;

const promotionPass =
  promotion.totals?.promotedRecords === 25 &&
  groupIds.every((groupId) => promotion.totals?.byGroup?.[groupId] === 5) &&
  groupIds.every((groupId) => claimManifests[groupId]?.reviewApprovedRecords === 5);

const groupExpansionOpenGaps = groupData.totals?.openGapCount ?? 0;
const docsChecked = documentAudit.totalDocs ?? documentAudit.summary?.docsChecked ?? documentAudit.totals?.docsChecked ?? null;
const activeReadingPathCount = documentAudit.activeDocs ?? documentAudit.summary?.activeReadingPathCount ?? documentAudit.activeReadingPath?.length ?? null;
const liveAnswerQuality = summarizeLiveAnswerQuality(liveAnswerAudit);
const humanAnswerReview = summarizeHumanAnswerReview(humanReviewPacket);

const gates = [
  {
    id: "product-template-harness",
    status: firstSlicePass ? "pass" : "blocker",
    scope: "product",
    finding: firstSlicePass
      ? "The 25-company reference slice has local sources, wiki pages, and source-backed claims for every selected company."
      : "The first-slice readiness audit still has blocking gaps."
  },
  {
    id: "runtime-approved-claim-layer",
    status: promotionPass ? "pass" : "blocker",
    scope: "product",
    finding: promotionPass
      ? "The user-approved 25-row review layer is runtime-promoted, with five review-approved source-backed claims per group."
      : "The approved review layer is not fully promoted or not aligned with current manifests."
  },
  {
    id: "runtime-evaluation-baseline",
    status: coreEvalPass ? "pass" : "blocker",
    scope: "product",
    finding: coreEvalPass
      ? "All current group auto-eval baselines pass with zero required failures."
      : "At least one group auto-eval baseline has required failures or missing result files."
  },
  {
    id: "live-answer-quality-smoke",
    status: liveAnswerQuality.status,
    scope: "product-live",
    finding: liveAnswerQuality.finding
  },
  {
    id: "human-answer-review-packet",
    status: humanAnswerReview.status,
    scope: "product-review",
    finding: humanAnswerReview.finding
  },
  {
    id: "group-expansion-cleanup",
    status: groupExpansionOpenGaps === 0 ? "pass" : "nonblocking-gap",
    scope: "product-expansion",
    finding: groupExpansionOpenGaps === 0
      ? "No group-level expansion cleanup gaps remain."
      : `${groupExpansionOpenGaps} group-level expansion cleanup gaps remain outside the first-slice readiness gate.`
  },
  {
    id: "arxiv-method-demo-readiness",
    status: firstSlicePass && promotionPass && coreEvalPass ? "pass" : "not-ready",
    scope: "paper-arxiv",
    finding: firstSlicePass && promotionPass && coreEvalPass
      ? "The repository has enough bounded product evidence for an arXiv method/demo paper, provided the paper does not claim commercial readiness."
      : "The arXiv paper should wait until first-slice, claim-promotion, and auto-eval blockers are resolved."
  },
  {
    id: "sci-validation-readiness",
    status: "future-work",
    scope: "paper-sci",
    finding:
      "SCI-level validation still requires a stronger evaluation protocol, longer-run quality dashboard evidence, live API stability analysis, numeric consistency checks, and deployment/compliance boundaries."
  },
  {
    id: "commercial-v1-readiness",
    status: "future-work",
    scope: "commercialization",
    finding:
      "Commercial v1 still requires deployment hardening, key/security policy, monitoring, disclaimers, human review of answer policy, and client-operation controls."
  }
];

const readiness = {
  productStage: classifyProductStage({ firstSlicePass, promotionPass, coreEvalPass, liveAnswerQualityPass: liveAnswerQuality.status === "pass" }),
  arxivReady: gates.find((gate) => gate.id === "arxiv-method-demo-readiness")?.status === "pass",
  sciReady: false,
  commercialReady: false,
  liveAnswerQualityPass: liveAnswerQuality.status === "pass"
};

const audit = {
  schemaVersion: "product-paper-readiness-audit.v0.1",
  generatedAt: new Date().toISOString(),
  purpose:
    "Separate current product-readiness evidence from arXiv paper readiness, SCI validation readiness, and commercial deployment readiness.",
  readiness,
  gates,
  firstSlice: {
    companies: firstSlice.totals?.companies ?? null,
    openGaps: firstSlice.totals?.openGaps ?? null,
    readinessCounts: firstSlice.totals?.readinessCounts ?? {}
  },
  claims: {
    reviewApprovedPromotion: promotion.totals ?? {},
    currentManifestCounts: claimManifests
  },
  evals,
  groupExpansionGaps: groupData.records?.map((record) => ({
    groupId: record.groupId,
    gaps: record.gaps ?? []
  })).filter((record) => record.gaps.length > 0) ?? [],
  liveAnswerQuality,
  humanAnswerReview,
  documentation: {
    docsChecked,
    activeReadingPathCount
  },
  interpretation: {
    currentProductStage:
      liveAnswerQuality.status === "pass"
        ? "Stage 4 entry: live API connectivity and live answer-quality smoke checks pass, before expert-policy review and deployment hardening."
        : "Stage 3 complete / Stage 4 entry: multi-group source-backed research product beta, before live-answer-quality and deployment hardening.",
    arxivBoundary:
      "Ready for a bounded method/demo paper if framed as a traceable harness reconstruction and multi-group reference slice, not as commercial investment-advice validation.",
    sciBoundary:
      "Not yet SCI-complete. SCI should use this product as the implementation substrate and add stronger evaluation, monitoring, and failure analysis.",
    nextProductStep:
      "Run human expert review of actual UI answers and then close nonblocking expansion provenance gaps, especially SK unmatched URL records, Hyundai unmatched ledger records, and LG source-page-only records."
  }
};

await writeJson(outputPath, audit);
await writeText(docPath, renderDoc(audit));

console.log(`Product/paper readiness audit written: ${outputPath}`);
console.log(`Readable readiness note written: ${docPath}`);
console.log(`Product stage: ${audit.readiness.productStage}`);
console.log(`arXiv method/demo ready: ${audit.readiness.arxivReady ? "yes" : "no"}`);
console.log(`SCI ready: ${audit.readiness.sciReady ? "yes" : "no"}`);
console.log(`Commercial ready: ${audit.readiness.commercialReady ? "yes" : "no"}`);

if (!audit.readiness.arxivReady) process.exitCode = 1;

function classifyProductStage({ firstSlicePass, promotionPass, coreEvalPass, liveAnswerQualityPass }) {
  if (firstSlicePass && promotionPass && coreEvalPass && liveAnswerQualityPass) {
    return "stage-4-live-api-quality-smoke-passed-needs-expert-review";
  }
  if (firstSlicePass && promotionPass && coreEvalPass) {
    return "stage-3-complete-entering-stage-4-live-deployment-hardening";
  }
  if (firstSlicePass && promotionPass) return "stage-3-runtime-promotion-needs-eval-repair";
  if (firstSlicePass) return "stage-2-reference-slice-ready-needs-runtime-promotion";
  return "stage-1-reconstruction-in-progress";
}

function renderDoc(audit) {
  const lines = [
    "# Product and Paper Readiness Audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This note separates four questions that should not be merged:",
    "",
    "- Is the current product architecture structurally ready?",
    "- Is the bounded arXiv method/demo paper ready to draft from product evidence?",
    "- Is the later SCI validation paper ready?",
    "- Is the system commercially deployable?",
    "",
    "## Current Verdict",
    "",
    `- Product stage: \`${audit.readiness.productStage}\``,
    `- arXiv method/demo ready: ${audit.readiness.arxivReady ? "yes" : "no"}`,
    `- SCI validation ready: ${audit.readiness.sciReady ? "yes" : "no"}`,
    `- Commercial v1 ready: ${audit.readiness.commercialReady ? "yes" : "no"}`,
    `- Live answer-quality smoke passed: ${audit.readiness.liveAnswerQualityPass ? "yes" : "no"}`,
    "",
    "Interpretation: the product has passed the bounded multi-group source-backed research slice and the first live-answer smoke check. It still needs human expert review, monitoring, security policy, and deployment hardening before commercial deployment.",
    "",
    "## Gate Results",
    "",
    table(
      ["Gate", "Scope", "Status", "Finding"],
      audit.gates.map((gate) => [`\`${gate.id}\``, gate.scope, `\`${gate.status}\``, gate.finding])
    ),
    "",
    "## Product Evidence",
    "",
    `- First-slice companies: ${audit.firstSlice.companies}`,
    `- First-slice open readiness gaps: ${audit.firstSlice.openGaps}`,
    `- Review-approved promoted claims: ${audit.claims.reviewApprovedPromotion.promotedRecords}`,
    `- Group-level expansion cleanup gaps: ${audit.groupExpansionGaps.reduce((sum, record) => sum + record.gaps.length, 0)}`,
    `- Live answer-quality samples: ${audit.liveAnswerQuality.samples ?? "not run"}`,
    `- Live answer-quality blockers: ${audit.liveAnswerQuality.blockerSamples ?? "not run"}`,
    `- Live answer-quality average score: ${audit.liveAnswerQuality.averageScore ?? "not run"}`,
    `- Human answer-review packet samples: ${audit.humanAnswerReview.samples ?? "not generated"}`,
    `- Human answer-review status: ${audit.humanAnswerReview.status}`,
    "",
    "### Current Claim Counts",
    "",
    table(
      ["Group", "Source-backed claims", "Review-approved claims", "Companies represented"],
      Object.entries(audit.claims.currentManifestCounts).map(([groupId, counts]) => [
        `\`${groupId}\``,
        String(counts.records),
        String(counts.reviewApprovedRecords),
        String(counts.companies)
      ])
    ),
    "",
    "### Auto-Eval Baselines",
    "",
    table(
      ["Group", "Scenarios", "Average", "Paper baseline", "Required failures"],
      audit.evals.map((item) => [
        `\`${item.groupId}\``,
        String(item.scenarioCount),
        String(item.averageScore),
        `${item.paperBaselineCount}/${item.scenarioCount}`,
        String(item.requiredFailureCount)
      ])
    ),
    "",
    "## Nonblocking Expansion Gaps",
    "",
    audit.groupExpansionGaps.length === 0
      ? "- None."
      : audit.groupExpansionGaps.map((record) =>
          `- \`${record.groupId}\`: ${record.gaps.map((gap) => `${gap.severity}: ${gap.code ?? gap.type} (${gap.count})`).join("; ")}`
        ).join("\n"),
    "",
    "These gaps do not block the 25-company first slice, but they matter before claiming broader group coverage.",
    "",
    "## Paper Boundary",
    "",
    "The current evidence is enough for a bounded arXiv method/demo paper if the paper claims a traceable harness reconstruction, a controlled 25-company reference slice, source-backed claim promotion, and system-level validation. It is not yet enough to claim commercial investment-advice effectiveness, real-client operational performance, or full five-group narrative coverage.",
    "",
    "## Next Product Step",
    "",
    "The next product task should inspect actual UI answers with a human investment-research reviewer, then close nonblocking expansion provenance gaps in SK, Hyundai Motor, and LG. Deployment hardening should follow after visible answer policy is stable.",
    ""
  ];

  return `${lines.join("\n")}\n`;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function readJsonIfExists(relativePath) {
  const fullPath = join(rootDir, relativePath);
  if (!existsSync(fullPath)) return null;
  return JSON.parse(await readFile(fullPath, "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeText(relativePath, content) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, content, "utf8");
}

function safeReadGroup(relativePath) {
  try {
    const data = JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
    return data.groupId;
  } catch {
    return null;
  }
}

function summarizeLiveAnswerQuality(audit) {
  if (!audit) {
    return {
      status: "nonblocking-gap",
      finding: "Live answer-quality smoke has not been run yet.",
      samples: null,
      passSamples: null,
      warningSamples: null,
      blockerSamples: null,
      averageScore: null
    };
  }
  const summary = audit.summary ?? {};
  const blockerSamples = summary.blockerSamples ?? null;
  const samples = summary.samples ?? null;
  const passSamples = summary.passSamples ?? null;
  const warningSamples = summary.warningSamples ?? null;
  const averageScore = summary.averageScore ?? null;
  const status = blockerSamples === 0 && samples > 0 ? "pass" : "blocker";
  return {
    status,
    finding: status === "pass"
      ? `Live DART/KRX/Naver answer-quality smoke passed ${passSamples}/${samples} samples with ${warningSamples} warnings and average score ${averageScore}/100.`
      : `Live answer-quality smoke has ${blockerSamples} blocker samples across ${samples} samples.`,
    samples,
    passSamples,
    warningSamples,
    blockerSamples,
    averageScore,
    generatedAt: audit.generatedAt ?? null,
    docPath: "docs/88_live_answer_quality_audit.md",
    manifestPath: "raw/manifests/live-answer-quality-audit.json"
  };
}

function summarizeHumanAnswerReview(packet) {
  if (!packet) {
    return {
      status: "nonblocking-gap",
      finding: "Human answer-review packet has not been generated yet.",
      samples: null,
      averageAnswerLength: null,
      averageElapsedMs: null
    };
  }
  const summary = packet.summary ?? {};
  const samples = summary.samples ?? null;
  return {
    status: samples > 0 ? "review-pending" : "nonblocking-gap",
    finding: samples > 0
      ? `Human answer-review packet generated with ${samples} actual customer-facing samples. Human investment-research judgment is pending.`
      : "Human answer-review packet exists but has no samples.",
    samples,
    averageAnswerLength: summary.averageAnswerLength ?? null,
    averageElapsedMs: summary.averageElapsedMs ?? null,
    generatedAt: packet.generatedAt ?? null,
    docPath: "docs/89_human_answer_review_packet.md",
    manifestPath: "raw/manifests/human-answer-review-packet.json"
  };
}
