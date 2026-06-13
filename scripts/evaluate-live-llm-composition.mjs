import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const today = process.env.ADVISOR_LIVE_LLM_EVAL_DATE ?? new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul"
}).format(new Date());
const providerSpecs = parseRunSpecs(
  process.env.ADVISOR_LIVE_LLM_RUNS ??
  "openrouter:anthropic/claude-sonnet-4,openrouter:openai/gpt-4.1-mini,openrouter:google/gemini-2.5-flash"
);
const temperatures = parseNumberCsv(process.env.ADVISOR_LIVE_LLM_TEMPERATURES ?? "0.2");
const repeatCount = parsePositiveInt(process.env.ADVISOR_LIVE_LLM_REPEATS ?? "1", 1);
const scenarioPolicy = normalizeScenarioPolicy(process.env.ADVISOR_LIVE_LLM_SCENARIO_POLICY ?? "representative");
// Ablation conditions (prompt-only ablation). Default "harness" reproduces the
// original composition-boundary run unchanged; add "prompt-only" for the C0-vs-C3
// counterfactual, e.g. ADVISOR_LIVE_LLM_ABLATIONS=harness,prompt-only.
const ablations = parseCsv(process.env.ADVISOR_LIVE_LLM_ABLATIONS ?? "harness")
  .map((value) => (["prompt-only", "promptonly", "c3"].includes(value.toLowerCase()) ? "prompt-only" : "harness"));
const runSpecs = providerSpecs.flatMap((providerSpec) =>
  temperatures.flatMap((temperature) =>
    ablations.map((ablation) => ({ ...providerSpec, temperature, ablation }))
  )
);
const defaultScenarioSpecs = [
  { groupId: "samsung", path: "evals/scenarios/samsung.reference-slice.json" },
  { groupId: "sk", path: "evals/scenarios/sk.reference-slice.json" },
  { groupId: "hyundai-motor", path: "evals/scenarios/hyundai-motor.reference-slice.json" },
  { groupId: "lg", path: "evals/scenarios/lg.reference-slice.json" },
  { groupId: "hanwha", path: "evals/scenarios/hanwha.reference-slice.json" }
];
// Override the scenario set list with ADVISOR_LIVE_LLM_SCENARIO_SETS, a CSV of
// groupId:path pairs (e.g. for the adversarial-stress run). Defaults to the
// canonical five reference slices, so existing runs are unchanged.
const scenarioSpecs = parseScenarioSets(process.env.ADVISOR_LIVE_LLM_SCENARIO_SETS) ?? defaultScenarioSpecs;

const scenarioSets = await Promise.all(scenarioSpecs.map(async (spec) => ({
  ...spec,
  data: await readJson(spec.path)
})));
const selectedScenarioIds = parseCsv(process.env.ADVISOR_LIVE_LLM_SCENARIO_IDS ?? "");
const scenarios = selectScenarios(scenarioSets, selectedScenarioIds, scenarioPolicy);
const providerResults = [];
const outputPath =
  process.env.ADVISOR_LIVE_LLM_OUTPUT ??
  `evals/results/live-llm-composition-boundary.${today}.json`;
const progressLogPath =
  process.env.ADVISOR_LIVE_LLM_PROGRESS_LOG ??
  replaceJsonExtension(outputPath, ".progress.jsonl");
const progressSnapshotPath =
  process.env.ADVISOR_LIVE_LLM_PROGRESS_SNAPSHOT ??
  replaceJsonExtension(outputPath, ".progress.json");
const progressEvery = parsePositiveInt(process.env.ADVISOR_LIVE_LLM_PROGRESS_EVERY ?? "1", 1);
const startedAt = new Date().toISOString();
const totalPlannedRuns = runSpecs.length * scenarios.length * repeatCount;
const completedRuns = [];
await resetJsonLineLog(progressLogPath);
await appendJsonLine(progressLogPath, buildExperimentProgressRecord("experiment_start", "started"));
await writeProgressSnapshot({ status: "started" });

for (const [runIndex, runSpec] of runSpecs.entries()) {
  const server = await getAdvisorServer(runSpec, 8830 + runIndex);
  try {
    const runs = [];
    for (let repeatIndex = 1; repeatIndex <= repeatCount; repeatIndex += 1) {
      for (const item of scenarios) {
        const runNumber = completedRuns.length + 1;
        const startRecord = buildProgressStartRecord(runSpec, item, repeatIndex, runNumber);
        await appendJsonLine(progressLogPath, startRecord);
        await writeProgressSnapshot({ status: "running", currentRun: startRecord });
        try {
          const response = await callAdvisor(server.baseUrl, {
            groupId: item.groupId,
            question: item.scenario.question,
            presentationMode: item.scenarioSet.runtimeAssumptions.presentationMode ?? "text",
            ablation: runSpec.ablation
          });
          const evaluatedRun = evaluateLiveRun(runSpec, item, response, repeatIndex);
          runs.push(evaluatedRun);
          completedRuns.push(evaluatedRun);
          const completeRecord = buildProgressCompleteRecord(evaluatedRun, completedRuns.length);
          await appendJsonLine(progressLogPath, completeRecord);
          if (completedRuns.length % progressEvery === 0 || completedRuns.length === totalPlannedRuns) {
            await writeProgressSnapshot({ status: "running", currentRun: completeRecord });
          }
          logProgressRun(completeRecord);
        } catch (error) {
          const errorRecord = buildProgressErrorRecord(runSpec, item, repeatIndex, error, runNumber);
          await appendJsonLine(progressLogPath, errorRecord);
          await writeProgressSnapshot({ status: "error", currentRun: errorRecord, error });
          throw error;
        }
      }
    }
    providerResults.push(summarizeProvider(runSpec, runs));
  } finally {
    await server.stop();
  }
}

const summary = summarizeExperiment(providerResults);
const output = {
  schemaVersion: "advisor-live-llm-composition-eval.v0.2",
  experimentId: "live-llm-composition-boundary-v0.2",
  evaluatedAt: new Date().toISOString(),
  baselineDate: today,
  purpose: "Check whether live LLM composition can be attached at the answer-composition boundary while preserving the same source, answer, trace, leakage, link, and follow-up contracts used by the deterministic baseline.",
  design: {
    providerSpecs,
    temperatures,
    ablations,
    repeatCount,
    scenarioPolicy: selectedScenarioIds.length > 0
      ? "explicit scenario id subset"
      : scenarioPolicy === "all"
        ? "full fixed validation scenario set"
        : "one representative fixed validation scenario per corporate group",
    scenarioCount: scenarios.length,
    totalPlannedRuns: runSpecs.length * scenarios.length * repeatCount,
    contractFocus: [
      "live LLM output-contract validation",
      "expected source-backed claim references",
      "trace envelope and answer-assembly completeness",
      "visible Korean answer structure",
      "development-leakage absence",
      "source-link package validity",
      "follow-up question quality",
      "recommendation-language absence"
    ]
  },
  summary,
  providers: providerResults
};

await writeJson(outputPath, output);
await appendJsonLine(progressLogPath, buildExperimentProgressRecord("experiment_complete", "complete"));
await writeProgressSnapshot({ status: "complete" });

console.log("Live LLM composition-boundary evaluation complete");
console.log(`Runs: ${runSpecs.map((spec) => spec.model ? `${spec.provider}:${spec.model}@T${spec.temperature}` : `${spec.provider}@T${spec.temperature}`).join(", ")}`);
console.log(`Scenarios: ${scenarios.length}`);
console.log(`Repeats: ${repeatCount}`);
console.log(`Planned runs: ${summary.plannedRuns}`);
console.log(`Live validated runs: ${summary.liveValidatedRuns}/${summary.plannedRuns}`);
console.log(`Contract-pass live runs: ${summary.contractPassLiveRuns}/${summary.plannedRuns}`);
console.log(`Fallback/recovery runs: ${summary.fallbackRuns}`);
console.log(`Missing-credential runs: ${summary.missingCredentialRuns}`);
console.log(`Result: ${outputPath}`);
console.log(`Progress log: ${progressLogPath}`);
console.log(`Progress snapshot: ${progressSnapshotPath}`);

if ((summary.liveValidatedRuns === 0 || summary.contractFailures > 0) && process.env.ADVISOR_LIVE_LLM_ALLOW_FAILURES !== "1") {
  process.exitCode = 1;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

async function appendJsonLine(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await appendFile(fullPath, `${JSON.stringify(data)}\n`);
}

async function resetJsonLineLog(relativePath) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, "");
}

function replaceJsonExtension(relativePath, replacement) {
  return String(relativePath).endsWith(".json")
    ? String(relativePath).replace(/\.json$/u, replacement)
    : `${relativePath}${replacement}`;
}

function parseCsv(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

// Parse ADVISOR_LIVE_LLM_SCENARIO_SETS: "groupId:path,groupId:path". Returns
// null when unset so the default scenario specs are used.
function parseScenarioSets(value) {
  const entries = parseCsv(value);
  if (entries.length === 0) return null;
  return entries.map((entry) => {
    const idx = entry.indexOf(":");
    if (idx < 0) throw new Error(`Invalid scenario set '${entry}'; expected groupId:path`);
    return { groupId: entry.slice(0, idx).trim(), path: entry.slice(idx + 1).trim() };
  });
}

function parseNumberCsv(value) {
  const values = parseCsv(value)
    .map((item) => Number.parseFloat(item))
    .filter((item) => Number.isFinite(item));
  return values.length > 0 ? values : [0.2];
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseRunSpecs(value) {
  return parseCsv(value).map((item) => {
    const separator = item.indexOf(":");
    if (separator === -1) return { provider: item, model: null };
    return {
      provider: item.slice(0, separator).trim(),
      model: item.slice(separator + 1).trim() || null
    };
  });
}

function normalizeScenarioPolicy(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["all", "full", "full-set", "full_scenario_set"].includes(normalized)) return "all";
  return "representative";
}

function selectScenarios(sets, explicitIds, policy) {
  const explicit = new Set(explicitIds);
  const selected = [];
  const matchedExplicit = new Set();
  for (const scenarioSet of sets) {
    const candidates = Array.isArray(scenarioSet.data.scenarios) ? scenarioSet.data.scenarios : [];
    const scenariosForSet = explicit.size > 0
      ? candidates.filter((candidate) => explicit.has(candidate.id))
      : policy === "all"
        ? candidates
        : candidates.slice(0, 1);
    for (const scenario of scenariosForSet) {
      if (explicit.has(scenario.id)) matchedExplicit.add(scenario.id);
      selected.push({
        groupId: scenarioSet.groupId,
        scenarioSetId: scenarioSet.data.scenarioSetId,
        scenarioSet: scenarioSet.data,
        scenario
      });
    }
  }
  if (explicit.size > 0) {
    const missing = [...explicit].filter((id) => !matchedExplicit.has(id));
    if (missing.length > 0) throw new Error(`No selected scenario found for explicit ids: ${missing.join(", ")}`);
  }
  if (selected.length === 0) {
    throw new Error("No live-LLM scenarios selected.");
  }
  return selected;
}

async function getAdvisorServer(runSpec, port) {
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      STATIC_DIR: "",
      ADVISOR_LIVE_LLM_PROVIDER: runSpec.provider,
      ADVISOR_LIVE_LLM_TEMPERATURE: String(runSpec.temperature),
      ...(runSpec.model ? { ADVISOR_LIVE_LLM_MODEL: runSpec.model } : {})
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
  const logs = [];
  child.stdout.on("data", (chunk) => logs.push(String(chunk)));
  child.stderr.on("data", (chunk) => logs.push(String(chunk)));

  try {
    await waitForHealth(baseUrl, logs);
  } catch (error) {
    child.kill();
    throw error;
  }

  return {
    baseUrl,
    stop: async () => {
      if (!child.killed) child.kill();
    }
  };
}

async function waitForHealth(baseUrl, logs) {
  const startedAt = Date.now();
  let lastError = "";
  while (Date.now() - startedAt < 8000) {
    try {
      const res = await fetch(`${baseUrl}/api/healthz`);
      if (res.ok) return;
      lastError = `HTTP ${res.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await delay(150);
  }
  throw new Error(`Advisor server did not become healthy: ${lastError}\n${logs.join("")}`);
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

async function callAdvisor(baseUrl, body) {
  const res = await fetch(`${baseUrl}/api/advisor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Advisor API failed (${res.status}): ${text.slice(0, 500)}`);
  }
  return res.json();
}

function evaluateLiveRun(runSpec, item, response, repeatIndex) {
  const checks = [
    checkLiveContract(runSpec, response),
    checkExpectedClaimCoverage(item.scenario, response),
    checkTraceContract(item.scenarioSet, item.scenario, response),
    checkVisibleAnswer(item.scenario, response),
    checkDevelopmentLeakAbsence(response),
    checkLinkPackage(response),
    checkFollowupQuality(response),
    checkRecommendationLanguage(response)
  ];
  const requiredFailures = checks.filter((check) => check.required && !check.passed);
  const compositionBoundaryProcess = response.trace?.llmCompositionProcess ?? [];
  const contractEvaluationProcess = buildContractEvaluationProcess(checks, requiredFailures);
  return {
    provider: runSpec.provider,
    requestedModel: runSpec.model,
    temperature: runSpec.temperature,
    ablation: runSpec.ablation ?? "harness",
    repeatIndex,
    groupId: item.groupId,
    scenarioSetId: item.scenarioSetId,
    scenarioId: item.scenario.id,
    title: item.scenario.title,
    questionHash: sha256(item.scenario.question),
    responseMode: response.mode,
    llmProvider: response.trace?.llmProvider ?? null,
    llmModel: response.trace?.llmModel ?? null,
    llmTemperature: response.trace?.llmTemperature ?? null,
    llmOutputContractStatus: response.trace?.llmOutputContractStatus ?? null,
    llmOutputContractErrors: response.trace?.llmOutputContractErrors ?? [],
    compositionBoundaryProcess,
    contractEvaluationProcess,
    elapsedMs: response.elapsedMs,
    traceFile: response.traceArtifactPath ?? response.traceExportUrl ?? null,
    status: requiredFailures.length === 0 ? "contract_pass" : "required_failure",
    checks
  };
}

function checkLiveContract(runSpec, response) {
  const status = response.trace?.llmOutputContractStatus ?? "unknown";
  const providerMatches = response.trace?.llmProvider === runSpec.provider;
  const modelRecorded = typeof response.trace?.llmModel === "string" && response.trace.llmModel.length > 0;
  const modelMatches = !runSpec.model || response.trace?.llmModel === runSpec.model;
  const observedTemperature = response.trace?.llmTemperature;
  const temperatureMatches = Number.isFinite(observedTemperature)
    ? Math.abs(observedTemperature - runSpec.temperature) < 1e-9
    : false;
  const liveValidated = response.mode === "live-llm-structured" && status === "validated";
  const missingCredentials = status === "missing_credentials";
  return makeCheck("live_llm_output_contract", liveValidated && providerMatches && modelMatches && temperatureMatches, {
    providerMatches,
    modelMatches,
    modelRecorded,
    temperatureMatches,
    requestedTemperature: runSpec.temperature,
    observedTemperature,
    responseMode: response.mode,
    outputContractStatus: status,
    outputContractErrors: response.trace?.llmOutputContractErrors ?? [],
    missingCredentials
  });
}

function checkExpectedClaimCoverage(scenario, response) {
  const observed = new Set((response.sourceClaims ?? []).map((claim) => claim.id));
  const missing = (scenario.expectedClaimIds ?? []).filter((id) => !observed.has(id));
  return makeCheck("source_claim_references", missing.length === 0, {
    expectedCount: scenario.expectedClaimIds?.length ?? 0,
    observedCount: observed.size,
    missing
  });
}

function checkTraceContract(scenarioSet, scenario, response) {
  const expectedSteps = scenarioSet.runtimeAssumptions.expectedTraceSteps ?? [];
  const requiredFields = [
    ...(scenarioSet.runtimeAssumptions.requiredTraceFields ?? []),
    "llmProvider",
    "llmModel"
  ];
  const labels = (response.processTrace ?? []).map((item) => item.label);
  const missingFields = requiredFields.filter((field) => response.trace?.[field] === undefined);
  const assemblySteps = response.answerAssembly ?? [];
  const assemblyIds = assemblySteps.map((item) => item.id);
  const requiredAssemblyIds = [
    "intent.route",
    "source.collect",
    "wiki.crosscheck",
    "claim.select",
    "answer.plan",
    "guardrail.validate"
  ];
  const orderMatches = expectedSteps.every((label, index) => labels[index] === label);
  const assemblyComplete = requiredAssemblyIds.every((id, index) => assemblyIds[index] === id);
  const assemblyHasFailure = assemblySteps.some((item) => item.status === "fail");
  const expectedRepresentativeCompanyId = scenario.expectedRepresentativeCompanyId ?? null;
  const observedRepresentativeCompanyId = response.representativeCompanyId ?? response.trace?.representativeCompanyId ?? null;
  const routeMatches =
    expectedRepresentativeCompanyId === null ||
    observedRepresentativeCompanyId === expectedRepresentativeCompanyId;
  return makeCheck(
    "trace_contract",
    orderMatches && missingFields.length === 0 && assemblyComplete && !assemblyHasFailure && routeMatches,
    {
      expectedSteps,
      observedSteps: labels,
      missingFields,
      requiredAssemblyIds,
      observedAssemblyIds: assemblyIds,
      assemblyHasFailure,
      expectedRepresentativeCompanyId,
      observedRepresentativeCompanyId,
      routeMatches
    }
  );
}

function checkVisibleAnswer(scenario, response) {
  const answer = response.answer ?? "";
  const sections = extractSections(answer);
  const missingSignals = (scenario.requiredAnswerSignals ?? []).filter((signal) => !answerContainsSignal(answer, signal));
  return makeCheck(
    "visible_answer_structure",
    /[가-힣]/u.test(answer) && sections.length >= 3 && answer.replace(/\s+/gu, "").length >= 120 && missingSignals.length === 0,
    {
      sections,
      missingSignals,
      answerLength: answer.length
    }
  );
}

function answerContainsSignal(answer, signal) {
  if (signal === "OpenDART") return /(OpenDART|DART|전자공시)/iu.test(answer);
  if (signal === "매출액") return /(매출액|매출)/u.test(answer);
  return answer.includes(signal);
}

function checkDevelopmentLeakAbsence(response) {
  const answer = response.answer ?? "";
  const patterns = [
    { id: "raw_claim_id", regex: /\b[a-z]+-sbc-\d+\b/iu },
    { id: "trace_schema", regex: /advisor-trace|schemaVersion|processTrace/iu },
    { id: "fixture_label", regex: /\bfixture:/iu },
    { id: "fallback_label", regex: /Yahoo Finance fallback|sourceBacked/iu },
    { id: "developer_package", regex: /근거 패키지|이번 답변의 공식 근거|개발자|개발용|개발 문구|개발 상태|디버그|\bclaim\b|\blive\s+KRX\b/iu },
    { id: "raw_prompt", regex: /system prompt|prompt-policy|프롬프트 원문/iu },
    { id: "related_questions_tag", regex: /<\/?related_questions>/iu }
  ];
  const leaks = patterns.filter((pattern) => pattern.regex.test(answer)).map((pattern) => pattern.id);
  return makeCheck("development_leak_absence", leaks.length === 0, { leaks });
}

function checkLinkPackage(response) {
  const links = response.links ?? [];
  const valid = links.filter((link) => typeof link.href === "string" && /^https?:\/\//u.test(link.href));
  return makeCheck("source_link_package", links.length >= 3 && valid.length === links.length, {
    count: links.length,
    validCount: valid.length
  });
}

function checkFollowupQuality(response) {
  const followUps = response.followUps ?? [];
  const generic = followUps.filter((question) =>
    /(더 알려줘|자세히 설명|계속|추가 설명|무엇을 물어볼까요)/u.test(question)
  );
  const developerFacing = followUps.filter((question) =>
    /(논문|evaluation|trace|로그|데모|개발|검증용|schema|JSON|프롬프트|prompt|rubric|eval)/iu.test(question)
  );
  return makeCheck("followup_quality", followUps.length >= 3 && generic.length === 0 && developerFacing.length === 0, {
    count: followUps.length,
    generic,
    developerFacing
  });
}

function checkRecommendationLanguage(response) {
  const answer = response.answer ?? "";
  const banned = [...answer.matchAll(/매수|매도|목표가|추천|사야|팔아야/gu)].map((match) => match[0]);
  return makeCheck("recommendation_language_absence", banned.length === 0, { banned });
}

function makeCheck(id, passed, details) {
  return {
    id,
    passed,
    required: true,
    details
  };
}

function buildContractEvaluationProcess(checks, requiredFailures) {
  const stages = checks.map((check) => ({
    stage: check.id,
    status: check.passed ? "pass" : "fail",
    required: check.required,
    failureDetails: check.passed ? undefined : check.details
  }));
  stages.push({
    stage: "final_harness_result",
    status: requiredFailures.length === 0 ? "pass" : "fail",
    failedRequiredChecks: requiredFailures.map((check) => check.id)
  });
  return stages;
}

function summarizeProvider(runSpec, runs) {
  const liveValidatedRuns = runs.filter((run) => run.checks.find((check) => check.id === "live_llm_output_contract")?.passed).length;
  const missingCredentialRuns = runs.filter((run) =>
    run.checks.find((check) => check.id === "live_llm_output_contract")?.details?.missingCredentials
  ).length;
  const contractPassRuns = runs.filter((run) => run.status === "contract_pass").length;
  const fallbackRuns = runs.filter((run) => String(run.responseMode ?? "").includes("fallback")).length;
  return {
    provider: runSpec.provider,
    requestedModel: runSpec.model,
    temperature: runSpec.temperature,
    ablation: runSpec.ablation ?? "harness",
    scenarioCount: scenarios.length,
    repeatCount,
    plannedRuns: runs.length,
    liveValidatedRuns,
    missingCredentialRuns,
    fallbackRuns,
    contractPassRuns,
    requiredFailureRuns: runs.length - contractPassRuns,
    failureTaxonomy: summarizeFailureTaxonomy(runs),
    processStageSummary: summarizeProcessStages(runs),
    runs
  };
}

function summarizeExperiment(results) {
  const plannedRuns = results.reduce((sum, provider) => sum + provider.plannedRuns, 0);
  const liveValidatedRuns = results.reduce((sum, provider) => sum + provider.liveValidatedRuns, 0);
  const missingCredentialRuns = results.reduce((sum, provider) => sum + provider.missingCredentialRuns, 0);
  const contractPassLiveRuns = results.reduce((sum, provider) => sum + provider.contractPassRuns, 0);
  const contractFailures = results.reduce((sum, provider) => sum + provider.requiredFailureRuns, 0);
  const fallbackRuns = results.reduce((sum, provider) => sum + provider.fallbackRuns, 0);
  const allRuns = results.flatMap((provider) => provider.runs);
  return {
    providerCount: providerSpecs.length,
    configurationCount: results.length,
    temperatures,
    repeatCount,
    scenarioCount: scenarios.length,
    plannedRuns,
    liveValidatedRuns,
    contractPassLiveRuns,
    fallbackRuns,
    missingCredentialRuns,
    contractFailures,
    failureTaxonomy: summarizeFailureTaxonomy(allRuns),
    processStageSummary: summarizeProcessStages(allRuns),
    byCheck: summarizeChecks(allRuns),
    status:
      liveValidatedRuns === 0
        ? "blocked_missing_live_llm_credentials"
        : contractFailures === 0
          ? "pass"
          : "needs_review"
  };
}

function summarizeProcessStages(runs) {
  const summary = {};
  for (const run of runs) {
    const stages = [
      ...(run.compositionBoundaryProcess ?? []),
      ...(run.contractEvaluationProcess ?? [])
    ];
    for (const stage of stages) {
      const id = stage.stage ?? "unknown";
      summary[id] ??= {};
      const status = stage.status ?? "unknown";
      summary[id][status] = (summary[id][status] ?? 0) + 1;
    }
  }
  return summary;
}

function summarizeFailureTaxonomy(runs) {
  const taxonomy = {
    liveStructuredValidated: 0,
    firstPassOutputContractFailure: 0,
    jsonObjectFailure: 0,
    schemaOrAnswerContractFailure: 0,
    fallbackRecoveryUsed: 0,
    fallbackAnswerContractPass: 0,
    fallbackAnswerContractFailure: 0,
    missingCredentials: 0,
    finalContractPass: 0,
    finalRequiredFailure: 0
  };
  for (const run of runs) {
    const liveCheck = run.checks.find((check) => check.id === "live_llm_output_contract");
    const status = liveCheck?.details?.outputContractStatus ?? run.llmOutputContractStatus ?? "unknown";
    const errors = liveCheck?.details?.outputContractErrors ?? run.llmOutputContractErrors ?? [];
    if (run.responseMode === "live-llm-structured" && status === "validated") taxonomy.liveStructuredValidated += 1;
    if (status === "fallback") {
      taxonomy.firstPassOutputContractFailure += 1;
      taxonomy.fallbackRecoveryUsed += 1;
      const nonLiveRequiredFailures = run.checks.filter((check) =>
        check.required && check.id !== "live_llm_output_contract" && !check.passed
      );
      if (nonLiveRequiredFailures.length === 0) {
        taxonomy.fallbackAnswerContractPass += 1;
      } else {
        taxonomy.fallbackAnswerContractFailure += 1;
      }
      if (errors.some((error) => /not a JSON object|JSON/i.test(String(error)))) {
        taxonomy.jsonObjectFailure += 1;
      } else {
        taxonomy.schemaOrAnswerContractFailure += 1;
      }
    }
    if (status === "missing_credentials") taxonomy.missingCredentials += 1;
    if (run.status === "contract_pass") taxonomy.finalContractPass += 1;
    if (run.status === "required_failure") taxonomy.finalRequiredFailure += 1;
  }
  return taxonomy;
}

function summarizeChecks(runs) {
  const summary = {};
  for (const run of runs) {
    for (const check of run.checks) {
      summary[check.id] ??= { passed: 0, failed: 0 };
      if (check.passed) summary[check.id].passed += 1;
      else summary[check.id].failed += 1;
    }
  }
  return summary;
}

async function writeProgressSnapshot({ status, currentRun = null, error = null }) {
  const snapshot = {
    schemaVersion: "advisor-live-llm-progress.v0.1",
    experimentId: "live-llm-composition-boundary-v0.2",
    startedAt,
    updatedAt: new Date().toISOString(),
    status,
    outputPath,
    progressLogPath,
    progressSnapshotPath,
    design: {
      providerSpecs,
      temperatures,
      repeatCount,
      scenarioPolicy: selectedScenarioIds.length > 0
        ? "explicit scenario id subset"
        : scenarioPolicy === "all"
          ? "full fixed validation scenario set"
          : "one representative fixed validation scenario per corporate group",
      scenarioCount: scenarios.length,
      totalPlannedRuns
    },
    totalPlannedRuns,
    completedRuns: completedRuns.length,
    remainingRuns: Math.max(totalPlannedRuns - completedRuns.length, 0),
    currentRun,
    summary: summarizeProgressRuns(completedRuns)
  };
  if (error) snapshot.error = serializeError(error);
  await writeJson(progressSnapshotPath, snapshot);
}

function summarizeProgressRuns(runs) {
  const contractPassRuns = runs.filter((run) => run.status === "contract_pass").length;
  const liveValidatedRuns = runs.filter((run) => run.checks.find((check) => check.id === "live_llm_output_contract")?.passed).length;
  const fallbackRuns = runs.filter((run) => String(run.responseMode ?? "").includes("fallback")).length;
  const missingCredentialRuns = runs.filter((run) =>
    run.checks.find((check) => check.id === "live_llm_output_contract")?.details?.missingCredentials
  ).length;
  return {
    completedRuns: runs.length,
    liveValidatedRuns,
    contractPassRuns,
    requiredFailureRuns: runs.length - contractPassRuns,
    fallbackRuns,
    missingCredentialRuns,
    failureTaxonomy: summarizeFailureTaxonomy(runs),
    byCheck: summarizeChecks(runs),
    recentRequiredFailures: runs
      .filter((run) => run.status === "required_failure")
      .slice(-10)
      .map((run) => ({
        provider: run.provider,
        requestedModel: run.requestedModel,
        temperature: run.temperature,
        repeatIndex: run.repeatIndex,
        groupId: run.groupId,
        scenarioId: run.scenarioId,
        failedRequiredChecks: failedRequiredChecks(run)
      }))
  };
}

function buildProgressStartRecord(runSpec, item, repeatIndex, runNumber) {
  return {
    event: "run_start",
    at: new Date().toISOString(),
    runNumber,
    totalPlannedRuns,
    provider: runSpec.provider,
    requestedModel: runSpec.model,
    temperature: runSpec.temperature,
    repeatIndex,
    groupId: item.groupId,
    scenarioSetId: item.scenarioSetId,
    scenarioId: item.scenario.id,
    title: item.scenario.title
  };
}

function buildExperimentProgressRecord(event, status) {
  return {
    event,
    at: new Date().toISOString(),
    status,
    outputPath,
    progressSnapshotPath,
    totalPlannedRuns,
    providerCount: providerSpecs.length,
    configurationCount: runSpecs.length,
    scenarioCount: scenarios.length,
    repeatCount,
    temperatures
  };
}

function buildProgressCompleteRecord(run, completedRunCount) {
  const liveCheck = run.checks.find((check) => check.id === "live_llm_output_contract");
  const contractErrors = liveCheck?.details?.outputContractErrors ?? run.llmOutputContractErrors ?? [];
  return {
    event: "run_complete",
    at: new Date().toISOString(),
    runNumber: completedRunCount,
    completedRuns: completedRunCount,
    totalPlannedRuns,
    provider: run.provider,
    requestedModel: run.requestedModel,
    observedModel: run.llmModel,
    temperature: run.temperature,
    repeatIndex: run.repeatIndex,
    groupId: run.groupId,
    scenarioSetId: run.scenarioSetId,
    scenarioId: run.scenarioId,
    title: run.title,
    responseMode: run.responseMode,
    llmOutputContractStatus: run.llmOutputContractStatus,
    liveStructuredValidated: Boolean(liveCheck?.passed),
    fallbackRecoveryUsed: String(run.responseMode ?? "").includes("fallback") || run.llmOutputContractStatus === "fallback",
    finalHarnessStatus: run.status,
    failedRequiredChecks: failedRequiredChecks(run),
    outputContractErrorCount: contractErrors.length,
    elapsedMs: run.elapsedMs,
    traceFile: run.traceFile
  };
}

function buildProgressErrorRecord(runSpec, item, repeatIndex, error, runNumber) {
  return {
    event: "run_error",
    at: new Date().toISOString(),
    runNumber,
    totalPlannedRuns,
    provider: runSpec.provider,
    requestedModel: runSpec.model,
    temperature: runSpec.temperature,
    repeatIndex,
    groupId: item.groupId,
    scenarioSetId: item.scenarioSetId,
    scenarioId: item.scenario.id,
    title: item.scenario.title,
    error: serializeError(error)
  };
}

function failedRequiredChecks(run) {
  return run.checks
    .filter((check) => check.required && !check.passed)
    .map((check) => check.id);
}

function logProgressRun(record) {
  const firstPass = record.liveStructuredValidated ? "pass" : "fail";
  const finalStatus = record.finalHarnessStatus === "contract_pass" ? "pass" : "fail";
  const fallback = record.fallbackRecoveryUsed ? "used" : "none";
  const model = record.requestedModel ? `${record.provider}:${record.requestedModel}` : record.provider;
  const failures = record.failedRequiredChecks.length > 0 ? ` failed=${record.failedRequiredChecks.join(",")}` : "";
  console.log(
    `[live-llm ${record.completedRuns}/${record.totalPlannedRuns}] ${model} T=${record.temperature} ` +
    `${record.scenarioId} repeat=${record.repeatIndex} firstPass=${firstPass} final=${finalStatus} fallback=${fallback}${failures}`
  );
}

function serializeError(error) {
  return {
    name: error instanceof Error ? error.name : "Error",
    message: error instanceof Error ? error.message : String(error)
  };
}

function extractSections(answer) {
  return [...String(answer).matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}
