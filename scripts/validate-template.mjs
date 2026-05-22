import { access, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const configPath = join(rootDir, "configs/groups.json");
const config = JSON.parse(await readFile(configPath, "utf8"));
const errors = [];
const warnings = [];

const requiredGroupFields = [
  "id",
  "displayName",
  "koreanName",
  "displayOrder",
  "ftcAssetRank2025",
  "selectorNote",
  "logoAsset",
  "country",
  "wikiNamespace",
  "status",
  "sourceStatus",
  "researchRole",
  "advisorPositioning",
  "defaultCompanyId",
  "companies"
];

const requiredCompanyFields = [
  "id",
  "displayName",
  "koreanName",
  "listed",
  "krxCode",
  "yahooTicker",
  "dartCode",
  "aliases"
];

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values.filter(Boolean)) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

if (!hasText(config.schemaVersion)) {
  addError("schemaVersion", "must be present");
}

if (!Array.isArray(config.groups) || config.groups.length === 0) {
  addError("groups", "must contain at least one target profile");
}

const groupIds = config.groups?.map((group) => group.id) ?? [];
for (const duplicate of duplicateValues(groupIds)) {
  addError("groups", `duplicate group id '${duplicate}'`);
}

for (const duplicate of duplicateValues(config.groups?.map((group) => group.displayOrder) ?? [])) {
  addError("groups", `duplicate displayOrder '${duplicate}'`);
}

for (const duplicate of duplicateValues(config.groups?.map((group) => group.ftcAssetRank2025) ?? [])) {
  addError("groups", `duplicate ftcAssetRank2025 '${duplicate}'`);
}

for (const [groupIndex, group] of (config.groups ?? []).entries()) {
  const groupPath = `groups[${groupIndex}](${group.id ?? "missing-id"})`;
  for (const field of requiredGroupFields) {
    if (group[field] === undefined || group[field] === null || group[field] === "") {
      addError(`${groupPath}.${field}`, "is required");
    }
  }

  if (hasText(group.koreanName) && group.koreanName.includes("그룹")) {
    addError(`${groupPath}.koreanName`, "UI target label must not include '그룹'");
  }

  if (!Number.isInteger(group.displayOrder) || group.displayOrder < 1) {
    addError(`${groupPath}.displayOrder`, "must be a positive integer");
  }
  if (!Number.isInteger(group.ftcAssetRank2025) || group.ftcAssetRank2025 < 1) {
    addError(`${groupPath}.ftcAssetRank2025`, "must be a positive integer");
  }

  if (hasText(group.selectorNote) && group.selectorNote.length > 18) {
    addWarning(`${groupPath}.selectorNote`, "keep the mobile selector note under 18 Korean characters");
  }

  if (!String(group.wikiNamespace ?? "").startsWith("groups/")) {
    addError(`${groupPath}.wikiNamespace`, "must start with groups/");
  }

  if (!["reference-slice", "source-ready", "planned"].includes(group.status)) {
    addError(`${groupPath}.status`, "must be reference-slice, source-ready, or planned");
  }

  const logo = group.logoAsset ?? {};
  if (!hasText(logo.src) || !String(logo.src).startsWith("/logos/")) {
    addError(`${groupPath}.logoAsset.src`, "must point to /logos/<file>");
  } else {
    try {
      await access(join(rootDir, "public", logo.src));
    } catch {
      addError(`${groupPath}.logoAsset.src`, `file not found: public${logo.src}`);
    }
  }
  if (!["wide", "compact", "square"].includes(logo.slot)) {
    addError(`${groupPath}.logoAsset.slot`, "must be wide, compact, or square");
  }
  if (!hasText(logo.source)) {
    addError(`${groupPath}.logoAsset.source`, "must describe source/provenance");
  }
  if (!hasText(logo.licenseNote)) {
    addError(`${groupPath}.logoAsset.licenseNote`, "must describe usage/licensing caveat");
  }

  if (!Array.isArray(group.companies) || group.companies.length === 0) {
    addError(`${groupPath}.companies`, "must contain at least one representative company");
    continue;
  }

  const companyIds = group.companies.map((company) => company.id);
  for (const duplicate of duplicateValues(companyIds)) {
    addError(`${groupPath}.companies`, `duplicate company id '${duplicate}'`);
  }

  const representative = group.companies.find((company) => company.id === group.defaultCompanyId);
  if (!representative) {
    addError(`${groupPath}.defaultCompanyId`, "must reference a configured company");
  } else if (!representative.listed) {
    addWarning(`${groupPath}.defaultCompanyId`, "representative company is not listed; market routing may fall back");
  }

  const localKrxCodes = [];
  for (const [companyIndex, company] of group.companies.entries()) {
    const companyPath = `${groupPath}.companies[${companyIndex}](${company.id ?? "missing-id"})`;
    for (const field of requiredCompanyFields) {
      if (company[field] === undefined || company[field] === null) {
        addError(`${companyPath}.${field}`, "is required");
      }
    }
    if (!Array.isArray(company.aliases)) {
      addError(`${companyPath}.aliases`, "must be an array");
    }
    if (company.listed) {
      if (!hasText(company.krxCode)) addError(`${companyPath}.krxCode`, "listed company needs KRX code");
      if (!hasText(company.yahooTicker)) addError(`${companyPath}.yahooTicker`, "listed company needs Yahoo ticker");
      if (!hasText(company.dartCode)) {
        addWarning(`${companyPath}.dartCode`, "missing DART corp code; acceptable only for seed-unverified profiles");
      }
      localKrxCodes.push(company.krxCode);
    }
  }

  for (const duplicate of duplicateValues(localKrxCodes)) {
    addError(`${groupPath}.companies`, `duplicate KRX code '${duplicate}'`);
  }
}

if (warnings.length > 0) {
  console.log("Template warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Template validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Template validation passed: ${config.groups.length} target profiles checked.`);
