# Citation Report

생성일: 2026-05-09

> **주의**: 현재 bib/references.bib에는 14편이 등록되어 있음. 아래 분석은 실제 .bib 기준.

## 현재 참고문헌 요약

| # | BibKey | 저자 | 연도 | 유형 | 주제 영역 |
|---|--------|------|------|------|----------|
| 1 | lewis2020rag | Lewis et al. | 2020 | conference (NeurIPS) | RAG / grounded generation |
| 2 | gao2023rag | Gao et al. | 2023 | arXiv survey | RAG / grounded generation |
| 3 | yao2023react | Yao et al. | 2023 | conference (ICLR) | LLM agents / tool use |
| 4 | schick2023toolformer | Schick et al. | 2023 | conference (NeurIPS) | LLM agents / tool use |
| 5 | khattab2024dspy | Khattab et al. | 2024 | conference (ICLR) | Programmable LLM pipelines |
| 6 | stanfordnlp2026dspysoftware | Stanford NLP | 2026 | software repo | Programmable LLM pipelines |
| 7 | beurerkellner2023lmql | Beurer-Kellner et al. | 2023 | conference (ACM) | Programmable LLM pipelines |
| 8 | guidance2026software | Guidance AI | 2026 | software repo | Programmable LLM pipelines |
| 9 | instructor2026software | 567 Labs | 2026 | software repo | Programmable LLM pipelines |
| 10 | karpathy2026llmwiki | Karpathy | 2026 | gist | Knowledge base / LLM Wiki |
| 11 | karpathy2026autoresearch | Karpathy | 2026 | software repo | Knowledge base / LLM Wiki |
| 12 | es2023ragas | Es et al. | 2023 | arXiv | Evaluation of grounded generation |
| 13 | ahn2025autonomous | Ahn & Kim | 2025 | journal (Electronics) | LLM agents / deployment study |
| 14 | ceoai2026leadership | CEOAI | 2026 | misc (website) | 맥락 출처 (프로그램 참조) |

## 연도 분포

| 연도 범위 | 편수 | 비고 |
|----------|------|------|
| 2020 | 1 | RAG 원논문 |
| 2023 | 5 | RAG survey, ReAct, Toolformer, LMQL, RAGAS |
| 2024 | 1 | DSPy |
| 2025 | 1 | 자기 인용 (Electronics) |
| 2026 | 5 | 소프트웨어 리포/gist 4편 + CEOAI 맥락 참조 |

**평가**: peer-reviewed 학술 문헌 7편, 소프트웨어/gist 5편, arXiv 2편. 학술 문헌 비율이 낮은 편.

## 주제별 커버리지

| 주제 | 현재 인용 | 커버리지 | 비고 |
|------|----------|---------|------|
| RAG / grounded generation | lewis2020rag, gao2023rag | **보통** | 원논문 + survey. Self-RAG, hallucination 관련 문헌 부재 |
| LLM agents / tool use | yao2023react, schick2023toolformer, ahn2025autonomous | **보통** | 핵심 2편 있으나 agent survey, 최근 orchestration 문헌 부재 |
| Enterprise AI / deployment | ahn2025autonomous만 (자기 인용) | **부족** | SE-for-AI, MLOps, enterprise LLM 배포 문헌 전무 |
| Prompt-to-code / programmable LLM pipelines | khattab2024dspy + 소프트웨어 4편 | **보통** | 학술 논문 1편. LangChain/LlamaIndex 미언급 |
| Knowledge base / LLM Wiki | karpathy2026llmwiki, karpathy2026autoresearch | **부족** | 비공식 출처 2편만. 학술 문헌 없음 |
| Evaluation of grounded generation | es2023ragas | **부족** | 1편만. FActScore, ARES, HELM 등 부재 |

## 누락 후보 문헌

| # | 제안 문헌 | 이유 | 추가 위치 | 우선순위 |
|---|----------|------|----------|----------|
| 1 | Rebedea et al. (2023). "NeMo Guardrails: A Toolkit for Controllable and Safe LLM Applications." EMNLP Demo. | leakage prevention/output contract가 핵심 기여인데 guardrails 선행 연구 인용 전무 | S2 para 4 "Programming instead of prompting" | **높음** |
| 2 | Ji et al. (2023). "Survey of Hallucination in Natural Language Generation." ACM Computing Surveys. | source-backed claims의 동기(hallucination 방지)에 대한 학술적 근거 | S2 para 1 "RAG and grounded answers" | **높음** |
| 3 | Wang et al. (2024). "A Survey on Large Language Model based Autonomous Agents." Frontiers of CS. | LLM agent 분야 포괄적 survey. 현재 agent survey 부재 | S2 para 2 "LLM agents, tools" | **높음** |
| 4 | Min et al. (2023). "FActScore: Fine-grained Atomic Evaluation of Factual Precision." EMNLP. | claim-level factuality 평가와 직접 관련 | S2 para 6 "Evaluation" | 중간 |
| 5 | Kreuzberger et al. (2023). "Machine Learning Operations (MLOps)." IEEE Access. | enterprise AI 배포 프로세스의 체계적 참조 | S2 para 3 또는 새 enterprise 단락 | 중간 |
| 6 | LangChain (Chase, 2022) 또는 LlamaIndex (Liu, 2022) | 가장 대중적인 LLM 오케스트레이션 프레임워크. 의도적 제외라면 이유 명시 필요 | S2 para 4 | 중간 |
| 7 | Pan et al. (2024). "Unifying LLMs and Knowledge Graphs: A Roadmap." IEEE TKDE. | Knowledge base 주제의 학술 기반 보강 | S2 para 5 "LLM Wiki" | 낮음 |
| 8 | Saad-Falcon et al. (2024). "ARES: An Automated Evaluation Framework for RAG." NAACL. | RAG 평가 체계 보강 | S2 para 6 "Evaluation" | 낮음 |

## 인용 맥락 점검

| 섹션 | \cite 횟수 | 비고 |
|------|-----------|------|
| 01_introduction | 1 | ceoai2026leadership만. 적절 |
| 02_related_work | ~15 | 전체 bib 활용. 적절 |
| 03_method | 0 | 자체 설계 기술. 허용 |
| 04_data | 0 | 자체 데이터 기술. 허용 |
| 05_system_validation | 0 | **주의** -- 기존 평가 프레임워크와 비교 부재 |
| 05_discussion | 0 | **주의** -- 선행 연구와의 차별점 비교 부재 |
| 06_conclusion | 0 | 일반적으로 허용 |

## 권고 요약

### 필수 (arXiv 투고 전)

1. **Guardrails 문헌 추가**: output contract/leakage prevention이 핵심 기여인데 선행 연구 인용 전무.
2. **Enterprise AI / deployment 문헌 보강**: 자기 인용 1편만으로는 enterprise 도메인 positioning이 약함.
3. **Hallucination survey 추가**: source-backed claims의 동기를 학술적으로 뒷받침.

### 권장

4. **Agent survey 1편 추가**: LLM agent 분야의 학술적 맥락 확보.
5. **Evaluation 문헌 보강**: RAGAS 1편만으로는 evaluation 주제 커버리지 부족.
6. **Discussion에서 선행 연구와 비교**: harness engineering이 MLOps/SE-for-AI와 어떻게 다른지 비교하면 contribution이 명확해짐.
7. **LangChain/LlamaIndex**: 의도적 제외라면 이유 명시, 아니라면 S2에 추가.

### 종합 평가

- **현재 14편**: arXiv 논문 기준으로 다소 적음. 20-25편 수준 권장.
- **최신성**: 양호하나 소프트웨어/gist 비율이 높아 학술 문헌 보강 필요.
- **핵심 누락**: guardrails, hallucination, enterprise AI deployment, agent survey.
