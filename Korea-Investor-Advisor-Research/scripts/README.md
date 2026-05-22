# Scripts

`dev.mjs` starts both local services needed for the Replit-style demo:

- API server on `API_PORT` or `8787`;
- Vite frontend on `5173`.

Use:

```bash
npm run dev
```

The script keeps the development workflow reproducible without requiring a
separate process manager. In Replit, `.replit` calls the same command.

`validate-template.mjs` checks that `configs/groups.json` remains a reusable
target template:

- required group and company fields;
- mobile selector note;
- logo asset provenance and file existence;
- representative company routing;
- duplicate group IDs, company IDs, and KRX codes.

Use:

```bash
npm run validate:template
```

`validate-stage-gate.mjs` checks whether the project is ready to move from
template reconstruction into live API integration:

- required architecture, source-policy, and client-source-request documents;
- optional provider credentials listed in `.env.example`;
- short runtime prompt blocks;
- base manifest and wiki overview for every target group;
- full source-to-claim chain for the reference slice;
- planned expansion targets clearly reported as not yet source-backed.

Use:

```bash
npm run validate:stage-gate
```

`validate-structure-integrity.mjs` checks the cross-file integrity of the
research harness itself:

- `configs/groups.json` group/company IDs, default company routing, and wiki
  namespaces;
- source manifests, identifier manifests, local source inventories, extraction
  reports, and source-backed claim manifests;
- claim-to-wiki links, scenario expected-claim references, and required
  package scripts;
- legacy Hanwha `local-source-inventory.v0.1` compatibility while enforcing
  stricter `companyId` and PDF-validity gates for newer inventories.

Use:

```bash
npm run validate:structure
```

`validate-eval-scenarios.mjs` checks frozen paper/demo scenario files:

- known group IDs;
- unique scenario IDs;
- required question, intent, and paper table bucket;
- expected claim IDs that exist in the group's source-backed claim manifest;
- answer-level signal checks for future runtime evaluation.

Use:

```bash
npm run validate:evals
```

`inventory-hanwha-knowledge.mjs` scans the local `../hanhwa_knowledge` folder
and writes a checksum-based source inventory:

```bash
npm run inventory:hanwha
```

Use this before converting PDFs to markdown or updating the LLM wiki. The
inventory distinguishes official issuer material from analyst reports so the
paper artifact can avoid treating licensed third-party reports as reusable raw
text.

`crawl-hanwha-official-ir.mjs` crawls the official Hanwha investment/IR route
starting from the IR event page:

```bash
npm run crawl:hanwha-official
```

It records official page URLs, download links, and whether each official
download is present in the local source folder.

`link-hanwha-official-provenance.mjs` converts the crawl comparison into a
paper-friendly provenance manifest:

```bash
npm run provenance:hanwha
```

It links each local file to its official source page and records which official
downloads are outside the current local corpus.

`annotate-hanwha-selection-rationale.mjs` records why each local source is kept
or restricted for the current research/commercial transition:

```bash
npm run rationale:hanwha
```

It references `configs/source-selection-policy.json`, which defines the common
selection rules for Hanwha, Samsung, SK, Hyundai Motor, LG, and future target
groups.

`plan-hanwha-official-backfill.mjs` classifies official downloads missing from
the local Hanwha corpus:

```bash
npm run backfill:hanwha
```

By default it writes a plan only. To download the rule-approved backfill files
into `../hanhwa_knowledge/_official_backfill/`, run:

```bash
HANWHA_BACKFILL_DOWNLOAD=1 npm run backfill:hanwha
```

The plan intentionally keeps older archive material manifest-only until a
specific claim, evaluation scenario, or runtime feature needs it.

`extract-hanwha-official-text.mjs` checks whether official Hanwha PDFs can be
machine-extracted and records page counts, text hashes, and extraction status:

```bash
npm run extract:hanwha
```

By default it does not write full text. For private local review, run:

```bash
HANWHA_EXTRACT_WRITE_TEXT=1 npm run extract:hanwha
```

The full-text output goes under `raw/extracted/`, which is excluded from version
control and should not be uploaded to Replit unless redistribution rights are
clear.

`compile-hanwha-claim-candidates.mjs` turns the previous Hanwha RAG markdown
summary into source-linking work items:

```bash
npm run claims:hanwha
```

The output is intentionally marked `needs_source_link`. This keeps the LLM Wiki
from silently treating old PoC/RAG prose as verified evidence.

`promote-hanwha-source-backed-claims.mjs` promotes a small reviewed seed set
from the claim backlog into claim-level, official-source-backed knowledge:

```bash
npm run promote:hanwha
```

It writes `raw/manifests/hanwha.source-backed-claims.json`,
`docs/23_hanwha_source_backed_claims.md`, and generated seed-claim sections in
the relevant Hanwha wiki pages. This script is deliberately conservative: the
old RAG claim backlog remains unverified until each additional claim passes the
same promotion gate.

`validate-hanwha-ingestion.mjs` checks the full Hanwha ingestion chain:

```bash
npm run validate:hanwha-ingestion
```

It verifies that inventory, extraction, claim backlog, wiki targets, and
full-text exclusion rules remain consistent.

`inventory-samsung-knowledge.mjs` scans the local `../samsung_knowledge`
folder and combines it with the DART viewer filings supplied for Samsung Life
and Samsung Fire:

```bash
npm run inventory:samsung
```

The inventory records checksum, company routing, source role, document type,
period, processing decision, and whether a `.pdf` file is actually a valid PDF.
This mirrors the Hanwha intake gate before any claim is promoted into the wiki.

`extract-samsung-official-text.mjs` checks machine extraction for Samsung local
official PDFs:

```bash
npm run extract:samsung
```

By default it writes metadata only. For private local review output, run:

```bash
SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run extract:samsung
```

Samsung Life and Samsung Fire DART viewer filings are intentionally skipped by
this PDF extractor and will be handled by the DART document pipeline.

`validate-samsung-ingestion.mjs` checks the current Samsung source gate:

```bash
npm run validate:samsung-ingestion
```

It confirms that inventory, extraction, identifier verification, local-source
adequacy, invalid-file exclusions, and DART-viewer skips remain aligned.

`plan-samsung-claim-candidates.mjs` creates the first Samsung claim-candidate
plan without promoting any claim into runtime knowledge:

```bash
npm run claims:samsung
```

It links company-level investment themes to extracted local PDFs or pending
DART viewer filings. The output remains `candidate_plan_not_runtime_eligible`
until a reviewer drafts atomic claim text with source URL, period, reporting
basis, and evidence location.

`compile-samsung-wiki-seed.mjs` turns the Samsung claim-candidate plan into a
generated LLM Wiki seed namespace:

```bash
npm run wiki:samsung
```

This is a source-routing and review dictionary. It is not a runtime
source-backed claim set.

`generate-samsung-investor-questions.mjs` creates customer-facing candidate
questions for the Samsung expansion layer:

```bash
npm run questions:samsung
```

These questions are useful for source planning and later frozen-scenario
design, but they are not paper-baseline scenarios until Samsung source-backed
claims exist.

`fetch-samsung-dart-financial-table.mjs` uses `DART_API_KEY` to build a
2022-2024 Samsung financial table from OpenDART:

```bash
npm run financials:samsung:dart
```

It calls `fnlttSinglAcnt.json` first and uses `fnlttSinglAcntAll.json` as a
fallback. Revenue is selected only when OpenDART explicitly provides `매출액`,
`영업수익`, or `수익(매출액)`. The script preserves account labels and does not
define financial-company revenue from finance-specific accounts.

`audit-samsung-dart-financial-accounts.mjs` records what OpenDART actually
provides for Samsung Life, Samsung Fire, Samsung Card, and Samsung Securities:

```bash
npm run audit:samsung-financial-accounts
```

Use this when a financial-company figure is blank in the table. Blanks should
remain blank unless OpenDART provides an explicit account accepted by the
paper-stage rule.

`validate-samsung-financials.mjs` validates that the Samsung DART table exists
and keeps known API/account-policy gaps visible:

```bash
npm run validate:samsung-financials
```

`promote-samsung-source-backed-claims.mjs` promotes the first Samsung
DART-first seed claims:

```bash
npm run promote:samsung
```

It writes `raw/manifests/samsung.source-backed-claims.json`,
`docs/41_samsung_source_backed_seed_claims.md`, and a generated
source-backed-claim block in `wiki/groups/samsung/financials.md`. This is
deliberately narrower than the local PDF corpus: it promotes only OpenDART
annual financial-statement claims and keeps finance-company revenue blank when
OpenDART does not provide an accepted explicit revenue account.

`validate-samsung-source-backed-claims.mjs` checks that the promoted Samsung
claims preserve the DART-first policy and do not redefine financial-company
revenue:

```bash
npm run validate:samsung-claims
```

`inventory-hyundai-knowledge.mjs` scans the incoming `../hyundai_knowledge`
folder and reconciles local files with document-level ledger files such as
`document_urls.md`, `document_urls_*.md`, and Korean "문서 단위 URL 목록" files:

```bash
npm run inventory:hyundai
```

The script is safe to run before the folder exists. It writes
`raw/manifests/hyundai-motor.local-sources.json` with status
`awaiting-source-package` until files arrive. When sources are present, it
checks company routing, document type, document-level URLs, request package,
selection reason, rights label, and claim-promotion readiness.

The Hyundai parser is prepared for the current second-wave intake candidates:
Hyundai Rotem, Hyundai AutoEver, Hyundai Wia, Hyundai Engineering &
Construction, Hyundai Glovis, Innocean, Hyundai Motor Securities, and Hyundai
BNG Steel. These rows can enter inventory and narrative queue, but they are not
runtime-promoted until claim review and frozen-scenario gates are complete.
Hyundai Motor Securities follows the financial-company rule: preserve explicit
DART account labels and do not define revenue by policy.

The completed 2026-05-04 Hyundai package currently produces 84 local PDF
entries, 82 extraction candidates after duplicate filtering, 82/82 successful
text extractions, 75 narrative claim-review candidates, and 7 low-text/OCR
blockers. See `docs/58_hyundai_second_wave_source_intake_result.md`.

`validate-hyundai-intake.mjs` checks whether the Hyundai source package is
ready for extraction and claim review:

```bash
npm run validate:hyundai-intake
```

Set `HYUNDAI_INTAKE_STRICT=1` to treat warnings as errors after the document
package is supposed to be complete.

`extract-hyundai-official-text.mjs` prepares the Hyundai PDF extraction report:

```bash
npm run extract:hyundai
```

By default it writes metadata only. For private local review output, run:

```bash
HYUNDAI_EXTRACT_WRITE_TEXT=1 npm run extract:hyundai
```

Non-PDF official candidates such as PPT/PPTX/HTML are listed as
conversion/manual-review work items rather than silently dropped.

`fetch-samsung-dart-financial-table.mjs` is reused for Hyundai Motor Group by
setting `DART_GROUP_ID=hyundai-motor`. It builds the OpenDART financial seed
for Hyundai Motor, Kia, and Hyundai Mobis:

```bash
npm run financials:hyundai:dart
```

The output is
`raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json` and
`docs/54_hyundai_motor_dart_financial_table.md`.

`plan-hyundai-narrative-claim-queue.mjs` creates the non-runtime Hyundai
narrative review queue:

```bash
npm run claims:hyundai:narrative
```

It writes `raw/manifests/hyundai-motor.narrative-claim-queue.json` and
`docs/55_hyundai_motor_narrative_claim_queue.md`. Ready records still require
reviewer-authored atomic claims before runtime promotion; blocked records stay
visible with missing-file or OCR reasons.

`promote-hyundai-source-backed-claims.mjs` promotes only the OpenDART financial
seed claims for the current Hyundai slice:

```bash
npm run promote:hyundai
```

It writes `raw/manifests/hyundai-motor.source-backed-claims.json` and
`docs/56_hyundai_motor_source_backed_financial_seed.md`. Narrative IR material
is intentionally not promoted by this script.

`compile-hyundai-wiki-seed.mjs` compiles the Hyundai LLM Wiki namespace:

```bash
npm run wiki:hyundai
```

It writes `wiki/groups/hyundai-motor/` pages for the group overview, source
state, financial seed, and first-slice companies.

`eval:hyundai` runs the bounded Hyundai reference-slice scenarios:

```bash
npm run eval:hyundai
```

`quality:hyundai` converts the Hyundai evaluation result into an Agent Dog
paper-stage dashboard seed:

```bash
npm run quality:hyundai
```

`prepare-samsung-document-url-intake.mjs` builds the Samsung document-level URL
ledger:

```bash
npm run urls:samsung
```

The output is `raw/manifests/samsung.document-url-intake.json`. Local PDF rows
stay blocked until `publicDocumentUrl` contains an exact document-level public
URL. DART viewer filings already use their DART receipt URL as the public
document URL, but still require filing-text extraction before narrative claim
promotion.

`extract-samsung-dart-filings.mjs` prepares or runs Samsung Life/Fire DART
filing extraction:

```bash
SAMSUNG_DART_FILING_FETCH=0 npm run dartdocs:samsung
```

Remove `SAMSUNG_DART_FILING_FETCH=0` when live OpenDART document extraction is
intended. Set `SAMSUNG_DART_FILING_WRITE_TEXT=1` to write local markdown under
`raw/extracted/samsung/dart/`, which remains excluded from redistribution.

`plan-samsung-narrative-claim-queue.mjs` creates the non-runtime Samsung
second-seed review queue:

```bash
npm run claims:samsung:narrative
npm run validate:samsung-narrative
```

It writes `raw/manifests/samsung.narrative-claim-queue.json` and
`docs/42_samsung_url_and_narrative_claim_readiness.md`. The queue is useful for
paper methods and project control, but it does not promote narrative claims.
