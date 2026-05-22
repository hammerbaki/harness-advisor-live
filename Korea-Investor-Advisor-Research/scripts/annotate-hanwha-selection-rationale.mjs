import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = join(rootDir, "raw", "manifests", "hanwha.selection-rationale.json");
const markdownPath = join(rootDir, "docs", "19_hanwha_source_selection_rationale.md");

const inventory = await readJson("raw/manifests/hanwha.local-sources.json");
const provenance = await readJson("raw/manifests/hanwha.source-provenance.json");
const extraction = await readJson("raw/manifests/hanwha.extraction-report.json");
const officialScan = await readJson("raw/manifests/hanwha.official-site-scan.json");
const sourceSelectionPolicy = await readJson("configs/source-selection-policy.json");

const provenanceById = new Map(provenance.localSources.map((source) => [source.manifestId, source]));
const extractionById = new Map(extraction.results.map((result) => [result.manifestId, result]));
const records = inventory.entries.map((entry) => buildRecord(entry));

const output = {
  schemaVersion: "group-source-selection-rationale.v0.2",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  selectionPolicyPath: "configs/source-selection-policy.json",
  selectionPolicyVersion: sourceSelectionPolicy.policyVersion,
  selectionScope:
    "This manifest records why each local source is retained, restricted, or held for review under the common source-selection policy.",
  scopeConclusion:
    "The 31 local files are a scoped Hanwha reference-slice corpus, not a complete official Hanwha IR archive.",
  sourceBasis:
    "Rationales are inferred from local inventory metadata, official Hanwha IR provenance matches, extraction status, rights boundaries, and investor-advisor research requirements.",
  paperPolicy: {
    mayClaim:
      "Each retained source has an explicit rule-based inclusion rationale and, where applicable, official Hanwha IR provenance.",
    mustNotClaim:
      "Do not claim complete archive coverage unless the official-route gap audit confirms complete coverage.",
    analystReports:
      "Third-party analyst reports are secondary market-view context only. Do not redistribute full text unless rights are separately verified."
  },
  totals: {
    localSources: records.length,
    officialProvenanceMatched: records.filter(
      (record) => record.officialProvenanceStatus === "official-site-matched"
    ).length,
    byRationaleCategory: countBy(records, (record) => record.rationaleCategory),
    byPaperUseLevel: countBy(records, (record) => record.paperUseLevel),
    byKeepDecision: countBy(records, (record) => record.keepDecision),
    officialDownloadsMissingLocal: officialScan.totals?.downloadsMissingLocal ?? null
  },
  records
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
await writeFile(markdownPath, renderMarkdown(output));

console.log(`Hanwha selection rationale written: ${relative(rootDir, outputPath)}`);
console.log(`Hanwha selection rationale doc written: ${relative(rootDir, markdownPath)}`);
console.log(
  `${output.totals.localSources} local source(s), ` +
    `${output.totals.officialProvenanceMatched} official provenance match(es), ` +
    `${Object.keys(output.totals.byRationaleCategory).length} rationale categor(ies).`
);

function buildRecord(entry) {
  const linkedProvenance = provenanceById.get(entry.id);
  const extractionResult = extractionById.get(entry.id);
  const rationale = classify(entry, linkedProvenance, extractionResult);

  return {
    manifestId: entry.id,
    title: entry.title,
    filename: entry.filename,
    localPath: entry.localPath,
    sha256: entry.sha256,
    folderYear: entry.folderYear,
    documentDate: entry.documentDate,
    sourceCategory: entry.sourceCategory,
    inferredSourceRole: entry.inferredSourceRole,
    officialProvenanceStatus: linkedProvenance?.officialProvenanceStatus ?? "not-matched",
    officialSource: linkedProvenance?.officialSource ?? null,
    extractionStatus: extractionResult?.extractionStatus ?? "not-extracted",
    extractionTextSha256: extractionResult?.textSha256 ?? null,
    selectionBasisType: "policy-rule-based-rationale",
    selectionPolicyVersion: sourceSelectionPolicy.policyVersion,
    selectionRuleIds: rationale.selectionRuleIds,
    rationaleCategory: rationale.category,
    selectionRationale: rationale.selectionRationale,
    paperUseLevel: rationale.paperUseLevel,
    commercialUse: rationale.commercialUse,
    keepDecision: rationale.keepDecision,
    limitations: rationale.limitations,
    nextAction: rationale.nextAction
  };
}

function classify(entry, linkedProvenance, extractionResult) {
  const title = entry.title;
  const provenanceText = `${linkedProvenance?.officialSource?.rowTitle ?? ""} ${linkedProvenance?.officialSource?.fileName ?? ""}`;
  const sourceKind = linkedProvenance?.officialSource?.sourceKind;
  const baseLimitations = [
    "Claims still require claim-level source linking before runtime use."
  ];

  if (entry.inferredSourceRole === "third_party_analyst") {
    return {
      category: "external-market-view-secondary-context",
      selectionRuleIds: ["SRC-08", "SRC-09", "SRC-11"],
      selectionRationale:
        "Retain as secondary evidence for current external market interpretation, analyst disagreement, valuation narratives, and contradiction checks around Hanwha. It should not be treated as the primary source for issuer facts.",
      paperUseLevel: "secondary-context-only",
      commercialUse:
        "Use metadata and short notes to compare market views; do not expose or summarize licensed full text without rights clearance.",
      keepDecision: "keep-metadata-only",
      limitations: [
        ...baseLimitations,
        "Analyst reports may be licensed or copyright restricted.",
        "Facts must be re-checked against issuer filings or public official sources."
      ],
      nextAction: "Record report date, publisher, title, access basis, and source note; avoid full-text redistribution."
    };
  }

  if (sourceKind === "official_governance" || entry.sourceCategory === "governance") {
    const extractionReady = extractionResult?.extractionStatus === "ok";
    return {
      category: "governance-baseline",
      selectionRuleIds: ["SRC-01", "SRC-07", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain as the governance and corporate-rule baseline for the Hanwha reference slice. It supports governance-sensitive explanations such as capital actions, shareholder rights, and board or articles-of-incorporation context.",
      paperUseLevel: extractionReady ? "primary-source-candidate" : "primary-source-candidate-after-type-check",
      commercialUse: "Use after citation normalization for governance-related responses.",
      keepDecision: extractionReady ? "keep-reference-baseline" : "keep-after-type-verification",
      limitations: extractionReady ? baseLimitations : [
        ...baseLimitations,
        "The local file has no PDF extension and must be type-checked before extraction automation."
      ],
      nextAction: extractionReady
        ? "Link governance claims to official page URLs and extracted-text hashes."
        : "Verify media type, extract or manually register canonical sections, and link governance claims to official page URLs."
    };
  }

  if (title.includes("기업가치 제고") || /기업설명회|인적분할|주주가치/u.test(`${title} ${provenanceText}`)) {
    return {
      category: "value-up-core-official-ir",
      selectionRuleIds: ["SRC-01", "SRC-06", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain as the central official source for Hanwha's value-up and shareholder-value narrative in the reference slice. It is directly relevant to investor-advisor positioning and the paper's traceable demo architecture.",
      paperUseLevel: "primary-source-candidate",
      commercialUse:
        "Use as a high-priority official context source for value-up, capital allocation, shareholder-return, and investment-thesis responses after claim-level review.",
      keepDecision: "keep-core-source",
      limitations: baseLimitations,
      nextAction: "Promote atomic value-up claims into the LLM Wiki with source page, download URL, and extracted-text hash."
    };
  }

  if (title.includes("Earnings")) {
    return {
      category: "current-earnings-core-official-ir",
      selectionRuleIds: ["SRC-01", "SRC-05", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain as a current official earnings source for financial summary, segment-performance, and investor-briefing examples in the demo.",
      paperUseLevel: "primary-source-candidate",
      commercialUse:
        "Use as a high-priority official earnings context source after numbers, periods, and segment labels are normalized in code.",
      keepDecision: "keep-core-source",
      limitations: baseLimitations,
      nextAction: "Extract headline metrics into typed financial fields and link wiki claims to the official IR download."
    };
  }

  if (title.includes("우선주")) {
    return {
      category: "capital-structure-shareholder-action",
      selectionRuleIds: ["SRC-01", "SRC-06", "SRC-07", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain because preferred-share and capital-structure actions can materially affect investor interpretation of shareholder return, liquidity, and governance signals.",
      paperUseLevel: "primary-source-candidate",
      commercialUse:
        "Use for capital-action explanations only after the transaction details are reduced to deterministic typed fields.",
      keepDecision: "keep-core-source",
      limitations: baseLimitations,
      nextAction: "Create typed fields for security class, action type, date, quantity/amount, and issuer statement."
    };
  }

  if (sourceKind === "official_audit_report" || title.includes("감사보고서")) {
    return {
      category: "audited-financial-baseline",
      selectionRuleIds: ["SRC-01", "SRC-03", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain as an audited financial baseline. Audit and consolidated audit reports provide a primary-source check against hallucinated or stale financial statements.",
      paperUseLevel: "primary-source-candidate",
      commercialUse:
        "Use for verified financial-history and accounting-grounded responses after specific metrics are linked at claim level.",
      keepDecision: "keep-reference-baseline",
      limitations: [
        ...baseLimitations,
        "Older audit reports are baseline context, not proof that the local folder is a full historical archive."
      ],
      nextAction: extractionResult?.extractionStatus === "ok"
        ? "Review extracted text and promote only specific audited claims with page/section hints."
        : "Run extraction or manually inspect before claim promotion."
    };
  }

  if (sourceKind === "official_periodic_report" || entry.sourceCategory === "periodic_report") {
    return {
      category: "periodic-disclosure-baseline",
      selectionRuleIds: ["SRC-01", "SRC-02", "SRC-04", "SRC-09", "SRC-10", "SRC-11"],
      selectionRationale:
        "Retain as official periodic disclosure context for revenues, operating income, risks, business segments, investments, and period-specific updates. These filings are the backbone for deterministic claim extraction.",
      paperUseLevel: "primary-source-candidate",
      commercialUse:
        "Use for financial, risk, and segment claims after DART receipt numbers and typed metric extraction are added.",
      keepDecision: "keep-reference-baseline",
      limitations: [
        ...baseLimitations,
        "DART receipt numbers should be added as canonical filing identifiers."
      ],
      nextAction: "Add DART receipt number/public filing URL and extract typed metrics or atomic claims."
    };
  }

  return {
    category: "manual-review-needed",
    selectionRuleIds: ["SRC-09", "SRC-11"],
    selectionRationale:
      "Retain temporarily because it is present in the local corpus and matched through the existing inventory workflow, but its paper/commercial role needs manual review.",
    paperUseLevel: "hold-until-reviewed",
    commercialUse: "Do not use at runtime until a source role and claim-level use case are assigned.",
    keepDecision: "review",
    limitations: baseLimitations,
    nextAction: "Classify source role, verify provenance, and decide whether it belongs in the reference slice."
  };
}

function renderMarkdown(output) {
  const rows = output.records.map((record) => [
    record.title,
    record.inferredSourceRole,
    record.rationaleCategory,
    record.selectionRuleIds.join(", "),
    record.paperUseLevel,
    record.keepDecision,
    record.officialSource?.sourcePageUrl ?? ""
  ]);

  return `# Hanwha Source Selection Rationale

Audit date: 2026-05-01

## Purpose

This document records why each local Hanwha source is retained, restricted, or
held for review under the common source-selection policy. The same policy is
intended to apply to Samsung, SK, Hyundai Motor, LG, Hanwha, and future target
groups.

Policy reference: \`${output.selectionPolicyPath}\`

Policy version: \`${output.selectionPolicyVersion}\`

## Common Selection Rules

| Rule | Name | Required for |
| --- | --- | --- |
${sourceSelectionPolicy.selectionRules
  .map((rule) => `| ${markdownCell(rule.id)} | ${markdownCell(rule.name)} | ${markdownCell(rule.requiredFor)} |`)
  .join("\n")}

## Scope Decision

The local corpus is a scoped Hanwha reference slice, not a full official archive.
The official crawl found ${output.totals.officialDownloadsMissingLocal} official
downloads that are not present locally. Those missing files should be pulled
only when a claim, evaluation scenario, or paper method requires them.

## Totals

- local sources: ${output.totals.localSources}
- official provenance matches: ${output.totals.officialProvenanceMatched}
- rationale categories: ${formatCounts(output.totals.byRationaleCategory)}
- paper use levels: ${formatCounts(output.totals.byPaperUseLevel)}

## Per-Source Rationale

| Source | Role | Rationale category | Rule IDs | Paper use | Keep decision | Official page |
| --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`).join("\n")}

## Paper Wording

Safe wording:

\`\`\`text
The Hanwha reference slice applies a common source-selection policy to 31 local
source files, recording official provenance, source type, extraction status,
rights boundary, selection rule IDs, and paper/runtime use levels for each
source.
\`\`\`

Unsafe wording:

\`\`\`text
The Hanwha corpus is a complete official IR archive.
\`\`\`

## Source References

- \`raw/manifests/hanwha.local-sources.json\`
- \`raw/manifests/hanwha.source-provenance.json\`
- \`raw/manifests/hanwha.selection-rationale.json\`
- \`raw/manifests/hanwha.official-site-scan.json\`
- \`configs/source-selection-policy.json\`
`;
}

async function readJson(relativePath) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) throw new Error(`Missing required artifact: ${relativePath}`);
  return JSON.parse(await readFile(absolutePath, "utf8"));
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function formatCounts(counts) {
  return Object.entries(counts)
    .map(([key, count]) => `${key}=${count}`)
    .join(", ");
}

function markdownCell(value) {
  return String(value).replace(/\|/gu, "\\|").replace(/\n/gu, " ");
}
