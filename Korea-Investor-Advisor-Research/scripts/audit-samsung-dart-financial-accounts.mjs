import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const env = await loadEnv();
const apiKey = env.DART_API_KEY;
if (!apiKey) throw new Error("DART_API_KEY is missing. Add it to .env before running this script.");

const years = (process.env.SAMSUNG_DART_YEARS ?? "2022,2023,2024")
  .split(",")
  .map((year) => year.trim())
  .filter(Boolean);
const reportCode = "11011";
const outputJsonPath =
  process.env.SAMSUNG_DART_ACCOUNT_AUDIT_OUT ??
  "raw/manifests/samsung.dart-financial-account-audit.2022-2024.json";
const outputDocPath =
  process.env.SAMSUNG_DART_ACCOUNT_AUDIT_DOC ??
  "docs/40_samsung_financial_sector_dart_account_audit.md";

const groups = JSON.parse(await readFile(join(rootDir, "configs/groups.json"), "utf8"));
const samsung = groups.groups.find((group) => group.id === "samsung");
if (!samsung) throw new Error("Samsung group is missing from configs/groups.json");

const targetCompanyIds = new Set([
  "samsung-life",
  "samsung-fire-marine",
  "samsung-card",
  "samsung-securities"
]);
const companies = samsung.companies.filter(
  (company) => targetCompanyIds.has(company.id) && company.listed && company.dartCode
);

const records = [];
for (const company of companies) {
  for (const year of years) {
    records.push(await auditCompanyYear(company, year));
    await delay(120);
  }
}

const output = {
  schemaVersion: "dart-financial-account-audit.v0.1",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  source: {
    provider: "OpenDART",
    endpoints: ["fnlttSinglAcnt.json", "fnlttSinglAcntAll.json"],
    reprtCode: reportCode,
    years,
    apiKeyPolicy: "DART_API_KEY loaded from local .env and omitted from this artifact."
  },
  paperPolicy:
    "This audit records what OpenDART provides. It does not define financial-company revenue. The paper-stage financial table uses revenue only when OpenDART provides an explicit 매출액, 영업수익, or 수익(매출액) account.",
  totals: {
    companies: companies.length,
    years: years.length,
    requestedRecords: companies.length * years.length,
    recordsWithMajorRows: records.filter((record) => record.major.rowCount > 0).length,
    recordsWithAllRows: records.filter((record) => record.all.totalRowCount > 0).length,
    recordsWithExplicitRevenueAccount: records.filter((record) =>
      record.providedAccountNames.some((name) => isExplicitRevenueAccount(name))
    ).length,
    recordsWithOperatingIncomeAccount: records.filter((record) =>
      record.providedAccountNames.some((name) => /영업이익/u.test(name))
    ).length
  },
  records
};

await writeJson(outputJsonPath, output);
await writeMarkdown(outputDocPath, renderDoc(output));
console.log(`Samsung financial-sector DART account audit written: ${outputJsonPath}`);
console.log(`Readable account audit written: ${outputDocPath}`);

async function auditCompanyYear(company, year) {
  const majorUrl = buildDartUrl("fnlttSinglAcnt.json", company, year);
  const major = await fetchDartList(majorUrl);
  const allResults = [];
  const allRows = [];
  for (const fsDiv of ["CFS", "OFS"]) {
    const url = buildDartUrl("fnlttSinglAcntAll.json", company, year);
    url.searchParams.set("fs_div", fsDiv);
    const result = await fetchDartList(url);
    allResults.push({
      endpoint: "fnlttSinglAcntAll.json",
      fsDiv,
      status: result.dartStatus,
      message: result.dartMessage,
      rowCount: result.rows.length,
      sourceUrl: redactedUrl(url)
    });
    allRows.push(...result.rows.map((row) => ({ ...row, sourceEndpoint: `fnlttSinglAcntAll.json:${fsDiv}` })));
    await delay(120);
  }

  const majorRows = major.rows.map((row) => ({ ...row, sourceEndpoint: "fnlttSinglAcnt.json" }));
  const providedRows = dedupeRows([...majorRows, ...allRows]);
  const accountSummaryRows = summarizeRows(providedRows);
  const providedAccountNames = [...new Set(accountSummaryRows.map((row) => row.accountName))].filter(Boolean);

  const explicitRevenueAccounts = uniqueAccountRows(
    accountSummaryRows.filter((row) => isExplicitRevenueAccount(row.accountName))
  );
  const operatingIncomeAccounts = uniqueAccountRows(
    accountSummaryRows.filter((row) => /영업이익/u.test(row.accountName))
  );
  const financeSpecificAccounts = uniqueAccountRows(
    accountSummaryRows.filter((row) =>
      /이자수익|이자비용|수수료|보험|순이자|예수부채|보험계약/u.test(row.accountName)
    )
  );

  return {
    groupId: "samsung",
    companyId: company.id,
    koreanName: company.koreanName,
    displayName: company.displayName,
    dartCode: company.dartCode,
    krxCode: company.krxCode,
    year,
    reportCode,
    reportName: "annual",
    major: {
      endpoint: "fnlttSinglAcnt.json",
      status: major.dartStatus,
      message: major.dartMessage,
      rowCount: major.rows.length,
      sourceUrl: redactedUrl(majorUrl)
    },
    all: {
      totalRowCount: allRows.length,
      statuses: allResults
    },
    providedAccountNames,
    explicitRevenueAccounts,
    operatingIncomeAccounts,
    financeSpecificAccounts,
    accountRows: accountSummaryRows
  };
}

async function fetchDartList(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const json = await response.json();
  return {
    ok: response.ok && json.status === "000",
    dartStatus: json.status ?? String(response.status),
    dartMessage: json.message ?? response.statusText,
    rows: Array.isArray(json.list) ? json.list : []
  };
}

function buildDartUrl(endpoint, company, year) {
  const url = new URL(`https://opendart.fss.or.kr/api/${endpoint}`);
  url.searchParams.set("crtfc_key", apiKey);
  url.searchParams.set("corp_code", company.dartCode);
  url.searchParams.set("bsns_year", year);
  url.searchParams.set("reprt_code", reportCode);
  return url;
}

function summarizeRows(rows) {
  return dedupeRows(rows)
    .map((row) => {
      const amountKrw = parseAmount(row.thstrm_amount);
      return {
        accountId: row.account_id ?? "",
        accountName: row.account_nm ?? "",
        amountEokKrw: amountKrw === null ? null : Math.round(amountKrw / 100000000),
        rawAmount: row.thstrm_amount ?? "",
        fsDiv: row.fs_div ?? "",
        fsName: row.fs_nm ?? "",
        sjDiv: row.sj_div ?? "",
        sjName: row.sj_nm ?? "",
        sourceEndpoint: row.sourceEndpoint ?? ""
      };
    })
    .sort((a, b) =>
      [a.fsDiv, a.sjDiv, a.accountName, a.sourceEndpoint].join("|")
        .localeCompare([b.fsDiv, b.sjDiv, b.accountName, b.sourceEndpoint].join("|"), "ko")
    );
}

function isExplicitRevenueAccount(accountName) {
  return /^(매출액|영업수익|수익\(매출액\))$/u.test(accountName);
}

function uniqueAccountRows(rows) {
  const seen = new Set();
  const output = [];
  for (const row of rows) {
    const key = [row.accountName, row.fsDiv, row.sjName, row.sourceEndpoint].join("::");
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

function dedupeRows(rows) {
  const seen = new Set();
  const deduped = [];
  for (const row of rows) {
    const key = [
      row.fs_div,
      row.sj_div,
      row.account_id,
      row.account_nm,
      row.thstrm_amount,
      row.sourceEndpoint
    ].join("::");
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(row);
  }
  return deduped;
}

function parseAmount(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).replace(/,/gu, "").replace(/[()]/gu, "").trim();
  if (!normalized) return null;
  const sign = /^\(.+\)$/u.test(String(value)) ? -1 : 1;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? sign * parsed : null;
}

async function loadEnv() {
  const envPath = join(rootDir, ".env");
  try {
    const raw = await readFile(envPath, "utf8");
    return Object.fromEntries(
      raw
        .split(/\r?\n/u)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1).replace(/^["']|["']$/gu, "")];
        })
    );
  } catch {
    return process.env;
  }
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function writeMarkdown(relativePath, markdown) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, markdown, "utf8");
}

function renderDoc(output) {
  const summaryRows = output.records.map((record) => [
    record.koreanName,
    record.year,
    record.major.status,
    record.major.rowCount,
    record.all.totalRowCount,
    uniqueNames(record.explicitRevenueAccounts).join(", "),
    uniqueNames(record.operatingIncomeAccounts).join(", "),
    uniqueNames(record.financeSpecificAccounts).slice(0, 8).join(", ")
  ]);

  const detailBlocks = output.records.map((record) => {
    const selectedRows = uniqueAccountRows([
      ...record.explicitRevenueAccounts,
      ...record.operatingIncomeAccounts,
      ...record.financeSpecificAccounts
    ]);
    const rows = selectedRows.map((row) => [
      row.accountName,
      row.amountEokKrw ?? "",
      row.fsDiv,
      row.sjName,
      row.sourceEndpoint
    ]);
    return [
      `### ${record.koreanName} ${record.year}`,
      "",
      `- Major endpoint: ${record.major.status} ${record.major.message} (${record.major.rowCount} rows)`,
      `- All-account endpoint rows: ${record.all.totalRowCount}`,
      `- Explicit revenue accounts: ${uniqueNames(record.explicitRevenueAccounts).join(", ") || "none"}`,
      `- Operating-income accounts: ${uniqueNames(record.operatingIncomeAccounts).join(", ") || "none"}`,
      "",
      rows.length > 0
        ? table(["Account", "Amount(억원)", "Basis", "Statement", "Endpoint"], rows)
        : "No account rows were provided by OpenDART for this company-year."
    ].join("\n");
  });

  return [
    "# Samsung Financial-Sector DART Account Audit",
    "",
    `Generated: ${output.generatedAt}`,
    "",
    "This document records what OpenDART provides for Samsung financial companies. It does not define financial-company revenue.",
    "",
    "Paper-stage rule: revenue is used only when OpenDART explicitly provides `매출액`, `영업수익`, or `수익(매출액)`. Finance-specific accounts such as `이자수익`, `수수료수익`, `보험수익`, `보험계약자산`, or `순이자손익` remain visible as DART-provided accounts, but are not reclassified as revenue.",
    "",
    "## Summary",
    "",
    table(
      [
        "Company",
        "Year",
        "Major status",
        "Major rows",
        "All rows",
        "Explicit revenue accounts",
        "Operating-income accounts",
        "Finance-specific accounts observed"
      ],
      summaryRows
    ),
    "",
    "## Account Details",
    "",
    ...detailBlocks,
    ""
  ].join("\n");
}

function uniqueNames(rows) {
  return [...new Set(rows.map((row) => row.accountName).filter(Boolean))];
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replace(/\|/gu, "/")).join(" | ")} |`)
  ].join("\n");
}

function redactedUrl(url) {
  const redacted = new URL(url);
  redacted.searchParams.set("crtfc_key", "[redacted]");
  return redacted.toString();
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}
