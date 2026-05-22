# Samsung Source Adequacy Audit

Date: 2026-05-02

## Verdict

The current `samsung_knowledge` package is sufficient to begin Samsung's first
reference-layer ingestion. It now supports a DART-first source-backed seed
claim layer, but it is not yet sufficient to freeze full narrative IR/PDF
answers or insurance-specific claims as paper evidence.

This is a good stage outcome. The material now supports a controlled Samsung
expansion experiment without pretending Samsung is already as mature as the
Hanwha reference slice.

## What Is Present

The local folder contains 43 local files, including 40 files named as PDFs and
3 markdown support notes. The current inventory adds 10 official DART viewer
filings for Samsung Life and Samsung Fire, producing 53 source entries total.
Local bytes are about 86 MB.

| Company | Local source state | Initial suitability |
| --- | --- | --- |
| 삼성전자 | 6 earnings presentation PDFs, 2024 Q4 through 2026 Q1 | good for recent operating context |
| 삼성SDI | 6 earnings presentation PDFs, 2024 Q4 through 2026 Q1 | good for recent operating context |
| 삼성물산 | 13 files including 2025 business report, audit/review reports, shareholder letters, 2026 Q1 PPT and English subtitle substitute material | strong after the non-text recording file was excluded |
| 삼성바이오로직스 | 15 files including 2024/2025 business and audit reports plus recent earnings material | strong |
| 삼성생명 | no local PDFs, but DART viewer URLs for 2024 annual and 2025 filings | acceptable official DART backbone |
| 삼성화재 | no local PDFs, but DART viewer URLs for 2024 annual and 2025 filings | acceptable official DART backbone |

## Validation Findings

0. Samsung scope universe

   The broader Samsung listed-company universe is recorded separately as 15
   companies in `raw/manifests/samsung.identifier-verification.json` and
   `configs/groups.json`. It now has a 2024 OpenDART financial seed claim
   layer in `raw/manifests/samsung.source-backed-claims.json`, but this is not
   a full narrative runtime knowledge base for all 15 companies.

1. PDF validity check

   40 of 40 local PDF-named files are valid PDFs.

   The Samsung C&T recording/non-text file that previously used a `.pdf`
   extension has been excluded from the knowledge dictionary path. The current
   Samsung C&T source path uses the available PPT/report/subtitle substitutes
   instead. This is the right rule for future clients: non-text files may be
   retained as metadata, but they do not become RAG/wiki evidence unless a
   transcript or official text substitute exists.

2. Extraction gate

   `SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run extract:samsung` extracted 40/40 official local PDF candidates
   successfully. The extractor reported 0 low-text warnings, so the current
   valid local PDFs are suitable for markdown review and claim-candidate
   generation. Private local markdown review output has also been generated
   for those 40 PDFs under `raw/extracted/samsung/official/`; this folder is
   intentionally excluded from redistribution until source rights are checked.

   The Samsung Biologics `2025_1Q_보고서` and `2025_3Q_보고서` files are treated
   as quarterly-report candidates by code-owned filename rules. This keeps the
   classification reproducible rather than relying on prompt interpretation.

3. Samsung Life and Samsung Fire DART URLs

   The supplied DART viewer URLs are usable official public sources. OpenDART
   list checks confirmed the 2025 quarterly/annual filings and the 2024 annual
   filings. The 2024 Samsung Life annual report required a narrower March 2025
   list query, but the receipt number is valid.

4. Historical financial table gap

   The current package is strongest for 2025-2026 current context and 2024/2025
   annual evidence. The DART API-backed 2022-2024 financial table now exists
   in `docs/39_samsung_dart_financial_table.md` and
   `raw/manifests/samsung.dart-financial-table.2022-2024.json`.

   Current DART table status: 35 complete company-year records, 6 partial
   financial-sector records, and 4 2022 financial-company records where
   OpenDART returns `013 조회된 데이타가 없습니다.`. The partial records are not
   filled with `이자수익`, `수수료수익`, `보험수익`, or similar finance-specific
   accounts as generic revenue, because that would make the table look more
   complete while expanding the paper beyond its intended scope.

   A separate DART account audit records what OpenDART actually provides for
   Samsung Life, Fire, Card, and Securities:
   `docs/40_samsung_financial_sector_dart_account_audit.md`.

   The gap can be closed either by:

   - adding 2022 and 2023 business reports/audit reports; or
   - using OpenDART financial statement APIs as the official extraction source
     and recording the API response manifests; or
   - leaving finance-company revenue blank unless OpenDART provides an explicit
     `매출액`, `영업수익`, or `수익(매출액)` account. This is the current paper
     policy.

## Product Interpretation

For the app, this package is enough to start:

- current Samsung briefing cards;
- Samsung Electronics, SDI, C&T, Biologics, Life, and Fire source routing;
- a first DART-backed source claim layer for Samsung financial baselines;
- answer trace examples showing DART/KRX live plus local IR/PDF evidence.

It is not enough to make broad claims such as:

- "Samsung group financial history is fully verified";
- "all 15 Samsung affiliates have full narrative source-backed coverage";
- "the 2022-2024 Samsung table is paper-ready."

## Next Ingestion Step

1. Review and promote a second Samsung source-backed seed set from extracted
   local PDFs and extracted DART filings, after public document URLs and
   evidence locators are checked.
2. Keep the Samsung C&T 2026 Q1 PPT row excluded unless an exact document-level
   URL is supplied for that artifact.
3. Generate Samsung frozen evaluation scenarios only after the DART seed and
   narrative seed can answer the intended question set.
4. Promote narrative runtime claims initially around:

   - Samsung Electronics: memory/HBM and earnings recovery context;
   - Samsung SDI: battery demand and profitability context;
   - Samsung C&T: portfolio, shareholder letter, and segment performance;
   - Samsung Biologics: revenue scale, capacity, and contract/manufacturing
     context;
   - Samsung Life and Samsung Fire: capital, profitability, and shareholder
     return context from DART filings.

## Machine-Readable Record

The audit is recorded in:

```text
raw/manifests/samsung.local-source-adequacy-audit.json
```

The executable source-gate artifacts are:

```text
raw/manifests/samsung.local-sources.json
raw/manifests/samsung.extraction-report.json
raw/manifests/samsung.claim-candidate-plan.json
raw/manifests/samsung.dart-financial-table.2022-2024.json
raw/manifests/samsung.dart-financial-account-audit.2022-2024.json
evals/questions/samsung.investor-candidate-questions.json
```

Reproduce the current gate with:

```bash
npm run inventory:samsung
SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run extract:samsung
npm run claims:samsung
npm run wiki:samsung
npm run questions:samsung
npm run financials:samsung:dart
npm run audit:samsung-financial-accounts
npm run validate:samsung-ingestion
npm run validate:samsung-financials
```
