# Pre-API Stage Gate

Implementation date: 2026-05-01

## Decision

Live API integration is not the immediate bottleneck. The current stage should
freeze the reusable template first, then connect live providers through the
same trace contract.

The project should not use live APIs to hide an unstable knowledge design. A
new client or target company must be able to enter the system through the same
configuration, source request, claim promotion, wiki, and evaluation process
used by the Hanwha reference slice.

## Priority Order

```text
accuracy -> reproducibility -> consistency -> extensibility -> speed -> live polish
```

Accuracy is first because the product advises on investment questions. Speed is
important, but speed should come from cached source manifests, bounded context,
deterministic routing, parallel tool calls, and compact prompts rather than
from skipping provenance or claim-level validation.

## What Must Be Stable Before Live APIs

1. Group and company identity is config-driven.
2. Client source requests are package-based, not open-ended.
3. Source-selection rules are shared across all groups.
4. Claim promotion requires source-level and claim-level provenance.
5. LLM Wiki pages are maintained synthesis, not raw truth.
6. Prompt blocks stay short; deterministic behavior stays in code.
7. Runtime answers export trace JSON for paper and demo evaluation.
8. Expansion targets can remain marked `planned` without pretending to be
   paper-ready.

## Current Template Gate

Run:

```bash
npm run validate:stage-gate
```

The gate checks:

- required architecture and source-policy documents exist;
- `.env.example` declares optional live provider keys;
- runtime prompt blocks remain short;
- every target group has a base manifest and wiki overview;
- the reference slice keeps the full source-to-claim chain;
- planned expansion groups are allowed to lack DART corp codes and
  source-backed claims, but that state is reported as a warning or note.

## When API Integration Becomes Necessary

Live APIs become necessary after the template gate passes and one or more
frozen evaluation questions are ready. Then provider integration should happen
in this order:

1. DART disclosure list and corp-code mapping;
2. KRX or approved market data;
3. news search with source/date filters;
4. LLM composition after deterministic baseline checks remain stable;
5. TTS only as optional presentation mode.

## Commercial Reuse Rule

For a future client, do not ask for "all related documents." Ask for bounded
source packages using `configs/client-source-request-template.json`. Each source
must have a use case, date or period, rights label, confidentiality label, and
source owner before it can be promoted to wiki or runtime context.

## Paper Framing

The paper should frame this stage as a method for turning a vibe-coded LLM PoC
into a reproducible advisor architecture. The evidence is not the existence of
live API calls. The evidence is the repeatable path from source inventory to
source-backed claim, bounded context, traceable answer, and reusable target
template.
