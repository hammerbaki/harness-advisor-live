# Live LLM Output Contract

## Purpose

The project should not make the live LLM responsible for product controls that
can be specified in code. The live LLM may phrase the final investor-facing
briefing, but the runtime must still own the answer shape, source boundaries,
links, follow-up questions, and trace visibility.

The contract now also owns the audience posture of the visible answer. The
answer must lead with an insight for the reader, not with a narration of what
the system retrieved, validated, or traced.

This document records the current step in the prompt-to-code migration:

```text
short policy prompt -> bounded context -> structured output contract ->
code validation -> UI rendering
```

## Current Implementation

The contract is implemented in:

```text
server/index.mjs
raw/manifests/llm-output-contract.json
```

When `ANTHROPIC_API_KEY` is absent, the deterministic composer remains the
runtime path. When a live LLM is available, the model must return a JSON object
with sectioned Korean investor briefing content. The code then validates and
renders that structure.

If validation fails, the runtime falls back to the deterministic composer.
Failure is visible in the developer trace and exported evaluation JSON, not in
the default customer UI.

## What The Contract Owns

The live LLM output may contain only:

- `sections`: three to six investor-facing sections;
- section titles from the approved title set;
- Korean briefing prose or bullet lines;
- an optional source-limitation note.

Approved section titles are broader than one fixed template:

```text
핵심 인사이트
왜 중요한가
근거 신호
반증 리스크
다음 관찰 포인트
현황요약
이슈 요약
공시 연결
시장 반응
재무 포인트
산업맥락
사업 파이프라인
가치제고 포인트
주주환원 체크
거버넌스 포인트
공시·IR 체크
브리핑 검토축
확인 우선순위
리스크 체크
```

The runtime also attaches an `answerPlan` to the bounded context. The plan
chooses recommended section titles by question intent:

| Intent | Recommended sections |
| --- | --- |
| general/news | 핵심 인사이트, 근거 신호, 반증 리스크, 다음 관찰 포인트 |
| financial | 핵심 인사이트, 재무 포인트, 반증 리스크, 다음 관찰 포인트 |
| pipeline | 핵심 인사이트, 사업 파이프라인, 반증 리스크, 다음 관찰 포인트 |
| value-up | 핵심 인사이트, 주주환원 체크, 반증 리스크, 다음 관찰 포인트 |
| governance | 핵심 인사이트, 거버넌스 포인트, 반증 리스크, 다음 관찰 포인트 |

This prevents the contract from becoming a rigid answer template. The safety
rules stay fixed, but the table of contents changes with the user's question.
The stable first section is intentional: every audience-facing answer must first
say what matters. The middle section changes by intent, and the process trace
stays outside the default answer.

## What Remains Code-Owned

These must not be delegated to prompts or model interpretation:

- group and company routing;
- DART/KRX/news collection;
- source-backed claim selection;
- LLM Wiki namespace loading;
- links and source package construction;
- follow-up question generation;
- user/developer UI separation;
- trace envelope creation;
- latency and auto-evaluation checks.
- the rule that process evidence supports the answer but does not become the
  answer itself.

## Why Not Install Instructor Yet

Instructor is a good future runtime guard because it formalizes structured
outputs, Pydantic validation, and retry behavior. It is not necessary as a
runtime dependency yet because the current Node/Replit app only needs a small
contract around one LLM boundary.

The current hand-rolled validator is intentionally narrow. It proves the
architecture:

```text
the model can write prose, but code decides whether the prose is admissible
```

The contract should not freeze expression quality. To avoid overly mechanical
answers, the evaluation loop checks whether frozen scenarios all reuse the same
generic section pattern.

If live LLM composition becomes central, the next step is to replace this
validator with an Instructor or equivalent typed-output layer. That migration
should be justified by failing live-output traces or maintenance burden, not by
framework fashion.

## Relationship To DSPy

DSPy remains the selected research framework for offline optimization. It
should optimize the answer composer against frozen scenarios and the
`advisor-answer-quality-v0.2` rubric.

The runtime contract is complementary:

- DSPy asks whether a composer is better;
- the output contract decides whether any live composer output is admissible;
- the deterministic composer remains the baseline and fallback.

## Paper Claim Boundary

The paper can state that the reference implementation introduces a
code-validated LLM output boundary inspired by structured-output frameworks.
It should not claim that Instructor or DSPy is fully deployed in production.

Accurate wording:

```text
The reference implementation keeps deterministic controls in code and validates
the live LLM composition boundary against a structured answer contract. DSPy is
reserved for offline composer optimization, while Instructor-style validation
is identified as the next runtime hardening path.
```
