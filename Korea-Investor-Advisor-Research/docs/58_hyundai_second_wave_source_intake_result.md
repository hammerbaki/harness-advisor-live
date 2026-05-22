# Hyundai Motor Second-Wave Source Intake Result

Date: 2026-05-04

## Purpose

This document records the result of the Hyundai Motor Group source intake after
the user supplied the completed `../hyundai_knowledge` package. It separates
three layers that must not be confused in the product or the paper:

1. local official files that have been inventoried;
2. extracted text and narrative claim-review candidates;
3. runtime-promoted source-backed claims.

Only the third layer may affect customer-facing answers. The second-wave
Hyundai companies are currently source-intake and claim-review candidates, not
runtime-promoted coverage.

## Intake Result

The current local package was processed by the same group-onboarding harness
used for Hanwha, Samsung, and SK.

| Artifact | Result |
| --- | --- |
| Local source inventory | 84 local PDF entries in `raw/manifests/hyundai-motor.local-sources.json` |
| Duplicate handling | 2 Hyundai E&C files marked `duplicate_reference_only` and excluded from extraction/promotion |
| Extraction candidates | 82 official PDF candidates |
| Text extraction | 82/82 extracted successfully to `raw/extracted/hyundai-motor/official/` |
| Extracted text volume | 4,077,923 characters |
| Narrative claim queue | 82 records in `raw/manifests/hyundai-motor.narrative-claim-queue.json` |
| Ready for human claim review | 75 records |
| Blocked before claim review | 7 records, all due to low-text/OCR-like PDFs |
| Unmatched source-ledger rows | 9 Kia SPA/download rows without matching local files |
| Runtime-promoted claims from this intake | 0 narrative claims |

## Company Coverage

| Company ID | Korean name | Source records | Runtime status |
| --- | --- | ---: | --- |
| `hyundai-motor` | 현대자동차 | 11 | first-slice runtime financial seed only |
| `kia` | 기아 | 0 local PDFs in this intake | first-slice financial seed only; narrative files still missing |
| `hyundai-mobis` | 현대모비스 | 12 | first-slice runtime financial seed only |
| `hyundai-rotem` | 현대로템 | 12 | second-wave intake candidate |
| `hyundai-autoever` | 현대오토에버 | 10 | second-wave intake candidate |
| `hyundai-wia` | 현대위아 | 9 | second-wave intake candidate |
| `hyundai-eandc` | 현대건설 | 8 local files, 6 extraction candidates after duplicate filtering | second-wave intake candidate |
| `hyundai-glovis` | 현대글로비스 | 12 | second-wave intake candidate |
| `innocean` | 이노션 | 4 | second-wave intake candidate |
| `hyundai-motor-securities` | 현대차증권 | 0 local PDFs in this intake | identifier-verified, not source-ready |
| `hyundai-bng-steel` | 현대비앤지스틸 | 6 | second-wave intake candidate |

Hyundai Steel remains an identifier-verified future optional candidate, but it
is not part of the current runtime or second-wave source package.

## Document-Type Coverage

| Document type | Extraction candidates |
| --- | ---: |
| `business_report` | 14 |
| `earnings_presentation` | 49 |
| `investor_presentation` | 9 |
| `quarterly_report` | 2 |
| `semiannual_report` | 1 |
| `strategy_presentation` | 1 |
| `value_up_plan` | 6 |

This is suitable for claim-review queue construction. It is not sufficient by
itself for runtime investment-agent answers because atomic claims still need
evidence locators, period labels, company scope, and reviewer approval.

## Blocked Low-Text Sources

The following sources extracted successfully at the file level but produced
too little text for reliable claim promotion:

| Company | Source | Extracted chars | Required action |
| --- | --- | ---: | --- |
| 현대모비스 | 2024년 연간 경영실적 | 69 | OCR or text-bearing substitute |
| 현대모비스 | 2025 CEO Investor Day | 420 | OCR or text-bearing substitute |
| 현대모비스 | 2025 현대모비스 기업가치 제고계획 이행현황 | 11 | OCR or text-bearing substitute |
| 현대자동차 | 2025 CEO Investor Day 발표자료 (영문) | 0 | OCR or text-bearing substitute |
| 현대자동차 | 2025 CEO Investor Day 발표자료 (한국어) | 0 | OCR or text-bearing substitute |
| 현대로템 | 2026년 1분기 실적발표 | 0 | OCR or text-bearing substitute |
| 현대로템 | 현대로템 중장기 배당정책 ('25~'27) | 272 | OCR or text-bearing substitute |

These files remain useful as source-manifest records, but they must not be used
for runtime claims until text quality is fixed.

## Identifier and Finance Rules

The authoritative identifier source is
`raw/manifests/hyundai-motor.identifier-verification.json`, not ad hoc notes in
the incoming collection folder. This matters because manual collection notes may
contain stale or incorrect DART codes. Runtime and claim-promotion code must
use the verified manifest only.

Hyundai Motor Securities remains under the financial-company account rule. The
project must preserve explicit OpenDART account labels and must not define a
custom revenue measure for financial companies. If an accepted explicit account
is absent, the artifact should record that absence.

## Runtime Boundary

The current Hyundai runtime remains deliberately narrow:

- first-slice companies: Hyundai Motor, Kia, Hyundai Mobis;
- runtime source-backed claims: 6 OpenDART financial seed claims;
- generated wiki pages: group overview plus first-slice company pages;
- frozen evaluation: 3/3 Hyundai reference-slice scenarios passed at 99/100.

The expanded Hyundai package demonstrates that the harness can ingest a larger
multi-affiliate source topology without expanding the system prompt. It does
not yet demonstrate full Hyundai Motor Group narrative coverage.

## Next Actions

1. Keep the second-wave Hyundai records as intake and human-review queue
   evidence until runtime promotion is explicitly chosen.
2. Obtain Kia downloadable PDFs or exact document URLs for the 9 unmatched SPA
   rows if Kia narrative coverage is needed.
3. Replace or OCR the 7 low-text sources only if their topics are needed for
   runtime claims.
4. Select a small number of high-priority Hyundai narrative claims for manual
   evidence-locator review before promoting anything into runtime.
5. Proceed to LG using the same Stage 0 to Stage 6 onboarding sequence rather
   than changing the prompt or UI first.

