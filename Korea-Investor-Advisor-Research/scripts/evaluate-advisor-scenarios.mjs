import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scenarioPath = process.env.ADVISOR_EVAL_SCENARIO ?? "evals/scenarios/hanwha.reference-slice.json";
const rubricPath = process.env.ADVISOR_EVAL_RUBRIC ?? "evals/rubrics/advisor.answer-quality.v0.2.json";
const today = process.env.ADVISOR_EVAL_DATE ?? "2026-05-02";

const scenarioSet = await readJson(scenarioPath);
const rubric = await readJson(rubricPath);
const weights = new Map(rubric.criteria.map((criterion) => [criterion.id, criterion]));
const thresholds = rubric.thresholds;

const server = await getAdvisorServer();

try {
  const results = [];
  for (const scenario of scenarioSet.scenarios) {
    const response = await callAdvisor(server.baseUrl, {
      groupId: scenarioSet.groupId,
      question: scenario.question,
      presentationMode: scenarioSet.runtimeAssumptions.presentationMode ?? "text"
    });
    results.push(evaluateScenario(scenario, response));
  }

  const summary = summarizeResults(results);
  const output = {
    schemaVersion: "advisor-autoeval-result.v0.1",
    scenarioSetId: scenarioSet.scenarioSetId,
    groupId: scenarioSet.groupId,
    stage: scenarioSet.stage,
    rubricId: rubric.rubricId,
    evaluatedAt: new Date().toISOString(),
    baselineDate: today,
    methodology: {
      loop: "fixed scenario -> run advisor -> score rubric -> keep/discard candidate",
      source: "Adapted from Karpathy autoresearch-style self-evaluation, bounded by source-backed finance trace rules.",
      originalPocInputs: [
        "follow-up consistency guards",
        "preamble and meta-narration stripping",
        "status stream ordering and dedupe",
        "trace hygiene",
        "chart/TTS leak checks"
      ]
    },
    thresholds,
    summary,
    results
  };

  const outputPath =
    process.env.ADVISOR_EVAL_OUTPUT ??
    `evals/results/${scenarioSet.scenarioSetId}.autoeval-baseline.${today}.json`;
  await writeJson(outputPath, output);

  console.log(`Advisor auto-eval complete: ${summary.scenarioCount} scenario(s)`);
  console.log(`Average score: ${summary.averageScore}/100`);
  console.log(`Paper baseline: ${summary.paperBaselineCount}/${summary.scenarioCount}`);
  console.log(`Required failures: ${summary.requiredFailureCount}`);
  console.log(`Result: ${outputPath}`);

  if (summary.requiredFailureCount > 0 || summary.averageScore < thresholds.pass) {
    process.exitCode = 1;
  }
} finally {
  await server.stop();
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

async function getAdvisorServer() {
  if (process.env.ADVISOR_EVAL_BASE_URL) {
    return {
      baseUrl: process.env.ADVISOR_EVAL_BASE_URL.replace(/\/$/u, ""),
      stop: async () => undefined
    };
  }

  const preferredBaseUrl = process.env.ADVISOR_EVAL_PREFER_BASE_URL ?? "http://127.0.0.1:5173";
  if (process.env.ADVISOR_EVAL_NO_EXISTING_SERVER !== "1" && await isHealthy(preferredBaseUrl)) {
    return {
      baseUrl: preferredBaseUrl.replace(/\/$/u, ""),
      stop: async () => undefined
    };
  }

  const port = Number(process.env.ADVISOR_EVAL_PORT ?? 8799);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: rootDir,
    env: { ...process.env, PORT: String(port), STATIC_DIR: "" },
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

async function isHealthy(baseUrl) {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/u, "")}/api/healthz`);
    return res.ok;
  } catch {
    return false;
  }
}

async function waitForHealth(baseUrl, logs) {
  const startedAt = Date.now();
  let lastError = "";
  while (Date.now() - startedAt < 6000) {
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

function evaluateScenario(scenario, response) {
  const checks = [
    checkExpectedClaimCoverage(scenario, response),
    checkTraceContract(scenario, response),
    checkInvestorFacingAnswer(scenario, response),
    ...(weights.has("briefing_quality") ? [checkBriefingQuality(response)] : []),
    checkDevelopmentLeakAbsence(response),
    checkSourceStatusDisclosure(response),
    checkFollowupQuality(response),
    ...(weights.has("template_variation") ? [checkTemplateVariation(response)] : []),
    checkLinkPackage(response),
    checkLatencyBudget(response),
    checkOriginalPocRegressionGuards(response)
  ];
  const score = round(checks.reduce((sum, check) => sum + check.score, 0), 2);
  const requiredFailures = checks.filter((check) => check.required && !check.passed);
  const status = requiredFailures.length > 0
    ? "required_failure"
    : score >= thresholds.paperBaseline
      ? "paper_baseline"
      : score >= thresholds.pass
        ? "pass"
        : "below_threshold";

  return {
    scenarioId: scenario.id,
    title: scenario.title,
    questionHash: sha256(scenario.question),
    paperTableBucket: scenario.paperTableBucket,
    score,
    status,
    runtimeMode: response.trace?.runtimeMode,
    responseMode: response.mode,
    llmOutputContractStatus: response.trace?.llmOutputContractStatus,
    elapsedMs: response.elapsedMs,
    traceFile: response.traceArtifactPath ?? response.traceExportUrl ?? null,
    expectedClaimIds: scenario.expectedClaimIds,
    observedClaimIds: (response.sourceClaims ?? []).map((claim) => claim.id),
    checks
  };
}

function checkExpectedClaimCoverage(scenario, response) {
  const criterion = criterionFor("expected_claim_coverage");
  const observed = new Set((response.sourceClaims ?? []).map((claim) => claim.id));
  const missing = scenario.expectedClaimIds.filter((id) => !observed.has(id));
  const coverage = scenario.expectedClaimIds.length === 0
    ? 0
    : (scenario.expectedClaimIds.length - missing.length) / scenario.expectedClaimIds.length;
  return makeCheck(criterion, missing.length === 0, criterion.weight * coverage, {
    missing,
    observedCount: observed.size
  });
}

function checkTraceContract(scenario, response) {
  const criterion = criterionFor("trace_contract");
  const expectedSteps = scenarioSet.runtimeAssumptions.expectedTraceSteps;
  const requiredFields = scenarioSet.runtimeAssumptions.requiredTraceFields;
  const labels = (response.processTrace ?? []).map((item) => item.label);
  const orderMatches = expectedSteps.every((label, index) => labels[index] === label);
  const missingFields = requiredFields.filter((field) => response.trace?.[field] === undefined);
  const rawQuestionInTrace = Object.prototype.hasOwnProperty.call(response.trace ?? {}, "question");
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
  const assemblyComplete = requiredAssemblyIds.every((id, index) => assemblyIds[index] === id);
  const assemblyHasFailure = assemblySteps.some((item) => item.status === "fail");
  const expectedRepresentativeCompanyId = scenario.expectedRepresentativeCompanyId ?? null;
  const observedRepresentativeCompanyId = response.representativeCompanyId ?? response.trace?.representativeCompanyId ?? null;
  const routeMatches =
    expectedRepresentativeCompanyId === null ||
    observedRepresentativeCompanyId === expectedRepresentativeCompanyId;
  const passed =
    orderMatches &&
    missingFields.length === 0 &&
    !rawQuestionInTrace &&
    assemblyComplete &&
    !assemblyHasFailure &&
    routeMatches;
  const partial = [
    orderMatches,
    missingFields.length === 0,
    !rawQuestionInTrace,
    assemblyComplete,
    !assemblyHasFailure,
    routeMatches
  ].filter(Boolean).length / 6;
  return makeCheck(criterion, passed, criterion.weight * partial, {
    expectedSteps,
    observedSteps: labels,
    requiredAssemblyIds,
    observedAssemblyIds: assemblyIds,
    missingFields,
    rawQuestionInTrace,
    assemblyHasFailure,
    expectedRepresentativeCompanyId,
    observedRepresentativeCompanyId,
    routeMatches
  });
}

function checkInvestorFacingAnswer(scenario, response) {
  const criterion = criterionFor("investor_facing_answer");
  const answer = response.answer ?? "";
  const sections = extractSections(answer);
  const missingSignals = scenario.requiredAnswerSignals.filter((signal) => !answer.includes(signal));
  const hasKorean = /[가-힣]/u.test(answer);
  const enoughSections = sections.length >= thresholds.minAnswerSections;
  const longEnough = answer.replace(/\s+/gu, "").length >= 120;
  const passed = hasKorean && enoughSections && longEnough && missingSignals.length === 0;
  const partial = [hasKorean, enoughSections, longEnough, missingSignals.length === 0].filter(Boolean).length / 4;
  return makeCheck(criterion, passed, criterion.weight * partial, {
    sections,
    missingSignals,
    answerLength: answer.length
  });
}

function checkBriefingQuality(response) {
  const criterion = criterionFor("briefing_quality");
  const answer = response.answer ?? "";
  const sections = extractSections(answer);
  const bannedVague = [
    "안정적",
    "양호",
    "긍정적",
    "좋은 흐름",
    "견조"
  ].filter((term) => answer.includes(term));
  const hasInsightLead = sections[0] === "핵심 인사이트";
  const hasJudgmentAxis = sections.includes("반증 리스크") || sections.includes("브리핑 판단축") || /판단축|반증|구분하는 것입니다|확인축/u.test(answer);
  const hasPriorityMonitoring = (sections.includes("다음 관찰 포인트") || sections.includes("확인 우선순위")) && /1순위|2순위/u.test(answer);
  const hasComparisonOrCausalContext = /전년|대비|반복 가능|원인|때문|속도|지속성|구조|전환|마진|우선순위/u.test(answer);
  const avoidsRecommendation = !/(매수|매도|목표가|추천|사야|팔아야)/u.test(answer);
  const passed =
    bannedVague.length === 0 &&
    hasInsightLead &&
    hasJudgmentAxis &&
    hasPriorityMonitoring &&
    hasComparisonOrCausalContext &&
    avoidsRecommendation;
  const partial = [
    bannedVague.length === 0,
    hasInsightLead,
    hasJudgmentAxis,
    hasPriorityMonitoring,
    hasComparisonOrCausalContext,
    avoidsRecommendation
  ].filter(Boolean).length / 6;
  return makeCheck(criterion, passed, criterion.weight * partial, {
    bannedVague,
    hasInsightLead,
    hasJudgmentAxis,
    hasPriorityMonitoring,
    hasComparisonOrCausalContext,
    avoidsRecommendation,
    sections
  });
}

function checkDevelopmentLeakAbsence(response) {
  const criterion = criterionFor("development_leak_absence");
  const answer = response.answer ?? "";
  const patterns = [
    { id: "raw_claim_id", regex: /\b[a-z]+-sbc-\d+\b/iu },
    { id: "trace_schema", regex: /advisor-trace|schemaVersion|processTrace/iu },
    { id: "fixture_label", regex: /\bfixture:/iu },
    { id: "fallback_label", regex: /Yahoo Finance fallback|sourceBacked/iu },
    { id: "developer_package", regex: /근거 패키지|이번 답변의 공식 근거|개발|디버그|\bclaim\b|\blive\s+KRX\b/iu },
    { id: "raw_prompt", regex: /system prompt|prompt-policy|프롬프트 원문/iu },
    { id: "related_questions_tag", regex: /<\/?related_questions>/iu }
  ];
  const leaks = patterns.filter((pattern) => pattern.regex.test(answer)).map((pattern) => pattern.id);
  return makeCheck(criterion, leaks.length === 0, leaks.length === 0 ? criterion.weight : 0, { leaks });
}

function checkSourceStatusDisclosure(response) {
  const criterion = criterionFor("source_status_disclosure");
  const statuses = (response.processTrace ?? []).map((item) => item.status);
  const limited = statuses.some((status) => ["fixture", "fallback", "local", "error"].includes(status));
  if (!limited) {
    return makeCheck(criterion, true, criterion.weight, { limited: false });
  }
  const answer = response.answer ?? "";
  const disclosed = /(실시간|연결 전|재확인|공식|보수적|제한|확인해야|확인 필요)/u.test(answer);
  return makeCheck(criterion, disclosed, disclosed ? criterion.weight : 0, { limited: true, statuses });
}

function checkFollowupQuality(response) {
  const criterion = criterionFor("followup_quality");
  const followUps = response.followUps ?? [];
  const generic = followUps.filter((question) =>
    /(더 알려줘|자세히 설명|계속|추가 설명|무엇을 물어볼까요)/u.test(question)
  );
  const developerFacing = followUps.filter((question) =>
    /(논문|evaluation|trace|로그|데모|개발|검증용|schema|JSON|프롬프트|prompt|rubric|eval)/iu.test(question)
  );
  const enough = followUps.length >= thresholds.minFollowUps;
  const passed = enough && generic.length === 0 && developerFacing.length === 0;
  const partial = [enough, generic.length === 0, developerFacing.length === 0].filter(Boolean).length / 3;
  return makeCheck(criterion, passed, criterion.weight * partial, {
    count: followUps.length,
    generic,
    developerFacing
  });
}

function checkTemplateVariation(response) {
  const criterion = criterionFor("template_variation");
  const sections = extractSections(response.answer ?? "");
  const answerPlanStep = (response.answerAssembly ?? []).find((item) => item.id === "answer.plan");
  const intent = String(answerPlanStep?.inputs?.find((item) => String(item).startsWith("answerIntent:")) ?? "")
    .replace(/^answerIntent:/u, "") || "unknown";
  const recommendedRaw = String(answerPlanStep?.outputs?.find((item) => String(item).startsWith("recommended:")) ?? "")
    .replace(/^recommended:/u, "");
  const recommended = recommendedRaw.split("|").map((item) => item.trim()).filter(Boolean);
  const genericCore = ["핵심 인사이트", "재무 포인트", "반증 리스크", "다음 관찰 포인트"];
  const recommendedMatches = recommended.filter((section) => sections.includes(section)).length;
  const followsPlan = recommended.length === 0 || recommendedMatches >= Math.min(2, recommended.length);
  const rigidGeneric = intent !== "financial" && genericCore.every((section) => sections.includes(section));
  const hasQuestionSpecificTitle = intent === "financial" || sections.some((section) => !genericCore.includes(section));
  const passed = followsPlan && !rigidGeneric && hasQuestionSpecificTitle;
  const partial = [followsPlan, !rigidGeneric, hasQuestionSpecificTitle].filter(Boolean).length / 3;
  return makeCheck(criterion, passed, criterion.weight * partial, {
    intent,
    sections,
    recommended,
    recommendedMatches,
    rigidGeneric,
    hasQuestionSpecificTitle
  });
}

function checkLinkPackage(response) {
  const criterion = criterionFor("link_package");
  const links = response.links ?? [];
  const valid = links.filter((link) => typeof link.href === "string" && /^https?:\/\//u.test(link.href));
  const passed = links.length >= thresholds.minLinks && valid.length === links.length;
  const partial = links.length === 0 ? 0 : Math.min(1, valid.length / thresholds.minLinks);
  return makeCheck(criterion, passed, criterion.weight * partial, {
    count: links.length,
    validCount: valid.length
  });
}

function checkLatencyBudget(response) {
  const criterion = criterionFor("latency_budget");
  const elapsedMs = Number(response.elapsedMs ?? Infinity);
  const passed = elapsedMs <= thresholds.maxPreApiLatencyMs;
  return makeCheck(criterion, passed, passed ? criterion.weight : 0, {
    elapsedMs,
    maxPreApiLatencyMs: thresholds.maxPreApiLatencyMs
  });
}

function checkOriginalPocRegressionGuards(response) {
  const criterion = criterionFor("original_poc_regression_guards");
  const answer = response.answer ?? "";
  const patterns = [
    { id: "preamble", regex: /^[^\n.]{0,120}(조회합니다|조회하겠습니다|확보했습니다|가져왔습니다|불러왔습니다|로드했습니다|브리핑 드립니다|브리프 드립니다|정리해 드립니다|아래와 같이|요청하신)/u },
    { id: "meta_narration", regex: /(DART 직접 조회|RAG 수치|확인 완료입니다|확인이 완료되었습니다|기반으로\s*(종합\s*)?(분석|비교)을 드리겠습니다|다음은 .{0,40}(분석|비교|브리핑))/u },
    { id: "chart_artifact", regex: /```chartjs|\[\[chart\]\]|차트 생성 중|📊차트|차트\s*[:：]\s*/u },
    { id: "xml_related_questions", regex: /<\/?related_questions>/u }
  ];
  const regressions = patterns.filter((pattern) => pattern.regex.test(answer)).map((pattern) => pattern.id);
  return makeCheck(criterion, regressions.length === 0, regressions.length === 0 ? criterion.weight : 0, {
    regressions
  });
}

function criterionFor(id) {
  const criterion = weights.get(id);
  if (!criterion) throw new Error(`Rubric criterion missing: ${id}`);
  return criterion;
}

function makeCheck(criterion, passed, score, details) {
  return {
    id: criterion.id,
    passed,
    required: Boolean(criterion.required),
    weight: criterion.weight,
    score: round(score, 2),
    details
  };
}

function extractSections(answer) {
  return [...String(answer).matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

function summarizeResults(results) {
  const scenarioCount = results.length;
  const averageScore = round(
    results.reduce((sum, result) => sum + result.score, 0) / Math.max(1, scenarioCount),
    2
  );
  const requiredFailureCount = results.filter((result) => result.status === "required_failure").length;
  const paperBaselineCount = results.filter((result) => result.status === "paper_baseline").length;
  const passCount = results.filter((result) => ["paper_baseline", "pass"].includes(result.status)).length;
  const keepCandidateCount = results.filter((result) => result.score >= thresholds.keepCandidate && result.status !== "required_failure").length;
  return {
    scenarioCount,
    averageScore,
    passCount,
    paperBaselineCount,
    keepCandidateCount,
    requiredFailureCount,
    baselineStatus: requiredFailureCount === 0 && averageScore >= thresholds.paperBaseline
      ? "paper_baseline"
      : requiredFailureCount === 0 && averageScore >= thresholds.pass
        ? "pass"
        : "needs_improvement"
  };
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
