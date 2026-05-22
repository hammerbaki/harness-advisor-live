---
title: "Hyundai Motor Advisor Wiki Overview"
group_id: "hyundai-motor"
company_id: ""
source_status: "financial-source-backed-seed"
last_checked: "2026-05-05"
confidence: "medium"
---

# Hyundai Motor Advisor Wiki Overview

Hyundai Motor Group is the third transfer target used to test whether the common harness can support automotive, mobility, and parts-company coverage after Samsung and SK.

## Current State

- DART/KRX identifiers are verified for the five-company first slice: Hyundai Motor, Kia, Hyundai Mobis, Hyundai Glovis, and Hyundai Rotem.
- 7 optional second-wave listed-company identifiers are verified for intake, but not runtime-promoted.
- OpenDART 2022-2024 annual financial table is recorded in `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`.
- Financial source-backed seed claims are recorded in `raw/manifests/hyundai-motor.source-backed-claims.json`.
- First-slice local PDFs are extracted and queued for narrative claim review where files are available.
- Kia IR materials are still listed as source-page-only SPA records and need downloadable files or exact document URLs before narrative promotion.

## Runtime Boundary

This namespace can support bounded financial baseline answers for Hyundai Motor, Kia, and Hyundai Mobis. Optional second-wave companies remain source-intake candidates until inventory, extraction, claim review, and scenario gates are completed. The runtime must not infer strategy, value-up, EV, parts, shareholder-return, or guidance conclusions from extracted PDFs until those claims are promoted from the narrative queue.

## Optional Second-Wave Intake Candidates

| Company ID | Company | KRX | DART |
| --- | --- | --- | --- |
| `hyundai-autoever` | 현대오토에버 | 307950 | 00362441 |
| `hyundai-wia` | 현대위아 | 011210 | 00106623 |
| `hyundai-eandc` | 현대건설 | 000720 | 00164478 |
| `innocean` | 이노션 | 214320 | 00565154 |
| `hyundai-motor-securities` | 현대차증권 | 001500 | 00137997 |
| `hyundai-bng-steel` | 현대비앤지스틸 | 004560 | 00125743 |
| `hyundai-steel` | 현대제철 | 004020 | 00145880 |

## Source References

- `raw/manifests/hyundai-motor.identifier-verification.json`
- `raw/manifests/hyundai-motor.local-sources.json`
- `raw/manifests/hyundai-motor.extraction-report.json`
- `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`
- `raw/manifests/hyundai-motor.narrative-claim-queue.json`
- `raw/manifests/hyundai-motor.source-backed-claims.json`
