---
title: "SK Financial Source-Backed Seed"
group_id: "sk"
company_id: ""
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# SK Financial Source-Backed Seed

This page is built from OpenDART annual financial-statement API records and the promoted SK claim manifest.

## Runtime Boundary

Use this page only for bounded financial context. Each runtime answer must preserve company, year, reporting basis, account label, unit, and API status.

## Current Financial Claims

| Claim ID | Company | Claim | Runtime policy |
| --- | --- | --- | --- |
| `sk-sbc-001` | SK하이닉스 | SK하이닉스는 OpenDART 2024년 연결 기준 매출액 661,930억원, 영업이익 234,673억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-002` | SK하이닉스 | SK하이닉스는 OpenDART 연결 기준 2023년 매출액 327,657억원, 영업손실 77,303억원에서 2024년 매출액 661,930억원, 영업이익 234,673억원으로 전환된 것으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-007` | SK이노베이션 | SK이노베이션은 OpenDART 2024년 연결 기준 매출액 747,170억원, 영업이익 3,155억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-008` | SK이노베이션 | SK이노베이션은 OpenDART 연결 기준 2023년 매출액 772,885억원, 영업이익 19,039억원에서 2024년 매출액 747,170억원, 영업이익 3,155억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-003` | SK | SK는 OpenDART 2024년 연결 기준 매출액 1,246,904억원, 영업이익 23,553억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-004` | SK | SK는 OpenDART 연결 기준 2023년 매출액 1,312,379억원, 영업이익 50,564억원에서 2024년 매출액 1,246,904억원, 영업이익 23,553억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-005` | SK텔레콤 | SK텔레콤은 OpenDART 2024년 연결 기준 매출액 179,406억원, 영업이익 18,234억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-006` | SK텔레콤 | SK텔레콤은 OpenDART 연결 기준 2023년 매출액 176,085억원, 영업이익 17,532억원에서 2024년 매출액 179,406억원, 영업이익 18,234억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `sk-sbc-018` | SK스퀘어 | SK스퀘어의 2025 Portfolio Update는 2025년 연결 기준 총 NAV 100.2조원, 매출액 1,411.5십억원, 영업이익 8,797.4십억원, 당기순이익 8,818.7십억원을 제시한다. | `eligible_for_bounded_context_with_preliminary_result_label` |

## Source References

- `raw/manifests/sk.dart-financial-table.2022-2024.json`
- `raw/manifests/sk.source-backed-claims.json`
