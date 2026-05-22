# Revision Response Notes

작성일: 2026-05-09

대상: 두 번째 구조·문헌·표현 리뷰에 대한 반영 여부 판단

## 수용한 피드백

- Guardrails 선행 연구 인용 추가: NeMo Guardrails를 Related Work에 추가하고 `rebedea2023nemo` BibTeX를 등록했다. Output contract와 development-leakage prevention을 논문에서 사용하므로 guardrails 문헌과의 연결은 필요하다.
- Boundary 주장 완화: `main boundary`, `reduces the burden`, `enterprise LLM agents should`, `failures can be localized`, `broader lesson` 등 과도하게 일반화될 수 있는 표현을 case-study 또는 architecture-intent 수준으로 낮췄다. 이는 리뷰어가 추가 실험 근거를 요구할 가능성을 줄인다.
- Conclusion artifact 반복 축약: 8개 artifact 열거를 줄이고, Section 3의 harness artifacts로 참조하도록 수정했다.
- Discussion 선행 연구 비교 추가: DSPy와 MLOps 대비 본 논문의 위치를 2문장으로 보강했다. 본 논문은 prompt/module optimization이나 전체 ML lifecycle이 아니라 evidence contract와 trace surface 중심의 product harness를 다룬다고 정리했다.
- 용어 일관성: `development-leakage prevention`을 정식 표현으로 사용하도록 주요 섹션을 정리했다.
- 문장 교정: `five-group ... all five groups` 중복을 제거했다.

## 수용하지 않은 피드백

- LangChain/LlamaIndex 본문 추가: 반영하지 않았다. 본 논문은 범용 LLM orchestration framework 비교 논문이 아니며, 해당 프레임워크를 언급하면 왜 사용하지 않았는지, 어떤 기준으로 비교했는지, baseline 실험이 있는지에 대한 추가 요구가 생긴다. 현재 논문의 중심 주장은 product-level harness reconstruction이므로, 본문에는 DSPy, Instructor, Guidance, LLM Wiki, autoresearch, guardrails, MLOps 수준의 직접 관련 축만 유지하는 것이 더 안전하다.

## 남은 점검

- 실제 UI 이미지와 trace 예시를 placeholder 대신 삽입해야 한다.
- `arxiv-paper/artifacts/*.md` 중 일부 리뷰 리포트는 수정 전 상태를 기록한 historical artifact다. 제출 전에는 최신 PDF 기준으로 한 번 더 구조·문헌·표현 점검을 수행해야 한다.
- C2 source-to-claim pipeline의 완전한 독립 검증은 아직 제한적이다. 현재는 referential integrity와 runtime claim 사용 검증으로 방어하고, 더 정밀한 claim promotion precision/recall은 후속 실험 또는 SCI 단계에서 다룬다.
