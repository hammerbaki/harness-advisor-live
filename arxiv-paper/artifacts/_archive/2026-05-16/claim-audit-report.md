# Claim Audit Report

생성일: 2026-05-09

## Safe/Unsafe 기준 (strategy 문서 요약)

### Safe Claims
1. A prompt-heavy enterprise PoC can be reconstructed into a traceable source-backed agent architecture.
2. The current implementation covers a controlled 25-company reference slice: Samsung, SK, Hyundai Motor, LG, and Hanwha, five listed companies per group.
3. The runtime manifests currently contain 113 source-backed claims, with a compact 25-claim review-approved layer.
4. Frozen scenario contract checks, referential-integrity checks, live API smoke tests, live answer-quality smoke tests, and an answer-inspection packet are available as system-level evidence.
5. The prior Electronics paper is relevant as an earlier simultaneous deployment study of AI agents; this paper extends that trajectory toward enterprise hardening and traceable productization.

### Unsafe Claims
1. The system is commercially ready.
2. The system improves investment decisions.
3. The system provides formal investment advice.
4. The answer-inspection packet proves answer usefulness or expert acceptance.
5. Live API smoke tests prove long-run production reliability.

## 주장-근거 대조표

| # | 위치 (파일:라인) | 주장 원문 | 분류 | 근거 위치 | 근거 강도 | 비고 |
|---|-----------------|----------|------|----------|----------|------|
| 1 | 01_introduction:3 | "We propose a harness-engineering approach for converting such a prototype into a traceable research system." | Safe | 03_method 전체; 05_system_validation 전체 | 강함 | Safe #1과 일치 |
| 2 | 01_introduction:5 | "The method separates language generation from deterministic product behavior." | Safe | 03_method:46-58 | 강함 | 구체적 분리 항목 명시됨 |
| 3 | 01_introduction:9 | "We do not claim to measure investment performance, customer satisfaction, or commercial effectiveness." | Safe | 전체 논문 일관 유지 | 강함 | 명시적 scope 제한. 위반 없음 |
| 4 | 01_introduction:14 | "a practical reconstruction method for transforming a prompt-heavy LLM demonstration into a traceable agent architecture" (C1) | Safe | 03_method 전체 | 강함 | Safe #1 직접 대응 |
| 5 | 01_introduction:15 | "a source-backed knowledge pipeline that separates raw official documents, extracted text, claim candidates, runtime-eligible claims, and user-facing answers" (C2) | Safe | 03_method:16-42, 04_data 전체 | 강함 | 파이프라인 단계별 기술됨 |
| 6 | 01_introduction:16-17 | "a system-level validation framework... focusing on traceability, reproducibility... rather than customer-impact evaluation" (C3) | Safe | 05_system_validation 전체 | 강함 | "rather than" 표현이 scope 경계를 명시 |
| 7 | 02_related_work:6 | "retrieval alone does not guarantee traceability" | Safe | 문헌 기반 논거 | 중간 | 인용 문헌으로 뒷받침 |
| 8 | 02_related_work:27 | "The contribution of this paper is not a new language model, a new retrieval algorithm, or a new investment model." | Safe | 명시적 scope 제한 | 강함 | 기대 관리 우수 |
| 9 | 03_method:9 | "The system must produce an answer $a$ that is useful to the user while preserving traceability" | Safe | 03_method:62-74, 05_validation | 강함 | 수학적 형식화와 구현 모두 제시 |
| 10 | 03_method:36 | "This claim layer is the main boundary between exploratory RAG and a traceable agent." | **Boundary** | 개념적 주장 | 중간 | 비교 실험 없이 "main boundary" 단언 |
| 11 | 03_method:60 | "This migration reduces the burden on the LLM." | **Boundary** | 간접 근거 | 약함 | "reduces burden" 정량 비교 없음 |
| 12 | 03_method:95 | "The result is not a fully autonomous agent... It is a controlled enterprise LLM agent whose factual behavior is bounded" | Safe | 03_method 전체 | 강함 | scope 경계를 정직하게 기술 |
| 13 | 04_data:68 | "This convention prevents the paper from overstating coverage" | Safe | 메타 주장 | 강함 | 방법론적 겸손 |
| 14 | 05_validation | "Total 30 frozen scenarios passed their contract checks with zero required failures." | Safe | Table 2 (30/30 pass) | 강함 | 직접 데이터 근거 |
| 15 | 05_validation | "These results show that the configured contracts replay successfully for the bounded reference slice." | Safe | bounded reference slice 범위 내 주장 | 강함 | 과도한 성과 주장 회피 |
| 16 | 05_validation:43 | "This does not prove that the generated insight improves investment outcomes." | Safe | 명시적 경계 선언 | 강함 | Unsafe #2 회피 |
| 17 | 05_validation | "This packet supports author-side inspection of answer format, links, and traces before later domain review." | Safe | answer-inspection artifact로 범위 한정 | 강함 | expert validation 과장 회피 |
| 18 | 05_validation:65 | "Connectivity, not reliability proof" (Table 3 Boundary 열) | Safe | 테이블 내 경계 표시 | 강함 | Unsafe #5 회피 |
| 19 | 05_validation:95 | "enterprise LLM agents should be scaled by strengthening the harness around the model, not merely by adding more instructions or more documents." | **Boundary** | 05_validation 결과 전체 | 중간 | 단일 사례에서 일반 원칙 도출 |
| 20 | 05_discussion:13 | "If an answer is wrong, it may be unclear whether the cause is retrieval, stale knowledge, entity confusion, prompt interpretation, or the language model itself." | Safe | 구조적 설계 근거 | 중간 | PoC 경험에서의 관찰 |
| 21 | 05_discussion:15 | "The reconstructed harness separates these responsibilities." | Safe | 03_method 전체 | 강함 | 설계 수준 주장 |
| 22 | 05_discussion:19 | "the system prevents the analysis process itself from becoming the final user-facing product" | **Boundary** | 03_method:69-74, 구조적 설계 | 중간 | 검증은 output contract 수준 |
| 23 | 05_discussion:25 | "the new target must pass the same sequence of source registration, extraction, claim promotion..." | Safe | 04_data (5그룹 적용) | 중간 | 5그룹 전이로 부분 뒷받침 |
| 24 | 06_conclusion:5 | "This makes the agent easier to inspect, debug, and transfer across domains" | **Boundary** | 간접 근거 | 약함 | "easier" 정량 비교 부재 |
| 25 | 06_conclusion:9 | "enterprise LLM agents should not be scaled only by adding larger prompts or larger document bundles. They should be scaled by building better harnesses" | **Boundary** | 전체 논문 | 중간 | 단일 도메인에서 일반화 |

## 경계 위반 플래그

| # | 위치 | 원문 | 위반 유형 | 대안 표현 |
|---|------|------|----------|----------|
| 1 | 03_method:36 | "This claim layer is the main boundary between exploratory RAG and a traceable agent." | 과도한 단언 | "This claim layer represents a key design boundary between exploratory RAG and a traceable agent in our architecture." |
| 2 | 03_method:60 | "This migration reduces the burden on the LLM." | 정량 근거 부재 | "This migration is intended to reduce the burden on the LLM, although we have not measured prompt-complexity reduction directly." |
| 3 | 05_validation:95 | "enterprise LLM agents should be scaled by strengthening the harness..." | 단일 사례 일반화 | "In this case study, scaling was achieved by strengthening the harness around the model rather than by adding more instructions or documents." |
| 4 | 05_discussion:19 | "the system prevents the analysis process itself from becoming the final user-facing product" | 가능성 vs 실현 | "the system is designed to prevent the analysis process from becoming the user-facing product" |
| 5 | 06_conclusion:5 | "This makes the agent easier to inspect, debug, and transfer" | 정량 근거 부재 | "This is intended to make the agent easier to inspect, debug, and transfer, based on the five-group reference implementation." |
| 6 | 06_conclusion:9 | "They should be scaled by building better harnesses" | 단일 도메인 일반화 | "One lesson from this case study is that the path from enterprise LLM demonstration to productization benefits from a systems-engineering approach." |

## 요약

- **총 주장 수**: 25개 추출
- **Safe**: 19개 (76%)
- **Boundary**: 6개 (24%)
- **Unsafe**: 0개 (0%)
- **근거 강도**: 강함 15개, 중간 8개, 약함 2개

**핵심 발견:**

1. **Unsafe 영역 침범 없음.** 5개 Unsafe Claim에 해당하는 주장이 논문 전체에서 발견되지 않음. scope 경계 관리 우수.
2. **Boundary 항목 6개는 위험도 낮음.** 모두 개념적 과장 또는 정량 근거 부재 수준. Unsafe 진입은 아니지만, 리뷰어 방어력을 위해 대안 표현 적용 권장.
3. **약한 근거 2건** (#11, #24): 정성적 주장에 대한 정량적 뒷받침 부족 패턴.
4. **경계 관리 모범 사례**: 05_validation의 bounded reference slice, author-side inspection artifact, live-interface status 표현은 과장 없이 현재 산출물의 성격을 설명한다.
