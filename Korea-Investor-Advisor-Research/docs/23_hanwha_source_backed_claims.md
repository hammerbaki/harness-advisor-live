# Hanwha Source-Backed Seed Claims

Generated: 2026-05-06T04:46:25.722Z

## Purpose

This note records the first Hanwha claims promoted from old RAG-style prose into claim-level, source-backed seed knowledge. The goal is not to certify the entire Hanwha corpus. The goal is to establish a reproducible promotion gate that can be reused for Samsung, SK, Hyundai Motor, LG, and future groups.

## Promotion Gate

A claim is promoted only when all of the following are true:

1. the claim is atomic enough to answer or cite directly;
2. the claim points to an official source manifest ID;
3. the source has official-site provenance with a page URL or download URL;
4. the extracted text has a text hash and review locator;
5. the claim records source-selection rule IDs;
6. the runtime policy states whether stale or forward-looking handling is needed.

## Summary

- Old RAG candidates reviewed as backlog: 106
- Source-backed seed claims promoted: 15
- Source-selection policy version: 2026-05-01

## Claims

| ID | Target | Claim type | Source | Runtime policy |
| --- | --- | --- | --- | --- |
| `hanwha-sbc-001` / `hanwha` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-002` / `hanwha` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-003` / `hanwha` | `wiki/groups/hanwha/investment-thesis.md` | `business_pipeline` | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-004` / `hanwha` | `wiki/groups/hanwha/investment-thesis.md` | `business_pipeline` | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-005` / `hanwha` | `wiki/groups/hanwha/investment-thesis.md` | `business_strategy` | `hanwha-local-70253ef29b11` | `eligible_for_bounded_context` |
| `hanwha-sbc-006` / `hanwha` | `wiki/groups/hanwha/value-up.md` | `capital_action` | `hanwha-local-55e3664d4fc8` | `eligible_for_bounded_context_with_staleness_check` |
| `hanwha-sbc-007` / `hanwha` | `wiki/groups/hanwha/value-up.md` | `value_up_plan` | `hanwha-local-55e3664d4fc8` | `eligible_for_bounded_context_with_forward_looking_label` |
| `hanwha-sbc-008` / `hanwha` | `wiki/groups/hanwha/value-up.md` | `shareholder_return` | `hanwha-local-55e3664d4fc8` | `eligible_for_bounded_context_with_staleness_check` |
| `hanwha-sbc-009` / `hanwha` | `wiki/groups/hanwha/value-up.md` | `capital_allocation` | `hanwha-local-0d0d62143448` | `eligible_for_bounded_context_with_forward_looking_label` |
| `hanwha-sbc-010` / `hanwha` | `wiki/groups/hanwha/governance.md` | `governance_process` | `hanwha-local-eec91ff3b25f` | `eligible_for_bounded_context` |
| `hanwha-sbc-011` / `hanwha` | `wiki/groups/hanwha/governance.md` | `investor_communication` | `hanwha-local-0d0d62143448` | `eligible_for_bounded_context` |
| `hanwha-sbc-012` / `hanwha-aerospace` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-6340a4d368a9` | `eligible_for_bounded_context_with_recent_ir_label` |
| `hanwha-sbc-013` / `hanwha-solutions` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-440a6de8fb0d` | `eligible_for_bounded_context_with_recent_ir_label` |
| `hanwha-sbc-014` / `hanwha-systems` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-c7cf5664d769` | `eligible_for_bounded_context_with_preliminary_ir_label` |
| `hanwha-sbc-015` / `hanwha-ocean` | `wiki/groups/hanwha/financials.md` | `financial_metric` | `hanwha-local-7fce556971af` | `eligible_for_bounded_context_with_recent_ir_label` |

## Runtime Rule

Runtime answers may use these claims only as bounded context. They should still show source links, source dates or periods, and stale/forward-looking labels when the `runtimeUsePolicy` requires it. Claims outside this manifest remain unverified unless separately promoted.

## Source References

- `raw/manifests/hanwha.source-backed-claims.json`
- `raw/manifests/hanwha.extraction-report.json`
- `raw/manifests/hanwha.source-provenance.json`
- `raw/manifests/hanwha.claim-candidates.json`
- `configs/source-selection-policy.json`
