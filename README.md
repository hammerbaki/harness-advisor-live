# Enterprise LLM Agent Harness

This repository contains a public-data reference implementation of a traceable enterprise LLM-agent harness for Korean investor briefing use cases.

The implementation is organized around source manifests, evidence records, source-backed claims, bounded answer contracts, runtime traces, and validation checks. It is intended as a research artifact and reference implementation, not as investment advice or a commercial deployment package.

## Repository Layout

```text
configs/          Group, company, source, and onboarding configuration
evals/            Fixed scenarios, validation results, latency dashboards, and rubrics
prompts/          Short policy prompts used at the composition boundary
public/           Static UI assets used by the reference interface
raw/manifests/    Public-source manifests, extracted metadata, and claim artifacts
scripts/          Source processing, validation, evaluation, and audit scripts
server/           Local server and fixture-compatible API interface
src/              React/Vite mobile briefing interface and harness logic
tests/            Test entry points and notes
wiki/             Maintained group and company context pages
```

## What Is Included

- Reference implementation for the mobile briefing UI and local server interface.
- Configuration for five Korean corporate groups and selected listed companies.
- Source and claim manifests used by the public-data reference slice.
- Scenario files, validation results, fault-injection results, and latency dashboard artifacts.
- Scripts for structure validation, scenario evaluation, source processing, and release checks.

## What Is Excluded

- Local `.env` files and API credentials.
- `node_modules/`, Vite `dist/`, and TypeScript build artifacts.
- Heavy raw-source archives and local extracted-document staging folders.
- Local-only traces that may contain machine-specific diagnostics.
- Internal drafts and review notes.

## Quick Start

```bash
npm install
npm run validate:release
npm run build
```

For local development:

```bash
npm run dev
```

Live DART, KRX, NAVER, and LLM-provider integrations require local credentials. Copy `.env.example` to `.env` and fill in local values. Do not commit `.env`.

## Validation Artifacts

The main reproducibility artifacts are:

```text
evals/scenarios/
evals/results/
evals/dashboard/
raw/manifests/review-approved-runtime-promotion.json
```

The public baseline uses deterministic and fixture-compatible paths so that validation can be inspected without private credentials.

## Versioning

Use `VERSION` for the current public artifact label, `CHANGELOG.md` for release notes, and Git tags for stable snapshots such as `public-baseline-v0.1` or `public-baseline-v0.2`.

When a revision changes reported numbers, scenarios, manifests, figures, or validation artifacts, rerun the relevant checks and record the change in `CHANGELOG.md` before tagging.
