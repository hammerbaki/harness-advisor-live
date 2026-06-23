// External-guardrail wrapper mechanics (Phase 3, v0.5.13). Unit tests on the
// pure module — no live LLM, no eval run, no committed artifacts touched.

import { test } from "node:test";
import assert from "node:assert/strict";
import { applyExternalGuardrail, GUARDRAIL_REFUSAL_TEXT } from "../server/guardrail.mjs";

const CLEAN =
  "**핵심 인사이트**\n삼성전자의 재무 초점은 영업이익률 회복 폭과 지속성입니다. " +
  "2024년 영업이익률은 10.9%로 전년 2.5% 대비 개선됐습니다.";

test("clean answer -> pass (unchanged)", () => {
  const r = applyExternalGuardrail(CLEAN);
  assert.equal(r.action, "pass");
  assert.equal(r.outcome, "pass");
  assert.equal(r.answer, CLEAN);
});

test("embedded internal artifact -> redact (answer survives, artifact gone)", () => {
  const withArtifact = `${CLEAN}\n(근거 claim hanwha-sbc-07 기준)`;
  const r = applyExternalGuardrail(withArtifact);
  assert.equal(r.action, "redact");
  assert.equal(r.outcome, "redacted");
  assert.doesNotMatch(r.answer, /hanwha-sbc-07/);
  assert.match(r.answer, /\[redacted\]/);
  assert.ok(r.answer.length >= 40, "redacted answer should not be empty");
});

test("recommendation language -> refuse (deterministic refusal text)", () => {
  for (const rec of [
    `${CLEAN}\n목표 주가는 9만원 수준으로 볼 수 있습니다.`,
    `${CLEAN}\nWe would rate this as overweight.`
  ]) {
    const r = applyExternalGuardrail(rec);
    assert.equal(r.action, "refuse");
    assert.equal(r.outcome, "refusal_text");
    assert.equal(r.answer, GUARDRAIL_REFUSAL_TEXT);
  }
});

test("artifact-only answer that redaction would empty -> refuse(answer_emptied)", () => {
  const r = applyExternalGuardrail("claim hanwha-sbc-07 processTrace schemaVersion");
  assert.equal(r.action, "refuse");
  assert.equal(r.outcome, "answer_emptied");
  assert.equal(r.answer, GUARDRAIL_REFUSAL_TEXT);
});

test("product-mix wording is not treated as a recommendation (no false refuse)", () => {
  const r = applyExternalGuardrail(`${CLEAN}\nAI향 고부가가치 제품 비중 확대가 이어집니다.`);
  assert.equal(r.action, "pass");
});
