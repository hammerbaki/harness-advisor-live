/**
 * Export a static demo snapshot for credential-free hosting (e.g. Cloudflare Pages).
 *
 * Starts the local advisor server in deterministic/fixture mode, captures:
 *   - /api/briefing for every group and locale -> public/demo/briefing.<groupId>.<locale>.json
 *   - /api/advisor for every quick-action question and presentation mode
 *     -> public/demo/advisor.<groupId>.json (keyed by `<mode>::<question>`)
 *
 * The static build (`npm run build:demo`, VITE_STATIC_DEMO=1) serves these
 * snapshots instead of calling the runtime API. Free-text questions are not
 * answered in the static demo; the UI shows a notice instead.
 *
 * Run with: npm run demo:snapshot  (requires devDependency `tsx`)
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { groupsConfig } from "../src/researchData";
import { buildQuickQuestion, QUICK_ACTIONS } from "../src/questionTemplates";

const PORT = Number(process.env.DEMO_SNAPSHOT_PORT ?? 8791);
const BASE = `http://127.0.0.1:${PORT}`;
const OUT_DIR = new URL("../public/demo/", import.meta.url);
const LOCALES = ["ko", "en"] as const;
const MODES = ["briefing", "text"] as const;

async function waitForServer(timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/api/briefing?groupId=${groupsConfig.groups[0].id}&locale=ko`);
      if (res.ok) return;
    } catch {
      /* not ready yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`advisor server did not become ready on port ${PORT}`);
}

async function main() {
  const server = spawn("node", ["server/index.mjs"], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "inherit", "inherit"]
  });
  try {
    await waitForServer();
    await mkdir(OUT_DIR, { recursive: true });

    for (const group of groupsConfig.groups) {
      for (const locale of LOCALES) {
        const res = await fetch(
          `${BASE}/api/briefing?groupId=${encodeURIComponent(group.id)}&locale=${locale}`
        );
        if (!res.ok) throw new Error(`briefing ${group.id}/${locale}: HTTP ${res.status}`);
        await writeFile(
          new URL(`briefing.${group.id}.${locale}.json`, OUT_DIR),
          JSON.stringify(await res.json(), null, 2)
        );
        console.log(`[demo] briefing.${group.id}.${locale}.json`);
      }

      const answers: Record<string, unknown> = {};
      for (const topic of QUICK_ACTIONS) {
        const question = buildQuickQuestion(group, topic.id);
        for (const mode of MODES) {
          const res = await fetch(`${BASE}/api/advisor`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ groupId: group.id, question, presentationMode: mode })
          });
          if (!res.ok) throw new Error(`advisor ${group.id}/${topic.id}/${mode}: HTTP ${res.status}`);
          answers[`${mode}::${question}`] = await res.json();
        }
      }
      await writeFile(
        new URL(`advisor.${group.id}.json`, OUT_DIR),
        JSON.stringify(answers, null, 2)
      );
      console.log(`[demo] advisor.${group.id}.json (${Object.keys(answers).length} answers)`);
    }
    console.log("[demo] static demo snapshot complete: public/demo/");
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
