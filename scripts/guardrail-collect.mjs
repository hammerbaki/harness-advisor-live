// Phase 3 guardrail collection plumbing (v0.5.15-pre).
//
// Turns scenarios × conditions × repeats into run records by calling
// /api/advisor with body.ablation = condition. No batch policy of its own; the
// caller decides scope and output (see evaluate-guardrail-baseline.mjs). Records
// are exactly what scripts/guardrail-scorer.mjs consumes.
//
// Live vs fixture is decided by the SERVER at baseUrl (its credentials), not
// here — so this module is verifiable at zero cost against a fixture-mode server.

import { readFile } from "node:fs/promises";

export const DEFAULT_CONDITIONS = ["harness", "prompt-only", "external-guardrail"];

// Load flat scenario specs from set descriptors:
//   [{ scenarioSet: "reference", path: "evals/scenarios/samsung.reference-slice.json", limit?: 1 }]
export async function loadScenarioSpecs(setDescriptors) {
  const specs = [];
  for (const d of setDescriptors) {
    const file = JSON.parse(await readFile(d.path, "utf8"));
    const groupId = file.groupId ?? "samsung";
    const scenarios = (file.scenarios ?? []).slice(0, d.limit ?? Infinity);
    for (const s of scenarios) {
      specs.push({ scenarioSet: d.scenarioSet, groupId, scenarioId: s.id, question: s.question });
    }
  }
  return specs;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Call /api/advisor once and shape a run record. Retries transient failures so a
// single blip doesn't abort a long batch; throws only after exhausting retries.
async function callAdvisor(baseUrl, spec, condition, repeatIndex, model, retries = 1) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${baseUrl}/api/advisor`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupId: spec.groupId, question: spec.question, ablation: condition })
      });
      if (!res.ok) throw new Error(`advisor HTTP ${res.status}`);
      const resp = await res.json();
      return {
        condition,
        scenarioSet: spec.scenarioSet,
        scenarioId: spec.scenarioId,
        model: model ?? resp.trace?.llmModel ?? "unknown",
        repeatIndex,
        answer: resp.answer ?? "",
        links: resp.links ?? [],
        wrapperAction: resp.wrapperAction ?? null,
        guardrailOutcome: resp.guardrailOutcome ?? null,
        responseMode: resp.mode ?? null,
        runtimeMode: resp.trace?.runtimeMode ?? null,
        serverAblation: resp.ablation ?? null // server-echoed; for surfacing checks
      };
    } catch (error) {
      lastErr = error;
      if (attempt < retries) await sleep(600);
    }
  }
  throw lastErr;
}

// Collect records for every scenario × condition × repeat (sequential — keeps
// live cost predictable and avoids hammering a single spawned server). A call
// that fails after retries is recorded as a `collect-error` record (answer empty)
// rather than aborting the whole batch, so a long run is recoverable/inspectable.
export async function collectRecords({ baseUrl, scenarios, conditions = DEFAULT_CONDITIONS, repeats = 1, model = null }) {
  const records = [];
  for (const spec of scenarios) {
    for (const condition of conditions) {
      for (let r = 1; r <= repeats; r++) {
        try {
          records.push(await callAdvisor(baseUrl, spec, condition, r, model));
        } catch (error) {
          records.push({
            condition, scenarioSet: spec.scenarioSet, scenarioId: spec.scenarioId,
            model: model ?? "unknown", repeatIndex: r,
            answer: "", links: [], wrapperAction: null, guardrailOutcome: null,
            responseMode: "collect-error", serverAblation: null,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }
  }
  return records;
}
