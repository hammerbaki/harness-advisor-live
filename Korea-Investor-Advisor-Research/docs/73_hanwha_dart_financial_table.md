# 한화 DART Financial Table

Generated: 2026-05-06T04:37:15.964Z

Source: OpenDART `fnlttSinglAcnt.json` with `fnlttSinglAcntAll.json` fallback, annual report code `11011`.

Values are converted to 억원 from KRW and rounded to the nearest integer.
Revenue is filled only when OpenDART provides an explicit `매출액`, `영업수익`, or `수익(매출액)` account. The paper-stage artifact does not define financial-company revenue from finance-specific accounts such as `이자수익`, `수수료수익`, or `보험수익`.
Net income, total assets, total liabilities, total equity, and debt-to-equity ratio are recorded only when OpenDART provides explicit account labels. These fields are source-backed display fields, not analyst-defined replacements.

| Company | 2022 operating income | 2022 revenue | 2023 operating income | 2023 revenue | 2024 operating income | 2024 revenue |
| --- | --- | --- | --- | --- | --- | --- |
| ㈜한화 | 25161 | 622784 | 24119 | 531348 | 24161 | 556468 |
| 한화에어로스페이스 | 3772 | 65396 | 6911 | 93590 | 17319 | 112401 |
| 한화솔루션 | 9662 | 136539 | 6045 | 132887 | -3002 | 123940 |
| 한화시스템 | 240 | 21880 | 929 | 24531 | 2193 | 28037 |
| 한화생명 |  |  | 10570 |  | 10970 |  |
| 한화투자증권 |  |  | 315 | 19690 | 40 | 24958 |
| 한화오션 | -16136 | 48602 | -1965 | 74083 | 2379 | 107760 |
| 한화갤러리아 |  |  | 98 | 4345 | 31 | 5383 |

## Account Selection Detail

| Company | Year | Status | Revenue account | Operating income account | Net income account | Liabilities account | Equity account | Basis | Fallback used |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ㈜한화 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| ㈜한화 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 |  | CFS | no |
| ㈜한화 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화에어로스페이스 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화에어로스페이스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화에어로스페이스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화솔루션 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화솔루션 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화솔루션 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화시스템 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화시스템 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화시스템 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화생명 | 2022 | error |  |  |  |  |  |  | no |
| 한화생명 | 2023 | partial |  | 영업이익(손실) | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | yes |
| 한화생명 | 2024 | partial |  | 영업이익(손실) | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | yes |
| 한화투자증권 | 2022 | error |  |  |  |  |  |  | no |
| 한화투자증권 | 2023 | ok | 매출액 | 영업이익(손실) | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화투자증권 | 2024 | ok | 매출액 | 영업이익(손실) | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화오션 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화오션 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화오션 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화갤러리아 | 2022 | error |  |  |  |  |  |  | no |
| 한화갤러리아 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 한화갤러리아 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |

## Extraction Status

- OK records: 19
- Partial records: 2
- Error records: 3
- Missing revenue: 5
- Missing operating income: 3
- Missing net income: 3
- Missing total assets: 3
- Missing total liabilities: 3
- Missing total equity: 4

## Non-OK Records

| Company | Year | Status | DART status | Message |
| --- | --- | --- | --- | --- |
| 한화생명 | 2022 | error | 013 | 조회된 데이타가 없습니다. |
| 한화생명 | 2023 | partial | 000 | 정상 |
| 한화생명 | 2024 | partial | 000 | 정상 |
| 한화투자증권 | 2022 | error | 013 | 조회된 데이타가 없습니다. |
| 한화갤러리아 | 2022 | error | 013 | 조회된 데이타가 없습니다. |

## Use Boundary

This table is suitable as an official API-backed financial source manifest.
Runtime answers must preserve company, year, account label, reporting basis, and source state.
