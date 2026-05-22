import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const now = new Date().toISOString();
const groupId = process.env.DART_GROUP_ID ?? "hyundai-motor";
const claimPrefix = groupId === "hyundai-motor" ? "hyundai" : groupId;
const outputPath = process.env.SOURCE_BACKED_CLAIMS_OUT ?? `raw/manifests/${groupId}.source-backed-claims.json`;
const docPath = process.env.SOURCE_BACKED_CLAIMS_DOC ?? (
  groupId === "hyundai-motor"
    ? "docs/56_hyundai_motor_source_backed_financial_seed.md"
    : `docs/${groupId}_source_backed_financial_seed.md`
);
const targetWikiPage = `wiki/groups/${groupId}/financials.md`;

const financialTablePath = process.env.DART_FINANCIAL_TABLE ?? `raw/manifests/${groupId}.dart-financial-table.2022-2024.json`;
const identifierPath = process.env.IDENTIFIER_VERIFICATION ?? `raw/manifests/${groupId}.identifier-verification.json`;
const narrativeQueuePath = process.env.NARRATIVE_CLAIM_QUEUE ?? `raw/manifests/${groupId}.narrative-claim-queue.json`;
const financialTable = await readJson(financialTablePath);
const identifiers = await readJson(identifierPath);
const policy = await readJson("configs/source-selection-policy.json");
const groups = await readJson("configs/groups.json");
const targetGroup = groups.groups.find((group) => group.id === groupId);
if (!targetGroup) throw new Error(`${groupId} is missing from configs/groups.json`);
const knownPolicyRuleIds = new Set([
  ...(policy.scopePrinciples ?? []).map((rule) => rule.id),
  ...(policy.selectionRules ?? []).map((rule) => rule.id)
]);
const identifierByCompany = new Map((identifiers.records ?? []).map((record) => [record.companyId, record]));
const recordsByCompanyYear = new Map(
  (financialTable.records ?? []).map((record) => [`${record.companyId}:${record.year}`, record])
);
const intakeTemplatePath = `raw/manifests/${groupId}.source-intake-template.json`;
const companyOrder = await firstSliceCompanyOrder(intakeTemplatePath, targetGroup);

const claimSpecs = [];
let nextId = 1;
for (const companyId of companyOrder) {
  const current = recordsByCompanyYear.get(`${companyId}:2024`);
  if (current?.status === "ok") {
    claimSpecs.push(buildAnnualFinancialClaimSpec(nextId, current));
    nextId += 1;
  }
}
for (const companyId of companyOrder) {
  const previous = recordsByCompanyYear.get(`${companyId}:2023`);
  const current = recordsByCompanyYear.get(`${companyId}:2024`);
  if (previous?.status === "ok" && current?.status === "ok") {
    claimSpecs.push(buildTrendClaimSpec(nextId, previous, current));
    nextId += 1;
  }
}

const records = claimSpecs.map(enrichFinancialClaim);
const output = {
  schemaVersion: "source-backed-claims.v0.1",
  groupId,
  generatedAt: now,
  selectionPolicyVersion: policy.policyVersion,
  inputArtifacts: {
    financialTable: financialTablePath,
    identifierVerification: identifierPath,
    narrativeClaimQueue: narrativeQueuePath,
    sourceSelectionPolicy: "configs/source-selection-policy.json"
  },
  policy:
    `${targetGroup.koreanName} seed claims are promoted only from OpenDART annual financial-statement API rows at this stage. IR and value-up PDF sources remain in the narrative claim queue until a human reviewer promotes atomic claims with evidence locators.`,
  localPdfStatus:
    "Local official PDFs are extracted and queued for human claim review. They are not runtime knowledge in this financial seed slice.",
  totals: {
    claims: records.length,
    financialSeedClaims: records.length,
    annualFinancialClaims: records.filter((record) => record.claimType === "financial_metric").length,
    trendClaims: records.filter((record) => record.claimType === "financial_trend").length,
    byCompanyId: countBy(records, (record) => record.companyId),
    byClaimType: countBy(records, (record) => record.claimType),
    byRuntimeUsePolicy: countBy(records, (record) => record.runtimeUsePolicy),
    byVerificationState: countBy(records, (record) => record.verificationState)
  },
  records
};

validateOutput(output);
await writeJson(outputPath, output);
await writeMarkdown(docPath, buildDoc(output));

console.log(`${targetGroup.koreanName} source-backed financial seed claims written: ${outputPath}`);
console.log(`${output.totals.claims} ${targetGroup.koreanName} financial seed claims promoted.`);

async function readJson(path) {
  return JSON.parse(await readFile(join(rootDir, path), "utf8"));
}

async function writeJson(path, value) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeMarkdown(path, markdown) {
  const fullPath = join(rootDir, path);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

async function firstSliceCompanyOrder(path, group) {
  try {
    const template = await readJson(path);
    const ids = (template.firstSliceCompanies ?? [])
      .map((company) => company.companyId)
      .filter(Boolean);
    if (ids.length > 0) return ids;
  } catch {
    // Fall through to config order when a group has no source-intake template yet.
  }
  return (group.companies ?? [])
    .filter((company) => company.listed && company.dartCode)
    .map((company) => company.id);
}

function buildAnnualFinancialClaimSpec(sequence, record) {
  const subjectName = withTopicParticle(record.koreanName);
  return {
    id: formatClaimId(sequence),
    groupId,
    companyId: record.companyId,
    companyScope: "listed_company",
    targetWikiPage,
    claimType: "financial_metric",
    claimText:
      `${subjectName} OpenDART ${record.year}년 연결 기준 ${record.revenue.accountName} ${formatEok(record.revenue.amountEokKrw)}억원, ${record.operatingIncome.accountName} ${formatEok(record.operatingIncome.amountEokKrw)}억원으로 확인된다.`,
    sourceManifestId: `${claimPrefix}-dart-financial-table-2022-2024:${record.companyId}:${record.year}`,
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-02", "SRC-04", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label",
    reviewNote: "DART explicit revenue and operating income account labels are preserved.",
    paperUseLevel: "eligible_for_transfer_slice_financial_baseline",
    evidenceRecords: [record]
  };
}

function buildTrendClaimSpec(sequence, previous, current) {
  return {
    id: formatClaimId(sequence),
    groupId,
    companyId: current.companyId,
    companyScope: "listed_company",
    targetWikiPage,
    claimType: "financial_trend",
    claimText:
      `${withTopicParticle(current.koreanName)} OpenDART 연결 기준 ${previous.year}년 ${previous.revenue.accountName} ${formatEok(previous.revenue.amountEokKrw)}억원, ${previous.operatingIncome.accountName} ${formatEok(previous.operatingIncome.amountEokKrw)}억원에서 ${current.year}년 ${current.revenue.accountName} ${formatEok(current.revenue.amountEokKrw)}억원, ${current.operatingIncome.accountName} ${formatEok(current.operatingIncome.amountEokKrw)}억원으로 확인된다.`,
    sourceManifestId: `${claimPrefix}-dart-financial-table-2022-2024:${current.companyId}:2023-2024`,
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-02", "SRC-04", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label",
    reviewNote: "Derived language is avoided; the claim preserves the two DART account values.",
    paperUseLevel: "eligible_for_transfer_slice_financial_baseline",
    evidenceRecords: [previous, current]
  };
}

function enrichFinancialClaim(spec) {
  const identifier = identifierByCompany.get(spec.companyId);
  const evidenceLocations = spec.evidenceRecords.map((record) => ({
    sourceArtifact: financialTablePath,
    companyId: record.companyId,
    koreanName: record.koreanName,
    dartCode: record.dartCode,
    krxCode: record.krxCode,
    year: record.year,
    reportCode: record.reportCode,
    reportName: record.reportName,
    reportingBasis: record.reportingBasis,
    statementName: record.statementName,
    revenueAccount: record.revenue?.accountName ?? null,
    revenueAmountEokKrw: record.revenue?.amountEokKrw ?? null,
    operatingIncomeAccount: record.operatingIncome?.accountName ?? null,
    operatingIncomeAmountEokKrw: record.operatingIncome?.amountEokKrw ?? null,
    netIncomeAccount: record.netIncome?.accountName ?? null,
    netIncomeAmountEokKrw: record.netIncome?.amountEokKrw ?? null,
    totalAssetsAccount: record.totalAssets?.accountName ?? null,
    totalAssetsAmountEokKrw: record.totalAssets?.amountEokKrw ?? null,
    totalLiabilitiesAccount: record.totalLiabilities?.accountName ?? null,
    totalLiabilitiesAmountEokKrw: record.totalLiabilities?.amountEokKrw ?? null,
    totalEquityAccount: record.totalEquity?.accountName ?? null,
    totalEquityAmountEokKrw: record.totalEquity?.amountEokKrw ?? null,
    debtToEquityPct: record.debtToEquityPct ?? null,
    dartStatus: record.dartStatus,
    sourceUrls: record.sourceUrls
  }));

  return {
    id: spec.id,
    groupId: spec.groupId,
    companyId: spec.companyId,
    companyScope: spec.companyScope,
    targetWikiPage: spec.targetWikiPage,
    claimType: spec.claimType,
    claimText: spec.claimText,
    claimTextSha256: sha256(spec.claimText),
    sourceManifestId: spec.sourceManifestId,
    sourceRuleIds: spec.sourceRuleIds,
    runtimeUsePolicy: spec.runtimeUsePolicy,
    verificationState: "source_backed_seed",
    sourceDocumentDate: spec.evidenceRecords.at(-1)?.year ?? "2024",
    evidenceLocations,
    evidenceRecords: spec.evidenceRecords,
    officialSource: {
      sourcePageUrl: "https://opendart.fss.or.kr/",
      providerUrl: "https://opendart.fss.or.kr/",
      provider: "OpenDART",
      dartCode: identifier?.dartCode ?? spec.evidenceRecords[0]?.dartCode,
      krxCode: identifier?.krxCode ?? spec.evidenceRecords[0]?.krxCode
    },
    rightsPolicy: "OpenDART API records may be cited as official public disclosure metadata; API key is never stored.",
    reviewNote: spec.reviewNote,
    paperUseLevel: spec.paperUseLevel,
    promotedAt: now
  };
}

function validateOutput(output) {
  for (const [index, record] of output.records.entries()) {
    const path = `${outputPath}.records[${index}](${record.id})`;
    for (const field of ["id", "groupId", "companyId", "companyScope", "claimText", "claimType", "sourceManifestId", "runtimeUsePolicy", "verificationState"]) {
      if (!record[field]) throw new Error(`${path}: missing ${field}`);
    }
    for (const ruleId of record.sourceRuleIds ?? []) {
      if (!knownPolicyRuleIds.has(ruleId)) throw new Error(`${path}: unknown source rule ${ruleId}`);
    }
    if (sha256(record.claimText) !== record.claimTextSha256) throw new Error(`${path}: claimTextSha256 mismatch`);
    if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
      throw new Error(`${path}: evidenceLocations are required`);
    }
  }
}

function buildDoc(output) {
  const rows = output.records.map((record) => [
    `\`${record.id}\``,
    companyLabel(record.companyId),
    record.claimType,
    record.claimText,
    `\`${record.runtimeUsePolicy}\``
  ]);
  return [
    `# ${targetGroup.koreanName} Source-Backed Financial Seed Claims`,
    "",
    `Generated: ${output.generatedAt}`,
    "",
    `This artifact promotes only OpenDART financial-statement claims. ${targetGroup.koreanName} IR/PDF sources are queued separately for human narrative-claim review.`,
    "",
    "## Summary",
    "",
    `- Claims: ${output.totals.claims}`,
    `- Annual financial claims: ${output.totals.annualFinancialClaims}`,
    `- Trend claims: ${output.totals.trendClaims}`,
    "",
    "## Promoted Claims",
    "",
    table(["Claim ID", "Company", "Type", "Claim", "Runtime policy"], rows),
    "",
    "## Source Boundary",
    "",
    `- Source artifact: \`${financialTablePath}\``,
    "- Runtime answers must preserve company, year, account label, reporting basis, and source state.",
    `- This seed does not yet promote ${targetGroup.koreanName} narrative IR claims.`,
    ""
  ].join("\n");
}

function formatClaimId(sequence) {
  return `${claimPrefix}-sbc-${String(sequence).padStart(3, "0")}`;
}

function formatEok(value) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function withTopicParticle(name) {
  if (!name) return "";
  const last = [...name].at(-1);
  const code = last.codePointAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${name}는`;
  return (code - 0xac00) % 28 === 0 ? `${name}는` : `${name}은`;
}

function companyLabel(companyId) {
  return identifierByCompany.get(companyId)?.koreanName ?? companyId;
}

function table(headers, rows) {
  if (rows.length === 0) return "No rows.\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`)
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/");
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
