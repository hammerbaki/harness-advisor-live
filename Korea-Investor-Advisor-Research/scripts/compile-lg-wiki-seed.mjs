import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = process.env.LG_WIKI_OUT ?? "wiki/groups/lg";

const claims = await readJson("raw/manifests/lg.source-backed-claims.json");
const inventory = await readJsonIfExists("raw/manifests/lg.local-sources.json", { entries: [], totals: {} });
const extraction = await readJsonIfExists("raw/manifests/lg.extraction-report.json", { results: [], totals: {} });
const queue = await readJsonIfExists("raw/manifests/lg.narrative-claim-queue.json", { records: [], totals: {} });
const identifiers = await readJson("raw/manifests/lg.identifier-verification.json");
const companies = (identifiers.records ?? []).filter((company) => String(company.status ?? "").includes("verified"));
const firstFinancialCompanies = new Set(["lg-electronics", "lg-chem", "lg-energy-solution"]);
const records = claims.records ?? [];

await writeMarkdown(`${outputRoot}/overview.md`, renderOverview());
await writeMarkdown(`${outputRoot}/sources.md`, renderSources());
await writeMarkdown(`${outputRoot}/financials.md`, renderFinancials());
for (const company of companies) {
  await writeMarkdown(`${outputRoot}/companies/${company.companyId}.md`, renderCompanyPage(company));
}

console.log(`LG wiki seed written under ${outputRoot}`);
console.log(`${companies.length} company page(s), ${records.length} source-backed financial claim(s), ${queue.records?.length ?? 0} narrative queue row(s).`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function readJsonIfExists(relativePath, fallback) {
  const fullPath = join(rootDir, relativePath);
  return existsSync(fullPath) ? JSON.parse(await readFile(fullPath, "utf8")) : fallback;
}

async function writeMarkdown(relativePath, markdown) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function renderOverview() {
  return `${frontMatter("LG Advisor Wiki Overview", "lg", "", "financial-source-backed-seed", "medium")}\n` +
    "# LG Advisor Wiki Overview\n\n" +
    "LG is the fourth transfer target used to test whether the common harness can support a multi-affiliate group with electronics, battery, chemical, display, telecom, DX/cloud, and holding-company materials.\n\n" +
    "## Current State\n\n" +
    "- OpenDART/KRX identifiers are verified for nine listed LG affiliates in the supplied local source package.\n" +
    "- Runtime financial seed claims remain promoted only for LG Electronics, LG Chem, and LG Energy Solution.\n" +
    `- Local source inventory records ${inventory.totals?.entries ?? 0} files: ${inventory.totals?.validLocalPdfFiles ?? 0} valid PDFs and ${inventory.totals?.nonPdfFiles ?? 0} non-PDF file(s).\n` +
    `- PDF extraction records ${extraction.totals?.ok ?? 0}/${extraction.totals?.candidates ?? 0} successful extractions with ${extraction.totals?.lowTextWarnings ?? 0} low-text warning(s).\n` +
    `- Narrative queue records ${queue.totals?.readyForHumanClaimReview ?? 0} ready source rows and ${queue.totals?.blockedBeforeClaimReview ?? 0} blocked rows.\n\n` +
    "## Runtime Boundary\n\n" +
    "This namespace can support bounded financial baseline answers from promoted DART claims. LG IR, earnings, value-up, AGM, and spreadsheet materials are review evidence only until atomic source-backed claims are promoted with company scope, evidence locator, and source URL metadata.\n\n" +
    "## Coverage Coordinates\n\n" +
    table(["Company ID", "Company", "KRX", "DART", "Runtime state"], companies.map((company) => [
      `\`${company.companyId}\``,
      company.koreanName,
      company.krxCode,
      company.dartCode,
      firstFinancialCompanies.has(company.companyId) ? "financial seed" : "local source queue"
    ])) +
    "\n## Source References\n\n" +
    "- `raw/manifests/lg.identifier-verification.json`\n" +
    "- `raw/manifests/lg.local-sources.json`\n" +
    "- `raw/manifests/lg.extraction-report.json`\n" +
    "- `raw/manifests/lg.narrative-claim-queue.json`\n" +
    "- `raw/manifests/lg.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/lg.source-backed-claims.json`\n";
}

function renderSources() {
  const extractionRows = (extraction.results ?? []).map((result) => [
    result.manifestId,
    result.koreanName,
    result.title,
    result.documentType,
    result.extractionStatus,
    result.lowTextWarning ? "low-text/OCR" : "ok",
    result.documentUrlStatus
  ]);
  const blockedRows = (queue.records ?? [])
    .filter((record) => record.queueState === "blocked_before_claim_review")
    .slice(0, 30)
    .map((record) => [
      `\`${record.id}\``,
      record.koreanName,
      record.sourceTitle,
      record.documentType,
      record.blockedReason ?? "",
      record.documentUrlStatus ?? ""
    ]);
  return `${frontMatter("LG Sources", "lg", "", "candidate-plan", "medium")}\n` +
    "# LG Sources\n\n" +
    "## Source Gate Summary\n\n" +
    `- Local entries: ${inventory.totals?.entries ?? 0}\n` +
    `- Valid local PDFs: ${inventory.totals?.validLocalPdfFiles ?? 0}\n` +
    `- Non-PDF sources: ${inventory.totals?.nonPdfFiles ?? 0}\n` +
    `- Extraction OK: ${extraction.totals?.ok ?? 0}\n` +
    `- Extraction errors: ${extraction.totals?.error ?? 0}\n` +
    `- Low-text warnings: ${extraction.totals?.lowTextWarnings ?? 0}\n` +
    `- Narrative queue records: ${queue.totals?.records ?? 0}\n` +
    `- Ready sources for human claim review: ${queue.totals?.readyForHumanClaimReview ?? 0}\n` +
    `- Blocked sources: ${queue.totals?.blockedBeforeClaimReview ?? 0}\n\n` +
    "## Runtime Promotion Rule\n\n" +
    "A source row alone is never runtime knowledge. Runtime knowledge starts only when a reviewer-authored claim passes public URL, extraction hash, evidence locator, company scope, policy-rule, and forward-looking label checks.\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/lg.local-sources.json`\n" +
    "- `raw/manifests/lg.extraction-report.json`\n" +
    "- `raw/manifests/lg.narrative-claim-queue.json`\n" +
    "- `raw/manifests/lg.source-backed-claims.json`\n\n" +
    "## Extraction Rows\n\n" +
    table(["Manifest ID", "Company", "Title", "Type", "Status", "Text", "URL"], extractionRows) +
    "\n## Blocked Queue Rows (First 30)\n\n" +
    table(["Queue ID", "Company", "Source", "Type", "Blocked reason", "URL"], blockedRows);
}

function renderFinancials() {
  const financialRows = records.map((record) => [
    `\`${record.id}\``,
    companyLabel(record.companyId),
    record.claimText,
    `\`${record.runtimeUsePolicy}\``
  ]);
  return `${frontMatter("LG Financial Source-Backed Seed", "lg", "", "source-backed", "medium")}\n` +
    "# LG Financial Source-Backed Seed\n\n" +
    "This page is built from OpenDART annual financial-statement API records and the promoted LG claim manifest.\n\n" +
    "## Runtime Boundary\n\n" +
    "Use this page only for bounded financial context. Each runtime answer must preserve company, year, reporting basis, account label, unit, and API status. Do not infer LG narrative strategy from local IR PDFs until claims are promoted.\n\n" +
    "## Current Financial Claims\n\n" +
    table(["Claim ID", "Company", "Claim", "Runtime policy"], financialRows) +
    "\n## Source References\n\n" +
    "- `raw/manifests/lg.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/lg.source-backed-claims.json`\n";
}

function renderCompanyPage(company) {
  const companyClaims = records.filter((record) => record.companyId === company.companyId);
  const companyQueue = (queue.records ?? []).filter((record) => record.companyId === company.companyId);
  const financialRows = companyClaims.map((record) => [`\`${record.id}\``, record.claimText, `\`${record.runtimeUsePolicy}\``]);
  const queueRows = companyQueue.map((record) => [
    `\`${record.id}\``,
    record.sourceTitle,
    record.documentType,
    record.documentUrlStatus,
    record.queueState,
    record.blockedReason ?? ""
  ]);

  const sourceStatus = companyClaims.length > 0 ? "source-backed" : "candidate-plan";
  return `${frontMatter(`${company.koreanName} LG Wiki Seed`, "lg", company.companyId, sourceStatus, "medium")}\n` +
    `# ${company.koreanName} Wiki Seed\n\n` +
    "## Runtime Boundary\n\n" +
    "This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.\n\n" +
    "## Financial Claims\n\n" +
    (financialRows.length > 0
      ? table(["Claim ID", "Claim", "Runtime policy"], financialRows)
      : "No financial source-backed claim is promoted for this company yet.\n") +
    "\n## Narrative Claim Queue\n\n" +
    (queueRows.length > 0
      ? table(["Queue ID", "Source", "Type", "URL", "State", "Blocked reason"], queueRows)
      : "No local narrative source is queued for this company yet.\n") +
    "\n## Source References\n\n" +
    "- `raw/manifests/lg.source-backed-claims.json`\n" +
    "- `raw/manifests/lg.local-sources.json`\n" +
    "- `raw/manifests/lg.extraction-report.json`\n" +
    "- `raw/manifests/lg.narrative-claim-queue.json`\n";
}

function frontMatter(title, groupId, companyId, sourceStatus, confidence) {
  return [
    "---",
    `title: "${title}"`,
    `group_id: "${groupId}"`,
    `company_id: "${companyId}"`,
    `source_status: "${sourceStatus}"`,
    `last_checked: "${new Date().toISOString().slice(0, 10)}"`,
    `confidence: "${confidence}"`,
    "---",
    ""
  ].join("\n");
}

function table(headers, rows) {
  if (rows.length === 0) return "No rows.\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => escapeTable(cell)).join(" | ")} |`)
  ].join("\n") + "\n";
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/");
}

function companyLabel(companyId) {
  return companies.find((company) => company.companyId === companyId)?.koreanName ?? companyId;
}
