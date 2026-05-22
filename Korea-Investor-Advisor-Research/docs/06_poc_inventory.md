# PoC Inventory

Snapshot inspected:

```text
../HanWha-Advisor-main
```

Inspection date: 2026-04-30

## High-Level Counts

| Area | File Count | Assessment |
| --- | ---: | --- |
| `artifacts/` | 349 | Main app code plus mockup sandbox. Useful, but must be split by concern. |
| `attached_assets/` | 82 | Development traces, prompt dumps, screenshots, and notes. Mostly archive/reference only. |
| `lib/` | 60 | Highest-value reusable library area. |
| `screenshots/` | 23 | Useful for paper history/appendix, not source of truth. |
| `scripts/` | 5 | Some eval/stress-test ideas reusable. |
| `exports/` | 3 | Nested source archives. Archive only. |
| `.github/` | 2 | Useful workflow patterns for live regression, but not clean CI baseline. |

Total files: 537.

TS/TSX/MD/JSON-like files: 413.

## Core Code Distribution

| Area | Count | Notes |
| --- | ---: | --- |
| `artifacts/web/src/components` | 68 | UI shell and shadcn-style components. Rebuild selectively. |
| `artifacts/api-server/src/services` | 47 | Main reusable backend logic. Needs decomposition. |
| `artifacts/api-server/src/__tests__` | 43 | Strong source of regression scenarios. |
| `artifacts/web/src/lib` | 38 | Useful client utilities, TTS, streaming, tickers. |
| `artifacts/api-server/src/lib` | 17 | Validators, counters, auth, observability. Several high-value pieces. |
| `artifacts/web/src/__tests__` | 14 | Useful UI/utility regression tests. |
| `artifacts/api-server/src/routes` | 13 | API surface reference only. Needs redesigned auth and separation. |
| `artifacts/web/src/pages` | 6 | Demo UI reference. Needs group-scoped redesign. |

## Reuse Candidates

### Group and Identifier Logic

Source:

```text
lib/corp-codes/src/index.ts
lib/corp-codes/scripts/refresh-dart-codes.mjs
artifacts/api-server/src/services/dart/corp-codes.ts
```

Decision: reuse the idea, not the Hanwha-only shape.

Target:

```text
src/groups/
configs/groups.json
tests/groups/
```

Required changes:

- Replace `HANWHA_GROUP_CORPS` with generic `GroupProfile`.
- Support multiple groups and listed companies.
- Treat DART corp code, KRX ticker, aliases, parent routing, and source provenance as typed fields.
- Add lint tests so every group can be validated before wiki ingestion.

### Public Data Tools

Source:

```text
artifacts/api-server/src/services/dart/
artifacts/api-server/src/services/finance/
artifacts/api-server/src/services/news/
```

Decision: reuse with interfaces and fixture mode.

Target:

```text
src/tools/dart/
src/tools/market/
src/tools/news/
tests/tools/
evals/fixtures/
```

Required changes:

- Separate live provider calls from deterministic fixtures.
- Remove silent product-specific fallback behavior.
- Return source trace metadata from every tool.
- Gate live tests by environment variables.
- Apply group scope explicitly to every tool call.

### Validators and Regression Logic

Source:

```text
artifacts/api-server/src/services/llm/regression-validators.ts
artifacts/api-server/src/lib/tts-normalize-coverage.ts
artifacts/api-server/src/lib/tts-chart-leak.ts
artifacts/api-server/src/lib/system-prompt-guards.ts
artifacts/api-server/src/services/llm/preamble-stripper.ts
artifacts/api-server/src/services/llm/meta-narration-stripper.ts
```

Decision: high-value reuse.

Target:

```text
src/validators/
evals/scenarios/
tests/validators/
```

Required changes:

- Generalize from demo-specific regressions into paper-grade validation categories.
- Keep deterministic tests offline.
- Record validator output as part of paper artifact.

### API Schema Discipline

Source:

```text
lib/api-spec/openapi.yaml
lib/api-zod/
lib/api-client-react/
```

Decision: keep the schema-first pattern, regenerate cleanly.

Target:

```text
src/api/
openapi/
tests/api/
```

Required changes:

- Design a smaller research API first.
- Generate clients only after endpoint boundaries stabilize.
- Avoid committing generated code until needed.

## Rewrite Candidates

### Prompt and RAG

Source:

```text
lib/prompts/src/system-prompt.v0.1.md
lib/prompts/src/rag.v0.2.md
lib/prompts/src/direct-start-rule.ts
attached_assets/01_*
attached_assets/02_*
```

Decision: rewrite.

Reason:

- Too much domain knowledge is embedded directly in prompt/RAG text.
- The current prompt is Hanwha-internal and not suitable for public investor framing.
- Deterministic rules are mixed with model instructions.

Target:

```text
prompts/
wiki/
raw/
src/validators/
```

### Chat Orchestration and Turn Store

Source:

```text
artifacts/api-server/src/routes/chat.ts
artifacts/api-server/src/services/llm/respond.ts
artifacts/api-server/src/services/llm/respond-stream.ts
artifacts/api-server/src/services/llm/turn-store.ts
```

Decision: rewrite around clean orchestration boundaries.

Reason:

- Current polling store assumes a single instance.
- Demo-driven streaming/polling decisions are mixed with LLM orchestration.
- Auth, cost control, and reproducibility controls are not cleanly separated.

Target:

```text
src/orchestrator/
src/api/
src/runtime/
```

### UI

Source:

```text
artifacts/web/src/
artifacts/mockup-sandbox/
```

Decision: rebuild selectively.

Reason:

- Current UI is Hanwha executive-demo specific.
- Research demo should show group selection, source trace, validator status, and reproducibility controls.
- Mockup sandbox duplicates many UI components.

Target:

```text
src/ui/
```

## Archive Candidates

```text
attached_assets/Pasted-*
screenshots/
exports/
artifacts/mockup-sandbox/
```

Use only as historical development evidence or visual appendix material.

## Major De-Hanwha Findings

The PoC contains extensive hardcoded Hanwha assumptions:

- `HANWHA_GROUP_CORPS` as a single-source registry.
- `ACTIVE_ENTITY` defaults such as `estate` and `hanwha`.
- Hanwha-specific news ranking weights and keywords.
- Hanwha/HD-era mixed static IR and orderbook data.
- UI labels such as "한화그룹 임원 전략참모".
- Ticker/test assumptions such as `009540.KS` and legacy HD한국조선해양 examples.

Conclusion: the new research system should not migrate files wholesale. It should extract
patterns and selected deterministic functions into a group-scoped architecture.

