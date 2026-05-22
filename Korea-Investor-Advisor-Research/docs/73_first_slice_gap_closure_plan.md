# First-Slice Gap Closure Plan

Date: 2026-05-05

This note turns the first-slice readiness audit into a concrete collection and
promotion backlog. The goal is to move the 25-company reference slice from
selection-complete to source-backed, company-scoped, and runtime-traceable.

Current audit source:

- `docs/72_first_slice_readiness_audit.md`
- `raw/manifests/first-slice-readiness-audit.json`

## Current State

After DART financial refresh and source-backed seed promotion:

- 25 first-slice companies checked;
- 20 companies have source-backed claims;
- 23 companies have wiki company pages;
- 9 companies are runtime-seed-ready;
- 27 readiness gaps remain.

LG is the first group whose five-company first slice is fully runtime-seed-ready
under the current financial-seed definition. Hyundai Motor Group is close:
Hyundai Motor, Hyundai Mobis, Hyundai Glovis, and Hyundai Rotem are
runtime-seed-ready; Kia still needs local source package intake.

## Priority 1: Hanwha Affiliate Source Packages

Hanwha remains the largest first-slice gap because the original PoC and the
official backfill are still issuer-heavy.

Collect company-level source packages for:

- Hanwha Aerospace;
- Hanwha Solutions;
- Hanwha Systems;
- Hanwha Ocean.

For each company, collect:

- latest annual report or DART receipt URL;
- latest four quarterly or earnings materials where available;
- investor presentation, value-up, shareholder-return, capital-action, or
  equivalent material where available;
- source provenance ledger with one-line selection reason;
- direct document URL when available, otherwise official source-page URL or
  DART viewer URL.

Also reconcile existing Hanwha Corp. and Hanwha Solutions files to public URLs
or DART receipts so that the current local material is not only local evidence.

## Priority 2: Missing First-Slice Source Packages

Collect full first-slice source packages for:

- Samsung Electro-Mechanics;
- SK Square;
- Kia.

Required package:

- KRX code and OpenDART corp code already exist in config; verify only if the
  source package contradicts them;
- annual report or DART filing URL;
- recent earnings materials;
- investor presentation, shareholder-return, value-up, or capital-allocation
  material where available;
- source provenance ledger with selection reason.

## Priority 3: Source-Level Selection Reasons

Samsung and SK already have strong local source packages, URLs, extraction, and
source-backed claims. Their remaining first-slice issue is mostly source-level
selection rationale.

Add one-line selection reasons to the source provenance ledger for:

- Samsung Electronics;
- Samsung SDI;
- Samsung C&T;
- Samsung Biologics;
- SK Hynix;
- SK Innovation;
- SK Inc.;
- SK Telecom.

The selection reason should explain why that document is included, not why the
company is included. Good examples:

- "latest earnings deck used for current revenue and margin baseline";
- "annual report used for audited financial and risk disclosure baseline";
- "shareholder letter used for capital-allocation and shareholder-return
  narrative";
- "IR presentation used for business-pipeline and segment outlook evidence."

## Priority 4: Narrative Claim Promotion

The current audit counts financial seed claims as runtime-seed-ready. That is
enough for the first traceable baseline, but not enough for a polished investor
product.

After source packages are complete, promote narrative claims for:

- Hyundai Glovis;
- Hyundai Rotem;
- LG Innotek;
- LG Uplus;
- Samsung Electro-Mechanics;
- SK Square;
- Hanwha Aerospace;
- Hanwha Solutions;
- Hanwha Systems;
- Hanwha Ocean.

Each promoted claim must include:

- companyId;
- companyScope;
- atomic claim text;
- source provenance URL or DART receipt;
- evidence locator;
- reporting period or document date;
- forward-looking label when needed;
- runtimeUsePolicy.

## Priority 5: Product UI Exposure Rule

Do not expose affiliate-level selection in the main mobile UI as "complete"
until each first-slice company has at least:

- one source-backed claim;
- one wiki company page;
- source provenance or DART receipt coverage;
- a traceable source package.

Until then, group-level selection remains the correct default UI.

## Immediate Next Commands

After adding new source packages, run:

```bash
npm run inventory:samsung
npm run inventory:sk
npm run inventory:hyundai
npm run inventory:hanwha
npm run extract:samsung
npm run extract:sk
npm run extract:hyundai
npm run extract:hanwha
npm run audit:first-slice
npm run validate:stage-gate
```

Use the group-specific commands only for groups whose raw files changed.
