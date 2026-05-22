# Claim Audit Report

생성일: 2026-05-16
대상: arXiv v1 직전 최종 점검 (main.tex + sections/01–07 + Disclosures, 부록 08은 보조 확인)
기준: `notes/current_paper_strategy.md` (2026-05-09)

---

## 1. Safe / Unsafe 기준 요약 (strategy 문서)

### Safe Claims (요약)
- (S1) Prompt-heavy enterprise PoC를 traceable source-backed agent architecture로 재구성한다는 방법론적 주장.
- (S2) 5개 corporate group × 5개 listed company = 25개 reference slice. 그룹 선정은 2026 FTC 공식 designation 결과, affiliate 선정은 first-slice policy.
- (S3) Runtime manifests에 **113 source-backed claims**, 25-claim review-approved layer 보유.
- (S4) Frozen scenario contract checks, referential-integrity checks, **live API smoke tests, live answer-quality smoke tests, answer-inspection packet** 가 **system-level evidence** 로서 가용.
- (S5) Electronics paper는 선행 simultaneous deployment 연구로 연결, 본 논문은 enterprise hardening / traceable productization 방향으로 확장.
- (S6) ElizaOS는 system reference로만 인용 가능 (financial-domain baseline 아님).

### Unsafe Claims (그대로 인용)
- (U1) **The system is commercially ready.**
- (U2) **The system improves investment decisions.**
- (U3) **The system provides formal investment advice.**
- (U4) **The answer-inspection packet proves answer usefulness or expert acceptance.**
- (U5) **Live API smoke tests prove long-run production reliability.**

---

## 2. 주장-근거 대조표

표기 규칙:
- 위치: `파일:라인`, 라인은 grep -n 기준
- 분류: **Safe** / **Boundary** / **Unsafe**
- 근거 강도: 직접 / 간접 / 근거 없음

| # | 위치 (파일:라인) | 주장 원문 (영어) | 분류 | 근거 위치 | 근거 강도 | 비고 |
|---|---|---|---|---|---|---|
| 1 | main.tex:101 (abstract) | "We present a harness-engineering approach that reconstructs this prototype pattern into a traceable LLM-agent architecture." | Safe | 03_method.tex §3.1–§3.6 전반, fig:harness-architecture | 직접 | S1과 정합. |
| 2 | main.tex:101 (abstract) | "We apply the approach to a public-data reference slice of five Korean corporate groups, 25 listed companies, and 113 source-backed runtime claims." | Safe | 04 §4.1 Table tab:reference-slice-selection, 04 line 115 ("113 source-backed runtime claims") | 직접 | S2·S3과 정합. |
| 3 | main.tex:101 (abstract) | "The baseline passes 30/30 fixed validation-scenario contract checks" | Safe | 05 Table tab:validation-results (Total 30/30) | 직접 | 양호. |
| 4 | main.tex:101 (abstract) | "a separate 14-scenario runtime check shows that orchestration and caching reduce mean measured latency from 2008.57ms to 171.14ms." | Safe | 05 Table tab:latency-results | 직접 | abstract가 "reduce mean *measured* latency"로 한정한 점 양호. |
| 5 | main.tex:101 (abstract) | "a reusable pattern for turning exploratory enterprise LLM prototypes into auditable and extensible applications governed by engineering artifacts as well as prompt text." | Safe (≈Boundary) | 03 §3 + 06 §6.1–§6.2 | 간접 | "reusable pattern"은 1개 case study에서 유도되지만 strategy의 method-paper framing과 정합. 본문 다른 곳에서 "reusable"이 강한 일반화로 반복되지 않으므로 통과. |
| 6 | main.tex:115 (Disclosures) | "The system is designed for traceable briefing and source inspection, with investment-advice and investment-performance evaluation outside the study scope." | Safe (Guard) | 자체 진술 (포지셔닝 가드) | 직접 | Unsafe claim 경계를 명시적으로 보호. 매우 양호. |
| 7 | 01_introduction.tex:3 | "Productization introduces a different requirement: each visible claim should be traceable to bounded sources, routed to the correct entity, regenerated under the same assumptions, and inspected through explicit artifacts." | Safe | 인용 ji2023hallucination, martinezfernandez2022seai, kreuzberger2023mlops | 간접 | 일반적 productization 요구사항 진술. |
| 8 | 01_introduction.tex:5 | "The motivating prototype was developed during a ten-week AI leadership program hosted by CEOAI" | Safe | citation ceoai2026leadership | 간접 | strategy 포지셔닝과 일치. |
| 9 | 01_introduction.tex:5 | "the authors built and demonstrated over ten exploratory AI product prototypes for executive- and client-facing scenarios" | Safe (Boundary) | 자체 진술 + citation replit2026platform | 근거 없음 (정확한 수 "over ten"에 대한 외부 근거 없음) | 본 문장은 배경 진술이라 약하게 통과하지만, "over ten"의 정확성은 본문 내 표·인용으로 입증되지 않음. 외부 검증 가능한 표현으로 다듬을 여지 있음 (예: "multiple"). |
| 10 | 01_introduction.tex:7 | "We propose a harness-engineering approach for converting a demonstration prototype into a traceable research system." | Safe | 03 method 전반 | 직접 | S1. |
| 11 | 01_introduction.tex:9 | "The paper contributes a harness-engineering method ... a source-to-claim knowledge pipeline ... a replaceable composition boundary ... and a system-level validation design ..." | Safe | 03 §3.1–§3.6 (architecture, source-to-claim, replaceable composition, validation contracts) + 05 §5 전반 | 직접 | 4가지 contribution 모두 후속 섹션에 1:1 매핑됨. |
| 12 | 01_introduction.tex:9 | "We instantiate the method on a bounded public-data slice of five Korean corporate groups, 25 listed companies, and 113 source-backed runtime claims." | Safe | 04 §4.1, 04 line 115 | 직접 | S2·S3. |
| 13 | 02_related_work.tex:9 | "The present paper shifts the emphasis from multi-platform deployment to enterprise hardening: each answer must record which sources, tools, claims, and fallback paths shaped the final output." | Safe | 03 method, 05 validation | 직접 | S5와 정합. |
| 14 | 02_related_work.tex:11 | "The proposed control layer is complementary to these frameworks ... In deployment, it can surround a LangGraph, CrewAI, AutoGen, or LangChain-agent workflow." | Boundary | 인용 langchain2026agents, langchain2026langgraph, wu2024autogen, crewai2026software | 간접 (가능성 진술) | "can surround"는 가능성 진술이나, 본 논문에서 실제로 LangGraph/CrewAI/AutoGen/LangChain을 surround하는 실험은 보고되지 않음. **대안 표현 제안**: "is intended to be composable with"로 약화하거나, "no integration experiment is reported in this paper"를 한 문장 추가. |
| 15 | 02_related_work.tex:17 | "Our contribution is to apply the programming-oriented philosophy at the product-architecture level ..." | Safe | 03 method §3.2–§3.4 | 직접 | S1. |
| 16 | 02_related_work.tex:23 | "The present paper uses system validation suited to a pre-commercial research prototype before customer logs are available." | Safe (Guard) | 자체 포지셔닝 | 직접 | "pre-commercial research prototype" 표현이 U1 경계를 명시적으로 회피. |
| 17 | 03_method.tex:16 | "The runtime returns a reader-facing answer and an audit trace." | Safe | fig:harness-architecture, Table tab:runtime-trace-example | 직접 | |
| 18 | 03_method.tex:22 | "The model may use source-backed claims as bounded context; related documents require claim promotion before they authorize factual statements." | Safe | 03 §3.2, 04 §4.2 | 직접 | |
| 19 | 03_method.tex:28 | "The prompt-to-code migration is intended to reduce the burden on the model and make diagnostic boundaries easier to locate; direct measurement of prompt-complexity reduction is left to later work." | Safe (Self-bounded) | 자체 진술 + 한정 | 직접 (한정구) | 미측정을 명시적으로 한정 — 매우 양호. |
| 20 | 03_method.tex:39 | "The baseline reported in the paper uses a deterministic, schema-checked composer for fixed validation scenarios and runtime-interface tests." | Safe | 05 §5 전체 | 직접 | |
| 21 | 03_method.tex:41 | "The architecture treats composition as a replaceable boundary." | Safe | 03 §3.5 본문 | 직접 | |
| 22 | 03_method.tex:47 | "Language checks enforce the insight-first answer structure and block recommendation-style phrasing such as buy, sell, or target-price instructions." | Safe (Guard) | 03 §3.6 자체 진술 | 직접 | U2·U3 회피를 명시적으로 구현. |
| 23 | 04_data_and_knowledge_base.tex:8 | "The corporate-group boundary follows the 2026 ranking by fair-value assets in the official Fair Trade Commission designation results: Samsung, SK, Hyundai Motor, LG, and Hanwha form the top-five corporate-group set after Hanwha entered fifth place." | Safe | citation ftc2026businessgroups | 간접 | S2와 정합. |
| 24 | 04_data_and_knowledge_base.tex:8 | "The ranking provides a reproducible sampling rule for the reference slice, independent of investment-quality assessment." | Safe (Guard) | 자체 한정 | 직접 | U2 회피. |
| 25 | 04_data_and_knowledge_base.tex:39 | "Sources include issuer IR materials, earnings presentations, annual and periodic filings, governance documents, public filing URLs, market-data interfaces, and news-search interfaces." | Safe | citations opendart2026api, krx2026openapi, naver2026newssearch | 간접 | |
| 26 | 04_data_and_knowledge_base.tex:115 | "The five-corporate-group manifests currently contain 113 source-backed runtime claims. A compact 25-claim review-selected reference layer ..." | Safe | 자체 manifest + Table tab:data-artifacts (36+27+15+15+20 = 113) | 직접 | 36+27+15+15+20=113 산술 검증 OK. S3와 정합. |
| 27 | 05_system_validation.tex:8 | "The scenario questions are product-facing briefing prompts, not expert-approved investment recommendations." | Safe (Guard) | 자체 한정 | 직접 | U3·U4 회피. |
| 28 | 05_system_validation.tex (Table 5) | "Total 30/30 ... 109/109 ... 60/60 ... Failed 0" | Safe | Table tab:validation-results 본체 (5×6=30 OK; 25+30+20+20+14=109 OK; 5×12=60 OK) | 직접 | 산술 검증 OK. **단, abstract·sec.04에서 언급한 "113 source-backed runtime claims"와 이 표의 "109/109 claim refs"는 서로 다른 단위 (전체 manifest claim 수 vs. 30개 시나리오에서 호출되는 expected claim reference 수). 본문에 두 수의 관계를 명시한 문장이 없어 독자에게 혼동을 줄 수 있음.** 사실 자체는 양립 가능하나 설명 추가 권장. |
| 29 | 05_system_validation.tex:66 | "Within the bounded reference slice, all configured source, trace, answer, and output-hygiene contracts passed." | Safe (Boundary) | Table tab:validation-results | 직접 | "within the bounded reference slice"라는 한정구가 있어 안전. 양호. |
| 30 | 05_system_validation.tex:72 | "when key contract properties are deliberately broken, the corresponding validators fail the run." | Safe | Table tab:fault-injection-results + tab:fault-injection-protocol (부록 A4) | 직접 | |
| 31 | 05_system_validation.tex:94 | "Runtime interface checks passed 5/5 live API corporate-group connectivity checks and 15/15 live answer-hygiene checks, with inspection packets generated for all 15 runtime samples. These checks verify interface wiring and artifact hygiene." | Safe (Guard) | 자체 진술 + S4 | 근거 없음 (paper 내부에 5/5, 15/15 표 미존재) | **수치 자체에 대한 표·도표 근거가 본문에 없음.** strategy S4는 이런 evidence의 *가용성*을 인정하지만, 본문 표/도표로 surface된 것은 30/30·109/109·60/60·7/7·14 latency뿐. 마지막 문장 "These checks verify interface wiring and artifact hygiene"는 U5 ("prove long-run production reliability")를 명시적으로 회피하므로 표현은 안전. **보완 방향**: 부록에 5/5·15/15·15 packets에 대한 1줄 evidence pointer (artifact 파일 경로) 추가, 또는 본 문장을 자체 진술로 두되 "interface wiring and artifact hygiene" 한정을 유지 (현재대로 유지해도 가까스로 안전). |
| 32 | 05_system_validation.tex:96 | "mean latency decreased from 2008.57ms to 171.14ms, and the number of runs under the fixed 1500ms engineering budget increased from 2/14 to 13/14." | Safe | Table tab:latency-results | 직접 | |
| 33 | 05_system_validation.tex:96 | "The measurements use the deterministic composer; live-LLM provider latency is outside this comparison." | Safe (Guard) | 자체 한정 | 직접 | 양호. |
| 34 | 05_system_validation.tex:96 | "These results show that the same answer contract can be preserved while the runtime moves from static artifacts toward live source interfaces and optimized orchestration." | Safe (Boundary) | 05 §5.4 + Table tab:validation-results | 간접 | "can be preserved"는 가능성 진술. **단, latency optimization 실험과 30/30 contract pass는 별도 시행이므로 "answer contract가 14 latency 시나리오에서도 보존됐다"는 직접 측정이 본 문장으로부터는 자명하지 않음.** 14 latency 시나리오에서 contract gate도 통과했음을 한 문장 추가하면 더 강해짐. |
| 35 | 06_discussion.tex:8 | "This approach is complementary to prompt engineering: prompts still guide language behavior, while the surrounding architecture assigns ownership for evidence boundaries, entity scope, output structure, leakage prevention, and inspection." | Safe | 03 + 05 | 간접 | |
| 36 | 06_discussion.tex:12 | "First, the fixed validation-scenario runs show that expected source, routing, trace, and answer-structure contracts were preserved across the reference slice. Second, the fault-injection results show that the validators detected deliberately broken ... conditions. Third, the latency result shows that orchestration and caching improved runtime behavior and preserved the answer contract." | Safe | Table tab:validation-results, tab:fault-injection-results, tab:latency-results | 직접 | "preserved the answer contract" 문장은 #34 보완과 함께 한 번에 처리 가능. |
| 37 | 06_discussion.tex:12 | "The latency result is an operational signal; the broader contribution is the architecture-level separation of sources, claims, routing, answer contracts, traces, and validation gates." | Safe (Guard) | 자체 한정 | 직접 | U5 회피 ("operational signal", not "production reliability"). |
| 38 | 06_discussion.tex:17 | "For productization, the main implication is that a new enterprise target can be onboarded as a source and claim package governed by the same control layer." | Safe (Boundary) | 03 + 04 (manifest/claim 구조) | 간접 (한 case study에서 일반화) | "can be onboarded"는 가능성 진술. 1개 case study에서 추론된 일반화이나 strategy의 "method paper" framing과 정합. 본문에 "Public or client-approved sources must be registered ..." 한정구가 같은 문단에 있어 양호. |
| 39 | 06_discussion.tex:19 | "The same structure also separates system readiness from investment-analysis usefulness. ... Professional investment-analysis usefulness is a later evaluation layer that requires expert review and deployment evidence." | Safe (Guard) | 자체 한정 | 직접 | U2·U4 회피 — 매우 양호. |
| 40 | 06_discussion.tex:21 | "The reproducible layer consists of scenario JSON files, source and claim manifests, validation scripts, sanitized traces, and fixture or smoke-test modes." | Safe | citation ahnkim2026advisorrepo (placeholder) + 자체 진술 | 간접 | 저장소 URL은 placeholder; 최종 제출 전 교체 필요 (strategy next-tasks와 일치). |
| 41 | 07_conclusion.tex:3 | "This paper has shown how a prompt-dominant enterprise LLM proof-of-concept can be reconstructed as a traceable LLM-agent architecture." | Safe | 03 + 05 | 직접 | |
| 42 | 07_conclusion.tex:5 | "The reference implementation applies the approach to a bounded 25-company public-data slice across five Korean corporate groups." | Safe | 04 §4.1 | 직접 | |
| 43 | 07_conclusion.tex:5 | "The system-level validation checks traceability, routing, migration from prompt rules to code, prevention of internal-output leakage, runtime-interface behavior, and latency." | Safe | 05 §5 전반 | 직접 | "migration from prompt rules to code"는 03 §3.3에 정성적 기술만 있고 정량 측정은 없음 — 03 §3.3에서 명시적으로 "direct measurement ... left to later work"로 한정했으므로 통과. |
| 44 | 07_conclusion.tex:5 | "The latency result is one operational signal; the broader contribution is that enterprise behavior is relocated from an expanding prompt into artifacts that can be inspected, versioned, tested, and extended." | Safe (Guard) | 자체 한정 | 직접 | U5 회피. |
| 45 | 07_conclusion.tex:7 | "Future work can broaden source coverage, add larger runtime ablations and expert review, harden live interfaces, and evaluate whether the briefings support professional investment analysis." | Safe (Guard) | 자체 한정 (future work) | 직접 | "evaluate *whether* the briefings support professional investment analysis"로 미해결 문제임을 명시 — U2·U4 회피. |
| 46 | 07_conclusion.tex:7 | "A subsequent deployment study can compare the submitted baseline against commercialized versions with operational logs and live-LLM runs." | Safe (Guard) | 자체 한정 (future work) | 직접 | "commercialized versions"가 future work로 명시되어 U1 ("commercially ready") 경계 회피. |
| 47 | 07_conclusion.tex:7 | "One lesson from the case study is that enterprise LLM productization combines modeling concerns with systems-engineering concerns: the model must be surrounded by explicit source gates, runtime contracts, validation traces, and inspection surfaces before it is extended in commercial settings." | Safe (Boundary) | 자체 결론 | 간접 (1 case study에서의 lesson) | "One lesson from the case study"라는 명시적 한정구로 일반화가 약화되어 있음. "before it is extended in commercial settings"는 U1 회피와도 정합. 양호. |

---

## 3. 경계 위반 플래그 (Boundary 및 잠재 Unsafe 항목)

| # | 위치 | 원문 (요약) | 위반 유형 | 대안 표현 |
|---|---|---|---|---|
| F1 | 02_related_work.tex:11 (#14) | "it can surround a LangGraph, CrewAI, AutoGen, or LangChain-agent workflow." | 미실증 가능성 진술 — 본 논문에서 surround 실험 없음. Boundary. | "It is intended to be composable with frameworks such as LangGraph, CrewAI, AutoGen, or LangChain agents; integration experiments are not reported in this paper." 정도로 한정. |
| F2 | 05_system_validation.tex:94 (#31) | "Runtime interface checks passed 5/5 live API ... 15/15 live answer-hygiene checks ... inspection packets generated for all 15 runtime samples." | 본문 내 표/도표 근거 부재. strategy S4의 evidence 가용성은 인정되지만 surfacing 미흡. Boundary. | (a) 부록 §A에 1줄 evidence pointer 추가 (예: `evals/results/runtime-smoke-2026-XX-XX.json`), 또는 (b) 수치를 더 약하게 표현: "We additionally exercised live filing, market, and news interfaces; connectivity and answer-hygiene checks generated inspection packets for runtime samples (artifact files in the repository, evals/results/)." |
| F3 | 04_data_and_knowledge_base.tex:115 vs. 05_system_validation.tex Table 5 (#28) | "113 source-backed runtime claims" (manifest 전체) vs. "109/109" (30개 시나리오 expected reference) — 두 수의 차이가 본문에 명시적으로 설명되지 않음. | 단위 혼동 가능. Unsafe는 아니지만 reviewer 트리거 가능. Boundary. | 05 §5.2 첫 단락 끝에 1문장 추가 예시: "The 109 expected claim references in the scenario files are a subset of the 113 source-backed runtime claims described in Section 4; each scenario uses the claim package required by that question, so the per-scenario denominator can be smaller than the full claim layer." |
| F4 | 01_introduction.tex:5 (#9) | "the authors built and demonstrated over ten exploratory AI product prototypes" | "over ten"의 정확성에 외부 근거 없음. Boundary. | "the authors built and demonstrated multiple exploratory AI product prototypes" 또는 정확한 수를 인용 가능한 자료(예: 프로그램 결과물 리스트)와 연결. |
| F5 | 05_system_validation.tex:96 (#34) | "the same answer contract can be preserved while the runtime moves from static artifacts toward live source interfaces and optimized orchestration." | latency 14 시나리오에서 answer contract gate가 동시 통과됐다는 직접 증거 link가 약함. Boundary. | "the 14 latency-paired scenarios continued to pass the answer-contract checks reported in Table~\ref{tab:validation-results}, so latency optimization did not weaken the contract layer." 형태의 cross-reference 한 문장 추가. |

**Unsafe claim 본문 검출: 0건.** Disclosures, §5.1 단락 2, §3.6 (recommendation-style phrasing block), §6.2 (separates system readiness from investment-analysis usefulness), §7 (future work) 등에서 U1–U5 모두 명시적으로 가드되고 있음.

---

## 4. 요약 통계

- **총 추출 주장 수**: 47
- **Safe (Guard 포함)**: 41 (Guard 진술 11건 포함)
- **Boundary**: 5 (F1–F5, 모두 대안 표현 제시됨)
- **Unsafe**: 0
- **근거 없음 (본문 내 직접 근거 부재)**: 2 (F2의 5/5·15/15 수치, F4의 "over ten")
  - F2는 strategy S4에 의해 시스템 차원 evidence로 인정됨 — 본문 surfacing만 보완 필요.
  - F4는 배경 진술이므로 표현 약화로 즉시 해결 가능.

### 우선순위별 권장 작업
1. **(권장)** F3 — 113 vs. 109/109 단위 차이 1문장 설명 추가. (독자 혼동 방지)
2. **(권장)** F2 — 5/5·15/15·15 inspection packet 수치에 대한 artifact pointer 추가, 또는 표현 약화.
3. **(선택)** F1 — "can surround" → "intended to be composable with" 약화.
4. **(선택)** F5 — latency 시나리오와 contract pass 시나리오의 교집합에 대한 cross-reference 추가.
5. **(선택)** F4 — "over ten" → "multiple" 약화.

### Guard 진술 인벤토리 (Unsafe 경계 보호 역할을 하는 본문 문장)
- main.tex:115 Disclosures 전체
- 02_related_work.tex:23 ("pre-commercial research prototype")
- 03_method.tex:28 ("direct measurement ... left to later work")
- 03_method.tex:47 (recommendation-style phrasing block)
- 04_data_and_knowledge_base.tex:8 ("independent of investment-quality assessment")
- 05_system_validation.tex:8 ("not expert-approved investment recommendations")
- 05_system_validation.tex:66 ("Within the bounded reference slice")
- 05_system_validation.tex:94 ("verify interface wiring and artifact hygiene")
- 05_system_validation.tex:96 ("live-LLM provider latency is outside this comparison")
- 06_discussion.tex:12 ("latency result is an operational signal")
- 06_discussion.tex:19 (system readiness ≠ investment-analysis usefulness)
- 07_conclusion.tex:5 ("one operational signal")
- 07_conclusion.tex:7 ("evaluate whether the briefings support professional investment analysis"; "before it is extended in commercial settings")
- 08_appendix_scenarios.tex:8 ("expert-certified investment guidance is outside the scenario definition")

→ 14개의 명시적 가드 진술이 본문 전반에 분산되어 있어 Unsafe claim 경계 방어선이 두텁다. arXiv v1 제출 전 최소 변경으로 충분히 통과 가능한 상태.
