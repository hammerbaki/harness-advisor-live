// External-guardrail wrapper (Phase 3, mechanics only).
//
// A small DETERMINISTIC external policy layer applied to a candidate
// reader-facing answer — the counterfactual to the code-owned harness gate.
// Unlike the harness, it has NO deterministic-composer fallback: when it blocks,
// the reader gets a short refusal.
//
// Detectors are imported from server/detectors.mjs (single source of truth).
// This module scores the ANSWER only; source-link evaluation (links_dropped,
// source-link contract) is the scorer's job on the final response — see
// docs/phase3-guardrail-scoring-spec.md.
//
// Pure module: no dependencies, no node: builtins.

import {
  visibleAnswerDevLeakPattern,
  recommendationLanguagePattern,
  MIN_ANSWER_CHARS
} from "./detectors.mjs";

// Short, deterministic refusal. Matches REFUSAL_RE ("정책상" + "제공할 수 없습니다")
// so the scorer classifies it as a refusal.
export const GUARDRAIL_REFUSAL_TEXT =
  "정책상 본 답변을 제공할 수 없습니다. (외부 가드레일 데모 조건)";

// Global form of the leak pattern for span-by-span redaction.
const leakGlobal = new RegExp(visibleAnswerDevLeakPattern.source, "giu");
const REDACTION_MARK = "[redacted]"; // matches REDACTION_RE

// Apply the external policy to a candidate answer.
// Returns { action: "pass"|"redact"|"refuse", outcome, answer }.
//   - recommendation language  -> refuse (a bolt-on layer cannot safely rewrite)
//   - development leakage       -> redact spans (refuse if redaction empties it)
//   - otherwise                 -> pass (unchanged)
export function applyExternalGuardrail(answer) {
  const input = String(answer ?? "");

  if (recommendationLanguagePattern.test(input)) {
    return { action: "refuse", outcome: "refusal_text", answer: GUARDRAIL_REFUSAL_TEXT };
  }

  if (visibleAnswerDevLeakPattern.test(input)) {
    const redacted = input.replace(leakGlobal, REDACTION_MARK);
    // "Emptied" means little REAL content survives — measure with the redaction
    // markers removed, so an all-artifact answer (mostly "[redacted]") counts as
    // emptied rather than as a redact that left only markers.
    const remaining = redacted.split(REDACTION_MARK).join("").trim();
    if (remaining.length < MIN_ANSWER_CHARS) {
      return { action: "refuse", outcome: "answer_emptied", answer: GUARDRAIL_REFUSAL_TEXT };
    }
    return { action: "redact", outcome: "redacted", answer: redacted };
  }

  return { action: "pass", outcome: "pass", answer: input };
}
