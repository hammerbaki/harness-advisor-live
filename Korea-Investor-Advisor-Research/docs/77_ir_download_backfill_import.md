# IR Download Backfill Import

Generated: 2026-05-06T00:46:35.523Z

## Purpose

This document records the safe import from the external `ir_download` folder into the project `Knowledge Base` folder. Files are copied by company and document type, exact SHA-256 duplicates are skipped, and no existing file is deleted or overwritten.

## Summary

| Metric | Count |
| --- | ---: |
| Source files scanned | 210 |
| Files copied into Knowledge Base | 0 |
| Duplicate files skipped by hash | 210 |
| Missing source directories | 0 |

## Company Import Result

| Group | Company ID | Source folder | Target folder | Source files | Copied | Duplicates | Categories |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| hanwha | `hanwha-aerospace` | `hanwha_aerospace` | `hanhwa_knowledge/hanwha_aerospace` | 20 | 0 | 20 | `capital_actions`, `investor_presentations`, `value_up` |
| hanwha | `hanwha-solutions` | `hanwha_solutions` | `hanhwa_knowledge/hanwha_solutions` | 10 | 0 | 10 | `earnings` |
| hanwha | `hanwha-systems` | `hanwha_systems` | `hanhwa_knowledge/hanwha_systems` | 18 | 0 | 18 | `annual_reports`, `audit_reports`, `earnings` |
| hanwha | `hanwha-ocean` | `hanwha_ocean` | `hanhwa_knowledge/hanwha_ocean` | 10 | 0 | 10 | `earnings` |
| samsung | `samsung-electro-mechanics` | `samsung_electro` | `samsung_knowledge/삼성전기` | 60 | 0 | 60 | `annual_reports`, `audit_reports`, `earnings`, `governance`, `sustainability` |
| sk | `sk-square` | `sk_square` | `sk_knowledge/sk_square` | 75 | 0 | 75 | `annual_reports`, `audit_reports`, `earnings`, `misc`, `presentations`, `quarterly_reports`, `value_up` |
| hyundai-motor | `kia` | `kia` | `hyundai_knowledge/kia` | 17 | 0 | 17 | `earnings` |

## Classification Rule

- earnings materials: earnings releases, IR presentations, quarterly performance decks.
- annual reports: business reports and operating reports.
- audit reports: separate and consolidated audit reports.
- quarterly reports: review reports and quarterly review packages.
- investor presentations: strategy or future-vision presentation material.
- value-up: value-up plans, shareholder-return plans, dividend policy material.
- capital actions: rights issue, capital allocation, and cash/stock dividend decision material.
- governance and sustainability are kept separate because they support different claim types.

## Next Step

Run the group inventory scripts, first-slice audit, and source-ledger audit to confirm that the previously missing company source packages are visible to the harness.

## Consolidation Note

When all scanned files are skipped as duplicate hashes, the staging folder has still served its purpose: it proves that the external source package is already represented in `Knowledge Base`. The next consolidation layer is not another file copy. It is the canonical source ledger:

- `raw/manifests/source-ledger.v0.1.json`
- `raw/manifests/company-source-index.json`
- `docs/79_source_ledger_and_consolidation.md`

## Machine-Readable Artifact

`raw/manifests/ir-download-backfill-import.json`
