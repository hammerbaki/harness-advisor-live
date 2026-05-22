import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const now = new Date().toISOString();
const outputPath = join(rootDir, "raw", "manifests", "sk.source-backed-claims.json");
const docPath = join(rootDir, "docs", "49_sk_source_backed_narrative_claims.md");
const financialSeedPath = "raw/manifests/sk.source-backed-claims.json";
const narrativeSeedPath = "configs/sk-narrative-claim-seeds.json";
const extractionReportPath = "raw/manifests/sk.extraction-report.json";
const narrativeQueuePath = "raw/manifests/sk.narrative-claim-queue.json";
const identifierPath = "raw/manifests/sk.identifier-verification.json";

const existingManifest = await readJson(financialSeedPath);
const narrativeSeeds = await readJson(narrativeSeedPath);
const extractionReport = await readJson(extractionReportPath);
const narrativeQueue = await readJson(narrativeQueuePath);
const identifiers = await readJson(identifierPath);
const policy = await readJson("configs/source-selection-policy.json");

const knownPolicyRuleIds = new Set([
  ...(policy.scopePrinciples ?? []).map((rule) => rule.id),
  ...(policy.selectionRules ?? []).map((rule) => rule.id)
]);
const identifierByCompany = new Map((identifiers.records ?? []).map((record) => [record.companyId, record]));
const extractionByManifestId = new Map((extractionReport.results ?? []).map((result) => [result.manifestId, result]));

const financialRecords = (existingManifest.records ?? [])
  .filter((record) => record.paperUseLevel !== "source-backed-narrative-seed-claim")
  .map((record) => ({
    ...record,
    paperUseLevel: record.paperUseLevel ?? "eligible_for_transfer_slice_financial_baseline"
  }));

const nextSequence = Math.max(
  0,
  ...financialRecords.map((record) => Number(String(record.id ?? "").match(/(\d+)$/u)?.[1] ?? 0))
) + 1;

const narrativeRecords = [];
for (const [index, seed] of (narrativeSeeds.records ?? []).entries()) {
  narrativeRecords.push(await promoteNarrativeSeed(seed, nextSequence + index));
}

const records = [...financialRecords, ...narrativeRecords];
const output = {
  schemaVersion: "source-backed-claims.v0.1",
  groupId: "sk",
  generatedAt: now,
  selectionPolicyVersion: policy.policyVersion,
  source: {
    provider: "OpenDART plus official issuer IR documents",
    financialSourceManifest: "raw/manifests/sk.dart-financial-table.2022-2024.json",
    narrativeSourceManifest: extractionReportPath,
    apiKeyPolicy: "Provider API keys are loaded locally and omitted from this artifact."
  },
  inputArtifacts: {
    previousFinancialSeedManifest: financialSeedPath,
    narrativeClaimSeeds: narrativeSeedPath,
    extractionReport: extractionReportPath,
    narrativeClaimQueue: narrativeQueuePath,
    identifierVerification: identifierPath,
    sourceSelectionPolicy: "configs/source-selection-policy.json"
  },
  purpose:
    "SK source-backed seed claims for testing the Hanwha/Samsung advisor template transfer. Financial claims come from OpenDART; narrative claims are promoted only after public URL, extraction hash, evidence locator, company scope, and policy-rule validation.",
  policy:
    "Narrative claims are bounded review context. Forward-looking SK Hynix, SK Innovation, SK Inc., SK Telecom, and SK Square plan statements must be labeled as plans or management-stated direction in customer-facing answers and must not be converted into recommendations.",
  totals: {
    claims: records.length,
    financialSeedClaims: financialRecords.length,
    narrativeSeedClaims: narrativeRecords.length,
    narrativeQueueThemes: narrativeQueue.totals?.themes ?? narrativeQueue.totals?.records ?? 0,
    narrativeReadySources: narrativeQueue.totals?.readySourcesForEvidenceReview ?? narrativeQueue.totals?.readySources ?? 0,
    narrativeBlockedSources: narrativeQueue.totals?.blockedSources ?? narrativeQueue.totals?.blockedBeforeClaimReview ?? 0,
    byCompanyId: countBy(records, (record) => record.companyId),
    byClaimType: countBy(records, (record) => record.claimType),
    byRuntimeUsePolicy: countBy(records, (record) => record.runtimeUsePolicy),
    byPaperUseLevel: countBy(records, (record) => record.paperUseLevel)
  },
  records
};

validateOutput(output);
await writeJson(outputPath, output);
await writeFile(docPath, buildDoc(output), "utf8");

console.log(`SK source-backed claims written: ${relative(rootDir, outputPath)}`);
console.log(`Readable audit note written: ${relative(rootDir, docPath)}`);
console.log(`${output.totals.narrativeSeedClaims} SK narrative seed claims promoted.`);

async function promoteNarrativeSeed(seed, sequence) {
  const id = `sk-sbc-${String(sequence).padStart(3, "0")}`;
  const extraction = extractionByManifestId.get(seed.sourceManifestId);
  if (!extraction) throw new Error(`${seed.sourceManifestId} is missing from ${extractionReportPath}`);
  if (extraction.extractionStatus !== "ok") {
    throw new Error(`${seed.sourceManifestId} extraction is not ok: ${extraction.extractionStatus}`);
  }
  if (extraction.lowTextWarning) {
    throw new Error(`${seed.sourceManifestId} is low-text/image-like and cannot be promoted without OCR/manual transcript`);
  }
  if (extraction.documentUrlStatus !== "matched_from_document_url_list") {
    throw new Error(`${seed.sourceManifestId} needs matched document-level URL before promotion`);
  }
  if (!extraction.publicDocumentUrl || !extraction.sourcePageUrl) {
    throw new Error(`${seed.sourceManifestId} needs publicDocumentUrl and sourcePageUrl`);
  }
  if (!extraction.markdownPath || !extraction.textSha256) {
    throw new Error(`${seed.sourceManifestId} needs markdownPath and textSha256`);
  }
  if (!identifierByCompany.has(seed.companyId)) {
    throw new Error(`${id} references unknown SK companyId ${seed.companyId}`);
  }
  for (const ruleId of seed.sourceRuleIds ?? []) {
    if (!knownPolicyRuleIds.has(ruleId)) throw new Error(`${id} references unknown policy rule ${ruleId}`);
  }

  const markdown = await readFile(join(rootDir, extraction.markdownPath), "utf8");
  const evidenceLocations = findEvidenceLocations(seed, extraction, markdown);

  return {
    id,
    groupId: "sk",
    companyId: seed.companyId,
    companyScope: seed.companyScope,
    claimType: seed.claimType,
    claimText: seed.claimText,
    claimTextSha256: sha256(seed.claimText),
    sourceManifestId: seed.sourceManifestId,
    sourceTitle: extraction.title,
    sourceRole: "official_issuer_document",
    sourceCategory: "official_issuer_ir",
    sourceDocumentDate: seed.sourceDocumentDate ?? extraction.period ?? null,
    sourceRuleIds: seed.sourceRuleIds,
    targetWikiPage: seed.targetWikiPage,
    runtimeUsePolicy: seed.runtimeUsePolicy,
    verificationState: "source_backed_seed",
    forwardLooking: Boolean(seed.forwardLooking),
    officialSource: {
      sourcePageUrl: extraction.sourcePageUrl,
      downloadUrl: extraction.publicDocumentUrl,
      providerUrl: extraction.sourcePageUrl,
      provider: "issuer IR",
      issuerIrUrl: identifierByCompany.get(seed.companyId)?.irUrl ?? extraction.sourcePageUrl
    },
    evidenceNeedle: (seed.evidenceNeedles ?? [])[0] ?? null,
    evidenceLocations,
    sourceSha256: sha256(JSON.stringify(evidenceLocations)),
    sourceTextSha256: extraction.textSha256,
    rightsPolicy:
      "Public source URL may be cited; extracted full text is used only for evidence location and is not redistributed.",
    reviewNote: seed.reviewNote,
    paperUseLevel: "source-backed-narrative-seed-claim",
    promotedAt: now
  };
}

function findEvidenceLocations(seed, extraction, markdown) {
  const needles = seed.evidenceNeedles ?? [];
  if (needles.length === 0) throw new Error(`${seed.sourceManifestId} has no evidence needles`);
  const lines = String(markdown).split(/\r?\n/u);
  const locations = [];

  for (const needle of needles) {
    const normalizedNeedle = normalizeEvidence(needle);
    let currentPage = null;
    let found = null;
    for (const [index, line] of lines.entries()) {
      const pageMatch = line.match(/^## Page\s+(.+)$/u);
      if (pageMatch) currentPage = pageMatch[1].trim();
      if (normalizeEvidence(line).includes(normalizedNeedle)) {
        found = { lineNumber: index + 1, page: currentPage, lineText: line.trim() };
        break;
      }
    }
    if (!found) {
      throw new Error(`${seed.sourceManifestId} evidence needle not found: ${needle}`);
    }
    locations.push({
      sourceArtifact: extractionReportPath,
      manifestId: extraction.manifestId,
      companyId: seed.companyId,
      koreanName: extraction.koreanName,
      title: extraction.title,
      documentType: extraction.documentType,
      period: seed.sourceDocumentDate ?? extraction.period ?? null,
      sourcePageUrl: extraction.sourcePageUrl,
      publicDocumentUrl: extraction.publicDocumentUrl,
      markdownPath: extraction.markdownPath,
      page: found.page,
      lineNumber: found.lineNumber,
      evidenceNeedle: needle,
      evidenceNeedleSha256: sha256(needle),
      sourceTextSha256: extraction.textSha256
    });
  }
  return locations;
}

function validateOutput(sourceBackedClaims) {
  if (sourceBackedClaims.groupId !== "sk") throw new Error("SK claim manifest must use groupId sk");
  if (sourceBackedClaims.selectionPolicyVersion !== policy.policyVersion) {
    throw new Error("Selection policy version mismatch");
  }
  if (sourceBackedClaims.totals.financialSeedClaims < 8) {
    throw new Error("SK must preserve its 8 financial seed claims");
  }
  if (sourceBackedClaims.totals.narrativeSeedClaims !== (narrativeSeeds.records ?? []).length) {
    throw new Error("All SK narrative seed claims must pass promotion validation");
  }
  const ids = new Set();
  for (const record of sourceBackedClaims.records ?? []) {
    if (ids.has(record.id)) throw new Error(`Duplicate claim id ${record.id}`);
    ids.add(record.id);
    if (record.groupId !== "sk") throw new Error(`${record.id} has non-SK groupId`);
    if (!record.companyId || !identifierByCompany.has(record.companyId)) {
      throw new Error(`${record.id} has invalid companyId ${record.companyId}`);
    }
    if (!record.companyScope) throw new Error(`${record.id} missing companyScope`);
    if (!record.claimText) throw new Error(`${record.id} missing claimText`);
    if (record.paperUseLevel === "source-backed-narrative-seed-claim") {
      if (!record.claimTextSha256 || !record.sourceTextSha256) {
        throw new Error(`${record.id} narrative claim missing claim/source text hash`);
      }
      if (!record.officialSource?.sourcePageUrl || !record.officialSource?.downloadUrl) {
        throw new Error(`${record.id} narrative claim missing official source URL`);
      }
      if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
        throw new Error(`${record.id} narrative claim missing evidence locations`);
      }
      for (const location of record.evidenceLocations) {
        if (!location.markdownPath || !location.lineNumber || !location.evidenceNeedleSha256) {
          throw new Error(`${record.id} narrative evidence needs markdownPath, lineNumber, and evidenceNeedleSha256`);
        }
        if (location.sourceTextSha256 !== record.sourceTextSha256) {
          throw new Error(`${record.id} evidence source hash mismatch`);
        }
      }
    }
  }
}

function buildDoc(sourceBackedClaims) {
  const narrativeRows = sourceBackedClaims.records
    .filter((record) => record.paperUseLevel === "source-backed-narrative-seed-claim")
    .map((record) => [
      `\`${record.id}\``,
      companyLabel(record.companyId),
      `\`${record.claimType}\``,
      record.forwardLooking ? "yes" : "no",
      `\`${record.sourceManifestId}\``
    ]);
  const lines = [
    "# SK Source-Backed Narrative Claims",
    "",
    `Generated: ${sourceBackedClaims.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This note records the first SK narrative claims promoted into source-backed seed knowledge. It extends the SK financial seed without changing the common harness boundary used for Hanwha and Samsung.",
    "",
    "## Promotion Rule",
    "",
    "A local source enters runtime only when it has a matched public document URL, successful text extraction, no low-text warning, source text hash, evidence line locator, companyId, companyScope, and source-selection policy IDs. The narrative queue remains a review ledger; only claims in `raw/manifests/sk.source-backed-claims.json` are runtime-eligible.",
    "",
    "## Summary",
    "",
    `- Total SK source-backed claims: ${sourceBackedClaims.totals.claims}`,
    `- Financial seed claims preserved: ${sourceBackedClaims.totals.financialSeedClaims}`,
    `- Narrative seed claims promoted: ${sourceBackedClaims.totals.narrativeSeedClaims}`,
    `- Narrative queue ready sources: ${sourceBackedClaims.totals.narrativeReadySources}`,
    `- Narrative queue blocked sources: ${sourceBackedClaims.totals.narrativeBlockedSources}`,
    `- Source-selection policy version: ${sourceBackedClaims.selectionPolicyVersion}`,
    "",
    "## Narrative Claims",
    "",
    table(["ID", "Company", "Type", "Forward-looking", "Source"], narrativeRows),
    "",
    "## Remaining Boundaries",
    "",
    "- SK Hynix HBM seminar PDFs are still not promoted from the image-like seminar files; the current HBM/AI memory framing is limited to the text-bearing value-up plan.",
    "- SK Innovation claims are bounded to official earnings material and should not become a full battery or energy-transition thesis without more source review.",
    "- SK Inc. claims are holding-company value-up claims; do not infer affiliate-level performance drivers from them.",
    "- SK Telecom AI claims use official press-release text; low-text investor-briefing PDFs remain blocked unless OCR or a text-bearing source is supplied.",
    "- SK Square claims are bounded to matched official IR URLs and should preserve NAV, preliminary-result, and portfolio-concentration labels.",
    "",
    "## Source References",
    "",
    "- `configs/sk-narrative-claim-seeds.json`",
    "- `raw/manifests/sk.source-backed-claims.json`",
    "- `raw/manifests/sk.extraction-report.json`",
    "- `raw/manifests/sk.narrative-claim-queue.json`",
    "- `raw/manifests/sk.identifier-verification.json`",
    "- `configs/source-selection-policy.json`"
  ];
  return `${lines.join("\n")}\n`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeEvidence(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/[’‘]/gu, "'")
    .replace(/[“”]/gu, "\"")
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function countBy(records, keyFn) {
  return records.reduce((acc, record) => {
    const key = keyFn(record) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => escapeTable(cell)).join(" | ")} |`)
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/");
}

function companyLabel(companyId) {
  return identifierByCompany.get(companyId)?.koreanName ?? companyId;
}
