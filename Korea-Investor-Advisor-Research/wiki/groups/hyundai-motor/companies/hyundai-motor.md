---
title: "현대자동차 Hyundai Motor Wiki Seed"
group_id: "hyundai-motor"
company_id: "hyundai-motor"
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# 현대자동차 Wiki Seed

## Runtime Boundary

This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.

## Financial Claims

| Claim ID | Claim | Runtime policy |
| --- | --- | --- |
| `hyundai-sbc-001` | 현대차는 OpenDART 2024년 연결 기준 매출액 1,752,312억원, 영업이익 142,396억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |
| `hyundai-sbc-006` | 현대차는 OpenDART 연결 기준 2023년 매출액 1,626,636억원, 영업이익 151,269억원에서 2024년 매출액 1,752,312억원, 영업이익 142,396억원으로 확인된다. | `eligible_for_bounded_context_with_dart_account_label` |

## Narrative Claim Queue

| Queue ID | Source | Type | State | Blocked reason |
| --- | --- | --- | --- | --- |
| `hyundai-ncq-047` | 2024년 사업보고서 (영업보고서) | business_report | ready_for_human_claim_review |  |
| `hyundai-ncq-048` | 2025년 사업보고서 (영업보고서) | business_report | ready_for_human_claim_review |  |
| `hyundai-ncq-049` | 2025년 연간보고서 (Annual Report) | business_report | ready_for_human_claim_review |  |
| `hyundai-ncq-050` | 2025년 1분기 실적발표 자료 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-051` | 2025년 2분기 실적발표 자료 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-052` | 2025년 3분기 실적발표 자료 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-053` | 2025년 4분기 실적발표 자료 | earnings_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-054` | 2026년 연간 가이던스 | strategy_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-055` | 2024 CEO Investor Day 발표자료 (한국어) | investor_presentation | ready_for_human_claim_review |  |
| `hyundai-ncq-056` | 2025 CEO Investor Day 발표자료 (영문) | investor_presentation | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |
| `hyundai-ncq-057` | 2025 CEO Investor Day 발표자료 (한국어) | investor_presentation | blocked_before_claim_review | low_text_or_image_like_pdf_requires_ocr_or_manual_review |

## Source References

- `raw/manifests/hyundai-motor.source-backed-claims.json`
- `raw/manifests/hyundai-motor.extraction-report.json`
- `raw/manifests/hyundai-motor.narrative-claim-queue.json`
