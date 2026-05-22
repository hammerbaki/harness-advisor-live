---
title: "현대로템 Hyundai Motor Wiki Seed"
group_id: "hyundai-motor"
company_id: "hyundai-rotem"
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# 현대로템 Wiki Seed

## Runtime Boundary

This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.

## Financial Claims

| Claim ID | Claim | Runtime policy |
| --- | --- | --- |
| `hyundai-sbc-005` | 현대로템은 OpenDART 2024년 연결 기준 매출액 43,766억원, 영업이익 4,566억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `hyundai-sbc-010` | 현대로템은 OpenDART 연결 기준 2023년 매출액 35,874억원, 영업이익 2,100억원에서 2024년 매출액 43,766억원, 영업이익 4,566억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |

## Narrative Claim Queue

| Queue ID | Source | Type | State | Blocked reason |
| --- | --- | --- | --- | --- |
| `hyundai-ncq-058` | 2024년 1분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-059` | 2024년 2분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-060` | 2024년 3분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-061` | 2024년 4분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-062` | 2025년 1분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-063` | 2025년 2분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-064` | 2025년 3분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-065` | 2025년 4분기 실적발표 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-066` | 2026년 1분기 실적발표 | earnings_presentation | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |
| `hyundai-ncq-067` | 현대로템 중장기 배당정책 ('25~'26) v2 | value_up_plan | ready_for_human_claim_review |  |
| `hyundai-ncq-068` | 현대로템 중장기 배당정책 ('25~'26) | value_up_plan | ready_for_human_claim_review |  |
| `hyundai-ncq-069` | 현대로템 중장기 배당정책 ('25~'27) | value_up_plan | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |

## Source References

- `raw/manifests/hyundai-motor.source-backed-claims.json`
- `raw/manifests/hyundai-motor.extraction-report.json`
- `raw/manifests/hyundai-motor.narrative-claim-queue.json`
