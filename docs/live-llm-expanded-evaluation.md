# Live LLM composition-boundary evaluation

This note records the expanded live-LLM evaluation protocol used after the
initial 15-run boundary check.

## Main arXiv run

The main run uses the full fixed validation scenario set:

- 3 hosted models through OpenRouter
- 30 fixed validation scenarios
- 3 repeats per model/scenario pair
- temperature 0.2

This produces 270 planned live-LLM composition-boundary runs.

```bash
export OPENROUTER_API_KEY="<redacted>"
ADVISOR_LIVE_LLM_SCENARIO_POLICY=all \
ADVISOR_LIVE_LLM_REPEATS=3 \
ADVISOR_LIVE_LLM_TEMPERATURES=0.2 \
ADVISOR_LIVE_LLM_ALLOW_FAILURES=1 \
ADVISOR_LIVE_LLM_OUTPUT=evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json \
npm run eval:live-llm
```

`ADVISOR_LIVE_LLM_ALLOW_FAILURES=1` is intentional. Live model failures are
part of the measurement object, not a reason to stop the batch.

## Temperature stress run

Temperature is treated as a stress condition, not as a separate benchmark.
Run it on a smaller scenario subset unless the cost budget allows a full
matrix.

```bash
export OPENROUTER_API_KEY="<redacted>"
ADVISOR_LIVE_LLM_SCENARIO_POLICY=representative \
ADVISOR_LIVE_LLM_REPEATS=1 \
ADVISOR_LIVE_LLM_TEMPERATURES=0,0.2,0.7 \
ADVISOR_LIVE_LLM_ALLOW_FAILURES=1 \
ADVISOR_LIVE_LLM_OUTPUT=evals/results/live-llm-composition-boundary.temperature-sweep.2026-06-03.json \
npm run eval:live-llm
```

Use `ADVISOR_LIVE_LLM_SCENARIO_IDS` for a custom subset:

```bash
ADVISOR_LIVE_LLM_SCENARIO_IDS="samsung-frozen-001-electronics-memory-hbm,sk-frozen-001-hynix-memory-cycle" \
npm run eval:live-llm
```

## Output interpretation

The script reports two levels of outcome:

- `liveStructuredValidated`: the live model produced a structured output that
  passed the LLM output contract on the first pass.
- `fallbackRecoveryUsed`: the live model failed the output contract and the
  deterministic fallback composer was used.

Each run also records the failure path instead of only the final pass/fail
state:

- `compositionBoundaryProcess` records credential checks, the live provider
  call, JSON parsing, output-contract validation, and whether deterministic
  recovery was used.
- `contractEvaluationProcess` records the downstream harness checks for source
  claims, trace, visible answer structure, leakage, links, follow-ups, and
  recommendation-language absence.
- `processStageSummary` aggregates those stages across providers, scenarios,
  repeats, and temperature settings.

By default, live model text is recorded as a hash, character count, and short
preview. Set `ADVISOR_LIVE_LLM_STORE_RAW_OUTPUT=1` only for private diagnostic
runs that need the full raw model output.

Fallback runs are further divided into:

- `fallbackAnswerContractPass`: the fallback answer preserved all required
  non-live answer, trace, source, leakage, link, and follow-up checks.
- `fallbackAnswerContractFailure`: the fallback path also failed at least one
  required non-live check.

This separation keeps the paper from treating fallback recovery as a live-LLM
success while still documenting whether the harness protected the reader-facing
contract after a live-model failure.

## Reporting boundary

The arXiv paper should report this as a composition-boundary sensitivity check.
It is not a general model benchmark and does not replace the later SCI work on
model expansion, user evaluation, and ablation.
