import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const manifestPath = join(rootDir, "raw/manifests/samsung.dart-financial-table.2022-2024.json");
const docPath = join(rootDir, "docs/39_samsung_dart_financial_table.md");
const accountAuditPath = join(rootDir, "raw/manifests/samsung.dart-financial-account-audit.2022-2024.json");
const accountAuditDocPath = join(rootDir, "docs/40_samsung_financial_sector_dart_account_audit.md");

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
await readFile(docPath, "utf8");
const accountAudit = JSON.parse(await readFile(accountAuditPath, "utf8"));
await readFile(accountAuditDocPath, "utf8");

const errors = [];
const warnings = [];

if (manifest.schemaVersion !== "dart-financial-table.v0.1") {
  errors.push(`Unexpected schemaVersion: ${manifest.schemaVersion}`);
}
if (manifest.groupId !== "samsung") {
  errors.push(`Expected groupId samsung, got ${manifest.groupId}`);
}
if (manifest.totals?.companies !== 15) {
  errors.push(`Expected 15 Samsung companies, got ${manifest.totals?.companies}`);
}
if (manifest.totals?.requestedRecords !== 45) {
  errors.push(`Expected 45 company-year records, got ${manifest.totals?.requestedRecords}`);
}
if (!Array.isArray(manifest.records) || manifest.records.length !== 45) {
  errors.push(`Expected 45 records, got ${manifest.records?.length ?? "missing"}`);
}
if ((manifest.totals?.okRecords ?? 0) < 35) {
  errors.push(`Expected at least 35 complete DART financial records, got ${manifest.totals?.okRecords}`);
}
if (accountAudit.schemaVersion !== "dart-financial-account-audit.v0.1") {
  errors.push(`Unexpected account audit schemaVersion: ${accountAudit.schemaVersion}`);
}
if (accountAudit.totals?.requestedRecords !== 12) {
  errors.push(`Expected 12 financial-sector account audit records, got ${accountAudit.totals?.requestedRecords}`);
}
if (accountAudit.totals?.recordsWithExplicitRevenueAccount !== 2) {
  warnings.push(
    `Expected exactly 2 Samsung financial-company records with explicit OpenDART revenue accounts under current policy, got ${accountAudit.totals?.recordsWithExplicitRevenueAccount}`
  );
}

const prohibitedRevenueSelections = manifest.records.filter((record) =>
  /이자수익|수수료수익|보험수익|보험료수익|보험영업수익|순이자/u.test(record.revenue?.accountName ?? "")
);
if (prohibitedRevenueSelections.length > 0) {
  errors.push(
    `Financial revenue was inferred from finance-specific accounts: ${prohibitedRevenueSelections
      .map((record) => `${record.koreanName} ${record.year} ${record.revenue.accountName}`)
      .join(", ")}`
  );
}

const nonOk = manifest.records.filter((record) => record.status !== "ok");
for (const record of nonOk) {
  warnings.push(
    `${record.koreanName} ${record.year}: ${record.status} (${record.dartStatus}) ${record.dartMessage}`
  );
}

const financialRevenueGaps = manifest.records.filter(
  (record) =>
    ["samsung-life", "samsung-fire-marine", "samsung-securities"].includes(record.companyId) &&
    record.status === "partial" &&
    !record.revenue &&
    record.operatingIncome
);
if (financialRevenueGaps.length > 0) {
  warnings.push(
    `Financial-sector revenue intentionally left blank unless OpenDART provides explicit 매출액/영업수익/수익(매출액): ${financialRevenueGaps
      .map((record) => `${record.koreanName} ${record.year}`)
      .join(", ")}`
  );
}

if (errors.length > 0) {
  console.error("Samsung financial validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Samsung financial validation passed.");
if (warnings.length > 0) {
  console.warn("Warnings:");
  for (const warning of warnings) console.warn(`- ${warning}`);
}
