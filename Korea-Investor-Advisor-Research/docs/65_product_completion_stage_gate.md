# Product Completion Stage Gate

Date: 2026-05-05

This document records the product-completion procedure that should be preserved
as paper evidence. The goal is not to freeze the manuscript now. The goal is to
finish the product in a way that leaves reproducible traces for a later arXiv
method paper and a stronger SCI-level product-validation paper.

## Product Direction

The product is a public-data investment research assistant for major Korean
business groups. It should show investor-facing insights, not the internal
analysis process as the final output. Internal trace, source status, validation
results, and claim IDs remain available for research control and evaluation, but
they must not leak into the default customer UI.

The current working principle is:

1. accuracy first;
2. then reproducibility and consistency;
3. then extensibility to new groups;
4. then speed and live deployment hardening.

## UI Surface Gate

The mobile surface should communicate the data and function clearly without
showing development-state labels.

Current decisions:

- Group selector uses customer-facing sector/source labels instead of internal
  statuses such as `reference`, `planned`, `검증`, or `기준`.
- The selector shows sector scope and common source type, not affiliate counts.
  This avoids implying that the paper claims uneven or complete group coverage:
  - Samsung: `전자·바이오·금융`, `DART/IR`
  - SK: `반도체·에너지·통신`, `DART/IR`
  - Hyundai Motor: `완성차·부품·모빌리티`, `DART/IR`
  - LG: `전자·배터리·화학`, `DART/IR`
  - Hanwha: `방산·에너지·금융`, `DART/IR`
- First-screen cards use a concise headline, a two-line explanatory body, and
  one bottom source link per card. This keeps the home screen useful for product
  and paper screenshots without exposing development trace details or repeating
  metric chips.
- The first-screen card formerly labeled `이슈 브리프` is now `뉴스 브리프`.
- First-screen source links are type-specific: `뉴스 브리프` uses an internet
  news search link, `주가 브리프` uses market-price context, and `재무 브리프`
  uses DART. DART/IR should not be used as a news-card link.
- First-screen cards should remain compact briefing triggers. They may show one
  customer-facing source link, but should not expose trace status, validation
  labels, claim IDs, or process details that belong in the answer and
  development trace panel.

Paper use:

- Screenshots can use the cleaned mobile UI as a product artifact.
- The paper should describe this as a separation between customer-facing answer
  surfaces and researcher-facing trace surfaces.

## Harness Gate

Before expanding features or connecting live APIs, the repository should pass
the following static gates:

```bash
npm run lint:wiki
npm run validate:structure
npm run validate:template
npm run validate:stage-gate
npm run validate:evals
npm run validate:prompt-control
npm run check:replit
npm run typecheck
npm run build
```

Latest run on 2026-05-05:

| Gate | Result | Note |
| --- | --- | --- |
| `lint:wiki` | pass | 46 markdown pages checked |
| `validate:structure` | pass | 5 group profiles checked |
| `validate:template` | pass | 5 target profiles checked; selector length warning resolved |
| `validate:stage-gate` | pass | 5 target profiles checked for source-backed live-runtime readiness |
| `validate:evals` | pass | 6 scenario files checked |
| `validate:prompt-control` | pass | 103/220 runtime prompt words; prompt-control entries validated |
| `check:replit` | pass | target order Samsung -> SK -> Hyundai Motor -> LG -> Hanwha |
| `typecheck` | pass | TypeScript build graph passes |
| `build` | pass | production Vite build generated |

## Group Readiness Gate

Each group should advance through the same bounded sequence:

1. profile and company identifiers;
2. DART/KRX identifiers;
3. local source inventory;
4. text extraction and evidence locator review;
5. source-backed claim promotion;
6. LLM Wiki seed;
7. frozen evaluation scenarios;
8. Agent Dog dashboard-ready quality JSON;
9. product UI check.

Current group states:

| Group | Runtime status | Product interpretation |
| --- | --- | --- |
| Hanwha | reference slice | PoC-derived reference slice with official IR/DART claims |
| Samsung | first transfer slice | broad company coverage plus bounded runtime narrative/financial claims |
| SK | second transfer slice | bounded source-backed reference slice |
| Hyundai Motor | third transfer financial seed | DART financial claims and extracted source queue; narrative promotion pending |
| LG | fourth transfer financial seed | DART financial claims and extracted 9-company source queue; narrative promotion pending |

## Product Completion Order

The next product work should proceed in this order:

1. keep the UI surface clean and stable for screenshots;
2. promote only a small, evidence-located LG narrative subset;
3. review Hyundai narrative evidence locators and promote a bounded subset only
   when text quality is sufficient;
4. rerun group-specific evaluations and quality JSON after every promotion;
5. add market snapshot prewarming and cache hardening for the visible groups;
6. connect news search with source/date filters;
7. connect live LLM composition behind the structured output contract;
8. add streaming or polling process updates only if live tool latency makes the
   current single-turn process rail feel artificial;
9. prepare clean Replit deployment settings with `VITE_ADVISOR_DEV_UI=0` for
   customer-facing demos;
10. keep TTS as optional presentation mode, not the default commercial flow.

## Data Needed From User

The next useful user-provided inputs are:

- LG narrative priorities: which LG affiliates and themes should be promoted
  first beyond the DART financial seed;
- Hyundai missing or replacement sources for low-text/OCR PDFs, especially if
  narrative claims are needed for Kia, Hyundai Mobis, Hyundai Rotem, or second
  wave affiliates;
- news API credentials and source policy if live news is to become product
  evidence;
- final deployment target decision: local demo, Replit demo, or public test URL;
- final legal/compliance wording for investor-facing disclaimers before
  external client demos.

## Paper Reuse

This stage-gate record can support the paper in three places:

- Method: the harness converts prompt-heavy behavior into code-owned gates,
  manifests, and output contracts.
- System validation: the product must pass structural, template, stage-gate,
  prompt-control, evaluation, Replit, type, and build checks.
- Discussion: UI polish is not cosmetic only; it is part of preventing
  development traces from becoming the customer-facing product.

The paper should not claim that live API, production compliance, or full
five-group narrative coverage is complete until those gates are separately
documented.
