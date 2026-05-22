# SK Transfer Readiness Plan

Date: 2026-05-03

## Decision

Proceed with SK as the next transfer target. SK now has the same common
harness artifacts used for Samsung's first transfer slice: identifier
verification, DART financial seed claims, local source inventory, extraction
report, narrative claim queue, source-backed narrative seed claims, wiki pages,
and a frozen reference-slice scenario file.

Current SK status:

```text
identifier verified -> DART financial seed ready -> local narrative sources inventoried -> narrative seed promoted -> reference-slice scenarios ready
```

This is the correct next step after the Hanwha-to-Samsung transfer audit. It
does not overclaim full SK readiness, but it converts SK from a financial-seed
target into a bounded second transfer slice.

## What Was Completed

### 1. DART/KRX Identifier Verification

OpenDART `corpCode.xml` was used to verify the four initial listed SK targets.

| Company | KRX | OpenDART corp code | Status |
| --- | --- | --- | --- |
| SK하이닉스 | 000660 | 00164779 | verified |
| SK이노베이션 | 096770 | 00631518 | verified |
| SK | 034730 | 00181712 | verified |
| SK텔레콤 | 017670 | 00159023 | verified |

Artifact:

```text
raw/manifests/sk.identifier-verification.json
```

Important ambiguity:

OpenDART also includes an older SK Holdings entry with stock code `003600`.
The current SK Inc. listed-company route uses stock code `034730` and corp code
`00181712`.

### 2. OpenDART Financial Table

Command:

```bash
npm run financials:sk:dart
```

Result:

```text
SK DART financial table written: raw/manifests/sk.dart-financial-table.2022-2024.json
Readable DART financial table written: docs/45_sk_dart_financial_table.md
12 ok, 0 partial, 0 error.
```

2024 baseline:

| Company | 2024 Revenue | 2024 Operating Income |
| --- | ---: | ---: |
| SK하이닉스 | 661,930억원 | 234,673억원 |
| SK이노베이션 | 747,170억원 | 3,155억원 |
| SK | 1,246,904억원 | 23,553억원 |
| SK텔레콤 | 179,406억원 | 18,234억원 |

Unlike Samsung financial-sector subsidiaries, these four SK companies returned
explicit `매출액` and `영업이익` accounts from OpenDART for 2022-2024. No
custom financial-company revenue definition was used.

### 3. Financial And Narrative Source-Backed Seed Claims

Artifact:

```text
raw/manifests/sk.source-backed-claims.json
docs/49_sk_source_backed_narrative_claims.md
```

The current SK source-backed claims are intentionally bounded:

- SK Hynix 2024 financial metric;
- SK Hynix 2023-2024 financial trend;
- SK Innovation 2024 financial metric;
- SK Innovation 2023-2024 financial trend;
- SK Inc. 2024 financial metric;
- SK Inc. 2023-2024 financial trend;
- SK Telecom 2024 financial metric;
- SK Telecom 2023-2024 financial trend.
- SK Hynix value-up/AI memory provider and shareholder-return plan claims;
- SK Innovation portfolio/electrification and battery portfolio-rebalancing claims;
- SK Inc. holding-company portfolio and shareholder-return value-up claims;
- SK Telecom AI data-center revenue and telecom AI transformation claims.

These claims are enough for a bounded SK reference-slice evaluation. They are
not enough for full SK HBM, battery, energy, telecom, or holding-company
coverage outside the promoted claim set.

### 4. SK Source Request Plan

Artifact:

```text
raw/manifests/sk.source-request-plan.json
```

The plan avoids asking for "all SK documents." It requests only the source
packages needed to move SK toward a Samsung-level first-transfer slice.

### 5. Local Source Inventory And Extraction

After the user supplied `../sk_knowledge`, the local source package was
inventoried and extracted.

Artifacts:

```text
raw/manifests/sk.local-sources.json
raw/manifests/sk.extraction-report.json
raw/extracted/sk/official/
docs/47_sk_source_inventory_and_ingestion.md
raw/manifests/sk.narrative-claim-queue.json
docs/48_sk_narrative_claim_queue.md
```

Result:

```text
58 local entries
57/57 valid local PDFs
56/57 PDFs matched to document-level public URLs
52/57 PDFs extracted successfully
18 low-text warnings
5 extraction errors
```

Two official SK Hynix Tech Seminar PDFs for AI market outlook and HBM
competitive edge were listed in the URL note but missing locally. They were
downloaded from the official SK Hynix CDN and added under
`../sk_knowledge/sk_ir/sk_hynix/event_materials`. Both are public-source
candidates, but the current text extractor returns zero embedded text, so they
require OCR, transcript, or alternate text-bearing source material before
runtime claim promotion.

## Official IR Entry Points Checked

The following entry pages returned HTTP 200 during local source planning:

| Company | Entry page | Use |
| --- | --- | --- |
| SK하이닉스 | `https://www.skhynix.com/ir/UI-FR-IR06/` | Earnings and IR material discovery |
| SK이노베이션 | `https://www.skinnovation.com/ir/earning` | Earnings and energy/battery material discovery |
| SK | `https://www.sk-inc.com/en/ir/irArchive.aspx` | Holding-company IR archive |
| SK텔레콤 | `https://www.sktelecom.com/en/investor/lib/presentation.do` | Earnings and investor presentation discovery |

These are useful entry points, but they are not sufficient for claim promotion.
Narrative claims still need exact document-level public URLs or DART receipt
URLs. Most active SK local PDFs now have this metadata; the remaining issue is
evidence-quality review, OCR for low-text PDFs, and claim-level promotion.

## Expansion Source Backlog

The following source packages are not required for the current SK
reference-slice evaluation. They are the bounded backlog for expanding SK
coverage after the 16 promoted seed claims are stable. The rule remains the
same as Hanwha and Samsung: request exact official documents, not "all related
materials."

### SK Hynix

Provide:

- latest four earnings presentation document URLs;
- latest annual report or DART receipt URL;
- latest public HBM/AI memory strategy presentation or transcript, if used;
- official capex/capacity material, if used.

### SK Inc.

Provide:

- latest investor presentation document URL;
- latest annual report or DART receipt URL;
- latest value-up, shareholder-return, dividend, or capital-allocation material;
- portfolio/investment-company explanation material.

### SK Innovation

Provide:

- latest four earnings presentation document URLs;
- latest annual report or DART receipt URL;
- latest official SK On battery strategy or earnings material, if used;
- latest official SK E&S merger, LNG, or energy-transition material, if used;
- latest shareholder-return, dividend, or capital-allocation material, if used.

### SK Telecom

Provide:

- latest four earnings presentation document URLs;
- latest annual report or DART receipt URL;
- latest public AI/data-center strategy material, if used;
- latest shareholder-return or dividend policy material.

## Runtime Promotion Rules

SK narrative claims must not be promoted until:

1. `companyId` is present;
2. source page URL is present;
3. direct document URL or DART receipt URL is present;
4. period and issuer are present;
5. evidence locator or needle is present;
6. claim type is bounded;
7. rights level is public-official or otherwise approved.

These rules are common harness rules, not SK-specific rules. SK-specific site
structure is handled only in the intake adapter; after intake, source inventory,
extraction report, claim, wiki, and evaluation records must use the same
schemas as Hanwha and Samsung.

## Current Paper/Product Use Boundary

Allowed now:

- SK DART/KRX identifier routing;
- SK financial baseline table;
- SK financial seed answers with clear OpenDART scope;
- template-transfer evidence that the Samsung-expanded structure can start SK;
- SK local source inventory and extraction-status evidence;
- SK source-backed narrative seed answers within the promoted claim set;
- SK reference-slice evaluation using `evals/scenarios/sk.reference-slice.json`.

Not allowed yet:

- SK HBM strategy answer as source-backed product evidence without OCR or
  text-bearing official source material;
- SK Telecom AI/data-center claims from low-text slide PDFs without alternate
  text evidence, except the promoted official press-release claims;
- SK Inc. claims based on the one URL-placeholder review report or five
  extraction-error files;
- full SK group coverage;
- SK claims outside the 16 source-backed seed records.

### 6. Narrative Claim Queue

The SK narrative claim queue has been created from the subset that already has
public URL, extracted text, company routing, and bounded claim type.

Result:

```text
raw/manifests/sk.narrative-claim-queue.json
```

The queue contains four company-level themes:

| Company | Queue state | Ready sources | Blocked sources |
| --- | --- | ---: | ---: |
| SK하이닉스 | partially ready | 6 | 5 |
| SK이노베이션 | ready | 4 | 0 |
| SK | partially ready | 10 | 7 |
| SK텔레콤 | partially ready | 6 | 19 |

Eight candidate claims have now passed evidence-locator review and were
promoted into the runtime manifest. The remaining queue records are still
review/backlog material, not runtime knowledge.

## Evaluation Checkpoint

The SK reference-slice evaluation has now passed:

```text
scenario count: 4
average score: 98.5/100
paper baseline: 4/4
required failures: 0
result: evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json
quality seed: evals/dashboard/agent-dog.sk-reference-slice.2026-05-03.json
```

The detailed evaluation interpretation is recorded in:

```text
docs/50_sk_reference_slice_evaluation.md
```

## Next Step

After this pass, the same harness can be prepared for Hyundai Motor and LG
without changing the common source, claim, wiki, and evaluation schemas. The
main product follow-up is latency hardening: two SK scenarios exceeded the
non-required pre-API latency budget, even though all required source, trace,
answer, and UI-safety checks passed.
