# Cloudflare Pages Deployment (Static Demo)

The public demo is a credential-free static build. All briefing and
quick-question answers are deterministic snapshots generated at build time by
running the local advisor server in fixture mode; no DART/KRX/NAVER/LLM
credentials are used or exposed. Free-text questions are intentionally
disabled in the static demo and show a notice pointing to local execution.

## Automated deploy (GitHub Actions) — recommended

`.github/workflows/deploy-cloudflare.yml` builds the static demo and deploys it to
Cloudflare Pages on every push to `main`. It activates once you add two repository
secrets (GitHub → Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` — a token with the **Cloudflare Pages: Edit** permission
  (Cloudflare dashboard → My Profile → API Tokens → Create Token).
- `CLOUDFLARE_ACCOUNT_ID` — your account id (Cloudflare dashboard → Workers & Pages,
  shown in the right sidebar / URL).

The first run creates the `enterprise-llm-agent-harness` Pages project and serves
it at `https://enterprise-llm-agent-harness.pages.dev`. You can also trigger it
manually (Actions → "Deploy demo to Cloudflare Pages" → Run workflow). Adding the
two secrets is the only step that requires your Cloudflare account; everything
else is in the repo.

## One-time setup (alternative: dashboard Git connection)

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
