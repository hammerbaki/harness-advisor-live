# Prompt-To-Code Boundary And LLM Wiki

Implementation date: 2026-05-01

## Purpose

The original PoC relied on long prompts and scattered RAG-like material. The
research reconstruction moves deterministic behavior into code and keeps prompts
as short policy blocks.

## What Moved To Code

- group/company resolution;
- DART/KRX/Yahoo/Naver routing;
- fixture/fallback/live labeling;
- trace envelope construction;
- prompt policy hashing;
- wiki namespace loading;
- answer normalization;
- evidence-status suffixing;
- wiki linting.

## What Remains In Prompts

Only role, evidence boundary, and output style:

```text
prompts/advisor-role.md
prompts/evidence-policy.md
prompts/output-style.md
```

Prompts must not contain company facts, source manifests, stale-data logic,
identifier rules, or formatting that code can enforce.

## LLM Wiki Adaptation

The project adopts the LLM Wiki pattern as a bounded, auditable knowledge layer:

```text
raw sources -> LLM-maintained wiki -> runtime context package
```

Implemented now:

- `wiki/index.md`
- `wiki/log.md`
- `wiki/groups/<group>/overview.md`
- `raw/manifests/<group>.json`
- `scripts/lint-wiki.mjs`
- `server/index.mjs` wiki context loader

This is intentionally not vector RAG yet. At the current scale, the runtime can
load bounded group pages directly. If the wiki grows beyond a few hundred pages,
add a local markdown search layer before adding hosted vector infrastructure.

## Next Work

1. Fill Hanwha raw manifest entries from independently verified public sources.
2. Convert those entries into source-backed Hanwha wiki pages.
3. Mark stale or contradictory claims explicitly instead of overwriting them.
4. Run `npm run lint:wiki` and `npm run validate:template`.
5. Repeat the same manifest/wiki shape for Samsung, SK, Hyundai Motor, and LG.
