import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const now = new Date().toISOString();
const outputPath = join(rootDir, "raw", "manifests", "samsung.source-backed-claims.json");
const docPath = join(rootDir, "docs", "41_samsung_source_backed_seed_claims.md");
const targetWikiPage = "wiki/groups/samsung/financials.md";
const narrativeSeedPath = "configs/samsung-narrative-claim-seeds.json";
const documentUrlIntakePath = "raw/manifests/samsung.document-url-intake.json";
const officialExtractionReportPath = "raw/manifests/samsung.extraction-report.json";
const dartFilingExtractionReportPath = "raw/manifests/samsung.dart-filing-extraction-report.json";

const financialTable = await readJson("raw/manifests/samsung.dart-financial-table.2022-2024.json");
const accountAudit = await readJson("raw/manifests/samsung.dart-financial-account-audit.2022-2024.json");
const identifiers = await readJson("raw/manifests/samsung.identifier-verification.json");
const localSourceAudit = await readJson("raw/manifests/samsung.local-source-adequacy-audit.json");
const claimPlan = await readJson("raw/manifests/samsung.claim-candidate-plan.json");
const narrativeSeeds = await readJson(narrativeSeedPath);
const documentUrlIntake = await readJson(documentUrlIntakePath);
const officialExtractionReport = await readJson(officialExtractionReportPath);
const dartFilingExtractionReport = await readJson(dartFilingExtractionReportPath);
const policy = await readJson("configs/source-selection-policy.json");

const knownPolicyRuleIds = new Set([
  ...(policy.scopePrinciples ?? []).map((rule) => rule.id),
  ...(policy.selectionRules ?? []).map((rule) => rule.id)
]);

const companyOrder = [
  "samsung-electronics",
  "samsung-sdi",
  "samsung-ct",
  "samsung-life",
  "samsung-fire-marine",
  "samsung-biologics",
  "samsung-electro-mechanics",
  "samsung-sds",
  "samsung-heavy-industries",
  "samsung-ea",
  "samsung-card",
  "samsung-securities",
  "cheil-worldwide",
  "hotel-shilla",
  "s1"
];

const recordsByCompanyYear = new Map(
  (financialTable.records ?? []).map((record) => [`${record.companyId}:${record.year}`, record])
);
const identifierByCompany = new Map((identifiers.records ?? []).map((record) => [record.companyId, record]));
const documentUrlBySourceId = new Map((documentUrlIntake.entries ?? []).map((entry) => [entry.sourceId, entry]));
const officialExtractionByManifestId = new Map(
  (officialExtractionReport.results ?? []).map((result) => [result.manifestId, result])
);
const dartExtractionByManifestId = new Map(
  (dartFilingExtractionReport.results ?? []).map((result) => [result.manifestId, result])
);

const claimSpecs = [];
let nextId = 1;
for (const companyId of companyOrder) {
  const record = recordsByCompanyYear.get(`${companyId}:2024`);
  if (!record) continue;
  claimSpecs.push(buildAnnualFinancialClaimSpec(nextId, record));
  nextId += 1;
}

for (const trend of [
  {
    companyId: "samsung-electronics",
    claimType: "financial_trend",
    focus: "삼성전자의 2024년 영업이익 회복 여부",
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label"
  },
  {
    companyId: "samsung-sdi",
    claimType: "financial_trend",
    focus: "삼성SDI의 2024년 매출 및 영업이익 감소 여부",
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label"
  },
  {
    companyId: "samsung-ct",
    claimType: "financial_trend",
    focus: "삼성물산의 2024년 매출 및 영업이익 변화",
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label"
  },
  {
    companyId: "samsung-biologics",
    claimType: "financial_trend",
    focus: "삼성바이오로직스의 2024년 매출 및 영업이익 증가 여부",
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_account_label"
  }
]) {
  const previous = recordsByCompanyYear.get(`${trend.companyId}:2023`);
  const current = recordsByCompanyYear.get(`${trend.companyId}:2024`);
  if (!previous || !current || !previous.revenue || !current.revenue || !previous.operatingIncome || !current.operatingIncome) continue;
  claimSpecs.push(buildTrendClaimSpec(nextId, trend, previous, current));
  nextId += 1;
}

for (const seed of narrativeSeeds.records ?? []) {
  claimSpecs.push(await buildNarrativeClaimSpec(nextId, seed));
  nextId += 1;
}

const records = claimSpecs.map(enrichClaim);
const output = {
  schemaVersion: "source-backed-claims.v0.1",
  groupId: "samsung",
  generatedAt: now,
  selectionPolicyVersion: policy.policyVersion,
  inputArtifacts: {
    financialTable: "raw/manifests/samsung.dart-financial-table.2022-2024.json",
    financialAccountAudit: "raw/manifests/samsung.dart-financial-account-audit.2022-2024.json",
    identifierVerification: "raw/manifests/samsung.identifier-verification.json",
    localSourceAdequacyAudit: "raw/manifests/samsung.local-source-adequacy-audit.json",
    claimCandidatePlan: "raw/manifests/samsung.claim-candidate-plan.json",
    narrativeClaimSeeds: narrativeSeedPath,
    documentUrlIntake: documentUrlIntakePath,
    officialPdfExtractionReport: officialExtractionReportPath,
    dartFilingExtractionReport: dartFilingExtractionReportPath,
    sourceSelectionPolicy: "configs/source-selection-policy.json"
  },
  policy:
    "Samsung seed claims are promoted only after deterministic source gates pass. Financial claims come from OpenDART annual financial-statement API records. Narrative claims require a public document URL, extracted text hash, exact evidence needles, evidence line locators, and forward-looking labels where needed. Revenue is recorded only when OpenDART provides an explicit accepted revenue account; finance-specific accounts are not redefined as revenue.",
  localPdfStatus:
    "Local official PDFs and DART viewer filings may enter runtime only when public URL intake, extraction hash, and evidence locator verification all pass.",
  totals: {
    claims: records.length,
    annualFinancialClaims: records.filter((record) => record.claimType === "financial_metric").length,
    trendClaims: records.filter((record) => record.claimType === "financial_trend").length,
    limitedFinancialClaims: records.filter((record) => record.claimType === "financial_metric_limited").length,
    narrativeSeedClaims: records.filter((record) => record.paperUseLevel === "source-backed-narrative-seed-claim").length,
    sourceCandidateThemes: claimPlan.totals?.records ?? 0,
    localPdfReadyThemes: claimPlan.totals?.localPdfReadyThemes ?? 0,
    dartViewerPendingThemes: claimPlan.totals?.dartViewerPendingThemes ?? 0,
    financialAccountAuditRecords: accountAudit.totals?.requestedRecords ?? 0,
    byClaimType: countBy(records, (record) => record.claimType),
    byRuntimeUsePolicy: countBy(records, (record) => record.runtimeUsePolicy),
    byVerificationState: countBy(records, (record) => record.verificationState),
    byPaperUseLevel: countBy(records, (record) => record.paperUseLevel)
  },
  records
};

validateOutput(output);
await writeJson(outputPath, output);
await writeFile(docPath, buildDoc(output), "utf8");
await updateWikiPages(output.records);

console.log(`Samsung source-backed claims written: ${relative(rootDir, outputPath)}`);
console.log(`Readable audit note written: ${relative(rootDir, docPath)}`);
console.log(`${output.totals.claims} Samsung source-backed seed claims promoted.`);

function buildAnnualFinancialClaimSpec(sequence, record) {
  const id = formatClaimId(sequence);
  const hasRevenue = Boolean(record.revenue);
  const hasOperatingIncome = Boolean(record.operatingIncome);
  if (!hasOperatingIncome) {
    throw new Error(`${record.koreanName} ${record.year} has no operating income record and cannot be promoted`);
  }

  const subjectName = withTopicParticle(record.koreanName);
  const claimText = hasRevenue
    ? `${subjectName} OpenDART ${record.year}년 연결 기준 ${record.revenue.accountName} ${formatEok(record.revenue.amountEokKrw)}억원, ${record.operatingIncome.accountName} ${formatEok(record.operatingIncome.amountEokKrw)}억원으로 확인된다.`
    : `${subjectName} OpenDART ${record.year}년 연결 기준 ${record.operatingIncome.accountName} ${formatEok(record.operatingIncome.amountEokKrw)}억원으로 확인되지만, 매출액은 본 프로젝트의 정책상 DART가 명시적 매출 계정을 제공하지 않아 비워둔다.`;

  return {
    id,
    groupId: "samsung",
    companyId: record.companyId,
    companyScope: "listed_company",
    targetWikiPage,
    claimType: hasRevenue ? "financial_metric" : "financial_metric_limited",
    claimText,
    sourceManifestId: `samsung-dart-financial-table-2022-2024:${record.companyId}:${record.year}`,
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-02", "SRC-04", "SRC-10", "SRC-11"],
    runtimeUsePolicy: hasRevenue
      ? "eligible_for_bounded_context_with_dart_account_label"
      : "eligible_for_bounded_context_with_missing_revenue_label",
    reviewNote: hasRevenue
      ? "DART explicit revenue and operating income account labels are preserved."
      : "This claim is intentionally limited; finance-company revenue is not inferred from finance-specific accounts.",
    evidenceRecords: [record]
  };
}

function buildTrendClaimSpec(sequence, trend, previous, current) {
  const id = formatClaimId(sequence);
  return {
    id,
    groupId: "samsung",
    companyId: trend.companyId,
    companyScope: "listed_company",
    targetWikiPage,
    claimType: trend.claimType,
    claimText:
      `${withTopicParticle(current.koreanName)} OpenDART 연결 기준 ${previous.year}년 ${previous.revenue.accountName} ${formatEok(previous.revenue.amountEokKrw)}억원, ${previous.operatingIncome.accountName} ${formatEok(previous.operatingIncome.amountEokKrw)}억원에서 ${current.year}년 ${current.revenue.accountName} ${formatEok(current.revenue.amountEokKrw)}억원, ${current.operatingIncome.accountName} ${formatEok(current.operatingIncome.amountEokKrw)}억원으로 확인된다.`,
    sourceManifestId: `samsung-dart-financial-table-2022-2024:${trend.companyId}:2023-2024`,
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-02", "SRC-04", "SRC-10", "SRC-11"],
    runtimeUsePolicy: trend.runtimeUsePolicy,
    reviewNote: `${trend.focus}. Derived language is avoided; the claim preserves the two DART account values.`,
    evidenceRecords: [previous, current]
  };
}

async function buildNarrativeClaimSpec(sequence, seed) {
  const id = formatClaimId(sequence);
  const urlEntry = documentUrlBySourceId.get(seed.sourceManifestId);
  const extraction = extractionForSource(seed.sourceManifestId);

  if (!urlEntry) throw new Error(`${seed.sourceManifestId} is missing from Samsung document URL intake`);
  if (urlEntry.promotionReadiness !== "ready_for_claim_review") {
    throw new Error(`${seed.sourceManifestId} is not ready for claim review: ${urlEntry.promotionReadiness}`);
  }
  if (!urlEntry.publicDocumentUrl && !urlEntry.sourcePageUrl) {
    throw new Error(`${seed.sourceManifestId} needs a public document or filing URL before promotion`);
  }
  if (!extraction) throw new Error(`${seed.sourceManifestId} is missing from extraction reports`);
  if (extraction.extractionStatus !== "ok") {
    throw new Error(`${seed.sourceManifestId} extraction is not ok: ${extraction.extractionStatus}`);
  }
  if (!extraction.markdownPath || !extraction.textSha256) {
    throw new Error(`${seed.sourceManifestId} needs markdownPath and textSha256 before promotion`);
  }

  const markdown = await readFile(join(rootDir, extraction.markdownPath), "utf8");
  const evidenceLocations = findEvidenceLocations(seed, urlEntry, extraction, markdown);

  return {
    id,
    groupId: "samsung",
    companyId: seed.companyId,
    companyScope: seed.companyScope ?? "listed_company",
    targetWikiPage: seed.targetWikiPage,
    claimType: seed.claimType,
    claimText: seed.claimText,
    sourceManifestId: seed.sourceManifestId,
    sourceRuleIds: seed.sourceRuleIds,
    runtimeUsePolicy: seed.runtimeUsePolicy,
    reviewNote: seed.reviewNote,
    sourceDocumentDate: seed.sourceDocumentDate,
    forwardLooking: Boolean(seed.forwardLooking),
    evidenceLocations
  };
}

function enrichClaim(spec) {
  if (spec.evidenceLocations) return enrichNarrativeClaim(spec);
  return enrichFinancialClaim(spec);
}

function enrichFinancialClaim(spec) {
  const identifier = identifierByCompany.get(spec.companyId);
  const evidenceLocations = spec.evidenceRecords.map((record) => ({
    sourceArtifact: "raw/manifests/samsung.dart-financial-table.2022-2024.json",
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
    dartMessage: record.dartMessage,
    sourceEndpoint: record.revenue?.sourceEndpoint ?? record.operatingIncome?.sourceEndpoint ?? null,
    sourceUrlRedacted: record.sourceUrls?.[0] ?? null
  }));

  return {
    ...spec,
    claimTextSha256: sha256(spec.claimText),
    verificationState: "source_backed_seed",
    sourceTitle: "OpenDART annual financial-statement API table",
    sourceRole: "regulatory_financial_statement_api",
    sourceCategory: "official_regulatory_api",
    sourceDocumentDate: "2022-2024",
    sourceSha256: sha256(JSON.stringify(evidenceLocations)),
    sourceTextSha256: null,
    officialSource: {
      sourcePageUrl: "https://opendart.fss.or.kr/",
      downloadUrl: null,
      providerUrl: "https://opendart.fss.or.kr/",
      provider: "OpenDART",
      issuerIrUrl: identifier?.irUrl ?? null
    },
    evidenceLocations,
    rightsPolicy:
      "OpenDART-derived account metadata may be cited with account labels and source state. API keys are redacted and local full-text PDFs are not redistributed.",
    paperUseLevel: "source-backed-seed-claim",
    promotedAt: now
  };
}

function enrichNarrativeClaim(spec) {
  const identifier = identifierByCompany.get(spec.companyId);
  const urlEntry = documentUrlBySourceId.get(spec.sourceManifestId);
  const extraction = extractionForSource(spec.sourceManifestId);
  const isDart = spec.sourceManifestId.startsWith("samsung-dart-");

  return {
    ...spec,
    claimTextSha256: sha256(spec.claimText),
    verificationState: "source_backed_seed",
    sourceTitle: urlEntry?.title ?? extraction?.title ?? spec.sourceManifestId,
    sourceRole: isDart ? "official_regulatory_filing" : "official_issuer_document",
    sourceCategory: isDart ? "official_regulatory_filing" : "official_issuer_ir",
    sourceDocumentDate: spec.sourceDocumentDate ?? urlEntry?.period ?? extraction?.period ?? null,
    sourceSha256: sha256(JSON.stringify(spec.evidenceLocations)),
    sourceTextSha256: extraction?.textSha256 ?? null,
    officialSource: {
      sourcePageUrl: urlEntry?.sourcePageUrl ?? extraction?.sourcePageUrl ?? null,
      downloadUrl: urlEntry?.publicDocumentUrl ?? extraction?.sourcePageUrl ?? null,
      providerUrl: urlEntry?.sourcePageUrl ?? extraction?.sourcePageUrl ?? null,
      provider: isDart ? "DART" : "issuer IR",
      issuerIrUrl: identifier?.irUrl ?? null
    },
    evidenceLocations: spec.evidenceLocations,
    rightsPolicy:
      urlEntry?.rightsPolicy ??
      "Public source URL may be cited; extracted full text is used only for evidence location and is not redistributed.",
    paperUseLevel: "source-backed-narrative-seed-claim",
    promotedAt: now
  };
}

function extractionForSource(sourceManifestId) {
  return sourceManifestId.startsWith("samsung-dart-")
    ? dartExtractionByManifestId.get(sourceManifestId)
    : officialExtractionByManifestId.get(sourceManifestId);
}

function findEvidenceLocations(seed, urlEntry, extraction, markdown) {
  const evidenceNeedles = seed.evidenceNeedles ?? [];
  if (evidenceNeedles.length === 0) throw new Error(`${seed.sourceManifestId} has no evidence needles`);

  const sourceArtifact = seed.sourceManifestId.startsWith("samsung-dart-")
    ? dartFilingExtractionReportPath
    : officialExtractionReportPath;
  const lines = String(markdown).split(/\r?\n/u);
  const locations = [];

  for (const needle of evidenceNeedles) {
    let currentPage = null;
    let found = null;

    for (const [index, line] of lines.entries()) {
      const pageMatch = line.match(/^## Page\s+(.+)$/u);
      if (pageMatch) currentPage = pageMatch[1].trim();
      if (line.includes(needle)) {
        found = { lineNumber: index + 1, page: currentPage };
        break;
      }
    }

    if (!found) {
      throw new Error(`${seed.sourceManifestId} evidence needle not found exactly: ${needle}`);
    }

    locations.push({
      sourceArtifact,
      manifestId: extraction.manifestId,
      companyId: seed.companyId,
      koreanName: urlEntry.koreanName ?? extraction.koreanName ?? null,
      title: urlEntry.title ?? extraction.title ?? null,
      documentType: urlEntry.documentType ?? extraction.documentType ?? null,
      period: seed.sourceDocumentDate ?? urlEntry.period ?? extraction.period ?? null,
      sourcePageUrl: urlEntry.sourcePageUrl ?? extraction.sourcePageUrl ?? null,
      publicDocumentUrl: urlEntry.publicDocumentUrl ?? extraction.sourcePageUrl ?? null,
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
  if (sourceBackedClaims.groupId !== "samsung") throw new Error("Samsung claim manifest must use groupId samsung");
  if (sourceBackedClaims.selectionPolicyVersion !== policy.policyVersion) {
    throw new Error("Selection policy version mismatch");
  }
  if (!existsSync(join(rootDir, targetWikiPage))) throw new Error(`Missing wiki target page: ${targetWikiPage}`);
  if ((sourceBackedClaims.records ?? []).length < 15) {
    throw new Error("Samsung source-backed seed should cover the 15-company financial table baseline");
  }
  const narrativeClaimCount = (sourceBackedClaims.records ?? []).filter(
    (record) => record.paperUseLevel === "source-backed-narrative-seed-claim"
  ).length;
  if (narrativeClaimCount !== (narrativeSeeds.records ?? []).length) {
    throw new Error("All Samsung narrative seed claims must be promoted after evidence validation");
  }

  const ids = new Set();
  for (const record of sourceBackedClaims.records) {
    if (ids.has(record.id)) throw new Error(`Duplicate claim id: ${record.id}`);
    ids.add(record.id);
    if (record.groupId !== "samsung") throw new Error(`${record.id} must be groupId samsung`);
    if (record.verificationState !== "source_backed_seed") throw new Error(`${record.id} has invalid state`);
    if (!record.claimText || !record.claimTextSha256) throw new Error(`${record.id} missing claim text/hash`);
    if (!existsSync(join(rootDir, record.targetWikiPage))) {
      throw new Error(`${record.id} targets missing wiki page: ${record.targetWikiPage}`);
    }
    if (!record.officialSource?.sourcePageUrl && !record.officialSource?.providerUrl) {
      throw new Error(`${record.id} missing official source URL`);
    }
    if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
      throw new Error(`${record.id} missing evidence location`);
    }
    for (const ruleId of record.sourceRuleIds) {
      if (!knownPolicyRuleIds.has(ruleId)) throw new Error(`${record.id} references unknown rule ${ruleId}`);
    }
    if (/이자수익|수수료수익|보험수익|보험료수익|순이자/u.test(record.claimText)) {
      throw new Error(`${record.id} appears to redefine financial-company revenue`);
    }
    if (record.paperUseLevel === "source-backed-narrative-seed-claim") {
      if (!record.sourceTextSha256) throw new Error(`${record.id} narrative claim missing sourceTextSha256`);
      if (!record.officialSource?.downloadUrl && !record.officialSource?.sourcePageUrl) {
        throw new Error(`${record.id} narrative claim missing public document URL`);
      }
      if (record.claimType.includes("forward_looking") && !record.runtimeUsePolicy.includes("forward_looking")) {
        throw new Error(`${record.id} forward-looking claim needs a forward-looking runtime policy`);
      }
      for (const location of record.evidenceLocations) {
        if (!location.markdownPath || !location.lineNumber || !location.evidenceNeedleSha256) {
          throw new Error(`${record.id} narrative evidence needs markdown path, line number, and needle hash`);
        }
        if (!location.sourceTextSha256 || location.sourceTextSha256 !== record.sourceTextSha256) {
          throw new Error(`${record.id} narrative evidence sourceTextSha256 mismatch`);
        }
        if (!location.publicDocumentUrl && !location.sourcePageUrl) {
          throw new Error(`${record.id} narrative evidence missing public URL`);
        }
      }
    }
  }

  for (const companyId of ["samsung-life", "samsung-fire-marine", "samsung-securities"]) {
    const limited = sourceBackedClaims.records.find(
      (record) => record.companyId === companyId && record.claimType === "financial_metric_limited"
    );
    if (!limited) throw new Error(`${companyId} needs an explicit missing-revenue limited claim`);
  }

  if ((localSourceAudit.coverage?.listedCompanies?.count ?? 0) < 15) {
    throw new Error("Samsung local source adequacy audit must document the 15-company scope before promotion");
  }
}

async function updateWikiPages(records) {
  const byPage = groupBy(records, (record) => record.targetWikiPage);
  for (const [page, pageRecords] of byPage) {
    const absolutePath = join(rootDir, page);
    const raw = await readFile(absolutePath, "utf8");
    const block = buildWikiBlock(pageRecords);
    await writeFile(absolutePath, replaceGeneratedBlock(raw, "source-backed-seed-claims", block), "utf8");
  }

  const sourcesPath = join(rootDir, "wiki/groups/samsung/sources.md");
  const sourcesRaw = await readFile(sourcesPath, "utf8");
  const sourcesBlock = [
    "## Source-Backed Claim Manifest",
    "",
    "- `raw/manifests/samsung.source-backed-claims.json` records the Samsung source-backed runtime seed claims.",
    "- `docs/41_samsung_source_backed_seed_claims.md` explains the financial and narrative promotion gates.",
    "- Narrative IR/PDF/DART filing claims are runtime-eligible only after public URL intake, extraction hash, and evidence line locator validation pass.",
    "- Finance-company revenue is intentionally blank unless OpenDART provides an accepted explicit revenue account."
  ].join("\n");
  await writeFile(sourcesPath, replaceGeneratedBlock(sourcesRaw, "source-backed-claim-manifest", sourcesBlock), "utf8");
}

function buildWikiBlock(records) {
  const hasNarrativeClaims = records.some((record) => record.paperUseLevel === "source-backed-narrative-seed-claim");
  const intro = hasNarrativeClaims
    ? "These claims are promoted from official issuer IR documents or DART filings after public URL, extraction hash, and evidence line locator checks. They are bounded context, not investment recommendations."
    : "These claims are promoted from OpenDART annual financial-statement API records. They form a reproducible Samsung financial baseline, not a full investment thesis.";
  const lines = [
    "## Source-Backed Seed Claims",
    "",
    intro,
    "",
    "| Claim ID | Company | Claim | Runtime policy |",
    "| --- | --- | --- | --- |"
  ];

  for (const record of records) {
    lines.push(
      `| \`${record.id}\` | ${escapeTable(companyLabel(record.companyId))} | ${escapeTable(record.claimText)} | \`${record.runtimeUsePolicy}\` |`
    );
  }

  lines.push(
    "",
    "Source manifest: `raw/manifests/samsung.source-backed-claims.json`"
  );
  return lines.join("\n");
}

function buildDoc(sourceBackedClaims) {
  const limitedCompanies = sourceBackedClaims.records
    .filter((record) => record.claimType === "financial_metric_limited")
    .map((record) => companyLabel(record.companyId));
  const lines = [
    "# Samsung Source-Backed Seed Claims",
    "",
    `Generated: ${sourceBackedClaims.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This note records the Samsung claims promoted into source-backed seed knowledge. The first layer starts from OpenDART annual financial-statement API records, and the second layer adds a small set of official IR/DART narrative claims only after public URL, extraction hash, and evidence-line checks pass.",
    "",
    "## Why DART First",
    "",
    "The project goal is a paper-ready and commercializable template. For Samsung, several affiliates use different IR sites and some financial affiliates do not expose a simple operating-company-style revenue line through OpenDART. Therefore the first seed set uses only DART account labels that are explicitly present in the API artifact.",
    "",
    "## Finance-Company Boundary",
    "",
    "The seed does not define revenue for financial companies from `이자수익`, `수수료수익`, `보험수익`, `순이자손익`, or related finance-specific accounts. If OpenDART does not provide an accepted explicit `매출액`, `영업수익`, or `수익(매출액)` account, the revenue field remains blank.",
    "",
    `Companies with intentionally limited 2024 claims: ${limitedCompanies.join(", ") || "none"}.`,
    "",
    "## Summary",
    "",
    `- Source-backed seed claims promoted: ${sourceBackedClaims.totals.claims}`,
    `- Annual financial claims: ${sourceBackedClaims.totals.annualFinancialClaims}`,
    `- Limited financial-company claims: ${sourceBackedClaims.totals.limitedFinancialClaims}`,
    `- Trend claims: ${sourceBackedClaims.totals.trendClaims}`,
    `- Narrative seed claims: ${sourceBackedClaims.totals.narrativeSeedClaims}`,
    `- Local-PDF-ready narrative themes held for later review: ${sourceBackedClaims.totals.localPdfReadyThemes}`,
    `- DART-viewer-pending themes: ${sourceBackedClaims.totals.dartViewerPendingThemes}`,
    `- Source-selection policy version: ${sourceBackedClaims.selectionPolicyVersion}`,
    "",
    "## Claims",
    "",
    "| ID | Company | Claim type | Runtime policy |",
    "| --- | --- | --- | --- |"
  ];

  for (const record of sourceBackedClaims.records) {
    lines.push(
      `| \`${record.id}\` | ${escapeTable(companyLabel(record.companyId))} | \`${record.claimType}\` | \`${record.runtimeUsePolicy}\` |`
    );
  }

  lines.push(
    "",
    "## Runtime Rule",
    "",
    "Runtime answers may use these claims only as bounded context. The UI should show investor-facing summaries, while the development trace keeps claim IDs, source status, account labels, and validation details for paper evaluation.",
    "",
    "Narrative claims must preserve their evidence boundary: realized results, management outlook, capital/risk statements, and shareholder-return statements should not be collapsed into a single investment recommendation. Forward-looking claims need explicit labeling in the answer composer and trace.",
    "",
    "## Remaining Work",
    "",
    "1. Use the promoted Samsung narrative claims to build frozen Samsung evaluation scenarios.",
    "2. Add the remaining Samsung C&T 2026Q1 PPT only if an exact document-level URL is supplied.",
    "3. Review whether additional Samsung affiliates need narrative coverage before expanding the same template to SK, Hyundai Motor, and LG.",
    "",
    "## Source References",
    "",
    "- `raw/manifests/samsung.source-backed-claims.json`",
    "- `raw/manifests/samsung.dart-financial-table.2022-2024.json`",
    "- `raw/manifests/samsung.dart-financial-account-audit.2022-2024.json`",
    "- `raw/manifests/samsung.identifier-verification.json`",
    "- `raw/manifests/samsung.local-source-adequacy-audit.json`",
    "- `configs/samsung-narrative-claim-seeds.json`",
    "- `raw/manifests/samsung.document-url-intake.json`",
    "- `raw/manifests/samsung.extraction-report.json`",
    "- `raw/manifests/samsung.dart-filing-extraction-report.json`",
    "- `configs/source-selection-policy.json`"
  );

  return `${lines.join("\n")}\n`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function replaceGeneratedBlock(raw, blockName, block) {
  const start = `<!-- BEGIN GENERATED:${blockName} -->`;
  const end = `<!-- END GENERATED:${blockName} -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, "u");
  if (pattern.test(raw)) return `${raw.replace(pattern, wrapped).trim()}\n`;
  return `${raw.trim()}\n\n${wrapped}\n`;
}

function companyLabel(companyId) {
  return identifierByCompany.get(companyId)?.koreanName ?? companyId;
}

function formatClaimId(sequence) {
  return `samsung-sbc-${String(sequence).padStart(3, "0")}`;
}

function formatEok(value) {
  return Number(value).toLocaleString("ko-KR");
}

function withTopicParticle(name) {
  const value = String(name ?? "");
  const last = value.at(-1);
  if (!last) return value;
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return `${value}는`;
  const hasFinalConsonant = (code - 0xac00) % 28 !== 0;
  return `${value}${hasFinalConsonant ? "은" : "는"}`;
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function escapeTable(text) {
  return String(text).replace(/\|/gu, "\\|").replace(/\n/gu, " ");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function sha256(text) {
  return createHash("sha256").update(String(text).normalize("NFC")).digest("hex");
}
