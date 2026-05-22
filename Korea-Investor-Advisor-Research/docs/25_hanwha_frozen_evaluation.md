# Hanwha Frozen Evaluation

Evaluation date: 2026-05-01

## Purpose

This document records the first frozen Hanwha reference-slice evaluation before
live DART, KRX, news, LLM, and TTS credentials are connected.

The goal is not to prove production readiness. The goal is to prove that the
reconstructed template can turn source-backed claims into investor-facing
answers with a reproducible trace.

## Scenario Set

Machine-readable scenario file:

```text
evals/scenarios/hanwha.reference-slice.json
```

The set covers five answer classes:

| Scenario | Evaluation Target |
| --- | --- |
| `hanwha-frozen-001-investment-brief` | general investment summary |
| `hanwha-frozen-002-financial-performance` | financial metric grounding |
| `hanwha-frozen-003-business-pipeline` | business pipeline grounding |
| `hanwha-frozen-004-value-up` | value-up and shareholder-return grounding |
| `hanwha-frozen-005-governance-disclosure` | governance and disclosure-process grounding |

## Runtime Check

The local API was called at `http://localhost:5173/api/advisor` for each
scenario.

Observed result:

| Scenario | Runtime Mode | Required Claims Present | Answer Clean |
| --- | --- | --- | --- |
| `001` | `mixed` | yes | yes |
| `002` | `mixed` | yes | yes |
| `003` | `mixed` | yes | yes |
| `004` | `mixed` | yes | yes |
| `005` | `mixed` | yes | yes |

`mixed` is expected at this stage because DART and news still use fixture output
while market data uses a fallback path and Hanwha wiki/source-backed claims are
local.

## Interpretation

This supports the paper claim that the Hanwha PoC can be reconstructed into a
traceable reference slice:

```text
question -> deterministic routing -> bounded source-backed claims -> answer ->
links/follow-ups -> trace JSON
```

It does not yet support a claim of fully live operation or complete five-group
knowledge coverage.

## Expansion Rule

Samsung, SK, Hyundai Motor, and LG should receive equivalent frozen scenario
sets only after each group has:

1. DART/KRX/Yahoo identifiers;
2. source manifests;
3. source-selection rationales;
4. extracted or reviewed official sources;
5. source-backed claim manifests;
6. wiki pages with `last_checked` and source references;
7. passing `npm run validate:evals`.
