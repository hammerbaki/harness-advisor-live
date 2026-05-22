import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = process.cwd();
const docsDir = join(rootDir, "docs");
const manifestPath = join(rootDir, "raw", "manifests", "document-consolidation-audit.json");
const docPath = join(docsDir, "76_document_consolidation_audit.md");

const activeDocs = new Set([
  "README.md",
  "01_architecture.md",
  "53_group_onboarding_standard.md",
  "65_product_completion_stage_gate.md",
  "69_knowledge_base_folder_structure.md",
  "70_arxiv_25_company_baseline.md",
  "71_first_slice_selection_criteria.md",
  "72_first_slice_readiness_audit.md",
  "73_first_slice_gap_closure_plan.md",
  "74_paper_capture_ui_mode.md",
  "75_live_api_integration_readiness.md",
  "76_document_consolidation_audit.md",
  "77_ir_download_backfill_import.md",
  "78_project_folder_reclassification.md",
  "79_source_ledger_and_consolidation.md",
  "80_knowledge_base_folder_organization.md",
  "81_ir_download_retirement.md"
]);

const generatedPatterns = [
  /dart_financial_table/u,
  /source_backed/u,
  /narrative_claim_queue/u,
  /readiness_audit/u,
  /completion_audit/u,
  /source_inventory/u,
  /url_and_narrative/u,
  /financial_sector_dart_account_audit/u,
  /source_url_coverage/u
];

const archivePatterns = [
  /^0[0-9]_/u,
  /^14_/u,
  /^15_/u,
  /^25_/u,
  /^26_/u,
  /^30_/u
];

const consolidationGroups = [
  {
    id: "method_harness_engineering",
    title: "Method And Harness",
    match: /^(10|11|16|24|28|29|31|32|33)_/u
  },
  {
    id: "source_governance_and_claim_promotion",
    title: "Source Governance",
    match: /^(20|22|53|66|67|71|72|73)_/u
  },
  {
    id: "five_group_transfer_log",
    title: "Company Transfer Logs",
    match: /^(17|18|19|21|23|35|36|37|39|40|41|42|43|44|45|46|47|48|49|50|52|54|55|56|57|58|60|61|62|63|64)_/u
  },
  {
    id: "publication_strategy",
    title: "Publication Strategy",
    match: /^(34|38|59|74)_/u
  },
  {
    id: "product_stage_control",
    title: "Product Stage Control",
    match: /^(01|12|13|65|68|69|70|75)_/u
  },
  {
    id: "poc_archive",
    title: "PoC Reconstruction Archive",
    match: /^(00|02|03|04|05|06|07|08|09|14|15|25|26|27|30)_/u
  }
];

const docs = readdirSync(docsDir)
  .filter((file) => file.endsWith(".md"))
  .sort();

const automationFiles = [
  "package.json",
  ...listFiles(join(rootDir, "scripts"), [".mjs", ".md"]),
  ...listFiles(join(rootDir, "configs"), [".json", ".md"]),
  ...listFiles(join(rootDir, "server"), [".mjs", ".md"])
];

const automationText = automationFiles
  .map((file) => {
    try {
      return readFileSync(file, "utf8");
    } catch {
      return "";
    }
  })
  .join("\n");

const records = docs.map((file) => {
  const fixedAutomationReference = automationText.includes(`docs/${file}`);
  const generatedLikely = fixedAutomationReference || generatedPatterns.some((pattern) => pattern.test(file));
  const archiveCandidate = archivePatterns.some((pattern) => pattern.test(file));
  const active = activeDocs.has(file);
  const consolidationGroup = consolidationGroups.find((group) => group.match.test(file))?.id ?? "unclassified";
  const action = active
    ? "keep-active"
    : generatedLikely
      ? "keep-generated-until-path-migration"
      : archiveCandidate
        ? "archive-after-safety-pass"
        : "consolidate-after-first-slice";

  return {
    file: `docs/${file}`,
    active,
    fixedAutomationReference,
    generatedLikely,
    archiveCandidate,
    consolidationGroup,
    action
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  totalDocs: records.length,
  activeDocs: records.filter((record) => record.active).length,
  fixedAutomationReferences: records.filter((record) => record.fixedAutomationReference).length,
  generatedLikely: records.filter((record) => record.generatedLikely).length,
  archiveCandidates: records.filter((record) => record.archiveCandidate && !record.active).length,
  unreferencedDocs: records.filter((record) => !record.fixedAutomationReference).length,
  recommendedDailyDocs: activeDocs.size,
  possibleVisibleReductionPct: Math.round((1 - activeDocs.size / records.length) * 100)
};

const grouped = Object.fromEntries(
  consolidationGroups.map((group) => [
    group.id,
    records.filter((record) => record.consolidationGroup === group.id).map((record) => record.file)
  ])
);

const manifest = {
  schemaVersion: "document-consolidation-audit.v0.1",
  ...summary,
  grouped,
  records
};

mkdirSync(join(rootDir, "raw", "manifests"), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(docPath, renderMarkdown(manifest));

console.log(`Document consolidation audit written: ${manifestPath}`);
console.log(`Readable consolidation audit written: ${docPath}`);
console.log(`${summary.totalDocs} docs checked; active reading path ${summary.activeDocs}; possible visible reduction ${summary.possibleVisibleReductionPct}%.`);

function listFiles(dir, extensions) {
  if (!existsSync(dir)) return [];
  const output = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      output.push(...listFiles(fullPath, extensions));
    } else if (extensions.some((extension) => entry.name.endsWith(extension))) {
      output.push(fullPath);
    }
  }
  return output;
}

function renderMarkdown(audit) {
  const actionCounts = countBy(audit.records, "action");
  const groupRows = consolidationGroups.map((group) => {
    const files = audit.grouped[group.id] ?? [];
    return `| ${group.title} | \`${group.id}\` | ${files.length} |`;
  });

  return [
    "# Document Consolidation Audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Verdict",
    "",
    "The documentation set is useful but too large for daily product work. The correct approach is staged consolidation: keep fixed-path generated documents in place until script outputs are migrated, but reduce the daily reading path to a small active set now.",
    "",
    "## Whole-Folder Check",
    "",
    "| Check | Count | Meaning |",
    "| --- | ---: | --- |",
    `| Markdown files in \`docs/\` | ${audit.totalDocs} | Full trace and evidence corpus. |`,
    `| Active reading path | ${audit.activeDocs} | Practical daily-document set. |`,
    `| Direct automation references | ${audit.fixedAutomationReferences} | Moving these requires script/config updates. |`,
    `| Likely generated/evidence logs | ${audit.generatedLikely} | Keep machine-addressable until paths are migrated. |`,
    `| Archive candidates | ${audit.archiveCandidates} | Historical PoC/stage notes that can be moved later. |`,
    `| Possible visible reduction | ${audit.possibleVisibleReductionPct}% | Reduction in daily-facing docs if active path is enforced. |`,
    "",
    "## Action Counts",
    "",
    "| Action | Files |",
    "| --- | ---: |",
    ...Object.entries(actionCounts).map(([action, count]) => `| \`${action}\` | ${count} |`),
    "",
    "## Active Reading Path",
    "",
    ...audit.records
      .filter((record) => record.active)
      .map((record) => `- \`${record.file}\``),
    "",
    "## Consolidation Groups",
    "",
    "| Future document | Group ID | Current files |",
    "| --- | --- | ---: |",
    ...groupRows,
    "",
    "## Why Not Move Everything Now",
    "",
    "Several scripts and exports write to or validate fixed document paths. Moving generated documents immediately would break reproducibility unless those scripts are migrated in the same change. The safe sequence is:",
    "",
    "1. keep all fixed-path documents in place during first-slice backfill;",
    "2. use `docs/README.md` as the active reading path;",
    "3. after the 25-company slice is stable, migrate script output paths to `docs/generated/`;",
    "4. move older PoC/stage notes to `docs/archive/`;",
    "5. create synthesized method, source-governance, company-transfer, and publication documents.",
    "",
    "## Proposed Final Shape",
    "",
    "```text",
    "docs/",
    "  README.md",
    "  architecture.md",
    "  method_harness_engineering.md",
    "  source_governance_and_claim_promotion.md",
    "  first_slice_25_company_baseline.md",
    "  live_api_and_runtime_trace.md",
    "  paper_capture_ui_mode.md",
    "  publication_strategy.md",
    "  company-transfer/",
    "    hanwha.md",
    "    samsung.md",
    "    sk.md",
    "    hyundai-motor.md",
    "    lg.md",
    "  generated/",
    "  archive/",
    "```",
    "",
    "## Machine-Readable Artifact",
    "",
    "The machine-readable classification is stored in `raw/manifests/document-consolidation-audit.json`.",
    ""
  ].join("\n");
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] ?? 0) + 1;
    return acc;
  }, {});
}
