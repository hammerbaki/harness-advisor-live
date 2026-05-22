import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];

const inventory = await readJson("raw/manifests/samsung.local-sources.json");
const extraction = await readJson("raw/manifests/samsung.extraction-report.json");
const identifierVerification = await readJson("raw/manifests/samsung.identifier-verification.json");
const adequacyAudit = await readJson("raw/manifests/samsung.local-source-adequacy-audit.json");
const gitignore = existsSync(join(rootDir, ".gitignore"))
  ? await readFile(join(rootDir, ".gitignore"), "utf8")
  : "";

if (inventory.groupId !== "samsung") addError("inventory", "groupId must be samsung");
if ((inventory.totals?.entries ?? 0) < 1) addError("inventory", "must contain Samsung source candidates");
if ((inventory.totals?.localFiles ?? 0) < 1) addError("inventory", "must contain local Samsung files");
if ((inventory.totals?.validLocalPdfFiles ?? 0) < 1) addError("inventory", "must contain valid local official PDFs");
if ((inventory.totals?.dartViewerFilings ?? 0) < 1) {
  addWarning("inventory", "Samsung Life/Fire DART viewer filings are absent; insurance coverage may be incomplete");
}
if ((inventory.totals?.invalidLocalPdfFiles ?? 0) > 0) {
  addWarning(
    "inventory",
    `${inventory.totals.invalidLocalPdfFiles} file(s) have a .pdf extension but are not valid PDFs and must be replaced or excluded`
  );
}

const recognizedCompanyIds = new Set((identifierVerification.records ?? []).map((record) => record.companyId));
const localEntries = inventory.entries?.filter((entry) => entry.localPath) ?? [];
const unrecognizedCompanyEntries = localEntries.filter((entry) => entry.companyId && !recognizedCompanyIds.has(entry.companyId));
for (const entry of unrecognizedCompanyEntries) addError("inventory", `${entry.id} has unknown companyId ${entry.companyId}`);

const extractCandidates = inventory.entries?.filter(
  (entry) =>
    entry.processingDecision === "extract-to-markdown-and-wiki-candidate" &&
    entry.extension === "pdf" &&
    entry.isPdf === true
) ?? [];
const invalidPdfEntries = inventory.entries?.filter((entry) => entry.processingDecision?.startsWith("exclude-")) ?? [];
const dartViewerEntries = inventory.entries?.filter((entry) => entry.processingDecision === "extract-via-dart-document-pipeline") ?? [];

if (extraction.groupId !== "samsung") addError("extraction", "groupId must be samsung");
if (!extraction.textOutputIncluded && !gitignore.includes("raw/extracted/")) {
  addError(".gitignore", "raw/extracted/ must remain ignored for private full-text review output");
}
if ((extraction.totals?.candidates ?? 0) !== extractCandidates.length) {
  addError("extraction", "candidate count must align with inventory extract candidates");
}
if ((extraction.totals?.error ?? 0) > 0) addError("extraction", "all current Samsung PDF extraction errors must be reviewed");
if ((extraction.totals?.ok ?? 0) !== (extraction.totals?.candidates ?? -1)) {
  addError("extraction", "all current Samsung extraction candidates should extract successfully");
}
if ((extraction.skipped?.invalidPdfFiles ?? 0) !== invalidPdfEntries.length) {
  addError("extraction", "invalid PDF skip count must align with inventory");
}
if ((extraction.skipped?.dartViewerFilings ?? 0) !== dartViewerEntries.length) {
  addError("extraction", "DART viewer skip count must align with inventory");
}
if ((extraction.totals?.lowTextWarnings ?? 0) > 0) {
  addWarning("extraction", `${extraction.totals.lowTextWarnings} extraction(s) produced very little text and need manual review`);
}

if (identifierVerification.groupId !== "samsung") addError("identifier-verification", "groupId must be samsung");
if ((identifierVerification.records ?? []).length < 15) {
  addWarning("identifier-verification", "Samsung listed-company identifier universe has fewer than 15 records");
}

if (adequacyAudit.groupId !== "samsung") addError("source-adequacy-audit", "groupId must be samsung");
if ((adequacyAudit.coverage?.listedCompanies?.count ?? 0) < 15) {
  addWarning("source-adequacy-audit", "audit does not document the 15-company Samsung listed universe");
}

const companyCoverage = inventory.totals?.byCompany ?? {};
for (const requiredCompany of ["삼성전자", "삼성SDI", "삼성물산", "삼성바이오로직스", "삼성생명", "삼성화재"]) {
  if ((companyCoverage[requiredCompany] ?? 0) < 1) {
    addWarning("inventory", `${requiredCompany} has no local or DART-viewer source entry`);
  }
}

if (warnings.length > 0) {
  console.log("Samsung ingestion warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Samsung ingestion validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Samsung ingestion validation passed: ${inventory.totals.localFiles} local files, ` +
    `${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles} valid local PDFs, ` +
    `${extraction.totals.ok}/${extraction.totals.candidates} PDF extractions, ` +
    `${inventory.totals.dartViewerFilings} DART viewer filing(s).`
);

async function readJson(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    addError(relativePath, "missing required Samsung ingestion artifact");
    return {};
  }
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}
