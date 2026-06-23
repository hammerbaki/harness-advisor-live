# Phase 3 — External-guardrail baseline: design note

Status: **design** (no code yet). This note fixes the comparison conditions
*before* any guardrail code is attached, so the experiment is clean and the
results are citable. It extends, not replaces, the prompt-only ablation
(`docs/ablation-design.md`).

## Question

The harness moves source-grounding, leakage control, link resolution, trace
generation, and recommendation-language control **out of the prompt and into
code**. RQ3 (prompt-only ablation) already shows the code-owned gate blocks
violations a prompt-only condition admits. This phase asks the complementary
question: **how does the code-owned harness compare to an *external guardrail
layer*** — the standard alternative practitioners reach for — on the same
contracts? Does an external policy layer reduce the LLM-composed failures, and
does it introduce *new* failures (notably false refusals) that the harness does
not?

## Conditions (comparison axis)

A single composition model is held fixed; the **enforcement layer** varies:

1. `harness` — the full code-owned contract gate + deterministic fallback (current
   system).
2. `prompt-only` — gate disabled, raw live output reaches the reader (existing
   ablation; reuse `ADVISOR_ABLATION=prompt-only`).
3. `external-guardrail` — gate disabled, but a separate external policy layer
   wraps the model I/O (pre-prompt rules + post-output checks). **Start with a
   small deterministic policy layer** (an explicit allow/deny + redaction pass
   over input/output), not a heavyweight integration. A framework such as NeMo
   Guardrails / Guardrails AI can be added later as a second `external-*`
   condition once the harness comparison is established.

Reporting pairs by model × scenario × repeat, as in the live-LLM tables.

## Evaluation sets (reuse existing, frozen)

- `evals/scenarios/*.reference-slice.json` — normal questions (utility + contract).
- `evals/scenarios/*.adversarial-stress.json` — recommendation-bait + leak-bait
  (where the harness's advantage concentrated under the ablation).
- `evals/results/fault-injection-contract-sensitivity.*.json` — mutation
  sensitivity (sanity that each layer detects injected contract faults).

No new scenarios are required for Increment 1; reuse the frozen sets so results
are comparable to the existing tables.

## Metrics (per condition × scenario)

Code-checkable, no domain expert required:

- **Leakage absence** — internal claim IDs / trace / JSON / eval vocab in the
  reader-facing answer (`visibleAnswerDevLeakPattern`).
- **Recommendation-language absence** — buy/sell/target-price phrasing.
- **Source-link contract** — every cited link resolves; source-state labels valid.
- **False refusal rate** — the external layer wrongly blocks/empties a legitimate
  answer (the failure mode unique to bolt-on guardrails; the harness should have
  ~0 because it falls back deterministically rather than refusing).
- **Answer utility (proxy)** — answer present, insight-first structure intact,
  expected source-backed claim references present (reuse the rubric structure
  checks; not an investment-quality judgment).

Primary contrast: **contract violations admitted** vs **false refusals
introduced**, harness vs external-guardrail. Significance via McNemar on paired
model × scenario × repeat outcomes, as in the existing ablation.

## Output paths (must not touch committed baselines)

All Phase 3 runs write **new, dated** result files and never overwrite an existing
committed artifact. See `docs/live-run-safety.md`.

- `evals/results/guardrail-baseline.<conditions>.<date>.json`
- Use `ADVISOR_*_OUTPUT` scratch redirection while iterating; only commit a run
  that is intended as a citable snapshot (then bump `VERSION` + `CHANGELOG`).

## Increment 1 (minimal, deterministic)

> Prerequisite — Increment 0.5: the allow/block rules, false-refusal definition,
> decision constants, and result JSON schema are frozen in
> [`phase3-guardrail-scoring-spec.md`](phase3-guardrail-scoring-spec.md) before any
> wrapper code is written.

1. Implement the small deterministic external policy layer as a *separate* wrapper
   (not inside the harness gate), selectable like the ablation.
2. Run `harness` vs `external-guardrail` on the 30 reference + adversarial
   scenarios, fixed model, ≥3 repeats, to a dated scratch result file.
3. Tabulate violations-admitted vs false-refusals; add a results table mirroring
   A2–A4 once stable.
4. Only then consider a heavyweight framework as an additional condition.

## Scope boundary

As elsewhere, the evaluable object is **harness/guardrail behavior on
code-checkable contracts**, not investment quality. State this in the section
intro so the external-baseline comparison is not read as a model-quality or
advice-quality benchmark.
