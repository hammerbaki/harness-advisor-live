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

// Call /api/advisor once and shape a run record.
async function callAdvisor(baseUrl, spec, condition, repeatIndex, model) {
  const res = await fetch(`${baseUrl}/api/advisor`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ groupId: spec.groupId, question: spec.question, ablation: condition })
  });
  if (!res.ok) throw new Error(`advisor HTTP ${res.status} for ${spec.scenarioId}/${condition}`);
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
    serverAblation: resp.ablation ?? null // server-echoed; for surfacing checks
  };
}

// Collect records for every scenario × condition × repeat (sequential — keeps
// live cost predictable and avoids hammering a single spawned server).
export async function collectRecords({ baseUrl, scenarios, conditions = DEFAULT_CONDITIONS, repeats = 1, model = null }) {
  const records = [];
  for (const spec of scenarios) {
    for (const condition of conditions) {
      for (let r = 1; r <= repeats; r++) {
        records.push(await callAdvisor(baseUrl, spec, condition, r, model));
      }
    }
  }
  return records;
}
