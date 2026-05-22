# Style Report

생성일: 2026-05-09
리뷰 범위: 전체 (01_introduction ~ 06_conclusion)

## 수정 제안

| # | 파일:라인 | 유형 | 원문 | 수정안 | 이유 |
|---|----------|------|------|--------|------|
| 1 | 01_intro:5 | 일관성 | "development trace information could leak" | "development-trace information could leak" | 복합 수식어 하이픈 필요. 다른 곳에서는 하이픈 사용됨 |
| 2 | 03_method:22 + 04_data:13 | **반복 (심각)** | manifest 필드 11개를 양쪽에서 거의 동일하게 열거 | 03_method에서 한 번 정의, 04_data에서는 "The manifest records the fields described in Section~3.2" | 동일 필드 목록의 중복. 가장 시급한 수정 |
| 3 | 03_method:36 + 05_valid:33 | 반복 | "source states such as live, local, fallback, fixture, or error" 두 곳 동일 | 03_method에서 정의 후 05_validation에서는 "source states (see Section~3)" | 동일 열거 불필요 반복 |
| 4 | 04_data:3 | 간결성 | "The goal is not to build a complete financial dataset. The goal is to document..." | "The goal is not to build a complete financial dataset but to document..." | 두 문장을 대조 구문 하나로 결합 |
| 5 | 04_data:7 | 일관성 | "This controlled 25-company slice" | "This bounded 25-company slice" | 논문 전체에서 "bounded" 일관 사용. "controlled"는 실험 설계 맥락과 혼동 |
| 6 | 05_valid:7 | 간결성 | 9개 scoring 항목 한 문장 나열 | 3개 카테고리로 그룹화: content quality (claim coverage, routing, follow-up), system integrity (trace, leakage, links), operational fitness (structure, variation, latency) | 독자 인지 부하 감소 |
| 7 | 05_valid:47 | 간결성 | "A cache-disabled five-group live API smoke test returned live... for all five groups" | "A cache-disabled smoke test across all five groups returned live..." | **"five" 중복 (심각)** |
| 8 | 06_conclusion:3 | **반복 (심각)** | "source manifests, extraction records, source-backed claims, company-scoped routing, LLM Wiki pages, runtime traces..." 8개 열거 | "the harness artifacts described in Section~3" 또는 핵심 3-4개만 | 01_introduction과 거의 동일한 열거가 세 번째 반복 |
| 9 | 06_conclusion:9 | 간결성 | "not merely by adding more instructions or more documents" | "not merely by adding instructions or documents" | "more" 불필요 반복 |

## 용어 일관성

| 용어 그룹 | 사용된 변형들 | 권장 통일 표현 | 등장 위치 |
|----------|-------------|---------------|----------|
| 개발 추적 노출 방지 | "leakage prevention", "development-leakage prevention", "debug-leakage prevention" | "development-leakage prevention" | 01_intro, 03_method, 05_valid, 06_conclusion |
| 사실 기반 주장 | "source-backed claims", "source-backed runtime claims", "runtime-eligible claims", "promoted claims" | "source-backed claims" (정식), "promoted claims" (프로모션 맥락에서만) | 전체 |
| 로컬 경로 표현 | "local path when available", "local path if available" | "local path, when available" 통일 | 03_method vs 04_data |
| 답변 구조 | "insight-first contract", "insight-first output", "insight-first answer structure", "insight-first construction" | "insight-first contract" (정식), "insight-first answer" (일반) | 03_method, 05_valid |
| 하이픈 일관성 | "development trace" vs "development-trace", "answer quality" vs "answer-quality" | 수식어로 사용 시 하이픈 통일 | 01_intro, 05_valid |

## Scope Boundary 반복 분석

**판정: 대부분 의도적 전략으로 유지 권장**

이 논문은 투자 도메인 LLM 시스템을 다루므로, 독자가 투자 성과 주장으로 오독할 위험이 높다. Scope boundary 반복은 선제적 방어 전략.

10곳 중 **8곳은 각각 고유한 맥락에서 다른 측면의 경계를 명시**하므로 유지 권장.

**축약 고려 2곳:**
- 05_validation:13 ("It does not support claims about broad market coverage...") — 같은 섹션의 :7과 의미 중복
- 06_conclusion:7 ("The validation is intentionally system-level...") — 01_intro:9와 거의 동일. "As noted in Section~1"로 축약 가능

## 요약 통계

| 항목 | 수치 |
|------|------|
| 수정 제안 수 | 9 |
| -- 심각 (반드시 수정) | 3건 (#2 manifest 중복, #7 five 중복, #8 conclusion 열거 반복) |
| -- 권장 | 4건 |
| -- 선호/선택 | 2건 |
| 용어 일관성 이슈 | 5개 그룹 |
| Scope boundary 등장 | 10곳 (8곳 유지, 2곳 축약 고려) |
