# Answer Generation Process Trace

## Purpose

The original PoC showed users that the advisor was collecting and analyzing
data before answering. That interaction mattered because it made a slow LLM
workflow feel intentional and inspectable.

The reconstructed project keeps that value, but moves the process from
prompt-driven narration into code-owned trace structures.

## Current Runtime Contract

Each advisor response now contains two related process layers:

1. `processTrace`: tool/source execution trace.
2. `answerAssembly`: answer-composition trace.

`processTrace` records runtime sources:

- `dart.disclosures`;
- `krx.market`;
- `news.search`;
- `wiki.context`;
- `claims.sourceBacked`;
- `llm.compose`.

`answerAssembly` records how the answer was assembled:

- `intent.route`;
- `source.collect`;
- `wiki.crosscheck`;
- `claim.select`;
- `answer.plan`, including output-contract status when live LLM composition is
  enabled;
- `guardrail.validate`.

The user sees concise process status and final investor-facing prose. The
developer and paper reviewer can open the development panel or trace JSON to
inspect the full assembly chain.

As of the insight-first harness revision, the visible answer must not treat the
analysis process itself as the result. The first visible section is now
`핵심 인사이트`; collection, validation, claim selection, and source-state
details remain in `processTrace`, `answerAssembly`, and developer UI.

## Why This Is Better Than Prompt Narration

The initial PoC could ask the model to say that it was collecting, analyzing,
and composing. That is useful for a demo, but it is not reliable evidence.

The current design records the process in code:

- source status is measured from runtime outputs;
- selected claims come from manifests;
- answer sections are parsed from the visible answer;
- live LLM section output is validated against a code-owned contract before
  rendering;
- development leakage is checked by guardrail code;
- source limitation disclosure is detected separately from the LLM.

This makes the process auditable and reusable across Samsung, SK, Hyundai Motor,
LG, Hanwha, and future client projects.

## UI Policy

Default user UI:

- show clean investor-facing answer that leads with audience-facing insight;
- show source links and follow-up questions;
- show concise process status above the answer, because the process precedes
  answer generation in the user's mental model;
- hide raw runtime modes from the default process header after completion;
- translate raw runtime modes only inside development UI, for example
  `mixed` -> `부분 연결`.
- do not show paper/evaluation/log questions or trace links in the default
  customer flow.

Development UI:

- mark developer-only controls with a visible `DEV` label;
- show quality checks;
- show answer section map;
- show `answerAssembly`;
- show tool trace;
- show selected source-backed claims.
- show trace JSON export only inside the development panel.
- show live LLM output-contract fallback details only in development/paper
  traces, not in the default customer answer.

Paper trace:

- store the full JSON under `evals/traces/`;
- keep raw claim IDs and source states out of the default user answer;
- use trace screenshots/tables only when discussing methodology.

## Original PoC Reuse

Retained:

- visible long-running analysis affordance;
- status-step ordering;
- follow-up question continuity;
- development/operator inspection concept.

Refactored:

- model-written process narration became `answerAssembly`;
- answer output changed from process/result narration to an insight-first
  section plan;
- raw debug prose moved out of the user answer;
- hidden prompt/RAG behavior became source and claim manifests;
- regression concerns became auto-eval checks.

Deferred:

- full original-style `POST /chat -> turnId` and `GET /chat/poll` streaming
  parity.

That polling architecture should be restored when live DART/news/LLM calls make
latency long enough that simulated pending steps are no longer sufficient.

## Evaluation Requirement

The advisor auto-eval `trace_contract` check now requires the expected
`answerAssembly` step order. The `briefing_quality` check also requires the
visible answer to begin with `핵심 인사이트`, include a risk/contradiction
section, and preserve ranked observation points. A response can remain
investor-facing and concise while still carrying the full research trace for
evaluation.
