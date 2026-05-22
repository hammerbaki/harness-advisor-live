import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = process.env.HYUNDAI_WIKI_OUT ?? "wiki/groups/hyundai-motor";

const claims = await readJson("raw/manifests/hyundai-motor.source-backed-claims.json");
const queue = await readJson("raw/manifests/hyundai-motor.narrative-claim-queue.json");
const extraction = await readJson("raw/manifests/hyundai-motor.extraction-report.json");
const identifiers = await readJson("raw/manifests/hyundai-motor.identifier-verification.json");
const sourceIntake = await readJson("raw/manifests/hyundai-motor.source-intake-template.json");
const firstSliceCompanyIds = new Set((sourceIntake.firstSliceCompanies ?? []).map((company) => company.companyId));
const companies = (identifiers.records ?? []).filter((company) => firstSliceCompanyIds.has(company.companyId));
const optionalCompanies = (identifiers.records ?? []).filter((company) => !firstSliceCompanyIds.has(company.companyId));
const records = claims.records ?? [];

await writeMarkdown(`${outputRoot}/overview.md`, renderOverview());
await writeMarkdown(`${outputRoot}/sources.md`, renderSources());
await writeMarkdown(`${outputRoot}/financials.md`, renderFinancials());
for (const company of companies) {
  await writeMarkdown(`${outputRoot}/companies/${company.companyId}.md`, renderCompanyPage(company));
}

console.log(`Hyundai Motor wiki seed written under ${outputRoot}`);
console.log(`${companies.length} company page(s), ${records.length} source-backed financial claim(s).`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeMarkdown(relativePath, markdown) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function renderOverview() {
  return `${frontMatter("Hyundai Motor Advisor Wiki Overview", "hyundai-motor", "", "financial-source-backed-seed", "medium")}\n` +
    "# Hyundai Motor Advisor Wiki Overview\n\n" +
    "Hyundai Motor Group is the third transfer target used to test whether the common harness can support automotive, mobility, and parts-company coverage after Samsung and SK.\n\n" +
    "## Current State\n\n" +
    "- DART/KRX identifiers are verified for the five-company first slice: Hyundai Motor, Kia, Hyundai Mobis, Hyundai Glovis, and Hyundai Rotem.\n" +
    `- ${optionalCompanies.length} optional second-wave listed-company identifiers are verified for intake, but not runtime-promoted.\n` +
    "- OpenDART 2022-2024 annual financial table is recorded in `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`.\n" +
    "- Financial source-backed seed claims are recorded in `raw/manifests/hyundai-motor.source-backed-claims.json`.\n" +
    "- First-slice local PDFs are extracted and queued for narrative claim review where files are available.\n" +
    "- Kia IR materials are still listed as source-page-only SPA records and need downloadable files or exact document URLs before narrative promotion.\n\n" +
    "## Runtime Boundary\n\n" +
    "This namespace can support bounded financial baseline answers for Hyundai Motor, Kia, and Hyundai Mobis. Optional second-wave companies remain source-intake candidates until inventory, extraction, claim review, and scenario gates are completed. The runtime must not infer strategy, value-up, EV, parts, shareholder-return, or guidance conclusions from extracted PDFs until those claims are promoted from the narrative queue.\n\n" +
    "## Optional Second-Wave Intake Candidates\n\n" +
    table(["Company ID", "Company", "KRX", "DART"], optionalCompanies.map((company) => [
      `\`${company.companyId}\``,
      company.koreanName,
      company.krxCode,
      company.dartCode
    ])) +
    "\n" +
    "## Source References\n\n" +
    "- `raw/manifests/hyundai-motor.identifier-verification.json`\n" +
    "- `raw/manifests/hyundai-motor.local-sources.json`\n" +
    "- `raw/manifests/hyundai-motor.extraction-report.json`\n" +
    "- `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/hyundai-motor.narrative-claim-queue.json`\n" +
    "- `raw/manifests/hyundai-motor.source-backed-claims.json`\n";
}

function renderSources() {
  const rows = (extraction.results ?? []).map((result) => [
    result.manifestId,
    result.koreanName,
    result.title,
    result.documentType,
    result.extractionStatus,
    result.lowTextWarning ? "low-text/OCR" : "ok",
    result.documentUrlStatus
  ]);
  return `${frontMatter("Hyundai Motor Sources", "hyundai-motor", "", "candidate-plan", "medium")}\n` +
    "# Hyundai Motor Sources\n\n" +
    "## Source Gate Summary\n\n" +
    `- Local entries: ${extraction.totals?.candidates ?? 0}\n` +
    `- Extraction OK: ${extraction.totals?.ok ?? 0}\n` +
    `- Extraction errors: ${extraction.totals?.error ?? 0}\n` +
    `- Low-text warnings: ${extraction.totals?.lowTextWarnings ?? 0}\n` +
    `- Narrative queue records: ${queue.totals?.records ?? 0}\n` +
    `- Ready sources for human claim review: ${queue.totals?.readyForHumanClaimReview ?? 0}\n` +
    `- Blocked sources: ${queue.totals?.blockedBeforeClaimReview ?? 0}\n\n` +
    "## Runtime Promotion Rule\n\n" +
    "A source row alone is never runtime knowledge. Runtime knowledge starts only when a reviewer-authored claim passes public URL, extraction hash, evidence locator, company scope, policy-rule, and forward-looking label checks.\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/hyundai-motor.local-sources.json`\n" +
    "- `raw/manifests/hyundai-motor.extraction-report.json`\n" +
    "- `raw/manifests/hyundai-motor.narrative-claim-queue.json`\n" +
    "- `raw/manifests/hyundai-motor.source-backed-claims.json`\n\n" +
    "## Extraction Rows\n\n" +
    table(["Manifest ID", "Company", "Title", "Type", "Status", "Text", "URL"], rows);
}

function renderFinancials() {
  const financialRows = records.map((record) => [
    `\`${record.id}\``,
    companyLabel(record.companyId),
    record.claimText,
    `\`${record.runtimeUsePolicy}\``
  ]);
  return `${frontMatter("Hyundai Motor Financial Source-Backed Seed", "hyundai-motor", "", "source-backed", "medium")}\n` +
    "# Hyundai Motor Financial Source-Backed Seed\n\n" +
    "This page is built from OpenDART annual financial-statement API records and the promoted Hyundai Motor Group claim manifest.\n\n" +
    "## Runtime Boundary\n\n" +
    "Use this page only for bounded financial context. Each runtime answer must preserve company, year, reporting basis, account label, unit, and API status.\n\n" +
    "## Current Financial Claims\n\n" +
    table(["Claim ID", "Company", "Claim", "Runtime policy"], financialRows) +
    "\n## Source References\n\n" +
    "- `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/hyundai-motor.source-backed-claims.json`\n";
}

function renderCompanyPage(company) {
  const companyClaims = records.filter((record) => record.companyId === company.companyId);
  const companyQueue = (queue.records ?? []).filter((record) => record.companyId === company.companyId);
  const financialRows = companyClaims.map((record) => [`\`${record.id}\``, record.claimText, `\`${record.runtimeUsePolicy}\``]);
  const queueRows = companyQueue.map((record) => [
    `\`${record.id}\``,
    record.sourceTitle,
    record.documentType,
    record.queueState,
    record.blockedReason ?? ""
  ]);

  return `${frontMatter(`${company.koreanName} Hyundai Motor Wiki Seed`, "hyundai-motor", company.companyId, "source-backed", "medium")}\n` +
    `# ${company.koreanName} Wiki Seed\n\n` +
    "## Runtime Boundary\n\n" +
    "This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.\n\n" +
    "## Financial Claims\n\n" +
    (financialRows.length > 0
      ? table(["Claim ID", "Claim", "Runtime policy"], financialRows)
      : "No financial source-backed claim is promoted for this company.\n") +
    "\n## Narrative Claim Queue\n\n" +
    (queueRows.length > 0
      ? table(["Queue ID", "Source", "Type", "State", "Blocked reason"], queueRows)
      : "No local narrative source is queued for this company yet.\n") +
    "\n## Source References\n\n" +
    "- `raw/manifests/hyundai-motor.source-backed-claims.json`\n" +
    "- `raw/manifests/hyundai-motor.extraction-report.json`\n" +
    "- `raw/manifests/hyundai-motor.narrative-claim-queue.json`\n";
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
