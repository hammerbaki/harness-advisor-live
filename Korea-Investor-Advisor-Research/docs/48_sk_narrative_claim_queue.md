# SK Narrative Claim Queue

Generated: 2026-05-03T06:56:43.796Z

## Purpose

This document records SK narrative source readiness before runtime claim promotion. It is a review ledger, not user-facing knowledge. The same claim-queue schema should be used for every group after group-specific source intake normalizes raw files.

## Summary

- Queue themes: 4
- Ready sources for evidence-locator review: 26
- Blocked sources: 31
- Low-text or image-PDF sources: 12
- Extraction-error sources: 5
- URL-pending sources: 1
- Existing financial seed claims: 8

## Theme Queue

| Company | Theme | State | Ready sources | Blocked sources | Next action |
| --- | --- | --- | ---: | ---: | --- |
| SK하이닉스 | `sk-hynix-value-up-memory-readiness` | `partially_ready_for_human_claim_review` | 6 | 5 | review ready sources first and keep blocked sources out of runtime promotion |
| SK이노베이션 | `sk-innovation-energy-battery-earnings` | `ready_for_human_claim_review` | 4 | 0 | draft atomic candidate claims with evidence locators |
| SK | `sk-inc-portfolio-value-up-holding-company` | `partially_ready_for_human_claim_review` | 10 | 7 | review ready sources first and keep blocked sources out of runtime promotion |
| SK텔레콤 | `sk-telecom-telecom-ai-value-up` | `partially_ready_for_human_claim_review` | 6 | 19 | review ready sources first and keep blocked sources out of runtime promotion |

## Promotion Boundary

A queued source can support a runtime claim only after the reviewer writes an atomic claim with a public document URL, extraction hash, evidence locator, period/reporting basis, companyId, companyScope, and forward-looking label when needed. The queue itself must not be exposed as customer-facing evidence.

## Company Notes

### SK하이닉스

State: `partially_ready_for_human_claim_review`

Candidate claim families:

- value-up and shareholder-return policy from official value-up material
- financial-report baseline for memory-cycle recovery questions
- HBM and AI-memory strategy only after OCR or text-bearing source verification

Ready source examples:

- 2025_3Q_Review_Report (review_report, 2025Q3)
- 2025_1Q_Review_Report (review_report, 2025Q1)
- 2025_Semiannual_Review_Report (semiannual_report, 2025)
- 2024_Corporate_Value-up_Plan (value_up_plan, 2024)
- 2025_Annual_Audit_Consolidated (audit_report, 2025)

Blocked source issues:

- duplicate_local_file: 3
- low_text_or_image_pdf: 2

### SK이노베이션

State: `ready_for_human_claim_review`

Candidate claim families:

- quarterly earnings drivers and segment pressure from official earnings releases
- energy and battery performance context bounded to released periods
- portfolio-transition interpretation only when stated in official material

Ready source examples:

- 2025_4Q_Earnings_Release (earnings_presentation, 2025Q4)
- 2025_2Q_Earnings_Release (earnings_presentation, 2025Q2)
- 2025_3Q_Earnings_Release (earnings_presentation, 2025Q3)
- 2025_1Q_Earnings_Release (earnings_presentation, 2025Q1)

Blocked source issues:

- none

### SK

State: `partially_ready_for_human_claim_review`

Candidate claim families:

- holding-company portfolio and investment-company framing
- value-up and capital-allocation policy from official value-up material
- quarterly holding-company performance context from text-bearing earnings briefings

Ready source examples:

- 2026-03-182025년_사업보고서 (business_report, 2025)
- 2024-10-282024_SK_Inc._기업가치_제고_계획 (value_up_plan, 2024)
- 2025년_감사보고서 (audit_report, 2025)
- 2026-03-182025_4Q_SK주식회사_Earnings_Briefing (earnings_presentation, 2025Q4)
- 2025-11-142025_3Q_SK주식회사_Earnings_Briefing (earnings_presentation, 2025Q3)

Blocked source issues:

- document_url_pending: 1
- extraction_error: 5
- low_text_or_image_pdf: 1

### SK텔레콤

State: `partially_ready_for_human_claim_review`

Candidate claim families:

- telecom earnings and margin context from text-bearing press releases
- value-up and shareholder-return policy from official value-up material
- AI or data-center claims only where extracted text provides explicit support

Ready source examples:

- 2025_2Q_PressRelease_Kor (earnings_press_release, 2025Q2)
- 2025_4Q_PressRelease_Kor (earnings_press_release, 2025Q4)
- 2025_1Q_PressRelease_Kor (earnings_press_release, 2025Q1)
- 2025_3Q_PressRelease_Kor (earnings_press_release, 2025Q3)
- 2024_SKT_Corporate_Value-up_Plan (value_up_plan, 2024)

Blocked source issues:

- duplicate_local_file: 10
- low_text_or_image_pdf: 9

## Source References

- `raw/manifests/sk.local-sources.json`
- `raw/manifests/sk.extraction-report.json`
- `raw/manifests/sk.narrative-claim-queue.json`
- `docs/47_sk_source_inventory_and_ingestion.md`
