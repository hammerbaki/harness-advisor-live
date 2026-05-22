# Prompt-To-Code Migration Audit

## Purpose

The reconstruction principle is:

```text
prompt as policy
code as control plane
raw sources as truth
LLM Wiki as bounded synthesis
```

This is stricter than simply making the prompt shorter. A PoC can work well
because a long system prompt compensates for missing code, missing schemas, and
missing evaluation. A commercial product cannot rely on that. Anything that must
be reproducible, observable, source-backed, or group-reusable should move out of
the prompt.

## Current Runtime Prompt State

Runtime prompts are now limited to three short policy blocks:

```text
prompts/advisor-role.md
prompts/evidence-policy.md
prompts/output-style.md
```

They contain role, evidence boundary, and style only. Current bundle size is 103
words, below the 220-word stage-gate budget.

The runtime prompt must not contain:

- company facts;
- ACTIVE_ENTITY maps;
- DART/KRX/news routing rules;
- long RAG text;
- output schemas such as hidden XML tags;
- stale-data logic;
- citation eligibility logic;
- formatting that can be validated in code.

## Strict Deletion Standard

Deletion is not allowed just because a feature feels messy. A PoC feature can be
removed from runtime only when the audit records four things:

1. why it worked in the demo;
2. why it is unsafe, unscalable, or misleading in commercial operation;
3. what replaces it;
4. which artifact supports the decision.

Deletion or archive decisions must cite one or more removal basis categories:

| Basis | Meaning |
| --- | --- |
| `role_conflict` | The behavior assumes an internal executive assistant while the product is a public-data investor advisor. |
| `private_or_internal_assumption` | The behavior implies access to private information or internal authority. |
| `source_trace_gap` | The behavior can produce facts without claim-level provenance. |
| `determinism_gap` | The behavior requires repeatable output but relies on LLM interpretation. |
| `multi_group_scalability_gap` | The behavior works for Hanwha-only but does not generalize to Samsung, SK, Hyundai Motor, LG, and future clients. |
| `legal_or_rights_risk` | The behavior may expose licensed, private, or provider-dependent content. |
| `user_experience_noise` | The behavior helped a demo but distracts from commercial text-first verification. |
| `runtime_observability_gap` | The behavior cannot be traced, tested, or evaluated cleanly. |

## Classification

The machine-readable classification is:

```text
raw/manifests/prompt-control-plane-audit.json
```

It separates items into:

- `prompt_keep`: short policy prompts;
- `code_owned`: deterministic controls now implemented in code;
- `wiki_or_manifest_owned`: company facts and claim evidence;
- `delete_or_archive`: PoC features removed from runtime or retained only as
  methodological history.

## What Stayed In Prompts

Only qualitative instructions remain:

- public-data Korean conglomerate investor advisor role;
- use only bounded runtime context;
- write concise Korean mobile-advisor prose.

These are appropriate prompt duties because they are about language and role,
not system control.

## What Moved To Code

The following are code-owned:

- group/company routing;
- representative ticker and DART identifiers;
- tool order and status labels;
- fixture/fallback/live trace states;
- answer sections;
- live LLM output contract validation;
- source limitation language;
- follow-up question generation;
- trace envelope creation;
- auto-evaluation and keep/discard thresholds.

This directly supports reproducibility and commercialization because the same
logic can be applied to additional groups without rewriting a giant prompt.

## Live LLM Boundary

The live LLM is not allowed to return arbitrary visible prose directly to the
UI. When live composition is enabled, the model must return a structured object
that passes `advisor-llm-output-contract.v0.1`.

The contract is intentionally small:

```text
sections[] + optional sourceLimitationNote
```

Links, follow-up questions, source claims, trace labels, and developer UI
signals remain code-owned. If live LLM output fails the contract, the runtime
falls back to the deterministic composer and records the failure in the
development trace.

This is the immediate runtime equivalent of the "Instructor-style" structured
output philosophy, without adding a new dependency before the API stage is
stable.

The contract also includes an `answerPlan` chosen by question intent. This is
important: moving controls into code must not mean forcing every answer into
the same table of contents. The code fixes admissible boundaries, while the
composer can vary section titles and emphasis for finance, news, pipeline,
value-up, governance, market, global, and competitor questions.

## What Moved To Sources And Wiki

Company knowledge belongs in:

```text
raw/manifests/
raw/extracted/
wiki/groups/<group>/
```

The old RAG markdown remains useful as a claim-candidate source, but it is not
runtime truth until claims are linked to source manifests and promoted into
source-backed claim sets.

## Runtime Deletion Decisions

The following PoC elements are removed from runtime and kept only as archive or
methodological context:

- internal Hanwha executive-staff persona;
- single `ACTIVE_ENTITY` global switch;
- inline RAG facts in the system prompt;
- XML-like `<related_questions>` hard-output tags;
- prompt-owned length/tier/formatting rules;
- voice-first assumptions as the default interaction mode;
- raw attached development notes as runtime inputs.

These worked in the stage demo because the problem was narrow, the target was
Hanwha, and the goal was persuasive demonstration. They are removed for
commercialization because the target is now external investors, the product is
multi-group, and answer evidence must be auditable.

## Validation

Run:

```bash
npm run validate:prompt-control
```

The validator checks:

- the runtime prompt budget;
- that prompts do not contain company facts or old hidden output tags;
- that deletion decisions include strict removal evidence;
- that code-owned entries point to existing implementation files;
- that source/wiki-owned entries point to existing source artifacts.

This makes prompt reduction itself a reproducible research artifact rather than
an informal refactor.
