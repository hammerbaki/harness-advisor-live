# Licensing

This repository is a research artifact accompanying the manuscript *Beyond
Prompting: Harness Engineering for Enterprise LLM Agents*. Different parts of the
repository carry different licenses. When in doubt about a specific file, the
most specific rule below applies.

## 1. Software (code) — MIT

The source code is licensed under the **MIT License** (see [`LICENSE`](LICENSE)).
This covers:

- `src/` — reader-facing UI (React + TypeScript)
- `server/` — runtime assembly server (`.mjs`)
- `scripts/` — ingestion, promotion, validation, evaluation, and statistics scripts
- `tests/` — deterministic-behavior test suite
- build/config files needed to run the above (`tsconfig.json`, `vite.config.ts`,
  `package.json`, `wrangler.toml`, `index.html`)

## 2. Data, documentation, and evaluation artifacts — CC BY 4.0

The following are licensed under
**Creative Commons Attribution 4.0 International (CC BY 4.0)**
(see [`LICENSE-DATA`](LICENSE-DATA)):

- `docs/` — reproduction and design documentation (excluding screenshots; see §4)
- `evals/` — scenarios, rubrics, result artifacts, and generated statistics
- `raw/manifests/` — source manifests, evidence metadata, extraction reports, and
  **promoted** source-backed claims
- `wiki/` — compiled context pages
- `configs/` — group/company resolution configuration
- `prompts/` — policy prompt blocks
- `CHANGELOG.md`, `README.md`, `CLAUDE.md`, and other Markdown documentation

Attribution: cite the repository per [`CITATION.cff`](CITATION.cff).

## 3. Underlying public sources — NOT redistributed here

The promoted claims and manifests are derived from public primary sources (DART
filings, KRX/Yahoo market data, Naver News). The repository redistributes
**only** the promoted, source-pointer-bearing claim records and metadata — **not**
the original issuer documents (e.g. raw earnings-release PDFs), which remain the
property of their respective issuers and are subject to those issuers' terms.
Each claim carries an `officialSourceUrl` / `officialDownloadUrl` so the primary
source can be retrieved at its origin. See `REPRODUCIBILITY.md` for the boundary
between externally reproducible and copyright-restricted (non-redistributed)
material.

## 4. Trademarks, logos, and company names

Company and group names (Samsung, SK, Hyundai Motor, LG, Hanwha) and any logos,
brand marks, or product names are trademarks of their respective owners. They
appear here only to identify a public-data slice for research and are **not**
licensed by this repository; their inclusion does not imply endorsement. No logo
image assets are distributed under the CC BY 4.0 grant above. The UI screenshots
under `docs/*.png` depict this project's own interface and are covered by §2,
except for any third-party marks visible within them, which remain the property
of their owners.

## 5. Not investment advice

This is a research and engineering artifact. Nothing in it is investment advice,
and the named corporate groups are included only as a public-data slice.
