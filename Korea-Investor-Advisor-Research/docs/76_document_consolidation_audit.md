# Document Consolidation Audit

Generated: 2026-05-09T05:27:12.448Z

## Verdict

The documentation set is useful but too large for daily product work. The correct approach is staged consolidation: keep fixed-path generated documents in place until script outputs are migrated, but reduce the daily reading path to a small active set now.

## Whole-Folder Check

| Check | Count | Meaning |
| --- | ---: | --- |
| Markdown files in `docs/` | 93 | Full trace and evidence corpus. |
| Active reading path | 17 | Practical daily-document set. |
| Direct automation references | 61 | Moving these requires script/config updates. |
| Likely generated/evidence logs | 64 | Keep machine-addressable until paths are migrated. |
| Archive candidates | 14 | Historical PoC/stage notes that can be moved later. |
| Possible visible reduction | 82% | Reduction in daily-facing docs if active path is enforced. |

## Action Counts

| Action | Files |
| --- | ---: |
| `archive-after-safety-pass` | 9 |
| `keep-active` | 17 |
| `consolidate-after-first-slice` | 10 |
| `keep-generated-until-path-migration` | 57 |

## Active Reading Path

- `docs/01_architecture.md`
- `docs/53_group_onboarding_standard.md`
- `docs/65_product_completion_stage_gate.md`
- `docs/69_knowledge_base_folder_structure.md`
- `docs/70_arxiv_25_company_baseline.md`
- `docs/71_first_slice_selection_criteria.md`
- `docs/72_first_slice_readiness_audit.md`
- `docs/73_first_slice_gap_closure_plan.md`
- `docs/74_paper_capture_ui_mode.md`
- `docs/75_live_api_integration_readiness.md`
- `docs/76_document_consolidation_audit.md`
- `docs/77_ir_download_backfill_import.md`
- `docs/78_project_folder_reclassification.md`
- `docs/79_source_ledger_and_consolidation.md`
- `docs/80_knowledge_base_folder_organization.md`
- `docs/81_ir_download_retirement.md`
- `docs/README.md`

## Consolidation Groups

| Future document | Group ID | Current files |
| --- | --- | ---: |
| Method And Harness | `method_harness_engineering` | 9 |
| Source Governance | `source_governance_and_claim_promotion` | 9 |
| Company Transfer Logs | `five_group_transfer_log` | 31 |
| Publication Strategy | `publication_strategy` | 4 |
| Product Stage Control | `product_stage_control` | 8 |
| PoC Reconstruction Archive | `poc_archive` | 15 |

## Why Not Move Everything Now

Several scripts and exports write to or validate fixed document paths. Moving generated documents immediately would break reproducibility unless those scripts are migrated in the same change. The safe sequence is:

1. keep all fixed-path documents in place during first-slice backfill;
2. use `docs/README.md` as the active reading path;
3. after the 25-company slice is stable, migrate script output paths to `docs/generated/`;
4. move older PoC/stage notes to `docs/archive/`;
5. create synthesized method, source-governance, company-transfer, and publication documents.

## Proposed Final Shape

```text
docs/
  README.md
  architecture.md
  method_harness_engineering.md
  source_governance_and_claim_promotion.md
  first_slice_25_company_baseline.md
  live_api_and_runtime_trace.md
  paper_capture_ui_mode.md
  publication_strategy.md
  company-transfer/
    hanwha.md
    samsung.md
    sk.md
    hyundai-motor.md
    lg.md
  generated/
  archive/
```

## Machine-Readable Artifact

The machine-readable classification is stored in `raw/manifests/document-consolidation-audit.json`.
