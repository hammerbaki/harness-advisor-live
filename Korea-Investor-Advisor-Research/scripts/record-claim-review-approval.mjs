import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const proposalPath =
  process.env.CLAIM_REVIEW_PROPOSAL_IN ?? "raw/manifests/claim-review-proposals.json";
const outputPath =
  process.env.CLAIM_REVIEW_APPROVAL_OUT ?? "raw/manifests/claim-review-approval-record.json";
const docPath =
  process.env.CLAIM_REVIEW_APPROVAL_DOC ?? "docs/84_claim_review_approval_record.md";

const approval = {
  approvedBy: "project owner",
  approvedAt: new Date().toISOString(),
  approvalSource: "Codex chat instruction",
  approvalQuote:
    "현재 기준으로 승인해도 된다면 그렇게 진행하고 승인 근거를 남겨 줘.",
  approvalScope:
    "Approve the 25 claim-review proposal wordings and evidence locators for seed-config preparation. This approval does not by itself modify runtime source-backed claim manifests."
};

const proposals = await readJson(proposalPath);
const records = proposals.records ?? [];
const held = records.filter((record) => record.proposedDecision !== "approve_for_seed_review");
const missingEvidence = records.filter((record) => record.evidenceStatus !== "located");

if (records.length === 0) {
  throw new Error(`${proposalPath} has no records to approve`);
}
if (held.length > 0) {
  throw new Error(
    `Cannot record approval while held proposals remain: ${held
      .map((record) => `${record.groupId}/${record.companyId}`)
      .join(", ")}`
  );
}
if (missingEvidence.length > 0) {
  throw new Error(
    `Cannot record approval while evidence locators are missing: ${missingEvidence
      .map((record) => `${record.groupId}/${record.companyId}`)
      .join(", ")}`
  );
}

const approvedRecords = records.map((record) => ({
  candidateId: record.candidateId,
  approvalDecision: "approved_for_seed_config_preparation",
  groupId: record.groupId,
  companyId: record.companyId,
  koreanName: record.koreanName,
  claimType: record.claimType,
  approvedClaimText: record.proposedClaimText,
  forwardLooking: Boolean(record.forwardLooking),
  runtimeUsePolicy: record.runtimeUsePolicy,
  stalenessPolicy: record.stalenessPolicy,
  reviewSourceManifestId: record.reviewSourceManifestId ?? record.sourceManifestId,
  reviewSourceTitle: record.reviewSourceTitle ?? record.sourceTitle,
  reviewPublicDocumentUrl: record.reviewPublicDocumentUrl ?? record.publicDocumentUrl,
  reviewSourcePageUrl: record.reviewSourcePageUrl ?? record.sourcePageUrl,
  reviewEvidenceMarkdownPath: record.reviewEvidenceMarkdownPath ?? record.markdownPath,
  evidenceMatches: record.evidenceMatches,
  approvalBasis: [
    "User approved the current reviewer proposal wording in chat.",
    "Proposal decision is approve_for_seed_review.",
    "Every evidence needle is located in extracted markdown.",
    "Each row is company-scoped and retains runtimeUsePolicy, stalenessPolicy, and forward-looking metadata.",
    "Runtime promotion remains gated by group-specific source-backed claim validators."
  ],
  reviewerRationale: record.reviewerRationale,
  promotionBoundary: record.promotionBoundary
}));

const output = {
  schemaVersion: "claim-review-approval-record.v0.1",
  generatedAt: approval.approvedAt,
  inputProposal: proposalPath,
  approval,
  policy: {
    approvalBoundary:
      "This artifact records human approval of claim wording and evidence locators. It does not directly alter raw/manifests/*.source-backed-claims.json.",
    runtimePromotionBoundary:
      "Approved records may be converted into group-specific narrative seed configs only after duplicate checks, source-policy checks, evidence-hash checks, and promote validators pass.",
    customerUiBoundary:
      "Approval records, candidate IDs, evidence needles, and reviewer notes are research/development artifacts and must not appear in the customer UI."
  },
  totals: {
    records: approvedRecords.length,
    byGroup: countBy(approvedRecords, (record) => record.groupId),
    byClaimType: countBy(approvedRecords, (record) => record.claimType),
    forwardLooking: approvedRecords.filter((record) => record.forwardLooking).length,
    evidenceLocators: approvedRecords.reduce(
      (sum, record) => sum + (record.evidenceMatches ?? []).length,
      0
    )
  },
  records: approvedRecords
};

await writeJson(outputPath, output);
await writeMarkdown(docPath, renderDoc(output));

console.log(`Claim review approval record written: ${outputPath}`);
console.log(`Readable approval basis written: ${docPath}`);
console.log(`${output.totals.records} approved claim proposal(s) recorded.`);

async function readJson(path) {
  return JSON.parse(await readFile(join(rootDir, path), "utf8"));
}

async function writeJson(path, value) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeMarkdown(path, value) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, value, "utf8");
}

function renderDoc(output) {
  const lines = [
    "# Claim Review Approval Record",
    "",
    `Generated: ${output.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document records the user's approval of the 25 claim-review proposals. It fixes the approved wording, evidence locators, and approval basis before any runtime source-backed claim promotion.",
    "",
    "## Approval Statement",
    "",
    `- Approved by: ${output.approval.approvedBy}`,
    `- Approval source: ${output.approval.approvalSource}`,
    `- Approval quote: “${output.approval.approvalQuote}”`,
    `- Approval scope: ${output.approval.approvalScope}`,
    "",
    "## Approval Criteria",
    "",
    "- The row was already proposed as `approve_for_seed_review`.",
    "- All evidence needles resolve to extracted Markdown line locators.",
    "- The claim remains company-scoped and source-bounded.",
    "- Runtime policy, staleness policy, and forward-looking labels are preserved.",
    "- Runtime promotion is still blocked until group-specific validators pass.",
    "",
    "## Summary",
    "",
    `- Approved proposals: ${output.totals.records}`,
    `- Evidence locators: ${output.totals.evidenceLocators}`,
    `- Forward-looking rows: ${output.totals.forwardLooking}`,
    `- Groups: ${Object.entries(output.totals.byGroup)
      .map(([groupId, count]) => `${groupId} ${count}`)
      .join(", ")}`,
    "",
    "## Approved Rows",
    "",
    "| Group | Company | Claim type | Approved claim | Evidence locator | Runtime policy |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const record of output.records) {
    const evidence = (record.evidenceMatches ?? [])
      .map((match) =>
        match.found
          ? `${match.markdownPath}:${match.lineNumber}${match.pageHeading ? ` (${match.pageHeading})` : ""}`
          : `missing: ${match.needle}`
      )
      .join("<br>");
    lines.push(
      `| ${escapeMd(record.groupId)} | ${escapeMd(record.koreanName)}<br><code>${record.companyId}</code> | <code>${escapeMd(record.claimType)}</code> | ${escapeMd(record.approvedClaimText)} | ${escapeMd(evidence)} | <code>${escapeMd(record.runtimeUsePolicy)}</code> |`
    );
  }

  lines.push(
    "",
    "## Promotion Boundary",
    "",
    "- This approval record is a controlled bridge from review proposal to seed config.",
    "- It does not directly modify `raw/manifests/*.source-backed-claims.json`.",
    "- The next step is to generate or update group-specific narrative seed configs and run the relevant promote validators.",
    "",
    "## Machine Artifact",
    "",
    "- `raw/manifests/claim-review-approval-record.json`",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function escapeMd(value) {
  return String(value ?? "").replace(/\|/gu, "\\|").replace(/\n/gu, "<br>");
}

function countBy(records, keyFn) {
  return records.reduce((acc, record) => {
    const key = keyFn(record) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
