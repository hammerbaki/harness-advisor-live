---
title: "Hanwha Source Inventory"
group_id: "hanwha"
company_id: ""
source_status: "source-backed"
last_checked: "2026-05-01"
confidence: "medium"
---

# Hanwha Source Inventory

## Summary

The local `../hanhwa_knowledge` folder has been inventoried as candidate raw
sources for the Hanwha reference slice. The files are not copied into this
repository. The manifest records local paths, checksums, inferred source roles,
and processing decisions.

The project records a policy-based retention rationale for each file before
using it in the paper or runtime wiki. The same source-selection rules should be
used for Hanwha, Samsung, SK, Hyundai Motor, LG, and future target groups.

The materials are treated as sourced from the official Hanwha Corporation IR
site route rooted at:

`https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp`

## Source Buckets

- 45 local files were inventoried after official backfill.
- 22 files are periodic reports.
- 14 files are IR materials.
- 9 files are governance materials.
- 1 file is governance material with no PDF extension.
- 38 files are inferred official issuer sources.
- 7 files are inferred third-party analyst sources.
- 14 files are under `_official_backfill/` and were added by rule-based
  official backfill.

## Processing Policy

Official issuer material can become source-backed wiki context only after each
file receives a public URL, access date, and canonical filing or IR source key.

Analyst reports are secondary interpretation material. They should be used for
metadata, market-view comparison, and contradiction checks unless redistribution
rights are separately verified.

## Open Gaps

- Add public source URLs for selected official documents.
- Add DART receipt numbers for periodic reports where available.
- Verify the governance file's media type before extraction.
- Review `raw/manifests/hanwha.extraction-report.json` for extraction failures
  and low-text warnings.
- Review `raw/manifests/hanwha.official-site-scan.json` for official downloads
  missing from the local source folder.
- Review `raw/manifests/hanwha.official-backfill-plan.json` before deciding
  whether any remaining official download should be added.
- Review `raw/manifests/hanwha.source-provenance.json` before claiming that a
  local file is official-source backed.
- Review `raw/manifests/hanwha.selection-rationale.json` before implying that a
  local file belongs in the reference slice.
- Split the previous markdown knowledge file into atomic claims and link each
  claim back to a manifest entry before moving claims into runtime context.

## Source References

- `raw/manifests/hanwha.local-sources.json`
- `raw/manifests/hanwha.official-site-scan.json`
- `raw/manifests/hanwha.source-provenance.json`
- `raw/manifests/hanwha.selection-rationale.json`
- `raw/manifests/hanwha.official-backfill-plan.json`
- `raw/manifests/hanwha.extraction-report.json`
- `docs/17_hanwha_knowledge_diagnostic.md`
- `docs/19_hanwha_source_selection_rationale.md`

<!-- BEGIN GENERATED:source-backed-claim-manifest -->
## Source-Backed Claim Manifest

- `raw/manifests/hanwha.source-backed-claims.json` records the first reviewed seed claims.
- `docs/23_hanwha_source_backed_claims.md` explains the promotion gate and claim table.
- These claims are eligible for bounded runtime context; the older RAG claim backlog remains `needs_source_link`.
<!-- END GENERATED:source-backed-claim-manifest -->
