# LG DART Financial Table

Generated: 2026-05-06T04:36:52.480Z

Source: OpenDART `fnlttSinglAcnt.json` with `fnlttSinglAcntAll.json` fallback, annual report code `11011`.

Values are converted to 억원 from KRW and rounded to the nearest integer.
Revenue is filled only when OpenDART provides an explicit `매출액`, `영업수익`, or `수익(매출액)` account. The paper-stage artifact does not define financial-company revenue from finance-specific accounts such as `이자수익`, `수수료수익`, or `보험수익`.
Net income, total assets, total liabilities, total equity, and debt-to-equity ratio are recorded only when OpenDART provides explicit account labels. These fields are source-backed display fields, not analyst-defined replacements.

| Company | 2022 operating income | 2022 revenue | 2023 operating income | 2023 revenue | 2024 operating income | 2024 revenue |
| --- | --- | --- | --- | --- | --- | --- |
| LG전자 | 35510 | 834673 | 35491 | 842278 | 34197 | 877282 |
| LG화학 | 29957 | 518649 | 25292 | 552498 | 9168 | 489161 |
| LG에너지솔루션 | 12137 | 255986 | 21632 | 337455 | 5754 | 256196 |
| LG생활건강 | 7111 | 71858 | 4870 | 68048 | 4590 | 68119 |
| LG디스플레이 | -20850 | 261518 | -25102 | 213308 | -5606 | 266153 |
| LG이노텍 | 12718 | 195894 | 8308 | 206053 | 7060 | 212008 |
| LG유플러스 | 10813 | 139060 | 9980 | 143726 | 8631 | 146252 |
| LG씨엔에스 |  |  | 4640 | 56053 | 5129 | 59826 |
| LG | 19414 | 71860 | 15890 | 74453 | 9668 | 71755 |

## Account Selection Detail

| Company | Year | Status | Revenue account | Operating income account | Net income account | Liabilities account | Equity account | Basis | Fallback used |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LG전자 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG전자 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG전자 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG화학 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG화학 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG화학 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG에너지솔루션 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG에너지솔루션 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG에너지솔루션 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG생활건강 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG생활건강 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG생활건강 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG디스플레이 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG디스플레이 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG디스플레이 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG이노텍 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG이노텍 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG이노텍 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG유플러스 | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG유플러스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG유플러스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG씨엔에스 | 2022 | error |  |  |  |  |  |  | no |
| LG씨엔에스 | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG씨엔에스 | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG | 2022 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG | 2023 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |
| LG | 2024 | ok | 매출액 | 영업이익 | 당기순이익(손실) | 부채총계 | 자본총계 | CFS | no |

## Extraction Status

- OK records: 26
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
| LG씨엔에스 | 2022 | error | 013 | 조회된 데이타가 없습니다. |

## Use Boundary

This table is suitable as an official API-backed financial source manifest.
Runtime answers must preserve company, year, account label, reporting basis, and source state.
