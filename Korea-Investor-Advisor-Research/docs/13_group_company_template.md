# Group Template

Implementation date: 2026-04-30

## Purpose

The app must not remain a Hanwha-only artifact. Hanwha is the reference slice,
but the commercial and research product needs a repeatable group-level template
for Korean business groups.

## Current Template Layers

```text
configs/groups.json
  group profile
  displayOrder and ftcAssetRank2025 for neutral investor-facing ordering
  selectorNote for mobile data/template readiness
  logoAsset profile for reproducible brand identity
  representative company profile for internal data routing
  identifiers: KRX, Yahoo ticker, DART corp code

src/briefingTemplate.ts
  news brief template
  stock brief template
  financial brief template
  deterministic seed values for paper/demo mode

server/index.mjs
  groupId request handling
  representative company passed internally to DART/market/news tools
  trace envelope records groupId and representativeCompanyId

src/main.tsx
  mobile selector for group only
  same UI shell reused across groups
```

## Template Rule

Adding or changing a covered group should not require editing the advisor UI.
The app displays selected targets by `displayOrder`, which currently follows
the 2025 FTC asset ranking among the five selected targets:

```text
Samsung -> SK -> Hyundai Motor -> LG -> Hanwha
```

This is not a claim that these are the top five Korean business groups overall.
Hanwha is included because it is the PoC-derived reference slice.

The minimum internal representative-company extension point remains:

```json
{
  "id": "company-id",
  "displayName": "Company Name",
  "koreanName": "회사명",
  "listed": true,
  "krxCode": "000000",
  "yahooTicker": "000000.KS",
  "dartCode": "",
  "aliases": ["별칭"]
}
```

## Common Output Schema Rule

Every group must converge to the same harness artifacts even when its source
site, folder layout, filename language, or IR archive structure differs. A
group-specific intake adapter is allowed only at the raw-input boundary.

```text
raw local/source input
  -> group-specific intake adapter
  -> common source inventory schema
  -> common extraction report schema
  -> common narrative claim queue schema
  -> common source-backed claim schema
  -> common wiki namespace
  -> common evaluation scenario schema
```

The following fields are not optional for paper or runtime promotion:

- `groupId`;
- `companyId`;
- `companyScope`;
- `sourceRole`;
- `documentType`;
- `period` or date;
- `publicDocumentUrl` or public filing ID;
- `localPath` or storage key;
- `sha256` or source checksum;
- `extractionStatus`;
- `evidenceLocator` or evidence needle;
- `claimType`;
- `runtimeUsePolicy`;
- `verificationState`.

Therefore, Samsung, SK, Hanwha, Hyundai Motor, LG, and future groups may have
different input adapters, but they must not have different runtime schemas or
different claim-promotion gates. This is part of the paper contribution: the
harness absorbs source heterogeneity before the LLM sees the context.

Each top-level target also needs a logo contract:

```json
{
  "displayOrder": 1,
  "ftcAssetRank2025": 1,
  "selectorNote": "식별자 보강 필요",
  "logoAsset": {
    "src": "/logos/example.svg",
    "label": "Example",
    "slot": "wide",
    "source": "Public or licensed source reference",
    "licenseNote": "Trademark and redistribution note"
  }
}
```

`selectorNote` should not summarize a conglomerate's whole business portfolio.
The target users already know the broad businesses, and a short list can
misrepresent a diversified group. Use it for research/demo readiness instead,
for example `DART/KRX 연결 기준` or `식별자 보강 필요`.

For paper-quality evidence, seed values in `src/briefingTemplate.ts` must later
be replaced or backed by source-linked snapshots.

Before a target profile is treated as paper-ready, run:

```bash
npm run validate:template
```

## Current Coverage

- Hanwha Group: reference slice with multiple companies from the PoC.
- Samsung Group: first completed transfer slice with 15-company identifiers,
  DART financial table, source inventory, DART filing extraction, wiki seed,
  source-backed financial and narrative claims, and frozen evaluation
  scenarios.
- SK Group: bounded second transfer slice with four verified companies,
  16 source-backed seed claims, generated wiki pages, and frozen evaluation
  scenarios.
- Hyundai Motor Group: seed-unverified expansion profile.
- LG Group: seed-unverified expansion profile.

## Why This Matters

The research claim becomes stronger if the system demonstrates:

- one deep reference slice;
- a reusable group-level schema;
- identical trace behavior across groups;
- clear source-status labels for unverified expansion groups.
