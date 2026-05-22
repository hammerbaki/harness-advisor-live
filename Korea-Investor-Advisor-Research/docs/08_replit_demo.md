# Replit Demo Setup

## Purpose

This is the first deployable research demo. It is not the full advisor yet. It
is a clean, Replit-ready shell for validating the new product/research structure:

- group-scoped architecture,
- Samsung default investor-facing target,
- Hanwha reference slice,
- five-group expansion path,
- PoC migration classification,
- deterministic profile validation.

## How to Run on Replit

Upload the `Korea-Investor-Advisor-Research` folder to Replit and press Run.

The `.replit` file runs:

```bash
npm install && npm run dev
```

The app serves on port `5173`.

Deployment builds the static bundle and runs the same API/static server on the
same exposed port:

```bash
npm install && npm run build && PORT=5173 npm run preview
```

Before upload, run:

```bash
npm run check:replit
npm run validate:template
npm run build
```

`check:replit` verifies that the Replit run/deploy commands, local logo assets,
API proxy, selected-target order, and required scripts are present. This keeps
the local paper screenshot path and the Replit demo path aligned.

## How to Run Locally

```bash
cd Korea-Investor-Advisor-Research
npm install
npm run dev
```

## Backend Mode

The demo now includes a fixture-compatible local API server. It remains
reproducible without credentials and can switch to live DART/KRX/news/LLM paths
when Replit Secrets are supplied.

Backend path:

1. deterministic fixture/fallback execution by default;
2. DART/KRX/news adapters behind stable tool interfaces;
3. trace envelope returned for paper evaluation;
4. live calls gated behind environment variables.

## Replit Secrets for Future Stages

The current demo does not require secrets. Live tool stages may use:

```text
DART_API_KEY
KRX_API_KEY
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
ANTHROPIC_API_KEY
```

Do not commit real values. Use Replit Secrets.
