# Hanwha Official IR Gap Audit

Audit date: 2026-05-01

## Judgment

The user's judgment is correct: before promoting Hanwha claims into the LLM Wiki,
the local materials must be checked against the official Hanwha IR route and
its parallel/sub routes. This is necessary for both paper credibility and
commercial reliability.

## Official Route

Root used for the scan:

`https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp`

The crawler stayed within the same-origin `/hanwha/investment/` route and
captured official download links from IR materials, IR promotional materials,
periodic reports, audit reports, disclosure policy, and governance pages.

## Scan Result

- official investment pages visited: 38
- official downloads found: 131
- PDFs: 129
- MP3 files: 2
- local source files matched to official route after backfill: 45 of 45
- official downloads absent from local folder after backfill: 86

## Interpretation

The current `../hanhwa_knowledge` folder is not the complete official IR
archive. It is a scoped reference-slice corpus focused on current Hanwha
materials, governance baselines, five-year annual-report baseline coverage, and
selected market context.

For the paper, every retained local source needs a rule-based selection
rationale. The same rule set should be applied to Hanwha, Samsung, SK, Hyundai
Motor, LG, and future target groups.

This is acceptable for the paper if the claim is framed as:

```text
The Hanwha reference slice uses a scoped corpus of current official IR,
periodic-report, audit-report, governance, and selected market-view materials,
with official provenance checked against Hanwha Corporation's public investment
site.
```

It is not acceptable to claim:

```text
The corpus contains the full Hanwha official IR archive.
```

## Missing Local Materials

Before backfill, the absent official downloads included:

- older earnings presentations from 2018-2025;
- 2025 interim earnings materials not in the local folder;
- 2022-2023 interim periodic reports and older 2015-2020 periodic reports;
- older audit reports;
- IR promotional materials;
- board/governance policy PDFs;
- MP3 earnings/audio files.

The backfill process downloaded 14 files because they satisfy the common
source-selection policy for the current reference slice:

- 2025 1Q-3Q earnings decks;
- the 2026 investor presentation tied to spin-off, corporate value, and
  shareholder value;
- governance, disclosure, board, and committee policy PDFs;
- 2021 and 2022 annual business reports.

The remaining 86 official downloads are not added now. They are mainly older
archive material, MP3 files, an external governance standard, and one
claim-driven 2025 investment explanation file. They should be downloaded only
when a claim, evaluation scenario, or runtime feature requires them.

## Research Decision

Proceed with source-backed wiki promotion only for local files that are matched
in `raw/manifests/hanwha.source-provenance.json`.

Before promotion, require a document-level selection rationale from
`raw/manifests/hanwha.selection-rationale.json`. Each rationale should reference
the common rule IDs in `configs/source-selection-policy.json`.

Keep missing official downloads as a gap list in
`raw/manifests/hanwha.official-site-scan.json`. This improves transparency and
prevents silent overclaiming.

Keep the backfill decision record in
`raw/manifests/hanwha.official-backfill-plan.json`. This shows why the project
does not need to mirror the entire official archive before building the current
paper/demo knowledge system.

## Source References

- `raw/manifests/hanwha.official-site-scan.json`
- `raw/manifests/hanwha.source-provenance.json`
- `raw/manifests/hanwha.selection-rationale.json`
- `raw/manifests/hanwha.official-backfill-plan.json`
