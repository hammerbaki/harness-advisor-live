# Original PoC Enrichment Audit

Audit date: 2026-05-01

## Purpose

The original `../HanWha-Advisor-main` folder was rechecked to find user-facing
question and answer features that could enrich the clean research template
without reintroducing the original PoC's long prompt, scattered RAG state, or
Hanwha-only runtime assumptions.

## Reused Ideas

### Brief-card question generation

Original PoC file:

```text
artifacts/web/src/lib/briefingPrompts.ts
```

Reusable idea:

- when a user taps a news, stock, or financial card, the generated question
  should quote the visible headline and one-line analysis instead of asking a
  generic question;
- this preserves user context and makes the answer feel connected to the UI.

Clean implementation:

```text
src/questionTemplates.ts
```

### Quick-button question bundles

Original PoC files:

```text
artifacts/web/src/lib/toolPrompts.ts
attached_assets/04_뉴스_쿼리_번들_1776678307955.md
```

Reusable idea:

- bottom quick buttons should map to rich intent bundles, not shallow labels;
- `시장`, `국제`, `대상`, `경쟁사`, and `공시` each imply different evidence
  needs and answer structure.

Clean implementation:

```text
src/questionTemplates.ts
```

The clean version generalizes the idea across Samsung, SK, Hyundai Motor, LG,
and Hanwha by deriving company names and aliases from `configs/groups.json`.

### Topic-aware follow-up questions

Original PoC file:

```text
artifacts/api-server/src/services/llm/fallback-related.ts
```

Reusable idea:

- follow-up questions should be determined by the user's intent when the LLM
  does not provide good related questions;
- this improves answer continuity without requiring another LLM call.

Clean implementation:

```text
server/index.mjs
```

The clean version keeps follow-up generation deterministic and tied to the
current question class: financial, value-up, business pipeline, governance,
competition, global factors, or general investment summary.

Customer-facing UI must not show development or paper-operation questions such
as evaluation trace, logs, prompt, schema, or demo-source conversion. Those
questions belong in the Codex/research workflow, not in the investor advisor
screen.

### Korean process labels

Original PoC file:

```text
artifacts/web/src/hooks/useStatusStream.ts
artifacts/web/src/lib/streamChat.ts
artifacts/web/src/components/shell/AgentSteps.tsx
artifacts/api-server/src/routes/chat.ts
artifacts/api-server/src/services/llm/respond-stream.ts
artifacts/api-server/src/services/llm/status-messages.ts
```

Reusable idea:

- long-running collection and analysis should be visible while the answer is
  being prepared;
- users should see understandable collection/analysis status, not raw tool
  names;
- status should be accumulated as ordered steps and retained in a compact form
  after completion;
- status text should distinguish live, fallback, fixture, local, and error
  modes without exposing internal debugging prose.

Clean implementation:

```text
src/main.tsx
```

The clean version maps trace labels to Korean process labels in the UI while
leaving the raw trace JSON available for paper evaluation. The current research
template still uses a single `/api/advisor` POST, so it shows deterministic
planned steps while the request is pending and then replaces them with actual
`processTrace` entries after the response arrives. This preserves the original
user affordance without pretending that full server-pushed streaming has already
been rebuilt.

Next architecture task:

```text
POST /api/chat -> turnId
GET /api/chat/poll?turnId=&since= -> status/delta/meta/done events
```

This is the original PoC pattern and should be restored once live DART, market,
news, and LLM calls make runtime latency part of the demonstration evidence.

### Investor-facing answer sections

Original PoC file:

```text
lib/prompts/src/system-prompt.v0.1.md
```

Reusable idea:

- financial and disclosure answers should not be a single paragraph;
- the useful structure is `[현황요약]`, `[산업맥락]`, `[전략시사점]`,
  and `[모니터포인트]`;
- evidence IDs, raw tool states, and runtime trace details are valuable for
  development and paper evaluation, but they should not dominate the investor
  answer surface.

Clean implementation:

```text
server/index.mjs
src/main.tsx
```

The clean version implements the structure in deterministic code. The answer
body renders as a readable investment memo, while `sourceClaims`, process
traces, and exported JSON remain available as paper-grade evaluation artifacts.

## Not Reused Directly

- Original status-message dictionaries were not copied directly because they
  include Hanwha subsidiary and HD-era assumptions. Only the concept of
  user-readable process labels was reused.
- Original `<related_questions>` tag parsing was not copied into the clean UI
  because the current API already returns structured `followUps`.
- Original news query bundles were not copied verbatim because they were written
  for a different corporate context. Their intent-bundle pattern was reused.

## Research Interpretation

This is a useful paper example:

```text
PoC UX behavior -> deterministic template -> group-agnostic implementation
```

The enrichment does not expand verified knowledge coverage by itself. It makes
question entry, card interactions, and follow-up continuity richer while keeping
claim validity governed by source-backed manifests and traceable runtime
outputs.
