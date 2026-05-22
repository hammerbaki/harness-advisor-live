# arxiv-paper Project

이 프로젝트는 "Beyond Prompting: Harness Engineering for Enterprise LLM Agents" 논문 작성 프로젝트입니다.

## 논문 구조

- `main.tex`: 메인 파일
- `sections/`: 섹션별 .tex 파일
- `bib/references.bib`: 참고문헌
- `notes/`: 전략 노트, 데이터 요구사항

## 논문 리뷰 하네스

이 프로젝트에는 논문 평가·보완을 위한 Claude Code 하네스가 있습니다.

### 주요 위치

- Orchestrator: `.claude/skills/paper-review-orchestrator/`
- Agent: `.claude/agents/` (structure-analyst, claim-auditor, citation-scout, style-editor, review-synthesizer)
- Skill: `.claude/skills/` (structure-review, claim-audit, citation-review, style-edit, review-synthesis)
- 산출물: `artifacts/`
- 개선 기록: `artifacts/evolution-log.md`

### 자연어 라우팅

사용자가 스킬명을 직접 입력하지 않아도 논문 리뷰 관련 요청이면 `paper-review-orchestrator`를 먼저 사용합니다.

예:

- "논문 리뷰해줘"
- "전체 리뷰 돌려줘"
- "Discussion 부분 검토해줘"
- "claim 경계 넘지 않았는지 확인해줘"
- "참고문헌 부족한 거 없는지 봐줘"
- "영어 교정해줘"
- "모의 피어리뷰 만들어줘"
- "방금 수정한 부분 점검해줘"

### 사용 흐름

1. 자연어 요청이 논문 리뷰 범위에 들어오면 `paper-review-orchestrator`를 우선 실행합니다.
2. Orchestrator가 실행 모드(전체/섹션/빠른 점검)를 판단하고 필요한 Agent를 선택합니다.
3. 사용자가 특정 Agent를 직접 지정한 경우에만 해당 Agent를 바로 사용합니다.
4. 결과는 `artifacts/`에 남기고, 수정 후 재실행할 수 있습니다.

### 핵심 원칙

- `notes/current_paper_strategy.md`의 safe/unsafe claims 경계를 항상 존중합니다.
- 논문 .tex 파일을 직접 수정하기 전에 반드시 사용자 승인을 받습니다.
- 리포트는 `artifacts/`에 남기고, 수정 이력은 `artifacts/evolution-log.md`에 기록합니다.
