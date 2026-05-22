# Review-Approved Runtime Claims

Generated: 2026-05-07T07:45:02.405Z

## Purpose

This document records the runtime promotion of user-approved claim-review rows. The promotion preserves existing financial and narrative seeds and adds a separate `source-backed-review-approved-claim` layer.

## Summary

- Promoted records: 25
- Groups: samsung 5, sk 5, hyundai-motor 5, lg 5, hanwha 5

## Promotion Boundary

- Existing source-backed claims are preserved.
- Prior review-approved runtime claims are replaced on rerun for idempotence.
- Customer UI may use the promoted claim text and source links, but not approval artifacts or reviewer notes.

## Promoted Rows

| Group | IDs | Count | Runtime manifest |
| --- | --- | ---: | --- |
| samsung | samsung-sbc-032 → samsung-sbc-036 | 5 | `raw/manifests/samsung.source-backed-claims.json` |
| sk | sk-sbc-023 → sk-sbc-027 | 5 | `raw/manifests/sk.source-backed-claims.json` |
| hyundai-motor | hyundai-sbc-011 → hyundai-sbc-015 | 5 | `raw/manifests/hyundai-motor.source-backed-claims.json` |
| lg | lg-sbc-011 → lg-sbc-015 | 5 | `raw/manifests/lg.source-backed-claims.json` |
| hanwha | hanwha-sbc-016 → hanwha-sbc-020 | 5 | `raw/manifests/hanwha.source-backed-claims.json` |

## Approved Claim List

| ID | Group | Company | Claim | Evidence locators |
| --- | --- | --- | --- | --- |
| `samsung-sbc-032` | samsung | 삼성전자<br><code>samsung-electronics</code> | 삼성전자는 2026년 1분기 연결 기준 매출액 133.9조원, 영업이익 57.2조원, 영업이익률 42.8%를 제시했다. | raw/extracted/samsung/official/samsung-local-629eb49c47b4-삼성전자_2026_1Q_실적발표.md:66 |
| `samsung-sbc-033` | samsung | 삼성SDI<br><code>samsung-sdi</code> | 삼성SDI는 2026년 1분기 매출 35,764억원, 영업손실 1,556억원, 당기순이익 561억원을 제시했고, 전년 동기 대비 매출은 12.6% 증가했다. | raw/extracted/samsung/official/samsung-local-3fbe76fb3e6d-삼성SDI_2026_1Q_실적발표.md:30 |
| `samsung-sbc-034` | samsung | 삼성물산<br><code>samsung-ct</code> | 삼성물산은 2025년 1~3분기 연결 누적 매출액 29.9조원, 영업이익 2.47조원, 분기순이익 2.35조원을 공시했다. | raw/extracted/samsung/official/samsung-local-d59eae497f33-삼성물산_2025_3Q_검토보고서_별도.md:50 |
| `samsung-sbc-035` | samsung | 삼성바이오로직스<br><code>samsung-biologics</code> | 삼성바이오로직스는 2026년 1분기 매출 12,571억원, 영업이익 5,808억원을 제시했고, 누적 CMO 수주 금액 214억 달러와 CMO 제품 112건, CDO 제품 169건을 함께 밝혔다. | raw/extracted/samsung/official/samsung-local-0c3e655da338-삼성바이오로직스_2026_1Q_실적발표.md:30<br>raw/extracted/samsung/official/samsung-local-0c3e655da338-삼성바이오로직스_2026_1Q_실적발표.md:42 |
| `samsung-sbc-036` | samsung | 삼성전기<br><code>samsung-electro-mechanics</code> | 삼성전기는 AI 서버 및 EV 등 응용처 수요 증가에 힘입어 2025년 매출액 11조 3,145억원, 영업이익 9,133억원을 기록했고, 전년 대비 각각 10%, 24% 증가했다고 설명했다. | raw/extracted/samsung/official/samsung-local-d9c2c0fbf645-2025_사업보고서.md:1034 |
| `sk-sbc-023` | sk | SK하이닉스<br><code>sk-hynix</code> | SK하이닉스는 2025년 3분기 연결 기준 매출 24.45조원, 영업이익 11.38조원, 분기순이익 12.60조원을 공시했고, 9개월 누적 매출은 64.32조원이었다. | raw/extracted/sk/official/sk-local-d92b4fd12117-2025_3Q_Review_Report.md:48 |
| `sk-sbc-024` | sk | SK이노베이션<br><code>sk-innovation</code> | SK이노베이션은 2025년 매출 80.30조원, 영업이익 4,481억원, EBITDA 3.69조원을 제시했고, 순차입금은 2024년 말 28.53조원에서 2025년 말 22.51조원으로 감소했다고 밝혔다. | raw/extracted/sk/official/sk-local-e4f0fa5ef4ed-2025_4Q_Earnings_Release.md:56<br>raw/extracted/sk/official/sk-local-e4f0fa5ef4ed-2025_4Q_Earnings_Release.md:60 |
| `sk-sbc-025` | sk | SK<br><code>sk-inc</code> | ㈜SK는 FY25 주요 비상장사·자체사업 합산 매출이 전년 대비 20.7% 증가했고, FY25 ROE는 6.4%로 전년 대비 12%p 개선됐으며, 별도 기준 순차입금은 8.6조원으로 전년 대비 18% 감소했다고 제시했다. | raw/extracted/sk/official/sk-local-5b7e15dc9476-2026-03-182025_4Q_SK주식회사_Earnings_Briefing.md:32 |
| `sk-sbc-026` | sk | SK텔레콤<br><code>sk-telecom</code> | SK텔레콤은 2025년 연결 매출 17조 992억원, 영업이익 1조 732억원, 순이익 3,751억원을 발표했고, AI 데이터센터 관련 매출은 5,199억원으로 전년 대비 34.9% 성장했다고 밝혔다. | raw/extracted/sk/official/sk-local-77570239f18d-2025_4Q_PressRelease_Kor.md:24 |
| `sk-sbc-027` | sk | SK스퀘어<br><code>sk-square</code> | SK스퀘어는 2025년 3분기 기준 NAV 할인율 52.9%, ROE 33.7%, PBR 1.1배를 제시하고, 2028년까지 NAV 할인율 30% 이하를 목표로 제시했다. | raw/extracted/sk/official/sk-local-a8520c7b2b32-2025-11-24_SK스퀘어_기업가치제고계획_2025.md:40<br>raw/extracted/sk/official/sk-local-a8520c7b2b32-2025-11-24_SK스퀘어_기업가치제고계획_2025.md:64 |
| `hyundai-sbc-011` | hyundai-motor | 현대자동차<br><code>hyundai-motor</code> | 현대자동차는 2025년 연간 매출 186.254조원, 영업이익 11.468조원, 당기순이익 10.365조원을 제시했고, 영업이익률은 6.2%였다. | raw/extracted/hyundai-motor/official/hyundai-local-8a594d025684-2025_Q4_실적발표자료.md:78 |
| `hyundai-sbc-012` | hyundai-motor | 기아<br><code>kia</code> | 기아는 2026년 1분기 매출 29.502조원, 영업이익 2.205조원, 당기순이익 1.830조원, 영업이익률 7.5%를 제시했다. | raw/extracted/hyundai-motor/official/hyundai-local-3e0392d5ac42-2026_Q1_경영실적.md:50 |
| `hyundai-sbc-013` | hyundai-motor | 현대모비스<br><code>hyundai-mobis</code> | 현대모비스는 2026년 1분기 매출액 15조 5,605억원, 영업이익 8,026억원을 제시했고, 모듈·핵심부품 매출은 전년 동기 대비 4.9%, A/S 사업 매출은 7.4% 증가했다고 설명했다. | raw/extracted/hyundai-motor/official/hyundai-local-14aca26a0371-2026_Q1_경영실적.md:38 |
| `hyundai-sbc-014` | hyundai-motor | 현대글로비스<br><code>hyundai-glovis</code> | 현대글로비스는 2026년 1분기 매출 7.813조원, 영업이익 5,215억원, 영업이익률 6.7%, 순이익 3,410억원을 제시했다. | raw/extracted/hyundai-motor/official/hyundai-local-debc793368dd-2026_Q1_Business_Result.md:34 |
| `hyundai-sbc-015` | hyundai-motor | 현대로템<br><code>hyundai-rotem</code> | 현대로템은 2025년 사업보고서 기준 전체 매출액 58,390억원, 디펜스솔루션 32,153억원, 레일솔루션 20,896억원, 에코플랜트 5,341억원을 제시했고, 수주잔고는 297,735억원이었다. | raw/extracted/hyundai-motor/official/hyundai-local-c2f206365990-2025_사업보고서.md:90<br>raw/extracted/hyundai-motor/official/hyundai-local-c2f206365990-2025_사업보고서.md:94 |
| `lg-sbc-011` | lg | LG전자<br><code>lg-electronics</code> | LG전자는 2026년 1분기 연결 기준 매출 23.7조원, 영업이익 1조 6,737억원을 기록했고, HS와 VS 사업본부가 사상 최대 분기 매출을 달성했다고 설명했다. | raw/extracted/lg/official/lg-local-a1e7cd3cc841-2026_Q1_실적발표자료_KR.md:38 |
| `lg-sbc-012` | lg | LG화학<br><code>lg-chem</code> | LG화학은 2026년 1분기 매출 12.247조원, 영업손실 500억원, EBITDA 1.442조원을 제시했고, 당기순손실은 7,820억원이었다. | raw/extracted/lg/official/lg-local-310be2f77733-2026_Q1_실적발표_KR.md:38 |
| `lg-sbc-013` | lg | LG에너지솔루션<br><code>lg-energy-solution</code> | LG에너지솔루션은 2026년 1분기 매출 6.555조원, 영업손실 2,080억원을 제시했고, 북미 ESS 생산 확대에도 EV 파우치 물량 감소와 ESS 초기 가동 비용 부담을 적자 요인으로 설명했다. | raw/extracted/lg/official/lg-local-429a8992830d-2026_Q1_실적발표자료_KR.md:42 |
| `lg-sbc-014` | lg | LG이노텍<br><code>lg-innotek</code> | LG이노텍은 2025년 4분기 매출 7.610조원, 영업이익 3,247억원, 영업이익률 4.3%, 순이익 1,359억원을 제시했고, 매출과 영업이익은 전년 동기 대비 각각 14.8%, 31.0% 증가했다. | raw/extracted/lg/official/lg-local-41b3c43eb3a3-2025_4Q-Earnings-Release.md:34 |
| `lg-sbc-015` | lg | LG유플러스<br><code>lg-uplus</code> | LG유플러스는 2025년 연결 서비스수익 12조 2,633억원, 영업이익 8,921억원을 제시했고, AIDC 매출은 전년 대비 18.4%, 기업인프라 수익은 6.0% 성장했다고 밝혔다. | raw/extracted/lg/official/lg-local-a75cbda10689-2025_Q4_실적보고서.md:38 |
| `hanwha-sbc-016` | hanwha | 한화<br><code>hanwha</code> | ㈜한화는 2025년 연결 기준 매출 747,474억원, 영업이익 41,560억원, 당기순이익 19,650억원을 제시했고, 영업이익은 전년 대비 72% 증가했다. | raw/extracted/hanwha/official/hanwha-local-70253ef29b11-주-한화_4Q25-Earnings-연결.md:44 |
| `hanwha-sbc-017` | hanwha | 한화에어로스페이스<br><code>hanwha-aerospace</code> | 한화에어로스페이스는 2026년 1분기 매출 57,510억원, 영업이익 6,389억원, 당기순이익 5,259억원을 제시했고, 영업이익은 전년 동기 대비 21% 증가했다. | raw/extracted/hanwha/official/hanwha-local-6340a4d368a9-2026_1Q_IR_Presentation_KO.md:44 |
| `hanwha-sbc-018` | hanwha | 한화솔루션<br><code>hanwha-solutions</code> | 한화솔루션은 2026년 1분기 매출 38,820억원, 영업이익 926억원, 영업이익률 2.4%를 제시했고, 신재생에너지 모듈 판매량과 ASP 증가, 케미칼 원가 절감 등을 흑자전환 요인으로 설명했다. | raw/extracted/hanwha/official/hanwha-local-4ea5a5c64929-2026_1Q_실적발표.md:48 |
| `hanwha-sbc-019` | hanwha | 한화시스템<br><code>hanwha-systems</code> | 한화시스템은 2025년 3분기 연결 매출액 8,077억원, 영업이익 225억원, 당기순이익 1,518억원을 제시했고, 방산 부문 매출은 전년 동기 대비 3% 증가했다. | raw/extracted/hanwha/official/hanwha-local-becc0f32f9b8-2025_3Q_실적발표.md:36 |
| `hanwha-sbc-020` | hanwha | 한화오션<br><code>hanwha-ocean</code> | 한화오션은 2026년 1분기 연결 기준 매출액 3조 2,099억원, 영업이익 4,411억원, 당기순이익 5,000억원을 기록했고, 영업이익은 전분기 대비 78% 증가했다고 밝혔다. | raw/extracted/hanwha/official/hanwha-local-cb1391385895-2026_1Q_실적발표_대본.md:20 |

## Source Artifacts

- `raw/manifests/claim-review-approval-record.json`
- `raw/manifests/review-approved-runtime-promotion.json`

