# SK DART Financial Table

Generated: 2026-05-06T04:36:01.705Z

Source: OpenDART `fnlttSinglAcnt.json` with `fnlttSinglAcntAll.json` fallback, annual report code `11011`.

Values are converted to 억원 from KRW and rounded to the nearest integer.
Revenue is filled only when OpenDART provides an explicit `매출액`, `영업수익`, or `수익(매출액)` account. The paper-stage artifact does not define financial-company revenue from finance-specific accounts such as `이자수익`, `수수료수익`, or `보험수익`.
Net income, total assets, total liabilities, total equity, and debt-to-equity ratio are recorded only when OpenDART provides explicit account labels. These fields are source-backed display fields, not analyst-defined replacements.

| Company | 2022 operating income | 2022 revenue | 2023 operating income | 2023 revenue | 2024 operating income | 2024 revenue |
| --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스 | 68094 | 446216 | -77303 | 327657 | 234673 | 661930 |
| SK이노베이션 | 39173 | 780569 | 19039 | 772885 | 3155 | 747170 |
| SK | 80047 | 1345516 | 50564 | 1312379 | 23553 | 1246904 |
| SK텔레콤 | 16121 | 173050 | 17532 | 176085 | 18234 | 179406 |
| SK스퀘어 |  |  | -23397 | 22765 | 39126 | 19066 |

## Account Selection Detail

| Company | Year | Status | Revenue account | Operating income account | Net income account | Liabilities account | Equity account | Basis | Fallback used |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK하이닉스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK하이닉스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK이노베이션 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK이노베이션 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK이노베이션 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK텔레콤 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK텔레콤 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK텔레콤 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK스퀘어 | 2022 | error |  |  |  |  |  |  | no |
| SK스퀘어 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| SK스퀘어 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |

## Extraction Status

- OK records: 14
- Partial records: 0
- Error records: 1
- Missing revenue: 1
- Missing operating income: 1
- Missing net income: 1
- Missing total assets: 1
- Missing total liabilities: 1
- Missing total equity: 1

## Non-OK Records

| Company | Year | Status | DART status | Message |
| --- | --- | --- | --- | --- |
| SK스퀘어 | 2022 | error | 013 | 조회된 데이타가 없습니다. |

## Use Boundary

This table is suitable as an official API-backed financial source manifest.
Runtime answers must preserve company, year, account label, reporting basis, and source state.
