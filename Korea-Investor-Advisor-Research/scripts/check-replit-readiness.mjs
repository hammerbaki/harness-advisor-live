import { existsSync, readFileSync } from "node:fs";
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
  if (!existsSync(join(rootDir, path))) errors.push(`${path}: missing`);
}

function requireIncludes(path, needles) {
  const text = readText(path);
  for (const needle of needles) {
    if (!text.includes(needle)) errors.push(`${path}: expected to include ${needle}`);
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
  "configs/groups.json"
]) {
  requireFile(path);
}

for (const scriptName of ["dev", "build", "preview", "typecheck", "validate:template"]) {
  if (!pkg.scripts?.[scriptName]) errors.push(`package.json: missing ${scriptName} script`);
}

requireIncludes(".replit", ["npm run dev", "npm run build", "PORT=5173 npm run preview", "localPort = 5173"]);
requireIncludes("PROJECT_CONTEXT.md", ["Last updated:", "Maintenance Rule", "Current Next Step"]);
requireIncludes("vite.config.ts", ["host: \"0.0.0.0\"", "port: 5173", "\"/api\""]);
requireIncludes("server/index.mjs", ["process.env.PORT ?? 8787", "join(rootDir, \"dist\")"]);

const expectedOrder = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const actualOrder = config.groups.map((group) => group.id);
if (expectedOrder.join("|") !== actualOrder.join("|")) {
  errors.push(`configs/groups.json: expected order ${expectedOrder.join(", ")}, got ${actualOrder.join(", ")}`);
}

for (const [index, group] of config.groups.entries()) {
  const src = group.logoAsset?.src;
  if (!src?.startsWith("/logos/")) {
    errors.push(`groups[${index}](${group.id}).logoAsset.src: must be a local /logos/ asset`);
    continue;
  }
  requireFile(join("public", src));
  if (!Number.isInteger(group.displayOrder) || group.displayOrder !== index + 1) {
    errors.push(`groups[${index}](${group.id}).displayOrder: must match selector order ${index + 1}`);
  }
}

if (errors.length > 0) {
  console.error("Replit readiness check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Replit readiness check passed.");
console.log(`Target order: ${config.groups.map((group) => group.koreanName).join(" → ")}`);
