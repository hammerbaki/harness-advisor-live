# Reproducibility

This document maps every reported result to the command that produces it and the
artifact it is read from, and separates what is reproducible offline (no
credentials, no `npm install`) from what requires credentials or is a dated,
non-bit-reproducible snapshot. It is the practical companion to
`docs/paper-evaluation-tables.md`.

## Quick start (offline, credential-free)

A fresh clone reproduces the contract validations, the deterministic harness
invariants, and the manuscript statistics tables with no credentials:

```bash
npm ci                       # dev deps for typecheck + demo build
npm run typecheck            # TS surface compiles
npm run validate:release     # structure + template + eval scenario contracts
npm test                     # deterministic harness invariants (node --test)
npm run validate:paper-stats # statistics match recomputation from artifacts
npm run build:demo           # credential-free static demo bundle
```

The server itself is pure `node:` builtins. The validators that do not need the
TS toolchain (`validate:release`, `compute-paper-stats.mjs`, the `node --test`
suite, and booting `node server/index.mjs`) run **without `npm install`**; only
`typecheck`/`build`/`build:demo` need `node_modules` (TypeScript/Vite/tsx).

## What number comes from what

| Reported result | Command | Source artifact |
|---|---|---|
| Table A1 — group maturity / coverage | `npm run validate:release` | `configs/groups.json`, `raw/manifests/<group>.source-backed-claims.json` |
| Table A2 — per-model contract outcomes (Wilson CI), χ² | `node scripts/compute-paper-stats.mjs` | `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json` |
| Table A3 — inter-repeat consistency | `node scripts/compute-paper-stats.mjs` | same as A2 |
| Table A4 — per-check failure decomposition | `node scripts/compute-paper-stats.mjs` | same as A2 (`summary.byCheck`) |
| Prompt-only ablation, McNemar (reference + adversarial) | `node scripts/compute-paper-stats.mjs` | `evals/results/ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json`, `evals/results/ablation-adversarial.c0-vs-c3.2026-06-13.json` |
| Fault-injection contract sensitivity (7 mutations) | `npm run eval:fault-injection` | `evals/results/fault-injection-contract-sensitivity.2026-05-10.json` |
| Per-group reference-slice contract pass | `npm run eval:samsung` / `:sk` / `:hyundai` / `:lg` | `evals/results/<group>-reference-slice-*.json` |
| Latency dashboard | `npm run latency:advisor` | `evals/dashboard/*` |

`compute-paper-stats.mjs` writes `evals/results/paper-stats.generated.json` and
prints the tables as Markdown. `npm run validate:paper-stats` recomputes and
fails (exit 1) if the committed generated file drifts — this is the CI gate that
keeps the manuscript tables in sync with the artifacts rather than
hand-transcribed.

## Acceptance state

Result artifacts cited by the manuscript carry `summary.status:
accepted_for_manuscript` and a `manuscriptAcceptance` block. The acceptance
criteria and the hash-pinned list of accepted artifacts are in
`evals/reviewer-checklist.md` and `evals/manuscript-acceptance.json`.

## Reproducibility boundary: what is and is not externally reproducible

**Fully reproducible (offline):**
- All contract validations (`validate:release`, `npm test`).
- All derived statistics in Tables A2-A4 and the ablation McNemar test, from the
  committed result artifacts (`compute-paper-stats.mjs`).
- The static demo, from committed fixtures.

**Reproducible only with credentials (live path):**
- Live source ingestion (DART / KRX / Naver) — requires the API keys in
  `.env.example`; without them the system runs on committed fixtures.
- Live-LLM composition runs — require `OPENROUTER_API_KEY` (see
  `docs/live-llm-expanded-evaluation.md`).

**Not bit-for-bit reproducible (dated snapshots):**
- The live-LLM result artifact is a dated snapshot. Hosted model identifiers
  (e.g. `anthropic/claude-sonnet-4`) are aliases whose weights may change, so a
  re-run will not reproduce the exact run-level outcomes. The artifact is cited
  as a fixed-date measurement, and the *derived statistics* over it are exactly
  reproducible via `compute-paper-stats.mjs`.

**Not redistributed (copyright):**
- The original issuer documents behind the promoted claims (e.g. raw
  earnings-release PDFs) are **not** included. The source-to-claim *promotion*
  pipeline therefore cannot be re-run end-to-end from this repository alone.
  Reproduction begins from the committed, promoted, source-pointer-bearing claim
  records under `raw/manifests/`; each claim's `officialSourceUrl` /
  `officialDownloadUrl` points to the primary source at its origin. See
  `LICENSES.md` §3.

## Scope of claims

The evaluable object is **harness behavior** — preservation of code-owned
contracts (source-grounding, leakage absence, link resolution, trace
completeness, recommendation-language absence) independently of the composing
model — **not** investment efficacy, which is explicitly out of scope.
