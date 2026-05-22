import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const resultPath =
  process.env.AGENT_QUALITY_RESULT ??
  "evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json";
const outputPath =
  process.env.AGENT_QUALITY_OUT ??
  "evals/dashboard/agent-dog.paper-seed.2026-05-02.json";

const evaluation = await readJson(resultPath);
const checkStats = aggregateChecks(evaluation.results ?? []);
const currentKpis = [
  kpiFromCheck("source_grounding_coverage", "Source-backed claim coverage", checkStats.expected_claim_coverage),
  kpiFromCheck("trace_contract_integrity", "Trace contract integrity", checkStats.trace_contract),
  kpiFromChecks("investor_answer_quality", "Investor-facing answer quality", [
    checkStats.investor_facing_answer,
    checkStats.briefing_quality,
    checkStats.template_variation
  ]),
  kpiFromChecks("customer_ui_safety", "Customer UI safety", [
    checkStats.development_leak_absence,
    checkStats.followup_quality,
    checkStats.original_poc_regression_guards
  ]),
  kpiFromCheck("latency_budget", "Latency budget", checkStats.latency_budget)
];

const dashboardSeed = {
  schemaVersion: "agent-quality-dashboard-seed.v0.1",
  productName: "Agent Dog",
  generatedAt: new Date().toISOString(),
  stage: "paper-static-report",
  sourceResultPath: resultPath,
  sourceScenarioSetId: evaluation.scenarioSetId,
  groupId: evaluation.groupId,
  rubricId: evaluation.rubricId,
  decision:
    "Use this as a static paper-quality report now; build the interactive operations dashboard during SCI/client-operation phase.",
  evaluationBoundary: {
    currentPaper:
      "Report system-level trace/rubric metrics only; do not claim production RAG monitoring or investor usefulness.",
    sciStage:
      "Evaluate operational quality with RAG, trace, finance, freshness, latency, and fallback metrics rather than subjective investment-opinion ratings.",
    excludedAsCoreMetrics: [
      "investor_usefulness_rating",
      "user_trust_rating",
      "investment_decision_improvement",
      "commercial_conversion"
    ]
  },
  currentPaperKpis: currentKpis,
  plannedRagasKpis: [
    plannedRagasMetric("faithfulness", "Faithfulness", "Answer claims are supported by retrieved/source context."),
    plannedRagasMetric("answer_relevance", "Response Relevancy", "Answer directly addresses the user question."),
    plannedRagasMetric("context_precision", "Context Precision", "Useful retrieved contexts are ranked ahead of less useful contexts."),
    plannedRagasMetric("context_recall", "Context Recall", "Retrieved contexts contain the evidence needed to answer.")
  ],
  financeSpecificKpis: [
    "source_backed_claim_coverage",
    "numeric_consistency",
    "source_freshness_or_staleness",
    "live_fallback_fixture_local_ratio",
    "prohibited_investment_recommendation_phrase_absence",
    "developer_trace_leak_absence",
    "customer_followup_quality",
    "latency_and_cost"
  ],
  visualizations: {
    paperStage: [
      "summary_kpi_cards",
      "scenario_score_table",
      "required_failure_count",
      "trace_status_distribution"
    ],
    sciStage: [
      "weekly_quality_line_chart",
      "ragas_radar_chart",
      "pass_warning_fail_donut",
      "faithfulness_relevance_scatter",
      "domain_and_group_filterable_log_table"
    ]
  },
  scenarioRows: (evaluation.results ?? []).map((result) => ({
    scenarioId: result.scenarioId,
    title: result.title,
    groupId: evaluation.groupId,
    paperTableBucket: result.paperTableBucket,
    score: result.score,
    status: result.status,
    elapsedMs: result.elapsedMs,
    runtimeMode: result.runtimeMode,
    responseMode: result.responseMode,
    traceFile: result.traceFile,
    normalizedChecks: Object.fromEntries(
      (result.checks ?? []).map((check) => [
        check.id,
        {
          score: round(check.weight ? check.score / check.weight : 0),
          passed: check.passed,
          required: check.required
        }
      ])
    )
  })),
  thresholds: {
    pass: 0.8,
    warning: 0.6,
    paperBaselineScore: evaluation.thresholds?.paperBaseline ?? 90,
    keepCandidateScore: evaluation.thresholds?.keepCandidate ?? 92
  },
  evidenceSources: [
    {
      label: "Ragas available metrics",
      url: "https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/",
      use: "Confirms RAG metrics and agent/tool-use metric families."
    },
    {
      label: "Local advisor auto-eval result",
      path: resultPath,
      use: "Current paper-stage source for trace-backed KPI cards."
    }
  ],
  nonGoalsForPaperStage: [
    "Do not claim longitudinal production monitoring before client-operation logs exist.",
    "Do not report Ragas scores before retrieved contexts, references, questions, and answers are stored in a Ragas-compatible dataset.",
    "Do not expose developer trace or raw claim IDs in the investor-facing product UI.",
    "Do not use subjective investor usefulness ratings as paper-stage or core SCI-stage evidence."
  ]
};

await writeJson(outputPath, dashboardSeed);
console.log(`Agent quality dashboard seed written: ${outputPath}`);
console.log(`${currentKpis.length} paper KPI card(s), ${dashboardSeed.scenarioRows.length} scenario row(s).`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function aggregateChecks(results) {
  const output = {};
  for (const result of results) {
    for (const check of result.checks ?? []) {
      output[check.id] ??= { count: 0, passed: 0, scoreSum: 0 };
      output[check.id].id = check.id;
      output[check.id].count += 1;
      output[check.id].passed += check.passed ? 1 : 0;
      output[check.id].scoreSum += check.weight ? check.score / check.weight : 0;
    }
  }
  for (const stat of Object.values(output)) {
    stat.score = stat.count ? round(stat.scoreSum / stat.count) : 0;
    stat.passRate = stat.count ? round(stat.passed / stat.count) : 0;
    stat.status = statusFor(stat.score);
  }
  return output;
}

function kpiFromCheck(id, label, stat = { score: 0, passRate: 0, status: "missing", count: 0 }) {
  return {
    id,
    label,
    score: stat.score,
    status: stat.status,
    passRate: stat.passRate,
    sampleCount: stat.count,
    periodDelta: null,
    periodDeltaReason: "No previous weekly production period exists in the paper-stage baseline."
  };
}

function kpiFromChecks(id, label, stats) {
  const present = stats.filter(Boolean);
  if (present.length === 0) return kpiFromCheck(id, label);
  const score = round(present.reduce((sum, stat) => sum + stat.score, 0) / present.length);
  const passRate = round(present.reduce((sum, stat) => sum + stat.passRate, 0) / present.length);
  return {
    id,
    label,
    score,
    status: statusFor(score),
    passRate,
    sampleCount: Math.max(...present.map((stat) => stat.count)),
    periodDelta: null,
    periodDeltaReason: "No previous weekly production period exists in the paper-stage baseline.",
    composedFrom: present.map((stat) => stat.id).filter(Boolean)
  };
}

function plannedRagasMetric(id, label, definition) {
  return {
    id,
    label,
    definition,
    status: "planned_for_sci_or_live_rag_eval",
    score: null,
    reason:
      "Requires stored question, answer, retrieved contexts, and reference/evidence fields from live or evaluation runs."
  };
}

function statusFor(score) {
  if (score >= 0.8) return "pass";
  if (score >= 0.6) return "warning";
  return "fail";
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
