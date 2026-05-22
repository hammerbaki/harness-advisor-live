# Wiki Schema

Version: 0.1.0

The wiki is maintained by LLM-assisted workflows but must remain auditable by
humans and validators.

## Page Front Matter

Each page should begin with:

```yaml
---
title: ""
group_id: ""
company_id: ""
source_status: "draft"
last_checked: "YYYY-MM-DD"
confidence: "low"
---
```

Allowed `source_status` values:

- `draft`
- `source-backed`
- `stale`
- `contradiction`

Allowed `confidence` values:

- `low`
- `medium`
- `high`

## Required Sections

For group overview pages:

- Summary
- Key Listed Companies
- Current Issues
- Financial Signals
- Recent Public Sources
- Staleness Notes
- Contradictions

For company pages:

- Summary
- Identifiers
- Business Segments
- Recent Filings
- Financial Signals
- Market Signals
- Source Notes
- Open Questions

## Citation Rule

Material claims require a source reference. A source reference should identify
the raw source manifest entry, public URL, filing ID, or tool output snapshot.

## Index And Log

The wiki follows the LLM Wiki pattern:

- `index.md` is the content-oriented catalog.
- `log.md` is the chronological, append-only operation log.
- `wiki/groups/<group>/` contains bounded group contexts used by the runtime.

## Expansion Rule

The Hanwha namespace is the reference slice. New target namespaces should copy
the same page types and front matter before adding group-specific claims:

```text
wiki/groups/<group>/overview.md
wiki/groups/<group>/companies/<company>.md
wiki/groups/<group>/events/
wiki/groups/<group>/contradictions.md
wiki/groups/<group>/staleness.md
```

Do not paste the whole wiki into a system prompt. The runtime should retrieve a
bounded context package and pass only the relevant, source-linked claims to the
composer.

## Lint Rules

The wiki should be linted for:

- missing front matter
- missing last checked dates
- orphan pages
- claims without source references
- stale pages
- contradictory values
- group/company IDs not present in `configs/groups.json`

Run:

```bash
npm run lint:wiki
```
