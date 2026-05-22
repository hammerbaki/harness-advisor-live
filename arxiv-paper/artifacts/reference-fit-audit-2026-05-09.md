# Reference Fit Audit

생성일: 2026-05-09

목적: `arxiv-paper` 본문에 붙어 있는 citation이 실제 원문/공식 메타데이터의 내용과 맞는지 1차로 점검한다. 이 문서는 저자 수작업 검증을 돕기 위한 사전 감사표이며, 최종 판정은 Zotero/PDF 원문 확인 후 확정한다.

## 판정 기준

- `적합`: 현재 본문 주장을 직접 지지한다.
- `부분 적합`: 방향은 맞지만 본문 표현을 약하게 유지해야 한다.
- `보조 인용`: 핵심 근거보다 배경/프레임워크 소개용으로 적합하다.
- `수작업 확인`: 웹 공개 초록/메타데이터만으로는 부족하므로 PDF 원문 또는 공식 첨부를 확인해야 한다.
- `수정 반영`: 감사 중 BibTeX 또는 본문 정합성을 이미 고쳤다.

## 즉시 반영한 수정

- `gao2023rag`: 공개 메타데이터 기준 누락된 저자 `Qianyu Guo`를 BibTeX에 추가했다.
- `beurerkellner2023lmql`: 실제 논문 제목을 `Prompting Is Programming: A Query Language for Large Language Models`로 수정하고 DOI와 페이지 정보를 추가했다.

## Citation 위치별 적합성

| 본문 위치 | Citation | 현재 본문 주장 | 1차 판정 | 검토 메모 |
|---|---|---|---|---|
| Introduction | `ji2023hallucination` | LLM productization에서 hallucination이 핵심 리스크라는 문제 제기 | 적합 | ACM Computing Surveys 논문은 NLG hallucination의 측정/완화/과제를 폭넓게 다룬다. |
| Introduction | `martinezfernandez2022seai`, `kreuzberger2023mlops` | AI 시스템 productization에는 SE/MLOps 통제가 필요함 | 적합 | 각각 SE-for-AI survey와 MLOps architecture 논문이므로 도입부의 문제 설정을 뒷받침한다. |
| Introduction | `ceoai2026leadership` | prototype이 CEOAI 10주 AI leadership program 맥락에서 개발됨 | 보조 인용 / 수작업 확인 | 학술 근거가 아니라 프로젝트 맥락 출처다. 웹사이트 캡처 또는 archive가 있으면 좋다. |
| Related Work: Grounded generation | `lewis2020rag`, `gao2023rag` | RAG가 외부 문서를 결합해 factual grounding/updateability를 높임 | 적합 | Lewis는 RAG 원논문, Gao는 RAG survey다. `gao2023rag`은 arXiv survey이므로 권위는 보조적이지만 내용은 적합하다. |
| Related Work: Grounded generation | `asai2024selfrag` | retrieval 필요성/지원 여부를 self-reflection으로 점검 | 적합 | Self-RAG는 adaptive retrieval과 reflection token으로 generation support를 다룬다. |
| Related Work: Grounded generation | `min2023factscore` | long-form answer를 atomic fact로 분해해 factuality를 평가 | 적합 | 본 논문의 source-backed claim 설계와 직접적으로 잘 맞는다. |
| Related Work: Grounded generation | `ji2023hallucination` | fluent generation도 hallucination을 일으킬 수 있음 | 적합 | 사용 위치가 안전하다. |
| Related Work: Agents | `wooldridge1995intelligent`, `jennings1998roadmap` | classical agent research의 autonomy/interaction/system architecture 맥락 | 적합 | 고전 agent 이론 배경으로 적절하다. |
| Related Work: Agents | `yao2023react`, `schick2023toolformer` | LLM agents가 reasoning, acting, tool use로 확장됨 | 적합 | ReAct와 Toolformer 모두 해당 주장에 직접 연결된다. |
| Related Work: Agents | `wang2024surveyagents`, `acharya2025agentic` | 최근 LLM/agentic AI survey 맥락 | 적합 | survey 성격으로 적절하다. `acharya2025agentic`은 범위가 넓으므로 보조 survey로 쓰는 것이 안전하다. |
| Related Work: Agents | `qin2024toolllm` | API 선택과 실행은 prompting이 아니라 engineering 문제임 | 적합 | ToolLLM은 실제 API/tool-use 데이터, 학습, 평가를 다룬다. |
| Related Work: Agents | `ahn2025autonomous`, `walters2025eliza` | 배포형 agent artifact와 programmable runtime 사례 | 부분 적합 | Ahn & Kim은 실제 multi-platform deployment study로 적합하다. ElizaOS는 framework/operating system 성격이므로 “deployment result”보다 “agent runtime” 근거로만 사용해야 한다. 현재 문장은 이 경계를 대체로 지킨다. |
| Related Work: Programming instead of prompting | `khattab2024dspy`, `stanfordnlp2026dspysoftware` | DSPy가 prompt 문자열보다 declarative program/optimization을 지향 | 적합 | ICLR 논문과 GitHub repository가 서로 보완된다. GitHub는 software 상태 확인용이다. |
| Related Work: Programming instead of prompting | `beurerkellner2023lmql`, `guidance2026software` | LMQL/Guidance가 controlled execution/structured generation을 지원 | 적합 | LMQL BibTeX는 실제 제목/DOI로 수정했다. Guidance는 software repo이므로 framework description 이상으로 과장하지 않는다. |
| Related Work: Programming instead of prompting | `instructor2026software` | typed schema로 LLM output을 제약/검증 | 적합 | Instructor README의 Pydantic/schema-first 설명과 맞다. 학술 논문이 아니므로 software citation으로 유지한다. |
| Related Work: Programming instead of prompting | `rebedea2023nemo` | runtime guardrails가 model-independent programmable rails를 제공 | 적합 | ACL Anthology 초록 기준 매우 적합하다. |
| Related Work: Programming instead of prompting | `karpathy2026llmwiki`, `karpathy2026autoresearch` | LLM Wiki와 반복 실험 관리 철학 | 보조 인용 | peer-reviewed source가 아니므로 “pattern”, “illustrates” 수준으로만 사용해야 한다. 현재 표현은 적절하다. |
| Related Work: Assurance and evaluation | `martinezfernandez2022seai`, `ashmore2021assuring` | AI-based systems에는 data management, testing, lifecycle, assurance artifacts가 필요 | 적합 | 두 논문 모두 SE/assurance lifecycle을 지지한다. |
| Related Work: Assurance and evaluation | `kreuzberger2023mlops` | MLOps가 lifecycle/operationalization 문제를 다룸 | 적합 | IEEE Access 논문과 잘 맞는다. |
| Related Work: Assurance and evaluation | `es2023ragas`, `saadfalcon2024ares` | RAG evaluation metrics/frameworks | 적합 | RAGAS/ARES 모두 faithfulness/relevance/context 계열 평가와 직접 관련된다. |
| Related Work: Assurance and evaluation | `liang2023helm` | 단일 점수보다 multi-scenario/multi-metric evaluation 필요 | 적합 | HELM은 broad scenario/metric evaluation을 주장하므로 현재 문장에 적합하다. |
| Data and Knowledge Base | `ftc2026businessgroups` | 5대 그룹 선정 근거는 2026년 공정거래위원회 대기업집단 지정 결과 | 적합 / 수작업 확인 | 공식 보도자료가 primary source다. 첨부 PDF 파일명, 발행일, 표의 ranking을 수작업으로 한 번 더 확인하는 것이 좋다. |
| System Validation | `es2023ragas`, `saadfalcon2024ares`, `liang2023helm` | 본 논문의 frozen scenario validation은 full RAG/model evaluation보다 좁음 | 적합 | RAGAS/ARES/HELM이 더 넓은 평가 프레임워크라는 대비로 쓰이고 있어 안전하다. |
| Discussion | `khattab2024dspy` | 본 연구는 DSPy-style program optimization보다 product-level evidence contracts에 초점 | 적합 | 비교 문장으로 적절하다. |
| Discussion | `kreuzberger2023mlops` | harness는 full MLOps lifecycle보다 좁은 패턴 | 적합 | MLOps 범위를 좁히는 비교로 안전하다. |

## Reference별 수작업 검증 우선순위

### 우선순위 높음

1. `ftc2026businessgroups`
   - 이유: 5대 그룹 선정이라는 데이터 경계의 1차 근거다.
   - 수작업 확인: 공정거래위원회 첨부 PDF에서 Samsung, SK, Hyundai Motor, LG, Hanwha 순위가 실제로 표에 있는지 확인.

2. `ceoai2026leadership`
   - 이유: 연구 맥락을 설명하는 웹사이트 citation이다.
   - 수작업 확인: 현재 사이트가 계속 유지되는지, `AI Leadership Program` 명칭이 정확한지, 가능하면 접속일 캡처 또는 archive 확보.

3. `karpathy2026llmwiki`, `karpathy2026autoresearch`
   - 이유: 논문에서 중요한 철학적 프레임워크지만 peer-reviewed 문헌이 아니다.
   - 수작업 확인: 본문 표현을 “method proves”가 아니라 “pattern/prototype illustrates” 수준으로 유지.

4. `walters2025eliza`
   - 이유: arXiv 시스템 논문이며 현재 논문은 ElizaOS를 benchmark/related system으로 언급한다.
   - 수작업 확인: “deployed result”가 아니라 “agent operating system/runtime”으로만 연결되는지 확인.

### 우선순위 중간

5. `gao2023rag`, `es2023ragas`
   - 이유: arXiv/preprint 성격이다.
   - 수작업 확인: peer-reviewed 대체가 필요한지 결정. 현재로서는 survey/evaluation framework 설명용이므로 유지 가능.

6. `guidance2026software`, `instructor2026software`, `stanfordnlp2026dspysoftware`
   - 이유: software repository citation이다.
   - 수작업 확인: GitHub citation은 framework capability 설명에만 사용하고 학술적 실증 주장에는 쓰지 않는다.

### 우선순위 낮음

7. `lewis2020rag`, `yao2023react`, `schick2023toolformer`, `khattab2024dspy`, `min2023factscore`, `rebedea2023nemo`, `saadfalcon2024ares`
   - 이유: 본문 주장과 공식 초록/메타데이터가 잘 맞고, 주요 학회/ACL/ICLR/NeurIPS 문헌이다.

8. `martinezfernandez2022seai`, `ashmore2021assuring`, `kreuzberger2023mlops`, `wang2024surveyagents`, `acharya2025agentic`, `wooldridge1995intelligent`, `jennings1998roadmap`
   - 이유: 배경 및 포지셔닝용으로 적합하다.

## 본문 수정 권고

현재 본문은 대체로 reference 범위 안에 있다. 다만 수작업 검증 후 다음을 확인하면 좋다.

1. ElizaOS 관련 문장
   - 현재 표현: “applied examples of deployed agent artifacts and programmable agent runtimes”
   - 권고: Ahn 논문은 deployed artifact, ElizaOS는 programmable runtime으로 읽히므로 현 표현은 유지 가능. 다만 더 엄격히 하려면 “respectively”를 넣거나 두 문장으로 분리.

2. Karpathy references
   - 현재 표현: “pattern”, “illustrates”로 되어 있어 안전하다.
   - 권고: 논문 전체에서 Karpathy sources를 학술적 evidence가 아니라 engineering inspiration으로만 유지.

3. FTC source
   - 현재 표현은 적절하다.
   - 권고: 최종 제출 전 official PDF 제목, 게시일, URL을 BibTeX note에 더 정확히 반영.

4. CEOAI source
   - 현재 표현은 프로젝트 맥락 설명으로 적절하다.
   - 권고: 만약 웹사이트가 기관 소개/교육 소개 중심이면, citation을 footnote나 appendix로 낮추는 것도 가능하다.

## 1차 결론

현재 citation은 논문의 핵심 주장과 대체로 잘 맞는다. 가장 중요한 점은 레퍼런스의 강도를 구분하는 것이다. peer-reviewed 문헌은 문제 설정, RAG/agent/evaluation/assurance 배경을 지지하고, GitHub/Gist/website citation은 구현 철학과 프로젝트 맥락을 보조한다. 지금 상태에서 큰 교체가 필요한 reference는 보이지 않지만, FTC PDF와 CEOAI page는 저자가 수작업으로 보존성까지 확인하는 것이 좋다.
