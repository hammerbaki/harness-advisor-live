// Paper / README figure capture of the mobile demo (deterministic fixture mode).
//
// Two sources, selected by FIGURE_BASE_URL:
//   - default (no FIGURE_BASE_URL): build-local. Spawns server/index.mjs over the
//     committed dist/ bundle on 127.0.0.1 and captures from it. Requires
//     `npm run build:demo` first. Fully offline and reproducible.
//   - FIGURE_BASE_URL=https://…: remote. Captures from a deployed demo (e.g.
//     Cloudflare Pages) instead of a local build.
//
// Playwright resolves as a repo devDependency; PLAYWRIGHT_PATH still overrides
// (e.g. point at an `npx playwright` copy) for environments without it installed.
//
// Usage:
//   npm run build:demo && node scripts/capture-figures.mjs        # local
//   FIGURE_BASE_URL=https://…pages.dev node scripts/capture-figures.mjs
//   CAPTURE_OUT=/tmp/figs node scripts/capture-figures.mjs
import { spawn } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const distDir = join(repoRoot, "dist");
const OUT_DIR = process.env.CAPTURE_OUT || join(repoRoot, "docs");
const port = Number(process.env.CAPTURE_PORT ?? 8931);
const remoteBase = process.env.FIGURE_BASE_URL;
const base = remoteBase || `http://127.0.0.1:${port}`;

let chromium;
try {
  const pw = process.env.PLAYWRIGHT_PATH
    ? await import(process.env.PLAYWRIGHT_PATH)
    : await import("playwright");
  chromium = pw.chromium || pw.default?.chromium;
} catch {
  console.error("[figure] playwright not found. Run `npm i -D playwright && npx playwright install chromium`, or set PLAYWRIGHT_PATH.");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

// Spawn a local static server over dist/ unless capturing from a remote URL.
let server = null;
if (!remoteBase) {
  if (!existsSync(distDir)) {
    console.error("[figure] dist/ not found. Run `npm run build:demo` first.");
    process.exit(1);
  }
  server = spawn("node", [join(repoRoot, "server", "index.mjs")], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", ADVISOR_PREWARM: "0", STATIC_DIR: distDir },
    stdio: ["ignore", "ignore", "inherit"]
  });
  const deadline = Date.now() + 15000;
  for (;;) {
    try {
      const res = await fetch(`${base}/api/healthz`);
      if (res.ok) break;
    } catch {
      // not up yet
    }
    if (Date.now() > deadline) {
      server.kill();
      console.error("[figure] local server did not become healthy");
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 200));
  }
}

let exitCode = 0;
try {
  const browser = await chromium.launch();
  // Viewport must be wider than the 720px mobile breakpoint, otherwise the
  // realistic device frame is stripped (full-bleed). 900px keeps the frame.
  const ctx = await browser.newContext({
    locale: "en-US",
    extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    viewport: { width: 900, height: 1100 },
    deviceScaleFactor: 2
  });
  const page = await ctx.newPage();

  // Clip to .device-shell so the figure is the realistic phone frame itself.
  async function shotStage(file) {
    const el = await page.waitForSelector(".device-shell", { timeout: 30000 });
    await page.waitForTimeout(900); // settle fonts/logos/answer render
    await el.screenshot({ path: `${OUT_DIR}/${file}` });
    console.log(`[figure] ${file}`);
  }

  // Figure 1 — selector / briefing feed (English chrome, capture layout).
  await page.goto(`${base}/?paper=en&capture=paper`, { waitUntil: "networkidle" });
  await shotStage("ui_mobile_main_en.png");

  // Figure 2 — a source-linked answer. English chrome; the answer body is
  // Korean-only (composer emits Korean section titles), so this stays *_ko.
  await page.goto(`${base}/?paper=en&capture=paper`, { waitUntil: "networkidle" });
  await page.waitForSelector(".device-shell", { timeout: 30000 });
  await page.getByRole("button", { name: "Group", exact: true }).click();
  await shotStage("ui_mobile_answer_ko.png");

  await browser.close();
} catch (error) {
  exitCode = 1;
  console.error(`[figure] failed: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (server) server.kill();
}

process.exit(exitCode);
