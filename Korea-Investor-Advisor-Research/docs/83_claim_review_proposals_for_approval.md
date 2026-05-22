# Claim Review Proposals for Approval

Generated: 2026-05-07T07:08:56.048Z

## Purpose

This document is Codex's first-pass reviewer decision for the 25-company priority claim packet. It is an approval request, not runtime knowledge. Rows marked `approve_for_seed_review` can be promoted only after the user approves them and the group-specific promotion validators pass.

## Summary

- Total proposals: 25
- Approve: 25
- Hold: 0
- Missing evidence locators: 0

## Approval Boundary

- This artifact does not modify `raw/manifests/*.source-backed-claims.json`.
- Approval means the row may be converted into a group-specific narrative seed config in the next step.
- Held rows stay in the source ledger but must not be exposed in customer answers.
- Forward-looking rows must keep the forward-looking/staleness label after promotion.

## samsung

| Company | Decision | Proposed claim | Evidence locator | Reviewer note |
| --- | --- | --- | --- | --- |
| 삼성전자<br><code>samsung-electronics</code> | <code>approve_for_seed_review</code><br>high | 삼성전자는 2026년 1분기 연결 기준 매출액 133.9조원, 영업이익 57.2조원, 영업이익률 42.8%를 제시했다. | raw/extracted/samsung/official/samsung-local-629eb49c47b4-삼성전자_2026_1Q_실적발표.md:66 (Page 12) | 실적발표 자료의 핵심 연결 손익 수치가 한 줄에 제시되어 있고, 답변 카드와 재무 브리프에 반복 사용하기 좋다. |
| 삼성SDI<br><code>samsung-sdi</code> | <code>approve_for_seed_review</code><br>high | 삼성SDI는 2026년 1분기 매출 35,764억원, 영업손실 1,556억원, 당기순이익 561억원을 제시했고, 전년 동기 대비 매출은 12.6% 증가했다. | raw/extracted/samsung/official/samsung-local-3fbe76fb3e6d-삼성SDI_2026_1Q_실적발표.md:30 (Page 3) | 적자 축소와 흑자전환 항목이 명확해 배터리/ESS 질문의 기본 수치 claim으로 적합하다. |
| 삼성물산<br><code>samsung-ct</code> | <code>approve_for_seed_review</code><br>medium | 삼성물산은 2025년 1~3분기 연결 누적 매출액 29.9조원, 영업이익 2.47조원, 분기순이익 2.35조원을 공시했다. | raw/extracted/samsung/official/samsung-local-d59eae497f33-삼성물산_2025_3Q_검토보고서_별도.md:50 (Page 8) | 검토보고서 기반이라 보수적으로 공시 label을 붙이면 상사/건설/바이오 보유구조 질문에 쓸 수 있다. |
| 삼성바이오로직스<br><code>samsung-biologics</code> | <code>approve_for_seed_review</code><br>high | 삼성바이오로직스는 2026년 1분기 매출 12,571억원, 영업이익 5,808억원을 제시했고, 누적 CMO 수주 금액 214억 달러와 CMO 제품 112건, CDO 제품 169건을 함께 밝혔다. | raw/extracted/samsung/official/samsung-local-0c3e655da338-삼성바이오로직스_2026_1Q_실적발표.md:30 (Page 3)<br>raw/extracted/samsung/official/samsung-local-0c3e655da338-삼성바이오로직스_2026_1Q_실적발표.md:42 (Page 6) | 단순 매출보다 CDMO 수주 지표가 같이 있어 바이오 계열사 설명력과 투자자용 맥락이 높다. |
| 삼성전기<br><code>samsung-electro-mechanics</code> | <code>approve_for_seed_review</code><br>high | 삼성전기는 AI 서버 및 EV 등 응용처 수요 증가에 힘입어 2025년 매출액 11조 3,145억원, 영업이익 9,133억원을 기록했고, 전년 대비 각각 10%, 24% 증가했다고 설명했다. | raw/extracted/samsung/official/samsung-local-d9c2c0fbf645-2025_사업보고서.md:1034 (Page 254) | 사업보고서 MD&A 문장이라 AI 서버/전장 수요와 실적 개선을 한 문장에 근거화할 수 있다. |

## sk

| Company | Decision | Proposed claim | Evidence locator | Reviewer note |
| --- | --- | --- | --- | --- |
| SK하이닉스<br><code>sk-hynix</code> | <code>approve_for_seed_review</code><br>high | SK하이닉스는 2025년 3분기 연결 기준 매출 24.45조원, 영업이익 11.38조원, 분기순이익 12.60조원을 공시했고, 9개월 누적 매출은 64.32조원이었다. | raw/extracted/sk/official/sk-local-d92b4fd12117-2025_3Q_Review_Report.md:48 (Page 7) | 감사인 검토보고서의 손익계산서 수치라 HBM/메모리 회복 질문의 안전한 기준점으로 쓸 수 있다. |
| SK이노베이션<br><code>sk-innovation</code> | <code>approve_for_seed_review</code><br>high | SK이노베이션은 2025년 매출 80.30조원, 영업이익 4,481억원, EBITDA 3.69조원을 제시했고, 순차입금은 2024년 말 28.53조원에서 2025년 말 22.51조원으로 감소했다고 밝혔다. | raw/extracted/sk/official/sk-local-e4f0fa5ef4ed-2025_4Q_Earnings_Release.md:56 (Page 9)<br>raw/extracted/sk/official/sk-local-e4f0fa5ef4ed-2025_4Q_Earnings_Release.md:60 (Page 10) | 포트폴리오 리밸런싱 논리를 실적과 순차입금 개선으로 분리해 설명할 수 있다. |
| SK<br><code>sk-inc</code> | <code>approve_for_seed_review</code><br>high | ㈜SK는 FY25 주요 비상장사·자체사업 합산 매출이 전년 대비 20.7% 증가했고, FY25 ROE는 6.4%로 전년 대비 12%p 개선됐으며, 별도 기준 순차입금은 8.6조원으로 전년 대비 18% 감소했다고 제시했다. | raw/extracted/sk/official/sk-local-5b7e15dc9476-2026-03-182025_4Q_SK주식회사_Earnings_Briefing.md:32 (Page 3) | 지주회사 질문에 필요한 자체사업, ROE, 순차입금 축을 함께 제공하되 투자판단 표현은 피한다. |
| SK텔레콤<br><code>sk-telecom</code> | <code>approve_for_seed_review</code><br>high | SK텔레콤은 2025년 연결 매출 17조 992억원, 영업이익 1조 732억원, 순이익 3,751억원을 발표했고, AI 데이터센터 관련 매출은 5,199억원으로 전년 대비 34.9% 성장했다고 밝혔다. | raw/extracted/sk/official/sk-local-77570239f18d-2025_4Q_PressRelease_Kor.md:24 (Page 1) | 통신 본업과 AI 데이터센터 성장 근거를 함께 묶되, 사업 성과 claim으로 제한하면 안전하다. |
| SK스퀘어<br><code>sk-square</code> | <code>approve_for_seed_review</code><br>high | SK스퀘어는 2025년 3분기 기준 NAV 할인율 52.9%, ROE 33.7%, PBR 1.1배를 제시하고, 2028년까지 NAV 할인율 30% 이하를 목표로 제시했다. | raw/extracted/sk/official/sk-local-a8520c7b2b32-2025-11-24_SK스퀘어_기업가치제고계획_2025.md:40 (Page 5)<br>raw/extracted/sk/official/sk-local-a8520c7b2b32-2025-11-24_SK스퀘어_기업가치제고계획_2025.md:64 (Page 11) | 이미 일부 claim이 승격된 회사지만, 가치제고계획의 핵심 축을 명시한 source-backed 문장으로 유지 가치가 있다. |

## hyundai-motor

| Company | Decision | Proposed claim | Evidence locator | Reviewer note |
| --- | --- | --- | --- | --- |
| 현대자동차<br><code>hyundai-motor</code> | <code>approve_for_seed_review</code><br>high | 현대자동차는 2025년 연간 매출 186.254조원, 영업이익 11.468조원, 당기순이익 10.365조원을 제시했고, 영업이익률은 6.2%였다. | raw/extracted/hyundai-motor/official/hyundai-local-8a594d025684-2025_Q4_실적발표자료.md:78 (Page 14) | 완성차 그룹 대표사의 연간 수익성 기준점이며, 관세/믹스 영향 질문의 출발점으로 쓰기 좋다. |
| 기아<br><code>kia</code> | <code>approve_for_seed_review</code><br>high | 기아는 2026년 1분기 매출 29.502조원, 영업이익 2.205조원, 당기순이익 1.830조원, 영업이익률 7.5%를 제시했다. | raw/extracted/hyundai-motor/official/hyundai-local-3e0392d5ac42-2026_Q1_경영실적.md:50 (Page 7) | 현대차와 같은 완성차 축이지만 수익성 수준이 달라 비교 답변에 쓰기 좋다. |
| 현대모비스<br><code>hyundai-mobis</code> | <code>approve_for_seed_review</code><br>high | 현대모비스는 2026년 1분기 매출액 15조 5,605억원, 영업이익 8,026억원을 제시했고, 모듈·핵심부품 매출은 전년 동기 대비 4.9%, A/S 사업 매출은 7.4% 증가했다고 설명했다. | raw/extracted/hyundai-motor/official/hyundai-local-14aca26a0371-2026_Q1_경영실적.md:38 (Page 4) | 부품/AS의 다른 수익성 구조가 드러나 완성차 그룹 내 사업별 비교에 유용하다. |
| 현대글로비스<br><code>hyundai-glovis</code> | <code>approve_for_seed_review</code><br>high | 현대글로비스는 2026년 1분기 매출 7.813조원, 영업이익 5,215억원, 영업이익률 6.7%, 순이익 3,410억원을 제시했다. | raw/extracted/hyundai-motor/official/hyundai-local-debc793368dd-2026_Q1_Business_Result.md:34 (Page 3) | 물류/해운/유통 축의 수익성 기준점으로 그룹 포트폴리오 답변에 필요하다. |
| 현대로템<br><code>hyundai-rotem</code> | <code>approve_for_seed_review</code><br>high | 현대로템은 2025년 사업보고서 기준 전체 매출액 58,390억원, 디펜스솔루션 32,153억원, 레일솔루션 20,896억원, 에코플랜트 5,341억원을 제시했고, 수주잔고는 297,735억원이었다. | raw/extracted/hyundai-motor/official/hyundai-local-c2f206365990-2025_사업보고서.md:90 (Page 17)<br>raw/extracted/hyundai-motor/official/hyundai-local-c2f206365990-2025_사업보고서.md:94 (Page 18) | 신규 DART 사업보고서 추출물에서 항목명과 숫자 매핑이 확인되어 보류 사유가 해소됐다. 4Q IR 표는 보조 근거로 유지하고, 고객 답변 claim은 사업보고서 문장을 우선한다. |

## lg

| Company | Decision | Proposed claim | Evidence locator | Reviewer note |
| --- | --- | --- | --- | --- |
| LG전자<br><code>lg-electronics</code> | <code>approve_for_seed_review</code><br>high | LG전자는 2026년 1분기 연결 기준 매출 23.7조원, 영업이익 1조 6,737억원을 기록했고, HS와 VS 사업본부가 사상 최대 분기 매출을 달성했다고 설명했다. | raw/extracted/lg/official/lg-local-a1e7cd3cc841-2026_Q1_실적발표자료_KR.md:38 (Page 4) | 가전, 전장, B2B 전환 질문에 쓰기 좋은 대표 실적/사업부 claim이다. |
| LG화학<br><code>lg-chem</code> | <code>approve_for_seed_review</code><br>high | LG화학은 2026년 1분기 매출 12.247조원, 영업손실 500억원, EBITDA 1.442조원을 제시했고, 당기순손실은 7,820억원이었다. | raw/extracted/lg/official/lg-local-310be2f77733-2026_Q1_실적발표_KR.md:38 (Page 4) | 화학/첨단소재/에너지솔루션 포함 구조에서 수익성 압박을 수치로 보여준다. |
| LG에너지솔루션<br><code>lg-energy-solution</code> | <code>approve_for_seed_review</code><br>high | LG에너지솔루션은 2026년 1분기 매출 6.555조원, 영업손실 2,080억원을 제시했고, 북미 ESS 생산 확대에도 EV 파우치 물량 감소와 ESS 초기 가동 비용 부담을 적자 요인으로 설명했다. | raw/extracted/lg/official/lg-local-429a8992830d-2026_Q1_실적발표자료_KR.md:42 (Page 5) | 배터리 업황 질문에서 단순 적자보다 ESS/EV mix 변수를 함께 제공한다. |
| LG이노텍<br><code>lg-innotek</code> | <code>approve_for_seed_review</code><br>high | LG이노텍은 2025년 4분기 매출 7.610조원, 영업이익 3,247억원, 영업이익률 4.3%, 순이익 1,359억원을 제시했고, 매출과 영업이익은 전년 동기 대비 각각 14.8%, 31.0% 증가했다. | raw/extracted/lg/official/lg-local-41b3c43eb3a3-2025_4Q-Earnings-Release.md:34 (Page 3) | 광학솔루션 중심의 계절성과 수익성 개선을 동시에 설명할 수 있다. |
| LG유플러스<br><code>lg-uplus</code> | <code>approve_for_seed_review</code><br>high | LG유플러스는 2025년 연결 서비스수익 12조 2,633억원, 영업이익 8,921억원을 제시했고, AIDC 매출은 전년 대비 18.4%, 기업인프라 수익은 6.0% 성장했다고 밝혔다. | raw/extracted/lg/official/lg-local-a75cbda10689-2025_Q4_실적보고서.md:38 (Page 4) | 통신 본업과 AIDC 성장축을 함께 제시해 LG 그룹의 AI 인프라 문맥을 보강한다. |

## hanwha

| Company | Decision | Proposed claim | Evidence locator | Reviewer note |
| --- | --- | --- | --- | --- |
| 한화<br><code>hanwha</code> | <code>approve_for_seed_review</code><br>high | ㈜한화는 2025년 연결 기준 매출 747,474억원, 영업이익 41,560억원, 당기순이익 19,650억원을 제시했고, 영업이익은 전년 대비 72% 증가했다. | raw/extracted/hanwha/official/hanwha-local-70253ef29b11-주-한화_4Q25-Earnings-연결.md:44 (Page 7) | 원본 PoC의 한화 기준축을 계열사 확장 구조에서도 유지할 수 있는 연결 실적 claim이다. |
| 한화에어로스페이스<br><code>hanwha-aerospace</code> | <code>approve_for_seed_review</code><br>high | 한화에어로스페이스는 2026년 1분기 매출 57,510억원, 영업이익 6,389억원, 당기순이익 5,259억원을 제시했고, 영업이익은 전년 동기 대비 21% 증가했다. | raw/extracted/hanwha/official/hanwha-local-6340a4d368a9-2026_1Q_IR_Presentation_KO.md:44 (Page 7) | 방산/우주항공 대표 계열사의 확정 분기 수치로 한화 reference slice 보강에 필요하다. |
| 한화솔루션<br><code>hanwha-solutions</code> | <code>approve_for_seed_review</code><br>high | 한화솔루션은 2026년 1분기 매출 38,820억원, 영업이익 926억원, 영업이익률 2.4%를 제시했고, 신재생에너지 모듈 판매량과 ASP 증가, 케미칼 원가 절감 등을 흑자전환 요인으로 설명했다. | raw/extracted/hanwha/official/hanwha-local-4ea5a5c64929-2026_1Q_실적발표.md:48 (Page 8) | 태양광/케미칼 전환축을 재무 수치와 사업 요인으로 분리해 답변할 수 있다. |
| 한화시스템<br><code>hanwha-systems</code> | <code>approve_for_seed_review</code><br>high | 한화시스템은 2025년 3분기 연결 매출액 8,077억원, 영업이익 225억원, 당기순이익 1,518억원을 제시했고, 방산 부문 매출은 전년 동기 대비 3% 증가했다. | raw/extracted/hanwha/official/hanwha-local-becc0f32f9b8-2025_3Q_실적발표.md:36 (Page 5) | 방산과 ICT를 분리한 계열사 claim으로 한화의 방산 포트폴리오 답변을 더 세밀하게 만든다. |
| 한화오션<br><code>hanwha-ocean</code> | <code>approve_for_seed_review</code><br>high | 한화오션은 2026년 1분기 연결 기준 매출액 3조 2,099억원, 영업이익 4,411억원, 당기순이익 5,000억원을 기록했고, 영업이익은 전분기 대비 78% 증가했다고 밝혔다. | raw/extracted/hanwha/official/hanwha-local-cb1391385895-2026_1Q_실적발표_대본.md:20 (Page 1) | 조선 수익성 개선을 수치로 근거화해 한화의 방산/조선 확장 narrative를 보완한다. |

## User Approval Checklist

- Approve all `approve_for_seed_review` rows as written.
- Or identify rows whose wording should be revised before promotion.
- No rows are currently on hold; promotion still requires explicit approval and group-specific validators.

## Machine Artifact

- `raw/manifests/claim-review-proposals.json`

