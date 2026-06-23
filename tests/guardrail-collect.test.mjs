// Guardrail collection plumbing test (v0.5.15-pre). Zero live cost: spawns the
// server with all LLM keys cleared (fixture/deterministic), so it exercises the
// collector's record shape, pairing keys, condition→ablation surfacing, and the
// scorer wiring WITHOUT calling any hosted model.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { collectRecords, loadScenarioSpecs, DEFAULT_CONDITIONS } from "../scripts/guardrail-collect.mjs";
import { scoreRun } from "../scripts/guardrail-scorer.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const serverPath = join(here, "..", "server", "index.mjs");
const PORT = Number(process.env.GUARDRAIL_TEST_PORT ?? 8961);
const BASE = `http://127.0.0.1:${PORT}`;
let child;

async function waitForHealth(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${BASE}/api/healthz`)).ok) return;
    } catch { /* not up */ }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("server did not become healthy");
}

before(async () => {
  child = spawn("node", [serverPath], {
    // Clear every LLM credential -> deterministic/fixture path -> zero cost.
    // ADVISOR_OFFLINE=1 -> fully offline/fixture (fast, deterministic, zero
    // network); cleared LLM provider keeps the composition path deterministic too.
    env: {
      ...process.env,
      PORT: String(PORT), HOST: "127.0.0.1", ADVISOR_PREWARM: "0", STATIC_DIR: "",
      ADVISOR_OFFLINE: "1"
    },
    stdio: ["ignore", "ignore", "inherit"]
  });
  await waitForHealth();
});

after(() => { if (child) child.kill(); });

test("/api/advisor surfaces ablation + wrapper fields at top level", async () => {
  const res = await fetch(`${BASE}/api/advisor`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ groupId: "samsung", question: "삼성전자 재무 요약", ablation: "external-guardrail" })
  });
  const r = await res.json();
  assert.equal(r.ablation, "external-guardrail", "ablation must be echoed");
  assert.ok("wrapperAction" in r, "wrapperAction key must be present");
  assert.ok("guardrailOutcome" in r, "guardrailOutcome key must be present");
});

test("collector builds well-formed records with correct condition/pairing", async () => {
  const scenarios = await loadScenarioSpecs([
    { scenarioSet: "reference", path: join(here, "..", "evals/scenarios/samsung.reference-slice.json"), limit: 1 },
    { scenarioSet: "adversarial", path: join(here, "..", "evals/scenarios/samsung.adversarial-stress.json"), limit: 1 }
  ]);
  assert.equal(scenarios.length, 2);

  const records = await collectRecords({ baseUrl: BASE, scenarios, conditions: DEFAULT_CONDITIONS, repeats: 1, model: "fixture-test" });
  assert.equal(records.length, 2 * 3 * 1, "scenarios × conditions × repeats");

  for (const rec of records) {
    for (const k of ["condition", "scenarioSet", "scenarioId", "model", "repeatIndex", "answer", "links", "wrapperAction", "guardrailOutcome"]) {
      assert.ok(k in rec, `record missing ${k}`);
    }
    assert.equal(rec.serverAblation, rec.condition, "server-echoed ablation must match requested condition");
    assert.ok(["reference", "adversarial"].includes(rec.scenarioSet));
  }

  // pairing: each external/prompt-only record has a harness record with the same key
  const key = (r) => `${r.model}::${r.scenarioSet}::${r.scenarioId}::${r.repeatIndex}`;
  const harnessKeys = new Set(records.filter((r) => r.condition === "harness").map(key));
  for (const r of records.filter((r) => r.condition !== "harness")) {
    assert.ok(harnessKeys.has(key(r)), `no paired harness record for ${key(r)}`);
  }

  // scorer accepts the collected records end-to-end
  const harnessByKey = new Map(records.filter((r) => r.condition === "harness").map((r) => [key(r), r]));
  for (const r of records) {
    const s = scoreRun(r, harnessByKey.get(key(r)) ?? null);
    assert.ok(["pass", "refusal_text", "answer_emptied", "links_dropped", "redaction_excess"].includes(s.finalOutcome));
  }
});
