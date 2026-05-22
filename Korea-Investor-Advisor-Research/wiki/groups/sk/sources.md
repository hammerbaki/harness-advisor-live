---
title: "SK Sources"
group_id: "sk"
company_id: ""
source_status: "candidate-plan"
last_checked: "2026-05-05"
confidence: "medium"
---

# SK Sources

## Source Gate Summary

- Local entries: 132
- Extraction OK: 127
- Extraction errors: 5
- Low-text warnings: 21
- URL-matched candidates: 103
- Narrative queue themes: 4
- Ready sources for evidence review: 26
- Blocked sources: 31

## Runtime Promotion Rule

A source row alone is never runtime knowledge. Runtime knowledge starts only when a reviewer-authored claim passes public URL, extraction hash, evidence locator, company scope, policy-rule, and forward-looking label checks.

## Source-Backed Claim Manifest

- `raw/manifests/sk.source-backed-claims.json` records the SK runtime seed claims.
- `docs/49_sk_source_backed_narrative_claims.md` records the first narrative-promotion rationale.
- The queue and extraction report remain development/research artifacts and should not appear as customer-facing answer text.

## Source References

- `raw/manifests/sk.local-sources.json`
- `raw/manifests/sk.extraction-report.json`
- `raw/manifests/sk.narrative-claim-queue.json`
- `raw/manifests/sk.source-backed-claims.json`

## Extraction Rows

| Manifest ID | Company | Title | Type | Status | Text | URL |
| --- | --- | --- | --- | --- | --- | --- |
| sk-local-b7819639a1cc | SK하이닉스 | 2025_1Q_Review_Report | review_report | ok | ok | matched_from_document_url_list |
| sk-local-d92b4fd12117 | SK하이닉스 | 2025_3Q_Review_Report | review_report | ok | ok | matched_from_document_url_list |
| sk-local-bebdab921db4 | SK하이닉스 | 2025_Annual_Audit_Consolidated | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-dbe0a70bb78d | SK하이닉스 | 2025_Annual_Audit_Non-consolidated | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-bebdab921db4-dup1 | SK하이닉스 | 2025_Annual_Audit_Report_Consolidated | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-dbe0a70bb78d-dup1 | SK하이닉스 | 2025_Annual_Audit_Report_Non-consolidated | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-240328b57421 | SK하이닉스 | 2025_Semiannual_Review_Report | semiannual_report | ok | ok | matched_from_document_url_list |
| sk-local-edf6213047e8 | SK하이닉스 | 2023_Tech_Seminar_AI_Market_Outlook | strategy_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-69f960b4b1c8 | SK하이닉스 | 2023_Tech_Seminar_Competitive_Edge_of_HBM | strategy_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-1f3a2e24c2e6 | SK하이닉스 | 2024_Corporate_Value-up_Plan | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-1f3a2e24c2e6-dup1 | SK하이닉스 | 2024_SK_hynix_Corporate_Value-up_Plan | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-d95b9348fcad | SK | 2025년_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-ed7a042b1d4c | SK | 2026-03-12연결_검토보고서(2025년_4분기) | review_report | ok | ok | pending_url_reconciliation |
| sk-local-fa24dec21e31 | SK | 2025년_사업보고서 | business_report | error | ok |  |
| sk-local-78e345bd167e | SK | 2026-03-182025년_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-a283735ea8b9 | SK | ESG_보고서 | sustainability_report | error | ok |  |
| sk-local-de12ce6beab8 | SK | 2024-03-192023_4Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-df157840bfc0 | SK | 2024-05-162024_1Q_SK주식회사_Earnings_Briefing | earnings_presentation | error | ok |  |
| sk-local-8325e882fbdb | SK | 2024-08-142024_2Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-d020660e5bd5 | SK | 2024-10-282024_SK_Inc._기업가치_제고_계획 | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-8853ca7e6f7f | SK | 2024-11-142024_3Q_SK주식회사_Earnings_Briefing | earnings_presentation | error | ok |  |
| sk-local-dfd3bb412ba3 | SK | 2025-03-182024_4Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-6862bc11e923 | SK | 2025-05-152025_1Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-eddd14d183b0 | SK | 2025-07-102025_SK_Inc._Presentation | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-3383a401cd6c | SK | 2025-08-142025_2Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-1f7f05641752 | SK | 2025-08-292025_2Q_SK_Inc._Presentation | earnings_presentation | error | ok |  |
| sk-local-f0ed5da1e902 | SK | 2025-11-142025_3Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-5b7e15dc9476 | SK | 2026-03-182025_4Q_SK주식회사_Earnings_Briefing | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-b8a662bf4238 | SK이노베이션 | 2025_1Q_Earnings_Release | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-56df0f17d172 | SK이노베이션 | 2025_2Q_Earnings_Release | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-377fb1d6e206 | SK이노베이션 | 2025_3Q_Earnings_Release | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-e4f0fa5ef4ed | SK이노베이션 | 2025_4Q_Earnings_Release | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-0ce7d9ee3eb6 | SK스퀘어 | 제1기_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-1647fdd1db36 | SK스퀘어 | 제2기_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-2a80dccdef46 | SK스퀘어 | 제3기_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-6c1c343d9d1e | SK스퀘어 | 제4기_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-45e34a99cb50 | SK스퀘어 | 제5기_사업보고서 | business_report | ok | ok | matched_from_document_url_list |
| sk-local-84a5c4a0e091 | SK스퀘어 | 제1기_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-6b71cdc89957 | SK스퀘어 | 제1기_연결감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-b8beba3228a8 | SK스퀘어 | 제2기_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-5fbd933806a4 | SK스퀘어 | 제2기_연결감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-67d6ed22d5c5 | SK스퀘어 | 제3기_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-409e536549d3 | SK스퀘어 | 제3기_연결감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-7a2ef3b9493e | SK스퀘어 | 제4기_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-713f07aaed81 | SK스퀘어 | 제4기_연결감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-a98f136b328c | SK스퀘어 | 제5기_감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-bd097d02fea0 | SK스퀘어 | 제5기_연결감사보고서 | audit_report | ok | ok | matched_from_document_url_list |
| sk-local-8142e83257a4 | SK스퀘어 | 2022-01-14_SK스퀘어_온마인드투자 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-ba130d4b4492 | SK스퀘어 | 2022-01-14_SK스퀘어_코빗투자 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-7656d7022e9d | SK스퀘어 | 2022-02-10_재무상태표_2021-11 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-f9badec90442 | SK스퀘어 | 2022-02-25_Q4_21_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-94e57afd954a | SK스퀘어 | 2022-03-17_2021_ProForma_연결재무제표 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-baeb1cfdb763 | SK스퀘어 | 2022-05-16_Q1_22_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-9c1642147f22 | SK스퀘어 | 2022-08-16_Q2_22_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-40f18b8dddaa | SK스퀘어 | 2022-11-14_Q3_22_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-75f814a0b26e | SK스퀘어 | 2023-02-23_Q4_22_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-0b16259302b2 | SK스퀘어 | 2023-03-02_Portfolio_Update_SKshieldus | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-1e59627841a3 | SK스퀘어 | 2023-04-04_주주환원정책및실행_2023Q1 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-2b7dd8db56bd | SK스퀘어 | 2023-05-08_주주환원정책실행현황_2023a | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-174713915033 | SK스퀘어 | 2023-05-15_주주환원정책실행현황_2023b | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-ea7ec2a16283 | SK스퀘어 | 2023-05-15_Q1_23_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-637bd59ef96a | SK스퀘어 | 2023-08-09_주주환원정책및실행_2023 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-a52355a07600 | SK스퀘어 | 2023-08-14_Q2_23_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-7762899aa6c9 | SK스퀘어 | 2023-11-14_Q3_23_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-02e42c7d759b | SK스퀘어 | 2024-02-02_매출액손익구조변경_2024Q1 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-5e511052560e | SK스퀘어 | 2024-02-23_Q4_23_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-b6167bee0aa6 | SK스퀘어 | 2024-05-16_Q1_24_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-0611d28956f8 | SK스퀘어 | 2024-07-03_2024_임시주주총회소집결의 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-3744a1f5fd1f | SK스퀘어 | 2024-07-03_주주명부폐쇄기간설정 | earnings_presentation | ok | low-text | pending_url_reconciliation |
| sk-local-de99da97e107 | SK스퀘어 | 2024-08-13_Q2_24_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-0336bc378c4d | SK스퀘어 | 2024-10-30_기업가치제고계획예고 | value_up_plan | ok | low-text | matched_from_document_url_list |
| sk-local-79fcf4b3e71f | SK스퀘어 | 2024-11-14_Q3_24_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-11addc345ee6 | SK스퀘어 | 2024-11-21_SK스퀘어_기업가치제고계획_2024 | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-a0fb19e85bde | SK스퀘어 | 2025-02-11_매출액손익구조변경_2025Q1 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-5d5cab95ad4c | SK스퀘어 | 2025-02-25_Q4_24_Portfolio_Update | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-75840d0caff9 | SK스퀘어 | 2025-05-15_Q1_25_Portfolio_Update | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-6d2242bd3833 | SK스퀘어 | 2025-08-14_Q2_25_Portfolio_Update | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-8ff474342acc | SK스퀘어 | 2025-11-13_Q3_25_Portfolio_Update | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-a8520c7b2b32 | SK스퀘어 | 2025-11-24_SK스퀘어_기업가치제고계획_2025 | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-f9205e989770 | SK스퀘어 | 2026-02-10_매출액손익구조변경_2026Q1 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-19faec03a771 | SK스퀘어 | 2026-02-24_Q4_25_Portfolio_Update | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-0d61cfb87252 | SK스퀘어 | 2026-03-25_주주환원정책및실행_2026 | earnings_presentation | ok | ok | pending_url_reconciliation |
| sk-local-b58a3aa6c469 | SK스퀘어 | 2026-04-30_현금현물배당결정 | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-917978a6ad90 | SK스퀘어 | 제2기_1분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-e7cb2150f937 | SK스퀘어 | 제2기_1분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-5da93ca9b296 | SK스퀘어 | 제2기_2분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-6559f5819cba | SK스퀘어 | 제2기_2분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-84dd3adb7e60 | SK스퀘어 | 제2기_3분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-b34efe47fd81 | SK스퀘어 | 제2기_3분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-7981d7613329 | SK스퀘어 | 제3기_1분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-86b3997c5284 | SK스퀘어 | 제3기_1분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-812e84fafa6b | SK스퀘어 | 제3기_2분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-d5fdd91d1ad9 | SK스퀘어 | 제3기_2분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-c5c28c742c21 | SK스퀘어 | 제3기_3분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-dafd05981f6a | SK스퀘어 | 제3기_3분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-f05035819338 | SK스퀘어 | 제4기_1분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-6dfbee838db9 | SK스퀘어 | 제4기_1분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-ec58227593ac | SK스퀘어 | 제4기_2분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-4642ad39a9f6 | SK스퀘어 | 제4기_2분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-f80c81865878 | SK스퀘어 | 제4기_3분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-d56b7ec1585d | SK스퀘어 | 제4기_3분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-0db749662ee7 | SK스퀘어 | 제5기_1분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-ae4682f3c14a | SK스퀘어 | 제5기_1분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-d8e5e3e5ffe8 | SK스퀘어 | 제5기_2분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-bf16d4b65eaa | SK스퀘어 | 제5기_2분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-9aa1aaec9c73 | SK스퀘어 | 제5기_3분기_검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-0e1312ff2f64 | SK스퀘어 | 제5기_3분기_연결검토보고서 | review_report | ok | ok | matched_from_document_url_list |
| sk-local-ad1fb8cb0bed | SK텔레콤 | 2025_1Q_InvestorBriefing_Kor | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-ad1fb8cb0bed-dup1 | SK텔레콤 | 2025_1Q_InvestorBriefing | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-c92112564e0b | SK텔레콤 | 2025_1Q_PressRelease_Kor | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-c92112564e0b-dup1 | SK텔레콤 | 2025_1Q_PressRelease | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-36fb1d424053 | SK텔레콤 | 2025_2Q_InvestorBriefing_Kor | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-36fb1d424053-dup1 | SK텔레콤 | 2025_2Q_InvestorBriefing | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-c5f005860399 | SK텔레콤 | 2025_2Q_PressRelease_Kor | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-c5f005860399-dup1 | SK텔레콤 | 2025_2Q_PressRelease | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-9503531aaad4 | SK텔레콤 | 2025_3Q_InvestorBriefing_Kor | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-9503531aaad4-dup1 | SK텔레콤 | 2025_3Q_InvestorBriefing | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-8ee6512ac56f | SK텔레콤 | 2025_3Q_PressRelease_Kor | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-8ee6512ac56f-dup1 | SK텔레콤 | 2025_3Q_PressRelease | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-35944a85e5b3 | SK텔레콤 | 2025_4Q_InvestorBriefing | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-77570239f18d | SK텔레콤 | 2025_4Q_PressRelease_Kor | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-77570239f18d-dup1 | SK텔레콤 | 2025_4Q_PressRelease | earnings_press_release | ok | ok | matched_from_document_url_list |
| sk-local-64403e3c35ed | SK텔레콤 | 2024_1Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-539a094b7445 | SK텔레콤 | 2024_2Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-fabb684ff404 | SK텔레콤 | 2024_3Q_InvestorBriefing_Presentation | earnings_presentation | ok | ok | matched_from_document_url_list |
| sk-local-0a37c488966d | SK텔레콤 | 2024_4Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-a8d69b2a2d55 | SK텔레콤 | 2024_SKT_Corporate_Value-up_Plan | value_up_plan | ok | ok | matched_from_document_url_list |
| sk-local-4413decdca69 | SK텔레콤 | 2025_1Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-36fb1d424053-dup2 | SK텔레콤 | 2025_2Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-9503531aaad4-dup2 | SK텔레콤 | 2025_3Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-35944a85e5b3-dup1 | SK텔레콤 | 2025_4Q_InvestorBriefing_Presentation | earnings_presentation | ok | low-text | matched_from_document_url_list |
| sk-local-fde8b564511f | SK텔레콤 | 2025_AGM_CEO_Speech | earnings_presentation | ok | low-text | matched_from_document_url_list |
