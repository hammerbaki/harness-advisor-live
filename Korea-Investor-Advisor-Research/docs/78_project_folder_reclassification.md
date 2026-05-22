# Project Folder Reclassification

Generated: 2026-05-05T12:21:57.537Z

## Purpose

This document classifies the current project folders without physically moving active paths. The goal is to make the workspace understandable for product completion, reproducibility, paper writing, and later repository packaging.

## Current Policy

Do not physically move active roots until scripts, docs, Replit export, and paper build paths are path-agnostic. Use this taxonomy first as a stable classification layer.

## Current Top-Level Classification

| Path | Class | Role | Current action | Future action | Move risk | Files |
| --- | --- | --- | --- | --- | --- | --- |
| `Korea-Investor-Advisor-Research` | `current-product-research-repository` | Vite/React product, Node API, manifests, extracted text, wiki, evaluation, and reproducibility scripts. | `keep-as-active-root` | May be renamed to app/ only after all scripts and deployment docs are path-agnostic. | `high` | 1359 |
| `Knowledge Base` | `raw-source-package` | User/client supplied official IR, DART, PDF, PPT, and source URL packages. | `keep-outside-repo-as-immutable-source-root` | May become sources/knowledge-base after inventory scripts support SOURCE_ROOT. | `high` | 606 |
| `HanWha-Advisor-main` | `original-poc-archive` | Read-only reference snapshot from the Replit-built Hanwha advisor PoC. | `keep-read-only-and-do-not-mix-with-clean-runtime` | May become archive/original-poc/HanWha-Advisor-main after source references are stabilized. | `medium` | 537 |
| `arxiv-paper` | `paper-workspace` | Paused arXiv LaTeX draft workspace; product development remains priority. | `keep-separate-from-product-until-product-freeze` | May become papers/arxiv after paper build paths are checked. | `medium` | 23 |
| `ir_download` | `incoming-source-staging` | External source download staging area already reconciled against Knowledge Base by SHA-256. | `keep-temporarily-for-audit-replay` | Archive after no pending source drops depend on this folder. | `medium` | 210 |
| `ElizaOS.pdf` | `reference-paper` | External paper used for structure benchmarking. | `keep-at-project-root-until-reference-folder-is-approved` | Move to references/papers/ElizaOS.pdf in physical migration stage. | `low` | 1 |
| `electronics-14-04161-v2.pdf` | `author-prior-paper` | Previously published AI marketing automation agent paper used as related/prior work reference. | `keep-at-project-root-until-reference-folder-is-approved` | Move to references/prior-work/electronics-14-04161-v2.pdf in physical migration stage. | `low` | 1 |
| `.DS_Store` | `local-system-file` | macOS metadata, not project evidence. | `ignore` | Remove during repository packaging, not during source classification. | `low` | 1 |

## Recommended Stable Meaning

- `Korea-Investor-Advisor-Research` is the active product and research repository.
- `Knowledge Base` is the raw source package root. Treat it as immutable input, not as generated runtime knowledge.
- `HanWha-Advisor-main` is the original PoC archive. It should be read for feature parity and historical comparison, but not mixed into the clean runtime.
- `arxiv-paper` is a paused paper workspace. It should be updated after product behavior stabilizes.
- `ir_download` is an incoming source staging folder. Its content is already reconciled into `Knowledge Base`; keep it only for audit replay until the source intake cycle closes.
- Root-level PDFs are references. They should eventually move under `references/`, but that can wait until final packaging.

## Proposed Future Shape

```text
app/ or Korea-Investor-Advisor-Research/
sources/knowledge-base/ or Knowledge Base/
sources/incoming/
papers/arxiv/
references/
archive/original-poc/
```

## Physical Migration Gate

Do not physically rename or move the active roots until these checks pass:

- inventory scripts accept a configurable `SOURCE_ROOT` instead of hard-coded sibling paths;
- Replit export scripts use the new path map;
- paper build paths are verified;
- `npm run audit:first-slice`, `npm run validate:stage-gate`, `npm run lint:wiki`, and `npm run typecheck` pass after a dry-run path rewrite;
- the user confirms no active source collection process still writes to the old folder names.

## Machine-Readable Artifact

`raw/manifests/project-folder-classification.json`
