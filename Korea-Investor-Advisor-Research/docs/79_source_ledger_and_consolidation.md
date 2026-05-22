# Source Ledger And Folder Consolidation

Generated: 2026-05-09T05:29:56.643Z

## Purpose

This document consolidates deep local source folders into a project-level source ledger. It uses the reconciled `ir_download` staging package as evidence, but does not copy duplicate files or flatten official source folders. Product code, evaluation, and paper writing should use the ledger fields rather than deep folder paths.

## Current Verdict

- `ir_download` has already been reconciled against `Knowledge Base` by SHA-256.
- 210 staging files were checked; 210 source ledger rows now carry an `ir_download` match.
- The safe consolidation is logical, not destructive: keep raw files in their company folders and expose a canonical `sourceId -> companyId -> documentType -> sourceProvenance` abstraction.
- Physical folder moves should wait until all source scripts run from `KNOWLEDGE_BASE_ROOT` and `IR_DOWNLOAD_ROOT`.

## Summary

| Metric | Count |
| --- | --- |
| Source records | 607 |
| Company index rows | 38 |
| PDF sources | 583 |
| Sources with source provenance | 598 |
| Sources with selection reason | 595 |
| ir_download source files | 210 |
| ir_download matched ledger rows | 210 |
| Duplicate hash groups inside ledger | 19 |

## Group-Level Index

| Group | Sources | Companies | PDF | Provenance | Selection reason | ir_download matched | Dominant document types |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 삼성<br><code>samsung</code> | 112 | 7 | 100 | 110 | 102 | 60 | `unknown`: 42<br>`earnings_presentation`: 19<br>`audit_report`: 16<br>`business_report`: 10 |
| SK<br><code>sk</code> | 132 | 5 | 132 | 132 | 132 | 75 | `earnings_presentation`: 64<br>`review_report`: 27<br>`audit_report`: 15<br>`earnings_press_release`: 8 |
| 현대자동차<br><code>hyundai-motor</code> | 158 | 11 | 156 | 151 | 156 | 17 | `earnings_presentation`: 94<br>`business_report`: 39<br>`investor_presentation`: 9<br>`value_up_plan`: 7 |
| LG<br><code>lg</code> | 98 | 9 | 93 | 98 | 98 | 0 | `earnings_release`: 80<br>`value_up_plan`: 8<br>`annual_report`: 3<br>`agm`: 2 |
| 한화<br><code>hanwha</code> | 107 | 5 | 102 | 107 | 107 | 58 | `earnings_material`: 39<br>`periodic_report`: 22<br>`ir_material`: 12<br>`audit_report`: 10 |

## Company-Level Index

| Group | Company | Sources | Provenance | Selection reason | ir_download | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `hanwha` | ㈜한화<br><code>hanwha</code> | 46 | 46 | 46 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hanwha` | 한화에어로스페이스<br><code>hanwha-aerospace</code> | 21 | 21 | 21 | 20 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hanwha` | 한화오션<br><code>hanwha-ocean</code> | 11 | 11 | 11 | 10 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hanwha` | 한화솔루션<br><code>hanwha-solutions</code> | 11 | 11 | 11 | 10 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hanwha` | 한화시스템<br><code>hanwha-systems</code> | 18 | 18 | 18 | 18 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hyundai-motor` | 현대오토에버<br><code>hyundai-autoever</code> | 22 | 22 | 22 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 현대비앤지스틸<br><code>hyundai-bng-steel</code> | 6 | 6 | 6 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 현대건설<br><code>hyundai-eandc</code> | 11 | 6 | 11 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 현대글로비스<br><code>hyundai-glovis</code> | 33 | 33 | 33 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hyundai-motor` | 현대모비스<br><code>hyundai-mobis</code> | 12 | 12 | 12 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hyundai-motor` | 현대자동차<br><code>hyundai-motor</code> | 11 | 11 | 11 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hyundai-motor` | 현대로템<br><code>hyundai-rotem</code> | 28 | 26 | 26 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `hyundai-motor` | 현대제철<br><code>hyundai-steel</code> | 1 | 1 | 1 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 현대위아<br><code>hyundai-wia</code> | 13 | 13 | 13 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 이노션<br><code>innocean</code> | 4 | 4 | 4 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `hyundai-motor` | 기아<br><code>kia</code> | 17 | 17 | 17 | 17 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `lg` | LG화학<br><code>lg-chem</code> | 18 | 18 | 18 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `lg` | LG씨엔에스<br><code>lg-cns</code> | 6 | 6 | 6 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `lg` | LG<br><code>lg-corp</code> | 13 | 13 | 13 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `lg` | LG디스플레이<br><code>lg-display</code> | 5 | 5 | 5 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `lg` | LG전자<br><code>lg-electronics</code> | 18 | 18 | 18 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `lg` | LG에너지솔루션<br><code>lg-energy-solution</code> | 13 | 13 | 13 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `lg` | LG생활건강<br><code>lg-hnh</code> | 6 | 6 | 6 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `lg` | LG이노텍<br><code>lg-innotek</code> | 15 | 15 | 15 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `lg` | LG유플러스<br><code>lg-uplus</code> | 4 | 4 | 4 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | 삼성바이오로직스<br><code>samsung-biologics</code> | 15 | 15 | 15 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | 삼성물산<br><code>samsung-ct</code> | 13 | 13 | 13 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | 삼성전기<br><code>samsung-electro-mechanics</code> | 60 | 60 | 60 | 60 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | 삼성전자<br><code>samsung-electronics</code> | 6 | 6 | 6 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | 삼성화재<br><code>samsung-fire-marine</code> | 5 | 5 | 0 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `samsung` | 삼성생명<br><code>samsung-life</code> | 5 | 5 | 0 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `samsung` | 삼성SDI<br><code>samsung-sdi</code> | 6 | 6 | 6 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `samsung` | unassigned<br><code>unassigned</code> | 2 | 0 | 2 | 0 | `outside-first-slice-or-not-audited` | keep in source ledger; promote claims only when selected for runtime |
| `sk` | SK하이닉스<br><code>sk-hynix</code> | 11 | 11 | 11 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `sk` | SK<br><code>sk-inc</code> | 17 | 17 | 17 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `sk` | SK이노베이션<br><code>sk-innovation</code> | 4 | 4 | 4 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `sk` | SK스퀘어<br><code>sk-square</code> | 75 | 75 | 75 | 75 | `runtime-seed-ready` | maintain as first-slice runtime seed |
| `sk` | SK텔레콤<br><code>sk-telecom</code> | 25 | 25 | 25 | 0 | `runtime-seed-ready` | maintain as first-slice runtime seed |

## Consolidation Rule

The raw source tree may remain deep because it preserves provenance and original collection context. The project should consolidate above it through these artifacts:

- `raw/manifests/source-ledger.v0.1.json`: full source-level ledger.
- `raw/manifests/company-source-index.json`: compact company-level source index.
- `raw/manifests/first-slice-readiness-audit.json`: readiness gate for paper/product reference companies.

Runtime code should not walk `Knowledge Base` directly. It should consume promoted claims, wiki pages, and source manifests that already resolve company identity, source provenance, document type, and selection reason.

## Physical Folder Migration Gate

A later physical move from the current sibling roots to `sources/knowledge-base/` and `sources/incoming/` is allowed only after:

1. all inventory/import scripts pass with `KNOWLEDGE_BASE_ROOT` and `IR_DOWNLOAD_ROOT`;
2. the source ledger is regenerated without count changes;
3. `npm run audit:first-slice`, `npm run validate:stage-gate`, and `npm run typecheck` pass;
4. no active manual data-collection process still writes into the old folder names.

## Machine-Readable Artifacts

- `raw/manifests/source-ledger.v0.1.json`
- `raw/manifests/company-source-index.json`
