# Cloudflare Pages Deployment (Static Demo)

The public demo is a credential-free static build. All briefing and
quick-question answers are deterministic snapshots generated at build time by
running the local advisor server in fixture mode; no DART/KRX/NAVER/LLM
credentials are used or exposed. Free-text questions are intentionally
disabled in the static demo and show a notice pointing to local execution.

## One-time setup

1. Cloudflare Dashboard -> Workers & Pages -> Create -> Pages ->
   Connect to Git -> select `hammerbaki/enterprise-llm-agent-harness`.
2. Build configuration:
   - Framework preset: None
   - Build command: `npm run build:demo`
   - Build output directory: `dist`
   - Environment variables: none required (`VITE_STATIC_DEMO=1` is set by the
     build script itself).
3. Node version: Pages uses the `engines.node` field (`>=22`) or set
   `NODE_VERSION=22` as a build environment variable.

## What you get

- Production deployment on every push to `main`.
- Preview deployment with a unique URL for every pull request, which makes
  contract-relevant UI changes reviewable before merge.

## Scope and boundaries

- The static demo exercises the same promoted claim layer, source links, and
  trace rendering as local runs, in deterministic fixture mode
  (`runtimeMode: degraded`, `mode: fixture` in traces).
- Live DART/KRX/NAVER/LLM integration is out of scope for the hosted demo and
  remains a local, credentialed workflow (`npm run dev` + `npm run api`).

## Local reproduction

```bash
npm ci
npm run build:demo
npx vite preview
```
