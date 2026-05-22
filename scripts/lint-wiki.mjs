import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const config = JSON.parse(await readFile(join(rootDir, "configs/groups.json"), "utf8"));
const errors = [];
const warnings = [];
const allowedStatus = new Set([
  "draft",
  "source-backed",
  "stale",
  "contradiction",
  "candidate-plan",
  "financial-source-backed-seed",
  "local_pdf_extracted",
  "dart_viewer_pending_extraction",
  "dart_text_extracted"
]);
const allowedConfidence = new Set(["low", "medium", "high", "candidate"]);

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  if (!match) return { frontMatter: null, body: raw };
  const frontMatter = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/gu, "");
    frontMatter[key] = value;
  }
  return { frontMatter, body: match[2] };
}

async function collectMarkdownFiles(dir) {
  const output = [];
  if (!existsSync(dir)) return output;
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await collectMarkdownFiles(path));
    if (entry.isFile() && entry.name.endsWith(".md")) output.push(path);
  }
  return output;
}

function rel(path) {
  return path.replace(`${rootDir}/`, "");
}

for (const required of ["wiki/index.md", "wiki/log.md"]) {
  if (!existsSync(join(rootDir, required))) addError(required, "missing required LLM wiki navigation file");
}

const configuredGroupIds = new Set(config.groups.map((group) => group.id));
for (const group of config.groups) {
  const namespaceDir = join(rootDir, "wiki", group.wikiNamespace);
  if (!existsSync(namespaceDir)) {
    addError(`wiki/${group.wikiNamespace}`, "missing configured wiki namespace directory");
    continue;
  }
  if (!existsSync(join(namespaceDir, "overview.md"))) {
    addError(`wiki/${group.wikiNamespace}/overview.md`, "missing overview page");
  }
  if (!existsSync(join(rootDir, "raw", "manifests", `${group.id}.json`))) {
    addError(`raw/manifests/${group.id}.json`, "missing source manifest stub");
  }
}

const files = await collectMarkdownFiles(join(rootDir, "wiki"));
const wikiPageFiles = files.filter((file) => !file.endsWith("/schema.md"));
for (const file of wikiPageFiles) {
  const raw = await readFile(file, "utf8");
  const { frontMatter, body } = parseFrontMatter(raw);
  const path = rel(file);
  if (!frontMatter) {
    addError(path, "missing YAML front matter");
    continue;
  }

  for (const field of ["title", "group_id", "source_status", "last_checked", "confidence"]) {
    if (!frontMatter[field]) addError(path, `missing front matter field '${field}'`);
  }

  if (frontMatter.group_id !== "all" && !configuredGroupIds.has(frontMatter.group_id)) {
    addError(path, `group_id '${frontMatter.group_id}' is not present in configs/groups.json`);
  }
  if (!allowedStatus.has(frontMatter.source_status)) {
    addError(path, `source_status '${frontMatter.source_status}' is not allowed`);
  }
  if (!allowedConfidence.has(frontMatter.confidence)) {
    addError(path, `confidence '${frontMatter.confidence}' is not allowed`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(frontMatter.last_checked ?? "")) {
    addError(path, "last_checked must be YYYY-MM-DD");
  }
  if (frontMatter.source_status === "source-backed" && !body.includes("## Source References")) {
    addError(path, "source-backed page must include '## Source References'");
  }
  if (!body.includes("## Source References") && !path.endsWith("log.md")) {
    addWarning(path, "page has no '## Source References' section yet");
  }
}

if (warnings.length > 0) {
  console.log("Wiki warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Wiki lint failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Wiki lint passed: ${wikiPageFiles.length} markdown pages checked.`);
