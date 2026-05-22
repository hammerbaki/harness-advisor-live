import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = "raw/manifests/human-answer-review-packet.json";
const docPath = "docs/89_human_answer_review_packet.md";

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const questionTemplates = [
  {
    id: "news-disclosure-brief",
    label: "뉴스·공시 브리프",
    reviewFocus: "뉴스와 공시를 섞지 않고 투자자가 확인할 이벤트와 리스크 신호를 구분하는가",
    question: (group) => `${group.koreanName} 최근 뉴스와 공시 기준으로 핵심 확인 포인트를 요약해줘`
  },
  {
    id: "financial-brief",
    label: "재무 브리프",
    reviewFocus: "수치 나열이 아니라 수익성, 전년 대비 변화, 확인 변수를 분리하는가",
    question: (group) => `${group.koreanName} 재무 브리프를 매출, 영업이익, 수익성 변화 중심으로 정리해줘`
  },
  {
    id: "market-risk-brief",
    label: "시장·리스크 브리프",
    reviewFocus: "가격 변동을 매매 신호처럼 표현하지 않고 공시·업황·수급 리스크로 해석하는가",
    question: (group) => `${group.koreanName} 주가와 최근 공시를 함께 보고 확인할 리스크 신호를 정리해줘`
  }
];

const maxSamples = Number(process.env.ADVISOR_REVIEW_MAX_SAMPLES ?? groupIds.length * questionTemplates.length);
const groupsConfig = await readJson("configs/groups.json");
const groups = groupIds.map((groupId) => {
  const group = groupsConfig.groups?.find((item) => item.id === groupId);
  if (!group) throw new Error(`Missing group config: ${groupId}`);
  return group;
});
const sourceClaimLookup = await loadSourceClaimLookup(groupIds);

const server = await getAdvisorServer();

try {
  const scenarios = [];
  for (const group of groups) {
    for (const template of questionTemplates) {
      scenarios.push({
        id: `${group.id}-${template.id}`,
        groupId: group.id,
        groupName: group.koreanName,
        label: template.label,
        reviewFocus: template.reviewFocus,
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
    samples.push(packSample(scenario, response));
  }

  const packet = {
    schemaVersion: "human-answer-review-packet.v0.1",
    generatedAt: new Date().toISOString(),
    purpose:
      "Provide human investment-research reviewers with actual customer-facing answers after live API integration. This is a review surface, not an automatic quality score.",
    baseUrl: server.baseUrl,
    serverMode: server.serverMode,
    cachePolicy: server.cachePolicy,
    reviewBoundary: {
      reviewerShouldJudge: [
        "Is the first section useful as investor-facing insight rather than a process explanation?",
        "Are the metrics and source links sufficient for the question type?",
        "Does the answer avoid recommendation language while remaining decision-useful?",
        "Are follow-up questions customer-facing and specific?",
        "Does the answer need a sharper group/company distinction?"
      ],
      reviewerShouldNotJudgeHere: [
        "Whether the product is commercially deployable.",
        "Whether the answer is a formal investment recommendation.",
        "Whether long-run live API stability has been proven."
      ]
    },
    samplePolicy: {
      groupIds,
      questionTemplateIds: questionTemplates.map((template) => template.id),
      maxSamples
    },
    summary: summarize(samples),
    samples
  };

  await writeJson(outputPath, packet);
  await writeText(docPath, renderDoc(packet));

  console.log(`Human answer review packet written: ${outputPath}`);
  console.log(`Readable review packet written: ${docPath}`);
  console.log(`Samples: ${packet.summary.samples}`);
  console.log(`Average answer length: ${packet.summary.averageAnswerLength}`);
  console.log(`Average elapsed ms: ${packet.summary.averageElapsedMs}`);
} finally {
  await server.stop();
}

function packSample(scenario, response) {
  const processStatuses = Object.fromEntries((response.processTrace ?? []).map((step) => [step.label, step.status]));
  const sourceClaims = (response.sourceClaims ?? []).map((claim) => {
    const manifestRecord = sourceClaimLookup.get(claim.id) ?? {};
    return {
      id: claim.id,
      companyId: claim.companyId ?? manifestRecord.companyId ?? null,
      category: claim.category ?? manifestRecord.claimType ?? null,
      period: claim.period ?? manifestRecord.sourceDocumentDate ?? null,
      paperUseLevel: claim.paperUseLevel ?? manifestRecord.paperUseLevel ?? null,
      sourceTitle: manifestRecord.sourceTitle ?? null,
      sourceManifestId: manifestRecord.sourceManifestId ?? null,
      claim: claim.claim ?? claim.claimText ?? manifestRecord.claimText ?? null
    };
  });
  return {
    scenarioId: scenario.id,
    groupId: scenario.groupId,
    groupName: scenario.groupName,
    label: scenario.label,
    reviewFocus: scenario.reviewFocus,
    question: scenario.question,
    representativeCompanyId: response.representativeCompanyId ?? null,
    elapsedMs: response.elapsedMs ?? null,
    runtimeMode: response.trace?.runtimeMode ?? null,
    processStatuses,
    answer: response.answer ?? "",
    answerSections: extractSections(response.answer ?? ""),
    sourceClaims,
    links: (response.links ?? []).map((link) => ({
      label: link.label ?? "",
      href: link.href ?? "",
      source: link.source ?? ""
    })),
    followUps: response.followUps ?? [],
    traceArtifactPath: response.traceArtifactPath ?? null
  };
}

function summarize(samples) {
  return {
    samples: samples.length,
    byGroup: Object.fromEntries(groupIds.map((groupId) => [
      groupId,
      samples.filter((sample) => sample.groupId === groupId).length
    ])),
    averageAnswerLength: round(samples.reduce((sum, sample) => sum + sample.answer.length, 0) / Math.max(1, samples.length)),
    averageElapsedMs: round(samples.reduce((sum, sample) => sum + (sample.elapsedMs ?? 0), 0) / Math.max(1, samples.length)),
    totalSourceClaims: samples.reduce((sum, sample) => sum + sample.sourceClaims.length, 0),
    totalLinks: samples.reduce((sum, sample) => sum + sample.links.length, 0),
    totalFollowUps: samples.reduce((sum, sample) => sum + sample.followUps.length, 0)
  };
}

function renderDoc(packet) {
  const lines = [
    "# Human Answer Review Packet",
    "",
    `Generated: ${packet.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This packet collects actual customer-facing answers after live DART/KRX/Naver integration. It is meant for human investment-research review. It does not replace automated checks, and it does not certify commercial investment-advice quality.",
    "",
    "## Review Boundary",
    "",
    "Reviewers should judge:",
    "",
    ...packet.reviewBoundary.reviewerShouldJudge.map((item) => `- ${item}`),
    "",
    "Reviewers should not treat this packet as proof of:",
    "",
    ...packet.reviewBoundary.reviewerShouldNotJudgeHere.map((item) => `- ${item}`),
    "",
    "## Summary",
    "",
    `- Samples: ${packet.summary.samples}`,
    `- Average answer length: ${packet.summary.averageAnswerLength}`,
    `- Average elapsed ms: ${packet.summary.averageElapsedMs}`,
    `- Total selected source claims: ${packet.summary.totalSourceClaims}`,
    `- Total source links: ${packet.summary.totalLinks}`,
    `- Total follow-up questions: ${packet.summary.totalFollowUps}`,
    `- Server mode: ${packet.serverMode}`,
    `- Cache policy: ${packet.cachePolicy}`,
    "",
    "## Sample Index",
    "",
    table(
      ["Scenario", "Group", "Type", "Representative", "Claims", "Links", "Follow-ups", "Trace"],
      packet.samples.map((sample) => [
        `\`${sample.scenarioId}\``,
        sample.groupName,
        sample.label,
        sample.representativeCompanyId ? `\`${sample.representativeCompanyId}\`` : "-",
        String(sample.sourceClaims.length),
        String(sample.links.length),
        String(sample.followUps.length),
        sample.traceArtifactPath ? `\`${sample.traceArtifactPath}\`` : "-"
      ])
    ),
    "",
    "## Review Samples",
    ""
  ];

  for (const sample of packet.samples) {
    lines.push(
      `### ${sample.scenarioId}`,
      "",
      `- Group: ${sample.groupName} (\`${sample.groupId}\`)`,
      `- Type: ${sample.label}`,
      `- Review focus: ${sample.reviewFocus}`,
      `- Question: ${sample.question}`,
      `- Representative company: ${sample.representativeCompanyId ? `\`${sample.representativeCompanyId}\`` : "not specified"}`,
      `- Runtime: ${sample.runtimeMode ?? "unknown"}, ${sample.elapsedMs ?? "unknown"} ms`,
      "",
      "#### Answer",
      "",
      sample.answer,
      "",
      "#### Source Links",
      "",
      sample.links.length === 0
        ? "- None."
        : sample.links.map((link) => `- ${link.label} — ${link.href}`).join("\n"),
      "",
      "#### Selected Source Claims",
      "",
      sample.sourceClaims.length === 0
        ? "- None."
        : sample.sourceClaims.map((claim) =>
            `- \`${claim.id}\` · ${claim.companyId ?? "group"} · ${claim.category ?? "uncategorized"} · ${claim.claim ?? "(claim text unavailable)"}`
          ).join("\n"),
      "",
      "#### Follow-Up Questions",
      "",
      sample.followUps.length === 0
        ? "- None."
        : sample.followUps.map((question) => `- ${question}`).join("\n"),
      "",
      "#### Reviewer Notes",
      "",
      "- Insight depth: pending",
      "- Professional tone: pending",
      "- Source sufficiency: pending",
      "- Follow-up quality: pending",
      "- Required edit: pending",
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function extractSections(answer) {
  return [...String(answer ?? "").matchAll(/\*\*([^*\n]+)\*\*/gu)].map((match) => match[1].trim());
}

async function getAdvisorServer() {
  if (process.env.ADVISOR_REVIEW_BASE_URL) {
    return {
      baseUrl: process.env.ADVISOR_REVIEW_BASE_URL.replace(/\/$/u, ""),
      serverMode: "provided-base-url",
      cachePolicy: "unknown-existing-server-policy",
      stop: async () => undefined
    };
  }

  const preferredBaseUrl = process.env.ADVISOR_REVIEW_PREFER_BASE_URL ?? "http://127.0.0.1:5173";
  if (process.env.ADVISOR_REVIEW_NO_EXISTING_SERVER !== "1" && await isHealthy(preferredBaseUrl)) {
    return {
      baseUrl: preferredBaseUrl.replace(/\/$/u, ""),
      serverMode: "existing-local-server",
      cachePolicy: "may-use-existing-memory-cache",
      stop: async () => undefined
    };
  }

  const port = Number(process.env.ADVISOR_REVIEW_PORT ?? 8798);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      STATIC_DIR: "",
      ADVISOR_DISABLE_MEMORY_CACHE: process.env.ADVISOR_REVIEW_USE_CACHE === "1" ? process.env.ADVISOR_DISABLE_MEMORY_CACHE ?? "" : "1"
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
    serverMode: "spawned-human-review-server",
    cachePolicy: process.env.ADVISOR_REVIEW_USE_CACHE === "1" ? "server-default-cache-policy" : "memory-cache-disabled",
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

async function loadSourceClaimLookup(groupIds) {
  const entries = [];
  for (const groupId of groupIds) {
    const manifest = await readJson(`raw/manifests/${groupId}.source-backed-claims.json`);
    for (const record of manifest.records ?? []) entries.push([record.id, record]);
  }
  return new Map(entries);
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
