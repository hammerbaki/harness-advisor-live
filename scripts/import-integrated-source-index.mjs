import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const knowledgeBaseRoot = resolve(process.env.KNOWLEDGE_BASE_ROOT ?? join(rootDir, "..", "Knowledge Base"));
const inputPath = resolve(
  process.env.SOURCE_INDEX_INPUT ??
    "/Users/jj/Downloads/통합 IR 자료 Source Index.md"
);
const outputReportPath = resolve(
  process.env.SOURCE_INDEX_IMPORT_REPORT ??
    join(rootDir, "raw", "manifests", "integrated-source-index-import-report.json")
);
const outputFileStem = process.env.SOURCE_INDEX_FILE_STEM ?? null;

const importedAt = new Date().toISOString();
const markdown = await readFile(inputPath, "utf8");
const rows = parseSourceIndex(markdown).map(normalizeRow);
const byTarget = groupBy(rows, (row) => targetForCompanyId(row.company_id));

const outputTargets = [
  {
    target: "hyundai-motor",
    root: resolve(knowledgeBaseRoot, "hyundai_knowledge"),
    fileName: outputFileStem ? `${outputFileStem}.md` : "source_index_kia_hanwha_backfill.md",
    rows: byTarget.get("hyundai-motor") ?? []
  },
  {
    target: "hanwha",
    root: resolve(knowledgeBaseRoot, "hanhwa_knowledge"),
    fileName: outputFileStem ? `${outputFileStem}.md` : "source_index_affiliate_backfill.md",
    rows: byTarget.get("hanwha") ?? []
  }
];

const outputs = [];
for (const target of outputTargets) {
  if (target.rows.length === 0) continue;
  const outputPath = resolve(target.root, target.fileName);
  await mkdir(target.root, { recursive: true });
  await writeFile(outputPath, renderSourceIndex(target), "utf8");
  outputs.push({
    target: target.target,
    outputPath: relative(rootDir, outputPath).normalize("NFC"),
    rows: target.rows.length,
    matchedLocalFiles: target.rows.filter((row) => row.local_match_status === "matched").length,
    metadataOnlyRows: target.rows.filter((row) => row.local_match_status === "metadata_only").length,
    unmatchedLocalFiles: target.rows.filter((row) => row.local_match_status === "unmatched").length
  });
}

const report = {
  schemaVersion: "integrated-source-index-import-report.v0.1",
  generatedAt: importedAt,
  inputPath,
  parser: "scripts/import-integrated-source-index.mjs",
  policy:
    "Normalize collector-provided source index rows into group-level source provenance ledgers. Non-URL direct_document_url notes are moved into note, request packages are inferred, analyst reports are kept metadata-only, and local checksums are recalculated when files are present.",
  totals: {
    inputRows: rows.length,
    normalizedRows: rows.length,
    matchedLocalFiles: rows.filter((row) => row.local_match_status === "matched").length,
    metadataOnlyRows: rows.filter((row) => row.local_match_status === "metadata_only").length,
    unmatchedLocalFiles: rows.filter((row) => row.local_match_status === "unmatched").length,
    byCompany: countBy(rows, (row) => row.company),
    byTarget: countBy(rows, (row) => targetForCompanyId(row.company_id)),
    byRequestPackage: countBy(rows, (row) => row.request_package),
    byRightsLevel: countBy(rows, (row) => row.rights_level)
  },
  outputs,
  rows: rows.map((row) => ({
    company: row.company,
    company_id: row.company_id,
    local_file: row.local_file,
    title: row.title,
    source_page_url: row.source_page_url,
    direct_document_url: row.direct_document_url,
    dart_receipt_url: row.dart_receipt_url,
    date_or_period: row.date_or_period,
    document_type: row.document_type,
    target: targetForCompanyId(row.company_id),
    request_package: row.request_package,
    selection_reason: row.selection_reason,
    rights_level: row.rights_level,
    access_date: row.access_date,
    checksum: row.checksum,
    note: row.note,
    local_match_status: row.local_match_status,
    resolved_local_path: row.resolved_local_path,
    normalization_notes: row.normalization_notes
  }))
};

await mkdir(resolve(outputReportPath, ".."), { recursive: true });
await writeFile(outputReportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`Integrated source index imported from: ${inputPath}`);
for (const output of outputs) {
  console.log(`${output.target}: ${output.rows} row(s), ${output.matchedLocalFiles} matched, ${output.unmatchedLocalFiles} unmatched -> ${output.outputPath}`);
}
console.log(`Import report written: ${relative(rootDir, outputReportPath)}`);

function parseSourceIndex(text) {
  const output = [];
  let headers = null;
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
    if (cells.length < 5) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/u.test(cell))) continue;
    const normalizedHeaders = cells.map((cell) => normalizeHeader(cell));
    if (normalizedHeaders.includes("company") && normalizedHeaders.includes("local_file")) {
      headers = normalizedHeaders;
      continue;
    }
    if (!headers || cells.length !== headers.length) continue;
    const row = {};
    headers.forEach((header, index) => {
      if (!header) return;
      row[header] = cleanCell(cells[index]);
    });
    if (!row.company || !row.company_id) continue;
    if (!row.local_file && !row.source_page_url && !row.direct_document_url && !row.dart_receipt_url) continue;
    output.push(row);
  }
  return output;
}

function normalizeRow(raw) {
  const row = { ...raw };
  const normalizationNotes = [];

  const directDocumentUrl = cleanUrl(row.direct_document_url);
  if (row.direct_document_url && !directDocumentUrl) {
    normalizationNotes.push(`direct_document_url note moved to note: ${row.direct_document_url}`);
    row.note = appendNote(row.note, row.direct_document_url);
    row.direct_document_url = "";
  } else {
    row.direct_document_url = directDocumentUrl ?? "";
  }

  row.source_page_url = cleanUrl(row.source_page_url) ?? row.source_page_url ?? "";
  row.dart_receipt_url = cleanUrl(row.dart_receipt_url) ?? "";
  row.document_type = normalizeDocumentType(row.document_type, row.title);
  row.request_package = row.request_package || inferRequestPackage(row.document_type, row.title);
  row.rights_level = normalizeRightsLevel(row.rights_level, row.document_type, row.title);
  row.access_date = row.access_date || "2026-05-05";

  const local = resolveLocalFile(row);
  row.local_match_status = local.metadataOnly ? "metadata_only" : (local.exists ? "matched" : "unmatched");
  row.resolved_local_path = local.exists ? relative(rootDir, local.path).normalize("NFC") : "";
  if (local.exists) {
    row.local_file = local.relativeLocalFile;
    row.checksum = `sha256:${sha256FileSync(local.path)}`;
  } else if (local.metadataOnly) {
    row.checksum = normalizeChecksum(row.checksum);
    normalizationNotes.push("metadata-only official source row; no local file is required");
  } else {
    row.checksum = normalizeChecksum(row.checksum);
    normalizationNotes.push("local file was not matched under Knowledge Base");
  }

  if (row.document_type === "analyst_report") {
    row.note = appendNote(row.note, "third-party analyst report; keep metadata-only unless usage rights are separately cleared");
  }

  row.normalization_notes = normalizationNotes;
  return row;
}

function renderSourceIndex({ target, rows }) {
  const title = target === "hyundai-motor"
    ? "Hyundai Motor Group Source Index - Backfill"
    : "Hanwha Source Index - Affiliate Backfill";
  return [
    `# ${title}`,
    "",
    `Generated: ${importedAt}`,
    "",
    `Imported from: \`${inputPath}\``,
    "",
    "This ledger records source provenance for raw IR/DART materials. Stable direct document URLs are preferred but not required for dynamic issuer downloads. Rows with `source_page_url`, exact title, period, local file, access date, and checksum can proceed to extraction/claim review after evidence locators are checked.",
    "",
    table(
      [
        "company",
        "company_id",
        "local_file",
        "source_page_url",
        "direct_document_url",
        "dart_receipt_url",
        "title",
        "date_or_period",
        "document_type",
        "request_package",
        "selection_reason",
        "rights_level",
        "access_date",
        "checksum",
        "note"
      ],
      rows.map((row) => [
        row.company,
        row.company_id,
        row.local_file,
        row.source_page_url,
        row.direct_document_url,
        row.dart_receipt_url,
        row.title,
        row.date_or_period,
        row.document_type,
        row.request_package,
        row.selection_reason,
        row.rights_level,
        row.access_date,
        row.checksum,
        appendNote(row.note, row.normalization_notes.join("; "))
      ])
    ),
    ""
  ].join("\n");
}

function resolveLocalFile(row) {
  if (!cleanCell(row.local_file)) {
    return {
      exists: false,
      path: "",
      relativeLocalFile: "",
      metadataOnly: Boolean(row.dart_receipt_url || row.direct_document_url || row.source_page_url)
    };
  }
  const groupRoot = targetForCompanyId(row.company_id) === "hyundai-motor"
    ? resolve(knowledgeBaseRoot, "hyundai_knowledge")
    : resolve(knowledgeBaseRoot, "hanhwa_knowledge");
  const normalizedLocalFile = normalizeGroupRelativeLocalFile(row.local_file, targetForCompanyId(row.company_id));
  const directPath = resolve(groupRoot, normalizedLocalFile);
  if (existsSync(directPath)) return { exists: true, path: directPath, relativeLocalFile: normalizedLocalFile };
  const knownPath = knownLocalPath(groupRoot, row);
  if (knownPath) {
    return {
      exists: true,
      path: knownPath,
      relativeLocalFile: relative(groupRoot, knownPath).normalize("NFC")
    };
  }
  const basenameOnly = basename(normalizedLocalFile).normalize("NFC");
  const candidates = findByBasename(groupRoot, basenameOnly);
  if (candidates.length === 1) {
    return {
      exists: true,
      path: candidates[0],
      relativeLocalFile: relative(groupRoot, candidates[0]).normalize("NFC")
    };
  }
  return { exists: false, path: directPath, relativeLocalFile: normalizedLocalFile };
}

function normalizeGroupRelativeLocalFile(localFile, target) {
  const normalized = String(localFile ?? "")
    .normalize("NFC")
    .replaceAll("\\", "/")
    .replace(/^\.?\//u, "");
  if (target === "hyundai-motor") return normalized.replace(/^hyundai_knowledge\//u, "");
  if (target === "hanwha") return normalized.replace(/^hanhwa_knowledge\//u, "");
  return normalized;
}

function knownLocalPath(root, row) {
  if (targetForCompanyId(row.company_id) !== "hanwha" || row.company_id !== "hanwha") return null;
  const title = `${row.title ?? ""} ${row.local_file ?? ""}`.normalize("NFC");
  if (/4분기\s*실적|4q25|earnings/iu.test(title)) return findByNeedles(root, ["4Q25", "Earnings"]);
  if (/기업가치/iu.test(title)) {
    return findByNeedles(root, ["(주)한화", "기업가치"]) ??
      findByNeedles(root, ["㈜한화", "기업가치"]) ??
      findByNeedles(root, ["기업가치", "제고계획"]);
  }
  if (/대신증권/iu.test(title)) return findByNeedles(root, ["대신증권", "불확실성"]);
  if (/NH투자증권|저평가/iu.test(title)) return findByNeedles(root, ["NH투자증권", "저평가"]);
  return null;
}

function findByNeedles(root, needles) {
  if (!existsSync(root)) return null;
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    const entries = readDirSyncSafe(dir);
    for (const entry of entries) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) stack.push(path);
      if (!entry.isFile()) continue;
      const normalizedName = entry.name.normalize("NFC");
      if (needles.every((needle) => normalizedName.includes(needle))) return path;
    }
  }
  return null;
}

function findByBasename(root, targetBasename) {
  if (!existsSync(root)) return [];
  const output = [];
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    const entries = readDirSyncSafe(dir);
    for (const entry of entries) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) stack.push(path);
      if (entry.isFile() && entry.name.normalize("NFC") === targetBasename) output.push(path);
    }
  }
  return output;
}

function readDirSyncSafe(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function sha256FileSync(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function normalizeHeader(value) {
  const key = String(value ?? "")
    .normalize("NFKC")
    .replace(/[`*_]/gu, "")
    .replace(/\s+/gu, "")
    .toLowerCase();
  const map = {
    company: "company",
    company_id: "company_id",
    companyid: "company_id",
    local_file: "local_file",
    localfile: "local_file",
    source_page_url: "source_page_url",
    sourcepageurl: "source_page_url",
    direct_document_url: "direct_document_url",
    directdocumenturl: "direct_document_url",
    dart_receipt_url: "dart_receipt_url",
    dartreceipturl: "dart_receipt_url",
    title: "title",
    date_or_period: "date_or_period",
    dateorperiod: "date_or_period",
    document_type: "document_type",
    documenttype: "document_type",
    request_package: "request_package",
    requestpackage: "request_package",
    selection_reason: "selection_reason",
    selectionreason: "selection_reason",
    rights_level: "rights_level",
    rightslevel: "rights_level",
    access_date: "access_date",
    accessdate: "access_date",
    checksum: "checksum",
    note: "note"
  };
  return map[key] ?? null;
}

function normalizeDocumentType(value, title) {
  const clean = cleanCell(value).replace(/\s+/gu, "_").toLowerCase();
  if (clean === "presentation" && /기업가치|value.?up|주주환원/iu.test(title)) return "value_up";
  if (clean) return clean;
  if (/감사보고서/iu.test(title)) return "audit_report";
  if (/사업보고서/iu.test(title)) return "annual_report";
  if (/기업가치|value.?up|주주환원/iu.test(title)) return "value_up";
  if (/리포트|증권/iu.test(title)) return "analyst_report";
  return "earnings_release";
}

function inferRequestPackage(documentType, title) {
  if (["annual_report", "audit_report", "quarterly_report", "business_report"].includes(documentType)) return "PKG-02";
  if (["earnings_release", "earnings_presentation", "presentation", "investor_presentation"].includes(documentType)) return "PKG-03";
  if (["value_up", "value_up_plan", "capital_action"].includes(documentType) || /기업가치|주주환원/iu.test(title)) return "PKG-04";
  if (["governance", "governance_document"].includes(documentType)) return "PKG-05";
  if (documentType === "analyst_report") return "PKG-06";
  return "PKG-03";
}

function normalizeRightsLevel(value, documentType, title) {
  if (documentType === "analyst_report" || /증권|리포트/iu.test(title)) return "licensed-third-party-metadata-only";
  return value || "public-official";
}

function normalizeChecksum(value) {
  const clean = cleanCell(value);
  if (!clean) return "";
  if (clean.startsWith("sha256:")) return clean;
  if (/^[a-f0-9]{64}$/iu.test(clean)) return `sha256:${clean.toLowerCase()}`;
  return `sha256-prefix:${clean}`;
}

function cleanUrl(value) {
  const clean = cleanCell(value);
  if (!/^https?:\/\//iu.test(clean)) return "";
  return clean.replace(/[).,\]]+$/u, "");
}

function cleanCell(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/giu, " ")
    .replace(/\\\|/gu, "|")
    .trim();
}

function appendNote(existing, note) {
  return [existing, note].map(cleanCell).filter(Boolean).join("; ");
}

function targetForCompanyId(companyId) {
  const hyundaiCompanyIds = new Set([
    "hyundai-motor",
    "kia",
    "hyundai-mobis",
    "hyundai-glovis",
    "hyundai-rotem",
    "hyundai-autoever",
    "hyundai-wia",
    "hyundai-eandc",
    "innocean",
    "hyundai-motor-securities",
    "hyundai-bng-steel",
    "hyundai-steel"
  ]);
  if (hyundaiCompanyIds.has(companyId)) return "hyundai-motor";
  return "hanwha";
}

function groupBy(items, keyFn) {
  const output = new Map();
  for (const item of items) {
    const key = keyFn(item);
    output.set(key, [...(output.get(key) ?? []), item]);
  }
  return output;
}

function countBy(items, keyFn) {
  return Object.fromEntries(
    [...groupBy(items, keyFn).entries()]
      .map(([key, value]) => [key || "missing", value.length])
      .sort(([a], [b]) => String(a).localeCompare(String(b), "ko-KR"))
  );
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeMarkdownCell).join(" | ")} |`)
  ].join("\n");
}

function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/gu, " ")
    .replace(/\|/gu, "\\|")
    .trim();
}
