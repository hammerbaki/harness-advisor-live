# LLM Programming Framework Selection

## Decision

Use DSPy as the primary framework to cite and later integrate for LLM-program
optimization.

Use an Instructor-style structured-output contract as the immediate runtime
guard pattern for live LLM answers. This does not replace the DSPy decision:
Instructor-style validation controls the live output boundary, while DSPy is
for offline composer optimization against frozen scenarios.

DSPy is the best match for this project because the research problem is not
only structured output. The core problem is converting a prompt-heavy financial
advisor into a measurable, modular, optimizable program:

```text
source package -> source-backed claims -> wiki context -> investor answer ->
trace/evaluation result
```

DSPy can be introduced as the programming layer that sits above LLM Wiki and
below the auto-evaluation loop:

- LLM Wiki maintains compiled company knowledge;
- deterministic code owns routing, source states, claim eligibility, and
  answer structure;
- DSPy can later express answer composition as signatures/modules instead of
  handwritten prompt strings;
- the advisor auto-eval rubric can become the metric for optimization.

## Why DSPy

DSPy directly matches the project's principle:

```text
programming, not prompting
```

It supports:

- declarative signatures for input/output behavior;
- composable modules for RAG, agent loops, and answer generation;
- optimizers that tune prompts, few-shot examples, or weights against metrics;
- evaluation workflows that fit the current frozen scenario set.

This means the current `advisor-answer-quality-v0.2` rubric can become more
than a report. It can eventually be used as a metric for optimizing the answer
composer.

## Alternatives Reviewed

| Framework | Strength | Why not the first project framework |
| --- | --- | --- |
| LMQL | Strong constraints, control flow, and constrained decoding. | Useful for strict generation, but less aligned with the current rubric-driven research loop and multi-stage advisor modules. |
| Instructor | Excellent Pydantic-based structured outputs and validation retries. | Useful as the immediate runtime guard pattern for live LLM output. Too narrow as the main research framework because it does not cover module optimization. |
| Guidance | Strong regex/CFG/control-flow generation control. | Valuable for constrained generation, but the project needs scenario-level optimization and evaluation more than token-level control. |
| TextGrad | Strong research framing for textual gradients and feedback optimization. | Good future citation for optimization philosophy, but more experimental for this product pipeline than DSPy. |
| AdalFlow | Broad LLM workflow and auto-optimization library. | Interesting, but DSPy has a clearer fit with signatures, modules, RAG, and established research citation path. |
| OpenPipe | Fine-tuning and model replacement path. | Better as a later cost/speed optimization stage after enough production traces exist. Not suitable as the first research framework. |

## How It Applies Here

Do not install DSPy into the Replit demo immediately. The current Replit app is
Node/Vite and should remain lightweight until the trace contract and source
template are stable.

The runtime now has a small code-owned output contract for the live LLM
composition boundary. This is recorded in:

```text
raw/manifests/llm-output-contract.json
docs/33_live_llm_output_contract.md
```

It is deliberately narrower than adopting Instructor as a dependency. It proves
the product rule first: live LLM output must be structured, validated, and
fallback-safe before the UI renders it.

Instead, apply DSPy in three stages:

1. **Design alignment now**: describe the advisor composer as a DSPy-ready
   program boundary with typed inputs, outputs, metrics, and traces.
2. **Runtime guard now**: keep any live LLM composer behind the
   `advisor-llm-output-contract.v0.1` validator.
3. **Offline experiment next**: create a Python sidecar experiment that reads
   frozen scenarios and source-backed claims, then tests a DSPy answer composer
   against `advisor-answer-quality-v0.2`.
4. **Runtime adoption later**: only replace the deterministic composer when
   the DSPy-optimized module consistently beats the paper baseline without
   exposing development trace details.

## Proposed DSPy Signature

The first DSPy experiment should model the composer only, not the entire data
pipeline.

```text
AdvisorCompose(
  group_profile,
  question,
  source_claims,
  wiki_context,
  source_status_summary
) -> (
  sectioned_answer,
  followup_questions,
  source_limitation_note
)
```

The data collection and source eligibility gates should remain in code.

## Keep In Code

DSPy should not replace:

- DART/KRX/news routing;
- source-selection policy;
- claim promotion;
- source-state validation;
- trace schema creation;
- user/developer UI separation;
- investment-disclaimer boundaries.

These are deterministic product controls. DSPy should optimize only the LLM
composition boundary.

## Paper Positioning

The paper can present DSPy as a future-facing programming layer:

```text
The reference implementation is designed to be DSPy-compatible: source
selection, claim promotion, and trace validation are deterministic, while the
answer composer can be expressed as a declarative module and optimized against
the frozen evaluation rubric.
```

This is stronger than claiming DSPy is already fully deployed. It is accurate,
reproducible, and aligned with commercialization.

## Sources

- DSPy GitHub: https://github.com/stanfordnlp/dspy
- DSPy documentation: https://dspy.ai/
- LMQL GitHub: https://github.com/eth-sri/lmql
- Instructor GitHub: https://github.com/567-labs/instructor
- Guidance GitHub: https://github.com/guidance-ai/guidance
- TextGrad GitHub: https://github.com/zou-group/textgrad
- AdalFlow GitHub: https://github.com/SylphAI-Inc/AdalFlow
- OpenPipe GitHub: https://github.com/OpenPipe/OpenPipe
