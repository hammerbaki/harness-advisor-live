---
title: "SK Advisor Wiki Overview"
group_id: "sk"
company_id: ""
source_status: "source-backed"
last_checked: "2026-05-05"
confidence: "medium"
---

# SK Advisor Wiki Overview

SK is an expansion target used to test whether the Hanwha reference slice and Samsung transfer slice can generalize through the same harness boundary.

## Current State

- DART/KRX identifiers are verified for SK하이닉스, SK이노베이션, SK, SK텔레콤, SK스퀘어.
- OpenDART 2022-2024 annual financial table is recorded in `raw/manifests/sk.dart-financial-table.2022-2024.json`.
- Financial and narrative source-backed seed claims are recorded in `raw/manifests/sk.source-backed-claims.json`.
- Narrative source review is tracked in `raw/manifests/sk.narrative-claim-queue.json`.
- Low-text/image-like PDFs remain blocked unless OCR, transcript, or text-bearing substitutes are provided.

## Runtime Boundary

This namespace can support bounded investor briefing answers for the promoted claims only. It is not full SK coverage and must not infer unsupported HBM, battery, energy, telecom, holding-company, or NAV-discount conclusions outside the promoted source-backed claims.

## Source References

- `raw/manifests/sk.identifier-verification.json`
- `raw/manifests/sk.dart-financial-table.2022-2024.json`
- `raw/manifests/sk.local-sources.json`
- `raw/manifests/sk.extraction-report.json`
- `raw/manifests/sk.narrative-claim-queue.json`
- `raw/manifests/sk.source-backed-claims.json`
