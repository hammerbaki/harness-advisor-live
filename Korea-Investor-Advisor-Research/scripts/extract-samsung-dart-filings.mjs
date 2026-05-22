import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const env = await loadEnv();
const apiKey = env.DART_API_KEY;
const allowFetch = process.env.SAMSUNG_DART_FILING_FETCH !== "0";
const writeRaw = process.env.SAMSUNG_DART_FILING_WRITE_RAW === "1";
const writeText = process.env.SAMSUNG_DART_FILING_WRITE_TEXT === "1";
const inventoryPath = process.env.SAMSUNG_INVENTORY ?? "raw/manifests/samsung.local-sources.json";
const outputPath = process.env.SAMSUNG_DART_FILING_EXTRACT_OUT ?? "raw/manifests/samsung.dart-filing-extraction-report.json";
const textOutputDir = process.env.SAMSUNG_DART_FILING_TEXT_DIR ?? "raw/extracted/samsung/dart";
const selectedIds = new Set(
  String(process.env.SAMSUNG_DART_FILING_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
);

const inventory = await readJson(inventoryPath);
const filings = (inventory.entries ?? []).filter((entry) =>
  entry.processingDecision === "extract-via-dart-document-pipeline" &&
  (selectedIds.size === 0 || selectedIds.has(entry.id))
);
const unzipAvailable = await hasUnzip();
const results = [];

for (const filing of filings) {
  const startedAt = Date.now();
  if (!apiKey) {
    results.push(resultBase(filing, "skipped_missing_api_key", {
      extractionMs: Date.now() - startedAt,
      nextAction: "provide DART_API_KEY or keep this filing as viewer-only metadata"
    }));
    continue;
  }
  if (!allowFetch) {
    results.push(resultBase(filing, "planned_not_fetched", {
      extractionMs: Date.now() - startedAt,
      nextAction: "run without SAMSUNG_DART_FILING_FETCH=0 to fetch OpenDART document.xml"
    }));
    continue;
  }

  try {
    const url = buildDocumentUrl(filing.rceptNo);
    const response = await fetch(url, { headers: { accept: "application/zip, application/xml, */*" } });
    const bytes = Buffer.from(await response.arrayBuffer());
    const isZip = bytes.slice(0, 2).toString("latin1") === "PK";
    const errorText = isZip ? null : bytes.toString("utf8").slice(0, 1000);
    const zipSha256 = sha256(bytes);
    const rawPath = writeRaw ? join(rootDir, textOutputDir, `${filing.id}.zip`) : null;
    if (writeRaw && rawPath) {
      await mkdir(dirname(rawPath), { recursive: true });
      await writeFile(rawPath, bytes);
    }

    let textResult = null;
    if (isZip && writeText) {
      textResult = await extractTextFromZipBytes(filing, bytes);
    }

    results.push(resultBase(filing, isZip ? "ok" : "error", {
      sourceUrl: redactedUrl(url),
      httpStatus: response.status,
      contentType: response.headers.get("content-type"),
      byteLength: bytes.length,
      zipSha256,
      rawPath: rawPath ? relative(rootDir, rawPath) : null,
      textCharCount: textResult?.textCharCount ?? null,
      textSha256: textResult?.textSha256 ?? null,
      markdownPath: textResult?.markdownPath ?? null,
      unzipAvailable,
      errorText,
      extractionMs: Date.now() - startedAt,
      nextAction: isZip
        ? writeText
          ? "review extracted DART filing markdown and draft atomic claims"
          : "set SAMSUNG_DART_FILING_WRITE_TEXT=1 for local text extraction"
        : "inspect DART response and receipt number"
    }));
  } catch (error) {
    results.push(resultBase(filing, "error", {
      error: error instanceof Error ? error.message : String(error),
      extractionMs: Date.now() - startedAt,
      nextAction: "rerun after checking network/API access"
    }));
  }

  await delay(120);
}

const output = {
  schemaVersion: "dart-filing-extraction-report.v0.1",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  inventoryPath,
  policy:
    "DART viewer filings are canonical public document URLs, but narrative claim promotion requires extracted filing text and evidence locators. API keys are omitted from artifacts.",
  execution: {
    allowFetch,
    hasApiKey: Boolean(apiKey),
    writeRaw,
    writeText,
    unzipAvailable
  },
  totals: {
    filings: results.length,
    ok: results.filter((result) => result.extractionStatus === "ok").length,
    plannedNotFetched: results.filter((result) => result.extractionStatus === "planned_not_fetched").length,
    skippedMissingApiKey: results.filter((result) => result.extractionStatus === "skipped_missing_api_key").length,
    error: results.filter((result) => result.extractionStatus === "error").length,
    textExtracted: results.filter((result) => result.markdownPath).length,
    byCompany: countBy(results, (result) => result.koreanName ?? "unknown")
  },
  results
};

await writeJson(outputPath, output);
console.log(`Samsung DART filing extraction report written: ${outputPath}`);
console.log(
  `${output.totals.ok} ok, ${output.totals.plannedNotFetched} planned, ` +
    `${output.totals.skippedMissingApiKey} missing-key, ${output.totals.error} error.`
);

async function extractTextFromZipBytes(filing, bytes) {
  if (!unzipAvailable) {
    return null;
  }
  const tmp = await mkdtemp(join(tmpdir(), "samsung-dart-"));
  const zipPath = join(tmp, `${filing.id}.zip`);
  try {
    await writeFile(zipPath, bytes);
    const { stdout } = await execFile("unzip", ["-p", zipPath], { maxBuffer: 50 * 1024 * 1024 });
    const text = normalizeText(stripXml(stdout));
    const markdownPath = join(rootDir, textOutputDir, `${filing.id}-${safeName(filing.title)}.md`);
    await mkdir(dirname(markdownPath), { recursive: true });
    await writeFile(markdownPath, renderMarkdown(filing, text), "utf8");
    return {
      textCharCount: text.length,
      textSha256: sha256(text),
      markdownPath: relative(rootDir, markdownPath)
    };
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

function resultBase(filing, extractionStatus, extra = {}) {
  return {
    manifestId: filing.id,
    groupId: "samsung",
    companyId: filing.companyId,
    koreanName: filing.koreanName,
    title: filing.title,
    rceptNo: filing.rceptNo,
    receiptDate: filing.receiptDate,
    period: filing.period,
    documentType: filing.documentType,
    sourcePageUrl: filing.sourcePageUrl,
    extractionStatus,
    ...extra
  };
}

function buildDocumentUrl(rceptNo) {
  const url = new URL("https://opendart.fss.or.kr/api/document.xml");
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("rcept_no", rceptNo);
  return url;
}

async function hasUnzip() {
  try {
    await execFile("unzip", ["-v"], { maxBuffer: 1024 * 1024 });
    return true;
  } catch {
    return false;
  }
}

function renderMarkdown(filing, text) {
  return [
    "---",
    `manifest_id: "${filing.id}"`,
    `title: "${String(filing.title).replaceAll("\"", "\\\"")}"`,
    `group_id: "samsung"`,
    `company_id: "${filing.companyId}"`,
    `document_type: "${filing.documentType}"`,
    `period: "${filing.period ?? ""}"`,
    `rcept_no: "${filing.rceptNo}"`,
    `source_page_url: "${filing.sourcePageUrl}"`,
    `extracted_at: "${new Date().toISOString()}"`,
    "---",
    "",
    `# ${filing.title}`,
    "",
    "> Local DART filing extraction output for human review. Do not redistribute unless rights are verified.",
    "",
    text || "_No extractable text detected._",
    ""
  ].join("\n");
}

async function loadEnv() {
  const envPath = join(rootDir, ".env");
  try {
    const raw = await readFile(envPath, "utf8");
    return {
      ...process.env,
      ...Object.fromEntries(
        raw
          .split(/\r?\n/u)
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#") && line.includes("="))
          .map((line) => {
            const index = line.indexOf("=");
            return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/gu, "")];
          })
      )
    };
  } catch {
    return process.env;
  }
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function stripXml(value) {
  return String(value ?? "")
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<\/(p|div|tr|table|section|TITLE|P)>/giu, "\n")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&amp;/gu, "&")
    .replace(/&nbsp;/gu, " ");
}

function normalizeText(value) {
  return String(value ?? "").normalize("NFC").replace(/[ \t]+/gu, " ").replace(/\n{3,}/gu, "\n\n").trim();
}

function safeName(value) {
  return String(value ?? "dart-filing")
    .replace(/[^\p{Letter}\p{Number}._-]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 80);
}

function redactedUrl(url) {
  const redacted = new URL(url);
  redacted.searchParams.set("crtfc_key", "[redacted]");
  return redacted.toString();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

