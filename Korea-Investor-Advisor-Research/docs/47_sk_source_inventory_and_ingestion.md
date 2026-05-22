# SK Source Inventory And Ingestion

Date: 2026-05-03

## Purpose

This document records the first SK narrative-source ingestion step after the
financial seed. It keeps the project aligned with the paper and product
principle:

```text
source file -> public document URL -> extraction -> candidate claim -> promoted claim
```

Local PDFs and extracted markdown are review material. They do not become
runtime evidence until a source-backed claim is promoted with `companyId`,
source URL, period, evidence locator, and review status.

## Inputs

User-supplied source folder:

```text
../sk_knowledge
```

Main metadata note:

```text
../sk_knowledge/SK그룹 4개사 IR 자료 — 문서 단위 URL 목록.md
```

The folder is organized by SK listed company:

| Company | Local folder | Current role |
| --- | --- | --- |
| SK하이닉스 | `sk_ir/sk_hynix` | memory/value-up/strategy source candidate |
| SK이노베이션 | `sk_ir/sk_innovation` | energy/battery earnings source candidate |
| SK | `sk_ir/sk_inc` | holding-company portfolio/value-up source candidate |
| SK텔레콤 | `sk_ir/sk_telecom` | telecom/AI/value-up source candidate |

Two SK Hynix event-material PDFs listed in the URL note but missing locally were
downloaded from the official SK Hynix CDN into:

```text
../sk_knowledge/sk_ir/sk_hynix/event_materials
```

These are useful for HBM/AI-memory review, but the current PDF text extractor
returns no embedded text for them, so they require OCR or an official transcript
before claim promotion.

## Generated Artifacts

Inventory command:

```bash
npm run inventory:sk
```

Output:

```text
raw/manifests/sk.local-sources.json
```

Extraction command:

```bash
SK_EXTRACT_WRITE_TEXT=1 npm run extract:sk
```

Outputs:

```text
raw/manifests/sk.extraction-report.json
raw/extracted/sk/official/
```

The scripts added for this stage are:

```text
scripts/inventory-sk-knowledge.mjs
scripts/extract-sk-official-text.mjs
```

## Inventory Result

Current inventory summary:

| Metric | Count |
| --- | ---: |
| Total local entries | 58 |
| Local PDF files | 57 |
| Valid local PDFs | 57 |
| Support metadata notes | 1 |
| URL-list records | 63 |
| Matched local PDFs with document-level URL | 56 |
| PDFs pending URL reconciliation | 1 |
| Duplicate checksum groups | 11 |

Company distribution:

| Company | Entries |
| --- | ---: |
| SK | 17 |
| SK이노베이션 | 4 |
| SK텔레콤 | 25 |
| SK하이닉스 | 11 |
| Unknown/support note | 1 |

Document-type distribution:

| Document type | Count |
| --- | ---: |
| earnings presentation | 31 |
| earnings press release | 8 |
| audit report | 5 |
| value-up plan | 4 |
| review report | 3 |
| business report | 2 |
| strategy presentation | 2 |
| semiannual report | 1 |
| sustainability report | 1 |
| research note | 1 |

## URL Reconciliation

The URL list and local files are mostly aligned:

- 56 of 57 local PDFs have a matched document-level public URL.
- 1 local PDF remains pending:
  `SK / 2026-03-12연결_검토보고서(2025년_4분기)`.
- The pending file is not a runtime blocker unless a claim uses it.
- It must remain review-only until the exact SK Inc. `_UPLOAD/ACTL/...pdf`
  UUID URL is confirmed.

The URL list still contains unmatched records. Most are expected:

- 8 SK Inc. review-report rows are placeholder URLs containing `[UUID]`.
- SK Telecom DART business/audit viewer links are URL-only records rather than
  local PDFs.
- Any unmatched non-placeholder URL should be treated as a source backlog item,
  not as runtime evidence.

## Extraction Result

Current extraction summary:

| Metric | Count |
| --- | ---: |
| Extraction candidates | 57 |
| Extracted successfully | 52 |
| Extraction errors | 5 |
| Low-text warnings | 18 |
| Extracted characters | 3,548,469 |
| URL-pending extracted candidates | 1 |

Extraction errors are limited to SK Inc. local PDFs:

| Company | File | Current treatment |
| --- | --- | --- |
| SK | `2025년_사업보고서.pdf` | use alternate file `2026-03-182025년_사업보고서.pdf` unless exact need arises |
| SK | `ESG_보고서.pdf` | redownload or use official sustainability URL if ESG claim is needed |
| SK | `2024-05-162024_1Q_SK주식회사_Earnings_Briefing.pdf` | redownload if 2024 Q1 trend claim is needed |
| SK | `2024-11-142024_3Q_SK주식회사_Earnings_Briefing.pdf` | redownload if 2024 Q3 trend claim is needed |
| SK | `2025-08-292025_2Q_SK_Inc._Presentation.pdf` | redownload if this specific presentation is needed |

Low-text warnings are concentrated in SK Telecom investor-briefing PDFs and
the two SK Hynix Tech Seminar PDFs. These files appear to contain text as
images, outlines, or non-extractable slide objects. They should not be used for
runtime narrative claims until OCR, an official transcript, or an alternate
text-bearing source is available.

## Claim Promotion Boundary

Allowed immediately for human claim review:

- SK Innovation 2025 earnings releases;
- SK Inc. 2025 annual/business-report alternate file, 2024 value-up plan, and
  several earnings briefings with usable extracted text;
- SK Telecom press releases, 2024 Q3 investor briefing presentation, and 2024
  value-up plan;
- SK Hynix audit/review reports and 2024 value-up plan.

Not allowed for runtime promotion yet:

- SK Hynix HBM/AI seminar claims based on the downloaded Tech Seminar PDFs,
  because extracted text is currently zero characters;
- SK Inc. 2025 Q4 review-report claims based on the placeholder URL file;
- claims based on the five extraction-error PDFs;
- broad SK group strategy claims that mix SK Inc., SK Hynix, SK Innovation,
  and SK Telecom without company-level routing.

## Next Engineering Step

Create SK narrative claim candidates from the subset that passes:

1. valid local PDF;
2. matched document-level public URL;
3. successful text extraction;
4. sufficient text length or manual/OCR verification;
5. clear `companyId`;
6. bounded claim type;
7. evidence locator.

The next output should be:

```text
raw/manifests/sk.narrative-claim-queue.json
wiki/groups/sk/companies/*.md
evals/scenarios/sk.reference-slice.json
```

The claim queue has now been generated. See:

```text
raw/manifests/sk.narrative-claim-queue.json
docs/48_sk_narrative_claim_queue.md
```

The first SK reference slice should stay modest. A safe initial scope is:

- SK Innovation earnings and portfolio-pressure signals from 2025 earnings
  releases;
- SK Inc. value-up/portfolio framing from the 2024 value-up plan and 2025
  business-report text;
- SK Telecom shareholder-return/value-up and quarterly performance from
  text-bearing press releases/value-up materials;
- SK Hynix value-up and financial-report context, while HBM/AI claims wait for
  OCR or text-bearing official source material.
