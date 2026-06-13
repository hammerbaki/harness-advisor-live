# Changelog

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
