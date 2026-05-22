# Knowledge Base Folder Organization

Generated: 2026-05-07T01:39:50.602Z

## Purpose

This note records the Knowledge Base folder organization pass. The pass does not flatten or move raw source files. It adds root and group README files plus a generated `_index` directory so the project can navigate raw sources through a shallow, reproducible source abstraction.

## Result

| Metric | Count |
| --- | --- |
| Source records covered | 600 |
| Company index rows | 38 |
| PDF sources | 578 |
| Sources with URL | 593 |
| Sources with selection reason | 590 |
| Reconciled `ir_download` matches | 210 |
| Group README files written | 5 |
| Ignored local system files | 9 |

## Generated Files

- `Knowledge Base/README.md`
- `Knowledge Base/_index/README.md`
- `Knowledge Base/_index/company-source-index.md`
- `Knowledge Base/_index/group-source-summary.md`
- `Knowledge Base/_index/company-source-index.csv`
- `Knowledge Base/_index/group-source-summary.csv`
- `Knowledge Base/_index/folder-taxonomy.md`
- `Knowledge Base/_index/folder-taxonomy.csv`
- `Knowledge Base/_index/system-files-to-ignore.md`
- `Knowledge Base/_index/source-ledger-pointer.json`
- `Knowledge Base/samsung_knowledge/README.md`
- `Knowledge Base/sk_knowledge/README.md`
- `Knowledge Base/hyundai_knowledge/README.md`
- `Knowledge Base/lg_knowledge/README.md`
- `Knowledge Base/hanhwa_knowledge/README.md`

## Why This Is The Right Organization

The product needs reproducibility and traceability more than a visually flat folder tree. Deep raw folders preserve source collection context. The correct abstraction layer is therefore the source ledger: `sourceId`, `groupId`, `companyId`, `documentType`, `sourceUrl`, `selectionReason`, and readiness state.

## Repeatable Folder Abstraction

The physical folder names are normalized through `configs/source-folder-taxonomy.json` instead of forcing every company package into the same low-level folder tree. Generated taxonomy files in `Knowledge Base/_index/folder-taxonomy.md` and `Knowledge Base/_index/folder-taxonomy.csv` map Korean, English, and legacy collector folder names to repeatable categories such as `earnings`, `annual_reports`, `quarterly_reports`, `audit_reports`, `investor_presentations`, `value_up`, `governance`, `sustainability`, `metadata`, `archive_or_legacy`, and `misc`.

This keeps original collection context intact while allowing the runtime and paper workflow to reason over a stable project-level source taxonomy.

## Staging Retirement

The temporary `ir_download` staging folder was retired after all 210 files were reconciled as already represented in `Knowledge Base` by SHA-256 hash. The retirement result is recorded in `docs/81_ir_download_retirement.md` and `raw/manifests/ir-download-retirement.json`.

## Group Snapshot

| Group | Sources | URL | Selection reason | `ir_download` |
| --- | --- | --- | --- | --- |
| 삼성<br><code>samsung</code> | 112 | 110 | 102 | 60 |
| SK<br><code>sk</code> | 132 | 132 | 132 | 75 |
| 현대자동차<br><code>hyundai-motor</code> | 151 | 146 | 151 | 17 |
| LG<br><code>lg</code> | 98 | 98 | 98 | 0 |
| 한화<br><code>hanwha</code> | 107 | 107 | 107 | 58 |

## Machine-Readable Artifact

- `raw/manifests/knowledge-base-organization.json`
- `configs/source-folder-taxonomy.json`
