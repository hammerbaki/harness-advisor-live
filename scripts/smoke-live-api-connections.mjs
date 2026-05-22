import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = "raw/manifests/live-api-smoke-test.json";
const docPath = "docs/87_live_api_connection_smoke_test.md";
const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const requiredTraceLabels = ["dart.disclosures", "krx.market", "news.search"];

const server = await getAdvisorServer();

try {
  const records = [];
  for (const groupId of groupIds) {
    const startedAt = Date.now();
    const response = await callAdvisor(server.baseUrl, {
      groupId,
      question: "최근 뉴스와 공시 기준으로 주요 확인 포인트를 요약해줘",
      presentationMode: "text"
    });
    const traceStatus = Object.fromEntries((response.processTrace ?? []).map((step) => [step.label, step.status]));
    const apiStatuses = Object.fromEntries(requiredTraceLabels.map((label) => [label, traceStatus[label] ?? "missing"]));
    records.push({
      groupId,
      runtimeMode: response.trace?.runtimeMode ?? null,
      elapsedMs: response.elapsedMs ?? Date.now() - startedAt,
      sourceClaimCount: (response.sourceClaims ?? []).length,
      apiStatuses,
      passed: requiredTraceLabels.every((label) => apiStatuses[label] === "live")
    });
  }

  const summary = {
    groupsChecked: records.length,
    allLive: records.every((record) => record.passed),
    liveCounts: Object.fromEntries(requiredTraceLabels.map((label) => [
      label,
      records.filter((record) => record.apiStatuses[label] === "live").length
    ])),
    maxElapsedMs: Math.max(...records.map((record) => record.elapsedMs)),
    minSourceClaimCount: Math.min(...records.map((record) => record.sourceClaimCount))
  };

  const output = {
    schemaVersion: "live-api-smoke-test.v0.1",
    generatedAt: new Date().toISOString(),
    purpose:
      "Verify that the local advisor API can reach DART, KRX, and Naver News with configured service-level credentials. API key values are intentionally omitted.",
    baseUrl: server.baseUrl,
    serverMode: server.serverMode,
    cachePolicy: server.cachePolicy,
    keyPolicy: "Loaded from local environment or .env by the server; secret values are not written to this artifact.",
    requiredTraceLabels,
    summary,
    records
  };

  await writeJson(outputPath, output);
  await writeText(docPath, renderDoc(output));

  console.log(`Live API smoke test written: ${outputPath}`);
  console.log(`Readable smoke test note written: ${docPath}`);
  for (const record of records) {
    console.log(`${record.groupId}: dart=${record.apiStatuses["dart.disclosures"]} krx=${record.apiStatuses["krx.market"]} news=${record.apiStatuses["news.search"]} claims=${record.sourceClaimCount} elapsed=${record.elapsedMs}`);
  }
  console.log(`All live: ${summary.allLive ? "yes" : "no"}`);
  if (!summary.allLive) process.exitCode = 1;
} finally {
  await server.stop();
}

async function getAdvisorServer() {
  if (process.env.ADVISOR_SMOKE_BASE_URL) {
    return {
      baseUrl: process.env.ADVISOR_SMOKE_BASE_URL.replace(/\/$/u, ""),
      serverMode: "provided-base-url",
      cachePolicy: "unknown-existing-server-policy",
      stop: async () => undefined
    };
  }

  const preferredBaseUrl = process.env.ADVISOR_SMOKE_PREFER_BASE_URL ?? "http://127.0.0.1:5173";
  if (process.env.ADVISOR_SMOKE_NO_EXISTING_SERVER !== "1" && await isHealthy(preferredBaseUrl)) {
    return {
      baseUrl: preferredBaseUrl.replace(/\/$/u, ""),
      serverMode: "existing-local-server",
      cachePolicy: "may-use-existing-memory-cache",
      stop: async () => undefined
    };
  }

  const port = Number(process.env.ADVISOR_SMOKE_PORT ?? 8798);
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["server/index.mjs"], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      STATIC_DIR: "",
      ADVISOR_DISABLE_MEMORY_CACHE: process.env.ADVISOR_SMOKE_USE_CACHE === "1" ? process.env.ADVISOR_DISABLE_MEMORY_CACHE ?? "" : "1"
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
    serverMode: "spawned-smoke-server",
    cachePolicy: process.env.ADVISOR_SMOKE_USE_CACHE === "1" ? "server-default-cache-policy" : "memory-cache-disabled",
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

function renderDoc(report) {
  return `${[
    "# Live API Connection Smoke Test",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This smoke test verifies that the local advisor API can call DART, KRX, and Naver News with the configured service-level credentials. Secret values are loaded from the local environment or `.env` and are not written to this document.",
    "",
    "## Summary",
    "",
    `- Groups checked: ${report.summary.groupsChecked}`,
    `- Server mode: ${report.serverMode}`,
    `- Cache policy: ${report.cachePolicy}`,
    `- All required API traces live: ${report.summary.allLive ? "yes" : "no"}`,
    `- DART live groups: ${report.summary.liveCounts["dart.disclosures"]}/${report.summary.groupsChecked}`,
    `- KRX live groups: ${report.summary.liveCounts["krx.market"]}/${report.summary.groupsChecked}`,
    `- Naver News live groups: ${report.summary.liveCounts["news.search"]}/${report.summary.groupsChecked}`,
    `- Minimum selected source claims: ${report.summary.minSourceClaimCount}`,
    `- Max elapsed ms: ${report.summary.maxElapsedMs}`,
    "",
    "## Group Results",
    "",
    table(
      ["Group", "Runtime", "DART", "KRX", "News", "Claims", "Elapsed ms"],
      report.records.map((record) => [
        `\`${record.groupId}\``,
        record.runtimeMode,
        record.apiStatuses["dart.disclosures"],
        record.apiStatuses["krx.market"],
        record.apiStatuses["news.search"],
        String(record.sourceClaimCount),
        String(record.elapsedMs)
      ])
    ),
    "",
    "## Interpretation",
    "",
    "This is a connectivity smoke test, not a claim that live data is production-hardened. Product use still requires cache policy, fallback behavior, source freshness display, rate-limit handling, monitoring, and UI-level answer review.",
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
