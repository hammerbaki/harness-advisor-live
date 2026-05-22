# Docs

This folder contains both active product/paper control documents and historical
audit logs. The full set is intentionally preserved for traceability, but daily
work should start from the active reading path below.

## Active Reading Path

1. `../NEXT_WORKER_HANDOFF.md` — one-page operational entry point for new workers.
2. `../PROJECT_CONTEXT.md` — current project state and decision log.
3. `01_architecture.md` — system architecture.
4. `53_group_onboarding_standard.md` — reusable group/company onboarding rule.
5. `65_product_completion_stage_gate.md` — product completion criteria.
6. `69_knowledge_base_folder_structure.md` — current source folder structure.
7. `70_arxiv_25_company_baseline.md` — 25-company reference slice.
8. `71_first_slice_selection_criteria.md` — why each company enters the first slice.
9. `72_first_slice_readiness_audit.md` — current company-level readiness status.
10. `73_first_slice_gap_closure_plan.md` — remaining data and claim gaps.
11. `74_paper_capture_ui_mode.md` — Korean product UI and English paper-capture mode.
12. `75_live_api_integration_readiness.md` — DART/KRX/Naver runtime status.
13. `76_document_consolidation_audit.md` — documentation consolidation plan.
14. `77_ir_download_backfill_import.md` — latest external IR download backfill
    comparison and import result.
15. `78_project_folder_reclassification.md` — workspace-level folder/file
    taxonomy and safe physical migration gate.
16. `79_source_ledger_and_consolidation.md` — project-level source ledger that
    abstracts deep raw folders into company/document/source records.
17. `80_knowledge_base_folder_organization.md` — Knowledge Base root, `_index`,
    and group README organization result.
18. `81_ir_download_retirement.md` — retirement result for the temporary
    external IR download staging folder after SHA-256 reconciliation.
19. `82_claim_promotion_review_packet.md` — reviewer-facing queue for turning
    official source rows into atomic source-backed claims without automatic
    runtime promotion.
20. `83_claim_review_proposals_for_approval.md` — Codex first-pass reviewer
    decisions for the 25 priority source rows, prepared for user approval
    before any runtime promotion.
21. `84_claim_review_approval_record.md` — user approval record for the 25
    priority source rows, preserving approved wording, evidence locators, and
    the boundary before runtime promotion.
22. `85_review_approved_runtime_claims.md` — runtime promotion record for the
    user-approved 25 rows. It adds a review-approved source-backed claim layer
    to the five group manifests while preserving the earlier seed claims.
23. `86_product_and_paper_readiness.md` — current product-stage, arXiv
    method/demo readiness, SCI readiness, and commercial readiness gate.
24. `87_live_api_connection_smoke_test.md` — DART/KRX/Naver five-group live
    API smoke test with secret values omitted from artifacts.
25. `88_live_answer_quality_audit.md` — five-group live answer-quality smoke
    test covering visible answer hygiene, source links, follow-up questions,
    selected source-backed claims, and trace export.
26. `89_human_answer_review_packet.md` — actual live customer-facing answers
    prepared for human investment-research review after automated smoke tests.

## Current Interpretation

The documents distinguish three claims that should stay separate in product
work and later paper writing:

- what was inherited from the original PoC;
- what was reconstructed for reproducibility;
- what remains a future commercial hardening task.

## Consolidation Rule

Do not delete or move numbered intermediate documents yet. Some scripts write
to specific doc paths, and the numbered files preserve the audit trail from
source intake to claim promotion.

The near-term rule is:

- use the active reading path for decisions;
- keep generated company/source/audit notes as evidence logs;
- consolidate after the 25-company first slice is stable;
- move older logs to an archive folder only after script output paths are
  updated.

See `76_document_consolidation_audit.md` for the proposed final documentation
shape.

To refresh the document classification after new docs are added, run:

```bash
npm run audit:docs
```

This writes `raw/manifests/document-consolidation-audit.json` and regenerates
`76_document_consolidation_audit.md`.
