import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const rootDir = process.cwd();
const projectRoot = dirname(rootDir);
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(projectRoot, "Knowledge Base"));
const sourceLedgerPath = join(rootDir, "raw", "manifests", "source-ledger.v0.1.json");
const companyIndexPath = join(rootDir, "raw", "manifests", "company-source-index.json");
const taxonomyPath = join(rootDir, "configs", "source-folder-taxonomy.json");
const organizationManifestPath = join(rootDir, "raw", "manifests", "knowledge-base-organization.json");
const docPath = join(rootDir, "docs", "80_knowledge_base_folder_organization.md");

const groupFolders = {
  samsung: "samsung_knowledge",
  sk: "sk_knowledge",
  "hyundai-motor": "hyundai_knowledge",
  lg: "lg_knowledge",
  hanwha: "hanhwa_knowledge"
};

if (!existsSync(knowledgeBaseRoot)) {
  throw new Error(`Knowledge Base folder not found: ${knowledgeBaseRoot}`);
}
if (!existsSync(sourceLedgerPath)) {
  throw new Error(`Source ledger not found. Run npm run audit:source-ledger first: ${sourceLedgerPath}`);
}

const ledger = JSON.parse(readFileSync(sourceLedgerPath, "utf8"));
const companyIndex = JSON.parse(readFileSync(companyIndexPath, "utf8"));
const taxonomy = JSON.parse(readFileSync(taxonomyPath, "utf8"));
const taxonomyIndex = buildTaxonomyIndex(taxonomy);
const indexDir = join(knowledgeBaseRoot, "_index");
mkdirSync(indexDir, { recursive: true });

const systemFiles = listFiles(knowledgeBaseRoot).filter((file) => basename(file) === ".DS_Store");
const folderTaxonomyRows = buildFolderTaxonomyRows({ knowledgeBaseRoot, taxonomyIndex });
const topLevel = readdirSync(knowledgeBaseRoot, { withFileTypes: true })
  .filter((entry) => !entry.name.startsWith("."))
  .map((entry) => ({
    name: entry.name,
    type: entry.isDirectory() ? "directory" : "file",
    path: relative(projectRoot, join(knowledgeBaseRoot, entry.name)).normalize("NFC")
  }))
  .sort((a, b) => localeCompare(a.name, b.name));

const groupDocs = [];
for (const group of ledger.byGroup ?? []) {
  const folderName = groupFolders[group.groupId];
  if (!folderName) continue;
  const groupDir = join(knowledgeBaseRoot, folderName);
  if (!existsSync(groupDir)) continue;
  const companies = (companyIndex.companies ?? [])
    .filter((company) => company.groupId === group.groupId)
    .sort((a, b) => localeCompare(a.companyId, b.companyId));
  const readmePath = join(groupDir, "README.md");
  writeFileSync(readmePath, renderGroupReadme({ group, companies, folderName }));
  groupDocs.push(relative(projectRoot, readmePath).normalize("NFC"));
}

writeFileSync(join(knowledgeBaseRoot, "README.md"), renderRootReadme({ ledger, topLevel, systemFiles }));
writeFileSync(join(indexDir, "README.md"), renderIndexReadme({ ledger }));
writeFileSync(join(indexDir, "company-source-index.md"), renderCompanyIndexMarkdown(companyIndex));
writeFileSync(join(indexDir, "group-source-summary.md"), renderGroupSummaryMarkdown(ledger));
writeFileSync(join(indexDir, "company-source-index.csv"), renderCompanyIndexCsv(companyIndex));
writeFileSync(join(indexDir, "group-source-summary.csv"), renderGroupSummaryCsv(ledger));
writeFileSync(join(indexDir, "folder-taxonomy.md"), renderFolderTaxonomyMarkdown({ taxonomy, folderTaxonomyRows }));
writeFileSync(join(indexDir, "folder-taxonomy.csv"), renderFolderTaxonomyCsv(folderTaxonomyRows));
writeFileSync(join(indexDir, "system-files-to-ignore.md"), renderSystemFiles(systemFiles));
writeFileSync(
  join(indexDir, "source-ledger-pointer.json"),
  `${JSON.stringify({
    schemaVersion: "source-ledger-pointer.v0.1",
    generatedAt: new Date().toISOString(),
    sourceLedger: relative(projectRoot, sourceLedgerPath).normalize("NFC"),
    companySourceIndex: relative(projectRoot, companyIndexPath).normalize("NFC"),
    note: "The canonical source ledger stays in the active product repository. This pointer keeps Knowledge Base organized without duplicating large generated manifests."
  }, null, 2)}\n`
);

const organization = {
  schemaVersion: "knowledge-base-organization.v0.1",
  generatedAt: new Date().toISOString(),
  knowledgeBaseRoot: relative(projectRoot, knowledgeBaseRoot).normalize("NFC"),
  sourceLedger: relative(projectRoot, sourceLedgerPath).normalize("NFC"),
  policy:
    "Logical organization only. Raw files remain in their provenance-preserving group/company folders; index files are generated for product and paper workflows.",
  summary: {
    sourceRecords: ledger.summary.sourceRecords,
    companyRecords: ledger.summary.companyRecords,
    pdfSources: ledger.summary.pdfSources,
    sourcesWithUrl: ledger.summary.sourcesWithUrl,
    sourcesWithSelectionReason: ledger.summary.sourcesWithSelectionReason,
    irDownloadMatchedSources: ledger.summary.irDownloadMatchedSources,
    topLevelItems: topLevel.length,
    foldersClassified: folderTaxonomyRows.length,
    foldersNeedingReview: folderTaxonomyRows.filter((row) => row.canonicalCategory === "misc").length,
    systemFilesIgnored: systemFiles.length,
    groupReadmesWritten: groupDocs.length
  },
  generatedFiles: [
    "Knowledge Base/README.md",
    "Knowledge Base/_index/README.md",
    "Knowledge Base/_index/company-source-index.md",
    "Knowledge Base/_index/group-source-summary.md",
    "Knowledge Base/_index/company-source-index.csv",
    "Knowledge Base/_index/group-source-summary.csv",
    "Knowledge Base/_index/folder-taxonomy.md",
    "Knowledge Base/_index/folder-taxonomy.csv",
    "Knowledge Base/_index/system-files-to-ignore.md",
    "Knowledge Base/_index/source-ledger-pointer.json",
    ...groupDocs
  ]
};

mkdirSync(dirname(organizationManifestPath), { recursive: true });
writeFileSync(organizationManifestPath, `${JSON.stringify(organization, null, 2)}\n`);
writeFileSync(docPath, renderProjectDoc(organization, ledger));

console.log(`Knowledge Base organized: ${knowledgeBaseRoot}`);
console.log(`Readable project note written: ${docPath}`);
console.log(`${organization.summary.groupReadmesWritten} group README(s), ${organization.summary.systemFilesIgnored} ignored system file(s), ${organization.summary.sourceRecords} source record(s).`);

function renderRootReadme({ ledger, topLevel, systemFiles }) {
  return [
    "# Knowledge Base",
    "",
    "This folder is the raw source package for the Korea Investor Advisor project. It stores official IR, DART, PDF, PPT, and source URL materials collected for the five-group investor advisor. Raw files are preserved for provenance and should not be flattened into the app repository.",
    "",
    "## How To Use This Folder",
    "",
    "- Treat this folder as source input, not runtime knowledge.",
    "- Do not point the LLM directly at arbitrary files in this tree.",
    "- Use the generated source ledger and company index before claim promotion.",
    "- Keep official source URLs, document dates, company identity, and selection reasons together.",
    "",
    "## Canonical Project Index",
    "",
    "- `_index/company-source-index.md`: company-level source readiness view.",
    "- `_index/group-source-summary.md`: group-level source summary.",
    "- `_index/source-ledger-pointer.json`: pointer to the canonical product-side source ledger.",
    "- `_index/folder-taxonomy.md`: repeatable folder-category abstraction for future source intake.",
    "- Product-side ledger: `../Korea-Investor-Advisor-Research/raw/manifests/source-ledger.v0.1.json`.",
    "",
    "## Current Coverage",
    "",
    table(
      ["Metric", "Count"],
      [
        ["Source records", ledger.summary.sourceRecords],
        ["Company index rows", ledger.summary.companyRecords],
        ["PDF sources", ledger.summary.pdfSources],
        ["Sources with URL", ledger.summary.sourcesWithUrl],
        ["Sources with selection reason", ledger.summary.sourcesWithSelectionReason],
        ["Reconciled `ir_download` matches", ledger.summary.irDownloadMatchedSources]
      ]
    ),
    "",
    "## Top-Level Structure",
    "",
    table(
      ["Path", "Type", "Project role"],
      topLevel.map((item) => [
        `\`${item.path}\``,
        item.type,
        roleForTopLevel(item.name)
      ])
    ),
    "",
    "## Folder Policy",
    "",
    "Raw files remain in group and company folders because the original folder context is part of the evidence trail. The project is organized through `_index` files and product-side manifests, not by moving PDFs into a flat directory.",
    "",
    "## Ignored Local System Files",
    "",
    `${systemFiles.length} macOS \`.DS_Store\` file(s) are present. They are ignored by the project and listed in \`_index/system-files-to-ignore.md\`; they should be removed only during final repository packaging if needed.`,
    ""
  ].join("\n");
}

function renderIndexReadme({ ledger }) {
  return [
    "# Knowledge Base Index",
    "",
    "This directory contains generated navigation files for the raw Knowledge Base. These files are safe to regenerate and should be treated as indexes over source packages, not as replacement source material.",
    "",
    "## Files",
    "",
    "- `company-source-index.md`: readable company-level table.",
    "- `company-source-index.csv`: spreadsheet-friendly company-level table.",
    "- `group-source-summary.md`: readable group-level table.",
    "- `group-source-summary.csv`: spreadsheet-friendly group-level table.",
    "- `folder-taxonomy.md`: canonical category mapping for raw subfolders.",
    "- `folder-taxonomy.csv`: spreadsheet-friendly folder taxonomy map.",
    "- `source-ledger-pointer.json`: pointer to the canonical source ledger in the active product repository.",
    "- `system-files-to-ignore.md`: local OS metadata files that are not project evidence.",
    "- `source_index_template.md`: copyable source provenance ledger template for new group/company source packages.",
    "",
    "## Current Ledger Snapshot",
    "",
    table(
      ["Metric", "Count"],
      [
        ["Source records", ledger.summary.sourceRecords],
        ["Company records", ledger.summary.companyRecords],
        ["PDF sources", ledger.summary.pdfSources],
        ["Provenance-backed sources", ledger.summary.sourcesWithUrl],
        ["Selection-reason sources", ledger.summary.sourcesWithSelectionReason]
      ]
    ),
    ""
  ].join("\n");
}

function renderGroupReadme({ group, companies, folderName }) {
  const folderPolicy = group.groupId === "hanwha"
    ? "Hanwha keeps both the historical issuer/year-based package and newer affiliate folders. Do not force a physical rewrite until the remaining source provenance reconciliation gap is closed."
    : "Company folders are the preferred raw-source structure for this group. Keep future uploads under a stable company slug and document-type folder.";

  return [
    `# ${group.groupName} Source Package`,
    "",
    `Folder: \`${folderName}\``,
    "",
    "## Role",
    "",
    "This folder contains raw official source files for the project. Product/runtime workflows should use product-side manifests and promoted claims, not raw files directly.",
    "",
    "## Current Source Summary",
    "",
    table(
      ["Metric", "Count"],
      [
        ["Source records", group.sourceCount],
        ["Companies", group.companyCount],
        ["PDF sources", group.pdfCount],
        ["Sources with provenance", group.sourceUrlCount],
        ["Sources with selection reason", group.selectionReasonCount],
        ["Reconciled `ir_download` matches", group.irDownloadMatchedCount]
      ]
    ),
    "",
    "## Company Coverage",
    "",
    table(
      ["Company", "Sources", "URL", "Selection reason", "Readiness", "Next action"],
      companies.map((company) => [
        `${company.companyName}<br><code>${company.companyId}</code>`,
        company.sourceCount,
        company.sourceUrlCount,
        company.selectionReasonCount,
        `\`${company.readiness}\``,
        company.nextAction
      ])
    ),
    "",
    "## Local Folder Policy",
    "",
    folderPolicy,
    "",
    "## Generated Indexes",
    "",
    "- `../_index/company-source-index.md`",
    "- `../_index/group-source-summary.md`",
    "- Product-side canonical ledger: `../../Korea-Investor-Advisor-Research/raw/manifests/source-ledger.v0.1.json`",
    ""
  ].join("\n");
}

function renderCompanyIndexMarkdown(index) {
  return [
    "# Company Source Index",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This table is generated from the product-side source ledger. It lets the project use a shallow company-level view while preserving deep raw source folders.",
    "",
    table(
      ["Group", "Company", "Sources", "PDF", "URL", "Selection reason", "`ir_download`", "Readiness", "Next action"],
      (index.companies ?? []).map((company) => [
        `\`${company.groupId}\``,
        `${company.companyName}<br><code>${company.companyId}</code>`,
        company.sourceCount,
        company.pdfCount,
        company.sourceUrlCount,
        company.selectionReasonCount,
        company.irDownloadMatchedCount,
        `\`${company.readiness}\``,
        company.nextAction
      ])
    ),
    ""
  ].join("\n");
}

function renderGroupSummaryMarkdown(ledger) {
  return [
    "# Group Source Summary",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    table(
      ["Group", "Sources", "Companies", "PDF", "URL", "Selection reason", "`ir_download`", "Dominant document types"],
      (ledger.byGroup ?? []).map((group) => [
        `${group.groupName}<br><code>${group.groupId}</code>`,
        group.sourceCount,
        group.companyCount,
        group.pdfCount,
        group.sourceUrlCount,
        group.selectionReasonCount,
        group.irDownloadMatchedCount,
        topCounts(group.documentTypeCounts, 5)
      ])
    ),
    ""
  ].join("\n");
}

function renderCompanyIndexCsv(index) {
  const rows = [
    ["groupId", "companyId", "companyName", "sourceCount", "pdfCount", "sourceUrlCount", "selectionReasonCount", "irDownloadMatchedCount", "readiness", "nextAction"],
    ...(index.companies ?? []).map((company) => [
      company.groupId,
      company.companyId,
      company.companyName,
      company.sourceCount,
      company.pdfCount,
      company.sourceUrlCount,
      company.selectionReasonCount,
      company.irDownloadMatchedCount,
      company.readiness,
      company.nextAction
    ])
  ];
  return csv(rows);
}

function renderGroupSummaryCsv(ledger) {
  const rows = [
    ["groupId", "groupName", "sourceCount", "companyCount", "pdfCount", "sourceUrlCount", "selectionReasonCount", "irDownloadMatchedCount"],
    ...(ledger.byGroup ?? []).map((group) => [
      group.groupId,
      group.groupName,
      group.sourceCount,
      group.companyCount,
      group.pdfCount,
      group.sourceUrlCount,
      group.selectionReasonCount,
      group.irDownloadMatchedCount
    ])
  ];
  return csv(rows);
}

function renderSystemFiles(systemFiles) {
  return [
    "# Local System Files To Ignore",
    "",
    "These files are local macOS metadata and are not source evidence. They are documented instead of removed so this organization pass remains non-destructive.",
    "",
    ...systemFiles.map((file) => `- \`${relative(projectRoot, file).normalize("NFC")}\``),
    ""
  ].join("\n");
}

function renderProjectDoc(organization, ledger) {
  return [
    "# Knowledge Base Folder Organization",
    "",
    `Generated: ${organization.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This note records the Knowledge Base folder organization pass. The pass does not flatten or move raw source files. It adds root and group README files plus a generated `_index` directory so the project can navigate raw sources through a shallow, reproducible source abstraction.",
    "",
    "## Result",
    "",
    table(
      ["Metric", "Count"],
      [
        ["Source records covered", organization.summary.sourceRecords],
        ["Company index rows", organization.summary.companyRecords],
        ["PDF sources", organization.summary.pdfSources],
        ["Sources with URL", organization.summary.sourcesWithUrl],
        ["Sources with selection reason", organization.summary.sourcesWithSelectionReason],
        ["Reconciled `ir_download` matches", organization.summary.irDownloadMatchedSources],
        ["Group README files written", organization.summary.groupReadmesWritten],
        ["Ignored local system files", organization.summary.systemFilesIgnored]
      ]
    ),
    "",
    "## Generated Files",
    "",
    ...organization.generatedFiles.map((file) => `- \`${file}\``),
    "",
    "## Why This Is The Right Organization",
    "",
    "The product needs reproducibility and traceability more than a visually flat folder tree. Deep raw folders preserve source collection context. The correct abstraction layer is therefore the source ledger: `sourceId`, `groupId`, `companyId`, `documentType`, `sourceUrl`, `selectionReason`, and readiness state.",
    "",
    "## Repeatable Folder Abstraction",
    "",
    "The physical folder names are normalized through `configs/source-folder-taxonomy.json` instead of forcing every company package into the same low-level folder tree. Generated taxonomy files in `Knowledge Base/_index/folder-taxonomy.md` and `Knowledge Base/_index/folder-taxonomy.csv` map Korean, English, and legacy collector folder names to repeatable categories such as `earnings`, `annual_reports`, `quarterly_reports`, `audit_reports`, `investor_presentations`, `value_up`, `governance`, `sustainability`, `metadata`, `archive_or_legacy`, and `misc`.",
    "",
    "This keeps original collection context intact while allowing the runtime and paper workflow to reason over a stable project-level source taxonomy.",
    "",
    "## Staging Retirement",
    "",
    "The temporary `ir_download` staging folder was retired after all 210 files were reconciled as already represented in `Knowledge Base` by SHA-256 hash. The retirement result is recorded in `docs/81_ir_download_retirement.md` and `raw/manifests/ir-download-retirement.json`.",
    "",
    "## Group Snapshot",
    "",
    table(
      ["Group", "Sources", "URL", "Selection reason", "`ir_download`"],
      (ledger.byGroup ?? []).map((group) => [
        `${group.groupName}<br><code>${group.groupId}</code>`,
        group.sourceCount,
        group.sourceUrlCount,
        group.selectionReasonCount,
        group.irDownloadMatchedCount
      ])
    ),
    "",
    "## Machine-Readable Artifact",
    "",
    "- `raw/manifests/knowledge-base-organization.json`",
    "- `configs/source-folder-taxonomy.json`",
    ""
  ].join("\n");
}

function buildTaxonomyIndex(taxonomy) {
  const aliasToCategory = new Map();
  for (const category of taxonomy.canonicalCategories ?? []) {
    aliasToCategory.set(normalizeAlias(category.id), category.id);
    for (const alias of category.aliases ?? []) {
      aliasToCategory.set(normalizeAlias(alias), category.id);
    }
  }
  return {
    aliasToCategory,
    categoriesById: new Map((taxonomy.canonicalCategories ?? []).map((category) => [category.id, category]))
  };
}

function buildFolderTaxonomyRows({ knowledgeBaseRoot, taxonomyIndex }) {
  return listDirs(knowledgeBaseRoot)
    .map((dir) => {
      const rel = relative(knowledgeBaseRoot, dir).normalize("NFC");
      const parts = rel.split("/").filter(Boolean);
      const name = parts.at(-1) ?? "";
      const canonicalCategory = inferFolderCategory({ name, parts, taxonomyIndex });
      const category = taxonomyIndex.categoriesById.get(canonicalCategory);
      return {
        folderPath: relative(projectRoot, dir).normalize("NFC"),
        depth: parts.length,
        folderName: name,
        canonicalCategory,
        role: folderRoleFor({ canonicalCategory, depth: parts.length, parts }),
        runtimeUse: category?.runtimeUse ?? "Manual review required."
      };
    })
    .sort((a, b) => localeCompare(a.folderPath, b.folderPath));
}

function inferFolderCategory({ name, parts, taxonomyIndex }) {
  if (parts.length === 0) return "metadata";
  if (parts.length === 1 && /_knowledge$/u.test(name)) return "metadata";
  if (parts.length === 2 && !taxonomyIndex.aliasToCategory.has(normalizeAlias(name))) return "metadata";
  return taxonomyIndex.aliasToCategory.get(normalizeAlias(name)) ?? "misc";
}

function folderRoleFor({ canonicalCategory, depth, parts }) {
  if (depth === 1 && /_knowledge$/u.test(parts[0] ?? "")) return "group source package root";
  if (depth === 2 && canonicalCategory === "metadata") return "company source package root";
  if (canonicalCategory === "metadata") return "generated or control metadata";
  if (canonicalCategory === "archive_or_legacy") return "legacy/date-based provenance folder";
  return "document-type source folder";
}

function renderFolderTaxonomyMarkdown({ taxonomy, folderTaxonomyRows }) {
  const counts = countBy(folderTaxonomyRows, (row) => row.canonicalCategory);
  return [
    "# Folder Taxonomy",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "This file maps the raw Knowledge Base subfolders to a repeatable canonical source taxonomy. The mapping lets future groups or clients use varied local folder names while the project reads them through stable categories.",
    "",
    "## Canonical Categories",
    "",
    table(
      ["Category", "Label", "Known aliases", "Runtime use"],
      (taxonomy.canonicalCategories ?? []).map((category) => [
        `\`${category.id}\``,
        category.label,
        (category.aliases ?? []).map((alias) => `\`${alias}\``).join(", "),
        category.runtimeUse
      ])
    ),
    "",
    "## Current Folder Classification Counts",
    "",
    table(
      ["Canonical category", "Folders"],
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1] || localeCompare(a[0], b[0]))
        .map(([category, count]) => [`\`${category}\``, count])
    ),
    "",
    "## Current Folder Map",
    "",
    table(
      ["Folder", "Depth", "Canonical category", "Role"],
      folderTaxonomyRows.map((row) => [
        `\`${row.folderPath}\``,
        row.depth,
        `\`${row.canonicalCategory}\``,
        row.role
      ])
    ),
    "",
    "## Rule",
    "",
    "Do not require every client folder to have the exact same physical name. Require every folder and file to resolve to the same canonical category, company identity, source URL, and selection reason before runtime use.",
    ""
  ].join("\n");
}

function renderFolderTaxonomyCsv(rows) {
  return csv([
    ["folderPath", "depth", "folderName", "canonicalCategory", "role", "runtimeUse"],
    ...rows.map((row) => [row.folderPath, row.depth, row.folderName, row.canonicalCategory, row.role, row.runtimeUse])
  ]);
}

function listFiles(dir) {
  const output = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      output.push(fullPath);
    }
  }
  return output;
}

function listDirs(dir) {
  const output = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(fullPath, ...listDirs(fullPath));
    }
  }
  return output;
}

function roleForTopLevel(name) {
  if (name === "_index") return "Generated navigation and source-ledger index files.";
  if (name === "hanhwa_knowledge") return "Hanwha issuer and affiliate raw source package.";
  if (name === "samsung_knowledge") return "Samsung raw source package.";
  if (name === "sk_knowledge") return "SK raw source package.";
  if (name === "hyundai_knowledge") return "Hyundai Motor raw source package.";
  if (name === "lg_knowledge") return "LG raw source package.";
  if (name === "README.md") return "Knowledge Base navigation document.";
  return "Supporting or manually supplied source package file.";
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell ?? "")).join(" | ")} |`)
  ].join("\n");
}

function topCounts(counts, limit) {
  return Object.entries(counts ?? {})
    .sort((a, b) => b[1] - a[1] || localeCompare(a[0], b[0]))
    .slice(0, limit)
    .map(([key, value]) => `\`${key}\`: ${value}`)
    .join("<br>");
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function normalizeAlias(value) {
  return String(value ?? "")
    .normalize("NFC")
    .toLowerCase()
    .replace(/[\s.-]+/gu, "_")
    .trim();
}

function csv(rows) {
  return `${rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n]/u.test(value)) return `"${value.replaceAll('"', '""')}"`;
          return value;
        })
        .join(",")
    )
    .join("\n")}\n`;
}

function localeCompare(a, b) {
  return String(a).localeCompare(String(b), "ko-KR");
}
