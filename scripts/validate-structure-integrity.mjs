import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const infos = [];
const allowMissingRawSources = process.env.ADVISOR_ALLOW_MISSING_RAW_SOURCES === "1";
const releaseMissingRawSourceCounts = new Map();

const groupsConfig = readJson("configs/groups.json");
const packageJson = readJson("package.json");
const groups = groupsConfig.groups ?? [];
const groupById = new Map(groups.map((group) => [group.id, group]));
const companyIdsByGroup = new Map(
  groups.map((group) => [group.id, new Set((group.companies ?? []).map((company) => company.id))])
);

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function addInfo(message) {
  infos.push(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(join(rootDir, path), "utf8"));
}

function tryReadJson(path) {
  const fullPath = join(rootDir, path);
  if (!existsSync(fullPath)) return null;
  return readJson(path);
}

function readText(path) {
  return readFileSync(join(rootDir, path), "utf8");
}

function relExists(path) {
  return existsSync(join(rootDir, path));
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

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidCompanyId(groupId, companyId) {
  return companyIdsByGroup.get(groupId)?.has(companyId) ?? false;
}

function isKnownIdentifierCompanyId(groupId, companyId) {
  const identifiers = tryReadJson(`raw/manifests/${groupId}.identifier-verification.json`);
  return Boolean((identifiers?.records ?? []).some((record) => record.companyId === companyId));
}

function parseFrontMatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  if (!match) return null;
  const frontMatter = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/gu, "");
    frontMatter[key] = value;
  }
  return frontMatter;
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function localInventorySchemaLevel(inventory) {
  const version = inventory?.schemaVersion ?? "";
  const match = version.match(/^local-source-inventory\.v0\.(\d+)$/u);
  return match ? Number(match[1]) : 0;
}

function isModernLocalInventory(inventory) {
  return localInventorySchemaLevel(inventory) >= 2;
}

function hasSupportNoteDecision(entry) {
  return entry.sourceRole === "research_support" || entry.processingDecision === "manifest-support-note";
}

function validateGroupConfig() {
  for (const duplicate of duplicateValues(groups.map((group) => group.id))) {
    addError("configs/groups.json", `duplicate group id '${duplicate}'`);
  }

  for (const group of groups) {
    const groupPath = `configs/groups.json:${group.id}`;
    const companyIds = (group.companies ?? []).map((company) => company.id);
    for (const duplicate of duplicateValues(companyIds)) {
      addError(groupPath, `duplicate company id '${duplicate}'`);
    }
    if (!isValidCompanyId(group.id, group.defaultCompanyId)) {
      addError(groupPath, `defaultCompanyId '${group.defaultCompanyId}' is not configured`);
    }
    if (!relExists(`wiki/${group.wikiNamespace}/overview.md`)) {
      addError(`wiki/${group.wikiNamespace}/overview.md`, "configured wiki overview is missing");
    }
    if (!relExists(`raw/manifests/${group.id}.json`)) {
      addError(`raw/manifests/${group.id}.json`, "base source manifest is missing");
    }
  }
}

function validateBaseManifests() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.json`;
    const manifest = tryReadJson(path);
    if (!manifest) continue;
    if (manifest.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    if (!hasText(manifest.schemaVersion)) addError(path, "schemaVersion is required");
    if (manifest.sourceStatus && manifest.sourceStatus !== group.sourceStatus) {
      addWarning(path, `sourceStatus '${manifest.sourceStatus}' differs from configs/groups.json '${group.sourceStatus}'`);
    }
  }
}

function validateIdentifierManifests() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.identifier-verification.json`;
    const manifest = tryReadJson(path);
    if (!manifest) continue;
    if (manifest.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    const records = manifest.records ?? [];
    for (const duplicate of duplicateValues(records.map((record) => record.companyId))) {
      addError(path, `duplicate identifier companyId '${duplicate}'`);
    }
    for (const [index, record] of records.entries()) {
      const recordPath = `${path}.records[${index}](${record.companyId ?? "missing-companyId"})`;
      if (!hasText(record.companyId)) addError(recordPath, "companyId is required");
      if (!hasText(record.krxCode) || !/^\d{6}$/u.test(record.krxCode)) {
        addError(recordPath, "krxCode must be a six-digit string");
      }
      if (!hasText(record.dartCode) || !/^\d{8}$/u.test(record.dartCode)) {
        addError(recordPath, "dartCode must be an eight-digit OpenDART corp code");
      }
      if (!isValidCompanyId(group.id, record.companyId) && String(record.status ?? "").includes("optional")) {
        addInfo(`${recordPath}: identifier exists as optional non-runtime expansion coverage`);
      } else if (!isValidCompanyId(group.id, record.companyId)) {
        addWarning(recordPath, "identifier exists outside configured runtime company list; acceptable only for optional second-wave coverage");
      }
    }
  }
}

function validateOnboardingTemplate() {
  const path = "configs/group-onboarding-template.json";
  const template = tryReadJson(path);
  if (!template) {
    addError(path, "missing group onboarding template");
    return;
  }
  for (const field of ["companyId", "companyScope"]) {
    if (!(template.promotionGate?.runtimeClaimRequiredFields ?? []).includes(field)) {
      addError(path, `promotion gate must require ${field}`);
    }
  }
  if ((template.promotionGate?.minimumFirstSliceClaims ?? 0) < 1) {
    addError(path, "promotionGate.minimumFirstSliceClaims must be positive");
  }
  for (const artifactGroup of Object.values(template.requiredArtifacts ?? {})) {
    if (!Array.isArray(artifactGroup) || artifactGroup.length === 0) {
      addError(path, "each requiredArtifacts stage must list at least one artifact");
    }
  }
}

function validateSourceIntakeTemplates() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.source-intake-template.json`;
    const template = tryReadJson(path);
    if (!template) continue;
    if (template.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    const requiredLedgerColumns = ["companyId", "local_file", "source_page_url", "title", "request_package", "selection_reason", "rights_level"];
    for (const column of requiredLedgerColumns) {
      if (!(template.ledgerColumns ?? []).includes(column)) addError(path, `ledgerColumns must include '${column}'`);
    }
    for (const company of template.firstSliceCompanies ?? []) {
      if (!isValidCompanyId(group.id, company.companyId)) {
        addError(path, `firstSlice companyId '${company.companyId}' is not configured in configs/groups.json`);
      }
    }
  }
}

function validateLocalSourceInventories() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.local-sources.json`;
    const inventory = tryReadJson(path);
    if (!inventory) continue;
    const modernInventory = isModernLocalInventory(inventory);
    if (inventory.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    const entries = inventory.entries ?? [];
    for (const duplicate of duplicateValues(entries.map((entry) => entry.id))) {
      addError(path, `duplicate local source id '${duplicate}'`);
    }
    if (group.status !== "planned" && entries.length === 0) {
      addError(path, `${group.status} group needs at least one local source entry`);
    }
    for (const [index, entry] of entries.entries()) {
      const entryPath = `${path}.entries[${index}](${entry.id ?? "missing-id"})`;
      if (entry.groupId !== group.id) addError(entryPath, `entry groupId must be '${group.id}'`);
      if (entry.companyId && !isValidCompanyId(group.id, entry.companyId) && !isKnownIdentifierCompanyId(group.id, entry.companyId)) {
        addError(entryPath, `unknown companyId '${entry.companyId}'`);
      }
      if (modernInventory && !entry.companyId && !hasSupportNoteDecision(entry)) {
        addWarning(entryPath, "missing companyId outside explicit support-note path");
      }
      if (entry.localPath && !relExists(entry.localPath) && allowMissingRawSources) {
        releaseMissingRawSourceCounts.set(group.id, (releaseMissingRawSourceCounts.get(group.id) ?? 0) + 1);
      } else if (entry.localPath && !relExists(entry.localPath)) {
        addError(entryPath, `localPath does not exist: ${entry.localPath}`);
      }
      if (modernInventory && entry.extension === "pdf" && typeof entry.isPdf !== "boolean") {
        addError(entryPath, "PDF entry must include boolean isPdf");
      }
      if (entry.processingDecision === "extract-to-markdown-and-wiki-candidate") {
        if (modernInventory && !entry.companyId) addError(entryPath, "extraction candidate must include companyId");
        if (modernInventory && entry.extension === "pdf" && entry.isPdf !== true) addError(entryPath, "PDF extraction candidate must be a valid PDF");
      }
    }
    if (!modernInventory) {
      addInfo(`${group.id}: legacy local inventory ${inventory.schemaVersion}; companyId/PDF-validity gates apply at promoted claim or regenerated inventory stage`);
    }
    if (allowMissingRawSources && releaseMissingRawSourceCounts.has(group.id)) {
      addInfo(`${group.id}: ${releaseMissingRawSourceCounts.get(group.id)} raw local source file(s) intentionally not packaged in release mode`);
    }
    addInfo(`${group.id}: local inventory entries ${entries.length}`);
  }
}

function validateExtractionReports() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.extraction-report.json`;
    const report = tryReadJson(path);
    if (!report) continue;
    if (report.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    const inventory = tryReadJson(`raw/manifests/${group.id}.local-sources.json`);
    const inventoryIds = new Set((inventory?.entries ?? []).map((entry) => entry.id));
    const results = report.results ?? [];
    for (const duplicate of duplicateValues(results.map((result) => result.manifestId))) {
      addError(path, `duplicate extraction manifestId '${duplicate}'`);
    }
    for (const [index, result] of results.entries()) {
      const resultPath = `${path}.results[${index}](${result.manifestId ?? "missing-manifestId"})`;
      if (result.groupId && result.groupId !== group.id) addError(resultPath, `result groupId must be '${group.id}'`);
      if (result.companyId && !isValidCompanyId(group.id, result.companyId) && !isKnownIdentifierCompanyId(group.id, result.companyId)) {
        addError(resultPath, `unknown companyId '${result.companyId}'`);
      }
      if (inventory && result.manifestId && !inventoryIds.has(result.manifestId)) {
        addWarning(resultPath, "manifestId not present in corresponding local-sources manifest");
      }
      if (result.extractionStatus === "ok" && !hasText(result.textSha256)) {
        addError(resultPath, "successful extraction must include textSha256");
      }
    }
    addInfo(`${group.id}: extraction results ${results.length}`);
  }
}

function validateClaimManifests() {
  for (const group of groups) {
    const path = `raw/manifests/${group.id}.source-backed-claims.json`;
    const manifest = tryReadJson(path);
    if (!manifest) continue;
    if (manifest.groupId !== group.id) addError(path, `groupId must be '${group.id}'`);
    const records = manifest.records ?? [];
    for (const duplicate of duplicateValues(records.map((record) => record.id))) {
      addError(path, `duplicate source-backed claim id '${duplicate}'`);
    }
    for (const [index, record] of records.entries()) {
      const recordPath = `${path}.records[${index}](${record.id ?? "missing-id"})`;
      for (const field of ["id", "groupId", "companyId", "companyScope", "claimType", "claimText", "sourceManifestId", "runtimeUsePolicy", "verificationState"]) {
        if (!hasText(record[field])) addError(recordPath, `missing required field '${field}'`);
      }
      if (record.groupId !== group.id) addError(recordPath, `record groupId must be '${group.id}'`);
      if (record.companyId && !isValidCompanyId(group.id, record.companyId)) {
        addError(recordPath, `companyId '${record.companyId}' is not configured for group`);
      }
      if (record.targetWikiPage && !relExists(record.targetWikiPage)) {
        addError(recordPath, `targetWikiPage does not exist: ${record.targetWikiPage}`);
      }
      if (record.claimTextSha256 && sha256(record.claimText) !== record.claimTextSha256) {
        addError(recordPath, "claimTextSha256 does not match claimText");
      }
      const hasEvidence =
        (Array.isArray(record.evidenceLocations) && record.evidenceLocations.length > 0) ||
        (Array.isArray(record.evidenceRecords) && record.evidenceRecords.length > 0) ||
        hasText(record.evidenceNeedle) ||
        Boolean(record.officialSource);
      if (!hasEvidence) addWarning(recordPath, "claim has no explicit evidenceLocations/evidenceRecords/evidenceNeedle/officialSource");
      if (record.runtimeUsePolicy.includes("forward_looking")) {
        const combined = `${record.claimText} ${record.reviewNote ?? ""}`;
        if (!/계획|목표|예정|가이던스|전망|전략|과제|중장기|확대|강화|구축|재편|진행|수주|공급계약|outlook|plan|forward|initiative|monitoring/iu.test(combined)) {
          addWarning(recordPath, "forward-looking runtime policy should be supported by explicit plan/outlook wording");
        }
      }
    }
    if ((manifest.totals?.claims ?? records.length) !== records.length) {
      addWarning(path, `totals.claims (${manifest.totals?.claims}) differs from records length (${records.length})`);
    }
    addInfo(`${group.id}: source-backed claims ${records.length}`);
  }
}

function validateScenarioCrossReferences() {
  const scenarioDir = join(rootDir, "evals", "scenarios");
  const files = readdirSync(scenarioDir).filter((file) => file.endsWith(".json")).sort();
  const groupsWithScenarios = new Set();
  for (const file of files) {
    const path = `evals/scenarios/${file}`;
    const scenarioSet = readJson(path);
    const group = groupById.get(scenarioSet.groupId);
    if (!group) {
      addError(path, `unknown groupId '${scenarioSet.groupId}'`);
      continue;
    }
    groupsWithScenarios.add(scenarioSet.groupId);
    const claims = tryReadJson(`raw/manifests/${scenarioSet.groupId}.source-backed-claims.json`);
    const claimIds = new Set((claims?.records ?? []).map((record) => record.id));
    for (const [index, scenario] of (scenarioSet.scenarios ?? []).entries()) {
      const scenarioPath = `${path}.scenarios[${index}](${scenario.id ?? "missing-id"})`;
      if (scenario.expectedRepresentativeCompanyId && !isValidCompanyId(scenarioSet.groupId, scenario.expectedRepresentativeCompanyId)) {
        addError(scenarioPath, `expectedRepresentativeCompanyId '${scenario.expectedRepresentativeCompanyId}' is not configured`);
      }
      for (const claimId of scenario.expectedClaimIds ?? []) {
        if (!claimIds.has(claimId)) addError(scenarioPath, `expectedClaimId '${claimId}' not found in source-backed claims`);
      }
    }
  }
  for (const group of groups.filter((target) => target.status === "reference-slice" || target.status === "source-ready")) {
    if (!groupsWithScenarios.has(group.id)) {
      addError(`evals/scenarios/${group.id}.reference-slice.json`, `${group.status} group should have at least one scenario file`);
    }
  }
}

function validateWikiCrossReferences() {
  for (const group of groups) {
    const overviewPath = `wiki/${group.wikiNamespace}/overview.md`;
    if (!relExists(overviewPath)) continue;
    const frontMatter = parseFrontMatter(readText(overviewPath));
    if (!frontMatter) {
      addError(overviewPath, "missing YAML front matter");
      continue;
    }
    if (frontMatter.group_id !== group.id) {
      addError(overviewPath, `front matter group_id must be '${group.id}'`);
    }
  }
}

function validatePackageScripts() {
  const requiredScripts = [
    "validate:structure",
    "validate:template",
    "validate:evals",
    "lint:wiki",
    "inventory:hyundai",
    "validate:hyundai-intake",
    "extract:hyundai",
    "financials:hyundai:dart",
    "claims:hyundai:narrative",
    "promote:hyundai",
    "wiki:hyundai",
    "eval:hyundai"
  ];
  for (const script of requiredScripts) {
    if (!packageJson.scripts?.[script]) addError("package.json", `missing script '${script}'`);
  }
}

validateGroupConfig();
validateBaseManifests();
validateIdentifierManifests();
validateOnboardingTemplate();
validateSourceIntakeTemplates();
validateLocalSourceInventories();
validateExtractionReports();
validateClaimManifests();
validateScenarioCrossReferences();
validateWikiCrossReferences();
validatePackageScripts();

if (warnings.length > 0) {
  console.log("Structure integrity warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (infos.length > 0) {
  console.log("Structure integrity notes:");
  for (const info of infos) console.log(`- ${info}`);
}

if (errors.length > 0) {
  console.error("Structure integrity validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Structure integrity validation passed: ${groups.length} group profiles checked.`);
