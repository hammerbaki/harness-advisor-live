---
title: "Hanwha Financials"
group_id: "hanwha"
company_id: ""
source_status: "draft"
last_checked: "2026-05-01"
confidence: "low"
---

# Hanwha Financials

## Summary

Financial statement summaries, segment profit claims, balance-sheet claims, and
affiliate performance claims belong here after verification.

## Required Evidence

- Annual and quarterly reports for audited and periodic numbers.
- Earnings presentation for investor-facing performance commentary.
- Explicit unit normalization before runtime use.

## Current Status

Official PDFs were extractable. A small source-backed seed set has been
promoted below, but the page remains draft until the remaining financial claims
are reviewed and linked.

## Source References

- `raw/manifests/hanwha.extraction-report.json`
- `raw/manifests/hanwha.claim-candidates.json`
- `raw/manifests/hanwha.source-backed-claims.json`

<!-- BEGIN GENERATED:source-backed-seed-claims -->
## Source-Backed Seed Claims

These claims are the first reviewed seed set promoted from official-source extraction.
The page remains `draft` until every runtime claim in this namespace is reviewed.

| Claim ID | Claim | Source | Runtime policy |
| --- | --- | --- | --- |
| `hanwha-sbc-001` | 2025년 연결 기준 매출액은 747,474억원, 영업이익은 41,560억원, 영업이익률은 5.6%로 확인된다. | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-002` | 2025년 연결 매출액은 2024년 556,468억원 대비 34% 증가했고, 연결 영업이익은 2024년 24,161억원 대비 72% 증가했다. | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-012` | 한화에어로스페이스는 2026년 1분기 연결 기준 매출액 57,510억원, 영업이익 6,389억원, 영업이익률 11.1%를 제시했다. | `hanwha-local-6340a4d368a9` | `eligible_for_bounded_context_with_recent_ir_label` |
| `hanwha-sbc-013` | 한화솔루션은 2025년 연결 기준 매출액 133,544억원, 영업손실 3,533억원, 영업이익률 -2.6%를 제시했다. | `hanwha-local-440a6de8fb0d` | `eligible_for_bounded_context_with_recent_ir_label` |
| `hanwha-sbc-014` | 한화시스템은 2025년 연결 기준 매출액 36,641억원, 영업이익 1,119억원, 영업이익률 3.3%, 당기순이익 2,091억원을 제시했다. | `hanwha-local-c7cf5664d769` | `eligible_for_bounded_context_with_preliminary_ir_label` |
| `hanwha-sbc-015` | 한화오션은 2025년 연결 기준 매출액 127,835억원, 영업이익 11,676억원, 영업이익률 9.1%를 제시했다. | `hanwha-local-7fce556971af` | `eligible_for_bounded_context_with_recent_ir_label` |

Source manifest: `raw/manifests/hanwha.source-backed-claims.json`
<!-- END GENERATED:source-backed-seed-claims -->
