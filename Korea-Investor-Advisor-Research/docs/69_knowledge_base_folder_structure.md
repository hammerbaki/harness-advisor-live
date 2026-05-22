# Knowledge Base Folder Structure

Date: 2026-05-05

This note records the new local source-folder structure after all company
materials were moved under a single sibling directory named `Knowledge Base`.
The folder is outside the product repository and should be treated as the raw
source package. The repository should store manifests, extracted text,
source-backed claims, wiki pages, evaluations, and UI/runtime code.

## Current Root

Repository root:

```text
Korea-Investor-Advisor-Research/
```

Raw source root:

```text
../Knowledge Base/
```

Expected group-level source roots:

```text
../Knowledge Base/hanhwa_knowledge
../Knowledge Base/samsung_knowledge
../Knowledge Base/sk_knowledge
../Knowledge Base/hyundai_knowledge
../Knowledge Base/lg_knowledge
```

## Observed Inventory

The observed file counts are:

| Group source folder | Files | Direct first-level folders |
| --- | ---: | --- |
| `hanhwa_knowledge` | 104 | `2021`, `2023`, `2024`, `2025`, `2026`, `Unknown_Year`, `_official_backfill`, `hanwha_aerospace`, `hanwha_ocean`, `hanwha_solutions`, `hanwha_systems` |
| `samsung_knowledge` | 114 | `삼성전자`, `삼성SDI`, `삼성물산`, `삼성바이오로직스`, `삼성전기` |
| `sk_knowledge` | 133 | `sk_hynix`, `sk_inc`, `sk_innovation`, `sk_square`, `sk_telecom` |
| `hyundai_knowledge` | 151 | `hyundai_autoever`, `hyundai_bng_steel`, `hyundai_construction`, `hyundai_glovis`, `hyundai_mobis`, `hyundai_motor`, `hyundai_rotem`, `hyundai_securities`, `hyundai_steel`, `hyundai_wia`, `innocean`, `kia` |
| `lg_knowledge` | 98 | `lg_chem`, `lg_cns`, `lg_corp`, `lg_display`, `lg_electronics`, `lg_energy_solution`, `lg_hnh`, `lg_innotek`, `lg_uplus` |

## Structural Meaning

The new structure is directionally correct for the product and paper:

- raw downloaded files are separated from repository-managed artifacts;
- each group has one stable source package;
- multi-company groups can use company-level subfolders;
- Hanwha remains a special case because the original source package is mostly
  organized by year and official-site backfill rather than by affiliate.

This does not change the runtime knowledge contract. A local file is still not
runtime knowledge until it has source metadata, extraction status, evidence
locator, claim review, and source-backed claim promotion.

## Required Code Alignment

The inventory and `ir_download` import scripts now support path abstraction:

```text
KNOWLEDGE_BASE_ROOT=/path/to/Knowledge Base
IR_DOWNLOAD_ROOT=/path/to/ir_download
```

The default remains the current sibling-folder layout, but the scripts no
longer require a hard-coded physical root. Generated manifests may still record
current relative local paths because those paths are provenance fields. Runtime
code should not depend on those deep paths.

The project-level source abstraction is now:

```text
raw/manifests/source-ledger.v0.1.json
raw/manifests/company-source-index.json
docs/79_source_ledger_and_consolidation.md
```

These artifacts consolidate deep local files into `groupId`, `companyId`,
`documentType`, `sourceUrl`, `selectionReason`, `intakeReadiness`, and
`ir_download` reconciliation fields. App/runtime/paper workflows should use
this abstraction instead of walking the raw source tree.

## Design Rule

Going forward, do not ask users or clients to scatter source packages at the
repository sibling level. All incoming material should be placed under:

```text
Knowledge Base/<group>_knowledge/
```

Each group folder should include a human-readable source provenance ledger:

```text
source_index.md
```

Existing files named `document_urls.md` can remain, but the required content is
broader than document URLs. Each row should identify the official source page,
direct document URL or DART receipt when available, local file name, document
title, covered period, selection reason, rights label, access date, and checksum
after download. This keeps dynamic issuer downloads traceable without forcing a
stable file URL that may not exist.

For groups with many subsidiaries, the preferred structure is:

```text
<group>_knowledge/
  source_index.md
  <company_id_or_stable_slug>/
    earnings/
    investor_presentations/
    annual_reports/
    value_up/
```

The Hanwha folder can be retained as an exception for historical continuity,
but future Hanwha affiliate-level expansion should migrate toward the same
company-folder convention used by SK, Hyundai Motor, and LG.
