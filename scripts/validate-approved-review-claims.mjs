import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const approvalPath = "raw/manifests/claim-review-approval-record.json";
const promotionPath = "raw/manifests/review-approved-runtime-promotion.json";
const approval = await readJson(approvalPath);
const promotion = await readJson(promotionPath);
const groups = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const errors = [];

if (promotion.schemaVersion !== "review-approved-runtime-promotion.v0.1") {
  errors.push("promotion manifest has unexpected schemaVersion");
}
if (promotion.inputApproval !== approvalPath) {
  errors.push("promotion manifest must reference the approval record");
}
if (promotion.totals?.promotedRecords !== (approval.records ?? []).length) {
  errors.push("promoted record count must match approval record count");
}

const approvalByClaimText = new Map((approval.records ?? []).map((record) => [
  `${record.groupId}:${record.companyId}:${sha256(record.approvedClaimText)}`,
  record
]));

for (const groupId of groups) {
  const manifest = await readJson(`raw/manifests/${groupId}.source-backed-claims.json`);
  const reviewClaims = (manifest.records ?? []).filter(
    (record) => record.paperUseLevel === "source-backed-review-approved-claim"
  );
  const expectedCount = (approval.records ?? []).filter((record) => record.groupId === groupId).length;
  if (reviewClaims.length !== expectedCount) {
    errors.push(`${groupId}: expected ${expectedCount} review-approved claims, found ${reviewClaims.length}`);
  }
  const ids = new Set();
  for (const record of manifest.records ?? []) {
    if (ids.has(record.id)) errors.push(`${groupId}: duplicate claim id ${record.id}`);
    ids.add(record.id);
    if (record.claimTextSha256 && sha256(record.claimText) !== record.claimTextSha256) {
      errors.push(`${groupId}/${record.id}: claimTextSha256 mismatch`);
    }
  }
  for (const record of reviewClaims) {
    const approvalRecord = approvalByClaimText.get(
      `${record.groupId}:${record.companyId}:${record.claimTextSha256}`
    );
    if (!approvalRecord) {
      errors.push(`${groupId}/${record.id}: no matching approval record`);
      continue;
    }
    if (record.reviewApprovalArtifact !== approvalPath) {
      errors.push(`${groupId}/${record.id}: missing reviewApprovalArtifact`);
    }
    if (record.verificationState !== "source_backed_seed") {
      errors.push(`${groupId}/${record.id}: invalid verificationState`);
    }
    if (!record.officialSource?.sourcePageUrl && !record.officialSource?.downloadUrl) {
      errors.push(`${groupId}/${record.id}: missing official source URL`);
    }
    if (!record.sourceTextSha256) {
      errors.push(`${groupId}/${record.id}: missing sourceTextSha256`);
    }
    if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
      errors.push(`${groupId}/${record.id}: missing evidenceLocations`);
      continue;
    }
    for (const location of record.evidenceLocations) {
      if (!location.markdownPath || !location.lineNumber || !location.evidenceNeedleSha256) {
        errors.push(`${groupId}/${record.id}: incomplete evidence locator`);
      }
      if (location.sourceTextSha256 !== record.sourceTextSha256) {
        errors.push(`${groupId}/${record.id}: source text hash mismatch in evidence location`);
      }
      const matched = (approvalRecord.evidenceMatches ?? []).some((match) =>
        match.markdownPath === location.markdownPath && match.lineNumber === location.lineNumber
      );
      if (!matched) {
        errors.push(`${groupId}/${record.id}: evidence locator is not in approval record`);
      }
    }
  }
}

if (errors.length > 0) {
  console.error("Review-approved claim validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Review-approved claim validation passed: ${promotion.totals.promotedRecords} promoted claims across ${groups.length} groups.`
);

async function readJson(path) {
  return JSON.parse(await readFile(join(rootDir, path), "utf8"));
}

function sha256(value) {
  return createHash("sha256").update(String(value ?? "")).digest("hex");
}
