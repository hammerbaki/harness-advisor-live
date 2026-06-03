# Live LLM composition-boundary evaluation

This note records the expanded live-LLM evaluation protocol used for the
current manuscript revision.

## Main arXiv run

The main run uses the full fixed validation scenario set:

- 3 hosted models through OpenRouter
- 30 fixed validation scenarios
- 3 repeats per model/scenario pair
- temperature 0.2

This produces 270 planned live-LLM composition-boundary runs.

The run reported in the manuscript is:

- `234/270` first-pass structured-output passes,
- `36` deterministic fallback/recovery paths,
- `198/270` final harness-contract passes,
- `72/270` final required harness failures.

These counts are reported as composition-boundary behavior. They are not a
general hosted-model benchmark.

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

## Progress monitoring

Long runs write progress artifacts next to the final result unless explicit
paths are supplied:

- `*.progress.jsonl`: append-only event stream with `run_start`,
  `run_complete`, and `run_error` records.
- `*.progress.json`: current snapshot with completed run count, rolling
  summary, and recent required failures.

The default paths are derived from `ADVISOR_LIVE_LLM_OUTPUT`. For the main
run above, they are:

```bash
evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.progress.jsonl
evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.progress.json
```

Watch a run without waiting for the final JSON:

```bash
tail -f evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.progress.jsonl
```

Override the paths when running several experiments at once:

```bash
ADVISOR_LIVE_LLM_PROGRESS_LOG=evals/results/live-llm-custom.progress.jsonl \
ADVISOR_LIVE_LLM_PROGRESS_SNAPSHOT=evals/results/live-llm-custom.progress.json \
ADVISOR_LIVE_LLM_PROGRESS_EVERY=5 \
npm run eval:live-llm
```

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

## Paper alignment

The current manuscript cites this repository for the live-LLM result artifact,
the run log, and the validation/latency artifacts. Keep this document aligned
with `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json`
when revising the paper.
