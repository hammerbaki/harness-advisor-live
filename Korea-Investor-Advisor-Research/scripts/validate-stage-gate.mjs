import { access } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];
const infos = [];

const requiredDocs = [
  "PROJECT_CONTEXT.md",
  "docs/11_traceable_demo_architecture.md",
  "docs/13_group_company_template.md",
  "docs/15_reference_slice_expansion_pipeline.md",
  "docs/16_prompt_to_code_and_llm_wiki.md",
  "docs/20_source_selection_policy.md",
  "docs/22_client_source_request_protocol.md",
  "docs/23_hanwha_source_backed_claims.md",
  "docs/24_pre_api_stage_gate.md",
  "docs/25_hanwha_frozen_evaluation.md",
  "docs/26_frozen_scenarios_and_client_questions.md",
  "docs/27_original_poc_enrichment_audit.md",
  "docs/28_advisor_autoresearch_loop.md",
  "docs/29_prompt_to_code_migration_audit.md",
  "docs/30_poc_stage_distinction.md",
  "docs/31_llm_programming_framework_selection.md",
  "docs/32_answer_generation_process_trace.md",
  "docs/33_live_llm_output_contract.md",
  "docs/34_paper_draft.md",
  "docs/38_agent_quality_management_strategy.md",
  "docs/41_samsung_source_backed_seed_claims.md",
  "docs/42_samsung_url_and_narrative_claim_readiness.md",
  "docs/43_hanwha_to_samsung_transfer_audit.md",
  "docs/44_sk_transfer_readiness_plan.md",
  "docs/45_sk_dart_financial_table.md",
  "docs/46_hanwha_company_scope_and_backfill_resolution.md",
  "docs/47_sk_source_inventory_and_ingestion.md",
  "docs/48_sk_narrative_claim_queue.md",
  "docs/49_sk_source_backed_narrative_claims.md",
  "docs/50_sk_reference_slice_evaluation.md",
  "docs/51_latency_hardening_and_measurement.md",
  "docs/52_hyundai_motor_source_request.md",
  "docs/53_group_onboarding_standard.md",
  "docs/54_hyundai_motor_dart_financial_table.md",
  "docs/55_hyundai_motor_narrative_claim_queue.md",
  "docs/56_hyundai_motor_source_backed_financial_seed.md",
  "docs/60_lg_dart_financial_table.md",
  "docs/61_lg_source_backed_financial_seed.md",
  "docs/62_lg_financial_seed_and_reference_slice.md",
  "docs/67_group_data_completion_audit.md",
  "configs/source-selection-policy.json",
  "configs/client-source-request-template.json",
  "configs/document-url-intake-schema.json",
  "configs/group-onboarding-template.json",
  "configs/sk-narrative-claim-seeds.json",
  "evals/scenarios/hanwha.reference-slice.json",
  "evals/scenarios/sk.reference-slice.json",
  "evals/scenarios/hyundai-motor.reference-slice.json",
  "evals/scenarios/lg.reference-slice.json",
  "evals/rubrics/advisor.answer-quality.v0.1.json",
  "evals/rubrics/advisor.answer-quality.v0.2.json",
  "evals/results/hanwha.reference-slice.2026-05-01.json",
  "evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json",
  "evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json",
  "evals/dashboard/agent-dog.paper-seed.2026-05-02.json",
  "evals/dashboard/agent-dog.sk-reference-slice.2026-05-03.json",
  "evals/dashboard/advisor-latency-baseline.2026-05-03.json",
  "evals/dashboard/advisor-latency-optimized.2026-05-03.json",
  "raw/manifests/prompt-control-plane-audit.json",
  "raw/manifests/llm-framework-selection.json",
  "raw/manifests/llm-output-contract.json",
  "raw/manifests/samsung.document-url-intake.json",
  "raw/manifests/samsung.source-intake-template.json",
  "raw/manifests/samsung.dart-filing-extraction-report.json",
  "raw/manifests/samsung.narrative-claim-queue.json",
  "raw/manifests/sk.source-intake-template.json",
  "raw/manifests/sk.local-sources.json",
  "raw/manifests/sk.extraction-report.json",
  "raw/manifests/sk.narrative-claim-queue.json",
  "raw/manifests/hanwha.source-intake-template.json",
  "raw/manifests/hyundai-motor.identifier-verification.json",
  "raw/manifests/hyundai-motor.source-intake-template.json",
  "raw/manifests/lg.identifier-verification.json",
  "raw/manifests/lg.source-intake-template.json",
  "raw/manifests/lg.dart-financial-table.2022-2024.json",
  "raw/manifests/group-data-completion-audit.json"
];

const requiredEnvKeys = [
  "DART_API_KEY",
  "KRX_API_KEY",
  "NAVER_CLIENT_ID",
  "NAVER_CLIENT_SECRET",
  "ANTHROPIC_API_KEY"
];

const runtimePromptBlocks = [
  "prompts/advisor-role.md",
  "prompts/evidence-policy.md",
  "prompts/output-style.md"
];

function addError(path, message) {
  errors.push(`${path}: ${message}`);
}

function addWarning(path, message) {
  warnings.push(`${path}: ${message}`);
}

function addInfo(message) {
  infos.push(message);
}

async function canAccess(path) {
  try {
    await access(join(rootDir, path));
    return true;
  } catch {
    return false;
  }
}

function wordCount(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean).length;
}

function parseJson(path) {
  return JSON.parse(readFileSyncUtf8(path));
}

function readFileSyncUtf8(path) {
  return readFileSync(join(rootDir, path), "utf8");
}

function validateClaimCompanyScope(group, claimsPath, claimManifest) {
  const validCompanyIds = new Set((group.companies ?? []).map((company) => company.id));
  for (const [index, record] of (claimManifest.records ?? []).entries()) {
    const recordPath = `${claimsPath}.records[${index}](${record.id ?? "missing-id"})`;
    if (!record.companyId) {
      addError(recordPath, "runtime-promoted source-backed claim must include companyId");
    } else if (!validCompanyIds.has(record.companyId)) {
      addError(recordPath, `companyId '${record.companyId}' is not defined in configs/groups.json`);
    }
    if (!record.companyScope) {
      addError(recordPath, "runtime-promoted source-backed claim must include companyScope");
    }
  }
}

for (const doc of requiredDocs) {
  if (!await canAccess(doc)) addError(doc, "required stage-gate artifact is missing");
}

const projectContext = readFileSyncUtf8("PROJECT_CONTEXT.md");
for (const requiredPhrase of [
  "public-data strategic investment advisor",
  "Hanwha remains the reference slice",
  "traceable research PoC",
  "DSPy is selected",
  "advisor-llm-output-contract.v0.1",
  "docs/34_paper_draft.md",
  "Agent Dog quality management",
  "answerAssembly",
  "Claims become runtime-eligible only after claim-level source linking"
]) {
  if (!projectContext.includes(requiredPhrase)) {
    addWarning("PROJECT_CONTEXT.md", `missing context phrase: ${requiredPhrase}`);
  }
}

const envExample = existsSync(join(rootDir, ".env.example"))
  ? readFileSyncUtf8(".env.example")
  : "";
for (const key of requiredEnvKeys) {
  if (!envExample.includes(`${key}=`)) {
    addWarning(".env.example", `missing optional live credential placeholder ${key}`);
  }
}

let totalPromptWords = 0;
for (const promptPath of runtimePromptBlocks) {
  if (!await canAccess(promptPath)) {
    addError(promptPath, "runtime prompt block is missing");
    continue;
  }
  const words = wordCount(readFileSyncUtf8(promptPath));
  totalPromptWords += words;
  if (words > 90) {
    addWarning(promptPath, `prompt block has ${words} words; keep runtime prompts short`);
  }
}
if (totalPromptWords > 220) {
  addWarning("prompts/", `runtime prompt bundle has ${totalPromptWords} words; move deterministic behavior into code`);
} else {
  addInfo(`runtime prompt bundle: ${totalPromptWords} words`);
}

const groupsConfig = parseJson("configs/groups.json");
const groups = Array.isArray(groupsConfig.groups) ? groupsConfig.groups : [];
let referenceSliceCount = 0;
let sourceReadyCount = 0;
let plannedCount = 0;
for (const group of groups) {
  const groupId = group.id;
  const groupPath = `groups.${groupId}`;
  const baseManifestPath = `raw/manifests/${groupId}.json`;
  const wikiOverviewPath = `wiki/${group.wikiNamespace}/overview.md`;

  if (!existsSync(join(rootDir, baseManifestPath))) {
    addError(baseManifestPath, "group base manifest is required for expansion template consistency");
  }
  if (!existsSync(join(rootDir, wikiOverviewPath))) {
    addError(wikiOverviewPath, "wiki overview is required for every target group");
  }

  if (group.status === "reference-slice") {
    referenceSliceCount += 1;
    const requiredReferenceArtifacts = [
      `raw/manifests/${groupId}.local-sources.json`,
      `raw/manifests/${groupId}.source-provenance.json`,
      `raw/manifests/${groupId}.selection-rationale.json`,
      `raw/manifests/${groupId}.extraction-report.json`,
      `raw/manifests/${groupId}.claim-candidates.json`,
      `raw/manifests/${groupId}.source-backed-claims.json`
    ];
    for (const artifact of requiredReferenceArtifacts) {
      if (!existsSync(join(rootDir, artifact))) {
        addError(artifact, "reference slice must keep the full source-to-claim chain");
      }
    }
    const claimsPath = `raw/manifests/${groupId}.source-backed-claims.json`;
    if (existsSync(join(rootDir, claimsPath))) {
      const claimManifest = parseJson(claimsPath);
      const count = Array.isArray(claimManifest.records) ? claimManifest.records.length : 0;
      if (count === 0) addError(claimsPath, "reference slice needs at least one source-backed runtime claim");
      else addInfo(`${groupId}: ${count} source-backed claims`);
      validateClaimCompanyScope(group, claimsPath, claimManifest);
    }
  } else if (group.status === "source-ready") {
    sourceReadyCount += 1;
    const financialSeedOnly = group.sourceStatus === "financial-source-backed-seed";
    const requiredSourceReadyArtifacts = financialSeedOnly
      ? [
          `raw/manifests/${groupId}.identifier-verification.json`,
          `raw/manifests/${groupId}.dart-financial-table.2022-2024.json`,
          `raw/manifests/${groupId}.source-backed-claims.json`,
          `evals/scenarios/${groupId}.reference-slice.json`
        ]
      : [
          `raw/manifests/${groupId}.source-backed-claims.json`,
          `raw/manifests/${groupId}.local-sources.json`,
          `raw/manifests/${groupId}.extraction-report.json`,
          `raw/manifests/${groupId}.narrative-claim-queue.json`
        ];
    for (const artifact of requiredSourceReadyArtifacts) {
      if (!existsSync(join(rootDir, artifact))) {
        addError(artifact, "source-ready profile must keep the common source extraction and source-backed claim chain");
      }
    }
    const listedMissingDart = group.companies
      .filter((company) => company.listed && !company.dartCode)
      .map((company) => company.koreanName);
    if (listedMissingDart.length > 0) {
      addWarning(groupPath, `source-ready profile missing DART corp codes: ${listedMissingDart.join(", ")}`);
    }
    const claimsPath = `raw/manifests/${groupId}.source-backed-claims.json`;
    if (existsSync(join(rootDir, claimsPath))) {
      const claimManifest = parseJson(claimsPath);
      const count = Array.isArray(claimManifest.records) ? claimManifest.records.length : 0;
      if (count === 0) addError(claimsPath, "source-ready profile needs at least one source-backed runtime claim");
      else addInfo(`${groupId}: source-ready profile has ${count} source-backed seed claims`);
      validateClaimCompanyScope(group, claimsPath, claimManifest);
    }
    if (financialSeedOnly) {
      addInfo(`${groupId}: financial-source-backed-seed profile does not require local IR inventory until narrative intake begins`);
      continue;
    }
    const narrativeQueuePath = `raw/manifests/${groupId}.narrative-claim-queue.json`;
    if (existsSync(join(rootDir, narrativeQueuePath))) {
      const queue = parseJson(narrativeQueuePath);
      if ((queue.totals?.blockedBeforeClaimReview ?? 0) > 0) {
        addWarning(narrativeQueuePath, "source-ready narrative queue still has blocked themes");
      }
      addInfo(`${groupId}: ${queue.totals?.readyForHumanClaimReview ?? 0} narrative theme(s) ready for human claim review`);
    }
  } else {
    plannedCount += 1;
    const listedMissingDart = group.companies
      .filter((company) => company.listed && !company.dartCode)
      .map((company) => company.koreanName);
    if (listedMissingDart.length > 0) {
      addWarning(groupPath, `planned profile missing DART corp codes: ${listedMissingDart.join(", ")}`);
    }
    const claimsPath = `raw/manifests/${groupId}.source-backed-claims.json`;
    if (!existsSync(join(rootDir, claimsPath))) {
      addInfo(`${groupId}: planned profile has no source-backed claims yet`);
    } else {
      const claimManifest = parseJson(claimsPath);
      const count = Array.isArray(claimManifest.records) ? claimManifest.records.length : 0;
      addInfo(`${groupId}: planned profile has ${count} source-backed seed claims`);
      validateClaimCompanyScope(group, claimsPath, claimManifest);
    }
  }
}

if (referenceSliceCount !== 1) {
  addWarning("configs/groups.json", `expected exactly one reference slice at this stage; found ${referenceSliceCount}`);
}
if (plannedCount < 1) {
  addInfo("configs/groups.json: no planned expansion groups found; current five-group set is active or reference-scoped");
}

if (warnings.length > 0) {
  console.log("Stage-gate warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (infos.length > 0) {
  console.log("Stage-gate notes:");
  for (const info of infos) console.log(`- ${info}`);
}

if (errors.length > 0) {
  console.error("Stage-gate validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Stage-gate validation passed: ${groups.length} target profiles checked for source-backed live-runtime readiness.`);
