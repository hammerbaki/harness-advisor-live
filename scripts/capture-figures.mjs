// One-off paper / README figure capture from the live Cloudflare Pages demo.
// Usage: node scripts/capture-figures.mjs
// Captures the deterministic fixture-mode static demo (English chrome, light
// paper-capture layout) and writes PNGs to docs/. Not part of CI. Playwright is
// not a repo dependency; point PLAYWRIGHT_PATH at an installed copy (e.g. one
// fetched by `npx playwright`), or run from an env where `playwright` resolves.
const playwrightPath = process.env.PLAYWRIGHT_PATH
  || `${process.env.HOME}/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js`;
const pw = await import(playwrightPath);
const chromium = pw.chromium || pw.default.chromium;
import { mkdirSync } from "node:fs";

const BASE = process.env.FIGURE_BASE_URL
  || "https://enterprise-llm-agent-harness-demo.pages.dev";
const OUT_DIR = "docs";
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  locale: "en-US",
  extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
  viewport: { width: 720, height: 1280 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();

// Capture the .device-stage so the light paper-capture background (#f3f7ff)
// and the device-shell shadow frame are both included — a clean, light figure.
async function shotStage(file) {
  await page.waitForSelector(".device-shell", { timeout: 30000 });
  await page.waitForTimeout(900); // settle fonts/logos/answer render
  const el = await page.$(".device-stage");
  await el.screenshot({ path: `${OUT_DIR}/${file}` });
  console.log(`[figure] ${file}`);
}

// Figure 1 — selector / briefing (English chrome, capture layout).
await page.goto(`${BASE}/?paper=en&capture=paper`, { waitUntil: "networkidle" });
await shotStage("ui_mobile_main_en.png");

// Figure 2 — a source-linked answer. English chrome; the answer body is
// Korean-only (composer emits Korean section titles), so this stays *_ko.
await page.goto(`${BASE}/?paper=en&capture=paper`, { waitUntil: "networkidle" });
await page.waitForSelector(".device-shell", { timeout: 30000 });
await page.getByRole("button", { name: "Group", exact: true }).click();
await shotStage("ui_mobile_answer_ko.png");

await browser.close();
