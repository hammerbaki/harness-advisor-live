import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const runSpecs = providerSpecs.flatMap((providerSpec) =>
  temperatures.map((temperature) => ({ ...providerSpec, temperature }))
);
const scenarioSpecs = [
  { groupId: "samsung", path: "evals/scenarios/samsung.reference-slice.json" },
  { groupId: "sk", path: "evals/scenarios/sk.reference-slice.json" },
  { groupId: "hyundai-motor", path: "evals/scenarios/hyundai-motor.reference-slice.json" },
  { groupId: "lg", path: "evals/scenarios/lg.reference-slice.json" },
  { groupId: "hanwha", path: "evals/scenarios/hanwha.reference-slice.json" }
];

const scenarioSets = await Promise.all(scenarioSpecs.map(async (spec) => ({
  ...spec,
  data: await readJson(spec.path)
})));
const selectedScenarioIds = parseCsv(process.env.ADVISOR_LIVE_LLM_SCENARIO_IDS ?? "");
const scenarios = selectScenarios(scenarioSets, selectedScenarioIds, scenarioPolicy);
const providerResults = [];

for (const [runIndex, runSpec] of runSpecs.entries()) {
  const server = await getAdvisorServer(runSpec, 8830 + runIndex);
  try {
    const runs = [];
    for (let repeatIndex = 1; repeatIndex <= repeatCount; repeatIndex += 1) {
      for (const item of scenarios) {
        const response = await callAdvisor(server.baseUrl, {
          groupId: item.groupId,
          question: item.scenario.question,
          presentationMode: item.scenarioSet.runtimeAssumptions.presentationMode ?? "text"
        });
        runs.push(evaluateLiveRun(runSpec, item, response, repeatIndex));
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

const outputPath =
  process.env.ADVISOR_LIVE_LLM_OUTPUT ??
  `evals/results/live-llm-composition-boundary.${today}.json`;
await writeJson(outputPath, output);

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

function parseCsv(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
  return {
    provider: runSpec.provider,
    requestedModel: runSpec.model,
    temperature: runSpec.temperature,
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
    scenarioCount: scenarios.length,
    repeatCount,
    plannedRuns: runs.length,
    liveValidatedRuns,
    missingCredentialRuns,
    fallbackRuns,
    contractPassRuns,
    requiredFailureRuns: runs.length - contractPassRuns,
    failureTaxonomy: summarizeFailureTaxonomy(runs),
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
    byCheck: summarizeChecks(allRuns),
    status:
      liveValidatedRuns === 0
        ? "blocked_missing_live_llm_credentials"
        : contractFailures === 0
          ? "pass"
          : "needs_review"
  };
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

function extractSections(answer) {
  return [...String(answer).matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}
