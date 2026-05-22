# Hyundai Motor Second-Wave Intake Preparation

Date: 2026-05-04

## Purpose

This document prepares the Hyundai Motor Group second-wave source intake while
preserving the current paper/runtime boundary. The current runtime reference
slice remains Hyundai Motor, Kia, and Hyundai Mobis. The additional companies
below are identifier-verified intake candidates, not runtime-promoted coverage.

## Collection Scope

| Company ID | Korean name | KRX | DART corp code | Runtime status |
| --- | --- | --- | --- | --- |
| `hyundai-rotem` | 현대로템 | 064350 | 00302926 | intake candidate |
| `hyundai-autoever` | 현대오토에버 | 307950 | 00362441 | intake candidate |
| `hyundai-wia` | 현대위아 | 011210 | 00106623 | intake candidate |
| `hyundai-eandc` | 현대건설 | 000720 | 00164478 | intake candidate |
| `hyundai-glovis` | 현대글로비스 | 086280 | 00360595 | intake candidate |
| `innocean` | 이노션 | 214320 | 00565154 | intake candidate |
| `hyundai-motor-securities` | 현대차증권 | 001500 | 00137997 | intake candidate / financial-company account caution |
| `hyundai-bng-steel` | 현대비앤지스틸 | 004560 | 00125743 | intake candidate |

`hyundai-steel` remains a future optional identifier-verified candidate, but it
is not part of the current eight-company collection request.

## Intake Rule

Second-wave documents may enter the source inventory and narrative claim queue,
but they must not enter runtime answers until the following gates pass:

1. company-level `companyId`, KRX code, DART code, and aliases are fixed;
2. each source has a local file or DART receipt URL plus a public source URL;
3. each source has `selection_reason`, `request_package`, and `rights_level`;
4. PDF or document text is extractable, or an OCR/transcript substitute is
   recorded;
5. a reviewer writes atomic claim text with evidence locator and period label;
6. the claim is promoted into `hyundai-motor.source-backed-claims.json`;
7. at least one frozen scenario validates routing and answer hygiene.

## Finance-Company Boundary

Hyundai Motor Securities is a financial company. The project must preserve
explicit DART account labels and must not define revenue from finance-specific
accounts by policy. If OpenDART does not provide an accepted explicit revenue
account, the artifact should record the missing account state rather than
creating a custom definition.

## Folder and Ledger Readiness

The intake template now accepts the following folder aliases:

```text
optional_second_wave/hyundai_rotem
optional_second_wave/hyundai_autoever
optional_second_wave/hyundai_wia
optional_second_wave/hyundai_eandc
optional_second_wave/hyundai_glovis
optional_second_wave/innocean
optional_second_wave/hyundai_motor_securities
optional_second_wave/hyundai_bng_steel
```

Korean company-name folders are also accepted by the inventory parser when the
ledger uses the company name directly.

## What This Allows the Paper to Claim

This preparation supports the claim that the harness can absorb a more complex
multi-affiliate source topology without changing the prompt or UI first. It
does not support a claim that Hyundai Motor Group second-wave narrative coverage
is complete.

## Processing Result

After the completed `../hyundai_knowledge` package was supplied, the intake
pipeline produced the detailed result in
`docs/58_hyundai_second_wave_source_intake_result.md`. In short, the expanded
package now has 84 local PDF records, 82 extraction candidates after duplicate
filtering, 82/82 successful text extractions, 75 narrative claim-review
candidates, 7 low-text/OCR blockers, and 0 second-wave runtime-promoted claims.
