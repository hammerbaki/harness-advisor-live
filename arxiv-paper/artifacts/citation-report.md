# Citation Report

생성일: 2026-05-16

대상: `bib/references.bib`, `sections/01_introduction.tex` ~ `sections/08_appendix_scenarios.tex`
이전 감사: `artifacts/reference-fit-audit-2026-05-09.md` (참고용, 본 문서는 신규 작성).

본 보고서는 `notes/current_paper_strategy.md`의 safe/unsafe claims 경계를 침범하지 않는 범위에서 인용 분포·맥락·누락 후보를 평가한다. 본문 `.tex`는 수정하지 않는다.

## 1. 현재 참고문헌 요약

| # | BibKey | 저자 | 연도 | 유형 | 주제 영역 |
|---|--------|------|------|------|----------|
| 1 | `lewis2020rag` | Lewis et al. | 2020 | NeurIPS 학회 | RAG and traceability |
| 2 | `gao2023rag` | Gao et al. | 2023 | arXiv preprint (survey) | RAG and traceability |
| 3 | `asai2024selfrag` | Asai et al. | 2024 | ICLR 학회 | RAG and traceability |
| 4 | `min2023factscore` | Min et al. | 2023 | EMNLP 학회 | RAG and traceability / Evaluation |
| 5 | `ji2023hallucination` | Ji et al. | 2023 | ACM Computing Surveys 저널 | RAG and traceability / Hallucination |
| 6 | `wooldridge1995intelligent` | Wooldridge & Jennings | 1995 | Knowledge Engineering Review 저널 | LLM agents and orchestration (classical) |
| 7 | `jennings1998roadmap` | Jennings et al. | 1998 | AAMAS 저널 | LLM agents and orchestration (classical) |
| 8 | `yao2023react` | Yao et al. | 2023 | ICLR 학회 | LLM agents and orchestration |
| 9 | `schick2023toolformer` | Schick et al. | 2023 | NeurIPS 학회 | LLM agents and orchestration |
| 10 | `wang2024surveyagents` | Wang et al. | 2024 | Frontiers of CS 저널 (survey) | LLM agents and orchestration |
| 11 | `acharya2025agentic` | Acharya et al. | 2025 | IEEE Access 저널 (survey) | LLM agents and orchestration |
| 12 | `qin2024toolllm` | Qin et al. | 2024 | ICLR 학회 | LLM agents and orchestration |
| 13 | `ahn2025autonomous` | Ahn & Kim | 2025 | Electronics 저널 (자기 인용) | LLM agents and orchestration |
| 14 | `walters2025eliza` | Walters et al. | 2025 | arXiv preprint | LLM agents and orchestration |
| 15 | `wu2024autogen` | Wu et al. | 2024 | COLM 학회 | LLM agents and orchestration |
| 16 | `langchain2026langgraph` | LangChain | 2026 | GitHub repo (소프트웨어) | LLM agents and orchestration |
| 17 | `langchain2026agents` | LangChain | 2026 | Documentation (웹사이트) | LLM agents and orchestration |
| 18 | `crewai2026software` | CrewAI Inc. | 2026 | GitHub repo (소프트웨어) | LLM agents and orchestration |
| 19 | `brown2020language` | Brown et al. | 2020 | NeurIPS 학회 | Prompt engineering and prototyping |
| 20 | `liu2023pretrain` | Liu et al. | 2023 | ACM Computing Surveys 저널 | Prompt engineering and prototyping |
| 21 | `giray2023prompt` | Giray | 2023 | Annals of Biomedical Engineering 저널 | Prompt engineering and prototyping |
| 22 | `wei2022chain` | Wei et al. | 2022 | NeurIPS 학회 | Prompt engineering and prototyping |
| 23 | `karpathy2025vibecoding` | Karpathy | 2025 | X(트위터) 포스트 | Prompt engineering and prototyping |
| 24 | `meske2025vibecoding` | Meske et al. | 2025 | IEEE Access 저널 | Prompt engineering and prototyping |
| 25 | `malamas2025vibecoding` | Malamas et al. | 2025 | Journal of Computer Languages 저널 | Prompt engineering and prototyping |
| 26 | `khattab2022demonstrate` | Khattab et al. | 2022 | arXiv preprint | Programmable LLM pipelines |
| 27 | `khattab2024dspy` | Khattab et al. | 2024 | ICLR 학회 | Programmable LLM pipelines |
| 28 | `stanfordnlp2026dspysoftware` | Stanford NLP | 2026 | GitHub repo (소프트웨어) | Programmable LLM pipelines |
| 29 | `beurerkellner2023lmql` | Beurer-Kellner et al. | 2023 | PACMPL/PLDI 저널 | Programmable LLM pipelines |
| 30 | `guidance2026software` | Guidance AI | 2026 | GitHub repo (소프트웨어) | Programmable LLM pipelines |
| 31 | `instructor2026software` | 567 Labs | 2026 | GitHub repo (소프트웨어) | Programmable LLM pipelines |
| 32 | `rebedea2023nemo` | Rebedea et al. | 2023 | EMNLP demo 학회 | Programmable LLM pipelines / Guardrails |
| 33 | `karpathy2026autoresearch` | Karpathy | 2026 | GitHub repo (개인) | Programmable LLM pipelines |
| 34 | `karpathy2026llmwiki` | Karpathy | 2026 | Gist (개인) | LLM Wiki and knowledge management |
| 35 | `martinezfernandez2022seai` | Martínez-Fernández et al. | 2022 | ACM TOSEM 저널 (survey) | System validation and evaluation |
| 36 | `ashmore2021assuring` | Ashmore et al. | 2021 | ACM Computing Surveys 저널 | System validation and evaluation |
| 37 | `kreuzberger2023mlops` | Kreuzberger et al. | 2023 | IEEE Access 저널 | System validation and evaluation |
| 38 | `es2023ragas` | Es et al. | 2024 (EACL) | EACL 학회 | System validation and evaluation |
| 39 | `saadfalcon2024ares` | Saad-Falcon et al. | 2024 | NAACL 학회 | System validation and evaluation |
| 40 | `liang2023helm` | Liang et al. | 2023 | TMLR 저널 | System validation and evaluation |
| 41 | `promptfoo2026software` | promptfoo | 2026 | GitHub repo (소프트웨어) | System validation and evaluation |
| 42 | `isoiecieee2017vocabulary` | ISO/IEC/IEEE | 2017 | 표준 (technical report) | 정의 (test harness) |
| 43 | `ftc2026businessgroups` | KFTC | 2026 | 공식 보도자료 | 데이터 / 1차 사료 |
| 44 | `opendart2026api` | FSS | 2026 | 공식 API 문서 | 데이터 / API 사료 |
| 45 | `krx2026openapi` | KRX | 2026 | 공식 API 문서 | 데이터 / API 사료 |
| 46 | `naver2026newssearch` | NAVER Developers | 2026 | 공식 API 문서 | 데이터 / API 사료 |
| 47 | `ceoai2026leadership` | CEOAI | 2026 | 웹사이트 | 프로젝트 맥락 |
| 48 | `replit2026platform` | Replit, Inc. | 2026 | 웹사이트 | 프로젝트 맥락 |
| 49 | `ahnkim2026advisorrepo` | Ahn & Kim (자기 인용) | 2026 | GitHub repo 자리표시자 | 재현성 자료 |

총 49개 항목.

## 2. 연도 분포

| 구간 | 항목 수 | BibKeys |
|---|---|---|
| ≤2020 | 5 | `wooldridge1995intelligent`, `jennings1998roadmap`, `isoiecieee2017vocabulary`, `lewis2020rag`, `brown2020language` |
| 2021–2023 | 15 | `ashmore2021assuring`, `martinezfernandez2022seai`, `khattab2022demonstrate`, `wei2022chain`, `gao2023rag`, `yao2023react`, `schick2023toolformer`, `ji2023hallucination`, `liu2023pretrain`, `giray2023prompt`, `beurerkellner2023lmql`, `rebedea2023nemo`, `kreuzberger2023mlops`, `liang2023helm`, `min2023factscore` |
| 2024–2026 | 29 | `asai2024selfrag`, `wang2024surveyagents`, `qin2024toolllm`, `khattab2024dspy`, `wu2024autogen`, `es2023ragas`(EACL 2024 게재), `saadfalcon2024ares`, `acharya2025agentic`, `ahn2025autonomous`, `walters2025eliza`, `karpathy2025vibecoding`, `meske2025vibecoding`, `malamas2025vibecoding`, `karpathy2026llmwiki`, `karpathy2026autoresearch`, `langchain2026langgraph`, `langchain2026agents`, `crewai2026software`, `stanfordnlp2026dspysoftware`, `guidance2026software`, `instructor2026software`, `promptfoo2026software`, `ftc2026businessgroups`, `opendart2026api`, `krx2026openapi`, `naver2026newssearch`, `ceoai2026leadership`, `replit2026platform`, `ahnkim2026advisorrepo` |

- 합계: ≤2020 5개 / 2021–2023 15개 / 2024–2026 29개 = 49개.
- 최신성: 2024–2026 비중 약 59%. RAG selectivity, orchestration framework, vibe coding, programmable pipelines, 공식 API/데이터 1차 사료 등 최신 트렌드는 충분히 반영.
- 고전 기반: classical agent 이론은 1995/1998 문헌으로 안정적으로 배경 설정.

## 3. 주제별 커버리지

| 주제 | 현재 인용 | 커버리지 | 비고 |
|------|----------|---------|------|
| RAG and traceability | `lewis2020rag`, `gao2023rag`, `asai2024selfrag`, `min2023factscore`, `ji2023hallucination` | 충분 | RAG 원논문 + survey + selective retrieval + atomic factuality + hallucination 5축. 본 논문의 source-to-claim 설계와 잘 맞는다. |
| LLM agents and orchestration | `wooldridge1995intelligent`, `jennings1998roadmap`, `yao2023react`, `schick2023toolformer`, `wang2024surveyagents`, `acharya2025agentic`, `qin2024toolllm`, `ahn2025autonomous`, `walters2025eliza`, `wu2024autogen`, `langchain2026agents`, `langchain2026langgraph`, `crewai2026software` | 충분 | classical → tool-use → 최신 survey → 배포 사례 → 4대 orchestration framework(AutoGen / LangChain / LangGraph / CrewAI)가 모두 커버. 단, **MCP / function-calling 표준 계열 문헌이 비어 있음** (§4 누락 후보 참조). |
| Prompt engineering and prototyping | `brown2020language`, `liu2023pretrain`, `giray2023prompt`, `wei2022chain`, `karpathy2025vibecoding`, `meske2025vibecoding`, `malamas2025vibecoding` | 충분 | few-shot 원논문 + prompting survey + CoT + 학술 가이드 + vibe coding 3편. prompt-dominant 정의 근거로 충분. 단 `giray2023prompt`는 도메인 한정(아래 §5 의심 사례 2 참조). |
| Programmable LLM pipelines | `khattab2022demonstrate`, `khattab2024dspy`, `stanfordnlp2026dspysoftware`, `beurerkellner2023lmql`, `guidance2026software`, `instructor2026software`, `rebedea2023nemo`, `karpathy2026autoresearch` | 충분 | DSPy/LMQL/Guidance/Instructor/NeMo Guardrails로 declarative + constrained generation + guardrails까지 다층. |
| LLM Wiki and knowledge management | `karpathy2026llmwiki` | **보통(약함)** | Karpathy Gist 1편에만 의존. 본 논문이 이 주제를 "pattern, illustrates" 수준으로만 사용해 현 상태도 안전권이지만, 단일 비peer-reviewed 의존은 리스크. 학술 knowledge layer / entity-centric memory 문헌이 비어 있다(§4 참조). |
| System validation and evaluation | `martinezfernandez2022seai`, `ashmore2021assuring`, `kreuzberger2023mlops`, `es2023ragas`, `saadfalcon2024ares`, `liang2023helm`, `promptfoo2026software` | 충분 | SE-for-AI / ML assurance / MLOps / RAGAS / ARES / HELM / promptfoo로 학술·실무 평가가 모두 커버. |

## 4. 누락 후보 문헌

본문 핵심 주장(harness / source-grounded / enterprise LLM / agent orchestration)과 직접 연결되는 문헌만 제안한다. 인용 수 늘리기 위한 보조 추천은 제외.

| # | 제안 문헌 | 이유 (어떤 gap을 채우는지) | 추가 위치 | 우선순위 |
|---|----------|------|----------|----------|
| 1 | Anthropic, **Model Context Protocol (MCP)** specification, 2024 (공식 docs/spec; modelcontextprotocol.io) | "tool-use가 engineering 문제"라는 §2 agents 단락에서 현재 ToolLLM만 거론된다. 2024년 이후 enterprise tool integration의 사실상 표준이 된 MCP가 비어 있어, 본 논문의 "code-owned harness가 LangGraph/CrewAI/AutoGen/LangChain agent와 보완적"이라는 주장의 외연이 좁아진다. | §2 "LLM agents and orchestration" 두 번째 단락 끝 (orchestration framework 나열 직후) | 높음 |
| 2 | OpenAI, **Function calling and the Chat Completions API** (또는 후속 OpenAI structured outputs 가이드, 2024) | `instructor2026software`만으로는 typed-schema 제약의 근거가 software citation 한 편에 의존. function calling / structured outputs는 본 논문의 "answer contract / output validation"의 1차 근거. | §2 "Programmable LLM pipelines" 단락 (Instructor 인용 부근) | 높음 |
| 3 | Xi et al., **"The Rise and Potential of Large Language Model Based Agents: A Survey"** (arXiv 2309.07864, 2023) 또는 Sumers et al., **"Cognitive Architectures for Language Agents"** (TMLR 2024) | 현재 agent survey 2편(`wang2024surveyagents`, `acharya2025agentic`)은 일반·광범위 survey. enterprise-deployment·cognitive-architecture 관점이 비어 있어 본 논문의 "enterprise hardening" 포지셔닝과의 직접 대비가 약함. | §2 "LLM agents and orchestration" 첫 단락 끝 (survey 인용군 보강) | 중간 |
| 4 | Lála et al., **PaperQA / PaperQA2** (Nature 2024) 또는 Menick et al., **GopherCite** (Nature/Anthropic 2022) | `min2023factscore` / `asai2024selfrag`가 atomic factuality·self-reflection을 다루지만, 본 논문의 "source-backed claim with claim ID + evidence record" 구조는 inline-citation/source-attributed QA에 더 가깝다. 해당 라인 문헌이 비어 있다. | §2 "RAG and traceability" 단락 끝 | 중간 |
| 5 | Shinn et al., **Reflexion** (NeurIPS 2023) 또는 Madaan et al., **Self-Refine** (NeurIPS 2023) | classical-to-ReAct/Toolformer 라인은 있지만, agent의 self-improvement·reflection 라인이 비어 있어 §2의 agent trajectory가 다소 좁다. 단, 본 논문은 self-reflection을 *핵심* 주장으로 쓰지 않아 우선순위는 중간. | §2 "LLM agents and orchestration" 첫 단락 | 중간 |
| 6 | Bai et al., **"Constitutional AI"** (Anthropic, arXiv 2212.08073, 2022) 또는 Inan et al., **"Llama Guard"** (arXiv 2312.06674, 2023) | `rebedea2023nemo`만으로 guardrails 학술 근거가 한 편. policy-as-code/leakage prevention 관점에서 본 논문의 "leakage gate / link gate / language gate"와 직접 대비. | §2 "Programmable LLM pipelines" 단락 (NeMo Guardrails 인용 부근) | 낮음 |
| 7 | Mialon et al., **"Augmented Language Models: A Survey"** (TMLR 2023, arXiv 2302.07842) | RAG·tool-use·reasoning을 통합한 augmentation survey. 본 논문의 "RAG는 harness 안의 한 구성요소"라는 포지셔닝과 정확히 정렬. 현재 본문은 이 통합 관점을 직접 지지하는 reference가 없다. | §2 "RAG and traceability" 단락 또는 introduction | 낮음 |

자기 인용 검토: 자기 인용 후보는 `ahn2025autonomous`(Electronics 저널 논문)와 `ahnkim2026advisorrepo`(repo placeholder) 2건. 49개 중 2건(약 4.1%, repo placeholder를 재현성 포인터로 제외 시 1건/약 2%)으로 학술적 적절성 기준(통상 ≤10–15%) 내. **자기 인용 추가 권고 없음.**

## 5. 인용 맥락 점검

본문의 \cite 사용을 spot-check 했다(중복 인용 포함 41건 전수). "맥락 적절성"은 인용된 문헌의 공개 메타데이터·초록 기준으로 평가했다.

| # | 위치 | `\cite` 사용 | 맥락 적절성 | 비고 |
|---|------|-------------|------------|------|
| 1 | §1 Intro L3 | `\citep{karpathy2025vibecoding,meske2025vibecoding}` — "vibe coding, a conversational AI-assisted software workflow popularized by Karpathy" | 적합 | Karpathy 원포스트 + Meske 학술 정의 논문 조합 정확. |
| 2 | §1 Intro L3 | `\citep{ji2023hallucination,martinezfernandez2022seai,kreuzberger2023mlops}` — "hallucination and SE controls for AI systems" | 적합 | hallucination survey + SE-for-AI survey + MLOps 논문 조합 정확. |
| 3 | §1 Intro L5 | `\citep{ceoai2026leadership}` — "ten-week AI leadership program hosted by CEOAI" | 적합 (보조) | 프로젝트 맥락 출처. 사실관계만 기술해 안전. |
| 4 | §1 Intro L5 | `\citep{replit2026platform}` — "Replit-hosted demonstrations" | 적합 (보조) | 플랫폼 사용 사실. 안전. |
| 5 | §1 Intro L7 | `\citep{isoiecieee2017vocabulary}` — test harness 정의 | 적합 | ISO/IEC/IEEE 24765:2017 vocabulary. test harness 정의 인용으로 정확. 24765의 정확한 정의 문구 그대로인지 PDF 원문 확인 권장(저자 수작업). |
| 6 | §1 Intro L7 | `\citep{karpathy2026llmwiki}` — "Maintained wiki pages, following the LLM Wiki pattern" | 적합 (보조) | "pattern"으로 표현해 학술 evidence가 아닌 design pattern 사용. 안전. |
| 7 | §2 RAG L6 | `\citep{lewis2020rag,gao2023rag}` — RAG가 외부 문서로 grounding/updateability 강화 | 적합 | 원논문 + survey. 정확. |
| 8 | §2 RAG L6 | `\citep{asai2024selfrag}` — "self-reflective retrieval methods ask whether retrieval is needed and whether generation is supported" | 적합 | Self-RAG의 adaptive retrieval/reflection token 기능을 정확하게 요약. |
| 9 | §2 RAG L6 | `\citep{min2023factscore}` — "factuality metrics decompose long-form answers into atomic claims" | 적합 | FActScore의 atomic fact decomposition을 정확히 요약. 본 논문 source-backed claim 설계와 직결. |
| 10 | §2 RAG L6 | `\citep{ji2023hallucination}` — "fluent generation may still hallucinate" | 적합 | hallucination survey의 핵심 주장과 일치. |
| 11 | §2 Agents L9 | `\citep{wooldridge1995intelligent,jennings1998roadmap}` — classical agent autonomy/interaction/architecture | 적합 | 고전 agent 문헌 정확. |
| 12 | §2 Agents L9 | `\citep{yao2023react,schick2023toolformer,wang2024surveyagents,acharya2025agentic}` — tool use, planning, search, intermediate execution traces로의 확장 | 적합 | 4편 모두 LLM agent의 tool-use·planning 트랙과 일치. survey 2편이 함께 묶여 "extended"의 근거가 폭넓음. |
| 13 | §2 Agents L9 | `\citep{qin2024toolllm}` — "API selection and execution are engineering concerns as well as prompting concerns" | 적합 | ToolLLM은 16000+ real-world API tool-use 데이터/벤치마크로 이 주장을 정확히 지지. |
| 14 | §2 Agents L9 | `\citep{ahn2025autonomous,walters2025eliza}` — "applied work also reports multi-platform agent deployment and programmable agent runtime architectures" | **부분 적합** | Ahn & Kim = multi-platform deployment(자기 인용), ElizaOS = agent operating system runtime으로 매핑. 두 문헌을 한 번에 인용하면서 deployment/runtime의 *순서·역할*이 본문에서 묶여 있어, 독자가 ElizaOS도 deployment study로 오인할 여지. 2026-05-09 audit에서도 동일 지적. **의심 사례 1.** `respectively` 삽입 또는 두 문장 분리 권장. |
| 15 | §2 Agents L11 | `\citep{wu2024autogen}` — "AutoGen supports multi-agent conversation and coordination" | 적합 | AutoGen 논문의 핵심 기여와 정확히 일치. |
| 16 | §2 Agents L11 | `\citep{langchain2026agents,langchain2026langgraph}` — "LangChain Agents provide prebuilt tool-calling loops and LangGraph provides graph-based runtimes for stateful agents" | 적합 | 공식 문서/repo로 framework capability 설명. software citation 사용 적절. |
| 17 | §2 Agents L11 | `\citep{crewai2026software}` — "CrewAI organizes role-based agents, crews, and flows" | 적합 | CrewAI 공식 repo README의 용어와 일치. |
| 18 | §2 Prompt L14 | `\citep{brown2020language,liu2023pretrain}` — "large language models can perform new tasks from natural-language instructions and in-context examples" | 적합 | GPT-3 few-shot + prompting survey. 정확. |
| 19 | §2 Prompt L14 | `\citep{giray2023prompt}` — "Prompt engineering also entered broader academic and practitioner discourse" | **부분 적합** | Giray 2023은 *academic writers* 대상 prompting 가이드(Annals of Biomedical Engineering)로 도메인이 좁다. "broader academic and practitioner discourse"의 일반 근거로는 약함. **의심 사례 2.** 본문 표현은 안전권이지만 더 일반적인 prompt-discourse 문헌이 있으면 보강 가능. |
| 20 | §2 Prompt L14 | `\citep{wei2022chain}` — "chain-of-thought prompting further showed that changing the prompt can substantially change reasoning behavior" | 적합 | CoT 원논문의 핵심 발견과 일치. |
| 21 | §2 Prompt L14 | `\citep{karpathy2025vibecoding,meske2025vibecoding,malamas2025vibecoding}` — vibe coding 정의/연구 의제 | 적합 | 원포스트 + 학술 정의 + LLM-based agent 사례 3편으로 polyphonic 인용. 적절. |
| 22 | §2 Programmable L17 | `\citep{khattab2022demonstrate,khattab2024dspy}` — Demonstrate-Search-Predict and DSPy as composable declarative programs | 적합 | DSP 논문 + DSPy 논문. 정확. |
| 23 | §2 Programmable L17 | `\citep{stanfordnlp2026dspysoftware}` — DSPy software artifact | 적합 | software citation으로 적절. 본문도 software artifact로 명시. |
| 24 | §2 Programmable L17 | `\citep{beurerkellner2023lmql,guidance2026software}` — "LMQL and Guidance treat model interaction as controlled execution" | 적합 | LMQL 논문 제목 *Prompting Is Programming*과 "controlled execution"이 일치. Guidance도 constrained generation으로 정확. |
| 25 | §2 Programmable L17 | `\citep{instructor2026software}` — "Instructor uses typed schemas to constrain outputs" | 적합 | Instructor README의 Pydantic-schema 설명과 일치. |
| 26 | §2 Programmable L17 | `\citep{rebedea2023nemo}` — "Runtime guardrail systems such as NeMo Guardrails similarly show how user-defined rails can control conversational behavior independently of the underlying model" | 적합 | NeMo Guardrails 논문의 programmable rails 주장과 정확히 일치. |
| 27 | §2 Programmable L17 | `\citep{karpathy2026autoresearch}` — "Autoresearch illustrates how improvement can be organized as repeatable experiments with explicit logs" | 적합 (보조) | personal repo citation. "illustrates" 표현으로 안전 사용. |
| 28 | §2 Wiki L20 | `\citep{karpathy2026llmwiki}` — Karpathy의 LLM Wiki pattern | 적합 (보조) | Gist citation. "pattern"으로 보조 인용 적절. |
| 29 | §2 Validation L23 | `\citep{martinezfernandez2022seai,ashmore2021assuring}` — production AI에 data management, testing, lifecycle, assurance artifacts 필요 | 적합 | SE-for-AI survey + ML assurance 논문 조합 정확. |
| 30 | §2 Validation L23 | `\citep{kreuzberger2023mlops}` — MLOps가 lifecycle/operationalization을 다룸 | 적합 | MLOps 정의/아키텍처 논문과 일치. |
| 31 | §2 Validation L23 | `\citep{es2023ragas,saadfalcon2024ares}` — RAG evaluation: faithfulness, answer relevance, context precision/recall | 적합 | RAGAS + ARES 두 평가 프레임워크 정확. |
| 32 | §2 Validation L23 | `\citep{liang2023helm}` — broader benchmark work supporting multi-scenario evaluation | 적합 | HELM의 broad scenario/metric 주장과 일치. |
| 33 | §2 Validation L23 | `\citep{promptfoo2026software}` — "Practitioner tools also support prompt, model, and application regression checks" | 적합 (보조) | 실무 도구 citation으로 적절. |
| 34 | §3 Method L26 | `\citep{karpathy2026llmwiki}` — maintained markdown knowledge pages between raw sources and runtime answers | 적합 (보조) | Wiki pattern 차용 사실 기술. 안전. |
| 35 | §3 Method L39 | `\citep{ahnkim2026advisorrepo}` — placeholder repo | 적합 (보조) | "should be replaced with the final GitHub URL" 명시. 단, **arXiv 제출 직전 실제 URL/commit hash 교체 필수**(BibTeX `note`에도 명시). |
| 36 | §4 Data L8 | `\citep{ftc2026businessgroups}` — Samsung, SK, Hyundai Motor, LG, Hanwha를 2026 fair-value asset 기준 top-5로 선정 | 적합 (수작업 확인 권장) | KFTC 공식 보도자료 1차 사료. 5개 그룹 순위가 첨부 PDF의 실제 ranking 표와 일치하는지 저자 수작업 확인 필요. |
| 37 | §4 Data L39 | `\citep{opendart2026api,krx2026openapi,naver2026newssearch}` — OpenDART, KRX OPEN API, NAVER News Search를 interface sources로 사용 | 적합 | 공식 API 문서 1차 사료. |
| 38 | §5 Validation L37 | `\citep{es2023ragas,saadfalcon2024ares,liang2023helm}` — "narrower than full RAG evaluation" | 적합 | 본 논문 평가가 더 좁다는 비교 인용으로 안전. |
| 39 | §6 Discussion L10 | `\citep{khattab2024dspy}` — "DSPy-style program optimization focuses on compiling and optimizing language-model pipelines" | 적합 | DSPy의 핵심 기여와 정확히 일치. |
| 40 | §6 Discussion L10 | `\citep{kreuzberger2023mlops}` — "MLOps addresses broader lifecycle deployment concerns" | 적합 | MLOps 범위가 더 넓다는 비교로 안전. |
| 41 | §6 Discussion L21 | `\citep{ahnkim2026advisorrepo}` — public submission 시 repo URL + commit hash 기록 | 적합 (보조) | 재현성 placeholder. arXiv 제출 전 교체. |

총 41건 점검. **부적합 0건 / 부분 적합 2건 (의심 사례 #14, #19) / 적합 39건.**

## 6. BibTeX 형식 점검

| BibKey | 점검 결과 | 비고 |
|---|---|---|
| `gao2023rag` | journal로 arXiv preprint 사용. DOI 있음. | preprint citation 형식 OK. |
| `khattab2022demonstrate` | journal로 arXiv preprint 사용. DOI 있음. | preprint citation OK. |
| `walters2025eliza` | journal로 arXiv preprint 사용. DOI 있음. | OK. |
| `karpathy2025vibecoding` | url + howpublished=X 포스트, 접속일 명시. | OK. |
| `karpathy2026llmwiki`, `karpathy2026autoresearch` | url + howpublished + note 모두 있음. | OK. |
| `ahnkim2026advisorrepo` | url이 `REPLACE-WITH-PUBLIC-REPOSITORY` placeholder. note에 교체 안내 명시. | **arXiv 제출 전 실제 repo URL + version-v1 commit hash로 반드시 교체 필요.** 미교체 시 broken reference. |
| `ceoai2026leadership`, `replit2026platform` | url + note(접속일). | OK. |
| `ftc2026businessgroups` | url + 접속일 + PDF 첨부 언급. | url이 매우 긴 query string 포함. archive.org 등 안정 URL 병기 권장(선택). |
| `opendart2026api`, `krx2026openapi`, `naver2026newssearch` | url + 접속일. | OK. |
| `langchain2026langgraph`, `langchain2026agents`, `crewai2026software`, `stanfordnlp2026dspysoftware`, `guidance2026software`, `instructor2026software`, `promptfoo2026software` | software/docs citation. url + 접속일 모두 있음. | OK. version/commit hash가 있으면 더 안전하지만 software citation 표준 범위 내. |
| `isoiecieee2017vocabulary` | techreport + number=ISO/IEC/IEEE 24765:2017 + institution + url. | OK. |
| 학회 논문 일반 (`liang2023helm`, `es2023ragas`, `lewis2020rag`, `yao2023react` 등) | author/title/booktitle/year/pages/doi 갖춤. | OK. |

**식별된 BibTeX 이슈**:
1. **`ahnkim2026advisorrepo`**: placeholder URL — 제출 전 교체 필수 (P0).
2. `ftc2026businessgroups`: 매우 긴 query string URL — archive.org 등 안정 URL 병기 권장 (P2, 선택).
3. 형식적 누락 사항(저자명·연도·URL/DOI 누락 등)은 발견되지 않음.

## 7. 권고 요약

1. **P0 (제출 차단)** — `ahnkim2026advisorrepo`의 placeholder URL을 실제 공개 repo URL + version-v1 commit hash로 교체. BibTeX `note` 필드에 이미 명시된 작업.
2. **P1 (보강 권장)** — §2 "LLM agents and orchestration" 단락에 **Model Context Protocol (MCP)** 인용 추가. 현재 orchestration framework 4종(AutoGen/LangChain/LangGraph/CrewAI)은 충분히 커버되지만 tool/data integration 표준이 비어 있어, 본 논문의 "code-owned harness" 포지셔닝의 외연이 좁아진다.
3. **P1 (보강 권장)** — §2 "Programmable LLM pipelines" 단락에 **OpenAI function calling / structured outputs** 1차 출처 추가. 현재 typed-schema 근거가 `instructor2026software` software citation 한 편에 의존.
4. **P2 (정정 권장)** — §2 Agents L9의 `\citep{ahn2025autonomous,walters2025eliza}` 인용은 본문에서 "multi-platform agent deployment and programmable agent runtime architectures"를 한 줄로 묶고 있어, ElizaOS도 deployment study로 오인될 여지가 있다. `respectively` 삽입 또는 두 문장으로 분리.
5. **P2 (정정 권장)** — §2 Prompt L14의 `\citep{giray2023prompt}` 인용은 *academic writers* 대상의 도메인 한정 가이드(Annals of Biomedical Engineering)다. "broader academic and practitioner discourse"의 일반 근거로는 약함. 본문 표현 자체는 안전권이라 치명적이지 않지만, 더 일반적인 prompt-engineering discourse 문헌(예: White et al. "A Prompt Pattern Catalog", 2023; Schulhoff et al. "The Prompt Report", 2024)으로 보강·교체 가능.
6. **P2 (선택)** — "LLM Wiki and knowledge management" 주제가 `karpathy2026llmwiki` 1편에 의존. 본 논문이 이 주제를 "pattern, illustrates" 수준으로만 사용해 현 상태도 안전하지만, peer-reviewed 보강을 원하면 knowledge graph / entity-centric memory 관련 문헌 1편 추가 검토 가능.
7. **P3 (수작업)** — `ftc2026businessgroups` 보도자료 PDF에서 Samsung/SK/Hyundai Motor/LG/Hanwha 순위가 본문 표현(2026 ranking by fair-value assets, Hanwha entered fifth place)과 일치하는지 저자가 첨부 PDF 재확인.
8. **유지** — 자기 인용 비율은 49건 중 2건(약 4.1%, repo placeholder 제외 시 1건/약 2%)으로 학술적 적절성 기준 내. **자기 인용 추가 권고 없음**.
9. **유지** — Karpathy Gist/repo citation은 모두 "pattern", "illustrates" 표현으로 보조 인용 처리되어 있어 안전. peer-reviewed evidence와 명확히 구분되어 있다.
