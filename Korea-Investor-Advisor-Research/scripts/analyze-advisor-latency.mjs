import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultInputs = [
  "evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json",
  "evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json"
];
const inputPaths = (process.env.ADVISOR_LATENCY_INPUTS ?? defaultInputs.join(","))
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const outputPath = process.env.ADVISOR_LATENCY_OUT ?? "evals/dashboard/advisor-latency-baseline.2026-05-03.json";
const latencyBudgetMs = Number(process.env.ADVISOR_LATENCY_BUDGET_MS ?? 1500);

const scenarioRows = [];
const stepRows = [];

for (const inputPath of inputPaths) {
  const result = await readJson(inputPath);
  for (const row of result.results ?? []) {
    const tracePath = row.traceFile;
    let processTrace = [];
    if (tracePath) {
      const trace = await readJson(tracePath);
      processTrace = trace.response?.processTrace ?? [];
    }
    scenarioRows.push({
      inputPath,
      groupId: result.groupId,
      scenarioId: row.scenarioId,
      score: row.score,
      elapsedMs: row.elapsedMs,
      latencyPassed: row.elapsedMs <= latencyBudgetMs,
      runtimeMode: row.runtimeMode,
      responseMode: row.responseMode
    });
    for (const step of processTrace) {
      stepRows.push({
        groupId: result.groupId,
        scenarioId: row.scenarioId,
        label: step.label,
        status: step.status,
        source: step.source,
        elapsedMs: step.elapsedMs
      });
    }
  }
}

const report = {
  schemaVersion: "advisor-latency-report.v0.1",
  generatedAt: new Date().toISOString(),
  latencyBudgetMs,
  inputs: inputPaths,
  summary: summarizeScenarios(scenarioRows),
  byGroup: groupBy(scenarioRows, "groupId", summarizeScenarios),
  byStep: groupBy(stepRows, "label", summarizeSteps),
  byGroupStep: summarizeGroupSteps(stepRows),
  slowestScenarios: [...scenarioRows]
    .sort((a, b) => b.elapsedMs - a.elapsedMs)
    .slice(0, 10),
  interpretation: [
    "This report measures harness/runtime latency, not investment accuracy.",
    "External sources and local context loading should be parallelized before live LLM composition becomes default.",
    "A scenario can pass source/trace/answer quality while still failing the product latency budget."
  ]
};

await writeJson(outputPath, report);

console.log(`Advisor latency report written: ${outputPath}`);
console.log(`Scenarios: ${report.summary.count}`);
console.log(`Average latency: ${report.summary.averageMs}ms`);
console.log(`Latency budget pass: ${report.summary.latencyPassCount}/${report.summary.count}`);
console.log(`Slowest step: ${report.byStep[0]?.key ?? "none"} ${report.byStep[0]?.averageMs ?? 0}ms avg`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function summarizeScenarios(rows) {
  const elapsed = rows.map((row) => Number(row.elapsedMs ?? 0)).filter(Number.isFinite);
  return {
    count: rows.length,
    averageMs: round(mean(elapsed)),
    medianMs: round(percentile(elapsed, 0.5)),
    p90Ms: round(percentile(elapsed, 0.9)),
    maxMs: Math.max(...elapsed, 0),
    latencyPassCount: rows.filter((row) => row.latencyPassed).length,
    latencyPassRate: rows.length > 0 ? round(rows.filter((row) => row.latencyPassed).length / rows.length, 3) : 0,
    averageScore: rows.length > 0 ? round(mean(rows.map((row) => row.score))) : 0
  };
}

function summarizeSteps(rows) {
  const elapsed = rows.map((row) => Number(row.elapsedMs ?? 0)).filter(Number.isFinite);
  const statuses = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  return {
    count: rows.length,
    averageMs: round(mean(elapsed)),
    medianMs: round(percentile(elapsed, 0.5)),
    p90Ms: round(percentile(elapsed, 0.9)),
    maxMs: Math.max(...elapsed, 0),
    statuses
  };
}

function summarizeGroupSteps(rows) {
  const keys = new Map();
  for (const row of rows) {
    const key = `${row.groupId}:${row.label}`;
    if (!keys.has(key)) keys.set(key, []);
    keys.get(key).push(row);
  }
  return [...keys.entries()]
    .map(([key, items]) => ({ key, ...summarizeSteps(items) }))
    .sort((a, b) => b.averageMs - a.averageMs);
}

function groupBy(rows, field, summarize) {
  const groups = new Map();
  for (const row of rows) {
    const key = String(row[field] ?? "unknown");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }
  return [...groups.entries()]
    .map(([key, items]) => ({ key, ...summarize(items) }))
    .sort((a, b) => b.averageMs - a.averageMs);
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(Number(value ?? 0) * factor) / factor;
}
