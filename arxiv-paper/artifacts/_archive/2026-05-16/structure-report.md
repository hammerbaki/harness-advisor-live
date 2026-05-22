# Structure Report

생성일: 2026-05-09
리뷰 맥락: arXiv 투고 준비 평가, 핵심 논리 집중

## 섹션 분량

| 섹션 | 파일 | 줄 수 | 비율 | 비고 |
|------|------|-------|------|------|
| Abstract | main.tex (L39-41) | 2 (단일 단락) | - | 핵심 주장을 잘 압축. 범위 한정 명시적 |
| 1. Introduction | 01_introduction.tex | 17 | 6.9% | Contribution 3개 명확. 범위 제한 선언 포함 |
| 2. Related Work | 02_related_work.tex | 28 | 11.3% | 7개 paragraph, positioning 마무리 |
| 3. Method | 03_method.tex | 98 | 39.7% | 8개 subsection + Summary |
| 4. Data and Knowledge Base | 04_data_and_knowledge_base.tex | 79 | 32.0% | 9개 subsection + 1 table |
| 5. System Validation | 05_system_validation.tex | 98 | 39.7% | 7개 subsection + 3 table |
| 6. Discussion | 05_discussion.tex | 40 | 16.2% | 5개 subsection |
| 7. Conclusion | 06_conclusion.tex | 9 | 3.6% | 단일 단락 |

## Contribution-Validation 매핑

| # | Contribution | Method 대응 | Validation 대응 | Discussion 대응 | Gap |
|---|-------------|-------------|-----------------|-----------------|-----|
| C1 | Harness-engineering method: prompt-heavy PoC를 traceable agent system으로 재구성 | 3.1 Problem Setup, 3.5 Prompt-to-Code Migration, 3.6 Runtime Answer Assembly | 5.2 Trace/Routing Checks, 5.3 Insight-First Answer Checks, 5.6 Interpretation | 6.2 What the Harness Improves | 없음. 잘 연결됨 |
| C2 | Source-to-claim knowledge pipeline: raw docs → extraction → claims → wiki → answers | 3.2 Source Manifest Layer, 3.3 Extraction and Claim Promotion, 3.4 LLM Wiki | 5.1 Frozen Scenario Results (claim coverage), Table 1 (data artifacts) | 6.2 Transferability 언급 | 약간 간접적. Validation에서 pipeline 자체의 독립 검증이 아닌 최종 답변 품질로 검증 |
| C3 | System-level validation design: traceability, routing, leakage prevention, latency 등 | 3.7 Validation Gates | 5.1-5.5 전체, Tables 2-4 | 6.1 Reading the Validation Results | 없음. 잘 연결됨 |

## 논리 흐름 분석

### 잘 연결된 부분

1. **Introduction → Method 연결**: 3개 contribution이 Method의 subsection 구조와 1:1 대응. Problem Setup(C1) → Source-to-Claim(C2) → Validation Gates(C3).
2. **Method → Data → Validation 전개**: source-to-claim pipeline이 Data에서 25-company slice로 실체화되고, Validation에서 frozen scenario로 검증되는 순서가 자연스러움.
3. **Scope limitation 일관성**: Abstract, Introduction, Validation, Discussion, Conclusion 전체에서 safe/unsafe 경계가 반복 강조됨.
4. **Validation → Conclusion 연결**: Interpretation의 "harness를 강화해야지 prompt를 늘려서는 안 된다"가 Conclusion의 broader lesson과 직접 연결됨.

### Gap 또는 비약

1. **Discussion 분량 불균형**: Discussion(40줄)이 Validation(98줄) 대비 약 40% 수준. arXiv 기준으로 수용 가능하나, 다음 논의가 부재:
   - Frozen scenario 99.0-99.4점의 ceiling effect 해석 (자체 contract 검증이므로 높은 것이 당연한지)
   - Claim 수의 그룹별 편차(Samsung 36 vs Hyundai/LG 15)가 갖는 의미
   - Latency 최적화 전후 비교에 대한 engineering insight

2. **Conclusion 내 limitations와 Discussion 분리**: Discussion 6.4 Limitations에서 4개 한계를 이미 다루고 있으나, Conclusion에서 다시 요약 없이 끝남. Conclusion이 limitations를 1-2문장으로 참조하면 더 완결적.

3. **C2 (source-to-claim pipeline)의 독립 검증 간접성**: pipeline 자체의 정확성이 아닌 최종 답변 품질로 간접 검증됨. pipeline 단계별 검증(예: claim promotion 정확도)이 있으면 더 강함.

### 반복/중복

1. **Source-to-claim pipeline 설명 반복**: Method 3.2-3.3에서 상세히 설명한 manifest/extraction/claim 과정이 Data 4.2-4.5에서 유사 수준으로 반복. manifest 필드 목록이 양쪽에서 거의 동일.
2. **Scope limitation 반복**: "investment performance를 측정하지 않는다"는 선언이 5회 이상 반복. 방어적 프레이밍이나, arXiv 독자에게는 2-3회면 충분.

## arXiv 투고 준비 상태 평가

**전반 평가: 핵심 논리 관점에서 투고 가능 (Ready with minor revisions)**

**강점:**
- 3개 contribution이 명확하고, Method-Data-Validation에서 빠짐없이 다뤄짐
- Safe/unsafe claims 경계가 일관되게 유지됨. 과장 주장이 없음
- Validation이 자체 시스템 contract 검증으로 정직하게 프레이밍됨
- Related Work가 RAG, agent, programmatic LLM, evaluation 축으로 적절히 배치됨

**우려:**
- C2의 독립 검증 간접성이 리뷰어 질문을 유발할 수 있음
- Scope limitation 반복이 방어적 인상을 줄 수 있음

## 개선 권고

| 우선순위 | 섹션 | 권고 | 이유 |
|----------|------|------|------|
| 1 (높음) | Discussion | validation 점수 해석(ceiling effect), claim 수 편차 의미, latency engineering insight 추가 (10-15줄) | Validation 결과에 대한 비판적 해석이 부족 |
| 2 (높음) | Method / Data | Data 4.2의 manifest 필드 나열을 축약하고 Method 3.2를 참조하도록 변경 | 동일 필드 목록의 중복 |
| 3 (중간) | Conclusion | Limitations를 Discussion 참조로 1-2문장 요약 추가 | 현재 Conclusion이 limitations 없이 끝나 미완결 인상 |
| 4 (중간) | 전체 | Scope limitation 반복을 Abstract + Introduction + Validation 3곳으로 축소 | 5회 반복은 방어적 인상 |
| 5 (낮음) | 파일명 | 05_discussion.tex → 06_discussion.tex, 06_conclusion.tex → 07_conclusion.tex | 같은 번호 공유로 파일 관리 혼동 가능 |
