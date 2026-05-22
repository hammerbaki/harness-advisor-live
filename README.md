# Enterprise LLM Agent Harness

This repository is the public reference implementation for a traceable enterprise LLM-agent harness developed from Korean investor briefing use cases.

The project asks a practical productization question: how can a fast LLM prototype become an enterprise-grade system whose answers can be audited, replayed, and extended? Instead of relying on a larger prompt alone, the implementation moves source boundaries, claim governance, answer contracts, runtime traces, and validation checks into explicit artifacts.

The result is a reusable harness pattern for turning public corporate data into reader-facing briefings with inspectable evidence. It is intended as a research artifact and reference implementation, not as investment advice or a commercial deployment package.

## What This Artifact Demonstrates

- A public-data reference slice covering Samsung, SK, Hyundai Motor, LG, and Hanwha, with 25 selected listed companies and 113 source-backed runtime claims.
- Fixed validation scenarios that check source-claim references, trace preservation, answer-structure requirements, and output hygiene.
- Fault-injection and latency artifacts that show whether the validators detect induced contract violations and whether orchestration changes preserve the same answer contract.
- A mobile briefing interface that exposes source links and follow-up questions to readers while keeping internal trace details out of the customer-facing answer.

## Agent Harness Structure

```text
configs/          Control map for groups, companies, identifiers, source policy, and onboarding
raw/manifests/    Source authority layer: manifests, evidence records, source-backed claims
wiki/             Maintained context layer used by the composer, not the source of truth
prompts/          Short policy prompts at the replaceable LLM composition boundary
server/           Runtime assembly layer for source collection, traces, links, and answers
src/              Reader-facing mobile product surface for briefings, links, and follow-ups
evals/            Contract validation layer: scenarios, results, fault injection, latency dashboards
scripts/          Harness operations for ingestion, claim promotion, validation, and release checks
tests/            Notes and entry points for deterministic behavior checks
public/           Static assets used by the reader-facing interface
```

## What Is Included

- Reference implementation for the mobile briefing UI and local server interface.
- Configuration for Samsung, SK, Hyundai Motor, LG, and Hanwha, including selected listed companies.
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

## Citable Artifact

The current public artifact label is `public-baseline-v0.1`. The paper cites the repository URL with an access date; exact reruns can additionally record the Git commit or release tag used for a specific validation snapshot.

## Versioning

Use `VERSION` for the current public artifact label, `CHANGELOG.md` for release notes, and Git tags for stable snapshots such as `public-baseline-v0.1` or `public-baseline-v0.2`.

When a revision changes reported numbers, scenarios, manifests, figures, or validation artifacts, rerun the relevant checks and record the change in `CHANGELOG.md` before tagging.
