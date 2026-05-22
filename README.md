# Enterprise LLM Agent Harness

This repository packages the research implementation and arXiv paper source for a traceable enterprise LLM-agent harness. The reference implementation reconstructs a demonstration-oriented investor briefing agent into a reproducible system built around source manifests, source-backed claims, bounded answer contracts, runtime traces, and validation checks.

The repository name is intended to be:

```text
enterprise-llm-agent-harness
```

## Contents

```text
Korea-Investor-Advisor-Research/   React/Vite app, harness code, configs, manifests, wiki layer, and evaluation scripts
arxiv-paper/                       LaTeX paper source, BibTeX references, final figures, and compiled draft PDF
RELEASE_CHECKLIST.md               Pre-publication checklist for GitHub and arXiv
```

## What Is Included

- Source code for the mobile briefing UI and local server interface.
- Group/company configuration for the five-corporate-group reference slice.
- Source manifests, claim manifests, wiki pages, scenario files, and validation scripts needed to reproduce the paper baseline.
- Paper source, final figure assets, and the current compiled `main.pdf`.

## What Is Excluded

- Local `.env` files and all API credentials.
- `node_modules/`, Vite `dist/`, and other generated build outputs.
- Heavy raw PDF/source archives from the local `Knowledge Base/` folder.
- Historical PoC snapshot folders such as `HanWha-Advisor-main/`.
- Local-only trace files that may contain machine-specific diagnostics.

## Quick Start

```bash
cd Korea-Investor-Advisor-Research
npm install
npm run validate:release
npm run build
```

Live DART, KRX, and NAVER integrations require local credentials. Copy `.env.example` to `.env` inside `Korea-Investor-Advisor-Research/` and fill in local values. Do not commit `.env`.

## Paper Build

```bash
cd arxiv-paper
latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex
```

Before arXiv submission, replace the repository placeholder in `arxiv-paper/bib/references.bib` with the final public GitHub URL and version commit hash.

## Status

This repository is prepared as the public baseline for the arXiv-stage paper. It is not a commercial deployment package and does not contain confidential client data.
