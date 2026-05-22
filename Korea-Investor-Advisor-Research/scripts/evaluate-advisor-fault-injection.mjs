import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scenarioPath = process.env.ADVISOR_FAULT_SCENARIO ?? "evals/scenarios/samsung.reference-slice.json";
const rubricPath = process.env.ADVISOR_FAULT_RUBRIC ?? "evals/rubrics/advisor.answer-quality.v0.2.json";
const today = process.env.ADVISOR_FAULT_DATE ?? "2026-05-10";

const scenarioSet = await readJson(scenarioPath);
const rubric = await readJson(rubricPath);
const thresholds = rubric.thresholds;

const scenario =
  scenarioSet.scenarios.find((item) => item.id === process.env.ADVISOR_FAULT_SCENARIO_ID) ??
  scenarioSet.scenarios.find((item) => item.expectedRepresentativeCompanyId) ??
  scenarioSet.scenarios[0];

if (!scenario) {
  throw new Error(`No scenario found in ${scenarioPath}`);
}

const server = await getAdvisorServer();

try {
  const baselineResponse = await callAdvisor(server.baseUrl, {
    groupId: scenarioSet.groupId,
    question: scenario.question,
    presentationMode: scenarioSet.runtimeAssumptions.presentationMode ?? "text"
  });

  const baselineChecks = runChecks(scenario, baselineResponse);
  const mutations = buildMutations(scenario, baselineResponse);
  const results = mutations.map((mutation) => {
    const mutatedResponse = mutation.apply(deepClone(baselineResponse));
    const checks = runChecks(scenario, mutatedResponse);
    const failedChecks = checks.filter((check) => !check.passed).map((check) => check.id);
    return {
      id: mutation.id,
      contractDimension: mutation.contractDimension,
      inducedFault: mutation.inducedFault,
      expectedFailedCheckId: mutation.expectedFailedCheckId,
      detected: failedChecks.includes(mutation.expectedFailedCheckId),
      failedChecks
    };
  });

  const output = {
    schemaVersion: "advisor-fault-injection-result.v0.1",
    generatedAt: new Date().toISOString(),
    baselineDate: today,
    scenarioSetId: scenarioSet.scenarioSetId,
    groupId: scenarioSet.groupId,
    scenarioId: scenario.id,
    methodology: {
      purpose: "Check whether the frozen-scenario contract validators detect deliberately induced faults.",
      baseline: "A valid advisor response is generated first; each mutation alters one contract dimension and reruns the same deterministic checks.",
      scope: "Contract sensitivity only. This is not an expert review and not an open-world robustness benchmark."
    },
    baselineChecks,
    summary: {
      mutationCount: results.length,
      detectedCount: results.filter((result) => result.detected).length,
      undetectedCount: results.filter((result) => !result.detected).length,
      status: results.every((result) => result.detected) ? "all_faults_detected" : "needs_review"
    },
    results
  };

  const outputPath =
    process.env.ADVISOR_FAULT_OUTPUT ??
    `evals/results/fault-injection-contract-sensitivity.${today}.json`;
  await writeJson(outputPath, output);

  console.log(`Fault-injection eval complete: ${output.summary.detectedCount}/${output.summary.mutationCount} detected`);
  console.log(`Scenario: ${scenario.id}`);
  console.log(`Result: ${outputPath}`);

  if (output.summary.undetectedCount > 0) {
    process.exitCode = 1;
  }
} finally {
  await server.stop();
}

function buildMutations(currentScenario, baselineResponse) {
  const firstClaimId = currentScenario.expectedClaimIds[0];
  const firstSignal = currentScenario.requiredAnswerSignals[0];
  return [
    {
      id: "missing_expected_claim",
      contractDimension: "Claim refs",
      inducedFault: `Remove expected claim ${firstClaimId} from sourceClaims.`,
      expectedFailedCheckId: "expected_claim_coverage",
      apply(response) {
        response.sourceClaims = (response.sourceClaims ?? []).filter((claim) => claim.id !== firstClaimId);
        return response;
      }
    },
    {
      id: "wrong_company_route",
      contractDimension: "Route checks",
      inducedFault: "Replace the representative company route with an unrelated identifier.",
      expectedFailedCheckId: "trace_contract",
      apply(response) {
        response.representativeCompanyId = "fault-injected-wrong-company";
        response.trace = { ...(response.trace ?? {}), representativeCompanyId: "fault-injected-wrong-company" };
        return response;
      }
    },
    {
      id: "missing_trace_field",
      contractDimension: "Trace",
      inducedFault: "Delete a required trace field.",
      expectedFailedCheckId: "trace_contract",
      apply(response) {
        response.trace = { ...(response.trace ?? {}) };
        delete response.trace.runId;
        return response;
      }
    },
    {
      id: "answer_contract_break",
      contractDimension: "Answer",
      inducedFault: `Remove the required answer signal ${firstSignal}.`,
      expectedFailedCheckId: "investor_facing_answer",
      apply(response) {
        response.answer = String(response.answer ?? "").replaceAll(firstSignal, "");
        return response;
      }
    },
    {
      id: "developer_trace_leak",
      contractDimension: "No leakage",
      inducedFault: "Inject development-facing trace labels and raw claim IDs into the visible answer.",
      expectedFailedCheckId: "development_leak_absence",
      apply(response) {
        response.answer = `${response.answer ?? ""}\n\n근거 패키지 구성 완료\nadvisor-trace.v0.1\n${firstClaimId}`;
        return response;
      }
    },
    {
      id: "broken_source_link",
      contractDimension: "Links",
      inducedFault: "Replace a source link with a non-HTTP value.",
      expectedFailedCheckId: "link_package",
      apply(response) {
        response.links = [...(response.links ?? baselineResponse.links ?? [])];
        if (response.links.length === 0) {
          response.links.push({ label: "fault link", href: "not-a-valid-url" });
        } else {
          response.links[0] = { ...response.links[0], href: "not-a-valid-url" };
        }
        return response;
      }
    },
    {
      id: "latency_budget_violation",
      contractDimension: "Latency",
      inducedFault: `Set elapsedMs above ${thresholds.maxPreApiLatencyMs}ms budget.`,
      expectedFailedCheckId: "latency_budget",
      apply(response) {
        response.elapsedMs = thresholds.maxPreApiLatencyMs + 1;
        return response;
      }
    }
  ];
}

function runChecks(currentScenario, response) {
  return [
    checkExpectedClaimCoverage(currentScenario, response),
    checkTraceContract(currentScenario, response),
    checkInvestorFacingAnswer(currentScenario, response),
    checkDevelopmentLeakAbsence(response),
    checkLinkPackage(response),
    checkLatencyBudget(response)
  ];
}

function checkExpectedClaimCoverage(currentScenario, response) {
  const observed = new Set((response.sourceClaims ?? []).map((claim) => claim.id));
  const missing = currentScenario.expectedClaimIds.filter((id) => !observed.has(id));
  return {
    id: "expected_claim_coverage",
    passed: missing.length === 0,
    details: { missing, expectedCount: currentScenario.expectedClaimIds.length, observedCount: observed.size }
  };
}

function checkTraceContract(currentScenario, response) {
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
  const expectedRepresentativeCompanyId = currentScenario.expectedRepresentativeCompanyId ?? null;
  const observedRepresentativeCompanyId = response.representativeCompanyId ?? response.trace?.representativeCompanyId ?? null;
  const routeMatches =
    expectedRepresentativeCompanyId === null ||
    observedRepresentativeCompanyId === expectedRepresentativeCompanyId;
  return {
    id: "trace_contract",
    passed:
      orderMatches &&
      missingFields.length === 0 &&
      !rawQuestionInTrace &&
      assemblyComplete &&
      !assemblyHasFailure &&
      routeMatches,
    details: {
      orderMatches,
      missingFields,
      rawQuestionInTrace,
      assemblyComplete,
      assemblyHasFailure,
      expectedRepresentativeCompanyId,
      observedRepresentativeCompanyId,
      routeMatches
    }
  };
}

function checkInvestorFacingAnswer(currentScenario, response) {
  const answer = response.answer ?? "";
  const sections = extractSections(answer);
  const missingSignals = currentScenario.requiredAnswerSignals.filter((signal) => !answer.includes(signal));
  const hasKorean = /[가-힣]/u.test(answer);
  const enoughSections = sections.length >= thresholds.minAnswerSections;
  const longEnough = answer.replace(/\s+/gu, "").length >= 120;
  return {
    id: "investor_facing_answer",
    passed: hasKorean && enoughSections && longEnough && missingSignals.length === 0,
    details: { missingSignals, sectionCount: sections.length, answerLength: answer.length }
  };
}

function checkDevelopmentLeakAbsence(response) {
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
  return { id: "development_leak_absence", passed: leaks.length === 0, details: { leaks } };
}

function checkLinkPackage(response) {
  const links = response.links ?? [];
  const valid = links.filter((link) => typeof link.href === "string" && /^https?:\/\//u.test(link.href));
  return {
    id: "link_package",
    passed: links.length >= thresholds.minLinks && valid.length === links.length,
    details: { count: links.length, validCount: valid.length }
  };
}

function checkLatencyBudget(response) {
  const elapsedMs = Number(response.elapsedMs ?? Infinity);
  return {
    id: "latency_budget",
    passed: elapsedMs <= thresholds.maxPreApiLatencyMs,
    details: { elapsedMs, maxPreApiLatencyMs: thresholds.maxPreApiLatencyMs }
  };
}

function extractSections(answer) {
  return [...String(answer).matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`);
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function getAdvisorServer() {
  if (process.env.ADVISOR_FAULT_BASE_URL) {
    return {
      baseUrl: process.env.ADVISOR_FAULT_BASE_URL.replace(/\/$/u, ""),
      stop: async () => undefined
    };
  }

  const preferredBaseUrl = process.env.ADVISOR_FAULT_PREFER_BASE_URL ?? "http://127.0.0.1:5173";
  if (process.env.ADVISOR_FAULT_NO_EXISTING_SERVER !== "1" && await isHealthy(preferredBaseUrl)) {
    return {
      baseUrl: preferredBaseUrl.replace(/\/$/u, ""),
      stop: async () => undefined
    };
  }

  const port = Number(process.env.ADVISOR_FAULT_PORT ?? 8810);
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
