# Reference Slice Expansion Pipeline

Implementation date: 2026-05-01

## Purpose

The investor-facing demo now defaults to Samsung, but the engineering template
is still learned from the Hanwha PoC. This distinction is intentional:

```text
Samsung = neutral first screen for investors
Hanwha  = reference slice used to prove the reconstruction method
```

The expansion process must make Samsung, SK, Hyundai Motor, and LG easier to
complete without recreating the original PoC's long prompt and scattered RAG
problem.

## Expansion Unit

Each target must be built as the same bundle:

```text
configs/groups.json
raw/manifests/<group>.json
wiki/groups/<group>/overview.md
wiki/groups/<group>/companies/*.md
prompts/*.md
server tool outputs
evals/scenarios/<group>.json
```

The UI should not need group-specific branching.

## Hanwha Reference Slice

Hanwha defines the shape of the bundle:

- public identifiers: KRX, Yahoo ticker, DART corp code, aliases;
- representative-company routing for market and disclosure tools;
- source manifests for filings, IR pages, market data, and news search;
- LLM wiki pages with `last_checked`, source references, stale notes, and
  contradictions;
- deterministic validators for dates, identifiers, citations, numeric units,
  source age, and answer schema;
- short prompt policies that describe behavior, not company knowledge.

## LLM Wiki Rule

The wiki is a compiled working layer. It is allowed to be LLM-assisted, but it
must not become hidden prompt state.

Required wiki behavior:

- every material claim has a source pointer;
- every page has `last_checked`;
- stale or contradictory claims are labeled, not silently overwritten;
- source manifests remain separate from wiki prose;
- the answer composer receives a bounded context package, not the whole wiki.

## Prompt Rule

Prompts must stay short:

```text
role + evidence policy + tool-use policy + output style
```

The following must stay in code, not prompt prose:

- target and representative company resolution;
- DART/KRX/Yahoo/Naver routing;
- date windows and trading calendar handling;
- numeric parsing and unit conversion;
- citation checks;
- fixture/fallback/live labeling;
- trace-envelope creation;
- stale-source detection;
- TTS formatting and meeting-mode controls.

## Group Completion Checklist

For each expansion target:

1. Fill `configs/groups.json` identifiers.
2. Add raw source manifest entries.
3. Generate or draft wiki pages from source manifests.
4. Run deterministic validators.
5. Run one fixture scenario and one live-capable scenario.
6. Save trace JSON for the paper artifact.
7. Capture mobile UI with runtime mode visible.
8. Mark unverified values as `seed-unverified` until confirmed.

## Paper Wording

Do not claim that the app covers the complete Korean top five by asset rank.
The accurate claim is:

```text
The demo covers five selected Korean business groups, ordered by 2025 FTC asset
ranking among the selected targets. Hanwha is included as the PoC-derived
reference slice.
```
