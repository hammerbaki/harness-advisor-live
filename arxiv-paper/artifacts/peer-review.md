# Peer Review Simulation

생성일: 2026-05-16
대상: *Beyond Prompting: Harness Engineering for Enterprise LLM Agents* (arXiv v1 직전 최종 점검)
기반 리포트:
- `artifacts/structure-report.md` (2026-05-16, structure-analyst)
- `artifacts/claim-audit-report.md` (2026-05-16, claim-auditor)
- `artifacts/citation-report.md` (2026-05-16, citation-scout)
- `artifacts/style-report.md` (2026-05-16, style-editor)
참고 기준: `notes/current_paper_strategy.md` (2026-05-09 — safe/unsafe claim 경계)

본 시뮬레이션은 arXiv `cs.SE` (cross-list `cs.AI`, `cs.CL`) 카테고리를 가정한 3인 리뷰어 패널이다. arXiv는 peer review 없는 프리프린트이지만, 동일 원고가 cs.SE/EMSE 또는 IEEE TSE급 저널 submission 단계에서 받을 수 있는 피드백을 시뮬레이션해 저자가 v1 제출 전·후 어느 시점에 어떤 이슈를 해소해야 할지 가시화한다.

---

## Reviewer 1: 방법론·재현성

**Summary**: 본 논문은 prompt-dominant enterprise LLM PoC를 traceable harness 아키텍처로 재구성하는 명확한 방법론을 제시하고, 30/30 contract pass, 109/109 claim reference resolution, 7/7 fault injection, 14 latency scenario 등 정량 evidence를 일관되게 surface한다. 4개 contribution(C1~C4) 중 C1과 C4의 6개 차원 대부분은 Method-Validation 매핑이 단단하며, claim 경계 방어선이 두텁다(Disclosures + Guard 진술 14개, Unsafe 본문 검출 0건). 다만 **C3 "replaceable composition boundary"는 design claim 수준에 머무르며 validation evidence가 부재**하고, **C4의 "prompt-to-code migration"은 Introduction의 contribution promise(`01_introduction.tex:9`)와 Method의 자가-deferral(`03_method.tex:28`) 사이에 명시적 충돌이 있다**. 두 이슈가 해소되면 arXiv v1 적합성은 충분하며 저널 revision 단계에서도 핵심 방어선이 유지된다.

### Major

1. **[C3 validation 부재 — structure G1 / 개선 권고 P0]** §3.5(`03_method.tex:39-41`)는 "treats composition as a replaceable boundary"라는 design claim을 두지만, §5.4(`05_system_validation.tex:96`)는 "live-LLM provider latency is outside this comparison"으로 명시적 제외한다. 결과적으로 4개 contribution 중 가장 약한 매핑이며, 리뷰어가 "어떻게 replaceable한가?"를 물으면 답할 evidence가 없다. **대응 옵션**: (A) §5에 "Composition Boundary Substitution" 1-paragraph 서브섹션 추가 — deterministic composer와 live-LLM attach 케이스에서 contract pass 또는 fallback trigger 1~2개 trace 샘플 제시. (B) C3 contribution 문구를 "design pattern" 수준으로 완화. arXiv v1은 (B)로도 통과 가능하나 저널 revision에서는 (A) 필요.

2. **[C4 promise vs Method 자가-deferral 충돌 — structure G2 / claim 산술 검증 정합 / 개선 권고 P0]** `01_introduction.tex:9`는 "prompt-to-code migration"을 C4의 6개 검증 차원 중 하나로 enumerate하지만, `03_method.tex:28`은 "direct measurement of prompt-complexity reduction is left to later work"라고 자인한다. 동일 논문 안에서 contribution promise와 method-section deferral이 충돌하는 일관성 결함은 cs.SE 리뷰어가 가장 잘 잡아내는 패턴이다. **대응 옵션**: (A) `01_introduction.tex:9` C4 항목에서 "prompt-to-code migration" 문구를 "code-owned routing and contract artifacts"로 완화. (B) §3.3에 LOC 또는 prompt-token 길이 비교 1줄 표를 추가하고 `03_method.tex:28`의 "left to later work" 문장을 수정. arXiv v1은 (A)가 가벼움.

3. **[Discussion limitations 누락 — structure G5 / 개선 권고 P1]** §6.1(`06_discussion.tex:11-12`)의 implications 3가지는 모두 "what worked"만 기술하며, (a) fault injection 7건이 single-field mutation에 한정된 점, (b) latency 측정이 deterministic composer 기반인 점, (c) 30 scenario가 reproducibility baseline이며 user-impact evaluation이 아닌 점이 한계로 인정되지 않는다. 본문 분량도 22줄(4.1%)로 5% 임계 미만이다. strategy 노트의 unsafe-claim 경계(U1~U5) 방어선을 유지하려면 **Discussion이 한계를 적극 인정하는 것이 가장 안전한 방어**다. 현 상태는 Guard 진술 14개가 분산되어 있어 가까스로 통과하지만, "Limitations" subsection을 1개 추가하는 편이 리뷰 안정성을 크게 높인다.

### Minor

1. **[113 vs 109 단위 차이 미설명 — structure G4 / claim F3]** `04_data_and_knowledge_base.tex:115`의 "113 source-backed runtime claims"(manifest 전체)와 `05_system_validation.tex` Table 5의 "109/109 claim refs"(30개 시나리오 expected reference)는 서로 다른 단위지만 본문이 명시적으로 구별하지 않는다. §5.2 첫 단락 끝 또는 footnote에 1문장 추가 권장: *"The 109 expected claim references are a subset of the 113 source-backed runtime claims in §4; each scenario uses only the claim package required by that question."*

2. **[5/5 · 15/15 · 15 inspection packets 본문 surface 미흡 — claim F2]** `05_system_validation.tex:94`의 5/5 live API + 15/15 answer-hygiene + 15 inspection packet 수치는 strategy S4가 evidence 가용성을 인정하지만 본문 표/도표로 surface된 것은 없다. 마지막 문장 "These checks verify interface wiring and artifact hygiene"가 U5("prove long-run production reliability")를 회피하므로 표현은 안전하나, 부록 §A에 1줄 artifact pointer(예: `evals/results/runtime-smoke-2026-XX-XX.json`) 추가 권장.

3. **[Method 정의 반복 — structure R1]** "harness defines source eligibility, routing, claim, answer contract, trace, validation" 형태의 동일 정의가 `03_method.tex:5-7`과 `03_method.tex:43-44`에서 거의 동일하게 반복된다. 한 곳은 cross-reference로 압축 가능.

4. **["can surround" 미실증 — claim F1]** `02_related_work.tex:11`의 "it can surround a LangGraph, CrewAI, AutoGen, or LangChain-agent workflow"는 본 논문에서 surround 실험이 없으므로 "is intended to be composable with"로 약화하거나 "integration experiments are not reported in this paper"를 한 문장 추가 권장.

5. **[latency-contract 교집합 cross-reference 약함 — claim F5]** `05_system_validation.tex:96`의 "the same answer contract can be preserved while the runtime moves..."는 가능성 진술이며, 14 latency 시나리오가 contract gate를 동시 통과했다는 직접 link가 없다. *"the 14 latency-paired scenarios continued to pass the answer-contract checks reported in Table~\ref{tab:validation-results}"* 형태의 cross-reference 한 문장으로 강화 가능.

### Questions

1. C3의 "replaceable composition boundary"에 대해, deterministic composer를 live-LLM provider로 교체했을 때 (a) trace contract가 통과하는지, (b) language-gate가 fallback을 trigger하는지에 대한 실험 데이터가 사내 artifact로 존재하는가? 존재한다면 1~2개 trace 샘플을 부록에 surface할 수 있는가?
2. §3.3 "prompt-to-code migration"에 대한 LOC, prompt-token 길이, 분기 수 같은 간접 evidence를 1줄 표로 추가할 수 있는가? 가능하다면 C4 promise와 Method deferral의 충돌이 해소된다.
3. 5/5 live API + 15/15 answer-hygiene + 15 inspection packet 수치는 어느 artifact 파일에 기록되어 있는가? 부록 reproducibility pointer로 surface 가능한가?
4. fault injection 7건이 single-field mutation에 한정된 이유 — 설계 제약(scenario 정의)인가, validator sensitivity의 한계인가? Discussion에서 한 문장 명시 가능한가?

---

## Reviewer 2: 위치 설정·관련 연구

**Summary**: 본 논문은 49개 항목을 인용하며 RAG·agent orchestration·prompting·programmable pipeline·system validation 6대 주제를 균형 있게 커버한다. 2024–2026 최신 문헌 비중이 약 59%로 적절하고, classical agent 이론(1995/1998)으로 배경 설정도 단단하다. 자기 인용 비율(약 4.1%) 역시 학술적 적절성 기준 내. 다만 **(i) `ahnkim2026advisorrepo` placeholder URL이 미교체 상태로 남아 있어 arXiv 제출의 P0 차단 이슈**이며, **(ii) Model Context Protocol(MCP) 및 OpenAI function calling/structured outputs 1차 출처가 누락**되어 본 논문의 "code-owned harness" 포지셔닝의 외연이 좁아진다. 그 외 §2의 ElizaOS 인용 맥락 부정확 의심(`ahn2025autonomous` + `walters2025eliza` 한 줄 묶음)과 `giray2023prompt`의 도메인 한정성은 minor revision 수준이다.

### Major

1. **[`ahnkim2026advisorrepo` placeholder URL 미교체 — citation §6 BibTeX 이슈 #1 / §7 권고 P0]** `bib/references.bib`의 `ahnkim2026advisorrepo` 항목 URL이 `REPLACE-WITH-PUBLIC-REPOSITORY` placeholder 상태이며, 본문 `03_method.tex:39`와 `06_discussion.tex:21`에서 reproducibility 자료로 \cite된다. **arXiv v1 제출 시 broken reference로 직결되며 strategy 노트 next-task와도 일치하는 차단 이슈**다. 실제 공개 repo URL + version-v1 commit hash로 교체 필수. BibTeX `note` 필드에 이미 교체 안내가 명시되어 있으므로 작업 자체는 명확.

2. **[MCP / function-calling 1차 출처 누락 — citation §4 누락 후보 #1, #2 / §7 권고 P1]** §2 "LLM agents and orchestration"에 LangGraph/LangChain/CrewAI/AutoGen 4종 framework는 인용되지만 Anthropic Model Context Protocol (MCP) 및 OpenAI function calling/structured outputs 1차 출처가 비어 있다. 본 논문의 "code-owned harness가 기존 framework와 보완적"이라는 §2 마지막 단락 주장(`02_related_work.tex:11`)의 외연이 좁아지고, "typed-schema 제약" 근거가 `instructor2026software` software citation 한 편에 의존한다. arXiv v1은 통과 가능하나 cs.SE 리뷰어가 "2024년 이후 enterprise tool integration 표준"의 부재를 지적할 가능성 높다.

### Minor

1. **[ElizaOS 인용 맥락 부정확 의심 — citation §5 의심 사례 #14 / strategy S6 정합]** `02_related_work.tex:9`의 `\citep{ahn2025autonomous,walters2025eliza}` 묶음 인용에서 "multi-platform agent deployment and programmable agent runtime architectures"가 한 줄로 묶이면서, ElizaOS가 deployment study로 오인될 여지가 있다. strategy 노트 S6은 ElizaOS를 "system reference로만 인용 가능, financial-domain baseline 아님"으로 명시한다. `respectively` 삽입 또는 두 문장으로 분리 권장: *"...multi-platform agent deployment \citep{ahn2025autonomous} and programmable agent runtime architectures \citep{walters2025eliza}."*

2. **[`giray2023prompt` 도메인 한정 — citation §5 의심 사례 #19]** `giray2023prompt`는 *academic writers* 대상 prompting 가이드(Annals of Biomedical Engineering)로, `02_related_work.tex:14`의 "broader academic and practitioner discourse" 일반 근거로는 약함. White et al. "A Prompt Pattern Catalog" (2023) 또는 Schulhoff et al. "The Prompt Report" (2024) 같은 일반 prompt-engineering discourse 문헌으로 보강·교체 가능.

3. **[LLM Wiki 주제 peer-reviewed 보강 — citation §3 / strategy next-task #4]** "LLM Wiki and knowledge management" 주제가 `karpathy2026llmwiki` Gist 1편에만 의존한다. 본문이 "pattern, illustrates" 수준으로만 사용해 현 상태도 안전권이지만, knowledge graph/entity-centric memory 관련 학술 문헌 1편 추가 검토 가능 (저널 revision 우선).

4. **[누락 후보 보조 추천 — citation §4 #3~#7]** (a) Xi et al. agent survey 또는 Sumers et al. Cognitive Architectures (enterprise hardening 대비 강화), (b) PaperQA/GopherCite (inline-citation/source-attributed QA 라인), (c) Reflexion/Self-Refine (agent self-improvement 라인), (d) Constitutional AI/Llama Guard (guardrails 학술 보강), (e) Mialon et al. Augmented Language Models survey (RAG는 harness 안의 한 구성요소 포지셔닝 직접 지지) — 우선순위 중·낮음이지만 저널 revision 단계에서 1~2건 추가 권장.

5. **[FTC URL 안정성 / 수작업 확인 — citation §7 권고 P3]** `ftc2026businessgroups`의 query-string-heavy URL은 archive.org 등 안정 URL 병기 권장(선택). 또한 Samsung/SK/Hyundai Motor/LG/Hanwha 2026 ranking이 첨부 PDF의 실제 ranking 표와 일치하는지 저자 수작업 확인 필요.

### Questions

1. `ahnkim2026advisorrepo`의 실제 공개 repo URL과 v1 commit hash가 확정되었는가? arXiv 제출 직전까지 미정이면 임시로 "supplementary materials available from the authors on request" 형태로 fallback할 계획이 있는가?
2. MCP/function-calling 인용 추가에 대해 저자가 strategy 노트의 "peer-reviewed 우선" 정책(`current_paper_strategy.md` Safe Claims 마지막 항)과 어떻게 조율할 것인가? — MCP 공식 spec과 OpenAI 공식 가이드는 vendor docs라 일부 저널은 보조 인용으로 분류한다.
3. ElizaOS 인용 분리에 동의하는가? 동의한다면 한 문장으로 분리할지, `respectively` 삽입으로 처리할지 저자 선호는?

---

## Reviewer 3: 명확성·가독성

**Summary**: 본 논문의 영문 학술 톤은 전반적으로 안정적이다. "very/extremely/clearly/basically/in order to/the fact that" 같은 비격식·장황 표현은 본문(TikZ 옵션 제외) 0건이며, 헤지 강도도 strategy 노트의 safe-claim 경계와 일관된다. Figure 4개 + Table 6개의 균형도 cs.SE systems paper 관례 내. 다만 **(i) abstract "Such systems"·§6 "This approach"·§1 contribution 4개 한 문장 나열 등 3건의 명확성 약점**과 **(ii) PoC vs proof-of-concept · DART 풀네임 누락 · internal-review 인터페이스 4종 명칭 혼재 같은 약어·용어 일관성 잔여 이슈**가 남아 있다. Discussion 분량 4.1%·Conclusion 1.5%로 매우 짧아 4-contribution promise를 가진 Introduction과 대칭성이 약하고, §1 끝 roadmap 부재로 reader signposting이 부족하다. 모두 점진적 수정으로 해소 가능한 minor 수준이며 arXiv v1 적합성을 차단하지 않는다.

### Major

1. **[Discussion·Conclusion 분량 부족 + 4-contribution 대칭성 약화 — structure §1·G6·G7 / 개선 권고 P1·P2]** §6 Discussion 22줄(4.1%)은 SKILL.md "5% 미만" 극단 임계를 위반하며, §7 Conclusion 8줄(1.5%)도 매우 압축적이다. Introduction이 4 contribution을 enumerate(`01_introduction.tex:9`)했음에도 Conclusion은 단일 압축으로 끝나고, §1 마지막 단락이 4-contribution enumeration 직후 곧바로 §2로 전이해 reader signposting roadmap이 부재하다. **대응**: (a) Discussion에 Limitations subsection 1개 추가 (Reviewer 1 Major 3과 합치), (b) Conclusion에 C2·C3·C4 각각 한 줄 재요약 추가 (5~6줄 증가), (c) §1 마지막 단락에 1~2문장 roadmap 추가 ("Section 2 reviews related work; Section 3 introduces the harness architecture; ...").

2. **[3건의 명확성 약점 — style #4, #5, #9]** 세 곳 모두 arXiv 리뷰어가 빠르게 잡아내는 패턴이다. (a) `main.tex:101` abstract의 "Such systems"는 명목상 "agents"를 받지만 직전 절의 "prototypes"를 가리키도록 읽힌다 → "These prototypes" + "and"→"but"으로 데모↔제품화 대비 강화. (b) `06_discussion.tex:8`의 "This approach"는 선행사가 모호 → 본문 표준 명칭 "The harness-engineering approach"로 명시. (c) `01_introduction.tex:9`의 contribution 한 문장이 60단어를 넘는 4개 항목 세미콜론 나열 → (i)~(iv) 마커 도입으로 contribution 빠른 식별 가능.

### Minor

1. **[약어 도입 일관성 — style #1, #10]** "PoC"가 `06_discussion.tex:8`에서 도입 없이 단 1회 등장하고 `07_conclusion.tex:3`에서는 풀네임 "proof-of-concept"를 쓴다 → 풀네임 통일. "DART"는 본문 전반에 등장하지만 풀네임 도입이 없다 → §4.1 첫 등장 위치에서 "Data Analysis, Retrieval and Transfer System (DART)" 도입.

2. **[internal review interface 4종 명칭 혼재 — style #12]** "internal review interface" (`03_method.tex:34`) / "Internal review" (`05_system_validation.tex` tab) / "inspection packets" (`05_system_validation.tex:94`, `03_method.tex:45`) / "review packets" (`03_method.tex:45`, `06_discussion.tex:21`) — 같은 객체로 보이는 4종 명칭이 혼재. §3.4 또는 §3.5에서 한 줄 등가 정의 권장: *"the internal review interface (also referred to as inspection or review packets)"*.

3. **[근접 반복 표현 3건 — style #2, #3, #6]** (a) `03_method.tex:26`의 "maintained knowledge layer" 3회 반복 → 대명사 "this layer" + 절 통합으로 압축. (b) `03_method.tex:16`의 "The trace records..."가 미세하게 모호 → "The audit trace records..."로 명시. (c) `05_system_validation.tex:66`의 "The N/M ... result means that..." 5문장 연속 동일 구조 → 세미콜론 나열 한 문장으로 압축 (의도적 강조 유지 원하면 그대로).

4. **[abstract에 contribution 요약 1문장 추가 — structure G3 / 개선 권고 P3]** abstract(`main.tex:100-102`)는 contribution을 enumerate하지 않고 Introduction은 4개 enumerate. 일치 의무는 없으나 cs.SE 리뷰어가 빠르게 검사하는 항목 — 1문장 추가로 해결.

5. **[학술 톤 미세 조정 — style #7, #8, #13, #14, #15, #17]** "key design boundary" → "central"; "is intended to" → "aims to"; "needed questions that were recognizable to" → "required questions recognizable to" + `\textit{investment point}` 통일; "compiling and optimizing" → "compiling into optimized executables"; "are directly relevant to" → "matter in" 등 6건의 학술 톤 미세 개선.

6. **[Conclusion 대명사 모호 — style #16]** `07_conclusion.tex:7`의 "before it is extended in commercial settings"에서 "it"의 선행사가 "the model"인지 시스템 전체인지 모호 → "the system is extended into commercial settings"로 명시. U1("commercially ready") 회피 신호도 함께 강화.

### Questions

1. Discussion에 Limitations subsection을 추가할 때, 분량을 어느 정도로 잡을 계획인가? (5%·약 28줄 임계 회복 vs Disclosures와 중복 회피)
2. Conclusion에 C2·C3·C4 재요약을 추가할 때, Introduction의 enumerate와 동일한 문구를 사용할지, 새로 작성할지?
3. "internal review interface" 4종 명칭은 의도적 구분인가, 우연한 변형인가? 의도적이면 §3에서 한 줄 등가 정의만 추가하고, 우연이면 어느 명칭으로 통일할 것인가?
4. abstract에 contribution 요약 1문장을 추가할 여유 분량이 있는가? (arXiv 표준 abstract 길이 기준)

---

## 우선순위 액션 리스트

긴급도 × 영향도 기준 정렬. P0 = arXiv v1 제출 차단, P1 = arXiv v1 강력 권장, P2 = arXiv v1 권장 또는 저널 revision 필수, P3 = 저널 revision 권장.

| 순위 | 이슈 | Reviewer | 분류 | 대응 방향 | 관련 섹션 |
|------|------|----------|------|----------|-----------|
| **1 (P0)** | `ahnkim2026advisorrepo` placeholder URL이 `REPLACE-WITH-PUBLIC-REPOSITORY` 상태 — broken reference 직결 | R2 | Major | 실제 공개 repo URL + version-v1 commit hash로 BibTeX `note` 지시에 따라 교체. `03_method.tex:39`, `06_discussion.tex:21`에서 \cite. | `bib/references.bib` (`ahnkim2026advisorrepo`), `03_method.tex:39`, `06_discussion.tex:21` |
| **2 (P0)** | F3 — "113 source-backed runtime claims"(manifest 전체) vs "109/109 claim refs"(scenario expected reference) 단위 차이가 본문에 미설명 — 독자 혼동·재현자 트리거 | R1 | Minor (개별 리포트), 종합 우선순위 P0 | §5.2 첫 단락 끝 또는 footnote에 1문장 추가: *"The 109 expected claim references are a subset of the 113 source-backed runtime claims in §4."* | `05_system_validation.tex:50-62`, `04_data_and_knowledge_base.tex:115` |
| **3 (P0)** | C4 "prompt-to-code migration" promise vs Method 자가-deferral 충돌 — 동일 논문 내 일관성 결함 | R1 | Major | 옵션 A: `01_introduction.tex:9` C4 항목 문구를 "code-owned routing and contract artifacts"로 완화. 옵션 B: §3.3에 LOC/prompt-token 길이 1줄 표 추가하고 `03_method.tex:28` 수정. arXiv v1은 (A) 권장. | `01_introduction.tex:9`, `03_method.tex:28` |
| **4 (P1)** | C3 "replaceable composition boundary" validation 부재 — 4개 contribution 중 가장 약한 매핑, 리뷰어 공격 1순위 | R1 | Major | (A) §5에 "Composition Boundary Substitution" 1-paragraph 추가 (deterministic + live-LLM attach trace 샘플), 또는 (B) C3 문구를 "design pattern" 수준으로 완화. arXiv v1은 (B) 가능, 저널 revision은 (A) 필수. | `03_method.tex:39-41`, `05_system_validation.tex:96`, §5 또는 §6 |
| **5 (P1)** | Discussion limitations subsection 누락 + Discussion 분량 4.1% (5% 임계 미만) | R1 + R3 | Major | §6.1 implications 3가지 뒤에 Limitations subsection 추가 — (a) fault injection single-field 한정, (b) latency deterministic composer 기반, (c) 30 scenario reproducibility baseline ≠ user-impact eval. strategy 노트 U1~U5 방어선 강화. | `06_discussion.tex` 전체 |
| **6 (P1)** | F2 — 5/5 live API + 15/15 answer-hygiene + 15 inspection packet 수치의 본문 surface 미흡 | R1 | Minor | 부록 §A에 1줄 artifact pointer 추가 (예: `evals/results/runtime-smoke-2026-XX-XX.json`), 또는 표현 약화. 현 표현 자체는 U5 회피로 가까스로 안전. | `05_system_validation.tex:94`, 부록 §A |
| **7 (P1)** | 3건의 명확성 약점 — abstract "Such systems", §6 "This approach", §1 contribution 한 문장 60단어 | R3 | Major | abstract: "These prototypes" + "and"→"but"; §6: "The harness-engineering approach is..."; §1: (i)~(iv) 마커 도입. style #4·#5·#9 동시 처리. | `main.tex:101`, `06_discussion.tex:8`, `01_introduction.tex:9` |
| **8 (P1)** | MCP / OpenAI function-calling 1차 출처 누락 — "code-owned harness" 포지셔닝 외연 좁음 | R2 | Major | §2 "LLM agents and orchestration" 단락 끝에 MCP spec 인용 추가, §2 "Programmable LLM pipelines"에 OpenAI function calling/structured outputs 인용 추가 (Instructor 부근). | `02_related_work.tex:11`, `02_related_work.tex:17`, `bib/references.bib` |
| **9 (P2)** | Conclusion 4-contribution 재요약 누락 + §1 roadmap 부재 | R3 | Major | Conclusion에 C2·C3·C4 한 줄씩 추가 (5~6줄), §1 마지막 단락에 "Section 2 reviews related work; Section 3 introduces ..." 1~2문장 추가. | `07_conclusion.tex:3-5`, `01_introduction.tex:9` |
| **10 (P2)** | ElizaOS 인용 맥락 부정확 의심 — deployment study로 오인될 여지, strategy S6 정합 약함 | R2 | Minor | `02_related_work.tex:9`의 `\citep{ahn2025autonomous,walters2025eliza}`를 `respectively` 삽입 또는 두 문장 분리. | `02_related_work.tex:9` |
| **11 (P2)** | F1 — "it can surround a LangGraph, CrewAI, AutoGen, or LangChain-agent workflow" 미실증 가능성 진술 | R1 | Minor | "is intended to be composable with"로 약화 또는 "integration experiments are not reported in this paper" 한 문장 추가. | `02_related_work.tex:11` |
| **12 (P2)** | 약어 도입 일관성 — PoC vs proof-of-concept 혼재, DART 풀네임 누락 | R3 | Minor | `06_discussion.tex:8`의 "PoC" → "proof-of-concept"로 통일; `04_data_and_knowledge_base.tex:39`에 "Data Analysis, Retrieval and Transfer System (DART)" 풀네임 도입. | `06_discussion.tex:8`, `07_conclusion.tex:3`, `04_data_and_knowledge_base.tex:39` |
| **13 (P2)** | internal review interface 4종 명칭 혼재 — internal review / inspection packets / review packets | R3 | Minor | §3.4 또는 §3.5에서 한 줄 등가 정의 추가: *"the internal review interface (also referred to as inspection or review packets)"*. | `03_method.tex:34,45`, `05_system_validation.tex:94`, `06_discussion.tex:21` |
| **14 (P2)** | F5 — latency-contract 교집합 cross-reference 약함 | R1 | Minor | `05_system_validation.tex:96`에 *"the 14 latency-paired scenarios continued to pass the answer-contract checks reported in Table~\ref{tab:validation-results}"* 형태 한 문장 추가. | `05_system_validation.tex:96` |
| **15 (P3)** | abstract에 contribution 요약 1문장 추가 — Introduction enumerate와 대칭 회복 | R3 | Minor | abstract 끝에 1문장: *"The contributions are a harness-engineering method, a source-to-claim pipeline, a replaceable composition boundary, and a system-level validation design."* | `main.tex:100-102` |
| **16 (P3)** | F4 — "over ten exploratory AI product prototypes" 정확성 외부 근거 부재 | R1 | Minor | "multiple exploratory AI product prototypes"로 약화 또는 정확한 수의 인용 가능 자료 연결. | `01_introduction.tex:5` |
| **17 (P3)** | `giray2023prompt` 도메인 한정 — "broader academic and practitioner discourse" 일반 근거로 약함 | R2 | Minor | White et al. "A Prompt Pattern Catalog"(2023) 또는 Schulhoff et al. "The Prompt Report"(2024)로 보강·교체 (저널 revision 우선). | `02_related_work.tex:14` |
| **18 (P3)** | 근접 반복 표현 3건 — "maintained knowledge layer" ×3 / "The trace" 모호 / "result means that..." ×5 | R3 | Minor | (a) `03_method.tex:26` 대명사화 + 절 통합, (b) `03_method.tex:16` "The audit trace"로 명시, (c) `05_system_validation.tex:66` 세미콜론 나열 압축 (강조 의도 유지 원하면 그대로). | `03_method.tex:16,26`, `05_system_validation.tex:66` |
| **19 (P3)** | Method §3.1·§3.6 정의 반복 — "harness defines X, Y, Z" 4회 가까이 등장 | R1 | Minor | `03_method.tex:5-7`과 `03_method.tex:43-44` 중 한 곳을 cross-reference로 압축. | `03_method.tex:5-7`, `03_method.tex:43-49` |
| **20 (P3)** | 학술 톤 미세 조정 — "key" → "central"; "is intended to" → "aims to"; "compiling and optimizing" 동의어 병기 등 6건 | R3 | Minor | style #7·#8·#13·#14·#15·#17 일괄 처리. | `03_method.tex:22,28`, `04_data_and_knowledge_base.tex:41`, `05_system_validation.tex:8`, `06_discussion.tex:10`, `02_related_work.tex:6` |
| **21 (P3)** | Conclusion 대명사 "it" 모호 + U1 회피 신호 강화 가능 | R3 | Minor | `07_conclusion.tex:7`의 "before it is extended in commercial settings" → "before the system is extended into commercial settings". | `07_conclusion.tex:7` |
| **22 (P3)** | LLM Wiki 주제 `karpathy2026llmwiki` Gist 1편 의존 + 누락 후보 보조 (Xi/Sumers, PaperQA, Reflexion, Constitutional AI, Mialon) | R2 | Minor | 저널 revision 단계에서 peer-reviewed knowledge management 문헌 1편 + 누락 후보 1~2편 추가 검토. | `02_related_work.tex` 전반, `bib/references.bib` |
| **23 (P3)** | FTC URL 안정성 + 수작업 ranking 확인 | R2 | Minor | `ftc2026businessgroups`에 archive.org 안정 URL 병기(선택). 2026 ranking이 첨부 PDF 실제 표와 일치하는지 저자 수작업 재확인. | `bib/references.bib` (`ftc2026businessgroups`), `04_data_and_knowledge_base.tex:8` |

---

## 다음 리비전에서 확인할 것

### 제출 차단 체크리스트 (반드시 처리, arXiv v1 전)
- [ ] **순위 1 (P0)** — `ahnkim2026advisorrepo` BibTeX URL을 실제 공개 repo + commit hash로 교체했는가? `bib/references.bib`의 `note` 필드를 확인.
- [ ] **순위 2 (P0)** — §5.2 또는 footnote에 113 vs 109 단위 차이 설명 1문장 추가됐는가?
- [ ] **순위 3 (P0)** — `01_introduction.tex:9` C4 "prompt-to-code migration" 문구를 완화했거나, §3.3에 LOC/token 표를 추가했는가?

### arXiv v1 강력 권장 (처리 권장, 미처리 시 reviewer/reader 친화도 저하)
- [ ] **순위 4 (P1)** — C3 contribution 문구 완화 또는 §5 boundary substitution paragraph 추가 결정 — 어느 옵션을 선택했는가?
- [ ] **순위 5 (P1)** — §6에 Limitations subsection이 추가됐는가? (fault injection · latency · scenario 한정 3건 인정)
- [ ] **순위 6 (P1)** — 부록 §A에 5/5·15/15·15 packets에 대한 artifact pointer가 추가됐는가? 또는 본문 표현이 약화됐는가?
- [ ] **순위 7 (P1)** — abstract "Such systems" → "These prototypes" + "and"→"but" 교체됐는가? `06_discussion.tex:8` "This approach" → "The harness-engineering approach"로 명시됐는가? `01_introduction.tex:9` contribution 한 문장에 (i)~(iv) 마커가 도입됐는가?
- [ ] **순위 8 (P1)** — §2에 MCP 및 OpenAI function calling/structured outputs 인용이 추가됐는가? `bib/references.bib`에 항목 추가 완료됐는가?

### 점진적 개선 (P2 — arXiv v1 권장 또는 저널 revision 필수)
- [ ] **순위 9** — Conclusion에 C2·C3·C4 재요약이 추가되고 §1 끝에 roadmap 1~2문장이 추가됐는가?
- [ ] **순위 10** — `02_related_work.tex:9`의 ElizaOS 묶음 인용이 `respectively` 삽입 또는 두 문장 분리로 정정됐는가?
- [ ] **순위 11** — `02_related_work.tex:11` "it can surround" 표현이 "intended to be composable with"로 약화 또는 "integration experiments are not reported" 한정구가 추가됐는가?
- [ ] **순위 12** — `06_discussion.tex:8`의 "PoC"가 "proof-of-concept"로 통일됐는가? `04_data_and_knowledge_base.tex:39`에 DART 풀네임이 도입됐는가?
- [ ] **순위 13** — §3.4 또는 §3.5에 internal review / inspection / review packets의 등가 정의 1줄이 추가됐는가?
- [ ] **순위 14** — `05_system_validation.tex:96`에 14 latency 시나리오의 contract pass cross-reference가 추가됐는가?

### 마무리 점검 (P3 — 저널 revision 권장)
- [ ] **순위 15** — abstract에 contribution 요약 1문장이 추가됐는가?
- [ ] **순위 16** — `01_introduction.tex:5`의 "over ten" 표현이 약화 또는 외부 근거와 연결됐는가?
- [ ] **순위 17** — `giray2023prompt`가 White/Schulhoff 등 일반 prompt-discourse 문헌으로 보강·교체됐는가?
- [ ] **순위 18~21** — style 근접 반복·정의 반복·학술 톤·Conclusion 대명사 미세 수정이 처리됐는가?
- [ ] **순위 22~23** — 저널 revision 단계에서 LLM Wiki peer-reviewed 보강, 누락 후보 1~2편 추가, FTC ranking 수작업 확인이 완료됐는가?

### 메타 점검
- [ ] strategy 노트의 unsafe-claim 5개(U1~U5)에 대한 본문 검출이 여전히 0건인가? (Guard 진술 14개가 분산되어 두꺼운 방어선을 유지하는지 재확인)
- [ ] 본문 수정 후 산술 검증(36+27+15+15+20=113, 25+30+20+20+14=109, 5×6=30, 5×12=60)이 그대로 유효한가?
- [ ] Figure 4 + Table 6의 caption·label·cross-reference가 모두 유지됐는가?
- [ ] `artifacts/evolution-log.md`에 본 리비전 변경 사항이 기록됐는가?
