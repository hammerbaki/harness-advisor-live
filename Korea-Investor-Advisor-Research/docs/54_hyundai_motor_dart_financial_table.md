# 현대자동차 DART Financial Table

Generated: 2026-05-06T04:36:29.432Z

Source: OpenDART `fnlttSinglAcnt.json` with `fnlttSinglAcntAll.json` fallback, annual report code `11011`.

Values are converted to 억원 from KRW and rounded to the nearest integer.
Revenue is filled only when OpenDART provides an explicit `매출액`, `영업수익`, or `수익(매출액)` account. The paper-stage artifact does not define financial-company revenue from finance-specific accounts such as `이자수익`, `수수료수익`, or `보험수익`.
Net income, total assets, total liabilities, total equity, and debt-to-equity ratio are recorded only when OpenDART provides explicit account labels. These fields are source-backed display fields, not analyst-defined replacements.

| Company | 2022 operating income | 2022 revenue | 2023 operating income | 2023 revenue | 2024 operating income | 2024 revenue |
| --- | --- | --- | --- | --- | --- | --- |
| 현대차 | 98198 | 1425275 | 151269 | 1626636 | 142396 | 1752312 |
| 기아 | 72331 | 865590 | 116079 | 998084 | 126671 | 1074488 |
| 현대모비스 | 20265 | 519063 | 22953 | 592544 | 30735 | 572370 |
| 현대글로비스 | 17985 | 269819 | 15540 | 256832 | 17529 | 284074 |
| 현대로템 | 1475 | 31633 | 2100 | 35874 | 4566 | 43766 |

## Account Selection Detail

| Company | Year | Status | Revenue account | Operating income account | Net income account | Liabilities account | Equity account | Basis | Fallback used |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 현대차 | 2022 | ok | 매출액 | 영업이익 |  | 부채총계 | 자본총계 | CFS | no |
| 현대차 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대차 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 기아 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 기아 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 기아 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대모비스 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대모비스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대모비스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대글로비스 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대글로비스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대글로비스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대로템 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대로템 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| 현대로템 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |

## Extraction Status

- OK records: 15
- Partial records: 0
- Error records: 0
- Missing revenue: 0
- Missing operating income: 0
- Missing net income: 1
- Missing total assets: 0
- Missing total liabilities: 0
- Missing total equity: 0

## Non-OK Records

No partial or error records.


## Use Boundary

This table is suitable as an official API-backed financial source manifest.
Runtime answers must preserve company, year, account label, reporting basis, and source state.
