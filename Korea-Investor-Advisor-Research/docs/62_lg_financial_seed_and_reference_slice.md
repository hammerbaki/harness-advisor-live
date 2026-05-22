# LG Financial Seed and Reference Slice

Date: 2026-05-05

## Purpose

LG is the fourth transfer slice after Hanwha, Samsung, SK, and Hyundai Motor.
The goal is not to claim full LG Group coverage yet. The goal is to confirm
that a new group can enter the same harness through identifier verification,
official financial extraction, source-backed claim promotion, wiki compilation,
and frozen scenario evaluation.

## Current LG Scope

The runtime financial seed still covers three listed affiliates:

- LG Electronics (`lg-electronics`, KRX `066570`, OpenDART `00401731`)
- LG Chem (`lg-chem`, KRX `051910`, OpenDART `00356361`)
- LG Energy Solution (`lg-energy-solution`, KRX `373220`, OpenDART `01515323`)

These companies were chosen because they represent the first product-facing LG
coverage areas: electronics, chemicals, and batteries. This is a bounded
financial seed, not a complete LG Group knowledge base.

The local source-intake scope has now expanded to nine listed affiliates:

- LG Electronics
- LG Energy Solution
- LG Chem
- LG H&H
- LG Display
- LG Innotek
- LG Uplus
- LG CNS
- LG Corp.

This broader intake does not automatically expand runtime knowledge. It creates
the source inventory and narrative review queue needed for later claim
promotion.

## Generated Artifacts

- `raw/manifests/lg.identifier-verification.json`
- `raw/manifests/lg.source-intake-template.json`
- `raw/manifests/lg.dart-financial-table.2022-2024.json`
- `docs/60_lg_dart_financial_table.md`
- `raw/manifests/lg.source-backed-claims.json`
- `docs/61_lg_source_backed_financial_seed.md`
- `wiki/groups/lg/overview.md`
- `wiki/groups/lg/financials.md`
- `wiki/groups/lg/sources.md`
- `wiki/groups/lg/companies/lg-electronics.md`
- `wiki/groups/lg/companies/lg-chem.md`
- `wiki/groups/lg/companies/lg-energy-solution.md`
- `wiki/groups/lg/companies/lg-hnh.md`
- `wiki/groups/lg/companies/lg-display.md`
- `wiki/groups/lg/companies/lg-innotek.md`
- `wiki/groups/lg/companies/lg-uplus.md`
- `wiki/groups/lg/companies/lg-cns.md`
- `wiki/groups/lg/companies/lg-corp.md`
- `evals/scenarios/lg.reference-slice.json`
- `evals/results/lg-reference-slice-v0.1.autoeval-baseline.2026-05-05.json`
- `evals/dashboard/agent-dog.lg-reference-slice.2026-05-05.json`
- `raw/manifests/lg.local-sources.json`
- `raw/manifests/lg.extraction-report.json`
- `raw/manifests/lg.narrative-claim-queue.json`
- `docs/63_lg_source_inventory_and_ingestion.md`
- `docs/64_lg_narrative_claim_queue.md`

## Evidence Boundary

The OpenDART financial table returned 9/9 complete annual rows for 2022-2024.
All promoted claims preserve the exact DART account labels `매출액` and
`영업이익`, the reporting basis, company ID, and source artifact path.

The current runtime knowledge does not include LG narrative IR claims. It
therefore must not infer claims about OLED strategy, appliance demand, vehicle
components, battery orders, shareholder return, value-up plans, telecom/DX
growth, or chemical material strategy unless those claims are later promoted
from exact official source URLs and evidence locators.

The local IR ingestion step confirms 98 source entries, 93/93 valid PDF files,
87/87 successful PDF extractions, 82 narrative rows ready for human claim
review, and 10 blocked rows. The blocked rows are five low-text/OCR candidates
and five LG Corp. XLSX files requiring conversion/manual review.

## Product Meaning

This stage is useful because it tests the transferability of the harness after
LG local IR files have been collected. The common runtime can already answer
affiliate-scoped financial questions with traceable official data, while the
local IR package is now staged for narrative promotion without changing the
runtime answer schema.

## Evaluation Result

`npm run eval:lg` passed 3/3 scenarios at 100/100 with 0 required failures on
2026-05-05. The scenarios check affiliate routing, expected source-backed
claim selection, trace contract integrity, investor-facing answer structure,
developer-leak prevention, source-status disclosure, follow-up quality, and
latency budget. `npm run quality:lg` exported the paper-stage Agent Dog seed
JSON with 5 KPI cards and 3 scenario rows.

This result is a system-level financial-seed validation. It does not evaluate
LG narrative strategy, full group coverage, live news coverage, or investor
usefulness.

## Next LG Work

The next LG work is not more bulk collection. It is selective promotion:

1. review the extracted markdown for a small LG Electronics, LG Chem, and LG
   Energy Solution subset;
2. promote only atomic source-backed claims with evidence locators;
3. keep LG Corp., LG Uplus, LG CNS, LG Display, LG Innotek, and LG H&H as
   queued coverage until a concrete product question needs them;
4. convert the five LG Corp. XLSX sources only if their English tables are
   needed for claim promotion;
5. supply OCR/text-bearing substitutes for five low-text PDF candidates only
   if those specific documents are selected for promotion.
