# PoC Stage Distinction

## Purpose

The paper should mention the difference between the original PoC and the current
implementation, but it should not imply that the current implementation is a
fully commercial product.

The precise claim is:

```text
This study reconstructs an exploratory LLM demo prototype into a traceable
research prototype and reference implementation for public-data investor
advisor workflows.
```

This framing is important because the current system is still a PoC. Its value
is that it is now reproducible, source-grounded, evaluable, and extensible
enough to support a paper and commercialization preparation.

## Stage 1: Initial Exploratory PoC

The original Replit implementation was built for rapid demonstration.

Its strengths were:

- mobile-first advisor experience;
- voice-based large-room demonstration;
- persuasive brief-card and follow-up interaction;
- fast iteration around a Hanwha-centered use case.

Its limits were:

- long prompts carrying product logic;
- mixed or implicit knowledge provenance;
- Hanwha-only assumptions;
- hidden runtime decisions;
- limited repeatability across companies, scenarios, and deployments.

The paper may describe this stage as the exploratory baseline, not as a failed
implementation. It worked for its purpose: demonstrating the desired advisor
experience.

## Stage 2: Traceable Research PoC

The current implementation is the paper reference implementation.

It is still a PoC, but it differs from the initial demo because it has explicit
research and replication controls:

- source-selection policy;
- source inventory and provenance manifests;
- source-backed claim promotion;
- LLM Wiki namespace separated from raw sources;
- concise policy prompts;
- deterministic code-owned controls;
- trace schema for tool status and evidence state;
- frozen evaluation scenarios;
- automatic answer-quality scoring;
- strict delete/archive rationale for old PoC features.

This stage is appropriate for an arXiv-style method/demo paper because it shows
how a vibe-coded financial advisor can be transformed into a reproducible
reference slice.

## Stage 3: Commercial Product Candidate

Commercialization is a future hardening stage, not a completed paper claim.

It requires:

- live DART, market-data, news, and LLM credentials;
- authenticated deployment;
- tenant/client data boundaries;
- legal and compliance review;
- prompt, wiki, source, and model version governance;
- monitoring, error budgets, and incident response;
- cost controls;
- customer-specific source intake and approval workflow;
- explicit investment-disclaimer and suitability boundaries.

The current traceable research PoC is useful for commercialization because it
defines the template, evaluation gate, and evidence contract before live systems
are connected.

## Paper-Safe Wording

Use:

```text
traceable research prototype
reference implementation
source-grounded advisor architecture
commercialization-preparation artifact
```

Avoid:

```text
commercial product
production-ready advisor
fully automated investment advisory system
validated real-time financial advisor
```

## Recommended Paper Structure

The PoC distinction can be used as a paper subsection:

1. Exploratory prototype: interaction goal and limitations.
2. Reconstruction method: source, wiki, prompt-to-code, trace, and evaluation.
3. Reference implementation: Hanwha slice and mobile advisor UI.
4. Commercialization gap: what remains before live client operation.

This makes the remaining limitations part of the research contribution instead
of a weakness in the claim.
