# First-Slice Readiness Audit

Generated: 2026-05-09T05:23:54.177Z

## Purpose

This audit checks whether the selected 25-company first slice is ready for the same source-to-claim harness. It separates selection fitness from current runtime readiness: a company can be correctly selected while still needing source reconciliation or claim promotion.

## Summary

- Groups checked: 5
- First-slice companies checked: 25
- Companies with local sources: 25
- Companies with source-backed claims: 25
- Companies with wiki pages: 25
- Open readiness gaps: 0

## Readiness Counts

| Readiness | Companies |
| --- | --- |
| `runtime-seed-ready` | 25 |

## Group Summary

| Group | Companies | Readiness | Open gaps |
| --- | --- | --- | --- |
| `samsung` | 5 | `runtime-seed-ready`: 5 | 0 |
| `sk` | 5 | `runtime-seed-ready`: 5 | 0 |
| `hyundai-motor` | 5 | `runtime-seed-ready`: 5 | 0 |
| `lg` | 5 | `runtime-seed-ready`: 5 | 0 |
| `hanwha` | 5 | `runtime-seed-ready`: 5 | 0 |

## samsung

| Company | Sources | Provenance | Extracted | Claims | Wiki | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 삼성전자<br><code>samsung-electronics</code> | 6 | 6 | 6 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 삼성SDI<br><code>samsung-sdi</code> | 6 | 6 | 6 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 삼성물산<br><code>samsung-ct</code> | 13 | 13 | 13 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 삼성바이오로직스<br><code>samsung-biologics</code> | 15 | 15 | 15 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 삼성전기<br><code>samsung-electro-mechanics</code> | 60 | 60 | 18 | 2 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |

### Selection Rationale

- `samsung-electronics`: Core semiconductor and electronics anchor; primary market signal for Samsung exposure.
- `samsung-sdi`: Battery and energy-storage axis; comparable to LG Energy Solution and SK Innovation battery exposure.
- `samsung-ct`: Holding, construction, trading, and capital-allocation axis; useful for portfolio-level interpretation.
- `samsung-biologics`: Bio/CDMO growth axis; adds a non-electronics high-growth vertical.
- `samsung-electro-mechanics`: Component layer such as MLCC and camera modules; improves comparability with LG Innotek and Hyundai Mobis.

## sk

| Company | Sources | Provenance | Extracted | Claims | Wiki | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SK하이닉스<br><code>sk-hynix</code> | 11 | 11 | 11 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| SK이노베이션<br><code>sk-innovation</code> | 4 | 4 | 4 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| SK<br><code>sk-inc</code> | 17 | 17 | 12 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| SK텔레콤<br><code>sk-telecom</code> | 25 | 25 | 25 | 5 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| SK스퀘어<br><code>sk-square</code> | 75 | 75 | 75 | 7 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |

### Selection Rationale

- `sk-hynix`: Semiconductor and HBM anchor; core market narrative for SK.
- `sk-innovation`: Energy, battery, and transition exposure; captures restructuring and energy-cycle issues.
- `sk-inc`: Holding-company and portfolio capital-allocation axis.
- `sk-telecom`: Telecom, AI, data-center, and stable cash-flow axis.
- `sk-square`: ICT investment and platform portfolio axis; connects portfolio structure with SK Hynix exposure.

## hyundai-motor

| Company | Sources | Provenance | Extracted | Claims | Wiki | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 현대차<br><code>hyundai-motor</code> | 11 | 11 | 11 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 기아<br><code>kia</code> | 17 | 17 | 16 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 현대모비스<br><code>hyundai-mobis</code> | 12 | 12 | 12 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 현대글로비스<br><code>hyundai-glovis</code> | 33 | 33 | 30 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 현대로템<br><code>hyundai-rotem</code> | 28 | 26 | 26 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |

### Selection Rationale

- `hyundai-motor`: Primary OEM anchor and main market signal.
- `kia`: Second OEM, product-mix, profitability, and global sales comparison axis.
- `hyundai-mobis`: Core parts, electrification, software, and module supply-chain axis.
- `hyundai-glovis`: Logistics, finished-vehicle shipping, and value-chain resilience axis.
- `hyundai-rotem`: Defense, rail, and export-growth axis; broadens beyond passenger vehicles.

## lg

| Company | Sources | Provenance | Extracted | Claims | Wiki | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LG전자<br><code>lg-electronics</code> | 18 | 18 | 18 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| LG화학<br><code>lg-chem</code> | 18 | 18 | 17 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| LG에너지솔루션<br><code>lg-energy-solution</code> | 13 | 13 | 13 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| LG이노텍<br><code>lg-innotek</code> | 15 | 15 | 10 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| LG유플러스<br><code>lg-uplus</code> | 4 | 4 | 4 | 3 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |

### Selection Rationale

- `lg-electronics`: Electronics, appliances, and vehicle-components anchor.
- `lg-chem`: Chemicals and advanced-materials axis.
- `lg-energy-solution`: Battery and energy-storage axis.
- `lg-innotek`: Components, camera modules, and vehicle electronics; comparable to Samsung Electro-Mechanics.
- `lg-uplus`: Telecom, data, and stable cash-flow axis.

## hanwha

| Company | Sources | Provenance | Extracted | Claims | Wiki | Readiness | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ㈜한화<br><code>hanwha</code> | 46 | 46 | 37 | 12 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 한화에어로스페이스<br><code>hanwha-aerospace</code> | 20 | 20 | 20 | 2 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 한화솔루션<br><code>hanwha-solutions</code> | 10 | 10 | 10 | 2 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 한화시스템<br><code>hanwha-systems</code> | 18 | 18 | 18 | 2 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |
| 한화오션<br><code>hanwha-ocean</code> | 10 | 10 | 10 | 2 | yes | `runtime-seed-ready` | maintain as first-slice runtime seed |

### Selection Rationale

- `hanwha`: Reference issuer and original PoC anchor; connects DART/KRX with group-level briefing.
- `hanwha-aerospace`: Defense and aerospace anchor; central to recent Hanwha investment narrative.
- `hanwha-solutions`: Energy, solar, and chemicals axis.
- `hanwha-systems`: Defense IT, radar, satellite, and systems-integration axis.
- `hanwha-ocean`: Shipbuilding, naval, and defense-vessel axis.

## Interpretation

The 25-company selection remains valid if it satisfies the first-slice criteria, even when some companies still need source packages or claim promotion. The product should not expose affiliate-level selection as complete until each first-slice company has at least one promoted source-backed claim and a company wiki page.

## Related Artifacts

- `configs/first-slice-selection-policy.json`
- `docs/71_first_slice_selection_criteria.md`
- `docs/70_arxiv_25_company_baseline.md`
- `raw/manifests/first-slice-readiness-audit.json`

