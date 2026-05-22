import { existsSync } from "node:fs";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const projectRoot = resolve(repoRoot, "..");
const outputPath = join(repoRoot, "raw", "manifests", "project-folder-classification.json");
const docPath = join(repoRoot, "docs", "78_project_folder_reclassification.md");

const classificationRules = [
  {
    path: "Korea-Investor-Advisor-Research",
    class: "current-product-research-repository",
    role: "Vite/React product, Node API, manifests, extracted text, wiki, evaluation, and reproducibility scripts.",
    currentAction: "keep-as-active-root",
    futureAction: "May be renamed to app/ only after all scripts and deployment docs are path-agnostic.",
    moveRisk: "high"
  },
  {
    path: "Knowledge Base",
    class: "raw-source-package",
    role: "User/client supplied official IR, DART, PDF, PPT, and source URL packages.",
    currentAction: "keep-outside-repo-as-immutable-source-root",
    futureAction: "May become sources/knowledge-base after inventory scripts support SOURCE_ROOT.",
    moveRisk: "high"
  },
  {
    path: "HanWha-Advisor-main",
    class: "original-poc-archive",
    role: "Read-only reference snapshot from the Replit-built Hanwha advisor PoC.",
    currentAction: "keep-read-only-and-do-not-mix-with-clean-runtime",
    futureAction: "May become archive/original-poc/HanWha-Advisor-main after source references are stabilized.",
    moveRisk: "medium"
  },
  {
    path: "arxiv-paper",
    class: "paper-workspace",
    role: "Paused arXiv LaTeX draft workspace; product development remains priority.",
    currentAction: "keep-separate-from-product-until-product-freeze",
    futureAction: "May become papers/arxiv after paper build paths are checked.",
    moveRisk: "medium"
  },
  {
    path: "ir_download",
    class: "incoming-source-staging",
    role: "External source download staging area already reconciled against Knowledge Base by SHA-256.",
    currentAction: "keep-temporarily-for-audit-replay",
    futureAction: "Archive after no pending source drops depend on this folder.",
    moveRisk: "medium"
  },
  {
    path: "ElizaOS.pdf",
    class: "reference-paper",
    role: "External paper used for structure benchmarking.",
    currentAction: "keep-at-project-root-until-reference-folder-is-approved",
    futureAction: "Move to references/papers/ElizaOS.pdf in physical migration stage.",
    moveRisk: "low"
  },
  {
    path: "electronics-14-04161-v2.pdf",
    class: "author-prior-paper",
    role: "Previously published AI marketing automation agent paper used as related/prior work reference.",
    currentAction: "keep-at-project-root-until-reference-folder-is-approved",
    futureAction: "Move to references/prior-work/electronics-14-04161-v2.pdf in physical migration stage.",
    moveRisk: "low"
  },
  {
    path: ".DS_Store",
    class: "local-system-file",
    role: "macOS metadata, not project evidence.",
    currentAction: "ignore",
    futureAction: "Remove during repository packaging, not during source classification.",
    moveRisk: "low"
  }
];

const observedTopLevel = await listTopLevel(projectRoot);
const knownPaths = new Set(classificationRules.map((rule) => rule.path));
const records = [];

for (const rule of classificationRules) {
  const absolutePath = join(projectRoot, rule.path);
  records.push({
    ...rule,
    exists: existsSync(absolutePath),
    ...(existsSync(absolutePath) ? await summarizePath(absolutePath) : {})
  });
}

for (const entry of observedTopLevel.filter((entry) => !knownPaths.has(entry.name))) {
  records.push({
    path: entry.name,
    class: entry.isDirectory ? "unclassified-directory" : "unclassified-file",
    role: "Not yet assigned to the product/paper/source/archive taxonomy.",
    currentAction: "review-before-move",
    futureAction: "Classify before packaging or publication.",
    moveRisk: "unknown",
    exists: true,
    ...(await summarizePath(join(projectRoot, entry.name)))
  });
}

const manifest = {
  schemaVersion: "project-folder-classification.v0.1",
  generatedAt: new Date().toISOString(),
  projectRoot: projectRoot,
  repoRoot: repoRoot,
  policy:
    "Do not physically move active roots until scripts, docs, Replit export, and paper build paths are path-agnostic. Use this taxonomy first as a stable classification layer.",
  proposedFutureRootShape: [
    "app/ or Korea-Investor-Advisor-Research/",
    "sources/knowledge-base/ or Knowledge Base/",
    "sources/incoming/",
    "papers/arxiv/",
    "references/",
    "archive/original-poc/"
  ],
  records
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
await writeFile(docPath, renderMarkdown(manifest), "utf8");

console.log(`Project folder classification written: ${relative(repoRoot, outputPath)}`);
console.log(`Readable folder reclassification note written: ${relative(repoRoot, docPath)}`);
console.log(`${records.length} top-level project item(s) classified.`);

async function listTopLevel(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return entries
    .filter((entry) => !entry.name.startsWith("~$"))
    .map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
      isFile: entry.isFile()
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko-KR"));
}

async function summarizePath(path) {
  const stats = await stat(path);
  if (stats.isFile()) {
    return {
      kind: "file",
      fileCount: 1,
      dirCount: 0,
      bytes: stats.size
    };
  }

  let fileCount = 0;
  let dirCount = 0;
  let bytes = 0;
  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        dirCount += 1;
        await walk(fullPath);
      } else if (entry.isFile()) {
        fileCount += 1;
        bytes += (await stat(fullPath)).size;
      }
    }
  }
  await walk(path);
  return {
    kind: "directory",
    fileCount,
    dirCount,
    bytes
  };
}

function renderMarkdown(manifest) {
  return [
    "# Project Folder Reclassification",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document classifies the current project folders without physically moving active paths. The goal is to make the workspace understandable for product completion, reproducibility, paper writing, and later repository packaging.",
    "",
    "## Current Policy",
    "",
    manifest.policy,
    "",
    "## Current Top-Level Classification",
    "",
    table(
      ["Path", "Class", "Role", "Current action", "Future action", "Move risk", "Files"],
      manifest.records.map((record) => [
        `\`${record.path}\``,
        `\`${record.class}\``,
        record.role,
        `\`${record.currentAction}\``,
        record.futureAction,
        `\`${record.moveRisk}\``,
        String(record.fileCount ?? 0)
      ])
    ),
    "",
    "## Recommended Stable Meaning",
    "",
    "- `Korea-Investor-Advisor-Research` is the active product and research repository.",
    "- `Knowledge Base` is the raw source package root. Treat it as immutable input, not as generated runtime knowledge.",
    "- `HanWha-Advisor-main` is the original PoC archive. It should be read for feature parity and historical comparison, but not mixed into the clean runtime.",
    "- `arxiv-paper` is a paused paper workspace. It should be updated after product behavior stabilizes.",
    "- `ir_download` is an incoming source staging folder. Its content is already reconciled into `Knowledge Base`; keep it only for audit replay until the source intake cycle closes.",
    "- Root-level PDFs are references. They should eventually move under `references/`, but that can wait until final packaging.",
    "",
    "## Proposed Future Shape",
    "",
    "```text",
    ...manifest.proposedFutureRootShape,
    "```",
    "",
    "## Physical Migration Gate",
    "",
    "Do not physically rename or move the active roots until these checks pass:",
    "",
    "- inventory scripts accept a configurable `SOURCE_ROOT` instead of hard-coded sibling paths;",
    "- Replit export scripts use the new path map;",
    "- paper build paths are verified;",
    "- `npm run audit:first-slice`, `npm run validate:stage-gate`, `npm run lint:wiki`, and `npm run typecheck` pass after a dry-run path rewrite;",
    "- the user confirms no active source collection process still writes to the old folder names.",
    "",
    "## Machine-Readable Artifact",
    "",
    "`raw/manifests/project-folder-classification.json`",
    ""
  ].join("\n");
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`)
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/").replace(/\n/gu, "<br>");
}
