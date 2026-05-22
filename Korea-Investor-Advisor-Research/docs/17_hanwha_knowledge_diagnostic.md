# Hanwha Knowledge Diagnostic

Diagnostic date: 2026-05-01

## Verdict

The `../hanhwa_knowledge` folder is useful for the Hanwha reference slice, but
it should enter the research system as local raw-source candidates, not as a
direct prompt block and not as a copied RAG dump.

The previous file `../한화그룹 IR 정보 지식체계.md` is valuable as a
claim map. It is not yet a paper-ready knowledge base because its claims are
compiled prose and do not carry source IDs, page references, source URLs,
checksums, or contradiction notes.

## Local Source Inventory

Observed local folder state:

- folder: `../hanhwa_knowledge`
- total size: 81.3 MB of inventoried source bytes after official backfill
- files: 45
- PDFs: 44
- non-PDF or missing extension: 1 governance document
- current markdown files inside the folder: none

The folder contains official issuer material and third-party analyst material:

- official reports: annual, quarterly, half-year, audit, consolidated audit;
- IR material: 4Q25 earnings, 2026 corporate value-up plan, preferred-share
  purchase material;
- governance material: 2026 articles of incorporation download;
- analyst reports: NH, SK Securities, Samsung Securities, Daishin, Kiwoom, and
  Hanwha Investment reports.

The official backfill step added 14 files under
`../hanhwa_knowledge/_official_backfill/`:

- 2025 1Q-3Q official earnings decks, completing the existing 4Q25 earnings
  sequence;
- a 2026 official investor presentation on spin-off, corporate value, and
  shareholder value;
- eight governance/disclosure/board and committee policy PDFs;
- 2021 and 2022 annual business reports for a 2021-2025 annual baseline.

## Use Assessment

Official issuer material is the right primary layer for the paper and demo. It
can be used after each document receives a public URL, access date, checksum,
and canonical source key such as a DART receipt number or IR page URL.

Analyst reports are useful as secondary market interpretation, but they should
not be redistributed as full extracted text unless licensing is clear. In the
paper artifact, treat them as metadata and short notes only, or cite only the
minimum bibliographic information needed to explain an input signal.

The old markdown knowledge system should be split into atomic claims and
re-linked to the source inventory. Any value that cannot be traced to a source
document should stay as `draft` or `unverified` in the wiki.

## Processing Plan

1. Inventory local files with checksums.
2. Add missing public URLs and access dates.
3. Deduplicate repeated audit/periodic-report files.
4. Extract official issuer PDFs into local working markdown.
5. Convert extracted content into LLM Wiki pages with source references.
6. Use analyst reports only as secondary interpretation and conflict checks.
7. Run wiki lint and template validation before paper screenshots.

The first implemented step is:

```bash
npm run inventory:hanwha
```

It creates `raw/manifests/hanwha.local-sources.json`. This manifest is a local
candidate inventory, not a redistribution package.

The second implemented step is:

```bash
npm run crawl:hanwha-official
```

It creates `raw/manifests/hanwha.official-site-scan.json`. This records the
official Hanwha IR/investment route, discovered download links, and whether each
official download is present in the local source folder.

The third implemented step is:

```bash
npm run provenance:hanwha
```

It creates `raw/manifests/hanwha.source-provenance.json`. This links local files
to official Hanwha source pages and states the corpus scope.

The fourth implemented step is:

```bash
npm run extract:hanwha
```

It creates `raw/manifests/hanwha.extraction-report.json`. The default report
captures extraction metadata and text hashes only. Full text extraction is
available for private local review through `HANWHA_EXTRACT_WRITE_TEXT=1`, but
that output is excluded from version control.

The fifth implemented step is:

```bash
npm run claims:hanwha
```

It creates `raw/manifests/hanwha.claim-candidates.json`. This turns the old
RAG markdown into source-linking work items instead of treating it as verified
runtime knowledge.

The official backfill decision step is:

```bash
npm run backfill:hanwha
```

It creates `raw/manifests/hanwha.official-backfill-plan.json` and
`docs/21_hanwha_official_backfill_plan.md`. The plan records which missing
official downloads are added now and which remain claim-driven or manifest-only.

The ingestion chain can be checked with:

```bash
npm run validate:hanwha-ingestion
```

## LLM Wiki Fit

This is a good fit for the LLM Wiki pattern because the project needs knowledge
to compound over time:

```text
immutable raw sources -> LLM-maintained wiki -> bounded runtime context package
```

The raw folder remains source of truth. The wiki becomes the maintained,
human-readable synthesis layer. Prompt text stays short because source routing,
staleness checks, contradiction labels, citations, and target resolution are
code-owned.

## Paper Suitability

The current source set is suitable for the commercialization-before-paper phase
only if the paper claim is framed carefully:

```text
We reconstruct a PoC into a traceable advisor architecture and demonstrate the
method on a Hanwha reference slice using public-source candidate materials.
```

Do not claim that the old markdown file is a verified financial knowledge base.
Do not claim full five-group coverage until the same source inventory and wiki
process has been repeated for Samsung, SK, Hyundai Motor, and LG.

## Next Freeze Criteria

- `raw/manifests/hanwha.local-sources.json` exists and is reproducible.
- Canonical source URLs are added for selected official documents.
- `raw/manifests/hanwha.official-backfill-plan.json` has no remaining
  `download-now` items after approved backfill.
- Hanwha wiki pages move from `draft` to `source-backed` only after source
  references are present.
- The app answer trace identifies whether a claim came from fixture, local
  source, wiki, fallback, or live API.
- Replit deployment does not require copying the full 57 MB local PDF folder.
