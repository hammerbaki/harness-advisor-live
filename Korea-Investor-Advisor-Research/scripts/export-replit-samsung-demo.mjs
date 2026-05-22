import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const stamp = new Date().toISOString().replace(/[-:]/gu, "").replace(/\..+$/u, "").replace("T", "-");
const exportDir = join(rootDir, "exports", `replit-samsung-demo-${stamp}`);

const samsungDocs = [
  "docs/11_traceable_demo_architecture.md",
  "docs/31_llm_programming_framework_selection.md",
  "docs/32_answer_generation_process_trace.md",
  "docs/33_live_llm_output_contract.md",
  "docs/36_samsung_coverage_universe_plan.md",
  "docs/37_samsung_source_adequacy_audit.md",
  "docs/39_samsung_dart_financial_table.md",
  "docs/40_samsung_financial_sector_dart_account_audit.md",
  "docs/41_samsung_source_backed_seed_claims.md",
  "docs/42_samsung_url_and_narrative_claim_readiness.md",
  "docs/43_hanwha_to_samsung_transfer_audit.md"
];

await mkdir(exportDir, { recursive: true });

await copyFiles([
  ".replit",
  "index.html",
  "package-lock.json",
  "tsconfig.json",
  "vite.config.ts"
]);

await copyDirs([
  "src",
  "server",
  "prompts",
  "raw/extracted/samsung",
  "wiki/groups/samsung"
]);

await copyFiles([
  "wiki/index.md",
  "wiki/log.md",
  "wiki/schema.md",
  "public/logos/README.md",
  "public/logos/samsung.svg",
  "evals/README.md",
  "evals/questions/samsung.investor-candidate-questions.json",
  "evals/scenarios/samsung.reference-slice.json",
  "evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/results/samsung-reference-slice-v0.1.latency-optimized.2026-05-03.json",
  "evals/dashboard/agent-dog.samsung-paper-seed.2026-05-03.json",
  ...samsungDocs
]);

await copySamsungManifests();
await copySamsungScripts();
await writeFilteredConfig();
await writePackageJson();
await writeProjectContext();
await writeEnvExample();
await writeReadme();
await writeTransferManifest();
await writeReplitPrompt();

console.log(`Samsung Replit package ready: ${relative(exportDir)}`);

async function copyFiles(paths) {
  for (const path of paths) {
    const source = join(rootDir, path);
    if (!existsSync(source)) continue;
    const target = join(exportDir, path);
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target);
  }
}

async function copyDirs(paths) {
  for (const path of paths) {
    const source = join(rootDir, path);
    if (!existsSync(source)) continue;
    const target = join(exportDir, path);
    await mkdir(dirname(target), { recursive: true });
    await cp(source, target, { recursive: true });
  }
}

async function copySamsungManifests() {
  const manifestDir = join(rootDir, "raw", "manifests");
  const names = (await readdir(manifestDir)).filter((name) => /^samsung\..+\.json$/u.test(name));
  for (const name of names) {
    const target = join(exportDir, "raw", "manifests", name);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(manifestDir, name), target);
  }
}

async function copySamsungScripts() {
  const scriptNames = [
    "dev.mjs",
    "evaluate-advisor-scenarios.mjs",
    "build-quality-dashboard-seed.mjs"
  ];
  for (const name of scriptNames) {
    const target = join(exportDir, "scripts", name);
    await mkdir(dirname(target), { recursive: true });
    await cp(join(rootDir, "scripts", name), target);
  }

  await writeFile(
    join(exportDir, "scripts", "check-replit-readiness.mjs"),
    `import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

function readJson(path) {
  return JSON.parse(readFileSync(join(rootDir, path), "utf8"));
}

function readText(path) {
  return readFileSync(join(rootDir, path), "utf8");
}

function requireFile(path) {
  if (!existsSync(join(rootDir, path))) errors.push(\`\${path}: missing\`);
}

function requireIncludes(path, needles) {
  const text = readText(path);
  for (const needle of needles) {
    if (!text.includes(needle)) errors.push(\`\${path}: expected to include \${needle}\`);
  }
}

const pkg = readJson("package.json");
const config = readJson("configs/groups.json");

for (const path of [
  ".replit",
  "PROJECT_CONTEXT.md",
  "package-lock.json",
  "package.json",
  "vite.config.ts",
  "server/index.mjs",
  "src/main.tsx",
  "src/styles.css",
  "configs/groups.json",
  "raw/manifests/samsung.source-backed-claims.json",
  "wiki/groups/samsung/overview.md",
  "public/logos/samsung.svg"
]) {
  requireFile(path);
}

for (const scriptName of ["dev", "build", "preview", "typecheck", "check:replit"]) {
  if (!pkg.scripts?.[scriptName]) errors.push(\`package.json: missing \${scriptName} script\`);
}

requireIncludes(".replit", ["npm run dev", "npm run build", "PORT=5173 npm run preview", "localPort = 5173"]);
requireIncludes("PROJECT_CONTEXT.md", ["Last updated:", "Maintenance Rule", "Current Next Step"]);
requireIncludes("vite.config.ts", ["host: \\"0.0.0.0\\"", "port: 5173", "\\"/api\\""]);
requireIncludes("server/index.mjs", ["process.env.PORT ?? 8787", "join(rootDir, \\"dist\\")"]);

const actualOrder = config.groups.map((group) => group.id);
if (actualOrder.join("|") !== "samsung") {
  errors.push(\`configs/groups.json: expected samsung-only config, got \${actualOrder.join(", ")}\`);
}

const samsung = config.groups[0];
if (samsung?.id !== "samsung" || samsung?.defaultCompanyId !== "samsung-electronics") {
  errors.push("configs/groups.json: Samsung profile or default company is invalid");
}

const src = samsung?.logoAsset?.src;
if (!src?.startsWith("/logos/")) {
  errors.push("samsung.logoAsset.src: must be a local /logos/ asset");
} else {
  requireFile(join("public", src));
}

if (errors.length > 0) {
  console.error("Samsung Replit readiness check failed:");
  for (const error of errors) console.error(\`- \${error}\`);
  process.exit(1);
}

console.log("Samsung Replit readiness check passed.");
console.log("Target: 삼성 only");
`,
    "utf8"
  );
}

async function writeFilteredConfig() {
  const config = JSON.parse(await readFile(join(rootDir, "configs", "groups.json"), "utf8"));
  const samsung = config.groups.find((group) => group.id === "samsung");
  if (!samsung) throw new Error("Samsung group profile not found");
  const samsungOnly = {
    schemaVersion: config.schemaVersion,
    notes: [
      "Samsung-only Replit export generated from the traceable advisor template.",
      "All non-Samsung group profiles were intentionally removed for a focused UI and runtime demo.",
      "Optional live DART/KRX/Naver keys may be added as Replit Secrets; the demo also works with deterministic fallback/local knowledge."
    ],
    groups: [
      {
        ...samsung,
        displayOrder: 1,
        selectorNote: "삼성 전용 데모"
      }
    ]
  };
  await mkdir(join(exportDir, "configs"), { recursive: true });
  await writeFile(join(exportDir, "configs", "groups.json"), `${JSON.stringify(samsungOnly, null, 2)}\n`, "utf8");
  await copyFiles([
    "configs/README.md",
    "configs/source-selection-policy.json",
    "configs/document-url-intake-schema.json"
  ]);
}

async function writePackageJson() {
  const rootPackage = JSON.parse(await readFile(join(rootDir, "package.json"), "utf8"));
  const packageJson = {
    name: "samsung-investor-advisor-replit-demo",
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      dev: "node scripts/dev.mjs",
      build: "tsc -b && vite build",
      preview: "node server/index.mjs",
      api: "node server/index.mjs",
      typecheck: "tsc -b",
      "check:replit": "node scripts/check-replit-readiness.mjs",
      "eval:samsung": "ADVISOR_EVAL_SCENARIO=evals/scenarios/samsung.reference-slice.json ADVISOR_EVAL_DATE=2026-05-03 node scripts/evaluate-advisor-scenarios.mjs",
      "quality:samsung": "AGENT_QUALITY_RESULT=evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json AGENT_QUALITY_OUT=evals/dashboard/agent-dog.samsung-paper-seed.2026-05-03.json node scripts/build-quality-dashboard-seed.mjs"
    },
    dependencies: rootPackage.dependencies,
    devDependencies: rootPackage.devDependencies
  };
  await writeFile(join(exportDir, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`, "utf8");
}

async function writeProjectContext() {
  await writeFile(
    join(exportDir, "PROJECT_CONTEXT.md"),
    `# Samsung Investor Advisor Replit Context

Last updated: 2026-05-04

## Purpose

This package is a Samsung-only Replit export of the Korea Investor Advisor
Research demo. It preserves the current mobile UI, traceable answer process,
source-backed claim layer, LLM Wiki namespace, and optional live DART/KRX/news
tool interface while removing all non-Samsung group profiles from the UI and
runtime config.

## Current Next Step

Use this export for a focused Replit UI test. The expected first screen is the
iPhone-style mobile advisor with Samsung selected by default. The selector may
still visually exist, but it contains only Samsung.

## Runtime Boundary

- Group: Samsung only.
- Default company: Samsung Electronics.
- Runtime source-backed claims: \`raw/manifests/samsung.source-backed-claims.json\`.
- LLM Wiki namespace: \`wiki/groups/samsung\`.
- Live APIs are optional. Without Secrets, the app uses deterministic local and
  fallback data while preserving the same UI and trace schema.

## Maintenance Rule

If the Samsung source-backed manifest, wiki pages, UI shell, or server trace
schema changes in the main repository, regenerate this package with
\`npm run export:replit:samsung\` from the main repository.
`,
    "utf8"
  );
}

async function writeEnvExample() {
  await writeFile(
    join(exportDir, ".env.example"),
    `# Optional live integrations for Replit Secrets.
# The Samsung-only demo runs without these keys by using local/fixture fallbacks.

DART_API_KEY=
KRX_API_KEY=
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

# Development UI: set to 0 for client-facing screenshots.
VITE_ADVISOR_DEV_UI=1
ADVISOR_PREWARM=1
`,
    "utf8"
  );
}

async function writeReadme() {
  await writeFile(
    join(exportDir, "README.md"),
    `# Samsung Investor Advisor Replit Demo

This is a Samsung-only Replit export of the traceable Korea Investor Advisor
Research app.

## Run

\`\`\`bash
npm install
npm run dev
\`\`\`

Replit should expose port 5173. The API server runs on port 8787 and Vite
proxies \`/api\` requests to it.

## What Is Included

- iPhone-style mobile UI from the main project
- Samsung-only group config
- Samsung logo asset
- Samsung LLM Wiki namespace
- Samsung source-backed claim manifest and related Samsung manifests
- Samsung evaluation scenario/result/dashboard seed
- Optional live DART/KRX/Naver interface with deterministic fallbacks

## What Is Intentionally Excluded

- Other group profiles and logos
- \`node_modules\`
- private \`.env\` values
- original source PDFs

Extracted Samsung markdown is included as local review evidence, but customer
answers should rely on promoted source-backed claims, not raw extracted text.
`,
    "utf8"
  );
}

async function writeTransferManifest() {
  await writeFile(
    join(exportDir, "TRANSFER_MANIFEST.md"),
    `# Transfer Manifest

Upload this whole folder to Replit, excluding \`node_modules\` if it exists.

## Required Runtime Files

- \`.replit\`
- \`package.json\`
- \`package-lock.json\`
- \`index.html\`
- \`vite.config.ts\`
- \`tsconfig.json\`
- \`src/\`
- \`server/\`
- \`scripts/dev.mjs\`
- \`scripts/check-replit-readiness.mjs\`
- \`configs/groups.json\`
- \`prompts/\`
- \`public/logos/samsung.svg\`
- \`raw/manifests/samsung.source-backed-claims.json\`
- \`wiki/groups/samsung/\`

## Included Research/Evaluation Files

- \`raw/manifests/samsung.*.json\`
- \`raw/extracted/samsung/\`
- \`evals/scenarios/samsung.reference-slice.json\`
- \`evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json\`
- \`evals/dashboard/agent-dog.samsung-paper-seed.2026-05-03.json\`
- Samsung-related docs under \`docs/\`

## Optional Replit Secrets

- \`DART_API_KEY\`
- \`KRX_API_KEY\`
- \`NAVER_CLIENT_ID\`
- \`NAVER_CLIENT_SECRET\`

The app works without these values, but live data cards and traces will show
fallback/local states.
`,
    "utf8"
  );
}

async function writeReplitPrompt() {
  await writeFile(
    join(exportDir, "REPLIT_PROMPT.md"),
    `# Prompt for Replit Agent

You are working with an uploaded Samsung-only React/Vite/Node project. Preserve
the current UI and file structure. Do not redesign the app.

Goal:
Run a Samsung-only version of the Korea Investor Advisor mobile demo in Replit.
The UI must match the uploaded local implementation: iPhone-style outer frame,
status bar, Samsung logo header, compact briefing cards, chat area, process
trace display, source links, follow-up questions, bottom quick actions, and
input/send controls.

Hard requirements:
1. Keep \`configs/groups.json\` Samsung-only. Do not add SK, Hyundai, LG, or
   Hanwha back into the UI.
2. Keep Samsung selected by default. The selector may remain as a UI affordance,
   but it must only contain Samsung.
3. Use the existing \`src/\`, \`server/\`, \`prompts/\`, \`wiki/groups/samsung/\`,
   and \`raw/manifests/samsung.source-backed-claims.json\` files.
4. Do not expose raw development trace text in the customer answer body. Trace
   and validation details may remain behind the existing developer UI controls.
5. The app must run without API keys by using deterministic local/fallback data.
6. If Replit Secrets are provided, use:
   - \`DART_API_KEY\`
   - \`KRX_API_KEY\`
   - \`NAVER_CLIENT_ID\`
   - \`NAVER_CLIENT_SECRET\`
7. Keep the run command as \`npm run dev\`.
8. The public web preview should open on port 5173.

Setup:
\`\`\`bash
npm install
npm run check:replit
npm run dev
\`\`\`

Validation:
- First screen shows Samsung, price 83,200, and Samsung briefing cards.
- Asking "삼성 최근 투자 포인트를 요약해줘" produces a customer-facing Korean
  answer with sections, source links, and customer-oriented follow-up questions.
- The answer process appears before the final answer.
- \`npm run build\` succeeds.

If anything fails, fix only the minimum needed to restore this Samsung-only
demo. Do not migrate the project to another framework and do not remove the
traceable advisor architecture.
`,
    "utf8"
  );
}

function relative(path) {
  return path.replace(`${rootDir}/`, "");
}
