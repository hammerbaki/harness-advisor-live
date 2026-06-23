#!/usr/bin/env node
// Recompute the manuscript evaluation tables (A2-A4 + the prompt-only ablation
// McNemar test) deterministically from the committed result artifacts under
// evals/results/. This is what makes the manuscript tables reproducible rather
// than hand-transcribed: the numbers are derived here, in code, from the same
// JSON the paper cites.
//
// Usage:
//   node scripts/compute-paper-stats.mjs            # print Markdown + write JSON
//   node scripts/compute-paper-stats.mjs --json     # print JSON only
//   node scripts/compute-paper-stats.mjs --check    # recompute and fail (exit 1)
//                                                   # if it drifts from the
//                                                   # committed generated file
//
// No npm install required: pure node: builtins.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const resultsDir = join(repoRoot, "evals", "results");

const LIVE_LLM_FILE = "live-llm-composition-boundary.full-30x3.2026-06-03.json";
const ABLATION_FILES = {
  "prompt-only-30x3": "ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json",
  adversarial: "ablation-adversarial.c0-vs-c3.2026-06-13.json"
};
const GENERATED_FILE = join(resultsDir, "paper-stats.generated.json");

// --- statistics helpers ---------------------------------------------------

// Wilson score interval for a binomial proportion.
function wilson(successes, n, z = 1.959963984540054) {
  if (n === 0) return { low: 0, high: 0 };
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n))) / denom;
  return { low: center - half, high: center + half };
}

// Lanczos approximation of ln(Gamma(x)).
function lnGamma(x) {
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  }
  x -= 1;
  let a = c[0];
  const t = x + g + 0.5;
  for (let i = 1; i < g + 2; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

// Regularized lower incomplete gamma P(a, x) (series + continued fraction).
function regularizedGammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) {
    let term = 1 / a;
    let sum = term;
    for (let n = 1; n < 500; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - lnGamma(a));
  }
  // continued fraction for Q(a,x), then P = 1 - Q
  let b = x + 1 - a;
  let c = 1e300;
  let d = 1 / b;
  let h = d;
  for (let i = 1; i < 500; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b;
    if (Math.abs(d) < 1e-300) d = 1e-300;
    c = b + an / c;
    if (Math.abs(c) < 1e-300) c = 1e-300;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  const q = Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
  return 1 - q;
}

// Upper-tail p-value for a chi-square statistic with df degrees of freedom.
function chiSquarePValue(stat, df) {
  if (stat <= 0) return 1;
  return 1 - regularizedGammaP(df / 2, stat / 2);
}

function round(x, places = 1) {
  const f = 10 ** places;
  return Math.round(x * f) / f;
}

// --- data loading ---------------------------------------------------------

function load(file) {
  return JSON.parse(readFileSync(join(resultsDir, file), "utf8"));
}

function checkPassed(run, id) {
  const c = (run.checks ?? []).find((entry) => entry.id === id);
  return c ? c.passed === true : null;
}

// --- Table A2: per-model contract outcomes + chi-square -------------------

function tableA2(live) {
  const models = live.providers.map((p) => {
    const n = p.plannedRuns;
    const finalPass = p.contractPassRuns;
    const ci = wilson(finalPass, n);
    return {
      model: p.requestedModel,
      n,
      firstPassLive: p.liveValidatedRuns,
      fallbackUsed: p.fallbackRuns,
      finalPass,
      finalPassRate: round((finalPass / n) * 100, 1),
      ci95: [round(ci.low * 100, 1), round(ci.high * 100, 1)]
    };
  });

  const n = models.reduce((s, m) => s + m.n, 0);
  const pass = models.reduce((s, m) => s + m.finalPass, 0);
  const pooled = {
    n,
    firstPassLive: models.reduce((s, m) => s + m.firstPassLive, 0),
    fallbackUsed: models.reduce((s, m) => s + m.fallbackUsed, 0),
    finalPass: pass,
    finalPassRate: round((pass / n) * 100, 1),
    ci95: (() => {
      const ci = wilson(pass, n);
      return [round(ci.low * 100, 1), round(ci.high * 100, 1)];
    })()
  };

  // 2 x k chi-square: rows {pass, fail}, columns = models.
  const totalPass = pass;
  const totalFail = n - pass;
  let chi2 = 0;
  for (const m of models) {
    const cells = [
      { obs: m.finalPass, exp: (m.n * totalPass) / n },
      { obs: m.n - m.finalPass, exp: (m.n * totalFail) / n }
    ];
    for (const { obs, exp } of cells) {
      if (exp > 0) chi2 += ((obs - exp) ** 2) / exp;
    }
  }
  const df = models.length - 1;
  return {
    models,
    pooled,
    chiSquare: { statistic: round(chi2, 2), df, pValue: chiSquarePValue(chi2, df) }
  };
}

// --- Table A3: inter-repeat consistency -----------------------------------

function tableA3(live) {
  const perModel = live.providers.map((p) => {
    const byScenario = new Map();
    for (const run of p.runs) {
      const verdict = run.status === "contract_pass";
      if (!byScenario.has(run.scenarioId)) byScenario.set(run.scenarioId, []);
      byScenario.get(run.scenarioId).push(verdict);
    }
    let unanimous = 0;
    for (const verdicts of byScenario.values()) {
      if (verdicts.every((v) => v === verdicts[0])) unanimous += 1;
    }
    const scenarios = byScenario.size;
    return {
      model: p.requestedModel,
      scenarios,
      unanimous,
      consistency: round((unanimous / scenarios) * 100, 1)
    };
  });
  const scenarios = perModel.reduce((s, m) => s + m.scenarios, 0);
  const unanimous = perModel.reduce((s, m) => s + m.unanimous, 0);
  return {
    perModel,
    overall: { scenarios, unanimous, consistency: round((unanimous / scenarios) * 100, 1) }
  };
}

// --- Table A4: per-check failure decomposition ----------------------------

const ENFORCER = {
  recommendation_language_absence: "Harness (language validator + finalizer)",
  development_leak_absence: "Harness (leakage regex filter)",
  source_link_package: "Harness (assembly)",
  trace_contract: "Harness (trace envelope)",
  followup_quality: "Harness (generation)",
  source_claim_references: "LLM-composed output",
  visible_answer_structure: "LLM-composed output",
  live_llm_output_contract: "LLM-composed output"
};

function tableA4(live) {
  const total = live.summary.plannedRuns;
  const checks = Object.entries(live.summary.byCheck).map(([id, v]) => ({
    check: id,
    enforcedBy: ENFORCER[id] ?? "unknown",
    failures: v.failed,
    total
  }));
  // Harness-enforced checks first (the central result), then LLM-composed.
  checks.sort((a, b) => {
    const ah = a.enforcedBy.startsWith("Harness") ? 0 : 1;
    const bh = b.enforcedBy.startsWith("Harness") ? 0 : 1;
    return ah - bh || a.failures - b.failures;
  });
  return checks;
}

// --- McNemar: prompt-only ablation (c0) vs full harness (c3) ---------------

function mcNemar(file, checkId) {
  const data = load(file);
  const byKey = new Map();
  for (const p of data.providers) {
    for (const run of p.runs) {
      const key = `${run.requestedModel}::${run.scenarioId}::${run.repeatIndex}`;
      if (!byKey.has(key)) byKey.set(key, {});
      byKey.get(key)[run.ablation] = checkPassed(run, checkId);
    }
  }
  let harnessPassPromptFail = 0; // b: harness passes, prompt-only fails
  let harnessFailPromptPass = 0; // c
  let pairs = 0;
  let bothPass = 0;
  let bothFail = 0;
  for (const cell of byKey.values()) {
    const harness = cell.harness;
    const prompt = cell["prompt-only"];
    if (harness == null || prompt == null) continue;
    pairs += 1;
    if (harness && !prompt) harnessPassPromptFail += 1;
    else if (!harness && prompt) harnessFailPromptPass += 1;
    else if (harness && prompt) bothPass += 1;
    else bothFail += 1;
  }
  const b = harnessPassPromptFail;
  const c = harnessFailPromptPass;
  const stat = b + c > 0 ? ((Math.abs(b - c) - 1) ** 2) / (b + c) : 0; // continuity-corrected
  return {
    check: checkId,
    pairs,
    bothPass,
    bothFail,
    harnessPassPromptFail: b,
    harnessFailPromptPass: c,
    statistic: round(stat, 2),
    df: 1,
    pValue: chiSquarePValue(stat, 1)
  };
}

// --- assemble -------------------------------------------------------------

function fmtP(p) {
  if (p < 0.001) return "<0.001";
  if (p < 0.01) return `${round(p, 4)} (<0.01)`;
  return String(round(p, 4));
}

function buildReport() {
  const live = load(LIVE_LLM_FILE);
  const a2 = tableA2(live);
  const a3 = tableA3(live);
  const a4 = tableA4(live);
  const ablation = {};
  for (const [label, file] of Object.entries(ABLATION_FILES)) {
    ablation[label] = {
      recommendation_language_absence: mcNemar(file, "recommendation_language_absence"),
      development_leak_absence: mcNemar(file, "development_leak_absence")
    };
  }
  return {
    schemaVersion: "paper-stats.generated.v1",
    source: {
      liveLLM: LIVE_LLM_FILE,
      ablation: ABLATION_FILES
    },
    tableA2: a2,
    tableA3: a3,
    tableA4: a4,
    ablationMcNemar: ablation
  };
}

function renderMarkdown(r) {
  const lines = [];
  lines.push("# Manuscript statistics (generated)\n");
  lines.push(
    "Regenerate with `node scripts/compute-paper-stats.mjs`. Do not hand-edit; " +
      "these numbers are derived from the committed result artifacts.\n"
  );

  lines.push("## Table A2 — Live-LLM composition-boundary: per-model contract outcomes\n");
  lines.push("| Requested model | n | First-pass live | Fallback used | Final pass | Final pass rate | 95% CI (Wilson) |");
  lines.push("|---|---:|---:|---:|---:|---:|---|");
  for (const m of r.tableA2.models) {
    lines.push(
      `| \`${m.model}\` | ${m.n} | ${m.firstPassLive} | ${m.fallbackUsed} | ${m.finalPass} | ${m.finalPassRate}% | [${m.ci95[0]}, ${m.ci95[1]}] |`
    );
  }
  const pooled = r.tableA2.pooled;
  lines.push(
    `| **Pooled** | **${pooled.n}** | **${pooled.firstPassLive}** | **${pooled.fallbackUsed}** | **${pooled.finalPass}** | **${pooled.finalPassRate}%** | **[${pooled.ci95[0]}, ${pooled.ci95[1]}]** |`
  );
  const x = r.tableA2.chiSquare;
  lines.push(`\nPearson χ²(${x.df}, N = ${pooled.n}) = ${x.statistic}, p = ${fmtP(x.pValue)} (final contract pass vs. model).\n`);

  lines.push("## Table A3 — Inter-repeat consistency\n");
  lines.push("| Requested model | Scenarios | Unanimous across 3 repeats | Consistency |");
  lines.push("|---|---:|---:|---:|");
  for (const m of r.tableA3.perModel) {
    lines.push(`| \`${m.model}\` | ${m.scenarios} | ${m.unanimous} | ${m.consistency}% |`);
  }
  const ov = r.tableA3.overall;
  lines.push(`| **Overall** | **${ov.scenarios}** | **${ov.unanimous}** | **${ov.consistency}%** |\n`);

  lines.push("## Table A4 — Per-contract-check failure decomposition\n");
  lines.push("| Required contract check | Enforced by | Failures / total |");
  lines.push("|---|---|---:|");
  for (const c of r.tableA4) {
    lines.push(`| \`${c.check}\` | ${c.enforcedBy} | ${c.failures} / ${c.total} |`);
  }
  lines.push("");

  lines.push("## Prompt-only ablation — McNemar test (full harness c3 vs. prompt-only c0)\n");
  lines.push("| Scenario set | Contract check | Pairs | harness✓/prompt✗ (b) | harness✗/prompt✓ (c) | McNemar χ²(1) | p |");
  lines.push("|---|---|---:|---:|---:|---:|---|");
  for (const [label, checks] of Object.entries(r.ablationMcNemar)) {
    for (const c of Object.values(checks)) {
      lines.push(
        `| ${label} | \`${c.check}\` | ${c.pairs} | ${c.harnessPassPromptFail} | ${c.harnessFailPromptPass} | ${c.statistic} | ${fmtP(c.pValue)} |`
      );
    }
  }
  lines.push("");
  return lines.join("\n");
}

// Stable stringify (sorted keys) so --check diffs are order-independent.
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function main() {
  const args = process.argv.slice(2);
  const report = buildReport();

  if (args.includes("--check")) {
    let committed;
    try {
      committed = JSON.parse(readFileSync(GENERATED_FILE, "utf8"));
    } catch {
      console.error(`[paper-stats] missing ${GENERATED_FILE}; run without --check to generate it.`);
      process.exit(1);
    }
    // Compare on the computed bodies only (ignore a possible generatedAt stamp).
    const a = stableStringify({ ...report, generatedAt: undefined });
    const b = stableStringify({ ...committed, generatedAt: undefined });
    if (a !== b) {
      console.error("[paper-stats] DRIFT: recomputed statistics differ from committed paper-stats.generated.json");
      console.error("[paper-stats] regenerate with: node scripts/compute-paper-stats.mjs");
      process.exit(1);
    }
    console.log("[paper-stats] OK: committed statistics match recomputation from result artifacts.");
    return;
  }

  if (args.includes("--json")) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  writeFileSync(GENERATED_FILE, `${JSON.stringify(report, null, 2)}\n`);
  console.log(renderMarkdown(report));
  console.error(`\n[paper-stats] wrote ${GENERATED_FILE}`);
}

main();
