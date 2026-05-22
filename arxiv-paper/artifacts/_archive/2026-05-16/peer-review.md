# Peer Review Simulation

생성일: 2026-05-09
기반 리포트: structure-report.md, claim-audit-report.md, citation-report.md, style-report.md

---

## Reviewer 1: 방법론·재현성

**Summary**: 본 논문은 prompt-heavy PoC를 traceable agent system으로 재구성하는 harness-engineering 방법론을 제안하며, 3개 contribution이 Method-Data-Validation 구조에 체계적으로 대응된다. 그러나 source-to-claim pipeline(C2)의 독립 검증이 최종 답변 품질을 통한 간접 검증에 머물러 있고, 일부 핵심 주장에 정량적 근거가 부재하여 재현성과 주장 경계에 보완이 필요하다.

### Major
1. **C2 pipeline 독립 검증 부재**: source-to-claim pipeline(C2)의 정확성이 파이프라인 단계별(예: claim promotion 정확도, extraction recall)이 아닌 최종 답변 품질로만 간접 검증된다. 리뷰어가 "pipeline 자체가 올바르게 작동하는지 어떻게 아는가?"라고 질문할 가능성이 높다. 최소한 claim promotion 단계의 precision/recall 또는 수작업 샘플 검증 결과를 추가해야 한다.
2. **Frozen scenario 점수의 ceiling effect 미해석**: 99.0-99.4점이라는 높은 점수가 자체 contract 기반 검증이므로 당연한 것인지, 실질적 변별력이 있는지에 대한 비판적 해석이 Discussion에서 전혀 다뤄지지 않는다. 자체 설계한 평가 기준으로 자체 시스템을 평가하는 구조적 한계를 인정하고 해석해야 한다.
3. **"reduces the burden on the LLM" (03_method:60) 정량 근거 부재**: prompt-to-code migration이 LLM 부담을 줄인다는 주장에 대해 prompt 복잡도, 토큰 수, 에러율 등 어떤 정량적 비교도 제시되지 않는다. 측정하지 않았다면 그 사실을 명시해야 한다.

### Minor
1. **Claim 수의 그룹별 편차 미논의**: Samsung 36개 vs Hyundai/LG 15개 등 claim 수 편차가 pipeline 특성(coverage bias)을 시사할 수 있으나 Discussion에서 다뤄지지 않는다.
2. **Latency 최적화 engineering insight 부재**: Validation에서 latency를 측정하지만 최적화 전후 비교나 병목 분석이 없다.
3. **Conclusion에서 limitations 참조 누락**: Discussion 6.4에서 4개 한계를 다루지만 Conclusion에서 이를 전혀 언급하지 않아 미완결 인상을 준다.

### Questions
1. Claim promotion 단계에서 reject된 claim의 비율과 reject 사유 분포는 어떠한가?
2. Frozen scenario의 21개 시나리오는 어떤 기준으로 선정되었으며, 시나리오 설계 자체의 편향 가능성을 어떻게 통제하였는가?
3. 5개 그룹 간 claim 수 편차가 답변 품질에 미치는 영향을 분석한 적이 있는가?
4. Prompt-to-code migration 전후로 LLM 호출 횟수나 토큰 사용량 변화를 측정할 계획이 있는가?

---

## Reviewer 2: 위치 설정·관련 연구

**Summary**: 논문의 contribution은 harness engineering이라는 실용적 방법론에 있으나, 관련 연구 인용이 14편으로 부족하고 특히 guardrails, hallucination, enterprise AI deployment 등 핵심 관련 분야의 학술 문헌이 누락되어 있다. 결과적으로 논문이 기존 연구 대비 어디에 위치하는지가 불명확하며, Discussion과 Validation에서 선행 연구와의 비교가 전무하다.

### Major
1. **Guardrails 선행 연구 인용 전무**: output contract와 leakage prevention이 핵심 기여임에도 NeMo Guardrails(Rebedea et al., 2023 EMNLP) 등 guardrails 문헌이 전혀 인용되지 않는다. 본 논문의 contribution이 기존 guardrails 접근과 어떻게 다른지 명시해야 한다.
2. **Enterprise AI / deployment 문헌 부재**: enterprise LLM 배포를 다루면서 MLOps(Kreuzberger et al., 2023), SE-for-AI 등 체계적 선행 연구 없이 자기 인용 1편(ahn2025autonomous)만 존재한다. 학술적 positioning이 약하다.
3. **Hallucination survey 미인용**: source-backed claims의 핵심 동기가 hallucination 방지임에도 Ji et al.(2023) 등 hallucination survey가 없어, 문제 정의의 학술적 근거가 부족하다.
4. **Discussion/Validation에서 선행 연구 비교 부재**: Discussion과 Validation 섹션에서 \cite가 0회. harness engineering이 MLOps, DSPy, NeMo Guardrails 등 기존 접근과 어떻게 차별화되는지 비교 논의가 필요하다.

### Minor
1. **LLM agent survey 미인용**: Wang et al.(2024) 등 포괄적 agent survey가 없어 agent 분야 맥락이 약하다.
2. **Evaluation 문헌 1편(RAGAS)만**: FActScore, ARES, HELM 등 평가 프레임워크 문헌이 부재하여 evaluation 관련 positioning이 빈약하다.
3. **LangChain/LlamaIndex 미언급**: 가장 대중적인 LLM 오케스트레이션 프레임워크를 언급하지 않는다면 의도적 제외 이유를 명시해야 한다.
4. **학술 문헌 비율**: 14편 중 peer-reviewed 7편, 소프트웨어/gist 5편. 학술 문헌 비율이 낮다. 20-25편 수준으로 보강 권장.

### Questions
1. NeMo Guardrails와 본 논문의 output contract 접근은 어떤 점에서 다른가? 단순 rule-based guardrails를 넘어서는 부분이 있는가?
2. DSPy의 programmatic LLM pipeline과 본 논문의 harness engineering의 경계는 무엇인가? DSPy 위에 구축할 수 없었던 이유가 있는가?
3. LangChain/LlamaIndex를 사용하지 않은 이유가 기술적 판단인가, 의도적 제외인가?
4. Knowledge base 구축에 대한 학술 문헌(예: KG-LLM 통합 연구)을 참조하지 않은 이유는?

---

## Reviewer 3: 명확성·가독성

**Summary**: 논문의 전반적 구조는 논리적이며 contribution-validation 매핑이 명확하나, manifest 필드 목록의 중복 열거, Conclusion에서의 artifact 반복 나열, 용어 일관성 부재 등이 가독성을 저해한다. Scope boundary 반복은 투자 도메인 특성상 대부분 정당하나 2곳은 축약이 필요하다.

### Major
1. **Manifest 필드 목록 중복 (03_method:22 + 04_data:13)**: 11개 manifest 필드가 Method와 Data 양쪽에서 거의 동일하게 열거된다. Method에서 한 번 정의하고 Data에서는 "The manifest records the fields described in Section~3.2"로 참조해야 한다. 이는 논문에서 가장 시급한 가독성 문제이다.
2. **Conclusion의 artifact 열거 반복 (06_conclusion:3)**: 8개 harness artifact가 Introduction과 거의 동일하게 세 번째 반복된다. "the harness artifacts described in Section~3" 또는 핵심 3-4개만 선별하여 축약해야 한다.
3. **용어 일관성 부재 (5개 그룹)**: "leakage prevention" 계열(3개 변형), "source-backed claims" 계열(4개 변형), "insight-first" 계열(4개 변형) 등에서 용어가 통일되지 않아 독자가 같은 개념인지 혼동할 수 있다. 각 용어 그룹의 정식 표현을 정하고 통일해야 한다.

### Minor
1. **Source state 열거 반복 (03_method:36 + 05_valid:33)**: "live, local, fallback, fixture, or error" 동일 열거가 두 곳에서 반복. Validation에서는 "source states (see Section~3)"로 축약.
2. **"five" 중복 (05_valid:47)**: "five-group live API smoke test returned live... for all five groups"에서 five가 불필요하게 반복.
3. **"controlled" vs "bounded" 용어 혼용 (04_data:3)**: 논문 전체에서 "bounded"를 사용하면서 이 한 곳만 "controlled"를 사용. 실험 설계 맥락의 "controlled"와 혼동 가능.
4. **Validation 9개 scoring 항목 나열 (05_valid:7)**: 9개 항목을 한 문장에 나열하면 인지 부하가 높다. content quality / system integrity / operational fitness 3개 카테고리로 그룹화 권장.
5. **하이픈 일관성**: "development trace" vs "development-trace", "answer quality" vs "answer-quality" 등 복합 수식어의 하이픈 사용이 불일치.
6. **Scope boundary 2곳 축약 필요**: 05_validation:13(같은 섹션 :7과 의미 중복)과 06_conclusion:7(01_intro:9와 거의 동일)은 축약 가능. 나머지 8곳은 각각 고유한 맥락이므로 유지.

### Questions
1. Manifest 필드 목록을 Method에서 한 번 정의하고 Data에서 참조하는 방식으로 수정할 의향이 있는가?
2. 용어 통일 표현(예: "development-leakage prevention", "source-backed claims", "insight-first contract")에 대해 저자가 선호하는 정식 표현이 있는가?
3. Scope boundary 반복 중 어느 것을 저자가 "반드시 유지"로 판단하는가?

---

## arXiv 투고 준비 상태 최종 판정

**Ready with minor revisions**

본 논문은 핵심 논리 구조가 탄탄하고, 3개 contribution이 Method-Data-Validation에 체계적으로 대응되며, safe/unsafe claim 경계 관리가 우수하다(unsafe 영역 침범 0건). arXiv preprint 기준으로 투고 가능한 수준이나, 아래 사항을 사전에 보완하면 리뷰어 방어력이 크게 향상된다.

**투고 전 필수 수정 (3건):**
1. Guardrails, hallucination survey, enterprise AI deployment 등 핵심 선행 연구 최소 3-4편 추가
2. Manifest 필드 목록 중복 제거 및 Conclusion artifact 열거 축약
3. Boundary 주장 6건의 표현 완화 (특히 단일 사례 일반화 2건)

**투고 후 리비전에서 대응 가능 (2건):**
1. C2 pipeline 단계별 독립 검증 데이터 추가
2. Discussion에서 ceiling effect 해석 및 선행 연구 비교 보강

---

## 우선순위 액션 리스트

| 순위 | 이슈 | Reviewer | 분류 | 대응 방향 | 관련 섹션 |
|------|------|----------|------|----------|----------|
| 1 | Guardrails 선행 연구(NeMo Guardrails 등) 인용 전무 | R2 | Major | S2에 guardrails 단락 추가, output contract와의 차별점 기술 | 02_related_work |
| 2 | Hallucination survey 미인용 | R2 | Major | Ji et al.(2023) 등 추가, source-backed claims 동기의 학술적 근거 보강 | 02_related_work |
| 3 | Manifest 필드 목록 중복 (Method + Data) | R3 | Major | Data에서 Method 참조로 변경, 중복 열거 제거 | 03_method, 04_data |
| 4 | Enterprise AI deployment 문헌 부재 | R2 | Major | MLOps/SE-for-AI 문헌 1-2편 추가 | 02_related_work |
| 5 | Frozen scenario ceiling effect 미해석 | R1 | Major | Discussion에 자체 contract 검증의 구조적 한계 해석 추가 (5-10줄) | 05_discussion |
| 6 | Boundary 주장 6건 표현 완화 | R1 | Major | 6건 대안 표현 적용 (특히 05_valid:95, 06_conclusion:5,9) | 03_method, 05_validation, 06_conclusion |
| 7 | Discussion에서 선행 연구 비교 부재 | R2 | Major | harness engineering vs MLOps/DSPy/Guardrails 차별점 비교 추가 | 05_discussion |
| 8 | Conclusion artifact 열거 반복 | R3 | Major | 8개 나열을 섹션 참조 또는 핵심 3-4개로 축약 | 06_conclusion |
| 9 | C2 pipeline 독립 검증 간접성 | R1 | Major | claim promotion precision/recall 또는 샘플 검증 결과 추가 | 05_system_validation |
| 10 | 용어 일관성 통일 (5개 그룹) | R3 | Minor | 각 그룹 정식 표현 확정 후 전체 통일 | 전체 |
| 11 | "reduces burden on LLM" 정량 근거 부재 | R1 | Minor | 미측정 사실 명시 또는 hedging 표현 추가 | 03_method |
| 12 | Agent survey 추가 | R2 | Minor | Wang et al.(2024) 추가 | 02_related_work |
| 13 | Evaluation 문헌 보강 (FActScore, ARES 등) | R2 | Minor | 1-2편 추가 | 02_related_work |
| 14 | Conclusion에 limitations 참조 추가 | R1 | Minor | Discussion 6.4를 1-2문장으로 요약 참조 | 06_conclusion |
| 15 | Claim 수 그룹별 편차 논의 | R1 | Minor | Discussion에 2-3문장 추가 | 05_discussion |
| 16 | Source state 열거 반복 축약 | R3 | Minor | Validation에서 섹션 참조로 변경 | 05_system_validation |
| 17 | Scope boundary 2곳 축약 | R3 | Minor | 05_valid:13, 06_conclusion:7 축약 | 05_validation, 06_conclusion |
| 18 | Validation scoring 항목 카테고리 그룹화 | R3 | Minor | 9개 항목을 3개 카테고리로 구조화 | 05_system_validation |
| 19 | LangChain/LlamaIndex 의도적 제외 이유 명시 | R2 | Minor | S2에 1-2문장 추가 | 02_related_work |
| 20 | 하이픈 일관성 통일 | R3 | Minor | 복합 수식어 하이픈 규칙 통일 적용 | 전체 |

## 다음 리비전에서 확인할 것

1. **참고문헌 보강 완료 여부**: guardrails, hallucination, enterprise AI, agent survey 등 최소 6-8편 추가 후 총 20편 이상 확보되었는지 확인
2. **Manifest 중복 제거 확인**: 03_method와 04_data 간 필드 목록 중복이 해소되었는지, Conclusion 열거가 축약되었는지 확인
3. **Boundary 주장 표현 완화 확인**: 6건의 대안 표현이 적용되었는지, 특히 단일 사례 일반화(05_valid:95, 06_conclusion:9)가 case study 수준으로 완화되었는지 확인
4. **Discussion 보강 확인**: ceiling effect 해석, claim 수 편차 논의, 선행 연구 비교가 추가되었는지 확인
5. **용어 일관성 확인**: 5개 용어 그룹이 정식 표현으로 통일되었는지 전체 검색으로 확인
6. **Table/Figure placeholder**: 현재 의도적으로 비워둔 표/이미지 자리가 투고 전 채워졌는지 확인
