import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const planPath = process.env.SAMSUNG_CLAIM_PLAN ?? "raw/manifests/samsung.claim-candidate-plan.json";
const inventoryPath = process.env.SAMSUNG_INVENTORY ?? "raw/manifests/samsung.local-sources.json";
const outputRoot = process.env.SAMSUNG_WIKI_OUT ?? "wiki/groups/samsung";

const plan = await readJson(planPath);
const inventory = await readJson(inventoryPath);
const invalidEntries = (inventory.entries ?? []).filter((entry) => entry.processingDecision?.startsWith("exclude-"));

await writeMarkdown(`${outputRoot}/source-dictionary.md`, renderSourceDictionary(plan, invalidEntries));
for (const record of plan.records ?? []) {
  await writeMarkdown(record.suggestedWikiTarget, renderCompanySeed(record));
}
await writeMarkdown(`${outputRoot}/sources.md`, renderSources(plan, inventory));

console.log(`Samsung wiki seed written under ${outputRoot}`);
console.log(`${(plan.records ?? []).length} company seed page(s), ${invalidEntries.length} excluded source(s).`);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeMarkdown(relativePath, markdown) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function renderSourceDictionary(plan, invalidEntries) {
  const rows = (plan.records ?? []).map((record) => [
    record.koreanName,
    record.sourceState,
    String(record.usableSourceCount),
    record.nextAction,
    record.suggestedWikiTarget
  ]);
  return `${frontMatter("Samsung Source Dictionary", "samsung", "candidate-plan")}\n# Samsung Source Dictionary\n\n` +
    "This page is a generated LLM Wiki seed. It is not a source-backed claim set.\n\n" +
    "The purpose is to expose reproducible source routing for Samsung while keeping claim promotion conservative.\n\n" +
    "## Candidate Themes\n\n" +
    table(["Company", "Source state", "Usable sources", "Next action", "Wiki target"], rows) +
    "\n## Excluded Sources\n\n" +
    (invalidEntries.length === 0
      ? "No excluded Samsung local source files.\n"
      : invalidEntries.map((entry) =>
          `- ${entry.title}: ${entry.processingDecision}. ${entry.notes?.join(" ")}`
        ).join("\n") + "\n") +
    "\n## Rules\n\n" +
    "- Runtime claims require atomic claim text, source URL, period, reporting basis, and evidence location.\n" +
    "- Recording or non-text files are excluded from the text knowledge dictionary.\n" +
    "- PPT, subtitle, business report, audit/review report, and DART filing text may be used after extraction and review.\n" +
    "- DART viewer filings must pass the DART document extraction pipeline before claim drafting.\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/samsung.local-sources.json`\n" +
    "- `raw/manifests/samsung.claim-candidate-plan.json`\n";
}

function renderCompanySeed(record) {
  const sourceRows = (record.usableSources ?? []).map((source) => [
    source.manifestId,
    source.title,
    source.documentType,
    source.period ?? "",
    source.evidenceTermHits.join(", ")
  ]);
  const dartRows = (record.dartViewerSources ?? []).map((source) => [
    source.manifestId,
    source.title,
    source.documentType,
    source.period ?? "",
    source.rceptNo ?? ""
  ]);

  return `${frontMatter(`${record.koreanName} Samsung Wiki Seed`, "samsung", record.sourceState, record.companyId)}\n` +
    `# ${record.koreanName} Wiki Seed\n\n` +
    `Status: \`${record.verificationState}\`\n\n` +
    `Use: ${record.answerUse}\n\n` +
    `Next action: ${record.nextAction}\n\n` +
    "## Evidence Terms\n\n" +
    record.evidenceTerms.map((term) => `- ${term}`).join("\n") +
    "\n\n## Usable Extracted Sources\n\n" +
    (sourceRows.length > 0
      ? table(["Manifest ID", "Title", "Type", "Period", "Term hits"], sourceRows)
      : "No local extracted sources are ready for this theme.\n") +
    `\n## ${record.sourceState === "dart_text_extracted" ? "DART Filing Sources" : "DART Viewer Sources Pending Extraction"}\n\n` +
    (dartRows.length > 0
      ? table(["Manifest ID", "Title", "Type", "Period", "Receipt No."], dartRows)
      : "No DART viewer source is pending for this theme.\n") +
    "\n## Claim Draft Policy\n\n" +
    `${record.claimDraftPolicy}\n\n` +
    "## Runtime Boundary\n\n" +
    "This page can guide retrieval and human review, but it must not be treated as runtime-eligible source-backed knowledge until promoted claims exist.\n\n" +
    "## Source References\n\n" +
    `- Claim candidate plan: \`raw/manifests/samsung.claim-candidate-plan.json\`\n` +
    `- Source inventory: \`raw/manifests/samsung.local-sources.json\`\n` +
    `- Suggested target: \`${record.suggestedWikiTarget}\`\n`;
}

function renderSources(plan, inventory) {
  return `${frontMatter("Samsung Sources", "samsung", "candidate-plan")}\n# Samsung Sources\n\n` +
    "## Source Gate Summary\n\n" +
    `- Entries: ${inventory.totals.entries}\n` +
    `- Local files: ${inventory.totals.localFiles}\n` +
    `- Valid local PDFs: ${inventory.totals.validLocalPdfFiles}/${inventory.totals.localPdfFiles}\n` +
    `- DART viewer filings: ${inventory.totals.dartViewerFilings}\n` +
    `- Claim-candidate themes: ${plan.totals.records}\n` +
    `- Local-PDF-ready themes: ${plan.totals.localPdfReadyThemes}\n` +
    `- DART-text-ready themes: ${plan.totals.dartTextReadyThemes ?? 0}\n` +
    `- DART-pending themes: ${plan.totals.dartViewerPendingThemes}\n\n` +
    "## Source Policy\n\n" +
    `${plan.policy}\n\n` +
    "<!-- BEGIN GENERATED:source-backed-claim-manifest -->\n" +
    "## Source-Backed Claim Manifest\n\n" +
    "- `raw/manifests/samsung.source-backed-claims.json` records the first Samsung source-backed seed claims.\n" +
    "- `docs/41_samsung_source_backed_seed_claims.md` explains the DART-first promotion gate.\n" +
    "- Narrative IR/PDF claims remain candidate knowledge until document-level source URLs and review locators are promoted.\n" +
    "- Finance-company revenue is intentionally blank unless OpenDART provides an accepted explicit revenue account.\n" +
    "<!-- END GENERATED:source-backed-claim-manifest -->\n\n" +
    "## Source References\n\n" +
    "- `raw/manifests/samsung.local-sources.json`\n" +
    "- `raw/manifests/samsung.extraction-report.json`\n" +
    "- `raw/manifests/samsung.dart-filing-extraction-report.json`\n" +
    "- `raw/manifests/samsung.claim-candidate-plan.json`\n";
}

function frontMatter(title, groupId, sourceStatus, companyId = "") {
  return [
    "---",
    `title: "${title}"`,
    `group_id: "${groupId}"`,
    `company_id: "${companyId}"`,
    `source_status: "${sourceStatus}"`,
    `last_checked: "${new Date().toISOString().slice(0, 10)}"`,
    "confidence: \"candidate\"",
    "---",
    ""
  ].join("\n");
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\|/gu, "/")).join(" | ")} |`)
  ].join("\n") + "\n";
}
