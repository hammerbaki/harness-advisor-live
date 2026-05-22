import { existsSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const rootDir = process.cwd();
const projectRoot = dirname(rootDir);
const sourceRoot = resolve(process.env.IR_DOWNLOAD_ROOT ?? join(projectRoot, "ir_download"));
const importManifestPath = join(rootDir, "raw", "manifests", "ir-download-backfill-import.json");
const retirementManifestPath = join(rootDir, "raw", "manifests", "ir-download-retirement.json");
const docPath = join(rootDir, "docs", "81_ir_download_retirement.md");

if (!existsSync(importManifestPath)) {
  throw new Error("Missing ir-download import manifest. Run npm run import:ir-download first.");
}

const importManifest = JSON.parse(await import("node:fs/promises").then((fs) => fs.readFile(importManifestPath, "utf8")));
const records = importManifest.records ?? [];
const sourceFiles = records.filter((record) => record.sourcePath).length;
const unsafeRecords = records.filter((record) => !["skipped-duplicate-hash", "copied"].includes(record.status));
const duplicateRecords = records.filter((record) => record.status === "skipped-duplicate-hash").length;
const copiedRecords = records.filter((record) => record.status === "copied").length;

if (sourceFiles === 0) {
  throw new Error("Import manifest has no source records; refusing to retire staging folder.");
}
if (unsafeRecords.length > 0) {
  throw new Error(`Import manifest has ${unsafeRecords.length} unsafe record(s); refusing to retire staging folder.`);
}

const existedBeforeRetirement = existsSync(sourceRoot);
if (existedBeforeRetirement) {
  rmSync(sourceRoot, { recursive: true, force: false });
}

const output = {
  schemaVersion: "ir-download-retirement.v0.1",
  generatedAt: new Date().toISOString(),
  retiredPath: relative(projectRoot, sourceRoot).normalize("NFC"),
  existedBeforeRetirement,
  removed: existedBeforeRetirement && !existsSync(sourceRoot),
  importManifest: relative(projectRoot, importManifestPath).normalize("NFC"),
  retirementBasis:
    "All ir_download source files were previously copied or matched as SHA-256 duplicates in Knowledge Base. The staging folder no longer contains unique source evidence.",
  counts: {
    sourceFiles,
    duplicateRecords,
    copiedRecords,
    unsafeRecords: unsafeRecords.length
  }
};

writeFileSync(retirementManifestPath, `${JSON.stringify(output, null, 2)}\n`);
writeFileSync(docPath, renderDoc(output));

console.log(`Retired staging folder: ${output.retiredPath}`);
console.log(`Removed: ${output.removed}`);
console.log(`Readable retirement note written: ${docPath}`);

function renderDoc(retirement) {
  return [
    "# IR Download Staging Retirement",
    "",
    `Generated: ${retirement.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document records the retirement of the external `ir_download` staging folder after its files were reconciled into the project Knowledge Base.",
    "",
    "## Result",
    "",
    table(
      ["Check", "Value"],
      [
        ["Retired path", `\`${retirement.retiredPath}\``],
        ["Folder existed before retirement", retirement.existedBeforeRetirement],
        ["Folder removed", retirement.removed],
        ["Source files checked", retirement.counts.sourceFiles],
        ["Duplicate-hash records", retirement.counts.duplicateRecords],
        ["Copied records", retirement.counts.copiedRecords],
        ["Unsafe records", retirement.counts.unsafeRecords]
      ]
    ),
    "",
    "## Basis",
    "",
    retirement.retirementBasis,
    "",
    "## Follow-Up Rule",
    "",
    "Future incoming source packages should first be placed in a temporary staging folder, reconciled by SHA-256 into `Knowledge Base`, indexed through the source ledger, and then retired only after the import manifest shows no unsafe records.",
    "",
    "## Machine-Readable Artifact",
    "",
    "- `raw/manifests/ir-download-retirement.json`",
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
