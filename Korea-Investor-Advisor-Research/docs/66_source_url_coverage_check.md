# Source URL Coverage Check

Date: 2026-05-05

## Purpose

This note records the source-URL coverage check after the SK source folder was
reorganized and after the Hanwha official IR route was rescanned. The immediate
paper requirement is that source packages must preserve full source URLs, not
only local filenames. The product requirement is that runtime claims may use
only sources with clear company scope, source role, document URL or official
source-page URL, and promotion rationale.

## SK Folder Structure

The current `../sk_knowledge` folder is compatible with the SK intake harness.
The expected company folders are:

- `sk_hynix` -> `sk-hynix`
- `sk_innovation` -> `sk-innovation`
- `sk_inc` -> `sk-inc`
- `sk_telecom` -> `sk-telecom`

`npm run inventory:sk` completed successfully after the folder change.

Current SK inventory:

- local entries: 58
- local PDFs: 57
- valid PDFs: 57/57
- document URL records: 63
- matched local source URLs: 56
- local PDFs still pending URL reconciliation: 1
- unmatched URL records: 19
- placeholder URL records: 8

The remaining local PDF that needs URL reconciliation is:

- `../sk_knowledge/sk_inc/audit_report/2026-03-12연결_검토보고서(2025년_4분기).pdf`

The 19 unmatched URL records are not all blockers. Eight are SK Inc. placeholder
URLs containing `[UUID]`; these need exact public URLs only if those review
reports are promoted or cited. The non-placeholder unmatched records are mostly
SK Telecom DART/viewer or IR records that exist in the URL ledger but are not
matched to local files. They can remain URL-only citation records unless the
claim-review queue needs local extraction.

## Hanwha Official URL Coverage

The Hanwha official IR site was rescanned from the official investment route:

- root URL:
  `https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp`
- scope:
  same-origin `/hanwha/investment/` route and parallel/subordinate investment
  pages
- generated manifest:
  `raw/manifests/hanwha.official-site-scan.json`

Current Hanwha scan:

- pages visited: 38
- official downloads found: 131
- local sources matched to official downloads: 45/45
- official downloads absent locally: 86
- local sources unmatched to official download: 0
- extension mix: 129 PDF, 2 MP3

The current backfill plan remains claim-driven:

- download-now: 0
- defer-claim-driven: 83
- defer-manifest-only: 3
- remaining missing downloads are not current runtime or paper blockers

This means Hanwha does not currently require additional local downloads for the
reference-slice paper/product scope. The full URL list is preserved in the
official scan manifest, while the per-file download decision is preserved in:

- `raw/manifests/hanwha.official-backfill-plan.json`
- `docs/21_hanwha_official_backfill_plan.md`
- `raw/manifests/hanwha.selection-rationale.json`
- `docs/19_hanwha_source_selection_rationale.md`

## Paper Usage Rule

The paper should not paste every source URL into the main body. Instead:

1. The main paper should cite the source-intake method and selected examples.
2. The appendix or repository artifact should provide full URL manifests.
3. Every runtime-promoted claim should cite the specific source record ID and
   source URL or official source page.
4. Deferred official URLs may be listed as manifest-level backlog, not as
   evidence used by the runtime answer.

## Next Actions

1. For SK, decide whether the one local SK Inc. review report must be cited. If
   yes, replace the placeholder URL with the exact public URL.
2. For SK Telecom, either download the unmatched URL-ledger files or mark them
   as URL-only citation records if they are not needed for local extraction.
3. For Hanwha, keep the 86 absent official downloads as manifest-level backlog
   unless a promoted claim, frozen scenario, longitudinal table, or client scope
   requires one of them.
4. For the paper, reference the manifest files rather than hand-maintaining URL
   lists in prose.
