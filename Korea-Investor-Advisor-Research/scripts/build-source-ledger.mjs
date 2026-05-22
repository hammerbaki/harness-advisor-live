import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const rootDir = process.cwd();
const manifestDir = join(rootDir, "raw", "manifests");
const ledgerPath = join(manifestDir, "source-ledger.v0.1.json");
const companyIndexPath = join(manifestDir, "company-source-index.json");
const docPath = join(rootDir, "docs", "79_source_ledger_and_consolidation.md");

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const groupsConfig = readJson("configs/groups.json");
const irImport = readJsonIfExists("raw/manifests/ir-download-backfill-import.json", { records: [] });
const integratedSourceIndexes = readSourceIndexImportReports();
const firstSliceAudit = readJsonIfExists("raw/manifests/first-slice-readiness-audit.json", { groups: [] });

const groupConfigById = new Map((groupsConfig.groups ?? []).map((group) => [group.id, group]));
const companyConfigById = new Map();
for (const group of groupsConfig.groups ?? []) {
  for (const company of group.companies ?? []) {
    companyConfigById.set(`${group.id}:${company.id}`, {
      groupId: group.id,
      companyId: company.id,
      koreanName: company.koreanName ?? company.id,
      displayName: company.displayName ?? company.id,
      krxCode: company.krxCode ?? null,
      dartCode: company.dartCode ?? null
    });
  }
}

const readinessByCompany = new Map();
for (const group of firstSliceAudit.groups ?? []) {
  for (const company of group.companies ?? []) {
    readinessByCompany.set(`${group.groupId}:${company.companyId}`, company);
  }
}

const irImportByHash = new Map();
for (const record of irImport.records ?? []) {
  if (!record.sha256) continue;
  const existing = irImportByHash.get(record.sha256) ?? [];
  existing.push(record);
  irImportByHash.set(record.sha256, existing);
}

const sourceRecords = [];

for (const groupId of groupIds) {
  const localSources = readJsonIfExists(`raw/manifests/${groupId}.local-sources.json`, { entries: [] });
  for (const entry of localSources.entries ?? []) {
    const companyId = entry.companyId ?? "unassigned";
    const config = companyConfigById.get(`${groupId}:${companyId}`);
    const irMatches = entry.sha256 ? irImportByHash.get(entry.sha256) ?? [] : [];
    const sourceUrl = firstNonEmpty(
      entry.publicDocumentUrl,
      entry.sourcePageUrl,
      entry.dartReceiptUrl,
      entry.sourceUrl,
      entry.rceptNo ? `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${entry.rceptNo}` : null
    );

    sourceRecords.push({
      sourceId: entry.id ?? null,
      groupId,
      groupName: groupConfigById.get(groupId)?.koreanName ?? groupId,
      companyId,
      companyName: entry.koreanName ?? config?.koreanName ?? companyId,
      displayName: config?.displayName ?? companyId,
      krxCode: config?.krxCode ?? null,
      dartCode: config?.dartCode ?? null,
      title: entry.title ?? entry.filename ?? entry.id ?? "untitled",
      filename: entry.filename ?? null,
      documentType: normalizeDocumentType(entry.documentType ?? entry.sourceCategory ?? entry.category),
      period: entry.period ?? entry.folderYear ?? entry.documentDate ?? null,
      sourceRole: entry.sourceRole ?? entry.inferredSourceRole ?? null,
      sourceReliability: entry.sourceReliability ?? null,
      localPath: entry.localPath ?? null,
      sourceUrl,
      publicDocumentUrl: entry.publicDocumentUrl ?? null,
      sourcePageUrl: entry.sourcePageUrl ?? null,
      dartReceiptUrl: entry.dartReceiptUrl ?? null,
      rceptNo: entry.rceptNo ?? null,
      extension: entry.extension ?? null,
      isPdf: Boolean(entry.isPdf),
      sizeBytes: entry.sizeBytes ?? null,
      sha256: entry.sha256 ?? null,
      selectionReason: entry.selectionReason ?? entry.selectionRationale ?? null,
      requestPackage: entry.requestPackage ?? null,
      documentUrlStatus: entry.documentUrlStatus ?? null,
      intakeReadiness: entry.intakeReadiness ?? deriveIntakeReadiness(entry),
      processingDecision: entry.processingDecision ?? null,
      paperUseLevel: entry.paperUseLevel ?? null,
      redistributionPolicy: entry.redistributionPolicy ?? null,
      abstraction: {
        rootLayer: "Knowledge Base",
        runtimeShouldUsePathDirectly: false,
        runtimeUse: "sourceId/companyId/documentType/sourceUrl/selectionReason/claimStatus",
        localPathDepth: entry.localPath ? entry.localPath.split("/").length : null,
        matchedIrDownloadStaging: irMatches.length > 0,
        irDownloadSourcePaths: irMatches.map((record) => record.sourcePath),
        irDownloadImportStatus: irMatches.map((record) => record.status)
      }
    });
  }
}

for (const sourceIndexReport of integratedSourceIndexes) {
  for (const row of sourceIndexReport.rows ?? []) {
    if (row.local_match_status !== "metadata_only") continue;
    const groupId = row.target;
    if (!groupIds.includes(groupId)) continue;
    const companyId = row.company_id ?? "unassigned";
    const config = companyConfigById.get(`${groupId}:${companyId}`);
    const sourceUrl = firstNonEmpty(row.direct_document_url, row.dart_receipt_url, row.source_page_url);
    sourceRecords.push({
      sourceId: `source-index-${sha256Text([groupId, companyId, row.title, row.dart_receipt_url, row.direct_document_url, row.source_page_url].join("::")).slice(0, 12)}`,
      groupId,
      groupName: groupConfigById.get(groupId)?.koreanName ?? groupId,
      companyId,
      companyName: row.company ?? config?.koreanName ?? companyId,
      displayName: config?.displayName ?? companyId,
      krxCode: config?.krxCode ?? null,
      dartCode: config?.dartCode ?? null,
      title: row.title ?? "metadata-only official source",
      filename: null,
      documentType: normalizeDocumentType(row.document_type),
      period: row.date_or_period ?? null,
      sourceRole: row.dart_receipt_url ? "official_regulatory_filing" : "official_source_page",
      sourceReliability: "primary",
      localPath: null,
      sourceUrl,
      publicDocumentUrl: row.direct_document_url ?? null,
      sourcePageUrl: row.source_page_url ?? null,
      dartReceiptUrl: row.dart_receipt_url ?? null,
      rceptNo: inferRceptNo(row.dart_receipt_url),
      extension: null,
      isPdf: false,
      sizeBytes: null,
      sha256: null,
      selectionReason: row.selection_reason ?? null,
      requestPackage: row.request_package ?? null,
      documentUrlStatus: row.dart_receipt_url
        ? "dart_receipt_url_supplied"
        : row.direct_document_url
          ? "public_document_url_supplied"
          : "source_page_url_supplied",
      intakeReadiness: row.rights_level === "licensed-third-party-metadata-only"
        ? "metadata_only_not_runtime_claim"
        : "metadata_only_ready_for_claim_review",
      processingDecision: "metadata-only-official-source-row",
      paperUseLevel: row.rights_level === "licensed-third-party-metadata-only"
        ? "supporting-metadata-only"
        : "usable-after-dart-or-source-page-claim-review",
      redistributionPolicy: row.rights_level === "public-official"
        ? "manifest-and-short-excerpt-only; cite official URL"
        : "metadata-only unless rights are separately cleared",
      abstraction: {
        rootLayer: "Source Index",
        runtimeShouldUsePathDirectly: false,
        runtimeUse: "sourceId/companyId/documentType/sourceUrl/selectionReason/claimStatus",
        localPathDepth: null,
        matchedIrDownloadStaging: false,
        irDownloadSourcePaths: [],
        irDownloadImportStatus: [],
        metadataOnly: true,
        sourceIndexInput: sourceIndexReport.inputPath ?? null
      }
    });
  }
}

const sourceRecordsByCompany = groupBy(sourceRecords, (record) => `${record.groupId}:${record.companyId}`);
const companyIndex = [...sourceRecordsByCompany.entries()]
  .map(([key, sources]) => {
    const [groupId, companyId] = key.split(":");
    const config = companyConfigById.get(key);
    const readiness = readinessByCompany.get(key);
    return {
      groupId,
      companyId,
      companyName: sources.find((source) => source.companyName)?.companyName ?? config?.koreanName ?? companyId,
      displayName: config?.displayName ?? companyId,
      krxCode: config?.krxCode ?? null,
      dartCode: config?.dartCode ?? null,
      sourceCount: sources.length,
      pdfCount: sources.filter((source) => source.isPdf).length,
      sourceUrlCount: sources.filter((source) => Boolean(source.sourceUrl)).length,
      selectionReasonCount: sources.filter((source) => Boolean(source.selectionReason)).length,
      irDownloadMatchedCount: sources.filter((source) => source.abstraction.matchedIrDownloadStaging).length,
      documentTypeCounts: countBy(sources, (source) => source.documentType),
      readiness: readiness?.readiness ?? "outside-first-slice-or-not-audited",
      openGaps: readiness?.gaps ?? [],
      nextAction: readiness?.nextAction ?? "keep in source ledger; promote claims only when selected for runtime"
    };
  })
  .sort((a, b) => localeCompare(a.groupId, b.groupId) || localeCompare(a.companyId, b.companyId));

const byGroup = groupIds.map((groupId) => {
  const groupSources = sourceRecords.filter((record) => record.groupId === groupId);
  const groupCompanies = companyIndex.filter((company) => company.groupId === groupId);
  return {
    groupId,
    groupName: groupConfigById.get(groupId)?.koreanName ?? groupId,
    sourceCount: groupSources.length,
    companyCount: groupCompanies.filter((company) => company.companyId !== "unassigned").length,
    unassignedSourceCount: groupSources.filter((record) => record.companyId === "unassigned").length,
    pdfCount: groupSources.filter((record) => record.isPdf).length,
    sourceUrlCount: groupSources.filter((record) => Boolean(record.sourceUrl)).length,
    selectionReasonCount: groupSources.filter((record) => Boolean(record.selectionReason)).length,
    irDownloadMatchedCount: groupSources.filter((record) => record.abstraction.matchedIrDownloadStaging).length,
    documentTypeCounts: countBy(groupSources, (record) => record.documentType)
  };
});

const duplicateHashGroups = [...groupBy(sourceRecords.filter((record) => record.sha256), (record) => record.sha256).values()]
  .filter((records) => records.length > 1)
  .map((records) => ({
    sha256: records[0].sha256,
    count: records.length,
    sources: records.map((record) => ({
      sourceId: record.sourceId,
      groupId: record.groupId,
      companyId: record.companyId,
      localPath: record.localPath
    }))
  }));

const output = {
  schemaVersion: "source-ledger.v0.1",
  generatedAt: new Date().toISOString(),
  purpose:
    "Canonical source abstraction over deep Knowledge Base folders and reconciled ir_download staging files. Runtime and paper workflows should depend on this ledger rather than deep local paths.",
  roots: {
    activeRawSourceRoot: "../Knowledge Base",
    reconciledIncomingRoot: "../ir_download",
    activeRuntimeRoot: ".",
    physicalMovePolicy:
      "Do not flatten raw source folders. Keep source packages immutable and expose company/document abstractions through this ledger."
  },
  summary: {
    groups: byGroup.length,
    sourceRecords: sourceRecords.length,
    companyRecords: companyIndex.length,
    pdfSources: sourceRecords.filter((record) => record.isPdf).length,
    sourcesWithUrl: sourceRecords.filter((record) => Boolean(record.sourceUrl)).length,
    sourcesWithSelectionReason: sourceRecords.filter((record) => Boolean(record.selectionReason)).length,
    irDownloadSourceFiles: irImport.sourceFiles ?? (irImport.records ?? []).filter((record) => record.sourcePath).length,
    irDownloadMatchedSources: sourceRecords.filter((record) => record.abstraction.matchedIrDownloadStaging).length,
    metadataOnlySourceIndexRows: sourceRecords.filter((record) => record.abstraction.metadataOnly).length,
    duplicateHashGroups: duplicateHashGroups.length
  },
  byGroup,
  companyIndex,
  duplicateHashGroups,
  sourceRecords
};

mkdirSync(manifestDir, { recursive: true });
writeFileSync(ledgerPath, `${JSON.stringify(output, null, 2)}\n`);
writeFileSync(companyIndexPath, `${JSON.stringify({
  schemaVersion: "company-source-index.v0.1",
  generatedAt: output.generatedAt,
  sourceLedgerPath: "raw/manifests/source-ledger.v0.1.json",
  groups: byGroup,
  companies: companyIndex
}, null, 2)}\n`);
writeFileSync(docPath, renderDoc(output));

console.log(`Source ledger written: ${ledgerPath}`);
console.log(`Company source index written: ${companyIndexPath}`);
console.log(`Readable source consolidation note written: ${docPath}`);
console.log(`${output.summary.sourceRecords} source(s), ${output.summary.companyRecords} company index row(s), ${output.summary.irDownloadMatchedSources} ir_download match(es).`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(rootDir, relativePath), "utf8"));
}

function readJsonIfExists(relativePath, fallback) {
  const absolutePath = join(rootDir, relativePath);
  if (!existsSync(absolutePath)) return fallback;
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function readSourceIndexImportReports() {
  if (!existsSync(manifestDir)) return [];
  const reportNames = new Set(
    readdirSync(manifestDir)
      .filter((name) => name.endsWith("source-index-import-report.json"))
  );
  reportNames.add("integrated-source-index-import-report.json");
  return [...reportNames]
    .sort(localeCompare)
    .map((name) => readJsonIfExists(join("raw", "manifests", name), null))
    .filter((report) => report && Array.isArray(report.rows));
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === "string" && value.trim().length > 0) ?? null;
}

function normalizeDocumentType(value) {
  if (!value) return "unknown";
  return String(value)
    .trim()
    .toLowerCase()
    .replaceAll(" ", "_")
    .replaceAll("-", "_");
}

function sha256Text(value) {
  return createHash("sha256").update(String(value ?? "")).digest("hex");
}

function inferRceptNo(value) {
  return (String(value ?? "").match(/\b(20\d{12,14})\b/u) ?? [null, null])[1];
}

function deriveIntakeReadiness(entry) {
  if (!entry.localPath) return "missing_local_path";
  if (!entry.selectionReason && !entry.selectionRationale) return "needs_selection_reason";
  if (!firstNonEmpty(entry.publicDocumentUrl, entry.sourcePageUrl, entry.dartReceiptUrl, entry.sourceUrl, entry.rceptNo)) {
    return "needs_source_provenance";
  }
  return "ready_for_claim_review";
}

function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key) ?? [];
    existing.push(item);
    map.set(key, existing);
  }
  return map;
}

function countBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const key = keyFn(item) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function renderDoc(ledger) {
  return [
    "# Source Ledger And Folder Consolidation",
    "",
    `Generated: ${ledger.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document consolidates deep local source folders into a project-level source ledger. It uses the reconciled `ir_download` staging package as evidence, but does not copy duplicate files or flatten official source folders. Product code, evaluation, and paper writing should use the ledger fields rather than deep folder paths.",
    "",
    "## Current Verdict",
    "",
    "- `ir_download` has already been reconciled against `Knowledge Base` by SHA-256.",
    `- ${ledger.summary.irDownloadSourceFiles} staging files were checked; ${ledger.summary.irDownloadMatchedSources} source ledger rows now carry an ` +
      "`ir_download` match.",
    "- The safe consolidation is logical, not destructive: keep raw files in their company folders and expose a canonical `sourceId -> companyId -> documentType -> sourceProvenance` abstraction.",
    "- Physical folder moves should wait until all source scripts run from `KNOWLEDGE_BASE_ROOT` and `IR_DOWNLOAD_ROOT`.",
    "",
    "## Summary",
    "",
    table(
      ["Metric", "Count"],
      [
        ["Source records", ledger.summary.sourceRecords],
        ["Company index rows", ledger.summary.companyRecords],
        ["PDF sources", ledger.summary.pdfSources],
        ["Sources with source provenance", ledger.summary.sourcesWithUrl],
        ["Sources with selection reason", ledger.summary.sourcesWithSelectionReason],
        ["ir_download source files", ledger.summary.irDownloadSourceFiles],
        ["ir_download matched ledger rows", ledger.summary.irDownloadMatchedSources],
        ["Duplicate hash groups inside ledger", ledger.summary.duplicateHashGroups]
      ]
    ),
    "",
    "## Group-Level Index",
    "",
    table(
      ["Group", "Sources", "Companies", "PDF", "Provenance", "Selection reason", "ir_download matched", "Dominant document types"],
      ledger.byGroup.map((group) => [
        `${group.groupName}<br><code>${group.groupId}</code>`,
        group.sourceCount,
        group.companyCount,
        group.pdfCount,
        group.sourceUrlCount,
        group.selectionReasonCount,
        group.irDownloadMatchedCount,
        topCounts(group.documentTypeCounts, 4)
      ])
    ),
    "",
    "## Company-Level Index",
    "",
    table(
      ["Group", "Company", "Sources", "Provenance", "Selection reason", "ir_download", "Readiness", "Next action"],
      ledger.companyIndex.map((company) => [
        `\`${company.groupId}\``,
        `${company.companyName}<br><code>${company.companyId}</code>`,
        company.sourceCount,
        company.sourceUrlCount,
        company.selectionReasonCount,
        company.irDownloadMatchedCount,
        `\`${company.readiness}\``,
        company.nextAction
      ])
    ),
    "",
    "## Consolidation Rule",
    "",
    "The raw source tree may remain deep because it preserves provenance and original collection context. The project should consolidate above it through these artifacts:",
    "",
    "- `raw/manifests/source-ledger.v0.1.json`: full source-level ledger.",
    "- `raw/manifests/company-source-index.json`: compact company-level source index.",
    "- `raw/manifests/first-slice-readiness-audit.json`: readiness gate for paper/product reference companies.",
    "",
    "Runtime code should not walk `Knowledge Base` directly. It should consume promoted claims, wiki pages, and source manifests that already resolve company identity, source provenance, document type, and selection reason.",
    "",
    "## Physical Folder Migration Gate",
    "",
    "A later physical move from the current sibling roots to `sources/knowledge-base/` and `sources/incoming/` is allowed only after:",
    "",
    "1. all inventory/import scripts pass with `KNOWLEDGE_BASE_ROOT` and `IR_DOWNLOAD_ROOT`;",
    "2. the source ledger is regenerated without count changes;",
    "3. `npm run audit:first-slice`, `npm run validate:stage-gate`, and `npm run typecheck` pass;",
    "4. no active manual data-collection process still writes into the old folder names.",
    "",
    "## Machine-Readable Artifacts",
    "",
    "- `raw/manifests/source-ledger.v0.1.json`",
    "- `raw/manifests/company-source-index.json`",
    ""
  ].join("\n");
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

function localeCompare(a, b) {
  return String(a).localeCompare(String(b), "ko-KR");
}
