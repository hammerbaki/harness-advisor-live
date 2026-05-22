# Samsung Financial-Sector DART Account Audit

Generated: 2026-05-02T09:00:37.230Z

This document records what OpenDART provides for Samsung financial companies. It does not define financial-company revenue.

Paper-stage rule: revenue is used only when OpenDART explicitly provides `매출액`, `영업수익`, or `수익(매출액)`. Finance-specific accounts such as `이자수익`, `수수료수익`, `보험수익`, `보험계약자산`, or `순이자손익` remain visible as DART-provided accounts, but are not reclassified as revenue.

## Summary

| Company | Year | Major status | Major rows | All rows | Explicit revenue accounts | Operating-income accounts | Finance-specific accounts observed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 삼성생명 | 2022 | 013 | 0 | 0 |  |  |  |
| 삼성생명 | 2023 | 000 | 36 | 948 |  | 계속영업이익(손실), 비지배지분에 귀속될 계속영업이익(손실), 비지배지분에 귀속될 중단영업이익(손실), 영업이익(손실), 중단영업이익(손실) | 보험계약부채, 보험계약자산, 재보험계약부채, 재보험계약자산, 기타포괄보험금융손익 - 후속적으로 재분류 되는 항목, 기타포괄재보험금융손익, 보험계약부채전입액_IFRS4, 보험계약자산(부채)순금융손익 |
| 삼성생명 | 2024 | 000 | 36 | 527 |  | 비지배지분에 귀속될 계속영업이익(손실), 비지배지분에 귀속될 중단영업이익(손실), 영업이익, 영업이익(손실) | 보험계약부채, 보험계약자산, 재보험계약부채, 재보험계약자산, 기타포괄보험금융손익, 기타포괄재보험금융손익, 보험금융비용, 보험금융수익 |
| 삼성화재 | 2022 | 013 | 0 | 0 |  |  |  |
| 삼성화재 | 2023 | 000 | 36 | 550 |  | 기본주당계속영업이익, 영업이익, 희석주당계속영업이익 | 보험계약부채, 보험계약자산, 재보험계약부채, 재보험계약자산, 기타보험영업비용 IFRS4, 기타보험영업수익 IFRS4, 보험금융비용, 보험금융수익 |
| 삼성화재 | 2024 | 000 | 36 | 523 |  | 기본주당계속영업이익, 영업이익, 희석주당계속영업이익, 영업이익(손실) | 보험계약부채, 보험계약자산, 재보험계약부채, 재보험계약자산, 보험금융비용, 보험금융수익, 보험서비스비용, 보험손익 |
| 삼성카드 | 2022 | 013 | 0 | 0 |  |  |  |
| 삼성카드 | 2023 | 000 | 33 | 381 | 영업수익, 매출액 | 영업이익, 영업이익(손실) | 리스부채이자비용, 이자비용, 이자수익 |
| 삼성카드 | 2024 | 000 | 33 | 387 | 영업수익, 매출액 | 영업이익, 영업이익(손실) | 리스부채이자비용, 이자비용, 이자수익 |
| 삼성증권 | 2022 | 013 | 0 | 0 |  |  |  |
| 삼성증권 | 2023 | 000 | 36 | 341 |  | 영업이익, 영업이익(손실) | 예수부채, 기타포괄손익공정가치측정금융자산이자수익, 당기손익공정가치측정금융자산이자수익, 상각후원가측정금융자산관련이자수익, 수수료비용, 수수료수익, 순수수료손익, 순이자손익 |
| 삼성증권 | 2024 | 000 | 36 | 343 |  | 영업이익, 영업이익(손실) | 예수부채, 기타포괄손익-공정가치측정금융자산이자수익, 당기손익-공정가치측정금융자산이자수익, 상각후원가측정금융자산관련이자수익, 수수료비용, 수수료수익, 순수수료손익, 순이자손익 |

## Account Details

### 삼성생명 2022

- Major endpoint: 013 조회된 데이타가 없습니다. (0 rows)
- All-account endpoint rows: 0
- Explicit revenue accounts: none
- Operating-income accounts: none

No account rows were provided by OpenDART for this company-year.
### 삼성생명 2023

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 948
- Explicit revenue accounts: none
- Operating-income accounts: 계속영업이익(손실), 비지배지분에 귀속될 계속영업이익(손실), 비지배지분에 귀속될 중단영업이익(손실), 영업이익(손실), 중단영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 계속영업이익(손실) | 20337 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 계속영업이익(손실) | 13829 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 비지배지분에 귀속될 계속영업이익(손실) | 1384 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 비지배지분에 귀속될 중단영업이익(손실) | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익(손실) | 23984 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익(손실) | 14248 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 중단영업이익(손실) | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 중단영업이익(손실) | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 23984 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 14248 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 1902611 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약부채 | 1895737 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약부채 | 5208 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약부채 | 5207 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약자산 | 13778 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약자산 | 13765 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄보험금융손익 - 후속적으로 재분류 되는 항목 | -71153 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄보험금융손익 - 후속적으로 재분류 되는 항목 | -71153 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 기타포괄재보험금융손익 | 450 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄재보험금융손익 | 450 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험계약부채전입액_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험계약부채전입액_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산(부채)순금융손익 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융비용 | 105932 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융비용 | 105932 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융수익 | 14042 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융수익 | 14042 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험료수익_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험료수익_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스결과 | 14482 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스결과 | 14485 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스비용 | 72239 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스비용 | 71272 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험수익 | 85365 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험수익 | 84402 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험영업수익 | 86721 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험영업수익 | 85757 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료수익 | 19519 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료수익 | 218 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 15388 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 8337 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익(매출액) | 84370 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익(매출액) | 60156 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 일반보험서비스비용 | 70002 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 일반보험서비스비용 | 69098 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융비용 | 403 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융비용 | 403 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융수익 | 477 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융수익 | 477 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험비용_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험비용_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험수익_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험수익_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 지급보험금_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 지급보험금_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 출재보험서비스비용 | 1629 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 출재보험서비스비용 | 1616 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 출재보험서비스수익 | 1356 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 출재보험서비스수익 | 1355 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 특별계정수입수수료_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 특별계정수입수수료_IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 기타포괄보험금융손익 - 후속적으로 재분류 되는 항목 | -71153 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 기타포괄보험금융손익 - 후속적으로 재분류 되는 항목 | -71153 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄재보험금융손익 | 450 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 기타포괄재보험금융손익 | 450 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산(부채)순금융손익 | 0 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 보험계약자산(부채)순금융손익 | 0 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 보험계약부채 | 1902611 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 15388 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 84370 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 1895737 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 8337 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 60156 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성생명 2024

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 527
- Explicit revenue accounts: none
- Operating-income accounts: 비지배지분에 귀속될 계속영업이익(손실), 비지배지분에 귀속될 중단영업이익(손실), 영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 비지배지분에 귀속될 계속영업이익(손실) | 1534 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 비지배지분에 귀속될 중단영업이익(손실) | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 24998 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 15429 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 24998 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 15429 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 2030975 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약부채 | 2021563 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약부채 | 5920 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약부채 | 5920 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약자산 | 23064 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약자산 | 23027 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄보험금융손익 | -91355 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄보험금융손익 | -90967 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 기타포괄재보험금융손익 | 609 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄재보험금융손익 | 608 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융비용 | 80564 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융비용 | 80343 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융수익 | 18259 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융수익 | 18259 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스비용 | 86535 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스비용 | 85765 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스수익 | 91901 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스수익 | 91185 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험손익 | 5366 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험손익 | 5420 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료수익 | 20310 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료수익 | 180 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 17884 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 11335 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익 | 84610 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익 | 59040 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 일반보험서비스비용 | 83581 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 일반보험서비스비용 | 83173 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 일반보험서비스수익 | 90113 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 일반보험서비스수익 | 89408 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융비용 | 413 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융비용 | 413 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융수익 | 926 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융수익 | 924 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 출재보험서비스비용 | 1999 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 출재보험서비스비용 | 1987 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 출재보험서비스수익 | 1788 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 출재보험서비스수익 | 1777 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 기타포괄보험금융손익 | -91355 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 기타포괄보험금융손익 | 0 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄재보험금융손익 | 609 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 기타포괄재보험금융손익 | 608 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 보험계약부채 | 2030975 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 17884 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 84610 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 2021563 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 11335 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 59040 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성화재 2022

- Major endpoint: 013 조회된 데이타가 없습니다. (0 rows)
- All-account endpoint rows: 0
- Explicit revenue accounts: none
- Operating-income accounts: none

No account rows were provided by OpenDART for this company-year.
### 삼성화재 2023

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 550
- Explicit revenue accounts: none
- Operating-income accounts: 기본주당계속영업이익, 영업이익, 희석주당계속영업이익

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 기본주당계속영업이익 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 23573 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 23762 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 희석주당계속영업이익 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 23573 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익 | 23762 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 517769 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약부채 | 516205 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약부채 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약부채 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약자산 | 15765 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약자산 | 14903 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 기타보험영업비용 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타보험영업비용 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 기타보험영업수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타보험영업수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융비용 | 16015 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융비용 | 15729 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융수익 | 1842 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융수익 | 1546 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험료수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험료수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스비용 | 134819 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스비용 | 134055 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험손익 | 19361 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험손익 | 18631 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험수익 | 164860 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험수익 | 163033 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험영업비용 | 150840 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험영업비용 | 149310 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험영업수익 | 170201 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험영업수익 | 167941 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 4452 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 4078 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익 | 21046 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익 | 20410 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금수익 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융비용 | 531 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융비용 | 411 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융수익 | 993 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융수익 | 874 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험료비용 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험료비용 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험비용 | 12156 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험비용 | 11252 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험수익 | 5111 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험수익 | 4908 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 지급보험금및환급금 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 지급보험금및환급금 IFRS4 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 특별계정수입수수료 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 특별계정수입수수료 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 특별계정지급수수료 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 특별계정지급수수료 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험계약금융손익 | 0 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 보험계약금융손익 | -5924 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약금융손익 | 169 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약금융손익 | 171 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 보험계약부채 | 517769 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 4452 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 21046 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 516205 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 4078 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 20410 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성화재 2024

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 523
- Explicit revenue accounts: none
- Operating-income accounts: 기본주당계속영업이익, 영업이익, 희석주당계속영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 기본주당계속영업이익 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 26496 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 26995 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 희석주당계속영업이익 | 0 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익(손실) | 26496 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 26995 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 517877 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약부채 | 516095 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 보험계약자산 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약부채 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약부채 | 0 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약자산 | 16923 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약자산 | 16236 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 보험금융비용 | 15486 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융비용 | 15135 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험금융수익 | 1366 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험금융수익 | 1000 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험서비스비용 | 145087 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험서비스비용 | 143443 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험손익 | 18183 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험손익 | 17804 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험수익 | 172765 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험수익 | 170525 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험영업비용 | 160049 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험영업비용 | 157544 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험영업수익 | 178232 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 보험영업수익 | 175348 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 4572 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 4588 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익 | 22515 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익 | 21845 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융비용 | 488 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융비용 | 340 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험금융수익 | 1233 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험금융수익 | 1073 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험비용 | 12667 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험비용 | 11643 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 재보험수익 | 5197 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 재보험수익 | 4823 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 보험계약금융손익 | 0 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 보험계약금융손익 | -9320 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 재보험계약금융손익 | -13 |  | 자본변동표 | fnlttSinglAcntAll.json:CFS |
| 재보험계약금융손익 | -15 |  | 자본변동표 | fnlttSinglAcntAll.json:OFS |
| 보험계약부채 | 517877 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 4572 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 22515 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 보험계약부채 | 516095 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 보험계약자산 | 0 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 이자비용 | 4588 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 21845 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성카드 2022

- Major endpoint: 013 조회된 데이타가 없습니다. (0 rows)
- All-account endpoint rows: 0
- Explicit revenue accounts: none
- Operating-income accounts: none

No account rows were provided by OpenDART for this company-year.
### 삼성카드 2023

- Major endpoint: 000 정상 (33 rows)
- All-account endpoint rows: 381
- Explicit revenue accounts: 영업수익, 매출액
- Operating-income accounts: 영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 영업수익 | 40042 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업수익 | 39366 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 매출액 | 40042 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 매출액 | 39366 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익 | 8100 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 8076 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 8100 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 8076 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 리스부채이자비용 | 7 |  | 현금흐름표 | fnlttSinglAcntAll.json:CFS |
| 리스부채이자비용 | 6 |  | 현금흐름표 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 4860 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 10035 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 4871 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 10035 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성카드 2024

- Major endpoint: 000 정상 (33 rows)
- All-account endpoint rows: 387
- Explicit revenue accounts: 영업수익, 매출액
- Operating-income accounts: 영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 영업수익 | 43832 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업수익 | 40155 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 매출액 | 43832 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 매출액 | 40155 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익 | 8854 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 8834 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 8854 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 8834 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 리스부채이자비용 | 5 |  | 현금흐름표 | fnlttSinglAcntAll.json:CFS |
| 리스부채이자비용 | 4 |  | 현금흐름표 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 5127 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 10486 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 5138 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 10486 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성증권 2022

- Major endpoint: 013 조회된 데이타가 없습니다. (0 rows)
- All-account endpoint rows: 0
- Explicit revenue accounts: none
- Operating-income accounts: none

No account rows were provided by OpenDART for this company-year.
### 삼성증권 2023

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 341
- Explicit revenue accounts: none
- Operating-income accounts: 영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 영업이익 | 7411 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 6620 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 7411 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 6620 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 예수부채 | 145705 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 예수부채 | 109873 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄손익공정가치측정금융자산이자수익 | 902 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄손익공정가치측정금융자산이자수익 | 902 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 당기손익공정가치측정금융자산이자수익 | 5474 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 당기손익공정가치측정금융자산이자수익 | 5534 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 상각후원가측정금융자산관련이자수익 | 9275 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 상각후원가측정금융자산관련이자수익 | 6259 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료비용 | 2012 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료비용 | 1609 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료수익 | 10000 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료수익 | 9458 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 순수수료손익 | 7989 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 순수수료손익 | 7848 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 순이자손익 | 6492 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 순이자손익 | 5066 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 9616 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 8032 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익 | 16108 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익 | 13098 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 현금및현금성자산이자수익 | 457 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 현금및현금성자산이자수익 | 403 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 예수부채 | 145705 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 순수수료손익 | 7989 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 순이자손익 | 6492 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 9616 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 16108 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 예수부채 | 109873 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 순수수료손익 | 7848 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 순이자손익 | 5066 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 8032 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 13098 | OFS | 손익계산서 | fnlttSinglAcnt.json |
### 삼성증권 2024

- Major endpoint: 000 정상 (36 rows)
- All-account endpoint rows: 343
- Explicit revenue accounts: none
- Operating-income accounts: 영업이익, 영업이익(손실)

| Account | Amount(억원) | Basis | Statement | Endpoint |
| --- | --- | --- | --- | --- |
| 영업이익 | 12058 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 영업이익 | 11055 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 영업이익(손실) | 12058 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 영업이익(손실) | 11055 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 예수부채 | 162884 |  | 재무상태표 | fnlttSinglAcntAll.json:CFS |
| 예수부채 | 124193 |  | 재무상태표 | fnlttSinglAcntAll.json:OFS |
| 기타포괄손익-공정가치측정금융자산이자수익 | 899 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 기타포괄손익-공정가치측정금융자산이자수익 | 899 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 당기손익-공정가치측정금융자산이자수익 | 6291 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 당기손익-공정가치측정금융자산이자수익 | 6393 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 상각후원가측정금융자산관련이자수익 | 9114 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 상각후원가측정금융자산관련이자수익 | 6398 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료비용 | 1981 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료비용 | 1520 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 수수료수익 | 11466 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 수수료수익 | 10633 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 순수수료손익 | 9485 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 순수수료손익 | 9112 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 순이자손익 | 6681 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 순이자손익 | 5327 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자비용 | 10238 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자비용 | 8901 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 이자수익 | 16920 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 이자수익 | 14227 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 현금및현금성자산이자수익 | 616 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:CFS |
| 현금및현금성자산이자수익 | 538 |  | 포괄손익계산서 | fnlttSinglAcntAll.json:OFS |
| 예수부채 | 162884 | CFS | 재무상태표 | fnlttSinglAcnt.json |
| 순수수료손익 | 9485 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 순이자손익 | 6681 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 10238 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 16920 | CFS | 손익계산서 | fnlttSinglAcnt.json |
| 예수부채 | 124193 | OFS | 재무상태표 | fnlttSinglAcnt.json |
| 순수수료손익 | 9112 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 순이자손익 | 5327 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자비용 | 8901 | OFS | 손익계산서 | fnlttSinglAcnt.json |
| 이자수익 | 14227 | OFS | 손익계산서 | fnlttSinglAcnt.json |
