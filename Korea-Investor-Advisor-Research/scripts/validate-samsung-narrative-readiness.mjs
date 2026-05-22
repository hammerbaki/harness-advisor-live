import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];

const urlIntake = await readJson("raw/manifests/samsung.document-url-intake.json");
const narrativeQueue = await readJson("raw/manifests/samsung.narrative-claim-queue.json");
const urlSchema = await readJson("configs/document-url-intake-schema.json");
const readinessDoc = await readText("docs/42_samsung_url_and_narrative_claim_readiness.md");
const dartExtraction = existsSync(join(rootDir, "raw/manifests/samsung.dart-filing-extraction-report.json"))
  ? await readJson("raw/manifests/samsung.dart-filing-extraction-report.json")
  : null;

if (urlIntake.schemaVersion !== "document-url-intake.v0.1") addError("document-url-intake", "unexpected schemaVersion");
if (urlIntake.groupId !== "samsung") addError("document-url-intake", "groupId must be samsung");
if (narrativeQueue.schemaVersion !== "narrative-claim-queue.v0.1") addError("narrative-queue", "unexpected schemaVersion");
if (narrativeQueue.groupId !== "samsung") addError("narrative-queue", "groupId must be samsung");
if (!readinessDoc.includes("Promotion Boundary")) {
  addError("docs/42_samsung_url_and_narrative_claim_readiness.md", "must document promotion boundary");
}

const urlSourceIds = new Set();
for (const entry of urlIntake.entries ?? []) {
  urlSourceIds.add(entry.sourceId);
  for (const field of urlSchema.requiredFields ?? []) {
    if (!(field in entry)) addError(entry.sourceId, `missing required URL intake field ${field}`);
  }
  if (entry.urlStatus === "pending_user_url" && entry.promotionReadiness !== "blocked_missing_document_url") {
    addError(entry.sourceId, "pending user URL must block promotion");
  }
  if (entry.urlStatus === "public_url_supplied" && !/^https?:\/\//u.test(entry.publicDocumentUrl ?? "")) {
    addError(entry.sourceId, "publicDocumentUrl must be http(s)");
  }
  if (entry.sourceRole === "official_issuer" && entry.localPath && !entry.publicDocumentUrl) {
    warnings.push(`${entry.sourceId}: local issuer document still needs document-level URL`);
  }
}

for (const record of narrativeQueue.records ?? []) {
  if (record.verificationState !== "narrative_claim_queue_not_runtime_eligible") {
    addError(record.id, "narrative queue records must not be runtime eligible");
  }
  for (const source of record.localSources ?? []) {
    if (!urlSourceIds.has(source.manifestId)) addError(record.id, `${source.manifestId} missing from URL intake`);
    if (source.urlStatus === "pending_user_url" && source.promotionReadiness !== "blocked_missing_document_url") {
      addError(record.id, `${source.manifestId} has inconsistent pending URL status`);
    }
  }
}

if (!dartExtraction) {
  warnings.push("DART filing extraction report is absent; Samsung Life/Fire narrative claims remain blocked");
} else if (dartExtraction.groupId !== "samsung") {
  addError("dart-filing-extraction-report", "groupId must be samsung");
}

if (warnings.length > 0) {
  console.log("Samsung narrative readiness warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Samsung narrative readiness validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Samsung narrative readiness validation passed: ${(urlIntake.entries ?? []).length} URL intake entries, ` +
    `${(narrativeQueue.records ?? []).length} narrative queue themes.`
);

async function readJson(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    addError(relativePath, "missing required artifact");
    return {};
  }
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

async function readText(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    addError(relativePath, "missing required artifact");
    return "";
  }
  return readFile(absolutePath, "utf8");
}

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

