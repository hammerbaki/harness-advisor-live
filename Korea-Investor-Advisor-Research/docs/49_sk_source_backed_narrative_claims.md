# SK Source-Backed Narrative Claims

Generated: 2026-05-06T04:36:18.352Z

## Purpose

This note records the first SK narrative claims promoted into source-backed seed knowledge. It extends the SK financial seed without changing the common harness boundary used for Hanwha and Samsung.

## Promotion Rule

A local source enters runtime only when it has a matched public document URL, successful text extraction, no low-text warning, source text hash, evidence line locator, companyId, companyScope, and source-selection policy IDs. The narrative queue remains a review ledger; only claims in `raw/manifests/sk.source-backed-claims.json` are runtime-eligible.

## Summary

- Total SK source-backed claims: 22
- Financial seed claims preserved: 10
- Narrative seed claims promoted: 12
- Narrative queue ready sources: 26
- Narrative queue blocked sources: 31
- Source-selection policy version: 2026-05-01

## Narrative Claims

| ID | Company | Type | Forward-looking | Source |
| --- | --- | --- | --- | --- |
| `sk-sbc-011` | SK하이닉스 | `business_strategy` | yes | `sk-local-1f3a2e24c2e6` |
| `sk-sbc-012` | SK하이닉스 | `shareholder_return` | yes | `sk-local-1f3a2e24c2e6` |
| `sk-sbc-013` | SK이노베이션 | `business_strategy` | yes | `sk-local-e4f0fa5ef4ed` |
| `sk-sbc-014` | SK이노베이션 | `business_strategy` | yes | `sk-local-e4f0fa5ef4ed` |
| `sk-sbc-015` | SK | `business_strategy` | yes | `sk-local-d020660e5bd5` |
| `sk-sbc-016` | SK | `shareholder_return` | yes | `sk-local-d020660e5bd5` |
| `sk-sbc-017` | SK텔레콤 | `business_strategy` | no | `sk-local-77570239f18d` |
| `sk-sbc-018` | SK텔레콤 | `business_strategy` | yes | `sk-local-77570239f18d` |
| `sk-sbc-019` | SK스퀘어 | `value_up_plan` | yes | `sk-local-a8520c7b2b32` |
| `sk-sbc-020` | SK스퀘어 | `financial_metric` | no | `sk-local-19faec03a771` |
| `sk-sbc-021` | SK스퀘어 | `shareholder_return` | no | `sk-local-19faec03a771` |
| `sk-sbc-022` | SK스퀘어 | `portfolio_value` | no | `sk-local-19faec03a771` |

## Remaining Boundaries

- SK Hynix HBM seminar PDFs are still not promoted from the image-like seminar files; the current HBM/AI memory framing is limited to the text-bearing value-up plan.
- SK Innovation claims are bounded to official earnings material and should not become a full battery or energy-transition thesis without more source review.
- SK Inc. claims are holding-company value-up claims; do not infer affiliate-level performance drivers from them.
- SK Telecom AI claims use official press-release text; low-text investor-briefing PDFs remain blocked unless OCR or a text-bearing source is supplied.
- SK Square claims are bounded to matched official IR URLs and should preserve NAV, preliminary-result, and portfolio-concentration labels.

## Source References

- `configs/sk-narrative-claim-seeds.json`
- `raw/manifests/sk.source-backed-claims.json`
- `raw/manifests/sk.extraction-report.json`
- `raw/manifests/sk.narrative-claim-queue.json`
- `raw/manifests/sk.identifier-verification.json`
- `configs/source-selection-policy.json`
