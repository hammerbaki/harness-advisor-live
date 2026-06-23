# Prompt-Only Ablation: Design and Implementation

Status: **implemented** (see the "Implementation (built)" section below). Result
artifacts are committed under `evals/results/ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json`
and `evals/results/ablation-adversarial.c0-vs-c3.2026-06-13.json`. This is the
primary experiment that substitutes for an investment-efficacy evaluation. It
establishes the contribution of *harness engineering* using only code-checkable
metrics — no domain (investment) expert is required.

## Motivation and central hypothesis

The thesis is that moving responsibility for facts, source-grounding, leakage
control, link resolution, trace generation, and recommendation-language control
**out of the prompt and into code** makes those properties model-independent and
reliably enforced. Table A4 already shows the five code-owned checks never fail
across 270 runs and three models, while the three LLM-composed checks absorb all
74 failures. The ablation makes the *counterfactual* explicit: what happens to
those same checks when the harness is removed and the model is instead instructed
(in the prompt) to obey the same rules?

- **H1 (enforcement).** The prompt-only condition produces strictly more required
  contract failures than the full harness on the same scenarios — in particular,
  non-zero `recommendation_language_absence` and `development_leak_absence`
  failures, which are 0/270 under the harness.
- **H2 (model dependence).** Failure rate under prompt-only varies significantly
  across the three models (the harness is meant to flatten this variance).
- **H3 (consistency).** Inter-repeat consistency (Table A3) is lower under
  prompt-only than under the harness.

If H1–H3 hold, the harness's value is demonstrated as a measurable engineering
property, independent of whether any individual answer is good investment advice.

## Conditions (graded ablation)

All conditions share identical inputs: the same 30 frozen scenarios, the same
3 hosted models, the same source packages, temperature 0.2, 3 repeats. They
differ only in how much of the harness is active. This lets the paper attribute
each guarantee to a specific component rather than to the harness as a black box.

| Condition | Source claims injected by code | Output-contract validation + deterministic fallback | Leakage / recommendation-language finalizer | Trace + link assembly | Rules location |
|---|---|---|---|---|---|
| **C0 — Full harness** (= current system, Table A2/A4) | yes | yes | yes | yes (code) | code + short policy prompt |
| **C1 — No post-filter** | yes | yes | **no** | yes (code) | code |
| **C2 — No validation/fallback** | yes | **no** (raw LLM output passed through) | **no** | yes (code) | code |
| **C3 — Prompt-only** | **no** (claims described in prompt only) | **no** | **no** | **no** (model asked to emit links/trace text) | **prompt only** |

C3 is the realistic "prompt engineering" baseline: a capable model is given a
long system prompt containing the company facts, the source list, and every rule
("cite sources, never recommend buy/sell, never leak internal IDs, output these
sections"), then its raw output is shown to the reader unmodified.

## Held constant

Same scenario set, model set, gateway (OpenRouter), temperature, repeat count,
and the **same eight contract checks** as the scorer (`runChecks` in
`scripts/evaluate-advisor-fault-injection.mjs` / the live-LLM evaluator). The
checks are applied identically to every condition; only the system under test
changes. The prompt text for C3 is frozen and version-hashed like the policy
blocks.

## Metrics (all code-computed)

1. **Per-check failure rate** per condition × model (the Table A4 decomposition).
2. **Final contract pass rate** with Wilson 95% CI per condition × model.
3. **Inter-repeat consistency** (% of scenario×model cells unanimous over 3
   repeats), per condition.
4. **Leakage incidents** and **recommendation-language incidents** counted
   separately — these are the compliance-critical, expert-free outcomes.

## Statistical plan

- Because conditions are run on the *same* scenarios, compare C0 vs C3 per check
  with **McNemar's test** (paired binary outcomes), reporting the discordant-pair
  counts and exact p-values. This is the correct test for "same items, two
  systems," and is more defensible than the unpaired χ² used for between-model
  comparison in Table A2.
- For model-dependence within C3 (H2), use Pearson χ² across the three models on
  final pass, mirroring Table A2.
- Report effect sizes (risk difference in failure rate, with CI), not only
  p-values — MDPI reviewers expect this.

## Implementation (built)

Implemented as an environment/request-gated branch in `server/index.mjs` plus a
condition axis in the live-LLM evaluator. No new runtime architecture was
required, and the default (`harness`) path is byte-identical to the prior
production behavior (verified: the deterministic Samsung baseline still passes
6/6 at 100/100).

**Where the enforcement actually lives.** Inspecting the code clarified the
ablation: the single decisive gate is `validateStructuredAdvisorOutput` followed
by deterministic fallback inside `composeWithLLM`. That validator is what rejects
leaking, recommending, or malformed live output and replaces it with the clean
deterministic answer — which is why the five code-owned checks pass 270/270.
`finalizeAdvisorAnswer` is only whitespace normalization, not an enforcement
gate. So the meaningful comparison collapses to two conditions:

- **C0 `harness`** (default): validate → use live output if it passes, else
  deterministic fallback. Unchanged production behavior.
- **C3 `prompt-only`**: the validate-and-fallback gate is disabled; the live
  model's output reaches the reader unguarded (the model is still *told* every
  rule in the prompt — it simply isn't enforced in code). The eight contract
  checks then run on ungated output. The validation result is still recorded for
  reporting but no longer changes the answer.

**Flags.**
- Server: `ADVISOR_ABLATION=harness|prompt-only` (env), or per-request
  `{"ablation":"prompt-only"}` in the `/api/advisor` body (body wins over env).
  `resolveAblation` accepts `c0`/`c3` aliases.
- Evaluator: `ADVISOR_LIVE_LLM_ABLATIONS=harness,prompt-only` adds an ablation
  dimension to the run matrix; each run and provider summary records its
  `ablation`, and `design.ablations` records the axis. Default `harness`
  reproduces the original run unchanged.

**Run command (needs `OPENROUTER_API_KEY`).**

```bash
export OPENROUTER_API_KEY="<redacted>"
ADVISOR_LIVE_LLM_SCENARIO_POLICY=all \
ADVISOR_LIVE_LLM_REPEATS=3 \
ADVISOR_LIVE_LLM_TEMPERATURES=0.2 \
ADVISOR_LIVE_LLM_ABLATIONS=harness,prompt-only \
ADVISOR_LIVE_LLM_ALLOW_FAILURES=1 \
ADVISOR_LIVE_LLM_OUTPUT=evals/results/ablation-prompt-only.c0-vs-c3.30x3.<date>.json \
npm run eval:live-llm
```

This is 3 models × 30 scenarios × 3 repeats × 2 conditions = 540 live runs.
Analysis groups runs by `ablation` and compares the per-check failure
decomposition (Table A4) and final pass rates with paired McNemar tests.

**Scorer note.** Under `prompt-only`, the first check (`live_llm_output_contract`)
reflects a bypassed gate (`responseMode: prompt-only-raw`); the load-bearing
comparison is on the content checks — `development_leak_absence`,
`recommendation_language_absence`, `visible_answer_structure`,
`source_claim_references` — applied identically to both conditions.

## Cost and scope

C0 vs C3 at 30 × 3 × 3 = 270 runs each is ~540 live calls; adding C1/C2 doubles
that. If budget-limited, run **C0 vs C3 only** (the headline comparison) at full
size and report C1/C2 as a smaller representative subset, logging explicitly that
the intermediate conditions are subsampled (no silent truncation).

## Threats to validity

- **Prompt quality confound.** A weak C3 prompt would unfairly favor the harness.
  Mitigation: write C3 as a genuinely strong, good-faith prompt (all rules, all
  facts, few-shot formatting), freeze and hash it, and include it verbatim in the
  appendix so reviewers can judge fairness.
- **Check circularity.** Some checks (trace, links) are trivially satisfied by the
  harness because the harness builds them. This is the point, but the paper must
  state it plainly and separate "checks the harness constructs" from "checks on
  model-composed content" (already the Table A4 split).
- **Hosted-model drift.** Same snapshot caveat as Table A2; cite by date.
