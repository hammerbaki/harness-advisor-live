# Hyundai Motor Group Source Request

Date: 2026-05-03

## Purpose

This request defines the minimum source package needed to create a
Hyundai Motor Group transfer slice using the same harness rules already used
for Hanwha, Samsung, and SK. The request should not be phrased as "collect all
related documents." The collection target is bounded, official, dated, and
company-routed.

## Recommended Initial Coverage

Start with three listed companies:

| Company | KRX code | OpenDART corp code | Purpose |
| --- | --- | --- | --- |
| 현대차 | 005380 | 00164742 | Representative group and automotive/EV baseline |
| 기아 | 000270 | 00106641 | Automotive profitability and global sales comparison |
| 현대모비스 | 012330 | 00164788 | Parts, electrification, and module/systems exposure |

Optional second wave:

| Company | KRX code | OpenDART corp code | Purpose |
| --- | --- | --- | --- |
| 현대글로비스 | 086280 | 00360595 | Logistics, shipping, and supply-chain exposure |
| 현대제철 | 004020 | 00145880 | Steel/materials and group industrial cycle exposure |

The first slice should not exceed five companies unless there is a specific
paper or client-demo need. The goal is transferability, not encyclopedic
coverage.

Identifier verification is recorded in:

```text
raw/manifests/hyundai-motor.identifier-verification.json
```

The reusable onboarding rule and Hyundai-specific intake shell are recorded in:

```text
docs/53_group_onboarding_standard.md
configs/group-onboarding-template.json
raw/manifests/hyundai-motor.source-intake-template.json
```

## Required Metadata Per Document

For every collected document, record:

- `groupId`: `hyundai-motor`;
- `companyId`: one of `hyundai-motor`, `kia`, `hyundai-mobis`,
  `hyundai-glovis`, `hyundai-steel`;
- official source page URL;
- direct document URL, if available;
- DART receipt URL, if the document is a filing;
- document title;
- issuer/company name;
- document type;
- reporting period or event date;
- language;
- local file path;
- download timestamp;
- note on whether the file is text-bearing or image/scan-heavy.

## Source Types To Collect

Collect these for each first-slice company where available:

1. Latest annual report or DART business report.
2. Latest four quarterly earnings presentations or earnings releases.
3. Latest investor presentation.
4. Latest value-up, shareholder-return, dividend, or capital-allocation
   material.
5. Latest sustainability or strategy document only if it directly supports an
   investor-facing claim.

Do not collect:

- broad press archives without a selected claim purpose;
- analyst reports unless rights are cleared;
- news articles as source-backed knowledge;
- image-only PDFs without noting that OCR or a text alternative is required;
- marketing brochures that cannot support a bounded investor claim.

## Candidate Claim Themes

The first Hyundai slice should support bounded questions such as:

- Hyundai Motor and Kia profitability, sales mix, EV/hybrid transition, and
  shareholder-return policy;
- Hyundai Mobis electrification, modules, parts profitability, and customer
  mix;
- group-level exposure to FX, global demand, tariffs, battery/EV cycle, and
  supply-chain risk only when supported by official documents.

Each theme must later become atomic source-backed claims. A collected document
is not runtime knowledge until a claim has:

- `companyId`;
- `companyScope`;
- claim type;
- exact source URL;
- extraction hash;
- evidence locator or evidence needle;
- period/reporting basis;
- forward-looking label if applicable;
- runtime use policy.

## Suggested Folder Layout

Use this local layout so the intake adapter can be simple:

```text
hyundai_knowledge/
  README.md
  hyundai_motor/
    annual_reports/
    earnings/
    investor_presentations/
    value_up/
  kia/
    annual_reports/
    earnings/
    investor_presentations/
    value_up/
  hyundai_mobis/
    annual_reports/
    earnings/
    investor_presentations/
    value_up/
  optional_second_wave/
    hyundai_glovis/
    hyundai_steel/
```

Add one URL ledger file at the root:

```text
hyundai_knowledge/document_urls.md
```

The URL ledger should be a table with:

```text
company | companyId | local_file | source_page_url | direct_document_url | dart_receipt_url | title | date | document_type | request_package | selection_reason | rights_level | note
```

The additional fields are intentional. `request_package` maps the source to the
client-source request protocol, `selection_reason` prevents ad hoc collection,
and `rights_level` prevents materials from entering runtime claims without a
use policy.

## Success Criteria

The Hyundai package is sufficient when it can produce:

- verified DART/KRX identifiers for the first-slice companies;
- a local source inventory;
- extraction report;
- narrative claim queue;
- at least 8 source-backed claims;
- generated wiki pages;
- a frozen reference-slice scenario file with 3-5 investor questions.

The package is not sufficient if it only provides broad IR entry pages without
document-level URLs, or if most PDFs are image-only without OCR or text-bearing
alternatives.
