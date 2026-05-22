# Architecture

## Layered Design

```text
User Interface
  -> Advisor API
    -> Orchestrator
      -> Group Context Resolver
      -> Wiki Context Loader
      -> Tool Router
      -> LLM Response Composer
      -> Deterministic Validators
      -> Response Renderer
```

## Knowledge Layers

### 1. Raw Sources

Immutable source layer. Examples:

- DART filings
- IR presentation metadata
- KRX price data
- public news URLs and metadata
- manually curated public-source manifests

Raw sources are never rewritten by the LLM.

### 2. Compiled Wiki

LLM-maintained Markdown pages. The wiki is a working knowledge layer, not the
source of truth. Each page must include source references and last-checked
metadata.

Example namespaces:

```text
wiki/groups/hanwha/overview.md
wiki/groups/hanwha/companies/hanwha-aerospace.md
wiki/groups/hanwha/events/
wiki/groups/hanwha/contradictions.md
wiki/groups/hanwha/staleness.md
```

### 3. Retrieval and Citation Backstop

When a claim is material, the system should be able to recover the source
document or tool output that supports it. The wiki accelerates synthesis; it
does not remove the need for evidence.

## Deterministic Boundaries

The following must be code, not prompt instructions:

- group/company/ticker/corp-code resolution
- date windows and market calendar behavior
- numeric parsing, unit conversion, and comparison
- schema validation
- citation presence checks
- chart data construction
- TTS number normalization
- debug/ops authorization
- stale knowledge detection
- retry/fallback policy

The LLM should handle:

- synthesis
- explanation
- ranking candidate issues
- natural-language answer composition
- wiki draft maintenance under validation

## Prompt Policy

Prompts should be short and versioned. They should describe role, constraints,
tool-use expectations, citation behavior, and answer style. They should not
encode long RAG content or fragile formatting rules.

