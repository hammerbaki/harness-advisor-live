# Group Onboarding Standard

Date: 2026-05-03

## Purpose

This document freezes the repeatable onboarding path for a new business group.
It exists so Hyundai Motor, LG, and future client groups can be added without
recreating the original prompt-heavy PoC workflow.

The standard is deliberately source-driven. A group is not considered ready
because many files exist locally. It is ready only when those files can move
through a traceable chain:

```text
identifier verification
-> source intake ledger
-> local source inventory
-> extraction report
-> claim candidate queue
-> source-backed claim manifest
-> LLM wiki namespace
-> frozen scenario evaluation
-> demo/runtime trace
```

## Onboarding Stages

### Stage 0: Identity and Scope

Required artifacts:

- `configs/groups.json`
- `raw/manifests/<group>.identifier-verification.json`
- `raw/manifests/<group>.json`
- `wiki/groups/<group>/overview.md`

Rules:

- every listed company in scope must have `companyId`, Korean name, KRX code,
  Yahoo ticker when useful, DART corp code, and aliases;
- the first slice should normally contain 3-5 companies;
- optional second-wave companies must be recorded but not silently added to
  runtime evaluation;
- `companyId` is required even when the UI only exposes group selection.

### Stage 1: Source Intake Ledger

Required artifact:

- `raw/manifests/<group>.source-intake-template.json`

Expected local client/research folder:

```text
<group>_knowledge/
  README.md
  document_urls.md
  <company_folder>/
    annual_reports/
    earnings/
    investor_presentations/
    value_up/
    governance/
```

Required ledger columns:

```text
company | company_id | local_file | source_page_url | direct_document_url | dart_receipt_url | title | date | document_type | request_package | selection_reason | rights_level | access_date | checksum | note
```

Rules:

- document-level URLs and DART receipt URLs are preferred when stable;
- official IR source pages are acceptable when document downloads are dynamic or
  session-based, as long as the exact title, covered period, local file name,
  checksum or extraction hash, and evidence locator are recorded before claim
  promotion;
- each document must map to a request package from
  `configs/client-source-request-template.json`;
- audio/video files require a transcript, subtitle, report, or deck substitute
  before claim promotion;
- third-party analyst materials are metadata-only unless rights are cleared.

### Stage 2: Inventory and Extraction

Required artifacts:

- `raw/manifests/<group>.local-sources.json`
- `raw/manifests/<group>.extraction-report.json`

Rules:

- local files must be hashed;
- extracted text must be hashed when text is written;
- image-only files must be flagged as OCR-needed;
- documents with no source provenance remain review backlog. Source provenance
  can be a direct document URL, DART/public filing URL, official source-page URL,
  or a documented dynamic-download note tied to checksum and access date.

### Stage 3: Claim Candidate Queue

Required artifact:

- `raw/manifests/<group>.narrative-claim-queue.json`

Rules:

- a claim candidate is not runtime knowledge;
- every candidate must include `companyId`, claim type, source document,
  evidence locator or evidence needle, period, and forward-looking label when
  needed;
- blocked candidates remain visible with a reason such as missing source URL,
  missing source-page provenance, missing text, weak evidence locator, stale
  period, or rights restriction.

### Stage 4: Source-Backed Claim Promotion

Required artifact:

- `raw/manifests/<group>.source-backed-claims.json`

Rules:

- every runtime claim must include `companyId` and `companyScope`;
- group-level claims should still use a routing coordinate such as the
  representative company or `companyScope=group_context`;
- financial-sector account labels must be taken from DART/OpenDART records and
  must not be redefined by the paper;
- forward-looking statements must be labelled as management outlook or plan;
- unsupported synthesis belongs in wiki review notes, not runtime claims.

Minimum first-slice target:

- at least 8 source-backed claims;
- at least 3 investor questions in a frozen scenario;
- no required trace or source validation failures.

### Stage 5: Wiki Compilation

Required artifact:

- `wiki/groups/<group>/`

Recommended pages:

- `overview.md`
- `financials.md`
- `sources.md`
- optional company or theme pages only when claim density justifies them.

Rules:

- the wiki is a maintained synthesis layer, not the source of truth;
- source manifests and source-backed claims remain authoritative;
- wiki pages must carry `last_checked`, source references, and confidence;
- contradictions and stale facts should be marked, not silently resolved.

### Stage 6: Evaluation and Demo Readiness

Required artifacts:

- `evals/scenarios/<group>.reference-slice.json`
- `evals/results/<group>-reference-slice-*.json`
- optional `evals/dashboard/agent-dog.<group>-*.json`

Rules:

- frozen scenarios test traceability, routing, source-backed composition,
  user/developer UI separation, and latency;
- frozen scenarios do not claim investment performance or customer impact;
- the UI may show process status, but claim IDs and raw trace details stay in
  the developer view or saved trace JSON.

Cross-file structure validation:

```bash
npm run validate:structure
```

This validator is stricter than a single-stage check. It verifies that group
profiles, identifier manifests, local inventories, extraction reports,
source-backed claims, wiki pages, and frozen scenarios still point to one
another consistently. Legacy Hanwha extraction inventories are accepted as
historical PoC inputs, but runtime-promoted claims and newer group inventories
must carry `companyId`, source scope, evidence references, and valid routing
metadata.

## Status Labels

Use these labels consistently:

| State | Meaning |
| --- | --- |
| `planned` | configuration shell exists, source-backed runtime evidence is not ready |
| `source-ready` | source-backed claims and common chain exist for a bounded slice |
| `reference-slice` | PoC-derived or primary research slice |
| `seed-unverified` | identifiers or sources are still incomplete |
| `identifier-verified-source-pending` | identifiers are verified, source package is pending |
| `bounded-source-backed-reference-slice` | runtime claims and scenarios exist for a bounded slice |

The UI label should describe readiness, not the conglomerate's whole business
portfolio.

## Hyundai Motor Application

Hyundai Motor Group now validates the standard as a third transfer financial
seed:

- Stage 0 identifiers are verified for Hyundai Motor, Kia, and Hyundai Mobis.
- Optional second-wave identifiers are recorded for Hyundai Rotem, Hyundai
  AutoEver, Hyundai Wia, Hyundai Engineering & Construction, Hyundai Glovis,
  Innocean, Hyundai Motor Securities, Hyundai BNG Steel, and Hyundai Steel.
  They are intake candidates, not part of the first runtime slice.
- Stage 1 and Stage 2 artifacts exist:
  `raw/manifests/hyundai-motor.local-sources.json` and
  `raw/manifests/hyundai-motor.extraction-report.json`.
- The local source package currently has 84 official PDF entries. Two Hyundai
  E&C duplicates are marked `duplicate_reference_only`, leaving 82 extraction
  candidates. Nine Kia SPA/download rows remain unmatched to local files.
- PDF extraction passed 82/82 official candidates. Seven low-text/OCR warnings
  remain blocked from narrative claim promotion until OCR or text-bearing
  substitutes are supplied.
- OpenDART financial records for Hyundai Motor, Kia, and Hyundai Mobis are
  stored in
  `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`.
- Six runtime-eligible financial seed claims are promoted in
  `raw/manifests/hyundai-motor.source-backed-claims.json`.
- The narrative queue records 75 ready records, 7 blocked low-text/OCR records,
  and 2 skipped duplicate reference files in
  `raw/manifests/hyundai-motor.narrative-claim-queue.json`, but no narrative IR
  claim is runtime-promoted yet.
- Generated wiki pages exist under `wiki/groups/hyundai-motor/`.
- The frozen reference scenario in
  `evals/scenarios/hyundai-motor.reference-slice.json` passed 3/3 paper
  baseline scenarios at 99/100 with 0 required failures.

The next Hyundai-specific actions are deliberately bounded:

1. obtain Kia downloadable PDFs or exact document URLs for the unmatched SPA
   rows;
2. supply OCR/text-bearing substitutes for the 7 low-text Hyundai/Mobis/Rotem
   PDFs when narrative claims from those documents are needed;
3. promote only the highest-priority narrative claims after evidence locators
   are reviewed;
4. do not add second-wave companies to runtime scenarios until their source
   package passes the same chain;
5. preserve explicit DART account labels for Hyundai Motor Securities and do
   not define financial-company revenue by policy.

Prepared commands:

```bash
npm run inventory:hyundai
npm run validate:hyundai-intake
npm run extract:hyundai
npm run financials:hyundai:dart
npm run claims:hyundai:narrative
npm run promote:hyundai
npm run wiki:hyundai
npm run eval:hyundai
npm run quality:hyundai
npm run validate:structure
```

`inventory:hyundai` and `validate:hyundai-intake` remain safe to run as the
package evolves. They report missing Kia files, OCR blockers, and other source
gaps instead of pretending that queued narrative material is source-backed
runtime knowledge.

## LG Application

LG now validates the standard as a fourth transfer with a larger local IR
package:

- Stage 0 identifiers are verified for nine listed affiliates: LG Electronics,
  LG Energy Solution, LG Chem, LG H&H, LG Display, LG Innotek, LG Uplus, LG
  CNS, and LG Corp.
- The runtime financial seed remains bounded to LG Electronics, LG Chem, and
  LG Energy Solution until additional claims are promoted.
- Stage 1 and Stage 2 artifacts exist:
  `raw/manifests/lg.local-sources.json` and
  `raw/manifests/lg.extraction-report.json`.
- The local source package has 98 entries: 93 valid PDFs and 5 XLSX files.
- PDF extraction passed 87/87 extraction candidates. Five low-text/OCR
  warnings remain blocked from narrative claim promotion unless OCR or
  text-bearing substitutes are supplied.
- The narrative queue records 82 ready rows, 10 blocked rows, and 6 skipped
  duplicate reference files in `raw/manifests/lg.narrative-claim-queue.json`.
- The blocked rows are five low-text/OCR PDF rows and five LG Corp. English
  XLSX rows requiring conversion/manual review.
- Generated wiki pages exist under `wiki/groups/lg/`, including company pages
  for all nine verified affiliates.

Prepared commands:

```bash
npm run inventory:lg
LG_EXTRACT_WRITE_TEXT=1 npm run extract:lg
npm run claims:lg:narrative
npm run promote:lg
npm run wiki:lg
npm run eval:lg
npm run quality:lg
npm run validate:structure
```

LG-specific download complexity is kept at the intake boundary. Direct URLs,
Referer-sensitive downloads, session/S3-style attachments, POST/fileId
downloads, dynamic browser downloads, PDFs, and XLSX files are all normalized
into the same local source inventory, extraction report, narrative queue, and
wiki namespace.

## Paper Boundary

The paper should present this as a reusable harness process, not as a claim
that each Korean business group is fully covered. Company-specific differences
belong in manifests, identifiers, and source topology. The contribution is the
repeatable conversion path from prompt-heavy prototype to traceable agent
architecture.
