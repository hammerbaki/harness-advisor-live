# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A research artifact for the manuscript *Beyond Prompting: Harness Engineering for Enterprise LLM Agents*. It is a mobile briefing tool that produces source-linked investor briefings for Korea's five largest corporate groups (Samsung, SK, Hyundai Motor, LG, Hanwha) from public data (DART filings, KRX/Yahoo market data, Naver News). **Not investment advice.** The named groups are a public-data slice only.

The central design thesis drives almost every constraint here: **the LLM owns language composition only.** Source eligibility, entity routing, claim admission, answer planning, and trace generation all live in code, manifests, schemas, and validators — never in an expanding prompt. When extending the system, preserve this separation; adding company facts or deterministic behavior into prompts is the primary anti-pattern to avoid.

## Commands

```bash
npm install              # Node >= 22 required
npm run dev              # API (server/index.mjs on :8787) + Vite UI (:5173), proxied via vite.config.ts
npm run typecheck        # tsc -b — the only "build/lint" gate for the TS surface
npm run build            # tsc -b && vite build (production UI)
npm run api              # API server alone (server/index.mjs)
```

### Validation & evals (these are the real test suite)

```bash
npm run validate:release      # structure + template + eval scenarios; CI gate; exits 0 with a contract summary table
npm run validate:structure    # structural integrity of manifests/configs
npm run validate:template     # briefing template contract
npm run validate:evals        # frozen eval scenario definitions
npm run eval:samsung          # per-group reference-slice scenarios (also :sk :hyundai :lg)
npm run eval:advisor          # auto-eval baseline loop against rubric advisor.answer-quality.v0.2.json
npm run eval:live-llm         # live-LLM composition-boundary checks (needs ANTHROPIC_API_KEY)
npm run eval:fault-injection  # 7-mutation contract sensitivity check
npm run latency:advisor       # latency dashboard from saved measurements
npm run build:demo            # credential-free static demo (demo:snapshot + VITE_STATIC_DEMO=1 vite build)
```

There is **no test runner** (no jest/vitest). "Tests" means these validators and eval scripts; `tests/` contains only notes on what deterministic behaviors must stay stable (entity resolution, ticker/corp-code mapping, schema validation, citation checks). Most eval/validate scripts spin up the server themselves; point them at a running one with `ADVISOR_*_BASE_URL` / `ADVISOR_*_PREFER_BASE_URL` env vars (each script family has its own prefix, e.g. `ADVISOR_EVAL_*`, `ADVISOR_FAULT_*`).

To run one eval scenario, set `ADVISOR_EVAL_SCENARIO` to a path under `evals/scenarios/` and `ADVISOR_EVAL_DATE`, then run `node scripts/evaluate-advisor-scenarios.mjs` (this is exactly what the `eval:samsung`/`eval:sk`/etc. aliases do).

## Architecture

The runtime is split into a **deterministic harness** (always present) and a **replaceable LLM composition boundary** (optional). Both must satisfy the same answer contract.

- **`server/index.mjs`** — the entire runtime assembly layer in one file (~2400 lines). It resolves the selected group/company, collects source packages, assembles a source-backed answer, and emits a process trace. Three endpoints: `GET /api/healthz`, `GET /api/groups`, `POST /api/advisor`. Key flow: `runAdvisor` → tool fetches (`fetchDartDisclosures`, `fetchKrxMarket`, `searchNews`) → `loadWikiContext` + `loadSourceBackedClaims` → `composeWithLLM` (or `deterministicAnswer`/`composeDeterministicInvestorAnswer` fallback) → `validateStructuredAdvisorOutput` → `finalizeAdvisorAnswer`. Each external source has a live mode (credentialed) and a fixture/fallback mode; the trace envelope makes fixture/fallback/live runs distinguishable, which the manuscript relies on.

- **`src/`** — React + TypeScript + Vite reader-facing UI. Currently compact and concentrated in `src/main.tsx`; `briefingTemplate.ts`, `questionTemplates.ts`, `researchData.ts`, `types.ts` are the supporting modules. The UI deliberately hides internal trace detail from the customer-facing view. (`tsconfig.json` includes only `src` and `configs`; the `.mjs` automation is intentionally outside typechecking.)

- **`prompts/`** — three short policy blocks (`advisor-role.md`, `evidence-policy.md`, `output-style.md`) loaded at server startup and hashed into the trace as `promptPolicyHash`. These guide tone and evidence policy only. **Do not put company facts, RAG content, or formatting logic here** — that belongs in `configs/`, `raw/`, `wiki/`, and code validators.

- **`configs/groups.json`** — source of truth for group/company resolution: display order (FTC 2025 asset rank), KRX codes, Yahoo tickers, DART codes, aliases (used for entity routing), wiki namespaces, and per-group source-readiness status. Samsung is the neutral default UI target; Hanwha is the reference vertical slice that defines the manifest shape other groups copy.

- **`raw/manifests/`** — the source authority layer: public-source manifests, evidence metadata, extraction reports, and **promoted source-backed claims** (`<group>.source-backed-claims.json`). Treat as immutable inputs; do not rewrite during wiki compilation. A claim is not runtime-eligible until matched to a manifest entry and a public source pointer and explicitly promoted.

- **`wiki/`** — compiled context pages (per `wikiNamespace`) the composer loads. Generated from `raw/` manifests; the wiki must never replace the manifest as source of truth.

- **`evals/`** — contract validation layer: `scenarios/` (frozen questions + expected claim IDs + trace/answer expectations), `rubrics/`, `results/` (publication-safe run summaries), `dashboard/` (latency/quality), and local `traces/`. Result/dashboard files are cited by the manuscript at specific dates and tags.

- **`scripts/*.mjs`** — the data pipeline, one stage per script, grouped by verb and run via npm aliases: `inventory:` → `extract:` → `claims:` → `promote:` (source-to-claim promotion), plus `wiki:`, `financials:…:dart`, `audit:`, `validate:`, `eval:`, `quality:`, `crawl:`/`backfill:`/`provenance:`/`rationale:` (Hanwha ingestion). Each writes JSON to `raw/manifests/`, `evals/results/`, or `evals/dashboard/`. Scripts download nothing destructive by default — gated by env flags like `HANWHA_BACKFILL_DOWNLOAD=1`, `*_EXTRACT_WRITE_TEXT=1`, `SAMSUNG_DART_FILING_FETCH`.

### Three validation families to keep intact

1. **Leakage checks** — block internal claim IDs (e.g. `hanwha-sbc-NN`), raw trace records, prompt/eval/rubric vocabulary, and JSON from reader-facing answers (see `visibleAnswerDevLeakPattern` in `server/index.mjs`).
2. **Link checks** — every cited source must resolve to a source package or a documented fallback state.
3. **Language checks** — enforce insight-first answer structure and block buy/sell/target-price recommendation phrasing.

## Credentials & live vs. fixture

Copy `.env.example` to `.env` (never commit it). All external calls degrade gracefully: `DART_API_KEY`, `KRX_API_KEY`/`KRX_AUTH_KEY` (else Yahoo Finance fallback), `NAVER_CLIENT_ID`/`NAVER_CLIENT_SECRET`, and `ANTHROPIC_API_KEY` for live composition (else deterministic composer). Without credentials the system runs fully on fixtures — this is the default for the static demo and CI. Use `npm run smoke:live-api` to check live connections.

When building anything that touches the LLM boundary, default to the latest Claude models (`claude-fable-5`, then the Claude 4.x family); see provider config helpers `normalizeLLMProvider` / `llmModelForProvider` in `server/index.mjs`.

## Repository workflow (important)

This Git repo is the **single source of truth** (since `public-baseline-v0.2`); there is no separate artifact mirror. Manuscript-cited numbers must reference a tag or commit hash plus an artifact path under `evals/`. When you change reported numbers, scenarios, manifests, or figures: rerun the relevant validators, update `CHANGELOG.md`, bump `VERSION`, then commit and tag. CI (`.github/workflows/ci.yml`) runs typecheck + `validate:release` + the static demo build on every push and PR. See `docs/repository-workflow.md`.
