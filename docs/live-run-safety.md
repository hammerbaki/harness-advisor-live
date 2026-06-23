# Live-run and eval-output safety

This repo is the single source of truth for committed, manuscript-cited result
artifacts under `evals/results/` and `evals/dashboard/`. Some npm scripts
**regenerate those exact files by default**. Running one as a casual "did my
change break anything?" check will silently overwrite a pinned artifact (this is
exactly how the v0.5.5 → v0.5.6 baseline incident happened).

**Golden rule:** never let a validation run regenerate a committed result file as
a side effect. Either run a read-only check, or redirect the output to a scratch
path and diff intentionally.

## Read-only / safe to run anytime

These write **nothing tracked** — pure read/verify:

| Command | Notes |
|---|---|
| `npm run typecheck` | TS only |
| `npm run validate:release` | structure + template + scenario *definitions* (no advisor run) |
| `npm test` | spawns a server on a scratch port; asserts responses, writes nothing tracked |
| `npm run validate:paper-stats` | recompute-and-compare only (no write) |
| `npm run smoke:live-api` | connectivity probe |

## Writes only its own intended generated/derived output (safe, not read-only)

These DO write files, but only their own deterministic/derived output — never a
measured baseline. Re-running reproduces the same content (the generated-stats
file is even drift-guarded by `validate:paper-stats`). Safe to run, but they are
not "read-only".

| Command | Writes | Why it's safe |
|---|---|---|
| `npm run stats:paper` | `evals/results/paper-stats.generated.json` (committed) | deterministic recomputation from the result artifacts; `validate:paper-stats` fails CI on drift |
| `npm run demo:snapshot`, `npm run build:demo` | `public/demo/` (gitignored), `dist/` (gitignored) | regenerated fixtures/bundle |
| `npm run figures:capture` | `docs/ui_mobile_*.png` (committed) | regenerated from the current UI; intended figure refresh |

## Writes a committed *baseline* by default — redirect to scratch

Set the listed output env var to a scratch path before running, so the committed
file is untouched:

| Command | Default output (committed) | Safe override |
|---|---|---|
| `npm run eval:samsung` / `:sk` / `:hyundai` / `:lg` / `eval:sk:financial` | `evals/results/<scenarioSetId>.autoeval-baseline.<date>.json` | `ADVISOR_EVAL_OUTPUT=…` |
| `npm run eval:advisor` | same pattern (defaults to Hanwha scenario) | `ADVISOR_EVAL_OUTPUT=…` |
| `npm run eval:fault-injection` | `evals/results/fault-injection-contract-sensitivity.<date>.json` | `ADVISOR_FAULT_OUTPUT=…` |
| `npm run eval:live-llm` | `evals/results/live-llm-composition-boundary.<date>.json` | `ADVISOR_LIVE_LLM_OUTPUT=…` |
| `npm run quality:*` | `evals/dashboard/…json` | `AGENT_QUALITY_OUT=…` |
| `npm run promote:*`, `npm run financials:*:dart` | `raw/manifests/…json` | run only when intentionally re-promoting |

### Example — validate a runtime change without touching the baseline

```bash
mkdir -p /tmp/harness-scratch
ADVISOR_EVAL_OUTPUT=/tmp/harness-scratch/samsung.json npm run eval:samsung
# inspect /tmp/harness-scratch/samsung.json; the committed 2026-05-03 baseline is untouched.
```

For unit-level regression checks of runtime behavior, prefer `npm test` — it
never writes a tracked file.

## Intentionally regenerating a committed artifact

When you *do* mean to refresh a cited artifact (new measured run):

1. Run the command **without** the scratch override (or pointed at the committed path).
2. Treat it as a new measured snapshot: bump `VERSION`, add a dated `CHANGELOG.md`
   entry, and re-tag (per `docs/repository-workflow.md`). Do not silently overwrite.
3. Live-LLM runs are dated snapshots and are not bit-reproducible (hosted model
   aliases drift) — see `docs/paper-evaluation-tables.md`.

## Live credentials

Live runs read keys from `.env` (loaded by `server/index.mjs` at startup); see
`.env.example`. Provider auto-detect order is anthropic → openai → gemini →
openrouter, overridable with `ADVISOR_LIVE_LLM_PROVIDER` / `ADVISOR_LIVE_LLM_MODEL`.
Before a paid batch, smoke 2 calls first (OpenRouter returns `HTTP_402` when out
of credit). **Do not edit `server/index.mjs` while a live batch is running** — the
evaluator reloads it per run-spec and would corrupt the dataset.
