import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = "raw/manifests/live-answer-quality-audit.json";
const docPath = "docs/88_live_answer_quality_audit.md";

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const questionTemplates = [
  {
    id: "news-disclosure-brief",
    label: "뉴스·공시 브리프",
    question: (group) => `${group.koreanName} 최근 뉴스와 공시 기준으로 핵심 확인 포인트를 요약해줘`
  },
  {
    id: "financial-brief",
    label: "재무 브리프",
    question: (group) => `${group.koreanName} 재무 브리프를 매출, 영업이익, 수익성 변화 중심으로 정리해줘`
  },
  {
    id: "market-risk-brief",
    label: "시장·리스크 브리프",
    question: (group) => `${group.koreanName} 주가와 최근 공시를 함께 보고 확인할 리스크 신호를 정리해줘`
  }
];

const requiredTraceLabels = ["dart.disclosures", "krx.market", "news.search", "claims.sourceBacked"];
const maxSamples = Number(process.env.ADVISOR_LIVE_QUALITY_MAX_SAMPLES ?? groupIds.length * questionTemplates.length);
const groupsConfig = await readJson("configs/groups.json");
const groups = groupIds.map((groupId) => {
  const group = groupsConfig.groups?.find((item) => item.id === groupId);
  if (!group) throw new Error(`Missing group config: ${groupId}`);
  return group;
});

const server = await getAdvisorServer();

try {
  const scenarios = [];
  for (const group of groups) {
    for (const template of questionTemplates) {
      scenarios.push({
        id: `${group.id}-${template.id}`,
        groupId: group.id,
        label: template.label,
        question: template.question(group)
      });
    }
  }

  const samples = [];
  for (const scenario of scenarios.slice(0, maxSamples)) {
    const response = await callAdvisor(server.baseUrl, {
      groupId: scenario.groupId,
      question: scenario.question,
      presentationMode: "text"
    });
    samples.push(evaluateSample(scenario, response));
  }

  const summary = summarize(samples);
  const audit = {
    schemaVersion: "live-answer-quality-audit.v0.1",
    generatedAt: new Date().toISOString(),
    purpose:
      "Check whether live DART/KRX/Naver inputs preserve customer-facing answer quality, source-link hygiene, follow-up hygiene, and traceability.",
    baseUrl: server.baseUrl,
    serverMode: server.serverMode,
    cachePolicy: server.cachePolicy,
    samplePolicy: {
      groupIds,
      questionTemplateIds: questionTemplates.map((template) => template.id),
      maxSamples,
      requiredTraceLabels
    },
    thresholds: {
      minSourceClaims: 3,
      requiredSectionLead: "핵심 인사이트",
      noBlockerSamples: true
    },
    summary,
    samples
  };

  await writeJson(outputPath, audit);
  await writeText(docPath, renderDoc(audit));

  console.log(`Live answer quality audit written: ${outputPath}`);
  console.log(`Readable answer quality note written: ${docPath}`);
  console.log(`Samples: ${summary.samples}`);
  console.log(`Blocker samples: ${summary.blockerSamples}`);
  console.log(`Warning samples: ${summary.warningSamples}`);
  console.log(`Average score: ${summary.averageScore}/100`);
  console.log(`Result: ${summary.blockerSamples === 0 ? "pass" : "fail"}`);
  if (summary.blockerSamples > 0) process.exitCode = 1;
} finally {
  await server.stop();
}

function evaluateSample(scenario, response) {
  const checks = [
    checkLiveTrace(response),
    checkSourceClaims(response),
    checkInsightFirst(response),
    checkDevLeakAbsence(response),
    checkRecommendationSafety(response),
    checkLinkPackage(response),
    checkFollowUps(response),
    checkTraceExport(response),
    checkNoviceTone(response)
  ];
  const blockers = checks.filter((check) => check.severity === "blocker" && !check.passed);
  const warnings = checks.filter((check) => check.severity === "warning" && !check.passed);
  const score = round(checks.reduce((sum, check) => sum + check.score, 0), 2);
  return {
    scenarioId: scenario.id,
    groupId: scenario.groupId,
    label: scenario.label,
    question: scenario.question,
    representativeCompanyId: response.representativeCompanyId ?? null,
    runtimeMode: response.trace?.runtimeMode ?? null,
    elapsedMs: response.elapsedMs ?? null,
    answerLength: String(response.answer ?? "").length,
    sourceClaimCount: (response.sourceClaims ?? []).length,
    linkCount: (response.links ?? []).length,
    followUpCount: (response.followUps ?? []).length,
    traceArtifactPath: response.traceArtifactPath ?? null,
    status: blockers.length > 0 ? "blocker" : warnings.length > 0 ? "warning" : "pass",
    score,
    checks
  };
}

function checkLiveTrace(response) {
  const statuses = Object.fromEntries((response.processTrace ?? []).map((step) => [step.label, step.status]));
  const missing = requiredTraceLabels.filter((label) => !statuses[label]);
  const nonLiveExternal = ["dart.disclosures", "krx.market", "news.search"].filter((label) => statuses[label] !== "live");
  const claimsLocal = statuses["claims.sourceBacked"] === "local";
  const passed = missing.length === 0 && nonLiveExternal.length === 0 && claimsLocal;
  return makeCheck("live-trace-contract", "blocker", passed, passed ? 14 : 0, {
    statuses,
    missing,
    nonLiveExternal,
    claimsLocal
  });
}

function checkSourceClaims(response) {
  const sourceClaims = response.sourceClaims ?? [];
  const uniqueCompanyIds = new Set(sourceClaims.map((claim) => claim.companyId).filter(Boolean));
  const passed = sourceClaims.length >= 3 && uniqueCompanyIds.size >= 1;
  return makeCheck("source-claims-selected", "blocker", passed, passed ? 12 : 0, {
    count: sourceClaims.length,
    uniqueCompanyIds: [...uniqueCompanyIds]
  });
}

function checkInsightFirst(response) {
  const sections = extractSections(response.answer ?? "");
  const passed = sections[0] === "핵심 인사이트";
  return makeCheck("insight-first-section", "blocker", passed, passed ? 12 : 0, { sections });
}

function checkDevLeakAbsence(response) {
  const answer = String(response.answer ?? "");
  const patterns = [
    { id: "raw-claim-id", regex: /\b[a-z-]+-sbc-\d+\b/iu },
    { id: "trace-schema", regex: /advisor-trace|schemaVersion|processTrace/iu },
    { id: "fixture-fallback-label", regex: /\bfixture:|Yahoo Finance fallback|sourceBacked/iu },
    { id: "developer-terms", regex: /근거 패키지|이번 답변의 공식 근거|개발|디버그|\bclaim\b|\bJSON\b|프롬프트|prompt|rubric|eval|논문|영업\s*캡처/iu }
  ];
  const leaks = patterns.filter((pattern) => pattern.regex.test(answer)).map((pattern) => pattern.id);
  return makeCheck("development-leak-absence", "blocker", leaks.length === 0, leaks.length === 0 ? 14 : 0, { leaks });
}

function checkRecommendationSafety(response) {
  const answer = String(response.answer ?? "");
  const matches = [...answer.matchAll(/.{0,14}(매수|매도|목표가|투자의견|추천|사야|팔아야).{0,14}/gu)].map((match) => match[0]);
  return makeCheck("recommendation-safety", "blocker", matches.length === 0, matches.length === 0 ? 14 : 0, { matches });
}

function checkLinkPackage(response) {
  const links = response.links ?? [];
  const linkText = links.map((link) => `${link.label ?? ""} ${link.href ?? ""} ${link.source ?? ""}`).join("\n");
  const hasDart = /dart\.fss|opendart|DART|전자공시/u.test(linkText);
  const hasMarket = /data\.krx|KRX|정보데이터/u.test(linkText);
  const hasNews = /Naver|naver\.com|news\.naver|search\.naver|뉴스/u.test(linkText);
  const hasOfficialOrClaim = links.some((link) => /local-|official|IR|공식|group-profile|source/i.test(`${link.source ?? ""} ${link.label ?? ""}`));
  const passed = hasDart && hasMarket && hasNews && hasOfficialOrClaim;
  return makeCheck("source-link-package", "blocker", passed, passed ? 12 : 0, {
    count: links.length,
    hasDart,
    hasMarket,
    hasNews,
    hasOfficialOrClaim,
    labels: links.map((link) => link.label)
  });
}

function checkFollowUps(response) {
  const followUps = response.followUps ?? [];
  const developerFacing = followUps.filter((question) =>
    /(논문|evaluation|trace|로그|데모|개발|검증용|schema|JSON|프롬프트|prompt|rubric|eval)/iu.test(question)
  );
  const generic = followUps.filter((question) =>
    /(더 알려줘|자세히 설명|계속|추가 설명|무엇을 물어볼까요)/u.test(question)
  );
  const passed = followUps.length >= 3 && developerFacing.length === 0 && generic.length === 0;
  return makeCheck("follow-up-quality", "blocker", passed, passed ? 10 : 0, {
    count: followUps.length,
    developerFacing,
    generic
  });
}

function checkTraceExport(response) {
  const path = response.traceArtifactPath;
  const passed = Boolean(path) && existsSync(join(rootDir, path));
  return makeCheck("trace-export", "blocker", passed, passed ? 6 : 0, { path });
}

function checkNoviceTone(response) {
  const answer = String(response.answer ?? "");
  const matches = [
    ...answer.matchAll(/.{0,18}(어떻게\s*봐야|보는\s*방법|확인해야\s*합니다|봐야\s*합니다|브리핑\s*근거로\s*쓰|쉽습니다).{0,18}/gu)
  ].map((match) => match[0]);
  return makeCheck("novice-or-pedagogical-tone", "warning", matches.length === 0, matches.length === 0 ? 6 : 3, { matches });
}

function makeCheck(id, severity, passed, score, details) {
  return { id, severity, passed, score, details };
}

function extractSections(answer) {
  return [...String(answer ?? "").matchAll(/\*\*([^*\n]+)\*\*/gu)].map((match) => match[1].trim());
}

function summarize(samples) {
  const blockerSamples = samples.filter((sample) => sample.status === "blocker").length;
  const warningSamples = samples.filter((sample) => sample.status === "warning").length;
  const passSamples = samples.filter((sample) => sample.status === "pass").length;
  const averageScore = round(samples.reduce((sum, sample) => sum + sample.score, 0) / Math.max(1, samples.length), 2);
  const checkFailures = {};
  for (const sample of samples) {
    for (const check of sample.checks) {
      if (!check.passed) checkFailures[check.id] = (checkFailures[check.id] ?? 0) + 1;
    }
  }
  return {
    samples: samples.length,
    passSamples,
    warningSamples,
    blockerSamples,
    averageScore,
    checkFailures
  };
}

function renderDoc(audit) {
  return `${[
    "# Live Answer Quality Audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This audit checks whether live DART/KRX/Naver inputs preserve investor-facing answer quality. It is stricter than the API connectivity smoke test: it checks visible answer hygiene, source links, follow-up questions, selected source-backed claims, and trace export.",
    "",
    "## Summary",
    "",
    `- Samples: ${audit.summary.samples}`,
    `- Pass samples: ${audit.summary.passSamples}`,
    `- Warning samples: ${audit.summary.warningSamples}`,
    `- Blocker samples: ${audit.summary.blockerSamples}`,
    `- Average score: ${audit.summary.averageScore}/100`,
    `- Server mode: ${audit.serverMode}`,
    `- Cache policy: ${audit.cachePolicy}`,
    "",
    "## Check Failures",
    "",
    Object.keys(audit.summary.checkFailures).length === 0
      ? "- None."
      : Object.entries(audit.summary.checkFailures).map(([id, count]) => `- \`${id}\`: ${count}`).join("\n"),
    "",
    "## Sample Results",
    "",
    table(
      ["Scenario", "Group", "Status", "Score", "Claims", "Links", "Follow-ups", "Elapsed ms"],
      audit.samples.map((sample) => [
        `\`${sample.scenarioId}\``,
        `\`${sample.groupId}\``,
        `\`${sample.status}\``,
        String(sample.score),
        String(sample.sourceClaimCount),
        String(sample.linkCount),
        String(sample.followUpCount),
        String(sample.elapsedMs)
      ])
    ),
    "",
    "## Interpretation",
    "",
    audit.summary.blockerSamples === 0
      ? "No blocker was found. Warning samples, if any, should be reviewed by a human because investor-facing tone quality is partly judgment-based."
      : "At least one blocker was found. Do not use this state for client-facing demos until the failed checks are repaired.",
    "",
    "## Next Review",
    "",
    "The next human review should read the warning samples first, then decide whether answer tone needs expert investment-research editing. This audit does not replace expert judgment; it protects against obvious product regressions.",
    ""
  ].join("\n")}\n`;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

async function getAdvisorServer() {
  if (process.env.ADVISOR_LIVE_QUALITY_BASE_URL) {
    return {
      baseUrl: process.env.ADVISOR_LIVE_QUALITY_BASE_URL.replace(/\/$/u, ""),
      serverMode: "provided-base-url",
      cachePolicy: "unknown-existing-server-policy",
      stop: async () => undefined
    };
  }

  const preferredBaseUrl = process.env.ADVISOR_LIVE_QUALITY_PREFER_BASE_URL ?? "http://127.0.0.1:5173";
  if (process.env.ADVISOR_LIVE_QUALITY_NO_EXISTING_SERVER !== "1" && await isHealthy(preferredBaseUrl)) {
    return {
      baseUrl: preferredBaseUrl.replace(/\/$/u, ""),
      serverMode: "existing-local-server",
      cachePolicy: "may-use-existing-memory-cache",
      stop: async () => undefined
    };
  }

  const port = Number(process.env.ADVISOR_LIVE_QUALITY_PORT ?? 8797);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      STATIC_DIR: "",
      ADVISOR_DISABLE_MEMORY_CACHE: process.env.ADVISOR_LIVE_QUALITY_USE_CACHE === "1" ? process.env.ADVISOR_DISABLE_MEMORY_CACHE ?? "" : "1"
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
    serverMode: "spawned-quality-audit-server",
    cachePolicy: process.env.ADVISOR_LIVE_QUALITY_USE_CACHE === "1" ? "server-default-cache-policy" : "memory-cache-disabled",
    stop: async () => {
      if (!child.killed) child.kill();
    }
  };
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
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
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

function round(value) {
  return Math.round(value * 100) / 100;
}
