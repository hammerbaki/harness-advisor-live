---
title: "Samsung Advisor Wiki Overview"
group_id: "samsung"
company_id: ""
source_status: "candidate-plan"
last_checked: "2026-05-02"
confidence: "candidate"
---

# Samsung Advisor Wiki Overview

Samsung is the neutral default target in the investor-facing demo.

## Current State

- The profile is marked `source-ready` in `configs/groups.json` for product-side testing.
- `configs/groups.json` now registers a broad Samsung listed-company coverage universe for routing and source requests.
- `raw/manifests/samsung.coverage-universe.seed.json` records the supplied 2022-2024 financial table as seed scope metadata.
- `raw/manifests/samsung.identifier-verification.json` records the supplied OpenDART/KRX identifier verification results for 15 listed companies.
- `raw/manifests/samsung.dart-financial-table.2022-2024.json` records the OpenDART annual financial baseline.
- `raw/manifests/samsung.source-backed-claims.json` promotes 19 DART-backed financial seed claims.
- `raw/manifests/samsung.document-url-intake.json` records document-level public URLs for Samsung narrative source review.
- `raw/manifests/samsung.dart-filing-extraction-report.json` records completed DART filing text extraction for Samsung Life and Samsung Fire.
- Six narrative themes are ready for human claim review, but they are not runtime-promoted until atomic claim text and evidence locators are recorded.

## Source References

- `configs/groups.json`
- `raw/manifests/samsung.json`
- `raw/manifests/samsung.coverage-universe.seed.json`
- `raw/manifests/samsung.identifier-verification.json`
- `raw/manifests/samsung.dart-financial-table.2022-2024.json`
- `raw/manifests/samsung.source-backed-claims.json`
- `raw/manifests/samsung.document-url-intake.json`
- `raw/manifests/samsung.narrative-claim-queue.json`

## Open Questions

- Promote a small Samsung narrative claim set from reviewed IR/DART sources.
- Decide which Samsung source snapshots can be redistributed in the paper artifact.
- Add live news credentials when product testing requires current news beyond fixtures.
