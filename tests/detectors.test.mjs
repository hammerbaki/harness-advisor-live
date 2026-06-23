// Drift-check for the canonical detectors (server/detectors.mjs).
//
// These pin the SEMANTICS of the shared detectors so that any future edit to the
// single source of truth is caught here, and so the server validators, the
// Phase-3 guardrail wrapper, and the scorer cannot silently diverge.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  visibleAnswerDevLeakPattern,
  recommendationLanguagePattern,
  REFUSAL_RE,
  REDACTION_RE,
  MIN_ANSWER_CHARS,
  MIN_HEADINGS
} from "../server/detectors.mjs";

test("leakage detector flags internal artifacts, allows clean prose", () => {
  for (const leak of [
    "hanwha-sbc-07",
    "schemaVersion: advisor-trace",
    "processTrace 내용",
    "fixture:dart",
    "this is a rubric for eval",
    "raw JSON dump"
  ]) {
    assert.ok(visibleAnswerDevLeakPattern.test(leak), `should flag leak: ${leak}`);
  }
  assert.equal(
    visibleAnswerDevLeakPattern.test("삼성전자의 2024년 영업이익률은 10.9%로 개선됐습니다."),
    false,
    "clean source-backed prose must not be flagged"
  );
});

test("recommendation-language detector flags buy/sell/target phrasing", () => {
  for (const rec of ["매수 추천", "매도하세요", "목표가 90,000원", "투자의견 상향"]) {
    assert.ok(recommendationLanguagePattern.test(rec), `should flag recommendation: ${rec}`);
  }
  assert.equal(
    recommendationLanguagePattern.test("영업이익률과 현금흐름의 동행 여부를 관찰합니다."),
    false,
    "neutral monitoring language must not be flagged"
  );
  // legitimate domain usage that must stay allowed (product-mix, not a stock call)
  assert.equal(recommendationLanguagePattern.test("AI향 고부가가치 제품 비중 확대"), false);
});

test("refusal and redaction detectors behave", () => {
  assert.ok(REFUSAL_RE.test("정책상 답변을 제공할 수 없습니다."));
  assert.ok(REFUSAL_RE.test("This request was blocked."));
  assert.equal(REFUSAL_RE.test("삼성전자 메모리 실적이 회복됐습니다."), false);
  assert.ok(REDACTION_RE.test("영업이익 [REDACTED]"));
  assert.ok(REDACTION_RE.test("매출 ▇▇▇"));
  assert.equal(REDACTION_RE.test("매출 300.9조원"), false);
});

test("scoring constants are pinned (guard against silent change)", () => {
  assert.equal(MIN_ANSWER_CHARS, 40);
  assert.equal(MIN_HEADINGS, 3);
});
