# Evolution Log

논문 수정 과정에서 하네스를 실행한 이력과 개선 기록을 남긴다.

---

## 기록 형식

```
### YYYY-MM-DD - {실행 모드}

- 실행한 요청:
- 실행 모드: 전체 / 섹션({섹션명}) / 빠른 점검({관점})
- 기대한 결과:
- 실제 결과:
- 반영한 수정:
- 반영하지 않은 수정과 이유:
- 하네스 자체 개선 사항:
```

---

## 기록

### 2026-05-09 - peer-review follow-up revision

- 실행한 요청: 두 번째 구조·문헌·표현 리뷰 결과를 평가하고, 수용할 만한 피드백을 논문에 반영.
- 실행 모드: 빠른 점검(리뷰 타당성) + 섹션 수정(Related Work, Method, System Validation, Discussion, Conclusion).
- 기대한 결과: 과도한 일반화 표현을 case-study 수준으로 완화하고, guardrails 선행 연구와 Discussion 비교를 보강하며, 용어와 문장 중복을 줄임.
- 실제 결과: NeMo Guardrails 인용을 Related Work에 추가했고, `rebedea2023nemo` BibTeX를 등록함. Method/Validation/Discussion/Conclusion의 boundary 표현을 완화하고, `development-leakage prevention` 용어를 통일했으며, live smoke-test 문장의 `five` 중복을 제거함. Discussion에는 DSPy 및 MLOps 대비 차별점을 2문장으로 추가함.
- 반영한 수정: guardrails 문헌 추가, boundary 주장 6건 완화, Conclusion artifact 열거 축약, Discussion 선행 연구 비교 추가, 용어 통일, `five` 중복 제거.
- 반영하지 않은 수정과 이유: LangChain/LlamaIndex는 본문에 추가하지 않음. 본 논문은 범용 LLM orchestration framework 비교가 아니라 enterprise harness reconstruction 방법론 논문이므로, 해당 프레임워크를 언급하면 비교 실험이나 선택 근거를 추가로 요구받아 논문 범위가 불필요하게 커질 수 있음.
- 하네스 자체 개선 사항: 리뷰 대응 로그를 남겨, 이후 논문 제출 전 어떤 피드백을 수용하거나 제외했는지 추적 가능하게 함.

---

### 2026-05-16 - arXiv 투고 전 최종 전체 리뷰

- 실행한 요청: 저자(joongho)가 VS Code에서 수작업 최종 점검 중이라며, 전체 명확성·논리·레퍼런스 정합성·문장 일관성을 통합 검토 의뢰. 여러 AI가 이미 "투고 가능 수준"이라 평가한 상태에서 마지막 사람 손 점검 단계.
- 실행 모드: 전체 리뷰 (structure / claim / citation / style 4개 에이전트 병렬 → review-synthesizer 종합).
- 기대한 결과: arXiv v1 제출 적합성 판정과 제출 전 반드시 처리해야 할 P0 이슈, 그리고 우선순위 액션 리스트 도출.
- 실제 결과: 5월 9일자 리포트 5개를 `artifacts/_archive/2026-05-16/`에 백업 후 덮어쓰기. 4개 분석 리포트 신규 작성. 종합 결정 **조건부 Ready (Minor revision)**. Unsafe claim 본문 0건·산술 검증 일치·14개 guard 진술 분산 배치 등 핵심 방어선은 통과. 다만 P0 3건과 P1 5건이 새로 식별됨.
  - P0-1: `ahnkim2026advisorrepo` BibTeX placeholder URL을 실제 공개 repo + commit hash로 교체.
  - P0-2: §5.2 또는 footnote에 "113 manifest claims vs 109 expected refs" 단위 차이 1문장 설명 추가.
  - P0-3: `01_introduction.tex:9` C4 "prompt-to-code migration" 문구 완화 또는 §3.3에 간접 evidence 추가 (Introduction promise vs Method `direct measurement ... is left to later work` 자가-deferral 충돌 해소).
  - P1 주요: C3 "replaceable composition boundary" validation 추가 또는 문구 완화 / §6 Limitations subsection 신설(Discussion 4.1% 임계 미만 보강) / Citation에서 MCP·OpenAI function calling·LLM-agent survey 누락 / ElizaOS 인용 맥락 분리 / abstract "Such systems" 선행사 모호.
- 반영한 수정: (대기) — 사용자가 VS Code에서 직접 편집 중이므로 .tex 본문은 아직 미수정. CLAUDE.md 규칙에 따라 본문 수정 전 사용자 승인 필요. 액션 결정 후 별도 항목으로 기록 예정.
- 반영하지 않은 수정과 이유: 미정.
- 하네스 자체 개선 사항: 4개 에이전트 병렬 spawn → synthesizer 종합 흐름이 약 30분 내 완료됨을 확인. 산출물은 `artifacts/structure-report.md`, `claim-audit-report.md`, `citation-report.md`, `style-report.md`, `peer-review.md` 5종 + 백업본 5종(`_archive/2026-05-16/`).
