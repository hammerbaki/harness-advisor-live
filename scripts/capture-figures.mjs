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

  // Capture a region = the .device-shell bounding box expanded by PAD on every
  // side, so the box-shadow frame and the side buttons (which sit at left/right
  // -6px, outside the shell box) are fully included rather than clipped. The
  // paper-capture background is white, so the margin around the phone is clean.
  // scrollTopSelector (optional): pin the scroll container to the top first so
  // the answer figure is deterministic (starts at the first section).
  const PAD = 36;
  async function shotStage(file, { scrollTopSelector } = {}) {
    await page.waitForSelector(".device-shell", { timeout: 30000 });
    await page.waitForTimeout(900); // settle fonts/logos/answer render
    if (scrollTopSelector) {
      await page.evaluate((sel) => {
        const node = document.querySelector(sel);
        if (node) node.scrollTop = 0;
      }, scrollTopSelector);
      await page.waitForTimeout(250);
    }
    const box = await page.evaluate(() => {
      const r = document.querySelector(".device-shell").getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    });
    const clip = {
      x: Math.max(0, box.x - PAD),
      y: Math.max(0, box.y - PAD),
      width: box.width + PAD * 2,
      height: box.height + PAD * 2
    };
    await page.screenshot({ path: `${OUT_DIR}/${file}`, clip });
    console.log(`[figure] ${file}`);
  }

  // Figure 1 (primary) — Korean briefing feed. Both README figures use Korean
  // chrome so the chrome and the Korean-only answer body stay consistent; the
  // paper carries an English caption/gloss.
  await page.goto(`${base}/?capture=paper`, { waitUntil: "networkidle" });
  await shotStage("ui_mobile_main_ko.png");

  // Group selector (open state) — shows the five-group selection affordance;
  // pairs with the main figure as a side-by-side subpanel in the paper.
  await page.goto(`${base}/?capture=paper`, { waitUntil: "networkidle" });
  await page.waitForSelector(".device-shell", { timeout: 30000 });
  await page.click(".brand-block");
  await page.waitForSelector(".entity-menu", { timeout: 30000 });
  await shotStage("ui_mobile_selector_ko.png");

  // Supplementary — English chrome briefing (shows the en locale works). Not the
  // primary README figure; kept for the appendix if wanted.
  await page.goto(`${base}/?paper=en&capture=paper`, { waitUntil: "networkidle" });
  await shotStage("ui_mobile_main_en.png");

  // Figure 2 — a source-linked answer, Korean chrome + Korean body (consistent).
  // Pin the conversation to the top so the figure starts at "핵심 인사이트".
  await page.goto(`${base}/?capture=paper`, { waitUntil: "networkidle" });
  await page.waitForSelector(".device-shell", { timeout: 30000 });
  await page.locator(".quick-buttons button").nth(2).click(); // target / 종목
  await page.waitForSelector(".message.assistant", { timeout: 30000 });
  await shotStage("ui_mobile_answer_ko.png", { scrollTopSelector: ".conversation" });

  await browser.close();
} catch (error) {
  exitCode = 1;
  console.error(`[figure] failed: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (server) server.kill();
}

process.exit(exitCode);
