import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = resolve(
  process.env.HYUNDAI_INVENTORY ?? join(rootDir, "raw", "manifests", "hyundai-motor.local-sources.json")
);
const intakeTemplatePath = resolve(
  process.env.HYUNDAI_SOURCE_INTAKE_TEMPLATE ??
    join(rootDir, "raw", "manifests", "hyundai-motor.source-intake-template.json")
);
const strict = process.env.HYUNDAI_INTAKE_STRICT === "1";

const errors = [];
const warnings = [];
const infos = [];

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function addInfo(message) {
  infos.push(message);
}

const template = JSON.parse(await readFile(intakeTemplatePath, "utf8"));
const firstSliceIds = new Set((template.firstSliceCompanies ?? []).map((company) => company.companyId));
const knownCompanyIds = new Set([
  ...(template.firstSliceCompanies ?? []).map((company) => company.companyId),
  ...(template.optionalSecondWaveCompanies ?? []).map((company) => company.companyId)
]);
const allowedPackages = new Set((template.sourcePackages ?? []).map((pkg) => pkg.id));

if (!existsSync(inventoryPath)) {
  addError(relativePath(inventoryPath), "missing Hyundai local source inventory; run npm run inventory:hyundai first");
} else {
  const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
  const entries = Array.isArray(inventory.entries) ? inventory.entries : [];

  if (inventory.groupId !== "hyundai-motor") {
    addError(relativePath(inventoryPath), "groupId must be hyundai-motor");
  }

  if (!inventory.inputExists) {
    addInfo("Hyundai knowledge folder is not present yet; intake is prepared but not ready for promotion.");
  }

  if (entries.length === 0) {
    addInfo("Hyundai source inventory has 0 entries; waiting for user-supplied source package.");
  }

  for (const [index, entry] of entries.entries()) {
    const entryPath = `${relativePath(inventoryPath)}.entries[${index}](${entry.id ?? "missing-id"})`;
    if (!entry.companyId) addError(entryPath, "companyId is required for every source candidate");
    else if (!knownCompanyIds.has(entry.companyId)) addError(entryPath, `unknown companyId '${entry.companyId}'`);

    if (!entry.localPath || !existsSync(join(rootDir, entry.localPath))) {
      addError(entryPath, "localPath is missing or file does not exist");
    }

    if (entry.processingDecision === "duplicate-reference-only" || entry.intakeReadiness === "duplicate_reference_only") {
      continue;
    }

    if (!entry.requestPackage) addWarning(entryPath, "missing requestPackage; map the source to PKG-01..PKG-07");
    else if (!allowedPackages.has(entry.requestPackage)) addWarning(entryPath, `unknown requestPackage '${entry.requestPackage}'`);

    if (!entry.selectionReason) addWarning(entryPath, "missing one-line selectionReason");
    if (!entry.rightsLevel || entry.rightsLevel === "missing") addWarning(entryPath, "missing rightsLevel");
    if (/restricted|do-not-ingest/iu.test(entry.rightsLevel ?? "")) addError(entryPath, "restricted source must not be ingested");

    if (!entry.sourcePageUrl && !entry.publicDocumentUrl && !entry.dartReceiptUrl) {
      addWarning(entryPath, "missing sourcePageUrl/publicDocumentUrl/dartReceiptUrl");
    }
    if (entry.sourcePageUrl && !entry.publicDocumentUrl && !entry.dartReceiptUrl) {
      addInfo(`${entryPath}: source-page-only provenance accepted; keep exact document title, period, checksum, extraction hash, and evidence locator before claim promotion`);
    }
    if (entry.processingDecision === "extract-to-markdown-and-wiki-candidate" && entry.extension === "pdf" && entry.isPdf !== true) {
      addError(entryPath, "PDF extraction candidate must be a valid PDF");
    }
  }

  for (const companyId of firstSliceIds) {
    const companyEntries = entries.filter((entry) => entry.companyId === companyId);
    if (entries.length > 0 && companyEntries.length === 0) {
      addWarning(`hyundai.firstSlice.${companyId}`, "no local source candidate found for first-slice company");
      continue;
    }
    const hasDisclosure = companyEntries.some((entry) =>
      ["business_report", "quarterly_report", "semiannual_report"].includes(entry.documentType)
    );
    const hasPresentation = companyEntries.some((entry) =>
      ["earnings_presentation", "investor_presentation", "strategy_presentation", "value_up_plan"].includes(entry.documentType)
    );
    if (companyEntries.length > 0 && !hasDisclosure) {
      addWarning(`hyundai.firstSlice.${companyId}`, "no annual/quarterly/semiannual disclosure-like document detected");
    }
    if (companyEntries.length > 0 && !hasPresentation) {
      addWarning(`hyundai.firstSlice.${companyId}`, "no earnings/investor/value-up presentation detected");
    }
  }

  const readyCount = entries.filter((entry) =>
    ["ready_for_extraction_or_claim_review", "ready_for_extraction_or_claim_review_source_page"].includes(entry.intakeReadiness)
  ).length;
  const reviewOnlyCount = entries.filter((entry) => entry.intakeReadiness === "review_only_source_page").length;
  const blockedCount = entries.filter((entry) => String(entry.intakeReadiness ?? "").startsWith("blocked_")).length;
  addInfo(`Hyundai intake readiness: ${readyCount} ready, ${reviewOnlyCount} source-page-only, ${blockedCount} blocked.`);
}

if (strict && warnings.length > 0) {
  for (const warning of warnings) addError("strict", warning);
}

if (warnings.length > 0) {
  console.log("Hyundai intake warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (infos.length > 0) {
  console.log("Hyundai intake notes:");
  for (const info of infos) console.log(`- ${info}`);
}

if (errors.length > 0) {
  console.error("Hyundai intake validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Hyundai intake validation passed.");

function relativePath(path) {
  return path.replace(`${rootDir}/`, "");
}
