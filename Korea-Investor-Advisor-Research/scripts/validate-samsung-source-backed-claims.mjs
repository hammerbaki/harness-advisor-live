import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];

const claims = await readJson("raw/manifests/samsung.source-backed-claims.json");
const financialTable = await readJson("raw/manifests/samsung.dart-financial-table.2022-2024.json");
const narrativeSeeds = await readJson("configs/samsung-narrative-claim-seeds.json");
const financialDoc = await readText("docs/41_samsung_source_backed_seed_claims.md");
const wikiFinancials = await readText("wiki/groups/samsung/financials.md");
const wikiSources = await readText("wiki/groups/samsung/sources.md");

if (claims.schemaVersion !== "source-backed-claims.v0.1") addError("claims", "unexpected schemaVersion");
if (claims.groupId !== "samsung") addError("claims", "groupId must be samsung");
if ((claims.records ?? []).length < 15) addError("claims", "must contain the 15-company DART financial baseline");
if (claims.totals?.byVerificationState?.source_backed_seed !== claims.totals?.claims) {
  addError("claims", "all Samsung promoted claims must be source_backed_seed");
}
if (!financialDoc.includes("Finance-Company Boundary")) {
  addError("docs/41_samsung_source_backed_seed_claims.md", "must document the finance-company boundary");
}
if (!financialDoc.includes("Narrative seed claims")) {
  addError("docs/41_samsung_source_backed_seed_claims.md", "must document narrative seed claim promotion");
}
if (!wikiFinancials.includes("samsung.source-backed-claims.json")) {
  addError("wiki/groups/samsung/financials.md", "must link the Samsung source-backed manifest");
}
if (!wikiSources.includes("Source-Backed Claim Manifest")) {
  addError("wiki/groups/samsung/sources.md", "must include the generated source-backed manifest block");
}

const ids = new Set();
const companies = new Set();
let narrativeClaimCount = 0;
for (const record of claims.records ?? []) {
  if (!record.id) addError("claims", "each claim must have an id");
  if (ids.has(record.id)) addError("claims", `duplicate id ${record.id}`);
  ids.add(record.id);
  companies.add(record.companyId);
  if (record.groupId !== "samsung") addError(record.id, "groupId must be samsung");
  if (!record.claimTextSha256) addError(record.id, "missing claimTextSha256");
  if (!record.targetWikiPage?.startsWith("wiki/groups/samsung/")) addError(record.id, "invalid target wiki page");
  const isNarrative = record.paperUseLevel === "source-backed-narrative-seed-claim";
  if (isNarrative) narrativeClaimCount += 1;
  if (!isNarrative && !record.sourceManifestId?.startsWith("samsung-dart-financial-table-2022-2024:")) {
    addError(record.id, "financial sourceManifestId must point to the Samsung DART financial table artifact");
  }
  if (isNarrative && !/^samsung-(local|dart)-/u.test(record.sourceManifestId ?? "")) {
    addError(record.id, "narrative sourceManifestId must point to a Samsung local PDF or DART filing artifact");
  }
  if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
    addError(record.id, "missing evidenceLocations");
  }
  if (/이자수익|수수료수익|보험수익|보험료수익|순이자/u.test(record.claimText ?? "")) {
    addError(record.id, "claim text appears to redefine finance-company revenue");
  }
  if (isNarrative) {
    if (!record.sourceTextSha256) addError(record.id, "narrative claim missing sourceTextSha256");
    if (!record.officialSource?.downloadUrl && !record.officialSource?.sourcePageUrl) {
      addError(record.id, "narrative claim missing public document URL");
    }
    if (record.claimType?.includes("forward_looking") && !record.runtimeUsePolicy?.includes("forward_looking")) {
      addError(record.id, "forward-looking narrative claim must carry a forward-looking runtime policy");
    }
    for (const location of record.evidenceLocations ?? []) {
      if (!location.markdownPath) addError(record.id, "narrative evidence missing markdownPath");
      if (!location.lineNumber) addError(record.id, "narrative evidence missing lineNumber");
      if (!location.evidenceNeedleSha256) addError(record.id, "narrative evidence missing evidenceNeedleSha256");
      if (!location.sourceTextSha256 || location.sourceTextSha256 !== record.sourceTextSha256) {
        addError(record.id, "narrative evidence sourceTextSha256 mismatch");
      }
      if (!location.publicDocumentUrl && !location.sourcePageUrl) {
        addError(record.id, "narrative evidence missing public URL");
      }
    }
  }
}

if (narrativeClaimCount !== (narrativeSeeds.records ?? []).length) {
  addError("claims", "all configured Samsung narrative seed claims must be promoted");
}

for (const companyId of new Set((financialTable.records ?? []).map((record) => record.companyId))) {
  const record2024 = financialTable.records.find((record) => record.companyId === companyId && record.year === "2024");
  if (record2024?.operatingIncome && !companies.has(companyId)) {
    warnings.push(`${companyId}: 2024 operating income exists in DART table but no promoted seed claim was found`);
  }
}

for (const companyId of ["samsung-life", "samsung-fire-marine", "samsung-securities"]) {
  const limited = (claims.records ?? []).find(
    (record) => record.companyId === companyId && record.runtimeUsePolicy === "eligible_for_bounded_context_with_missing_revenue_label"
  );
  if (!limited) addError(companyId, "financial company must preserve the missing-revenue label");
}

if (warnings.length > 0) {
  console.log("Samsung source-backed claim warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Samsung source-backed claim validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Samsung source-backed claim validation passed: ${(claims.records ?? []).length} claims checked.`);

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
