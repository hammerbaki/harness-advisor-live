# Source Selection Policy

Policy version: 2026-05-01

## Purpose

This policy defines repeatable document-selection rules for investor-advisor
reference slices. It applies to Hanwha, Samsung, SK, Hyundai Motor, LG, and
future Korean corporate groups added to the project.

The policy is intentionally narrower than a full archive policy. A reference
slice can be paper-ready if its scope is declared, every retained source has a
selection rationale, and every runtime claim is linked to source-level
provenance.

Machine-readable policy file:

`configs/source-selection-policy.json`

Client source request template:

`configs/client-source-request-template.json`

## Scope Rules

| Rule | Meaning |
| --- | --- |
| SCOPE-01 | The default corpus is a scoped reference slice, not a complete archive. |
| SCOPE-02 | Additional materials are collected only when a claim, scenario, or runtime feature needs them. |
| SCOPE-03 | Every group must follow the same inventory, provenance, rationale, extraction, claim-linking, wiki, and validation steps. |
| SCOPE-04 | Group-specific adapters may normalize different raw source layouts, but the emitted inventory, extraction, claim queue, source-backed claim, wiki, and eval schemas must be common across groups. |

## Source Rules

| Rule | Source type | Use |
| --- | --- | --- |
| SRC-01 | Official issuer provenance | Primary-source candidate for issuer facts. |
| SRC-02 | Regulatory filing provenance | DART/public filing anchor for financial and risk claims. |
| SRC-03 | Audit baseline | Audited financial-history and hallucination checks. |
| SRC-04 | Current periodic disclosure | Revenue, operating income, risk, segment, investment, and business updates. |
| SRC-05 | Current earnings and IR material | Headline metrics and investor briefing context. |
| SRC-06 | Shareholder-value and capital actions | Value-up, buybacks, capital allocation, preferred shares, shareholder return. |
| SRC-07 | Governance baseline | Articles, board policy, disclosure policy, and shareholder-rights context. |
| SRC-08 | Third-party market view | Secondary market interpretation and contradiction checks only. |
| SRC-09 | Rights and redistribution boundary | Manifest-only or metadata-only when redistribution rights are unclear. |
| SRC-10 | Machine extraction readiness | Extraction or manual transcription must be checked before wiki promotion. |
| SRC-11 | Claim-level traceability | Every answerable claim must link to source, date/period, and verification state. |
| SRC-12 | Company-scoped routing | Runtime claims must include `companyId` and `companyScope`; affiliate claims must not be routed through a broad group label only. |

## Common Harness Artifacts

The raw source structure can differ by company. For example, one issuer may
provide a static PDF archive, another may provide DART viewer links, and another
may require a local folder organized by English company IDs. These differences
are handled only by intake adapters. After intake, every target must emit the
same artifact classes:

| Stage | Common artifact | Purpose |
| --- | --- | --- |
| Source inventory | `raw/manifests/<group>.local-sources.json` or equivalent | Normalize local/public sources into a shared metadata contract. |
| Extraction report | `raw/manifests/<group>.extraction-report.json` | Record text extraction, low-text warnings, errors, hashes, and promotion boundary. |
| Claim queue | `raw/manifests/<group>.narrative-claim-queue.json` | Hold non-runtime candidate claim families for human review. |
| Source-backed claims | `raw/manifests/<group>.source-backed-claims.json` | Store only promoted atomic claims with source linkage and runtime policy. |
| Wiki namespace | `wiki/groups/<group>/...` | Provide reviewed LLM-readable context while preserving source manifests as authority. |
| Eval scenarios | `evals/scenarios/<group>.*.json` | Freeze reproducible scenario checks for the declared slice. |

This distinction matters for reproducibility. The harness may contain
group-specific input adapters, but paper-ready and runtime-ready outputs must be
schema-compatible across all groups.

## Minimum Metadata

Each selected source should record:

- group ID and source ID;
- title, issuer/publisher, source role, and source category;
- source date or covered period;
- public source URL, filing ID, or official source-page pointer;
- access date;
- local path or storage key;
- checksum;
- rights policy;
- selection rule IDs;
- paper use level;
- runtime use policy;
- verification state.
- extraction status and extraction hash when a source is text-derived;
- claim queue state before runtime promotion.

The source pointer does not have to be an exact PDF URL in every case. Exact
document URLs and DART receipt URLs are preferred, but many issuer IR sites use
dynamic or session-based downloads from a single archive page. In those cases,
an official IR source page is sufficient source-level provenance when it is
paired with the exact document title, covered period, access date, local file
checksum, extraction hash, and claim-level evidence locator. This is analogous
to citing a Git repository with a commit and file path rather than requiring a
separate URL for every generated artifact.

## Promotion Gate

A group source corpus is not paper-ready or runtime-ready until these gates pass:

1. inventory complete;
2. public provenance linked;
3. selection rationale recorded;
4. rights policy recorded;
5. extraction or manual review complete;
6. claim-level source linking complete;
7. wiki lint passed;
8. runtime validation passed.

## Application To Expansion Groups

Samsung, SK, Hyundai Motor, and LG should not start by copying Hanwha claims.
They should copy the process:

1. define the group and representative companies;
2. collect official issuer, DART, KRX, and limited secondary market-view sources;
3. run source inventory;
4. link official provenance;
5. assign selection rule IDs;
6. extract or manually review;
7. promote only source-backed atomic claims to the LLM Wiki;
8. connect runtime answers to claim-level traces.

## Client Request Boundary

Do not ask a client for all related documents. Ask for bounded source packages:

- company identity and market identifiers;
- latest financial disclosure baseline;
- latest earnings and investor presentation baseline;
- shareholder value and capital action materials;
- governance and disclosure baseline;
- optional market-view comparison metadata;
- commercial operating context.

Each requested source must map to a package, a claim class, or a runtime
feature. This keeps the knowledge system reproducible and prevents unbounded
document ingestion.
