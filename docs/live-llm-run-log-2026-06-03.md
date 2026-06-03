# Live LLM run log - 2026-06-03

## Purpose

This run records the expanded live-LLM composition-boundary experiment for the
enterprise agent harness. The experiment tests whether hosted LLMs can be
attached at the answer-composition boundary while the same code-owned source,
trace, answer, leakage, link, follow-up, and recommendation-language contracts
remain active.

## Configuration

- Provider gateway: OpenRouter
- Models:
  - `anthropic/claude-sonnet-4`
  - `openai/gpt-4.1-mini`
  - `google/gemini-2.5-flash`
- Temperature: `0.2`
- Scenario policy: full fixed validation scenario set
- Scenario count: `30`
- Repeats: `3`
- Planned runs: `270`
- Output file:
  `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json`

## Command

```bash
export OPENROUTER_API_KEY="<redacted>"
ADVISOR_LIVE_LLM_SCENARIO_POLICY=all \
ADVISOR_LIVE_LLM_REPEATS=3 \
ADVISOR_LIVE_LLM_TEMPERATURES=0.2 \
ADVISOR_LIVE_LLM_ALLOW_FAILURES=1 \
ADVISOR_LIVE_LLM_OUTPUT=evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json \
npm run eval:live-llm
```

An initial local attempt did not receive the API key through stdin and produced
only `missing_credentials` outcomes. That file is retained locally as an
operational attempt log and is excluded from the reported API run.

## Aggregate result

| Measure | Count |
|---|---:|
| Planned runs | 270 |
| Live structured outputs passing the output contract on first pass | 234 |
| Runs using deterministic fallback/recovery | 36 |
| Final runs passing all required harness checks | 198 |
| Final runs with at least one required harness failure | 72 |
| Missing-credential runs | 0 |

## Provider breakdown

| Requested model | Planned | First-pass live validated | Fallback/recovery | Final contract pass | Final required failure |
|---|---:|---:|---:|---:|---:|
| `anthropic/claude-sonnet-4` | 90 | 74 | 16 | 62 | 28 |
| `openai/gpt-4.1-mini` | 90 | 89 | 1 | 77 | 13 |
| `google/gemini-2.5-flash` | 90 | 71 | 19 | 59 | 31 |

## Failure-process summary

| Process stage or contract check | Pass | Fail | Recovery used | Not needed |
|---|---:|---:|---:|---:|
| Credential check | 270 | 0 | - | - |
| Live LLM call | 269 | 1 | - | - |
| JSON parse | 267 | 2 | - | - |
| Output-contract validation | 234 | 35 | - | - |
| Recovery | - | - | 36 | 234 |
| Source-claim references | 252 | 18 | - | - |
| Trace contract | 270 | 0 | - | - |
| Visible answer structure | 250 | 20 | - | - |
| Development-leak absence | 270 | 0 | - | - |
| Source-link package | 270 | 0 | - | - |
| Follow-up quality | 270 | 0 | - | - |
| Recommendation-language absence | 270 | 0 | - | - |
| Final harness result | 198 | 72 | - | - |

## Failure taxonomy

- Live structured validation succeeded: `234`
- First-pass output-contract failures: `36`
- JSON-object failures: `2`
- Schema or answer-contract failures: `34`
- Fallback recovery used: `36`
- Fallback answer-contract pass: `34`
- Fallback answer-contract failure: `2`
- Missing credentials: `0`

## Interpretation boundary

This is a composition-boundary sensitivity run, not a general model benchmark.
The scientific object is the interaction between live LLM outputs and the
code-owned harness contracts. The run documents both first-pass live success and
failure/recovery paths; fallback recovery is not counted as first-pass live LLM
success.

## Manuscript reporting status

The current manuscript reports this run as the live-LLM composition-boundary
check: three hosted model identifiers, all 30 fixed validation scenarios, three
repeats, temperature 0.2, 234/270 first-pass structured-output passes, 36
fallback/recovery paths, and 198/270 final harness-contract passes. The paper
keeps this result separate from deterministic fixed-scenario validation,
fault-injection validation, and orchestration latency.
