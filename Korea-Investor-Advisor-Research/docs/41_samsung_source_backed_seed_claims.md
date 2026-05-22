# Samsung Source-Backed Seed Claims

Generated: 2026-05-06T04:38:15.573Z

## Purpose

This note records the Samsung claims promoted into source-backed seed knowledge. The first layer starts from OpenDART annual financial-statement API records, and the second layer adds a small set of official IR/DART narrative claims only after public URL, extraction hash, and evidence-line checks pass.

## Why DART First

The project goal is a paper-ready and commercializable template. For Samsung, several affiliates use different IR sites and some financial affiliates do not expose a simple operating-company-style revenue line through OpenDART. Therefore the first seed set uses only DART account labels that are explicitly present in the API artifact.

## Finance-Company Boundary

The seed does not define revenue for financial companies from `이자수익`, `수수료수익`, `보험수익`, `순이자손익`, or related finance-specific accounts. If OpenDART does not provide an accepted explicit `매출액`, `영업수익`, or `수익(매출액)` account, the revenue field remains blank.

Companies with intentionally limited 2024 claims: 삼성생명, 삼성화재, 삼성증권.

## Summary

- Source-backed seed claims promoted: 31
- Annual financial claims: 12
- Limited financial-company claims: 3
- Trend claims: 4
- Narrative seed claims: 12
- Local-PDF-ready narrative themes held for later review: 5
- DART-viewer-pending themes: 0
- Source-selection policy version: 2026-05-01

## Claims

| ID | Company | Claim type | Runtime policy |
| --- | --- | --- | --- |
| `samsung-sbc-001` | 삼성전자 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-002` | 삼성SDI | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-003` | 삼성물산 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-004` | 삼성생명 | `financial_metric_limited` | `eligible_for_bounded_context_with_missing_revenue_label` |
| `samsung-sbc-005` | 삼성화재 | `financial_metric_limited` | `eligible_for_bounded_context_with_missing_revenue_label` |
| `samsung-sbc-006` | 삼성바이오로직스 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-007` | 삼성전기 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-008` | 삼성SDS | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-009` | 삼성중공업 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-010` | 삼성E&A | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-011` | 삼성카드 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-012` | 삼성증권 | `financial_metric_limited` | `eligible_for_bounded_context_with_missing_revenue_label` |
| `samsung-sbc-013` | 제일기획 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-014` | 호텔신라 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-015` | 에스원 | `financial_metric` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-016` | 삼성전자 | `financial_trend` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-017` | 삼성SDI | `financial_trend` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-018` | 삼성물산 | `financial_trend` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-019` | 삼성바이오로직스 | `financial_trend` | `eligible_for_bounded_context_with_dart_account_label` |
| `samsung-sbc-020` | 삼성전자 | `financial_business_pipeline` | `eligible_for_bounded_context_with_preliminary_result_label` |
| `samsung-sbc-021` | 삼성전자 | `business_pipeline_forward_looking` | `eligible_for_bounded_context_with_forward_looking_label` |
| `samsung-sbc-022` | 삼성SDI | `financial_business_pipeline` | `eligible_for_bounded_context_with_preliminary_result_label` |
| `samsung-sbc-023` | 삼성SDI | `business_pipeline_forward_looking` | `eligible_for_bounded_context_with_forward_looking_label` |
| `samsung-sbc-024` | 삼성물산 | `shareholder_value_business` | `eligible_for_bounded_context_with_shareholder_letter_label` |
| `samsung-sbc-025` | 삼성물산 | `business_pipeline_forward_looking` | `eligible_for_bounded_context_with_forward_looking_label` |
| `samsung-sbc-026` | 삼성바이오로직스 | `financial_business_pipeline` | `eligible_for_bounded_context_with_forward_looking_label` |
| `samsung-sbc-027` | 삼성바이오로직스 | `business_pipeline` | `eligible_for_bounded_context` |
| `samsung-sbc-028` | 삼성생명 | `capital_risk` | `eligible_for_bounded_context_with_regulatory_filing_label` |
| `samsung-sbc-029` | 삼성생명 | `shareholder_capital` | `eligible_for_bounded_context_with_regulatory_filing_label` |
| `samsung-sbc-030` | 삼성화재 | `capital_risk` | `eligible_for_bounded_context_with_regulatory_filing_label` |
| `samsung-sbc-031` | 삼성화재 | `shareholder_capital` | `eligible_for_bounded_context_with_regulatory_filing_label` |

## Runtime Rule

Runtime answers may use these claims only as bounded context. The UI should show investor-facing summaries, while the development trace keeps claim IDs, source status, account labels, and validation details for paper evaluation.

Narrative claims must preserve their evidence boundary: realized results, management outlook, capital/risk statements, and shareholder-return statements should not be collapsed into a single investment recommendation. Forward-looking claims need explicit labeling in the answer composer and trace.

## Remaining Work

1. Use the promoted Samsung narrative claims to build frozen Samsung evaluation scenarios.
2. Add the remaining Samsung C&T 2026Q1 PPT only if an exact document-level URL is supplied.
3. Review whether additional Samsung affiliates need narrative coverage before expanding the same template to SK, Hyundai Motor, and LG.

## Source References

- `raw/manifests/samsung.source-backed-claims.json`
- `raw/manifests/samsung.dart-financial-table.2022-2024.json`
- `raw/manifests/samsung.dart-financial-account-audit.2022-2024.json`
- `raw/manifests/samsung.identifier-verification.json`
- `raw/manifests/samsung.local-source-adequacy-audit.json`
- `configs/samsung-narrative-claim-seeds.json`
- `raw/manifests/samsung.document-url-intake.json`
- `raw/manifests/samsung.extraction-report.json`
- `raw/manifests/samsung.dart-filing-extraction-report.json`
- `configs/source-selection-policy.json`
