# Korea Investor Advisor Research

Research-grade reconstruction of a public-data, LLM-assisted Korean conglomerate investor advisor.

New workers should start with `NEXT_WORKER_HANDOFF.md`. It gives the current
workspace map, source rules, validation commands, and known gaps without
requiring the full project history.

Current working context is maintained in `PROJECT_CONTEXT.md`. Update that file
when project status, source coverage, runtime trace contracts, or next
milestones change.

This repository is intentionally separate from the original PoC snapshot in
`../HanWha-Advisor-main`. The goal is to turn the demo product into a
reproducible, maintainable, and extensible research artifact before any
commercial hardening work begins.

## Research Framing

The system is not positioned as an internal Hanwha Group executive tool. It is
reframed as a public-data advisor for external investors monitoring major Korean
business groups.

Initial target groups:

- Samsung
- SK
- Hyundai Motor Group
- LG
- Hanwha

The investor-facing UI defaults to Samsung and orders selected targets by the
2025 FTC asset ranking among those selected targets: Samsung, SK, Hyundai Motor,
LG, Hanwha. Hanwha remains the reference vertical slice because the existing PoC
already contains the deepest implementation and test history. The implementation
must not copy Hanwha-specific logic into new modules. Group-specific behavior
belongs in data/config/wiki layers.

Samsung is the first template-transfer test. It now has a DART-first
source-backed financial seed layer, while Hanwha remains the deeper reference
slice for narrative claims and frozen evaluation.

## Repository Principles

- Raw public sources are immutable.
- LLM-maintained wiki pages are generated artifacts with source links.
- Deterministic behavior is implemented in code, not prompt prose.
- Prompts are short policy documents, not hidden application logic.
- Every claim shown to the user must be traceable to source, tool output, or a
  clearly labeled fallback.
- Reproducibility matters more than demo convenience.

## Planned Structure

```text
configs/          Group/company profiles and model/runtime config
docs/             Paper plan, architecture, migration plan, reproducibility notes
evals/            Deterministic and live evaluation scenarios
prompts/          Short prompt policy blocks
public/logos/     Local logo image assets for demo group identity
raw/              Immutable public source documents or source manifests
src/              Clean research implementation
tests/            Unit/integration tests for deterministic behavior
wiki/             LLM-maintained compiled knowledge layer
```

## First Milestone

Build one clean Hanwha reference slice while keeping the investor UI neutral:

1. Select a group from a typed `GroupProfile`.
2. Load group-scoped wiki/context.
3. Call deterministic public-data tools.
4. Produce a structured advisor response with citations.
5. Validate numbers, dates, output shape, and stale knowledge warnings.

Only after this slice is stable should Samsung, SK, Hyundai Motor Group, and LG
be completed through configuration, raw-source manifests, and wiki ingestion.

## Replit Demo

This folder now contains a minimal Vite/React research demo. It runs without
live API credentials and is intended as the first Replit-deployable artifact.

```bash
npm install
npm run dev
```

Before freezing a paper screenshot or adding another target profile, run:

```bash
npm run check:replit
npm run validate:template
npm run lint:wiki
npm run build
```

The demo shows:

- mobile-first advisor UI reconstructed from the original Replit PoC,
- Samsung default header, ticker, briefing cards, voice toolbar, quick buttons, and
  investor question input,
- dynamic data collection and analysis panel,
- answer source links and follow-up questions,
- visible fixture/fallback/live trace mode,
- five-group selector,
- group selector backed by a reusable template,
- logo and one-line data-readiness notes driven by `configs/groups.json`,
- Hanwha reference slice,
- Samsung DART-backed financial seed claims,
- group profile validation,
- PoC reuse/rewrite/archive classification,
- clean architecture pipeline for the paper.

## Development Trace UI

During research and product hardening, the app can show a collapsed `검증 보기`
panel below each answer. This panel is for the builder, not for investors. It
shows answer assembly checks, section extraction, selected source-backed claims,
tool trace statuses, runtime mode, and the evaluation trace link.

The panel is enabled by default in this research workspace so answer quality can
be inspected quickly. For clean client-facing demos or paper screenshots, build
with:

```bash
VITE_ADVISOR_DEV_UI=0 npm run build
```

For Replit or other deployments, set `VITE_ADVISOR_DEV_UI=0` in the deployment
environment when the development panel should be removed from the rendered UI.

Live DART/KRX/news/LLM calls are behind fixture-compatible tool interfaces in
`server/index.mjs`; see `docs/10_tool_interface.md`. Without credentials the
demo remains reproducible through deterministic fixture/fallback behavior.
The trace response contract is documented in
`docs/11_traceable_demo_architecture.md`.
