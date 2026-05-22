import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputPath = join(rootDir, "raw", "manifests", "group-data-completion-audit.json");
const docPath = join(rootDir, "docs", "67_group_data_completion_audit.md");
const groupsConfig = readJson("configs/groups.json");

const records = groupsConfig.groups.map(auditGroup);
const output = {
  schemaVersion: "group-data-completion-audit.v0.1",
  generatedAt: new Date().toISOString(),
  purpose:
    "Track whether each target business group has enough company-scoped source structure to support the common investor-advisor harness.",
  interpretation:
    "This audit is a product and research readiness gate. It does not claim full investment coverage for any group.",
  totals: {
    groups: records.length,
    groupsWithSourceIntakeTemplate: records.filter((record) => record.hasSourceIntakeTemplate).length,
    groupsWithModernInventory: records.filter((record) => record.localInventory.schemaLevel >= 2).length,
    groupsWithSourceBackedClaims: records.filter((record) => record.sourceBackedClaims.records > 0).length,
    openGapCount: records.reduce((sum, record) => sum + record.gaps.length, 0)
  },
  records
};

await mkdir(join(rootDir, "raw", "manifests"), { recursive: true });
await mkdir(join(rootDir, "docs"), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
await writeFile(docPath, buildDoc(output), "utf8");

console.log(`Group data completion audit written: ${relative(rootDir, outputPath)}`);
console.log(`Readable audit note written: ${relative(rootDir, docPath)}`);
console.log(`${output.totals.openGapCount} open gap(s) across ${output.totals.groups} group(s).`);

function auditGroup(group) {
  const inventory = tryReadJson(`raw/manifests/${group.id}.local-sources.json`) ?? {};
  const claims = tryReadJson(`raw/manifests/${group.id}.source-backed-claims.json`) ?? {};
  const sourceIntakeTemplatePath = `raw/manifests/${group.id}.source-intake-template.json`;
  const sourceIntake = tryReadJson(sourceIntakeTemplatePath);
  const records = claims.records ?? claims.claims ?? [];
  const entries = inventory.entries ?? [];
  const configuredCompanyIds = (group.companies ?? []).map((company) => company.id);
  const claimCompanyIds = unique(records.map((record) => record.companyId).filter(Boolean));
  const inventoryCompanyIds = unique(entries.map((entry) => entry.companyId).filter(Boolean));
  const ambiguousCompanyIds = configuredCompanyIds.filter(isAmbiguousGenericCompanyId);
  const inventorySchemaLevel = localInventorySchemaLevel(inventory);
  const gaps = [];

  if (!sourceIntake) {
    gaps.push({
      severity: "high",
      code: "missing-source-intake-template",
      message: "No reusable source-intake template exists for this group."
    });
  }
  if (entries.length === 0) {
    gaps.push({ severity: "high", code: "missing-local-source-inventory", message: "No local source inventory entries." });
  }
  if (entries.length > 0 && inventorySchemaLevel < 2) {
    gaps.push({
      severity: "medium",
      code: "legacy-local-source-inventory",
      message: "Local source inventory does not yet carry the modern company-scoped v0.2 schema."
    });
  }
  if (ambiguousCompanyIds.length > 0) {
    gaps.push({
      severity: "medium",
      code: "ambiguous-company-ids",
      message: "Configured company IDs should not use generic nouns that can collide across groups.",
      companyIds: ambiguousCompanyIds
    });
  }
  if ((inventory.urlReconciliation?.unmatchedLedgerRecords ?? []).length > 0) {
    gaps.push({
      severity: "medium",
      code: "unmatched-ledger-records",
      message: "Some source provenance ledger records are not matched to local files.",
      count: inventory.urlReconciliation.unmatchedLedgerRecords.length
    });
  }
  if ((inventory.urlReconciliation?.unmatchedUrlRecords ?? []).length > 0) {
    gaps.push({
      severity: "medium",
      code: "unmatched-url-records",
      message: "Some source provenance records are not matched to local files.",
      count: inventory.urlReconciliation.unmatchedUrlRecords.length
    });
  }
  if ((inventory.totals?.byDocumentUrlStatus?.missing_source_url ?? 0) > 0) {
    gaps.push({
      severity: "medium",
      code: "missing-source-url",
      message: "Some local sources are present without document-level or source-page URLs.",
      count: inventory.totals.byDocumentUrlStatus.missing_source_url
    });
  }
  if ((inventory.totals?.byDocumentUrlStatus?.source_page_only ?? 0) > 0) {
    gaps.push({
      severity: "low",
      code: "source-page-only",
      message: "Some sources have source-page metadata but not direct document-level URLs.",
      count: inventory.totals.byDocumentUrlStatus.source_page_only
    });
  }
  if (records.length === 0) {
    gaps.push({ severity: "high", code: "missing-source-backed-claims", message: "No source-backed claims are promoted." });
  }
  if (records.some((record) => !record.companyId || !record.companyScope)) {
    gaps.push({
      severity: "high",
      code: "claim-scope-missing",
      message: "At least one promoted source-backed claim lacks companyId or companyScope."
    });
  }
  if (claimCompanyIds.length > 0 && claimCompanyIds.length < Math.min(3, (sourceIntake?.firstSliceCompanies ?? []).length || 3)) {
    gaps.push({
      severity: "low",
      code: "narrow-claim-company-coverage",
      message: "Promoted claims cover fewer companies than the first-slice intake target.",
      claimCompanyIds
    });
  }

  return {
    groupId: group.id,
    status: group.status,
    sourceStatus: group.sourceStatus,
    configuredCompanies: configuredCompanyIds.length,
    listedCompanies: (group.companies ?? []).filter((company) => company.listed).length,
    hasSourceIntakeTemplate: Boolean(sourceIntake),
    sourceIntakeFirstSliceCompanies: (sourceIntake?.firstSliceCompanies ?? []).map((company) => company.companyId),
    localInventory: {
      schemaVersion: inventory.schemaVersion ?? null,
      schemaLevel: inventorySchemaLevel,
      entries: entries.length,
      byCompany: inventory.totals?.byCompany ?? {},
      byDecision: inventory.totals?.byDecision ?? {},
      urlReconciliation: inventory.urlReconciliation ?? null,
      documentUrlStatus: inventory.totals?.byDocumentUrlStatus ?? {}
    },
    sourceBackedClaims: {
      records: records.length,
      byCompany: countBy(records, (record) => record.companyId ?? "missing"),
      missingCompanyScope: records.filter((record) => !record.companyId || !record.companyScope).length
    },
    wikiCompanyPages: countWikiCompanyPages(group.wikiNamespace),
    gaps
  };
}

function buildDoc(audit) {
  const lines = [
    "# Group Data Completion Audit",
    "",
    `Generated: ${audit.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This audit records whether each target group is ready for the same source-to-claim harness. It is a product readiness artifact first and a paper-support artifact second.",
    "",
    "## Summary",
    "",
    `- Groups checked: ${audit.totals.groups}`,
    `- Groups with source-intake templates: ${audit.totals.groupsWithSourceIntakeTemplate}`,
    `- Groups with modern local inventories: ${audit.totals.groupsWithModernInventory}`,
    `- Groups with source-backed claims: ${audit.totals.groupsWithSourceBackedClaims}`,
    `- Open gaps: ${audit.totals.openGapCount}`,
    "",
    "## Group Status",
    "",
    "| Group | Companies | Inventory | Claims | Wiki company pages | Open gaps |",
    "| --- | ---: | ---: | ---: | ---: | ---: |"
  ];

  for (const record of audit.records) {
    lines.push(
      `| ${record.groupId} | ${record.configuredCompanies} | ${record.localInventory.entries} | ${record.sourceBackedClaims.records} | ${record.wikiCompanyPages} | ${record.gaps.length} |`
    );
  }

  lines.push("", "## Open Gaps", "");
  for (const record of audit.records) {
    lines.push(`### ${record.groupId}`, "");
    if (record.gaps.length === 0) {
      lines.push("- No open structural gaps in this audit.", "");
      continue;
    }
    for (const gap of record.gaps) {
      const suffix = gap.count ? ` (${gap.count})` : "";
      lines.push(`- ${gap.severity}: ${gap.code}${suffix} - ${gap.message}`);
    }
    lines.push("");
  }

  lines.push(
    "## Method Rule",
    "",
    "Data collection should not mean collecting every related document. A source becomes product knowledge only when it has a company scope, source role, source URL or DART receipt, selection reason, extraction/readiness state, and a route to source-backed claims."
  );

  return `${lines.join("\n")}\n`;
}

function readJson(path) {
  return JSON.parse(readFileSync(join(rootDir, path), "utf8"));
}

function tryReadJson(path) {
  const fullPath = join(rootDir, path);
  if (!existsSync(fullPath)) return null;
  return readJson(path);
}

function localInventorySchemaLevel(inventory) {
  const version = inventory?.schemaVersion ?? "";
  const match = version.match(/^local-source-inventory\.v0\.(\d+)$/u);
  return match ? Number(match[1]) : 0;
}

function countWikiCompanyPages(namespace) {
  const companiesPath = join(rootDir, "wiki", namespace, "companies");
  if (!existsSync(companiesPath)) return 0;
  return readdirSync(companiesPath).filter((name) => name.endsWith(".md")).length;
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "en")));
}

function unique(values) {
  return [...new Set(values)];
}

function isAmbiguousGenericCompanyId(companyId) {
  return [
    "aerospace",
    "solution",
    "solutions",
    "system",
    "systems",
    "life",
    "securities",
    "ocean",
    "galleria",
    "estate",
    "chemical",
    "electronics",
    "construction",
    "steel"
  ].includes(companyId);
}
