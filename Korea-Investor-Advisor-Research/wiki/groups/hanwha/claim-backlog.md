---
title: "Hanwha Claim Backlog"
group_id: "hanwha"
company_id: ""
source_status: "draft"
last_checked: "2026-05-01"
confidence: "low"
---

# Hanwha Claim Backlog

## Summary

The previous Hanwha RAG markdown has been converted into verification
candidates. These candidates are not product knowledge yet. They are work items
that must be linked to manifest IDs, public URLs, and source page or section
references before they can move into source-backed wiki pages.

## Promotion Targets

- `wiki/groups/hanwha/market.md`
- `wiki/groups/hanwha/financials.md`
- `wiki/groups/hanwha/value-up.md`
- `wiki/groups/hanwha/governance.md`
- `wiki/groups/hanwha/investment-thesis.md`
- `wiki/groups/hanwha/market-views.md`

## Promotion Rule

Claims from the old markdown can be promoted only when:

- the claim is matched to a raw manifest entry;
- the source has a public URL or canonical filing key;
- the source date and access date are present;
- the claim's value, unit, and date are checked by code or human review;
- contradictions are recorded rather than overwritten.

## Source References

- `raw/manifests/hanwha.claim-candidates.json`
- `raw/manifests/hanwha.local-sources.json`
- `raw/manifests/hanwha.extraction-report.json`
