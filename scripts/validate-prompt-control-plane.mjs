import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const infos = [];

const manifestPath = "raw/manifests/prompt-control-plane-audit.json";
const manifest = readJson(manifestPath);

function readUtf8(relativePath) {
  return readFileSync(join(rootDir, relativePath), "utf8");
}

function readJson(relativePath) {
  return JSON.parse(readUtf8(relativePath));
}

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function addInfo(message) {
  infos.push(message);
}

function wordCount(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length;
}

function pathExists(relativePath) {
  return existsSync(join(rootDir, relativePath));
}

function asArray(value) {
  return Array.isArray(value) ? value : [value].filter(Boolean);
}

if (manifest.schemaVersion !== "prompt-control-plane-audit.v0.1") {
  addError(manifestPath, "schemaVersion must be prompt-control-plane-audit.v0.1");
}

const promptFiles = manifest.runtimePromptBudget?.promptFiles ?? [];
let totalPromptWords = 0;
const bannedPromptPatterns = [
  { label: "company fact: Hanwha", regex: /한화|Hanwha/u },
  { label: "company fact: Samsung", regex: /삼성|Samsung/u },
  { label: "company fact: SK", regex: /SK하이닉스|SK텔레콤/u },
  { label: "company fact: Hyundai", regex: /현대자동차|Hyundai/u },
  { label: "company fact: LG", regex: /LG전자|LG화학/u },
  { label: "old entity switch", regex: /ACTIVE_ENTITY/u },
  { label: "inline RAG", regex: /\bRAG\b|지식체계용/u },
  { label: "hidden related_questions tag", regex: /<\/?related_questions>/u },
  { label: "tool routing in prompt", regex: /DART|KRX|Naver|Yahoo/u }
];

for (const promptFile of promptFiles) {
  if (!pathExists(promptFile)) {
    addError(promptFile, "runtime prompt file missing");
    continue;
  }
  const text = readUtf8(promptFile);
  const words = wordCount(text);
  totalPromptWords += words;
  for (const pattern of bannedPromptPatterns) {
    if (pattern.regex.test(text)) {
      addError(promptFile, `runtime prompt contains banned control/fact pattern: ${pattern.label}`);
    }
  }
}

const maxBundleWords = manifest.runtimePromptBudget?.maxBundleWords ?? 220;
if (totalPromptWords > maxBundleWords) {
  addError("prompts/", `runtime prompt bundle has ${totalPromptWords} words; max is ${maxBundleWords}`);
} else {
  addInfo(`runtime prompt bundle: ${totalPromptWords}/${maxBundleWords} words`);
}

const entries = manifest.entries ?? [];
if (entries.length === 0) addError(manifestPath, "entries must not be empty");

const ids = new Set();
for (const entry of entries) {
  const entryPath = `${manifestPath}.entries.${entry.id ?? "missing-id"}`;
  if (!entry.id) addError(entryPath, "id is required");
  if (ids.has(entry.id)) addError(entryPath, "duplicate id");
  ids.add(entry.id);
  if (!entry.category) addError(entryPath, "category is required");
  if (!entry.decision) addError(entryPath, "decision is required");
  if (!entry.rationale || entry.rationale.length < 40) {
    addError(entryPath, "rationale must be specific and at least 40 characters");
  }

  if (entry.category === "code_owned") {
    for (const implementationPath of asArray(entry.implementation)) {
      const filePath = implementationPath.includes(".")
        ? implementationPath
        : asArray(entry.source).find((source) => typeof source === "string" && source.includes(".")) ?? "";
      if (filePath && !filePath.includes("(") && !pathExists(filePath)) {
        addError(entryPath, `implementation/source path missing: ${filePath}`);
      }
    }
  }

  if (entry.category === "wiki_or_manifest_owned") {
    for (const sourcePath of asArray(entry.source)) {
      if (!pathExists(sourcePath)) addError(entryPath, `source/wiki path missing: ${sourcePath}`);
    }
  }

  if (entry.category === "delete_or_archive") {
    for (const field of manifest.deletionStandard.requiredFieldsForDelete ?? []) {
      if (!entry[field] || (Array.isArray(entry[field]) && entry[field].length === 0)) {
        addError(entryPath, `delete_or_archive entry missing required field: ${field}`);
      }
    }
    if (!Array.isArray(entry.commercialRemovalBasis) || entry.commercialRemovalBasis.length < 2) {
      addError(entryPath, "delete_or_archive entry requires at least two commercialRemovalBasis values");
    }
    const allowedBasis = new Set(manifest.deletionStandard.removalBasisCategories ?? []);
    for (const basis of entry.commercialRemovalBasis ?? []) {
      if (!allowedBasis.has(basis)) addError(entryPath, `unknown removal basis: ${basis}`);
    }
    if (String(entry.pocWorkedBecause ?? "").length < 40) {
      addError(entryPath, "pocWorkedBecause must explain why the demo feature worked");
    }
    if (String(entry.replacement ?? "").length < 25) {
      addError(entryPath, "replacement must identify the runtime replacement");
    }
    if ((entry.evidence ?? []).length < 2) {
      addError(entryPath, "delete_or_archive entry requires at least two evidence artifacts");
    }
    for (const evidencePath of entry.evidence ?? []) {
      if (!pathExists(evidencePath)) {
        addWarning(entryPath, `evidence artifact not found locally: ${evidencePath}`);
      }
    }
  }
}

const categoryCounts = entries.reduce((acc, entry) => {
  acc[entry.category] = (acc[entry.category] ?? 0) + 1;
  return acc;
}, {});

for (const requiredCategory of ["prompt_keep", "code_owned", "wiki_or_manifest_owned", "delete_or_archive"]) {
  if (!categoryCounts[requiredCategory]) {
    addError(manifestPath, `missing category: ${requiredCategory}`);
  }
}

if (warnings.length > 0) {
  console.log("Prompt-control warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

for (const info of infos) console.log(`Prompt-control note: ${info}`);

if (errors.length > 0) {
  console.error("Prompt-control validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Prompt-control validation passed: ${entries.length} entries, categories ${Object.entries(categoryCounts)
    .map(([key, count]) => `${key}=${count}`)
    .join(", ")}.`
);
