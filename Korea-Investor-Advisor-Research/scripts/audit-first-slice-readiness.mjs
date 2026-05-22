import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url)).replace(/\/scripts$/, "");

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const policyPath = "configs/first-slice-selection-policy.json";
const outputPath = "raw/manifests/first-slice-readiness-audit.json";
const docPath = "docs/72_first_slice_readiness_audit.md";

const policy = await readJson(policyPath);
const groupsConfig = await readJson("configs/groups.json");

const groupConfigById = new Map((groupsConfig.groups ?? []).map((group) => [group.id, group]));

const groupAudits = [];

for (const groupId of groupIds) {
  const template = await readJson(`raw/manifests/${groupId}.source-intake-template.json`);
  const localSources = await readJsonIfExists(`raw/manifests/${groupId}.local-sources.json`, { entries: [] });
  const extraction = await readJsonIfExists(`raw/manifests/${groupId}.extraction-report.json`, { results: [] });
  const claims = await readJsonIfExists(`raw/manifests/${groupId}.source-backed-claims.json`, { records: [] });
  const dartFinancials = await readJsonIfExists(`raw/manifests/${groupId}.dart-financial-table.2022-2024.json`, { records: [] });
  const groupConfig = groupConfigById.get(groupId);
  const configuredCompanies = new Map((groupConfig?.companies ?? []).map((company) => [company.id, company]));
  const sourceEntries = localSources.entries ?? [];
  const extractionRows = extraction.results ?? extraction.records ?? extraction.entries ?? [];
  const claimRecords = claims.records ?? [];
  const dartRows = dartFinancials.records ?? dartFinancials.entries ?? [];
  const firstSlice = template.firstSliceCompanies ?? [];
  const policyCompanies = new Map((policy.firstSliceCompanies?.[groupId] ?? []).map((company) => [company.companyId, company]));

  const companyAudits = firstSlice.map((company) => {
    const configured = configuredCompanies.get(company.companyId);
    const policyRecord = policyCompanies.get(company.companyId);
    const sources = sourceEntries.filter((entry) => entry.companyId === company.companyId);
    const sourceIds = new Set(sources.map((entry) => entry.id).filter(Boolean));
    const extracted = extractionRows.filter(
      (entry) => entry.companyId === company.companyId || sourceIds.has(entry.manifestId)
    );
    const promotedClaims = claimRecords.filter((record) => record.companyId === company.companyId);
    const financialRows = dartRows.filter((record) => record.companyId === company.companyId && record.status === "ok");
    const wikiPath = `wiki/groups/${groupId}/companies/${company.companyId}.md`;

    const provenanceReadySources = sources.filter(hasSourceProvenance);
    const selectionReasonSources = sources.filter((entry) => Boolean(entry.selectionReason || entry.selectionRationale));
    const annualOrFilingSources = sources.filter(isAnnualOrFilingSource);
    const earningsSources = sources.filter(isEarningsSource);
    const capitalSources = sources.filter(isCapitalOrInvestorSource);
    const okExtractionRows = extracted.filter((entry) => entry.extractionStatus === "ok");

    const gaps = [];
    if (!configured?.krxCode || !configured?.dartCode) gaps.push("identifier-missing");
    if (sources.length === 0) gaps.push("source-package-needed");
    if (sources.length > 0 && provenanceReadySources.length === 0) gaps.push("source-provenance-needed");
    if (sources.length > 0 && selectionReasonSources.length === 0) gaps.push("selection-reason-needed");
    if (sources.length > 0 && annualOrFilingSources.length === 0 && financialRows.length === 0) {
      gaps.push("annual-or-dart-filing-needed");
    }
    if (sources.length > 0 && earningsSources.length === 0) gaps.push("earnings-material-needed");
    if (sources.length > 0 && okExtractionRows.length === 0) gaps.push("extraction-needed");
    if (promotedClaims.length === 0) gaps.push("source-backed-claim-needed");
    if (!existsSync(join(rootDir, wikiPath))) gaps.push("wiki-company-page-needed");

    const readiness = classifyReadiness(gaps, {
      sourceCount: sources.length,
      claimCount: promotedClaims.length,
      hasWikiPage: existsSync(join(rootDir, wikiPath))
    });

    return {
      groupId,
      companyId: company.companyId,
      koreanName: company.koreanName,
      displayName: company.displayName,
      krxCode: configured?.krxCode ?? company.krxCode ?? null,
      dartCode: configured?.dartCode ?? company.dartCode ?? null,
      selectionRationale: policyRecord?.rationale ?? null,
      selectionCriteria: policyRecord?.criteria ?? [],
      sourcePackage: {
        localSources: sources.length,
        sourcesWithPublicProvenance: provenanceReadySources.length,
        sourcesWithSelectionReason: selectionReasonSources.length,
        annualOrDartFilingSources: annualOrFilingSources.length + financialRows.length,
        earningsSources: earningsSources.length,
        investorOrCapitalSources: capitalSources.length,
        extractedOk: okExtractionRows.length,
        lowTextWarnings: extracted.filter((entry) => entry.lowTextWarning).length
      },
      runtimeKnowledge: {
        sourceBackedClaims: promotedClaims.length,
        claimTypes: countBy(promotedClaims, (record) => record.claimType ?? "unknown"),
        wikiCompanyPage: existsSync(join(rootDir, wikiPath)) ? wikiPath : null
      },
      readiness,
      gaps,
      nextAction: nextActionFor(gaps)
    };
  });

  groupAudits.push({
    groupId,
    totalFirstSliceCompanies: companyAudits.length,
    readinessCounts: countBy(companyAudits, (company) => company.readiness),
    totalOpenGaps: companyAudits.reduce((sum, company) => sum + company.gaps.length, 0),
    companies: companyAudits
  });
}

const allCompanies = groupAudits.flatMap((group) => group.companies);

const output = {
  schemaVersion: "first-slice-readiness-audit.v0.1",
  generatedAt: new Date().toISOString(),
  selectionPolicyPath: policyPath,
  selectionPolicyVersion: policy.policyVersion,
  scope: policy.design,
  purpose:
    "Company-level readiness audit for the 25-company first paper/product reference slice. Selection fitness and current source-backed runtime readiness are intentionally separated.",
  totals: {
    groups: groupAudits.length,
    companies: allCompanies.length,
    readinessCounts: countBy(allCompanies, (company) => company.readiness),
    openGaps: allCompanies.reduce((sum, company) => sum + company.gaps.length, 0),
    companiesWithSourceBackedClaims: allCompanies.filter((company) => company.runtimeKnowledge.sourceBackedClaims > 0).length,
    companiesWithLocalSources: allCompanies.filter((company) => company.sourcePackage.localSources > 0).length,
    companiesWithWikiPages: allCompanies.filter((company) => Boolean(company.runtimeKnowledge.wikiCompanyPage)).length
  },
  groups: groupAudits
};

await mkdir(join(rootDir, dirname(outputPath)), { recursive: true });
await writeFile(join(rootDir, outputPath), `${JSON.stringify(output, null, 2)}\n`, "utf8");
await writeFile(join(rootDir, docPath), renderDoc(output), "utf8");

console.log(`First-slice readiness audit written: ${outputPath}`);
console.log(`Readable audit note written: ${docPath}`);
console.log(`${output.totals.openGaps} open gap(s) across ${output.totals.companies} first-slice companies.`);

function classifyReadiness(gaps, context) {
  if (gaps.includes("identifier-missing")) return "blocked-identifier";
  if (gaps.includes("source-package-needed")) return "needs-source-package";
  if (gaps.includes("source-provenance-needed") || gaps.includes("selection-reason-needed")) return "needs-source-reconciliation";
  if (gaps.includes("extraction-needed")) return "needs-extraction";
  if (gaps.includes("source-backed-claim-needed")) return "needs-claim-promotion";
  if (!context.hasWikiPage) return "needs-wiki-page";
  if (gaps.includes("annual-or-dart-filing-needed") || gaps.includes("earnings-material-needed")) {
    return "needs-source-package-completion";
  }
  if (context.claimCount > 0) return "runtime-seed-ready";
  return "review-ready";
}

function nextActionFor(gaps) {
  if (gaps.includes("identifier-missing")) return "verify KRX and OpenDART identifiers";
  if (gaps.includes("source-package-needed")) return "collect annual report, earnings material, investor/capital-allocation source, and source provenance ledger";
  if (gaps.includes("source-provenance-needed")) return "attach official IR source page, document URL, or DART receipt URL";
  if (gaps.includes("selection-reason-needed")) return "add one-line source selection reason to source provenance ledger";
  if (gaps.includes("annual-or-dart-filing-needed")) return "add annual report or DART filing evidence";
  if (gaps.includes("earnings-material-needed")) return "add recent earnings or quarterly materials";
  if (gaps.includes("extraction-needed")) return "run extraction and check low-text warnings";
  if (gaps.includes("source-backed-claim-needed")) return "promote at least one atomic source-backed claim with evidence locator";
  if (gaps.includes("wiki-company-page-needed")) return "compile or update company wiki page";
  return "maintain as first-slice runtime seed";
}

function hasSourceProvenance(entry) {
  return Boolean(entry.publicDocumentUrl || entry.sourcePageUrl || entry.dartReceiptUrl || entry.rceptNo || entry.sourceUrl);
}

function isAnnualOrFilingSource(entry) {
  const text = `${entry.documentType ?? ""} ${entry.sourceCategory ?? ""} ${entry.title ?? ""} ${entry.filename ?? ""}`.toLowerCase();
  return /annual|business_report|periodic|audit|사업보고서|분기보고서|반기보고서/.test(text) || Boolean(entry.dartReceiptUrl || entry.rceptNo);
}

function isEarningsSource(entry) {
  const text = `${entry.documentType ?? ""} ${entry.sourceCategory ?? ""} ${entry.title ?? ""} ${entry.filename ?? ""}`.toLowerCase();
  return /earnings|review|quarter|ir|presentation|실적|분기|review_report/.test(text);
}

function isCapitalOrInvestorSource(entry) {
  const text = `${entry.documentType ?? ""} ${entry.sourceCategory ?? ""} ${entry.title ?? ""} ${entry.filename ?? ""} ${entry.requestPackage ?? ""}`.toLowerCase();
  return /value|shareholder|dividend|capital|investor|ir|presentation|주주|배당|기업가치|밸류업|pkg-04/.test(text);
}

function renderDoc(audit) {
  const lines = [
    "# First-Slice Readiness Audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This audit checks whether the selected 25-company first slice is ready for the same source-to-claim harness. It separates selection fitness from current runtime readiness: a company can be correctly selected while still needing source reconciliation or claim promotion.",
    "",
    "## Summary",
    "",
    `- Groups checked: ${audit.totals.groups}`,
    `- First-slice companies checked: ${audit.totals.companies}`,
    `- Companies with local sources: ${audit.totals.companiesWithLocalSources}`,
    `- Companies with source-backed claims: ${audit.totals.companiesWithSourceBackedClaims}`,
    `- Companies with wiki pages: ${audit.totals.companiesWithWikiPages}`,
    `- Open readiness gaps: ${audit.totals.openGaps}`,
    "",
    "## Readiness Counts",
    "",
    table(
      ["Readiness", "Companies"],
      Object.entries(audit.totals.readinessCounts).map(([status, count]) => [`\`${status}\``, String(count)])
    ),
    "",
    "## Group Summary",
    "",
    table(
      ["Group", "Companies", "Readiness", "Open gaps"],
      audit.groups.map((group) => [
        `\`${group.groupId}\``,
        String(group.totalFirstSliceCompanies),
        Object.entries(group.readinessCounts).map(([key, value]) => `\`${key}\`: ${value}`).join("<br>"),
        String(group.totalOpenGaps)
      ])
    ),
    ""
  ];

  for (const group of audit.groups) {
    lines.push(`## ${group.groupId}`, "");
    lines.push(
      table(
        ["Company", "Sources", "Provenance", "Extracted", "Claims", "Wiki", "Readiness", "Next action"],
        group.companies.map((company) => [
          `${company.koreanName}<br><code>${company.companyId}</code>`,
          String(company.sourcePackage.localSources),
          String(company.sourcePackage.sourcesWithPublicProvenance),
          String(company.sourcePackage.extractedOk),
          String(company.runtimeKnowledge.sourceBackedClaims),
          company.runtimeKnowledge.wikiCompanyPage ? "yes" : "no",
          `\`${company.readiness}\``,
          company.nextAction
        ])
      ),
      "",
      "### Selection Rationale",
      ""
    );
    for (const company of group.companies) {
      lines.push(`- \`${company.companyId}\`: ${company.selectionRationale ?? "No rationale recorded."}`);
    }
    lines.push("");
  }

  lines.push(
    "## Interpretation",
    "",
    "The 25-company selection remains valid if it satisfies the first-slice criteria, even when some companies still need source packages or claim promotion. The product should not expose affiliate-level selection as complete until each first-slice company has at least one promoted source-backed claim and a company wiki page.",
    "",
    "## Related Artifacts",
    "",
    "- `configs/first-slice-selection-policy.json`",
    "- `docs/71_first_slice_selection_criteria.md`",
    "- `docs/70_arxiv_25_company_baseline.md`",
    "- `raw/manifests/first-slice-readiness-audit.json`",
    ""
  );

  return `${lines.join("\n")}\n`;
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`)
  ].join("\n");
}

function countBy(records, fn) {
  return records.reduce((acc, record) => {
    const key = fn(record);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function readJsonIfExists(relativePath, fallback) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) return fallback;
  return readJson(relativePath);
}
