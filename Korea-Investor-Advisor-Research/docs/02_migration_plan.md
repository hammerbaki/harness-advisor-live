# Migration Plan

## Source Snapshot

Existing PoC snapshot:

```text
../HanWha-Advisor-main
```

This folder is treated as historical source material. It is not the clean
research implementation.

## Phase 0: Inventory

Classify existing files into:

- reusable deterministic logic
- reusable public data
- prompt/RAG material to be decomposed
- demo-only UI
- debug/ops-only code
- generated code
- archive-only assets

## Phase 1: Hanwha Vertical Slice

Extract the smallest complete path:

1. `GroupProfile` for Hanwha.
2. public company/ticker/corp-code registry.
3. one wiki namespace.
4. DART/market/news tool interfaces.
5. response schema.
6. validators.
7. minimal UI group selector and advisor panel.

## Phase 2: Generalize Group Support

Add Samsung, SK, Hyundai Motor Group, and LG only through:

- `configs/groups.json`
- raw source manifests
- wiki namespaces
- evaluation fixtures

No group-specific branching should appear in orchestration code unless it is
expressed as a typed policy field.

## Phase 3: Evaluation Harness

Create reproducible scenario sets:

- public-company overview
- recent disclosure summary
- financial trend question
- market price question
- contradiction/staleness question
- citation-required answer
- chart-producing answer

Each scenario should produce structured logs and pass/fail validator output.

## Phase 4: Paper Artifact

Freeze:

- code version
- prompt versions
- wiki schema version
- sample source manifests
- evaluation outputs

The Replit deployment can be used as a live demo, but the paper artifact must be
reproducible without Replit.

