# Evaluation Tables (Manuscript Appendix Material)

These tables are generated from artifacts committed to this repository and are
intended for the *Applied Sciences* manuscript. All numbers are reproducible from
the cited files at a fixed tag/commit; none require domain (investment) expert
judgment.

**Scope of claims.** This work does **not** claim to produce good investment
advice. The evaluable object is *harness behavior*: whether code-owned contracts
(source-grounding, leakage absence, link resolution, trace completeness,
recommendation-language absence) are preserved consistently, reproducibly, and
independently of which language model performs composition. Investment efficacy
is explicitly out of scope and is stated as a scope boundary, not a result.

Sources:
- Group maturity — `configs/groups.json`, `npm run validate:release` summary,
  `raw/manifests/<group>.source-backed-claims.json`.
- Live-LLM tables — `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json`
  (270 runs; 3 hosted models × 30 frozen scenarios × 3 repeats; temperature 0.2;
  OpenRouter gateway; `ADVISOR_LIVE_LLM_ALLOW_FAILURES=1`).

---

## Table A1 — Reference-slice coverage and maturity asymmetry

The five groups are **not** equally mature. Hanwha is the full reference vertical
slice; the other four are seed expansions that copy the Hanwha manifest shape.
The manuscript should frame generalization as *"one reference slice + four seed
expansions,"* not *"validated across five groups."*

| Group | Profile status | Source status | Listed cos. | Local sources inventoried | Extraction results | Source-backed claims | Frozen scenarios |
|---|---|---|---:|---:|---:|---:|---:|
| Hanwha | `reference-slice` | issuer source-backed; affiliate intake prepared | 9 | 104 | 95 | 20 | 6 |
| Samsung | `source-ready` | DART-financial + URL-intake ready | 15 | 112 | 58 | 36 | 6 |
| SK | `source-ready` | bounded source-backed reference slice | 5 | 132 | 132 | 27 | 6 |
| Hyundai Motor | `source-ready` | financial source-backed seed | 5 | 158 | 153 | 15 | 6 |
| LG | `source-ready` | financial source-backed seed | 9 | 98 | 87 | 15 | 6 |
| **Total** | | | **43** | **604** | **525** | **113** | **30** |

Notes: "Source-backed claims" counts entries in each group's promoted
`*.source-backed-claims.json` (runtime-eligible only; raw PDFs are not
redistributed). The 30 frozen scenarios (6 per group) are the live-LLM scenario
set; `evals/scenarios/sk.financial-seed.json` (4 cases) is a retained earlier
seed and is excluded from the 30.

---

## Table A2 — Live-LLM composition-boundary: per-model contract outcomes

Each model performed the language-composition step for all 30 scenarios × 3
repeats (n = 90 each). "First-pass live" = the model's structured output passed
the LLM output contract without recovery. "Final contract pass" = all eight
required harness checks passed (after deterministic fallback where the live
output failed). 95% CI is the Wilson score interval for the final pass rate.

| Requested model (OpenRouter) | n | First-pass live | Fallback used | Final contract pass | Final pass rate | 95% CI (Wilson) |
|---|---:|---:|---:|---:|---:|---|
| `openai/gpt-4.1-mini` | 90 | 89 | 1 | 77 | 85.6% | [76.8, 91.4] |
| `anthropic/claude-sonnet-4` | 90 | 74 | 16 | 62 | 68.9% | [58.7, 77.5] |
| `google/gemini-2.5-flash` | 90 | 71 | 19 | 59 | 65.6% | [55.3, 74.6] |
| **Pooled** | **270** | **234** | **36** | **198** | **73.3%** | **[67.8, 78.3]** |

**Between-model difference is significant:** Pearson χ²(2, N = 270) = 10.57,
p < 0.01 (critical value at α = 0.01 is 9.21) for final contract pass vs. model.
Interpretation: the *quantity* of LLM-side contract failures depends on the model,
which motivates the harness — the system must remain correct regardless of which
model is attached. This is reported as composition-boundary behavior, **not** a
general model benchmark. Hosted identifiers are aliases and may drift over time;
the run is cited as a dated snapshot, not an exactly-reproducible measurement.

---

## Table A3 — Inter-repeat consistency (reproducibility of judgments)

For each model, each of the 30 scenarios was run 3 times. "Unanimous" = all three
repeats produced the same final pass/fail verdict. This measures behavioral
consistency under nominal temperature 0.2.

| Requested model | Scenarios | Unanimous across 3 repeats | Consistency |
|---|---:|---:|---:|
| `openai/gpt-4.1-mini` | 30 | 27 | 90.0% |
| `anthropic/claude-sonnet-4` | 30 | 25 | 83.3% |
| `google/gemini-2.5-flash` | 30 | 22 | 73.3% |
| **Overall** | **90** | **74** | **82.2%** |

Residual non-determinism (17.8% of model×scenario cells flip across repeats) is a
property of the hosted models, not of the harness, and is itself a reportable
finding for the "consistency" theme.

---

## Table A4 — Per-contract-check failure decomposition (central result)

This is the empirical core of the harness-engineering argument. Of the eight
required contract checks, the five enforced structurally by code **never fail**
across all 270 runs and all three heterogeneous models; the three that depend on
the model's free-form composed output account for **all** failures.

| Required contract check | Enforced by | Failures / 270 |
|---|---|---:|
| `recommendation_language_absence` | Harness (language validator + finalizer) | **0** |
| `development_leak_absence` | Harness (leakage regex filter) | **0** |
| `source_link_package` | Harness (assembly) | **0** |
| `trace_contract` | Harness (trace envelope) | **0** |
| `followup_quality` | Harness (generation) | **0** |
| `source_claim_references` | LLM-composed output | 18 |
| `visible_answer_structure` | LLM-composed output | 20 |
| `live_llm_output_contract` | LLM-composed output | 36 |

**Reading.** Moving a guarantee out of the prompt and into code makes it
*model-independent and provable*: the compliance-critical property for a finance
setting — no buy/sell/target-price recommendation language reaching the reader —
held at 100% (0/270) across GPT, Claude, and Gemini, including on every run where
the live model failed its own output contract and the deterministic composer took
over. No investment expert is required to verify this; it is a code-checkable
invariant. Conversely, the properties left to the model's free composition are
exactly where variance and failure concentrate (74/270 total required failures),
which is the motivation for the harness rather than a counterexample to it.

---

## Reproduction

```bash
npm ci
npm run validate:release          # regenerates the Table A1 maturity summary
# Table A2–A4 are computed from the committed result artifact:
#   evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json
```

Reproduction begins from the **promoted source-backed claims**; raw issuer PDFs
are not redistributed (copyright), so the source-to-claim promotion pipeline is
not externally re-runnable. The live-LLM run is a dated snapshot and is not
bit-for-bit reproducible because hosted model weights behind the aliases may
change.
