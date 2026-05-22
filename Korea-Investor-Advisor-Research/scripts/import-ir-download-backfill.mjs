import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";

const rootDir = process.cwd();
const projectRoot = dirname(rootDir);
const sourceRoot = process.env.IR_DOWNLOAD_ROOT
  ? resolve(process.env.IR_DOWNLOAD_ROOT)
  : join(projectRoot, "ir_download");
const knowledgeRoot = process.env.KNOWLEDGE_BASE_ROOT
  ? resolve(process.env.KNOWLEDGE_BASE_ROOT)
  : join(projectRoot, "Knowledge Base");
const manifestPath = join(rootDir, "raw", "manifests", "ir-download-backfill-import.json");
const docPath = join(rootDir, "docs", "77_ir_download_backfill_import.md");

const companyMap = {
  hanwha_aerospace: {
    groupId: "hanwha",
    companyId: "hanwha-aerospace",
    sourceDir: "hanwha_aerospace",
    targetDir: join("hanhwa_knowledge", "hanwha_aerospace")
  },
  hanwha_solutions: {
    groupId: "hanwha",
    companyId: "hanwha-solutions",
    sourceDir: "hanwha_solutions",
    targetDir: join("hanhwa_knowledge", "hanwha_solutions")
  },
  hanwha_systems: {
    groupId: "hanwha",
    companyId: "hanwha-systems",
    sourceDir: "hanwha_systems",
    targetDir: join("hanhwa_knowledge", "hanwha_systems")
  },
  hanwha_ocean: {
    groupId: "hanwha",
    companyId: "hanwha-ocean",
    sourceDir: "hanwha_ocean",
    targetDir: join("hanhwa_knowledge", "hanwha_ocean")
  },
  samsung_electro: {
    groupId: "samsung",
    companyId: "samsung-electro-mechanics",
    sourceDir: "samsung_electro",
    targetDir: join("samsung_knowledge", "삼성전기")
  },
  sk_square: {
    groupId: "sk",
    companyId: "sk-square",
    sourceDir: "sk_square",
    targetDir: join("sk_knowledge", "sk_square")
  },
  kia: {
    groupId: "hyundai-motor",
    companyId: "kia",
    sourceDir: "kia",
    targetDir: join("hyundai_knowledge", "kia")
  }
};

if (!existsSync(sourceRoot)) {
  throw new Error(`ir_download folder not found: ${sourceRoot}`);
}
if (!existsSync(knowledgeRoot)) {
  throw new Error(`Knowledge Base folder not found: ${knowledgeRoot}`);
}

const records = [];

for (const mapping of Object.values(companyMap)) {
  const absoluteSourceDir = join(sourceRoot, mapping.sourceDir);
  const absoluteTargetCompanyDir = join(knowledgeRoot, mapping.targetDir);
  if (!existsSync(absoluteSourceDir)) {
    records.push({
      groupId: mapping.groupId,
      companyId: mapping.companyId,
      sourceDir: relative(projectRoot, absoluteSourceDir),
      targetDir: relative(projectRoot, absoluteTargetCompanyDir),
      status: "missing-source-dir"
    });
    continue;
  }

  mkdirSync(absoluteTargetCompanyDir, { recursive: true });
  const existingHashes = collectHashes(absoluteTargetCompanyDir);
  const sourceFiles = listFiles(absoluteSourceDir).filter((file) => !basename(file).startsWith("."));

  for (const sourceFile of sourceFiles) {
    const hash = sha256(sourceFile);
    const category = classifyDocument(sourceFile, mapping.companyId);
    const targetDir = join(absoluteTargetCompanyDir, category);
    const targetPath = allocateTargetPath(targetDir, basename(sourceFile), hash);
    const duplicate = existingHashes.get(hash);

    if (duplicate) {
      records.push({
        groupId: mapping.groupId,
        companyId: mapping.companyId,
        category,
        sourcePath: relative(projectRoot, sourceFile),
        targetPath: relative(projectRoot, duplicate),
        sha256: hash,
        status: "skipped-duplicate-hash"
      });
      continue;
    }

    mkdirSync(targetDir, { recursive: true });
    copyFileSync(sourceFile, targetPath);
    existingHashes.set(hash, targetPath);
    records.push({
      groupId: mapping.groupId,
      companyId: mapping.companyId,
      category,
      sourcePath: relative(projectRoot, sourceFile),
      targetPath: relative(projectRoot, targetPath),
      sha256: hash,
      status: "copied"
    });
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  sourceRoot: relative(projectRoot, sourceRoot),
  knowledgeRoot: relative(projectRoot, knowledgeRoot),
  companies: Object.keys(companyMap).length,
  sourceFiles: records.filter((record) => record.sourcePath).length,
  copied: records.filter((record) => record.status === "copied").length,
  skippedDuplicateHash: records.filter((record) => record.status === "skipped-duplicate-hash").length,
  missingSourceDirs: records.filter((record) => record.status === "missing-source-dir").length
};

const manifest = {
  schemaVersion: "ir-download-backfill-import.v0.1",
  ...summary,
  records
};

mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(docPath, renderMarkdown(manifest));

console.log(`IR download backfill manifest written: ${manifestPath}`);
console.log(`Readable import note written: ${docPath}`);
console.log(`${summary.copied} copied, ${summary.skippedDuplicateHash} duplicate(s) skipped across ${summary.sourceFiles} source files.`);

function classifyDocument(filePath, companyId) {
  const name = basename(filePath).normalize("NFC").toLowerCase();

  if (/지속가능|sustainability/u.test(name)) return "sustainability";
  if (/기업지배구조|지배구조|정관|governance/u.test(name)) return "governance";
  if (/기업가치|value.?up|주주환원|배당/u.test(name)) return "value_up";
  if (/유상증자|출자|현금현물|자본|capital/u.test(name)) return "capital_actions";
  if (/검토보고서|분기.*보고서|quarterly.*report/u.test(name)) return "quarterly_reports";
  if (/감사보고서|연결감사보고서|audit/u.test(name)) return "audit_reports";
  if (/사업보고서|영업보고서|annual.*report|business.*report/u.test(name)) return "annual_reports";
  if (/portfolio_update|presentation|프레젠테이션|미래비전|설명자료/u.test(name)) {
    if (companyId === "sk-square") return "presentations";
    return "investor_presentations";
  }
  if (/earnings|실적|경영실적|ir_presentation|ir presentation|q[1-4]|[1-4]q/u.test(name)) return "earnings";
  return "misc";
}

function collectHashes(dir) {
  const hashes = new Map();
  if (!existsSync(dir)) return hashes;
  for (const file of listFiles(dir)) {
    if (basename(file).startsWith(".")) continue;
    hashes.set(sha256(file), file);
  }
  return hashes;
}

function allocateTargetPath(targetDir, filename, hash) {
  const candidate = join(targetDir, filename);
  if (!existsSync(candidate)) return candidate;
  if (sha256(candidate) === hash) return candidate;

  const ext = extname(filename);
  const stem = filename.slice(0, filename.length - ext.length);
  let index = 2;
  while (true) {
    const next = join(targetDir, `${stem}__import${index}${ext}`);
    if (!existsSync(next)) return next;
    if (sha256(next) === hash) return next;
    index += 1;
  }
}

function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

function sha256(filePath) {
  const hash = createHash("sha256");
  hash.update(readFileSync(filePath));
  return hash.digest("hex");
}

function renderMarkdown(manifest) {
  const byCompany = Object.values(companyMap).map((mapping) => {
    const companyRecords = manifest.records.filter((record) => record.companyId === mapping.companyId);
    const copied = companyRecords.filter((record) => record.status === "copied").length;
    const duplicates = companyRecords.filter((record) => record.status === "skipped-duplicate-hash").length;
    const categories = [...new Set(companyRecords.filter((record) => record.category).map((record) => record.category))].sort();
    return {
      groupId: mapping.groupId,
      companyId: mapping.companyId,
      sourceDir: mapping.sourceDir,
      targetDir: mapping.targetDir,
      total: companyRecords.filter((record) => record.sourcePath).length,
      copied,
      duplicates,
      categories
    };
  });

  return [
    "# IR Download Backfill Import",
    "",
    `Generated: ${manifest.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document records the safe import from the external `ir_download` folder into the project `Knowledge Base` folder. Files are copied by company and document type, exact SHA-256 duplicates are skipped, and no existing file is deleted or overwritten.",
    "",
    "## Summary",
    "",
    "| Metric | Count |",
    "| --- | ---: |",
    `| Source files scanned | ${manifest.sourceFiles} |`,
    `| Files copied into Knowledge Base | ${manifest.copied} |`,
    `| Duplicate files skipped by hash | ${manifest.skippedDuplicateHash} |`,
    `| Missing source directories | ${manifest.missingSourceDirs} |`,
    "",
    "## Company Import Result",
    "",
    "| Group | Company ID | Source folder | Target folder | Source files | Copied | Duplicates | Categories |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | --- |",
    ...byCompany.map((row) =>
      `| ${row.groupId} | \`${row.companyId}\` | \`${row.sourceDir}\` | \`${row.targetDir}\` | ${row.total} | ${row.copied} | ${row.duplicates} | ${row.categories.map((item) => `\`${item}\``).join(", ")} |`
    ),
    "",
    "## Classification Rule",
    "",
    "- earnings materials: earnings releases, IR presentations, quarterly performance decks.",
    "- annual reports: business reports and operating reports.",
    "- audit reports: separate and consolidated audit reports.",
    "- quarterly reports: review reports and quarterly review packages.",
    "- investor presentations: strategy or future-vision presentation material.",
    "- value-up: value-up plans, shareholder-return plans, dividend policy material.",
    "- capital actions: rights issue, capital allocation, and cash/stock dividend decision material.",
    "- governance and sustainability are kept separate because they support different claim types.",
    "",
    "## Next Step",
    "",
    "Run the group inventory scripts, first-slice audit, and source-ledger audit to confirm that the previously missing company source packages are visible to the harness.",
    "",
    "## Consolidation Note",
    "",
    "When all scanned files are skipped as duplicate hashes, the staging folder has still served its purpose: it proves that the external source package is already represented in `Knowledge Base`. The next consolidation layer is not another file copy. It is the canonical source ledger:",
    "",
    "- `raw/manifests/source-ledger.v0.1.json`",
    "- `raw/manifests/company-source-index.json`",
    "- `docs/79_source_ledger_and_consolidation.md`",
    "",
    "## Machine-Readable Artifact",
    "",
    "`raw/manifests/ir-download-backfill-import.json`",
    ""
  ].join("\n");
}
