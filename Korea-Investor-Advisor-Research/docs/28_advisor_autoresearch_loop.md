# Advisor Autoresearch Loop

## Purpose

This project needs an automatic keep/discard loop before adding live API
complexity. The goal is not to let an agent freely rewrite the finance advisor.
The goal is to run fixed investor questions, score the answer and trace against
a bounded rubric, and keep changes only when the measured result improves
without breaking required source-backed guarantees.

This adapts the Karpathy `autoresearch` pattern to a financial advisor setting:

```text
fixed scenario -> run advisor -> score rubric -> inspect regression -> keep or discard
```

The loop is intentionally narrower than an open-ended research agent because
investment answers require traceability, conservative source status disclosure,
and repeatable evidence.

## Original PoC Elements Reused

The original `../HanWha-Advisor-main` folder did not contain a single clean
advisor-evaluation runner. It did contain useful regression ideas that now
become first-class baseline checks:

- follow-up questions must be consistently present and non-generic;
- preamble such as "조회합니다" or "브리핑 드립니다" must not leak into the
  answer;
- meta narration such as "RAG 수치로 분석을 드리겠습니다" must not appear;
- progress/status events must be ordered and understandable to users;
- traces must not expose raw user text or PII-like freeform keys;
- chart or TTS placeholders must not leak into text answers;
- source/tool status must remain inspectable outside the main user answer.

The clean implementation keeps these ideas but moves the control point from a
long prompt to a rubric and deterministic evaluator.

## Baseline Artifacts

```text
evals/scenarios/hanwha.reference-slice.json
evals/rubrics/advisor.answer-quality.v0.2.json
scripts/evaluate-advisor-scenarios.mjs
evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json
```

The scenario file defines the frozen questions and minimum expected
source-backed claims. The rubric defines the score. The evaluator runs the API,
checks the answer and trace, writes a JSON result, and exits non-zero when
required checks fail.

## Score Categories

The current rubric scores 100 points:

| Criterion | Weight | Required |
| --- | ---: | --- |
| expected source-backed claim coverage | 18 | yes |
| trace contract and tool order | 14 | yes |
| investor-facing answer structure and scenario signals | 12 | yes |
| briefing quality | 12 | yes |
| absence of development/debug leakage | 12 | yes |
| source-status disclosure | 10 | no |
| follow-up quality | 7 | no |
| question-specific template variation | 5 | no |
| link package | 5 | no |
| latency budget | 3 | no |
| original PoC regression guards | 2 | no |

Baseline thresholds:

```text
pass >= 85
paper baseline >= 90
keep candidate >= 92
```

Follow-up quality includes a customer-facing constraint. Questions about
evaluation trace, logs, prompts, schemas, or paper workflow are useful in this
Codex research thread, but they must not be offered as in-app investor
follow-ups.

Briefing quality is not a buy/sell investment recommendation metric. It checks
whether the answer avoids vague adjectives, adds comparison or causal context,
states a clear briefing judgment axis, and prioritizes monitoring points using
public-data evidence boundaries.

Template variation is a product-quality guard. It checks whether the answer
uses the question-specific `answerPlan` rather than repeating the same generic
section list across news, finance, pipeline, value-up, and governance
questions. This keeps code-owned safety from turning into mechanical prose.

## How To Run

```bash
npm run eval:advisor
```

By default the script starts a local API-only server on port `8799`, runs the
Hanwha frozen scenarios, and writes the result summary to `evals/results/`.

To evaluate an already-running server:

```bash
ADVISOR_EVAL_BASE_URL=http://localhost:5173 npm run eval:advisor
```

To test another scenario set later:

```bash
ADVISOR_EVAL_SCENARIO=evals/scenarios/samsung.reference-slice.json npm run eval:advisor
```

## Keep/Discard Rule

A change can be kept as a paper/demo improvement only when:

1. no required check fails;
2. average score stays above the paper-baseline threshold;
3. no scenario loses required source-backed claim coverage;
4. visible answers do not reintroduce development trace prose;
5. exported traces still preserve the evidence needed for paper review.

If a change improves one scenario but weakens another, record it as an
experiment, not as the new baseline.

## Expansion Rule

Samsung, SK, Hyundai Motor, and LG should not receive looser rules. They should
receive their own scenario files only after their source manifests, wiki pages,
and source-backed claim sets exist. The paper claim becomes stronger if the same
rubric can score every group with the same schema.
