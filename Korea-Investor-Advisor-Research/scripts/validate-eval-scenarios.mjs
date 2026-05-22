import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const scenarioDir = join(rootDir, "evals", "scenarios");
const config = readJson("configs/groups.json");
const errors = [];
const warnings = [];

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
}

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

const groups = new Map((config.groups ?? []).map((group) => [group.id, group]));
const files = readdirSync(scenarioDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

if (files.length === 0) {
  addError("evals/scenarios", "at least one frozen scenario file is required");
}

for (const file of files) {
  const relativePath = `evals/scenarios/${file}`;
  const scenarioSet = readJson(relativePath);
  const groupId = scenarioSet.groupId;
  const group = groups.get(groupId);
  if (!group) {
    addError(relativePath, `unknown groupId '${groupId}'`);
    continue;
  }

  const claimManifestPath = `raw/manifests/${groupId}.source-backed-claims.json`;
  let sourceBackedIds = new Set();
  try {
    const claimManifest = readJson(claimManifestPath);
    sourceBackedIds = new Set((claimManifest.records ?? []).map((record) => record.id));
  } catch {
    addWarning(relativePath, `${claimManifestPath} is missing; expectedClaimIds cannot be source-checked`);
  }

  if (scenarioSet.schemaVersion !== "advisor-eval-scenarios.v0.1") {
    addError(relativePath, "schemaVersion must be advisor-eval-scenarios.v0.1");
  }
  if (!hasText(scenarioSet.scenarioSetId)) {
    addError(relativePath, "scenarioSetId is required");
  }
  if (!Array.isArray(scenarioSet.runtimeAssumptions?.expectedTraceSteps)) {
    addError(relativePath, "runtimeAssumptions.expectedTraceSteps is required");
  }
  if (!Array.isArray(scenarioSet.scenarios) || scenarioSet.scenarios.length === 0) {
    addError(relativePath, "scenarios must contain at least one scenario");
    continue;
  }

  for (const duplicate of duplicateValues(scenarioSet.scenarios.map((scenario) => scenario.id))) {
    addError(relativePath, `duplicate scenario id '${duplicate}'`);
  }

  for (const [index, scenario] of scenarioSet.scenarios.entries()) {
    const scenarioPath = `${relativePath}.scenarios[${index}](${scenario.id ?? "missing-id"})`;
    if (!hasText(scenario.id)) addError(scenarioPath, "id is required");
    if (!hasText(scenario.question)) addError(scenarioPath, "question is required");
    if (!hasText(scenario.intent)) addError(scenarioPath, "intent is required");
    if (!hasText(scenario.paperTableBucket)) addError(scenarioPath, "paperTableBucket is required");
    if (!Array.isArray(scenario.expectedClaimIds) || scenario.expectedClaimIds.length === 0) {
      addError(scenarioPath, "expectedClaimIds must contain at least one source-backed claim id");
    }
    for (const claimId of scenario.expectedClaimIds ?? []) {
      if (!sourceBackedIds.has(claimId)) {
        addError(scenarioPath, `expected claim id '${claimId}' is not present in ${claimManifestPath}`);
      }
    }
    if (!Array.isArray(scenario.requiredAnswerSignals) || scenario.requiredAnswerSignals.length === 0) {
      addWarning(scenarioPath, "requiredAnswerSignals should define at least one answer-level check");
    }
  }
}

if (warnings.length > 0) {
  console.log("Evaluation scenario warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Evaluation scenario validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Evaluation scenario validation passed: ${files.length} scenario file(s) checked.`);
