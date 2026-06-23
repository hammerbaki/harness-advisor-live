# Changelog

## public-baseline-v0.4.1 - 2026-06-23

Finalization hygiene addressing post-v0.4 review. No measured numbers changed.

- `server/index.mjs` now honors a `HOST` env var (default `0.0.0.0`); set
  `HOST=127.0.0.1` to run in sandboxed evaluation environments that disallow
  binding `0.0.0.0` (EPERM). `tests/harness.test.mjs` spawns the server with
  `HOST=127.0.0.1` so the suite runs in those environments.
- README: corrected the `tests/` description (now a real `node --test` suite),
  updated the "Static demo and CI" paragraph and bundled-validations list to
  include `npm test` and `validate:paper-stats` (matching the actual CI).
- Dependencies: applied non-breaking `npm audit fix` (resolved the high-severity
  vite advisory and `@babel/core`; vite 7.3.3 → 7.3.5). One low-severity
  esbuild advisory remains — it affects only the Windows dev server, not the
  pure-node runtime or the static demo output, and its only fix is a breaking
  major bump, so it is intentionally deferred.

## public-baseline-v0.4 - 2026-06-23

Reproducibility, verification, and licensing hardening for arXiv (cs.AI) release.
No measured numbers changed; result promotion is metadata-only.

- Added `scripts/compute-paper-stats.mjs`: regenerates manuscript Tables A2-A4
  (Wilson intervals, Pearson χ², inter-repeat consistency, per-check failure
  decomposition) and the prompt-only ablation McNemar test deterministically
  from the committed result artifacts. New scripts `stats:paper` and
  `validate:paper-stats` (CI gate against drift); output committed at
  `evals/results/paper-stats.generated.json`. The published table numbers are now
  reproduced exactly from the artifacts rather than hand-transcribed.
- Added a deterministic harness test suite (`tests/harness.test.mjs`, `npm test`
  via `node --test`): pins entity/alias routing, ticker/corp-code mapping, the
  answer contract, the three validation families (leakage / link / language), and
  the deterministic composer. Wired into CI alongside `validate:paper-stats`.
- Added split licensing: `LICENSE` (MIT, code), `LICENSE-DATA` (CC BY 4.0, data /
  docs / evaluation artifacts), and `LICENSES.md` (breakdown + trademark and
  non-redistribution notes). `CITATION.cff` now lists both licenses.
- Promoted the manuscript result artifacts from `needs_review` to
  `accepted_for_manuscript` with a `manuscriptAcceptance` block; added
  `evals/reviewer-checklist.md` and hash-pinned `evals/manuscript-acceptance.json`.
- Added `REPRODUCIBILITY.md`: number→command→artifact map, offline vs.
  credential-required vs. non-reproducible-snapshot vs. non-redistributed paths.
- Documentation consistency: fixed the `docs/ablation-design.md` status
  contradiction (design→implemented), and unified the manuscript venue to
  arXiv (cs.AI) in `docs/paper-evaluation-tables.md` and `docs/figure-capture.md`
  (was "Applied Sciences"). Corrected the README BibTeX (authors, DOI, version).

## public-baseline-v0.3 - 2026-06-14

- Added a prompt-only ablation at the composition boundary (`ADVISOR_ABLATION` / per-request `ablation`; evaluator axis `ADVISOR_LIVE_LLM_ABLATIONS`). Result artifacts: `evals/results/ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json` (540 runs over the 30 fixed scenarios) and `evals/results/ablation-adversarial.c0-vs-c3.2026-06-13.json` (180 runs over new adversarial-stress scenarios). Finding: under adversarial prompting the code-owned gate blocks 100% of recommendation-language and internal-leakage violations that the prompt-only condition admits (McNemar p<0.001).
- Added adversarial-stress scenario sets (`evals/scenarios/*.adversarial-stress.json`) and `ADVISOR_LIVE_LLM_SCENARIO_SETS` to target alternate scenario sets.
- Added a runtime claim-eligibility mechanism (`isRuntimeExcludedClaim` / `runtimeUsePolicy: excluded_*`) for genuinely non-eligible claims; no claim is excluded in this baseline.
- Briefing cards now render in English under the `en` locale (financial figures re-rendered in KRW-trillion, honest English news placeholder) for international figure capture.
- Added a Cloudflare Pages auto-deploy workflow (`.github/workflows/deploy-cloudflare.yml`; activates on `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets).
- Added `CLAUDE.md`; documented the two-repository (code + manuscript) operating model.

## public-baseline-v0.2 - 2026-06-13

- This repository is now the single source of truth for development; the mirrored local development folder is retired (`docs/repository-workflow.md`).
- Added GitHub Actions CI: typecheck, release validation, and a credential-free static demo build on every push and pull request.
- Added the static demo pipeline: `scripts/export-static-demo.mts` snapshots deterministic briefing and quick-question answers, and `npm run build:demo` produces a hosting-ready bundle with `VITE_STATIC_DEMO=1`.
- Added Cloudflare Pages deployment guide (`docs/deployment-cloudflare.md`); free-text questions are disabled in the static demo and show a local-run notice.
- Pinned Node `>=22` via `engines`.

## live-llm-full-run - 2026-06-03

- Added the 270-run live-LLM composition-boundary result artifact at `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json`.
- Added `docs/live-llm-run-log-2026-06-03.md` to record the API-run configuration, provider breakdown, failure-process summary, and interpretation boundary.

## live-llm-expanded-protocol - 2026-06-03

- Added live-LLM composition-boundary evaluation support for full-scenario runs, repeated runs, temperature settings, and fallback/recovery reporting.
- Documented the 30-scenario x 3-model x 3-repeat arXiv protocol and the smaller temperature-stress protocol.

## public-baseline-v0.1 - 2026-05-23

- README rewritten as a product-centric document; academic framing moved into a single "Design background" section.
- Added a mobile briefing screenshot for the product-facing repository overview.
- Snapshot used as the baseline reported in the accompanying paper *Beyond Prompting: Harness Engineering for Enterprise LLM Agents.*

## public-baseline-v0.1

- Prepared the public baseline repository for the reference implementation.
- Moved the implementation contents to the repository root.
- Included source and claim manifests, scenario and validation artifacts, scripts, UI source, server code, and maintained context pages.
- Excluded internal drafts, review notes, local credentials, raw private staging folders, generated build outputs, and local-only traces.

## Future Updates

- Use a new commit for every paper or artifact revision that should remain citable.
- Update `VERSION` when a revision should be treated as a new public snapshot.
- Add a dated changelog entry when reported results, scenarios, manifests, figures, or paper text materially change.
