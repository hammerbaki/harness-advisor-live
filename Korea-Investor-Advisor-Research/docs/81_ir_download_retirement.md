# IR Download Staging Retirement

Generated: 2026-05-05T12:50:21.617Z

## Purpose

This document records the retirement of the external `ir_download` staging folder after its files were reconciled into the project Knowledge Base.

## Result

| Check | Value |
| --- | --- |
| Retired path | `ir_download` |
| Folder existed before retirement | true |
| Folder removed | true |
| Source files checked | 210 |
| Duplicate-hash records | 210 |
| Copied records | 0 |
| Unsafe records | 0 |

## Basis

All ir_download source files were previously copied or matched as SHA-256 duplicates in Knowledge Base. The staging folder no longer contains unique source evidence.

## Follow-Up Rule

Future incoming source packages should first be placed in a temporary staging folder, reconciled by SHA-256 into `Knowledge Base`, indexed through the source ledger, and then retired only after the import manifest shows no unsafe records.

## Machine-Readable Artifact

- `raw/manifests/ir-download-retirement.json`
