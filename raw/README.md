# Raw Sources

This folder is the source authority layer. It records public-source manifests,
evidence metadata, extraction reports, and promoted source-backed claims that
the runtime is allowed to use.

Raw sources are immutable public-source inputs. Do not rewrite files in this
folder during wiki compilation.

Recommended organization:

```text
raw/manifests/
raw/dart/
raw/ir/
raw/news/
raw/market/
```

If a source cannot be redistributed, store a manifest entry with URL, access
date, checksum if available, and extraction notes.

Local PDF folders should be inventoried before any text extraction or wiki
generation. For the Hanwha reference slice, run:

```bash
npm run inventory:hanwha
```

This writes `raw/manifests/hanwha.local-sources.json` with local paths,
checksums, inferred source roles, and processing decisions. It does not copy
PDFs into the repository and does not grant redistribution rights.

To record provenance from the official Hanwha IR site and compare it against
local files, run:

```bash
npm run crawl:hanwha-official
```

This writes `raw/manifests/hanwha.official-site-scan.json` with visited official
investment pages, discovered download links, and local match status.

Then link local files to official source provenance:

```bash
npm run provenance:hanwha
```

This writes `raw/manifests/hanwha.source-provenance.json` and states whether
the local folder is a complete archive or a scoped reference-slice corpus.

Add a policy-based document-level retention rationale before claim promotion:

```bash
npm run rationale:hanwha
```

This writes `raw/manifests/hanwha.selection-rationale.json`. The rationale must
reference the common rules in `configs/source-selection-policy.json`, so the
same approach can be reused for Samsung, SK, Hyundai Motor, LG, and future
groups.

To decide whether official files missing from the local corpus should be added,
run:

```bash
npm run backfill:hanwha
```

This writes `raw/manifests/hanwha.official-backfill-plan.json`. It downloads
nothing by default. Use `HANWHA_BACKFILL_DOWNLOAD=1 npm run backfill:hanwha`
only after reviewing the plan.

After inventorying, official issuer PDFs can be extraction-tested with:

```bash
npm run extract:hanwha
```

The default output is `raw/manifests/hanwha.extraction-report.json`, which stores
metadata and hashes rather than full extracted text. For private local review
only, set `HANWHA_EXTRACT_WRITE_TEXT=1`; that writes markdown to
`raw/extracted/`, which is intentionally git-ignored.

Finally, the previous RAG markdown can be split into verification candidates:

```bash
npm run claims:hanwha
```

This writes `raw/manifests/hanwha.claim-candidates.json`. These candidates are
not source-backed until each one is matched to a manifest entry and public
source pointer.

Promote only reviewed, atomic claims into runtime-eligible seed knowledge:

```bash
npm run promote:hanwha
```

This writes `raw/manifests/hanwha.source-backed-claims.json`. The promoted set
is a small seed layer; it does not certify every old RAG claim.

Each selected target has a `raw/manifests/<group>.json` stub. These manifests
are the source-of-truth checklist for the LLM wiki and must be populated before
any group is marked runtime-ready.

Samsung now has an additional expansion seed:

```text
raw/manifests/samsung.coverage-universe.seed.json
```

This file records the supplied listed-company financial universe as
`seed-unverified`. It is a source-request and scope-control artifact, not a
runtime source-backed claim set.

Samsung also has a first source-intake gate:

```bash
npm run inventory:samsung
SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run extract:samsung
npm run claims:samsung
npm run wiki:samsung
npm run questions:samsung
npm run urls:samsung
SAMSUNG_DART_FILING_FETCH=0 npm run dartdocs:samsung
npm run claims:samsung:narrative
npm run financials:samsung:dart
npm run audit:samsung-financial-accounts
npm run validate:samsung-ingestion
npm run validate:samsung-financials
npm run validate:samsung-narrative
```

These commands write:

```text
raw/manifests/samsung.local-sources.json
raw/manifests/samsung.extraction-report.json
raw/manifests/samsung.claim-candidate-plan.json
raw/manifests/samsung.dart-financial-table.2022-2024.json
raw/manifests/samsung.dart-financial-account-audit.2022-2024.json
raw/manifests/samsung.source-backed-claims.json
raw/manifests/samsung.document-url-intake.json
raw/manifests/samsung.dart-filing-extraction-report.json
raw/manifests/samsung.narrative-claim-queue.json
```

The current gate keeps Samsung Life and Samsung Fire DART viewer filings as
official source entries, while local Samsung Electronics, SDI, C&T, and
Biologics PDFs are extraction-tested before any claim is promoted. Non-text
recordings or invalid PDF-extension files are excluded from the knowledge
dictionary and must be replaced by text-bearing substitutes such as PPT, report
PDF, subtitle/transcript, or DART filing text.

The generated Samsung wiki seed and question set are review tools:

```text
wiki/groups/samsung/
evals/questions/samsung.investor-candidate-questions.json
```

They do not replace source-backed claim promotion.

Samsung financial-company revenue is not defined in this repository. If
OpenDART does not provide an explicit `매출액`, `영업수익`, or `수익(매출액)`
account for a company-year, the revenue field remains blank and the available
DART accounts are recorded in the account audit instead.

The first Samsung source-backed seed claim set is intentionally DART-first:

```bash
npm run promote:samsung
npm run validate:samsung-claims
```

It is a reproducible financial baseline, not a full Samsung investment thesis.
Narrative IR/PDF claims from Samsung Electronics, SDI, C&T, and Biologics must
still pass document-level public URL and evidence-locator review before
runtime promotion.

The Samsung second-seed readiness queue is prepared while document URLs are
being collected:

```text
raw/manifests/samsung.document-url-intake.json
raw/manifests/samsung.dart-filing-extraction-report.json
raw/manifests/samsung.narrative-claim-queue.json
```

Fill `publicDocumentUrl` in the URL intake manifest as exact file-level URLs
become available. Broad IR index pages stay in `sourcePageUrl` and do not
unlock narrative claim promotion by themselves.

Expansion rule:

- Hanwha source manifests define the reference shape;
- Samsung, SK, Hyundai Motor, and LG should copy the manifest structure first,
  then fill independently verified public sources;
- raw manifests feed the LLM wiki, but the wiki must never replace the manifest
  as source of truth.
