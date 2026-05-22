# Hanwha Source Selection Rationale

Audit date: 2026-05-01

## Purpose

This document records why each local Hanwha source is retained, restricted, or
held for review under the common source-selection policy. The same policy is
intended to apply to Samsung, SK, Hyundai Motor, LG, Hanwha, and future target
groups.

Policy reference: `configs/source-selection-policy.json`

Policy version: `2026-05-01`

## Common Selection Rules

| Rule | Name | Required for |
| --- | --- | --- |
| SRC-01 | official issuer provenance | primary-source-candidate |
| SRC-02 | regulatory filing provenance | financial-and-risk-claims |
| SRC-03 | audit baseline | audited-financial-baseline |
| SRC-04 | current periodic disclosure | periodic-disclosure-baseline |
| SRC-05 | current earnings and IR material | current-earnings-core-official-ir |
| SRC-06 | shareholder-value and capital actions | value-up-and-capital-action-claims |
| SRC-07 | governance baseline | governance-sensitive-claims |
| SRC-08 | third-party market view as secondary context | external-market-view-secondary-context |
| SRC-09 | rights and redistribution boundary | all-sources |
| SRC-10 | machine extraction readiness | wiki-promotion |
| SRC-11 | claim-level traceability | runtime-use |
| SRC-12 | company-scoped claim routing | multi-company-runtime-routing |

## Scope Decision

The local corpus is a scoped Hanwha reference slice, not a full official archive.
The official crawl found 86 official
downloads that are not present locally. Those missing files should be pulled
only when a claim, evaluation scenario, or paper method requires them.

## Totals

- local sources: 104
- official provenance matches: 45
- rationale categories: audited-financial-baseline=20, capital-structure-shareholder-action=1, current-earnings-core-official-ir=4, external-market-view-secondary-context=7, governance-baseline=9, manual-review-needed=49, periodic-disclosure-baseline=12, value-up-core-official-ir=2
- paper use levels: hold-until-reviewed=49, primary-source-candidate=47, primary-source-candidate-after-type-check=1, secondary-context-only=7

## Per-Source Rationale

| Source | Role | Rationale category | Rule IDs | Paper use | Keep decision | Official page |
| --- | --- | --- | --- | --- | --- | --- |
| [한화][정정]사업보고서(2022.03.24) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do?pageNum=2&search_param1=0&search_param2= |
| 22년도_[한화][정정]사업보고서(2025.12.18) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do?pageNum=2&search_param1=0&search_param2= |
| 1. (주)한화_1Q25 Earnings(연결)_검 | official_issuer | current-earnings-core-official-ir | SRC-01, SRC-05, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do?pageNum=2&search_param1=0&search_param2= |
| 1. (주)한화_2Q25 Earnings(연결)_검 | official_issuer | current-earnings-core-official-ir | SRC-01, SRC-05, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do?pageNum=2&search_param1=0&search_param2= |
| 1. (주)한화_3Q25 Earnings(연결)_검 | official_issuer | current-earnings-core-official-ir | SRC-01, SRC-05, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do?pageNum=2&search_param1=0&search_param2= |
| 1. (주)한화, 기업설명회_20260114 | official_issuer | value-up-core-official-ir | SRC-01, SRC-06, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do?pageNum=2&search_param1=0&search_param2= |
| (주)한화 감사위원회 규정_6차 개정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| (주)한화 공시 관리 규정 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/investinfo.jsp |
| (주)한화 기업지배구조헌장 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/corporate_structure.jsp |
| (주)한화 내부거래위원회 규정_6차 개정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| (주)한화 보상위원회 규정_제정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| (주)한화 사외이사후보추천위원회 규정_5차 개정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| (주)한화 이사회 규정_15차 개정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| (주)한화 ESG위원회 규정_제정본 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/directorate.jsp |
| 2021년 감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| 2021년 연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| [한화]감사보고서(2023.03.21) | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| [한화]연결감사보고서(2023.03.21) | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| 한화 분기보고서(2023.12.29) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화][정정]반기보고서(2024.09.30) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화][정정]분기보고서(2024.07.03) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화][정정]분기보고서(2024.12.31) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화]감사보고서(2024.03.19) | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| [한화]연결감사보고서(2024.03.19) | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| [한화][정정]반기보고서(2025.08.28) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화][정정]분기보고서(2025.05.30) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| [한화][정정]분기보고서(2025.11.28) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| 23년도_[한화][정정]사업보고서(2025.12.18) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| 24년도_[한화][정정]사업보고서(2025.12.18) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| ㈜한화 2026 정관 다운로드 | official_issuer | governance-baseline | SRC-01, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate-after-type-check | keep-after-type-verification | https://www.hanwhacorp.co.kr/hanwha/investment/association.jsp |
| (주)한화, 기업가치 제고계획_20260114 | official_issuer | value-up-core-official-ir | SRC-01, SRC-06, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| [한화][정정]사업보고서(2026.03.31) | official_issuer | periodic-disclosure-baseline | SRC-01, SRC-02, SRC-04, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/periodic_report.do |
| 한화그룹 IR 정보 지식체계 | unknown | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_3Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_3Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_4Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_4Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_1Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_1Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_2Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_2Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_3Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_3Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_4Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_4Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_기업가치제고계획_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_기업가치제고계획_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_미래비전설명자료_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_미래비전설명자료_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_주주배정유상증자설명회_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_주주배정유상증자설명회_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_IR_Presentation_EN | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_IR_Presentation_KO | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_2Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_3Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_연간4Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_2Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_3Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_연간4Q_실적발표_정정 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_실적발표_대본 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_실적발표_QA | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2023_4Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_2Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_3Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_4Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_2Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_3Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_4Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2026_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2022_사업보고서 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2023_사업보고서 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2024_사업보고서 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_사업보고서 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2021_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2021_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2022_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2022_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2023_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2023_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2024_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2024_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2025_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2025_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline |  |
| 2025_1Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_2Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_3Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| 2025_4Q_실적발표 | official_issuer | manual-review-needed | SRC-09, SRC-11 | hold-until-reviewed | review |  |
| (주)한화 제1우선주 매수설명서 | official_issuer | capital-structure-shareholder-action | SRC-01, SRC-06, SRC-07, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| (주)한화_4Q25 Earnings(연결) | official_issuer | current-earnings-core-official-ir | SRC-01, SRC-05, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-core-source | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| 대신증권-불확실성 해소와 밸류업의 궤도 진입 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| 삼성증권-이익 우상향 지속 전망. NAV 할인 축소는 지켜봐야 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| 키움증권-한화솔루션 유상증자 120% 초과 청약,그룹 성장을 위한 합리적 의사 결정 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| 한화투자증권-애널리스트 간담회 후기 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| NH투자증권_한화_저평가 매력 부각 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| NH투자증권-한화_애널리스트 간담회 후기 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| SK증권-한화솔루션 유상증자 참여 결정 | third_party_analyst | external-market-view-secondary-context | SRC-08, SRC-09, SRC-11 | secondary-context-only | keep-metadata-only | https://www.hanwhacorp.co.kr/hanwha/investment/performance_report.do |
| (주)한화 감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| (주)한화 연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| (주)한화_감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |
| (주)한화_연결감사보고서 | official_issuer | audited-financial-baseline | SRC-01, SRC-03, SRC-09, SRC-10, SRC-11 | primary-source-candidate | keep-reference-baseline | https://www.hanwhacorp.co.kr/hanwha/investment/audit_report.do |

## Paper Wording

Safe wording:

```text
The Hanwha reference slice applies a common source-selection policy to 31 local
source files, recording official provenance, source type, extraction status,
rights boundary, selection rule IDs, and paper/runtime use levels for each
source.
```

Unsafe wording:

```text
The Hanwha corpus is a complete official IR archive.
```

## Source References

- `raw/manifests/hanwha.local-sources.json`
- `raw/manifests/hanwha.source-provenance.json`
- `raw/manifests/hanwha.selection-rationale.json`
- `raw/manifests/hanwha.official-site-scan.json`
- `configs/source-selection-policy.json`
