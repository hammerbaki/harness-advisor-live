import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const errors = [];
const warnings = [];

const inventory = await readJson("raw/manifests/hanwha.local-sources.json");
const officialScan = await readJson("raw/manifests/hanwha.official-site-scan.json");
const provenance = await readJson("raw/manifests/hanwha.source-provenance.json");
const selectionRationale = await readJson("raw/manifests/hanwha.selection-rationale.json");
const backfillPlan = await readJson("raw/manifests/hanwha.official-backfill-plan.json");
const extraction = await readJson("raw/manifests/hanwha.extraction-report.json");
const claims = await readJson("raw/manifests/hanwha.claim-candidates.json");
const sourceBackedClaims = await readJson("raw/manifests/hanwha.source-backed-claims.json");
const sourceSelectionPolicy = await readJson("configs/source-selection-policy.json");
const gitignore = await readFile(join(rootDir, ".gitignore"), "utf8");
const allPolicyRuleIds = new Set([
  ...(sourceSelectionPolicy.scopePrinciples ?? []).map((rule) => rule.id),
  ...(sourceSelectionPolicy.selectionRules ?? []).map((rule) => rule.id)
]);

if (inventory.groupId !== "hanwha") addError("inventory", "groupId must be hanwha");
if (inventory.totals.files < 1) addError("inventory", "must contain local source candidates");
if ((inventory.totals.byRole?.official_issuer ?? 0) < 1) addError("inventory", "must identify official issuer sources");
if ((inventory.totals.byRole?.third_party_analyst ?? 0) < 1) {
  addWarning("inventory", "no analyst sources identified; secondary market-view separation may be untested");
}
if ((inventory.totals.byDecision?.["metadata-and-short-notes-only"] ?? 0) !== (inventory.totals.byRole?.third_party_analyst ?? 0)) {
  addError("inventory", "all analyst reports should be metadata-and-short-notes-only");
}

if (officialScan.groupId !== "hanwha") addError("official-site-scan", "groupId must be hanwha");
if (officialScan.totals.downloadsFound < inventory.totals.files) {
  addWarning(
    "official-site-scan",
    "Hanwha inventory now includes affiliate source packages beyond the Hanwha Corp official IR root"
  );
}
if (officialScan.totals.downloadsMissingLocal > 0) {
  addWarning(
    "official-site-scan",
    `${officialScan.totals.downloadsMissingLocal} official download(s) are absent locally; scope must be declared`
  );
}
if (provenance.groupId !== "hanwha") addError("source-provenance", "groupId must be hanwha");
if (provenance.totals.localUnmatchedOfficial > 0) {
  addWarning(
    "source-provenance",
    `${provenance.totals.localUnmatchedOfficial} local source(s) need affiliate-level public URL reconciliation`
  );
}

if (selectionRationale.groupId !== "hanwha") addError("selection-rationale", "groupId must be hanwha");
if (selectionRationale.selectionPolicyVersion !== sourceSelectionPolicy.policyVersion) {
  addError("selection-rationale", "selection policy version must match configs/source-selection-policy.json");
}
if (selectionRationale.totals?.localSources !== inventory.totals.files) {
  addError("selection-rationale", "must contain one rationale record for each local source");
}
const rationaleIds = new Set((selectionRationale.records ?? []).map((record) => record.manifestId));
for (const entry of inventory.entries) {
  if (!rationaleIds.has(entry.id)) addError("selection-rationale", `missing rationale for ${entry.id}`);
}
const policyRuleIds = new Set((sourceSelectionPolicy.selectionRules ?? []).map((rule) => rule.id));
for (const record of selectionRationale.records ?? []) {
  if (!Array.isArray(record.selectionRuleIds) || record.selectionRuleIds.length === 0) {
    addError("selection-rationale", `${record.manifestId} must include at least one selectionRuleId`);
  }
  for (const ruleId of record.selectionRuleIds ?? []) {
    if (!policyRuleIds.has(ruleId)) addError("selection-rationale", `${record.manifestId} references unknown rule ${ruleId}`);
  }
}
if ((selectionRationale.totals?.officialProvenanceMatched ?? 0) !== provenance.totals.localMatchedOfficial) {
  addError("selection-rationale", "official provenance match count should align with source-provenance");
}

if (backfillPlan.groupId !== "hanwha") addError("official-backfill-plan", "groupId must be hanwha");
if (backfillPlan.selectionPolicyVersion !== sourceSelectionPolicy.policyVersion) {
  addError("official-backfill-plan", "selection policy version must match configs/source-selection-policy.json");
}
if (backfillPlan.totals?.missingOfficialDownloads !== officialScan.totals.downloadsMissingLocal) {
  addError("official-backfill-plan", "missing official download count must align with the latest official scan");
}
const localBackfillCount = inventory.entries.filter((entry) => entry.localPath.includes("_official_backfill")).length;
if ((backfillPlan.totals?.localBackfillSources ?? 0) !== localBackfillCount) {
  addError("official-backfill-plan", "local backfill source count must align with inventory");
}
if ((backfillPlan.totals?.byDecision?.["download-now"] ?? 0) > 0) {
  addWarning("official-backfill-plan", "some official downloads are still marked download-now");
}

if (extraction.groupId !== "hanwha") addError("extraction", "groupId must be hanwha");
if (!extraction.textOutputIncluded && !gitignore.includes("raw/extracted/")) {
  addError(".gitignore", "raw/extracted/ must remain ignored for private full-text review output");
}
if (extraction.totals.candidates !== extraction.totals.ok) {
  addError("extraction", "all official PDF extraction candidates should extract successfully before claim promotion");
}
if (extraction.totals.error > 0) addError("extraction", "extraction errors must be reviewed");
if (extraction.skipped.thirdPartyAnalyst !== (inventory.totals.byRole?.third_party_analyst ?? 0)) {
  addError("extraction", "third-party analyst skip count must match inventory");
}

if (claims.groupId !== "hanwha") addError("claims", "groupId must be hanwha");
if (claims.totals.candidates < 1) addError("claims", "must contain claim candidates");
if (claims.totals.byVerificationState?.needs_source_link !== claims.totals.candidates) {
  addError("claims", "all old-RAG claim candidates must remain needs_source_link until reviewed");
}

const targetPages = new Set(claims.candidates.map((candidate) => candidate.suggestedWikiTarget));
for (const targetPage of targetPages) {
  if (!existsSync(join(rootDir, targetPage))) addError(targetPage, "missing wiki target page for claim candidates");
}

const emptyHintCount = claims.candidates.filter((candidate) => candidate.sourceHints.length === 0).length;
if (emptyHintCount > 0) {
  addWarning("claims", `${emptyHintCount} claim candidate(s) still need source-hint enrichment`);
}

if (sourceBackedClaims.groupId !== "hanwha") addError("source-backed-claims", "groupId must be hanwha");
if (sourceBackedClaims.selectionPolicyVersion !== sourceSelectionPolicy.policyVersion) {
  addError("source-backed-claims", "selection policy version must match configs/source-selection-policy.json");
}
if ((sourceBackedClaims.totals?.claims ?? 0) < 1) {
  addError("source-backed-claims", "must contain at least one reviewed source-backed seed claim");
}
if (sourceBackedClaims.totals?.byVerificationState?.source_backed_seed !== sourceBackedClaims.totals?.claims) {
  addError("source-backed-claims", "all promoted claims must be source_backed_seed");
}

const provenanceIds = new Set((provenance.localSources ?? []).map((source) => source.manifestId));
const extractionIds = new Set((extraction.results ?? []).map((source) => source.manifestId));
for (const record of sourceBackedClaims.records ?? []) {
  if (!record.id) addError("source-backed-claims", "each promoted claim must have an id");
  if (!record.claimText || !record.claimTextSha256) addError(record.id, "missing claimText or claimTextSha256");
  if (record.verificationState !== "source_backed_seed") addError(record.id, "invalid verification state");
  if (!provenanceIds.has(record.sourceManifestId)) addError(record.id, "sourceManifestId is not in source provenance");
  if (!extractionIds.has(record.sourceManifestId)) addError(record.id, "sourceManifestId is not in extraction report");
  if (!existsSync(join(rootDir, record.targetWikiPage ?? ""))) addError(record.id, "target wiki page is missing");
  if (!record.officialSource?.sourcePageUrl && !record.officialSource?.downloadUrl) {
    addError(record.id, "missing official source URL or download URL");
  }
  if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
    addError(record.id, "missing extraction evidence locations");
  }
  for (const ruleId of record.sourceRuleIds ?? []) {
    if (!allPolicyRuleIds.has(ruleId)) addError(record.id, `unknown source rule ${ruleId}`);
  }
}

if (warnings.length > 0) {
  console.log("Hanwha ingestion warnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (errors.length > 0) {
  console.error("Hanwha ingestion validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Hanwha ingestion validation passed: ${inventory.totals.files} local files, ` +
    `${extraction.totals.ok}/${extraction.totals.candidates} PDF extractions, ` +
    `${claims.totals.candidates} claim candidates.`
);

async function readJson(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) {
    addError(relativePath, "missing required ingestion artifact");
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
