---
title: "현대모비스 Hyundai Motor Wiki Seed"
group_id: "hyundai-motor"
company_id: "hyundai-mobis"
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# 현대모비스 Wiki Seed

## Runtime Boundary

This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.

## Financial Claims

| Claim ID | Claim | Runtime policy |
| --- | --- | --- |
| `hyundai-sbc-003` | 현대모비스는 OpenDART 2024년 연결 기준 매출액 572,370억원, 영업이익 30,735억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `hyundai-sbc-008` | 현대모비스는 OpenDART 연결 기준 2023년 매출액 592,544억원, 영업이익 22,953억원에서 2024년 매출액 572,370억원, 영업이익 30,735억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |

## Narrative Claim Queue

| Queue ID | Source | Type | State | Blocked reason |
| --- | --- | --- | --- | --- |
| `hyundai-ncq-035` | 2024년 연간 경영실적 | earnings_presentation | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |
| `hyundai-ncq-036` | 2025년 연간 경영실적 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-037` | 2025년 1분기 경영실적 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-038` | 2025년 2분기 경영실적 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-039` | 2025년 3분기 경영실적 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-040` | 2026년 1분기 경영실적 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-041` | 2025년 현대모비스 회사 소개 자료 | investor_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-042` | 2025 CEO Investor Day | investor_presentation | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |
| `hyundai-ncq-043` | 2025년 Governance NDR | investor_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-044` | 2026년 현대모비스 회사 소개 자료 | investor_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-045` | 2025 현대모비스 기업가치 제고계획 이행현황 | value_up_plan | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |
| `hyundai-ncq-046` | 2026 CEO Letter | value_up_plan | ready_for_human_claim_review |  |

## Source References

- `raw/manifests/hyundai-motor.source-backed-claims.json`
- `raw/manifests/hyundai-motor.extraction-report.json`
- `raw/manifests/hyundai-motor.narrative-claim-queue.json`
