# Cloudflare Pages deployment (static demo / figure-capture target)

The investor-briefing demo can be served as a fully static site on Cloudflare
Pages. This is the recommended host for capturing paper figures (stable URL,
free, global CDN) — distinct from the Replit-hosted interactive version, which
keeps the live Node backend (`server/index.mjs`) for filing/market/news APIs.

## Why this works without a backend

`npm run build:demo` runs two steps:

1. `demo:snapshot` (`scripts/export-static-demo.mts`) writes ko **and** en
   briefing + advisor snapshots into `public/demo/`.
2. `VITE_STATIC_DEMO=1 vite build` emits a static SPA into `dist/`
   (`index.html` + `assets/` + `demo/` + `logos/`).

The SPA reads its data from `dist/demo/*.json` at runtime, so no server is
needed. `vite.config.ts` sets no custom `base`, so it serves correctly from a
Cloudflare Pages root domain.

## Deploy

```bash
# one-time auth (pick one)
npx wrangler@4 login                       # interactive browser OAuth
export CLOUDFLARE_API_TOKEN=<token>        # token with "Cloudflare Pages: Edit"

# build + upload dist/ (creates the Pages project on first run)
npm run deploy:pages
```

Configuration lives in `wrangler.toml` (`pages_build_output_dir = "dist"`,
project `enterprise-llm-agent-harness-demo`).

### Alternative: Git integration (no local wrangler)

In the Cloudflare dashboard → Pages → Connect to Git, point at this repo and set:

- Build command: `npm run build:demo`
- Build output directory: `dist`

## Capture URLs

The UI locale and capture mode are selected by query params (client-side):

| Purpose | URL |
| --- | --- |
| Korean UI (default) | `https://<project>.pages.dev/` |
| English UI | `https://<project>.pages.dev/?paper=en` (or `?lang=en`) |
| English + paper-capture mode | `https://<project>.pages.dev/?paper=en&capture=paper` |

Use the English + capture URL to recapture Figure 1 for the English manuscript.
