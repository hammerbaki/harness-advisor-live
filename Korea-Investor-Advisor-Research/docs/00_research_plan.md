# Research Plan

## Working Title

Reproducible Agentic Architecture for Korean Equity Group Advisory Using
Tool-Augmented Wiki-RAG and Deterministic Guardrails

## Core Research Question

How can a vibe-coded financial LLM PoC be reconstructed into a reproducible
agentic advisor that combines public data, compiled knowledge, deterministic
validation, and concise prompts?

## Prototype Scope

This paper does not claim a completed commercial investment-advisory product.
It distinguishes:

- the initial exploratory PoC built for fast Replit demonstration;
- the current traceable research PoC used as the reference implementation;
- the future commercial product candidate that requires live-data, compliance,
  security, monitoring, and client-operation hardening.

This distinction allows the paper to discuss PoC limitations without weakening
the contribution: the contribution is the reconstruction method and reference
architecture.

## Proposed Contributions

1. A group-scoped advisor architecture for Korean conglomerates using public
   data only.
2. A hybrid knowledge design: immutable raw sources, LLM-maintained wiki, and
   retrieval/citation backstops.
3. A deterministic guardrail layer for dates, numbers, company identifiers,
   citations, chart data, and speech formatting.
4. A migration case study from Replit PoC to research-grade reproducible system.
5. An evaluation harness for regression scenarios that commonly break financial
   LLM advisors.

## Non-Goals

- No private or internal company data.
- No investment recommendation that claims suitability for a specific person.
- No reliance on a single hosting provider for reproducibility.
- No prompt-only enforcement for deterministic product behavior.

## Paper Artifact Checklist

- Public repository with reproducible setup.
- Fixed sample data or source manifests.
- Minimal demo deployment.
- Deterministic eval suite.
- Live eval suite clearly marked as credential/network dependent.
- Prompt/wiki/schema versions pinned.
- Ablation experiments for prompt size, wiki layer, tool use, and validators.
