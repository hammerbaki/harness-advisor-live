# LG Source Inventory and Ingestion

Date: 2026-05-05

## Purpose

This document records how the user-supplied `../lg_knowledge` package was
converted into the same source-to-claim harness used for Hanwha, Samsung, SK,
and Hyundai Motor. The goal is not to make every LG document a runtime fact.
The goal is to make the LG corpus reproducible, company-scoped, extractable,
and ready for controlled source-backed claim review.

## Input Package

The supplied package contains LG IR materials for nine listed affiliates:

- LG Electronics (`lg-electronics`)
- LG Energy Solution (`lg-energy-solution`)
- LG Chem (`lg-chem`)
- LG H&H (`lg-hnh`)
- LG Display (`lg-display`)
- LG Innotek (`lg-innotek`)
- LG Uplus (`lg-uplus`)
- LG CNS (`lg-cns`)
- LG Corp. (`lg-corp`)

The package includes:

- `../lg_knowledge/document_urls.md`
- `../lg_knowledge/ir_urls_verified.md`
- `../lg_knowledge/LG그룹 9개 상장 계열사 IR 자료 — 문서 단위 URL 목록.md`
- company folders with PDF/XLSX files.

The local package reports PDF 93 files and XLSX 5 files. The generated
inventory confirms 98 local entries.

## Identifier Verification

The following DART/KRX identifiers are now recorded in
`raw/manifests/lg.identifier-verification.json`:

| Company | Company ID | KRX | OpenDART |
| --- | --- | --- | --- |
| LG전자 | `lg-electronics` | 066570 | 00401731 |
| LG화학 | `lg-chem` | 051910 | 00356361 |
| LG에너지솔루션 | `lg-energy-solution` | 373220 | 01515323 |
| LG생활건강 | `lg-hnh` | 051900 | 00356370 |
| LG디스플레이 | `lg-display` | 034220 | 00105873 |
| LG이노텍 | `lg-innotek` | 011070 | 00105961 |
| LG유플러스 | `lg-uplus` | 032640 | 00231363 |
| LG씨엔에스 | `lg-cns` | 064400 | 00139834 |
| LG | `lg-corp` | 003550 | 00120021 |

## Inventory Result

Command:

```bash
npm run inventory:lg
```

Generated artifact:

- `raw/manifests/lg.local-sources.json`

Summary:

- Local entries: 98
- Valid PDF files: 93/93
- Non-PDF files: 5
- Ledger records: 88
- Unmatched ledger records: 0
- Duplicate checksum groups: 6

The duplicate groups are retained as manifest-only references and excluded from
extraction/claim promotion. This prevents duplicated local files from inflating
claim density.

## Extraction Result

Command:

```bash
LG_EXTRACT_WRITE_TEXT=1 npm run extract:lg
```

Generated artifacts:

- `raw/manifests/lg.extraction-report.json`
- local review markdown under `raw/extracted/lg/official/`

Summary:

- PDF extraction candidates: 87
- Extraction OK: 87/87
- Extraction errors: 0
- Low-text/OCR warnings: 5
- Non-PDF official candidates requiring conversion/manual review: 5
- Extracted text characters: 2,595,254

Low-text blockers:

| Company | Source | Text chars | Reason |
| --- | --- | --- | --- |
| LG에너지솔루션 | 2023_Q1_실적발표자료_KR | 271 | low-text/OCR review needed |
| LG에너지솔루션 | 2025_Q1_실적발표자료_KR | 413 | low-text/OCR review needed |
| LG에너지솔루션 | 2025_Q2_실적발표자료_KR | 187 | low-text/OCR review needed |
| LG에너지솔루션 | 2025_Q3_실적발표자료_KR | 176 | low-text/OCR review needed |
| LG생활건강 | 2026_Q1_실적 | 73 | low-text/OCR review needed |

Non-PDF blockers are LG Corp. English XLSX earnings files. They can be used only
after spreadsheet conversion or manual table extraction.

## Narrative Queue Result

Command:

```bash
npm run claims:lg:narrative
```

Generated artifacts:

- `raw/manifests/lg.narrative-claim-queue.json`
- `docs/64_lg_narrative_claim_queue.md`

Summary:

- Queue records: 92
- Ready for human claim review: 82
- Blocked before claim review: 10
- Low-text/OCR blockers: 5
- Non-PDF conversion/manual-review blockers: 5
- Skipped duplicate reference files: 6

## LG-Specific Extension

LG is useful as a harness stress test because official source collection uses
multiple access patterns:

- direct public PDF URLs;
- official downloads that may require Referer headers;
- session/S3-style attachment URLs;
- POST/fileId download routes;
- dynamic browser-only downloads;
- PDF and XLSX mixed earnings sources.

These differences are intentionally handled at the source-intake boundary. The
downstream artifacts stay common:

```text
identifier verification
-> local source inventory
-> extraction report
-> narrative claim queue
-> source-backed claim promotion
-> LLM wiki namespace
-> frozen scenario evaluation
```

## Runtime Boundary

The LG runtime still has only a bounded DART financial seed for LG Electronics,
LG Chem, and LG Energy Solution. The 9-company IR package is now ready for
human claim review, but it is not runtime knowledge yet.

Before any LG narrative answer is exposed as source-backed product output, a
reviewer must promote atomic claims with:

- `companyId` and `companyScope`;
- exact claim text;
- source artifact and source URL;
- page/line/evidence locator or evidence needle;
- period and reporting basis;
- forward-looking label when the claim is plan/outlook/guidance;
- rights-safe citation policy.

## Next LG Step

Promote a small LG narrative subset first rather than trying to promote all 82
ready rows. Recommended first subset:

1. LG Electronics latest 2026 Q1 and 2025 Q4 earnings material;
2. LG Chem 2026 Q1 earnings, 2025 business report, and 2025 value-up progress;
3. LG Energy Solution 2026 Q1 and 2025 Q4 earnings material;
4. LG Corp. 2025 value-up progress;
5. one LG CNS or LG Uplus source only if the product needs telecom/DX coverage
   in the first LG demo.

This keeps the paper/product claim boundary credible while giving the UI
enough LG-specific substance.
