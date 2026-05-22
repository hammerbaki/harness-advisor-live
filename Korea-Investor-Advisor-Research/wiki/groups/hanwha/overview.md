---
title: "Hanwha Advisor Wiki Overview"
group_id: "hanwha"
company_id: ""
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# Hanwha Advisor Wiki Overview

Hanwha is the reference slice used to reconstruct the original PoC into a reproducible advisor architecture.

## Current State

- The current runtime reference slice is issuer-scoped to ㈜한화.
- The profile now uses the same company-scoped ID convention as Samsung, SK, Hyundai Motor, and LG.
- Affiliate pages under `wiki/groups/hanwha/companies/` are intake placeholders until source-backed claims are promoted.
- Remaining official-site downloads are handled through claim-driven backfill, not by collecting every file.

## Source References

- `configs/groups.json`
- `raw/manifests/hanwha.json`
- `raw/manifests/hanwha.source-intake-template.json`
- `raw/manifests/hanwha.source-backed-claims.json`

## Open Questions

- Add document-level URL ledger records for affiliate-specific Hanwha materials.
- Promote affiliate claims only after evidence locator and company scope review.
- Keep financial-company accounts strictly tied to explicit DART labels.
