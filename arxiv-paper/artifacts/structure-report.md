# Structure Report

생성일: 2026-05-16
리뷰 대상:
- `main.tex`
- `sections/01_introduction.tex` ~ `sections/08_appendix_scenarios.tex`
- `notes/current_paper_strategy.md` (claim 경계 확인용, 분석 대상은 아님)

리뷰어: structure-analyst (paper-review-orchestrator → structure-review)

논문 정체성: arXiv 카테고리 `cs.SE` (cross-list `cs.AI`, `cs.CL`) 타겟의 method/demo 논문. enterprise LLM 에이전트의 prototype → traceable harness 전환을 다룸. safe/unsafe claim 경계는 `notes/current_paper_strategy.md`를 따름.

---

## 1. 섹션 분량

LaTeX 줄 수는 `wc -l` 기준이며, "본문 줄"은 figure/table 환경(`\begin{figure}...\end{figure}`, `\begin{table}...\end{table}`, `\begin{longtable}...\end{longtable}`)과 캡션 매크로를 제외한 산문 줄 추정치. 단락이 한 줄에 길게 들어가는 LaTeX 관례 때문에 줄 수는 본문 비율의 거친 추정치이며, 실제 PDF page 분량과 다를 수 있다는 점에 주의.

| 섹션 | 파일 | 줄 수 | 비율 | 본문 줄 (figure/table 제외) | 비고 |
|------|------|-------|------|-----|------|
| Introduction | `01_introduction.tex` | 10 | 1.8% | 10 | 4개 단락, figure/table 없음. 단락 자체는 길어 PDF에서 약 0.9~1.0p 차지 추정 |
| Related Work | `02_related_work.tex` | 24 | 4.4% | 24 | 6개 paragraph 환경. 줄 수상 5% 미만 — SKILL.md 극단 임계의 경계 |
| Method | `03_method.tex` | 73 | 13.4% | 약 39 | figure 1개 (architecture), table 1개 (trace contract). 6개 subsection |
| Data and Knowledge | `04_data_and_knowledge_base.tex` | 116 | 21.4% | 약 41 | figure 2개, table 3개. 표 중심 |
| System Validation | `05_system_validation.tex` | 122 | 22.5% | 약 35 | figure 1개, table 4개. 표 중심 |
| Discussion | `06_discussion.tex` | 22 | 4.1% | 22 | 본문만. **5% 미만 — 극단 임계 위반** |
| Conclusion | `07_conclusion.tex` | 8 | 1.5% | 8 | 본문만. 매우 압축됨 |
| Appendix | `08_appendix_scenarios.tex` | 168 | 30.9% | 약 30 | longtable 3개 + figure 1개. 본문은 거의 표 도입문 |
| **합계** | — | **543** | 100% | — | — |

**관측:**

- **본문(non-appendix) 합계 375줄, 약 69%.** Appendix가 31%지만 거의 전부 longtable이라 실제 산문 부담은 적음.
- **Discussion (4.1%)이 SKILL.md "5% 미만" 극단 임계를 위반.** Validation 결과 22.5%를 받쳐주기에는 해석·한계 논의가 얇음. contribution-validation 매핑에서도 이 얇음의 영향이 드러남.
- **Related Work (4.4%)도 5% 임계 근접.** paragraph 6개로 영역 커버 자체는 됨. PDF에서는 한 페이지 이상 가능성.
- 한 섹션이 40%를 초과하는 사례는 없음. Validation (22.5%) · Data (21.4%) · Appendix (31%) 세 축이 표 중심으로 비대해진 전형적 systems paper 패턴.
- Introduction + Conclusion 합 3.3%로 매우 짧음. cs.SE 관례상 허용 범위이나 contribution을 4개 선언한 도입부치고는 후속 매핑 부담을 키움.

---

## 2. Contribution-Validation 매핑

Introduction 마지막 단락(`01_introduction.tex:9`)에서 추출한 4개 contribution:

> "The paper contributes
> (C1) a harness-engineering method for reconstructing prompt-dominant enterprise LLM prototypes into traceable LLM-agent architectures;
> (C2) a source-to-claim knowledge pipeline that separates raw documents, evidence records, runtime-eligible claims, maintained wiki context, and user-facing answers;
> (C3) a replaceable composition boundary that separates deterministic harness control from LLM phrasing;
> (C4) a system-level validation design for checking traceability, routing, prompt-to-code migration, internal-output leakage prevention, runtime-interface behavior, and latency."

Abstract(`main.tex:101`)는 contribution 4개를 enumerate하지 않고 method + 결과로 압축. Introduction은 4개를 enumerate — 후술 Gap §3.2 G3 참조.

| # | Contribution | Method 대응 | Validation 대응 | Discussion 대응 | Gap |
|---|-------------|-------------|-----------------|-----------------|-----|
| C1 | Harness-engineering method (prompt → traceable architecture 전환) | §3.1 Architecture Overview (`03_method.tex:5-16`) + Figure 1 harness architecture | §5.2 Scenario Contract Outcomes (`05_system_validation.tex:35-66`) — 30/30 pass가 harness 통합 동작의 증거 | §6.1 Engineering Interpretation (`06_discussion.tex:7-12`) "unit of control from prompt instructions to versioned engineering artifacts" | 없음 — 가장 잘 매핑됨 |
| C2 | Source-to-claim knowledge pipeline | §3.2 Source-to-Claim Pipeline (`03_method.tex:18-22`) + §3.3 Knowledge Layer (`03_method.tex:24-28`) + §4 전체 | §5.2 — Claim refs 109/109 pass가 pipeline integrity 증거 (`05_system_validation.tex:50-56`) | §6.2 Productization Implications (`06_discussion.tex:16-21`) — onboarding 절차로 간접 언급 | 약함 — fault injection(§5.3)이 `samsung-sbc-020` 제거 1건만 다룸. 5개 corporate group 간 promotion rate 차이 (Samsung 36 vs Hyundai/LG 15)의 해석 없음. Discussion이 짧아 limitation 누락 |
| C3 | Replaceable composition boundary (deterministic harness vs LLM phrasing) | §3.5 Reference Implementation (`03_method.tex:36-41`) — "treats composition as a replaceable boundary" 명시 | **직접 검증 없음.** 모든 latency·scenario 결과는 deterministic composer 단독 측정. `05_system_validation.tex:96` "live-LLM provider latency is outside this comparison"로 명시적 제외 | §6.1 끝부분에서 "prompts still guide language behavior, while the surrounding architecture..."로 간접 언급 | **강한 gap.** boundary가 "replaceable"이라 주장하지만 (a) live LLM attach 시 contract pass 여부, (b) fallback 경로가 trigger되는 조건 어느 것도 보여주지 않음. C3는 사실상 "design claim"이며 validation evidence 부재. 리뷰어 공격 포인트 1순위 |
| C4 | System-level validation design (6개 차원: traceability, routing, prompt-to-code migration, leakage, runtime-interface, latency) | §3.6 Validation and Trace Contracts (`03_method.tex:43-49`) + Table 1 (trace contract) | §5.2 (traceability, routing, leakage, answer structure) + §5.3 fault injection (validator sensitivity) + §5.4 (runtime-interface, latency) | §6.1 implications #1·#2·#3 (`06_discussion.tex:11`) | **부분 gap: "prompt-to-code migration"이 6개 차원 중 직접 측정되지 않음.** Method §3.3 마지막 줄(`03_method.tex:28`)에서 "direct measurement of prompt-complexity reduction is left to later work"라고 자인. Introduction 약속과 Method 자가-deferral 충돌 |

**핵심 발견:**

- C1, C4의 4개 하위 차원은 단단히 매핑됨.
- **C3 (replaceable composition boundary)는 design claim에 머무름.** Method에서 design을 진술하고 "future live-LLM comparisons can be reported as separate traces"라고 future work로 미룸. Validation에서 한 번도 측정되지 않음.
- **C4 안의 "prompt-to-code migration"은 자가-deferred.** Method §3.3에서 "direct measurement ... is left to later work"라고 명시했는데, Introduction은 "system-level validation design for checking ... prompt-to-code migration"으로 contribution화. 약속과 자인 충돌.
- **Abstract와 Introduction의 contribution 수 불일치.** Abstract는 contribution을 명시 enumerate하지 않고 Introduction은 4개 enumerate.

---

## 3. 논리 흐름 분석

### 3.1 잘 연결된 부분

- **Related Work → Method 전이.** §2 마지막 paragraph "System validation and evaluation"(`02_related_work.tex:23`)이 RAG evaluation 한계와 fixed scenario 접근의 정당성을 깔고, §3.6 Validation and Trace Contracts(`03_method.tex:43-49`)에서 곧바로 구현 가능한 contract 목록으로 변환. 인용 정합성 좋음.
- **Method §3.2 → Data §4 → Validation §5.2 흐름.** claim promotion 정의(`03_method.tex:20-22`) → 113 claim 규모 보고(`04_data_and_knowledge_base.tex:115`) → 109/109 claim refs 결과(`05_system_validation.tex:50-56`)로 source-to-claim pipeline end-to-end 추적이 끊김 없음.
- **Method Table 1 (runtime trace contract) → Validation §5.2 결과 테이블의 컬럼 헤더.** Trace, Answer, Hygiene 컬럼이 Method에서 정의한 5개 stage와 일관 매핑.
- **Discussion §6.2 "professional investment-analysis usefulness is a later evaluation layer"(`06_discussion.tex:19`)는 strategy 노트의 unsafe-claim 경계를 정확히 지킴.** Conclusion `07_conclusion.tex:7`의 future-work 문구도 같은 경계 유지.
- **Appendix §A1 question design table → §5.2 결과 테이블 연결.** `08_appendix_scenarios.tex:1`이 "30 fixed validation questions underlying \Cref{tab:validation-results}"라고 명시적으로 잠금.

### 3.2 Gap 또는 비약

- **G1 [강함] C3 "replaceable composition boundary"의 validation 부재.** `03_method.tex:39-41`에서 "treats composition as a replaceable boundary"라고 design claim을 두고, `05_system_validation.tex:96`에서 "The measurements use the deterministic composer; live-LLM provider latency is outside this comparison"으로 명시 제외. 리뷰어가 "어떻게 replaceable인가?"를 물으면 답할 evidence 없음. Discussion에서도 한계로 다뤄지지 않음.
- **G2 [강함] "prompt-to-code migration" contribution과 Method의 자가-deferral 충돌.** Introduction(`01_introduction.tex:9`)이 C4 항목으로 "prompt-to-code migration"을 enumerate하지만, `03_method.tex:28`이 "direct measurement of prompt-complexity reduction is left to later work"라고 자인. 약속과 자인 충돌 — Introduction 표현 완화 또는 간접 evidence(LOC, prompt token 길이 등) 1개 첨부 필요.
- **G3 [중간] Abstract와 Introduction의 contribution 수 불일치.** Abstract(`main.tex:100-102`)는 contribution을 enumerate하지 않고 결과만 서술. Introduction(`01_introduction.tex:9`)은 4개 enumerate. 일치 의무는 없지만 리뷰어가 "abstract에 contribution 요약이 없다"고 지적 가능.
- **G4 [중간] §5.2 결과 테이블의 "Claim refs" 총계 109 ≠ §4의 113.** `05_system_validation.tex:50-56` 총계는 25+30+20+20+14 = 109. `04_data_and_knowledge_base.tex:115`는 "manifests currently contain 113 source-backed runtime claims". 한 쪽은 manifest 총량, 한 쪽은 scenario expected references라 다른 개념이지만 본문이 명시적으로 구별하지 않음. §5.2 footnote에 "expected references drawn from the 113-claim manifest" 한 줄 명시 권장.
- **G5 [중간] Discussion이 fault-injection·latency·runtime-interface의 한계를 다루지 않음.** §6.1 implications 3가지(`06_discussion.tex:11`)는 모두 "what worked"만 기술. (a) fault injection 7건의 single-field mutation 한정, (b) latency 측정이 deterministic composer 기반, (c) live API smoke test가 "interface wiring and artifact hygiene"에만 제한된 점이 한계로 인정되지 않음. strategy 노트의 unsafe-claim 경계를 지키려면 Discussion이 한계를 적극 인정해야 안전함.
- **G6 [경미] §1 → §2 전이의 cushion 부족.** §1 마지막 단락이 4-contribution enumeration으로 끝나고 곧바로 §2의 Related Work 시작. cs.SE 일부 venue는 §1 끝 roadmap("Section 2 reviews ... Section 3 presents ...")을 요구.
- **G7 [경미] Conclusion이 contribution 4개를 재요약하지 않음.** `07_conclusion.tex:3`은 단일 contribution으로 압축. C2·C3·C4 각각 재언급 없음. 8줄 짧은 결론이라 자연스럽지만, 4-contribution promise를 가진 Introduction과 대칭성 약함.

### 3.3 반복/중복

- **R1 [경미] "harness/control layer" 정의가 Introduction(`01_introduction.tex:7`), Method §3.1(`03_method.tex:5`), §3.6(`03_method.tex:43-49`) 세 곳 반복.** 핵심 개념이라 의도된 반복으로 보임. 다만 §3.1과 §3.6의 정의가 거의 동일한 표현 ("source eligibility, routing, claim, answer contract, trace, validation")으로 4회 가까이 등장 — 1번은 압축 또는 cross-reference로 대체 가능.
- **R2 [경미] "insight-first" 답변 contract가 Method §3.4(`03_method.tex:34`), Validation §5.2(`05_system_validation.tex:68`), Appendix(`08_appendix_scenarios.tex:101-105`)에서 반복 설명.** 각 위치에서 역할이 다름(정의, 결과, 예시)이라 합리적.
- **R3 [경미] "deterministic composer" 언급이 Method §3.5와 Validation §5.4(`05_system_validation.tex:96`)에서 거의 동일한 disclaimer로 등장.** Validation에서는 한 번의 cross-reference로 대체 가능.
- **R4 [경미] Appendix Table A1 (question design)과 Table A3 (visible-answer signals)이 corporate group별 차이를 두 번 정리.** 의도된 분리(설계 vs 결과 예시)지만 longtable 2개의 가치를 리뷰어가 따져볼 수 있음.

---

## 4. 개선 권고

| 우선순위 | 섹션 | 권고 | 이유 |
|----------|------|------|------|
| **P0 (high)** | §3.5 + §5 또는 §6 | C3 (replaceable composition boundary)의 minimal validation 1건 추가, 또는 contribution 문구를 "design pattern" 수준으로 완화. 가장 가벼운 해법: §5에 "Composition Boundary Substitution" 1-paragraph 서브섹션을 추가해서 (a) deterministic composer로 contract pass, (b) live-LLM attach 시 contract pass 또는 fallback이 trigger되는 1~2개 trace 샘플 제시 | C3는 4개 contribution 중 가장 약한 매핑(`Validation 대응` 칼럼 비어 있음). `03_method.tex:39-41` design claim, `05_system_validation.tex:96` 명시적 제외. 리뷰어 공격 포인트 #1 |
| **P0 (high)** | §1 last paragraph + §3.3 | "prompt-to-code migration"의 약속과 자인 충돌 해결. 옵션 A: `01_introduction.tex:9`의 C4 항목에서 "prompt-to-code migration" 문구를 "code-owned routing and contract artifacts"로 다듬어 measurement 약속이 아닌 design 진술로 완화. 옵션 B: §3.3에 LOC 또는 prompt-token 길이 비교 1줄 표 추가하고 `03_method.tex:28`의 "left to later work" 문장 수정 | 동일 논문 안에서 contribution promise(`01_introduction.tex:9`)와 method-section 자가-deferral(`03_method.tex:28`) 충돌. 리뷰어가 가장 잘 잡아내는 일관성 결함 |
| **P1 (med)** | §6 Discussion 전체 | §6.1 implications 3가지(`06_discussion.tex:11-12`) 뒤에 limitations subsection 1개 추가. 최소: (a) fault injection 7건이 single-field mutation 한정, (b) latency가 deterministic composer 기반이며 live-LLM 비용 제외, (c) 30 scenario가 reproducibility baseline이며 user-impact 평가가 아님 | Discussion 분량 4.1% — 5% 임계 위반. strategy 노트의 unsafe-claim 경계 ("system improves investment decisions" 등)를 지키려면 Discussion이 한계를 적극 인정하는 것이 방어. 현재는 한계 인정 없이 implication만 나열 |
| **P1 (med)** | §5.2 본문 또는 footnote | "Claim refs" 109와 §4의 113 manifest 총량을 명시적으로 구별. `05_system_validation.tex:62`의 minipage footnote 끝에 "expected references are drawn from the 113-claim manifest reported in §4" 한 문장 추가 | G4 — 두 숫자 차이가 본문 어디에도 명시 설명되지 않음. 리뷰어/reproducer가 "왜 113이 109가 되었나?"를 물을 가능성 큼 |
| **P2 (low)** | §1 마지막 단락 | 4-contribution enumeration 뒤에 1~2문장 roadmap 추가: "Section 2 reviews related work; Section 3 introduces the harness architecture; Section 4 describes the data slice; Section 5 reports system validation; Section 6 discusses productization." | G6 — IMRaD 흐름 시작에서 reader signposting 부재. 분량 부담은 1줄 |
| **P2 (low)** | §7 Conclusion | 8줄 conclusion에 C2·C3·C4 각각의 한 줄 재요약 추가 (5~6줄 증가). 또는 Introduction의 4-contribution을 3개로 압축해 대칭 회복 | G7 — Introduction이 4 contribution을 약속했으나 Conclusion은 단일 압축으로 끝남 |
| **P3 (info)** | §3 Method | `03_method.tex:5-7`과 `03_method.tex:43-44`의 거의 동일한 "harness defines X, Y, Z" 진술 중 한 곳을 cross-reference로 압축. 또는 §3.1을 architecture 그림 + 2문장으로 압축하고 정의는 §3.6에서만 | R1 — 동일 정의 4회 반복. 분량 1~2줄 회복 |
| **P3 (info)** | Abstract | `main.tex:100-102`에 1문장 contribution summary 추가 ("The contributions are a harness-engineering method, a source-to-claim pipeline, a replaceable composition boundary, and a system-level validation design.") | G3 — Abstract와 Introduction contribution promise 일치는 cs.SE 리뷰어가 빠르게 검사하는 항목. 1문장으로 해결 |

---

## 부록: 분석 메모

- **Strategy 노트와의 정합성:** safe claims 6개 모두 본문에서 underclaim 또는 정확히 표현됨. unsafe claims 5개 모두 명시 회피됨 (`06_discussion.tex:19` "professional investment-analysis usefulness is a later evaluation layer", `07_conclusion.tex:7` future work). 구조 차원에서 strategy 위반은 발견되지 않음. 단 §6 분량 부족이 unsafe-claim 경계 방어를 약화할 잠재 위험.
- **arXiv 카테고리(cs.SE) 적합성:** 구조상 systems paper IMRaD 변형으로 적합. Method가 architecture 중심, Validation이 contract 중심으로 cs.SE 관례와 부합. cs.AI cross-list 정당성은 §2 "LLM agents and orchestration", §3.5 "replaceable composition boundary"에서 확보. cs.CL은 다소 약하지만 abstract LLM 언급으로 최소 정당성 있음.
- **Figure/table 균형:** 본문 figure 4개 (`fig:harness-architecture`, `fig:ui-mobile-main`, `fig:source-to-claim`, `fig:ui-mobile-answer`) + table 6개. Validation에 table 4개 집중은 무겁지만 cs.SE 관례 내. Appendix longtable 3개는 reproducibility 자료 성격이라 합리적.
