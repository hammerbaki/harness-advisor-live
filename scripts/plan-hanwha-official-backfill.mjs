import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeRoot = resolve(
  process.env.HANWHA_KNOWLEDGE_DIR ?? join(rootDir, "..", "Knowledge Base", "hanhwa_knowledge")
);
const downloadEnabled = process.env.HANWHA_BACKFILL_DOWNLOAD === "1";
const scan = await readJson("raw/manifests/hanwha.official-site-scan.json");
const policy = await readJson("configs/source-selection-policy.json");
const inventory = existsSync(join(rootDir, "raw", "manifests", "hanwha.local-sources.json"))
  ? await readJson("raw/manifests/hanwha.local-sources.json")
  : { entries: [] };
const provenance = existsSync(join(rootDir, "raw", "manifests", "hanwha.source-provenance.json"))
  ? await readJson("raw/manifests/hanwha.source-provenance.json")
  : { localSources: [] };

const missing = scan.downloads.filter((download) => download.localMatchStatus === "missing-local-file");
const decisions = missing.map((download) => classifyMissingDownload(download));
const downloadNow = decisions.filter((decision) => decision.backfillDecision === "download-now");
const provenanceById = new Map((provenance.localSources ?? []).map((source) => [source.manifestId, source]));
const localBackfillSources = (inventory.entries ?? [])
  .filter((entry) => entry.localPath.includes("_official_backfill"))
  .map((entry) => ({
    manifestId: entry.id,
    title: entry.title,
    filename: entry.filename,
    localPath: entry.localPath,
    sha256: entry.sha256,
    sizeBytes: entry.sizeBytes,
    sourceCategory: entry.sourceCategory,
    inferredSourceRole: entry.inferredSourceRole,
    officialSource: provenanceById.get(entry.id)?.officialSource ?? null
  }));

if (downloadEnabled) {
  for (const decision of downloadNow) {
    await downloadDecision(decision);
  }
}

const output = {
  schemaVersion: "hanwha-official-backfill-plan.v0.1",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  selectionPolicyPath: "configs/source-selection-policy.json",
  selectionPolicyVersion: policy.policyVersion,
  sourceScanPath: "raw/manifests/hanwha.official-site-scan.json",
  knowledgeRoot: relative(rootDir, knowledgeRoot).normalize("NFC"),
  downloadEnabled,
  resolutionStatus:
    "remaining_missing_downloads_resolved_as_claim_driven_backlog_not_current_runtime_blocker",
  remainingMissingDownloadsAreBlockers: false,
  policy:
    "Only missing official downloads that materially improve the current reference slice are downloaded. Older archive material stays manifest-only until a claim or evaluation scenario requires it.",
  totals: {
    missingOfficialDownloads: decisions.length,
    byDecision: countBy(decisions, (decision) => decision.backfillDecision),
    byReason: countBy(decisions, (decision) => decision.backfillReasonCode),
    byExtension: countBy(decisions, (decision) => decision.extension),
    localBackfillSources: localBackfillSources.length,
    downloaded: decisions.filter((decision) => decision.downloadStatus === "downloaded").length,
    alreadyPresent: decisions.filter((decision) => decision.downloadStatus === "already-present").length,
    downloadErrors: decisions.filter((decision) => decision.downloadStatus === "error").length
  },
  localBackfillSources,
  decisions
};

await mkdir(join(rootDir, "raw", "manifests"), { recursive: true });
await writeFile(
  join(rootDir, "raw", "manifests", "hanwha.official-backfill-plan.json"),
  `${JSON.stringify(output, null, 2)}\n`
);
await writeFile(join(rootDir, "docs", "21_hanwha_official_backfill_plan.md"), renderMarkdown(output));

console.log(
  `Hanwha official backfill plan written: ${relative(rootDir, join(rootDir, "raw", "manifests", "hanwha.official-backfill-plan.json"))}`
);
console.log(
  `${output.totals.missingOfficialDownloads} missing official download(s), ` +
    `${output.totals.byDecision["download-now"] ?? 0} download-now, ` +
    `${output.totals.downloaded} downloaded, ${output.totals.downloadErrors} error(s).`
);

function classifyMissingDownload(download) {
  const target = targetFor(download);
  const base = {
    sourcePageUrl: download.sourcePageUrl,
    sourcePageTitle: download.sourcePageTitle,
    rowNumber: download.rowNumber,
    rowTitle: download.rowTitle,
    fileName: download.fileName,
    extension: download.extension,
    downloadUrl: download.downloadUrl,
    section: download.section,
    sourceKind: download.sourceKind,
    selectionPolicyVersion: policy.policyVersion,
    localTargetPath: target ? relative(rootDir, target).normalize("NFC") : null,
    downloadStatus: "not-requested"
  };

  if (download.extension !== "pdf") {
    return {
      ...base,
      backfillDecision: "defer-manifest-only",
      backfillReasonCode: "non-text-audio-or-media",
      selectionRuleIds: ["SRC-09"],
      rationale: "Do not download for the text-first knowledge base unless a transcript or voice-demo evaluation requires it."
    };
  }

  if (isCurrentSpinOffOrValueEvent(download)) {
    return {
      ...base,
      backfillDecision: "download-now",
      backfillReasonCode: "current-value-up-and-restructuring-core",
      selectionRuleIds: ["SRC-01", "SRC-06", "SRC-09", "SRC-10", "SRC-11"],
      rationale:
        "Download now because it is a current official investor-presentation source for the 2026 value-up, spin-off, and shareholder-value narrative."
    };
  }

  if (isCurrent2025Earnings(download)) {
    return {
      ...base,
      backfillDecision: "download-now",
      backfillReasonCode: "current-2025-earnings-sequence",
      selectionRuleIds: ["SRC-01", "SRC-05", "SRC-09", "SRC-10", "SRC-11"],
      rationale:
        "Download now because the local corpus already has 4Q25 earnings; Q1-Q3 2025 earnings complete the current-year trend needed for investor briefings."
    };
  }

  if (isGovernanceIssuerPolicy(download)) {
    return {
      ...base,
      backfillDecision: "download-now",
      backfillReasonCode: "governance-and-disclosure-baseline",
      selectionRuleIds: ["SRC-01", "SRC-07", "SRC-09", "SRC-10", "SRC-11"],
      rationale:
        "Download now because governance, disclosure, board, and committee rules are durable official baselines for governance-sensitive investor answers."
    };
  }

  if (isAnnualBaselineGap(download)) {
    return {
      ...base,
      backfillDecision: "download-now",
      backfillReasonCode: "five-year-annual-baseline-gap",
      selectionRuleIds: ["SRC-01", "SRC-02", "SRC-04", "SRC-09", "SRC-10", "SRC-11"],
      rationale:
        "Download now to complete a 2021-2025 annual business-report baseline for the Hanwha reference slice without pulling the entire historical archive."
    };
  }

  if (download.fileName.includes("기업지배구조 모범규준")) {
    return {
      ...base,
      backfillDecision: "defer-manifest-only",
      backfillReasonCode: "external-governance-standard-not-issuer-source",
      selectionRuleIds: ["SRC-08", "SRC-09"],
      rationale:
        "Keep manifest-only because it is an external governance standard, not Hanwha issuer evidence for company-specific claims."
    };
  }

  if (isOldArchiveMaterial(download)) {
    return {
      ...base,
      backfillDecision: "defer-claim-driven",
      backfillReasonCode: "older-archive-material",
      selectionRuleIds: ["SCOPE-02", "SRC-09", "SRC-11"],
      rationale:
        "Defer because older archive material should be downloaded only when a specific claim, scenario, or longitudinal evaluation requires it."
    };
  }

  return {
    ...base,
    backfillDecision: "defer-claim-driven",
    backfillReasonCode: "not-needed-for-current-reference-slice",
    selectionRuleIds: ["SCOPE-02", "SRC-09", "SRC-11"],
    rationale:
      "Defer because the current Hanwha reference slice can remain scoped until this document is needed by a claim or evaluation scenario."
  };
}

function targetFor(download) {
  if (download.extension !== "pdf") return null;
  const year = inferYear(download);
  const safeFileName = download.fileName.normalize("NFC");

  if (download.section.includes("기업지배구조") || download.section.includes("이사회") || download.section.includes("공시관리")) {
    return join(knowledgeRoot, "_official_backfill", "Governance", safeFileName);
  }
  if (download.sourceKind === "official_periodic_report") {
    return join(knowledgeRoot, "_official_backfill", String(year ?? "Unknown_Year"), "Periodic_Reports", safeFileName);
  }
  if (download.sourceKind === "official_ir_material" || download.sourceKind === "official_site_asset") {
    return join(knowledgeRoot, "_official_backfill", String(year ?? "Unknown_Year"), "IR_Materials", safeFileName);
  }
  if (download.sourceKind === "official_audit_report") {
    return join(knowledgeRoot, "_official_backfill", String(year ?? "Unknown_Year"), "Periodic_Reports", safeFileName);
  }
  return join(knowledgeRoot, "_official_backfill", String(year ?? "Unknown_Year"), "Other", safeFileName);
}

async function downloadDecision(decision) {
  if (!decision.localTargetPath) return;
  const targetPath = resolve(rootDir, decision.localTargetPath);
  await mkdir(resolve(targetPath, ".."), { recursive: true });

  if (existsSync(targetPath)) {
    const existing = await readFile(targetPath);
    decision.downloadStatus = "already-present";
    decision.sizeBytes = existing.byteLength;
    decision.sha256 = sha256(existing);
    return;
  }

  try {
    const response = await fetch(decision.downloadUrl, {
      headers: {
        "User-Agent": "enterprise-llm-agent-harness/0.1 official-backfill"
      }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength < 1024) throw new Error(`Downloaded file too small: ${buffer.byteLength} bytes`);
    await writeFile(targetPath, buffer);
    decision.downloadStatus = "downloaded";
    decision.sizeBytes = buffer.byteLength;
    decision.sha256 = sha256(buffer);
  } catch (error) {
    decision.downloadStatus = "error";
    decision.downloadError = error instanceof Error ? error.message : String(error);
  }
}

function isCurrentSpinOffOrValueEvent(download) {
  const text = `${download.rowTitle ?? ""} ${download.fileName}`;
  return /20260114|인적분할|기업가치|주주가치/u.test(text) && /기업설명회/u.test(text);
}

function isCurrent2025Earnings(download) {
  const text = `${download.rowTitle ?? ""} ${download.fileName}`;
  return /2025년 [123]분기 실적|[123]Q25 Earnings/u.test(text);
}

function isGovernanceIssuerPolicy(download) {
  const text = `${download.section} ${download.rowTitle ?? ""} ${download.fileName}`;
  if (/모범규준/u.test(text)) return false;
  return /공시 관리 규정|이사회 규정|감사위원회 규정|내부거래위원회 규정|사외이사후보|ESG위원회 규정|보상위원회 규정|기업지배구조헌장/u.test(text);
}

function isAnnualBaselineGap(download) {
  const text = `${download.rowTitle ?? ""} ${download.fileName}`;
  return /2021년 사업보고서|2022년 사업보고서/u.test(text);
}

function isOldArchiveMaterial(download) {
  const year = inferYear(download);
  return year !== null && year <= 2024;
}

function inferYear(download) {
  const text = `${download.rowTitle ?? ""} ${download.fileName} ${download.filePath ?? ""}`;
  const fullYear = text.match(/20\d{2}/u)?.[0];
  if (fullYear) return Number(fullYear);
  const shortYear = text.match(/(?:^|[^0-9])(\d{2})[년.]/u)?.[1];
  if (shortYear) return Number(`20${shortYear}`);
  return null;
}

function renderMarkdown(output) {
  const rows = output.decisions.map((decision) => [
    decision.backfillDecision,
    decision.backfillReasonCode,
    decision.fileName,
    decision.rowTitle ?? "",
    decision.selectionRuleIds.join(", "),
    decision.localTargetPath ?? "",
    decision.rationale
  ]);

  return `# Hanwha Official Backfill Plan

Audit date: 2026-05-01

## Decision

The official Hanwha IR scan found ${output.totals.missingOfficialDownloads}
official downloads that were not present in the local corpus. They should not
all be downloaded by default. The reference-slice policy is claim-driven:
download only the files that materially improve the current paper/demo/commercial
knowledge base.

Resolution status:

- remaining missing downloads are not a current runtime or paper blocker;
- each missing download is retained as manifest-level backlog with a per-file
  decision and rationale;
- a deferred file becomes required only when a promoted claim, frozen scenario,
  longitudinal evaluation, or commercial client scope explicitly needs it.

## Totals

- download-now: ${output.totals.byDecision["download-now"] ?? 0}
- defer-claim-driven: ${output.totals.byDecision["defer-claim-driven"] ?? 0}
- defer-manifest-only: ${output.totals.byDecision["defer-manifest-only"] ?? 0}
- local backfill sources now present: ${output.totals.localBackfillSources}
- downloaded this run: ${output.totals.downloaded}
- already present: ${output.totals.alreadyPresent}
- download errors: ${output.totals.downloadErrors}

## Download-Now Rationale

Download now is limited to:

- current 2025 earnings sequence needed to complement the existing 4Q25 file;
- 2026 investor presentation tied to value-up, spin-off, and shareholder value;
- durable governance, board, committee, and disclosure policy baselines;
- 2021-2022 annual business reports needed to complete a 2021-2025 annual baseline.

Older earnings decks, older periodic reports, older audit reports, MP3 files,
and old IR News remain manifest-only until a claim or evaluation scenario needs
them.

## Local Backfill Sources Now Present

| Source | Role | Category | Local path | Official page |
| --- | --- | --- | --- | --- |
${output.localBackfillSources
  .map((source) => `| ${[
    source.title,
    source.inferredSourceRole,
    source.sourceCategory,
    source.localPath,
    source.officialSource?.sourcePageUrl ?? ""
  ].map(markdownCell).join(" | ")} |`)
  .join("\n")}

## Per-Download Decision

| Decision | Reason | File | Row title | Rule IDs | Local target | Rationale |
| --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`).join("\n")}

## Source References

- \`raw/manifests/hanwha.official-site-scan.json\`
- \`configs/source-selection-policy.json\`
- \`raw/manifests/hanwha.official-backfill-plan.json\`
`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function markdownCell(value) {
  return String(value).replace(/\|/gu, "\\|").replace(/\n/gu, " ");
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}
