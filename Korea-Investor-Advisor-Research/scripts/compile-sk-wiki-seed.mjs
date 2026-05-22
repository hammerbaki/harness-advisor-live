import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const outputRoot = process.env.SK_WIKI_OUT ?? "wiki/groups/sk";

const claims = await readJson("raw/manifests/sk.source-backed-claims.json");
const queue = await readJson("raw/manifests/sk.narrative-claim-queue.json");
const extraction = await readJson("raw/manifests/sk.extraction-report.json");
const identifiers = await readJson("raw/manifests/sk.identifier-verification.json");
const companies = identifiers.records ?? [];
const records = claims.records ?? [];

await writeMarkdown(`${outputRoot}/overview.md`, renderOverview());
await writeMarkdown(`${outputRoot}/sources.md`, renderSources());
await writeMarkdown(`${outputRoot}/financials.md`, renderFinancials());
for (const company of companies) {
  await writeMarkdown(`${outputRoot}/companies/${company.companyId}.md`, renderCompanyPage(company));
}

console.log(`SK wiki seed written under ${outputRoot}`);
console.log(`${companies.length} company page(s), ${records.length} source-backed claim(s).`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeMarkdown(relativePath, markdown) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function renderOverview() {
  const verifiedCompanyNames = companies.map((company) => company.koreanName).join(", ");
  return `${frontMatter("SK Advisor Wiki Overview", "sk", "", "source-backed", "medium")}\n` +
    "# SK Advisor Wiki Overview\n\n" +
    "SK is an expansion target used to test whether the Hanwha reference slice and Samsung transfer slice can generalize through the same harness boundary.\n\n" +
    "## Current State\n\n" +
    `- DART/KRX identifiers are verified for ${verifiedCompanyNames}.\n` +
    "- OpenDART 2022-2024 annual financial table is recorded in `raw/manifests/sk.dart-financial-table.2022-2024.json`.\n" +
    "- Financial and narrative source-backed seed claims are recorded in `raw/manifests/sk.source-backed-claims.json`.\n" +
    "- Narrative source review is tracked in `raw/manifests/sk.narrative-claim-queue.json`.\n" +
    "- Low-text/image-like PDFs remain blocked unless OCR, transcript, or text-bearing substitutes are provided.\n\n" +
    "## Runtime Boundary\n\n" +
    "This namespace can support bounded investor briefing answers for the promoted claims only. It is not full SK coverage and must not infer unsupported HBM, battery, energy, telecom, holding-company, or NAV-discount conclusions outside the promoted source-backed claims.\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/sk.identifier-verification.json`\n" +
    "- `raw/manifests/sk.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/sk.local-sources.json`\n" +
    "- `raw/manifests/sk.extraction-report.json`\n" +
    "- `raw/manifests/sk.narrative-claim-queue.json`\n" +
    "- `raw/manifests/sk.source-backed-claims.json`\n";
}

function renderSources() {
  const rows = (extraction.results ?? []).map((result) => [
    result.manifestId,
    result.koreanName,
    result.title,
    result.documentType,
    result.extractionStatus,
    result.lowTextWarning ? "low-text" : "ok",
    result.documentUrlStatus
  ]);
  return `${frontMatter("SK Sources", "sk", "", "candidate-plan", "medium")}\n` +
    "# SK Sources\n\n" +
    "## Source Gate Summary\n\n" +
    `- Local entries: ${extraction.totals?.candidates ?? 0}\n` +
    `- Extraction OK: ${extraction.totals?.ok ?? 0}\n` +
    `- Extraction errors: ${extraction.totals?.error ?? 0}\n` +
    `- Low-text warnings: ${extraction.totals?.lowTextWarnings ?? 0}\n` +
    `- URL-matched candidates: ${extraction.totals?.urlMatchedCandidates ?? 0}\n` +
    `- Narrative queue themes: ${queue.totals?.records ?? 0}\n` +
    `- Ready sources for evidence review: ${queue.totals?.readySources ?? 0}\n` +
    `- Blocked sources: ${queue.totals?.blockedSources ?? 0}\n\n` +
    "## Runtime Promotion Rule\n\n" +
    "A source row alone is never runtime knowledge. Runtime knowledge starts only when a reviewer-authored claim passes public URL, extraction hash, evidence locator, company scope, policy-rule, and forward-looking label checks.\n\n" +
    "## Source-Backed Claim Manifest\n\n" +
    "- `raw/manifests/sk.source-backed-claims.json` records the SK runtime seed claims.\n" +
    "- `docs/49_sk_source_backed_narrative_claims.md` records the first narrative-promotion rationale.\n" +
    "- The queue and extraction report remain development/research artifacts and should not appear as customer-facing answer text.\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/sk.local-sources.json`\n" +
    "- `raw/manifests/sk.extraction-report.json`\n" +
    "- `raw/manifests/sk.narrative-claim-queue.json`\n" +
    "- `raw/manifests/sk.source-backed-claims.json`\n\n" +
    "## Extraction Rows\n\n" +
    table(["Manifest ID", "Company", "Title", "Type", "Status", "Text", "URL"], rows);
}

function renderFinancials() {
  const financialRows = records
    .filter((record) => record.claimType.includes("financial"))
    .map((record) => [
      `\`${record.id}\``,
      companyLabel(record.companyId),
      record.claimText,
      `\`${record.runtimeUsePolicy}\``
    ]);
  return `${frontMatter("SK Financial Source-Backed Seed", "sk", "", "source-backed", "medium")}\n` +
    "# SK Financial Source-Backed Seed\n\n" +
    "This page is built from OpenDART annual financial-statement API records and the promoted SK claim manifest.\n\n" +
    "## Runtime Boundary\n\n" +
    "Use this page only for bounded financial context. Each runtime answer must preserve company, year, reporting basis, account label, unit, and API status.\n\n" +
    "## Current Financial Claims\n\n" +
    table(["Claim ID", "Company", "Claim", "Runtime policy"], financialRows) +
    "\n## Source References\n\n" +
    "- `raw/manifests/sk.dart-financial-table.2022-2024.json`\n" +
    "- `raw/manifests/sk.source-backed-claims.json`\n";
}

function renderCompanyPage(company) {
  const companyClaims = records.filter((record) => record.companyId === company.companyId);
  const financialRows = companyClaims
    .filter((record) => record.claimType.includes("financial"))
    .map((record) => [`\`${record.id}\``, record.claimText, `\`${record.runtimeUsePolicy}\``]);
  const narrativeRows = companyClaims
    .filter((record) => record.paperUseLevel === "source-backed-narrative-seed-claim")
    .map((record) => [
      `\`${record.id}\``,
      `\`${record.claimType}\``,
      record.forwardLooking ? "plan/forward-looking" : "realized/source-stated",
      record.claimText
    ]);

  return `${frontMatter(`${company.koreanName} SK Wiki Seed`, "sk", company.companyId, "source-backed", "medium")}\n` +
    `# ${company.koreanName} Wiki Seed\n\n` +
    "## Runtime Boundary\n\n" +
    "This page is an LLM-readable synthesis layer. Raw source manifests and source-backed claim records remain authoritative.\n\n" +
    "## Financial Claims\n\n" +
    (financialRows.length > 0
      ? table(["Claim ID", "Claim", "Runtime policy"], financialRows)
      : "No financial source-backed claim is promoted for this company.\n") +
    "\n## Narrative Claims\n\n" +
    (narrativeRows.length > 0
      ? table(["Claim ID", "Type", "Forward-looking status", "Claim"], narrativeRows)
      : "No narrative source-backed claim is promoted for this company.\n") +
    "\n## Source References\n\n" +
    "- `raw/manifests/sk.source-backed-claims.json`\n" +
    "- `raw/manifests/sk.extraction-report.json`\n" +
    "- `raw/manifests/sk.narrative-claim-queue.json`\n";
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
