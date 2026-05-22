import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const env = await loadEnv();
const apiKey = env.DART_API_KEY;
if (!apiKey) throw new Error("DART_API_KEY is missing. Add it to .env before running this script.");

const groupId = process.env.DART_GROUP_ID ?? "samsung";
const years = (process.env.DART_FINANCIAL_YEARS ?? process.env.SAMSUNG_DART_YEARS ?? "2022,2023,2024")
  .split(",")
  .map((year) => year.trim())
  .filter(Boolean);
const yearLabel = years.length === 3 && years[0] === "2022" && years[2] === "2024"
  ? "2022-2024"
  : years.join("-");
const outputJsonPath =
  process.env.DART_FINANCIAL_OUT ??
  process.env.SAMSUNG_DART_FINANCIAL_OUT ??
  `raw/manifests/${groupId}.dart-financial-table.${yearLabel}.json`;
const outputDocPath =
  process.env.DART_FINANCIAL_DOC ??
  process.env.SAMSUNG_DART_FINANCIAL_DOC ??
  (groupId === "samsung" ? "docs/39_samsung_dart_financial_table.md" : `docs/${groupId}_dart_financial_table.md`);
const reportCode = "11011";

const groups = JSON.parse(await readFile(join(rootDir, "configs/groups.json"), "utf8"));
const targetGroup = groups.groups.find((group) => group.id === groupId);
if (!targetGroup) throw new Error(`${groupId} group is missing from configs/groups.json`);

const revenueMatchers = [
  /^매출액$/u,
  /^영업수익$/u,
  /^수익\(매출액\)$/u
];

const operatingIncomeMatchers = [
  /^영업이익$/u,
  /^영업이익\(손실\)$/u,
  /영업이익/u
];

const netIncomeMatchers = [
  /^당기순이익$/u,
  /^당기순이익\(손실\)$/u,
  /^연결당기순이익$/u,
  /^분기순이익$/u,
  /^반기순이익$/u,
  /^연결분기순이익$/u,
  /^연결반기순이익$/u
];

const totalAssetsMatchers = [
  /^자산총계$/u
];

const totalLiabilitiesMatchers = [
  /^부채총계$/u
];

const totalEquityMatchers = [
  /^자본총계$/u
];

const companies = targetGroup.companies.filter((company) => company.listed && company.dartCode);
const records = [];
for (const company of companies) {
  for (const year of years) {
    const record = await fetchFinancialRecord(company, year);
    records.push(record);
    await delay(120);
  }
}

const output = {
  schemaVersion: "dart-financial-table.v0.1",
  groupId,
  generatedAt: new Date().toISOString(),
  source: {
    provider: "OpenDART",
    endpoint: "fnlttSinglAcnt.json with fnlttSinglAcntAll.json fallback",
    reprtCode: reportCode,
    years,
    apiKeyPolicy: "DART_API_KEY loaded from local .env and omitted from this artifact."
  },
  accountSelectionPolicy:
    "Use consolidated annual rows where available. Revenue is selected only when OpenDART provides an explicit 매출액, 영업수익, or 수익(매출액) account. Do not define financial-company revenue from 이자수익, 수수료수익, 보험수익, or other finance-specific accounts in this paper-stage artifact.",
  policy:
    "Financial values are source-backed API extraction records, but any runtime use must preserve company, year, reporting basis, account label, unit, and API status.",
  totals: {
    companies: companies.length,
    years: years.length,
    requestedRecords: companies.length * years.length,
    okRecords: records.filter((record) => record.status === "ok").length,
    partialRecords: records.filter((record) => record.status === "partial").length,
    errorRecords: records.filter((record) => record.status === "error").length,
    missingRevenue: records.filter((record) => !record.revenue).length,
    missingOperatingIncome: records.filter((record) => !record.operatingIncome).length,
    missingNetIncome: records.filter((record) => !record.netIncome).length,
    missingTotalAssets: records.filter((record) => !record.totalAssets).length,
    missingTotalLiabilities: records.filter((record) => !record.totalLiabilities).length,
    missingTotalEquity: records.filter((record) => !record.totalEquity).length
  },
  records
};

await writeJson(outputJsonPath, output);
await writeMarkdown(outputDocPath, renderDoc(output));
console.log(`${targetGroup.koreanName} DART financial table written: ${outputJsonPath}`);
console.log(`Readable DART financial table written: ${outputDocPath}`);
console.log(`${output.totals.okRecords} ok, ${output.totals.partialRecords} partial, ${output.totals.errorRecords} error.`);

async function fetchFinancialRecord(company, year) {
  const majorUrl = buildDartUrl("fnlttSinglAcnt.json", company, year);

  try {
    const major = await fetchDartList(majorUrl);
    const majorRows = major.ok
      ? major.rows.map((row) => withSourceEndpoint(row, "fnlttSinglAcnt.json"))
      : [];
    const majorSelection = selectAccounts(majorRows);

    if (majorSelection.revenue && majorSelection.operatingIncome) {
      return recordFromSelection(company, year, majorRows, majorSelection, {
        status: "ok",
        dartStatus: major.dartStatus,
        dartMessage: major.dartMessage,
        sourceUrls: [redactedUrl(majorUrl)],
        fallbackUsed: false
      });
    }

    const fallback = await fetchAllAccountRows(company, year);
    const allRows = dedupeRows([...majorRows, ...fallback.rows]);
    const fallbackSelection = selectAccounts(allRows);
    if (fallbackSelection.revenue || fallbackSelection.operatingIncome) {
      return recordFromSelection(company, year, allRows, fallbackSelection, {
        status: fallbackSelection.revenue && fallbackSelection.operatingIncome ? "ok" : "partial",
        dartStatus: fallback.dartStatus ?? major.dartStatus,
        dartMessage: fallback.dartMessage ?? major.dartMessage,
        sourceUrls: [redactedUrl(majorUrl), ...fallback.sourceUrls],
        fallbackUsed: true,
        fallbackStatuses: fallback.statuses,
        primaryDartStatus: major.dartStatus,
        primaryDartMessage: major.dartMessage
      });
    }

    return baseRecord(company, year, {
      status: "error",
      dartStatus: major.dartStatus ?? fallback.dartStatus ?? "missing_accounts",
      dartMessage:
        major.dartMessage ??
        fallback.dartMessage ??
        "No revenue or operating-income account was selected from OpenDART rows.",
      sourceUrls: [redactedUrl(majorUrl), ...fallback.sourceUrls],
      fallbackUsed: fallback.rows.length > 0,
      fallbackStatuses: fallback.statuses,
      sourceRowCount: allRows.length,
      rawAccountNames: [...new Set(allRows.map((row) => row.account_nm))]
        .filter(Boolean)
        .slice(0, 60)
    });
  } catch (error) {
    return baseRecord(company, year, {
      status: "error",
      dartStatus: "fetch_error",
      dartMessage: error instanceof Error ? error.message : String(error),
      sourceUrls: [redactedUrl(majorUrl)]
    });
  }
}

async function fetchAllAccountRows(company, year) {
  const fsDivs = ["CFS", "OFS"];
  const rows = [];
  const statuses = [];
  const sourceUrls = [];
  let dartStatus = null;
  let dartMessage = null;

  for (const fsDiv of fsDivs) {
    const url = buildDartUrl("fnlttSinglAcntAll.json", company, year);
    url.searchParams.set("fs_div", fsDiv);
    const result = await fetchDartList(url);
    sourceUrls.push(redactedUrl(url));
    statuses.push({
      endpoint: "fnlttSinglAcntAll.json",
      fsDiv,
      status: result.dartStatus,
      message: result.dartMessage,
      rowCount: result.rows.length
    });
    dartStatus = result.dartStatus;
    dartMessage = result.dartMessage;
    if (result.ok) {
      rows.push(
        ...result.rows.map((row) => withSourceEndpoint(row, `fnlttSinglAcntAll.json:${fsDiv}`))
      );
    }
    await delay(120);
  }

  return { rows, statuses, sourceUrls, dartStatus, dartMessage };
}

async function fetchDartList(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const json = await response.json();
  const rows = Array.isArray(json.list) ? json.list : [];
  return {
    ok: response.ok && json.status === "000",
    dartStatus: json.status ?? String(response.status),
    dartMessage: json.message ?? response.statusText,
    rows
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

function withSourceEndpoint(row, sourceEndpoint) {
  return { ...row, sourceEndpoint };
}

function selectAccounts(rows) {
  const preferredRows = preferFinancialStatementRows(rows);
  return {
    preferredRows,
    revenue: pickAccount(preferredRows, revenueMatchers),
    operatingIncome: pickAccount(preferredRows, operatingIncomeMatchers),
    netIncome: pickAccount(preferredRows, netIncomeMatchers, "income"),
    totalAssets: pickAccount(preferredRows, totalAssetsMatchers, "balance"),
    totalLiabilities: pickAccount(preferredRows, totalLiabilitiesMatchers, "balance"),
    totalEquity: pickAccount(preferredRows, totalEquityMatchers, "balance")
  };
}

function recordFromSelection(company, year, rows, selection, fields) {
  const { preferredRows, revenue, operatingIncome, netIncome, totalAssets, totalLiabilities, totalEquity } = selection;
  const debtToEquityPct =
    totalLiabilities?.thstrm_amount && totalEquity?.thstrm_amount
      ? ratioPct(parseAmount(totalLiabilities.thstrm_amount), parseAmount(totalEquity.thstrm_amount))
      : null;
  return baseRecord(company, year, {
    ...fields,
    reportingBasis: revenue?.fs_div ?? operatingIncome?.fs_div ?? preferredRows[0]?.fs_div ?? null,
    statementName: revenue?.sj_nm ?? operatingIncome?.sj_nm ?? null,
    revenue: revenue ? accountRecord(revenue) : null,
    operatingIncome: operatingIncome ? accountRecord(operatingIncome) : null,
    netIncome: netIncome ? accountRecord(netIncome) : null,
    totalAssets: totalAssets ? accountRecord(totalAssets) : null,
    totalLiabilities: totalLiabilities ? accountRecord(totalLiabilities) : null,
    totalEquity: totalEquity ? accountRecord(totalEquity) : null,
    debtToEquityPct,
    sourceRowCount: rows.length,
    preferredRowCount: preferredRows.length,
    rawAccountNames: [...new Set(preferredRows.map((row) => row.account_nm))]
      .filter(Boolean)
      .slice(0, 60)
  });
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

function baseRecord(company, year, fields) {
  return {
    groupId,
    companyId: company.id,
    koreanName: company.koreanName,
    displayName: company.displayName,
    dartCode: company.dartCode,
    krxCode: company.krxCode,
    year,
    reportCode,
    reportName: "annual",
    ...fields
  };
}

function preferFinancialStatementRows(rows) {
  const cfs = rows.filter((row) => row.fs_div === "CFS");
  if (cfs.length > 0) return cfs;
  const ofs = rows.filter((row) => row.fs_div === "OFS");
  return ofs.length > 0 ? ofs : rows;
}

function pickAccount(rows, matchers, statementKind = "income") {
  const incomeRows = rows.filter((row) => row.sj_div === "IS" || row.sj_nm?.includes("손익"));
  const balanceRows = rows.filter((row) => row.sj_div === "BS" || row.sj_nm?.includes("재무상태"));
  const candidates = statementKind === "balance"
    ? (balanceRows.length > 0 ? balanceRows : rows)
    : (incomeRows.length > 0 ? incomeRows : rows);
  for (const matcher of matchers) {
    const found = candidates.find((row) => matcher.test(row.account_nm ?? ""));
    if (found) return found;
  }
  return null;
}

function accountRecord(row) {
  const amountKrw = parseAmount(row.thstrm_amount);
  return {
    accountId: row.account_id ?? null,
    accountName: row.account_nm ?? null,
    amountKrw,
    amountEokKrw: amountKrw === null ? null : Math.round(amountKrw / 100000000),
    rawAmount: row.thstrm_amount ?? null,
    fsDiv: row.fs_div ?? null,
    fsName: row.fs_nm ?? null,
    sjDiv: row.sj_div ?? null,
    sjName: row.sj_nm ?? null,
    sourceEndpoint: row.sourceEndpoint ?? null,
    currency: "KRW"
  };
}

function parseAmount(value) {
  if (value === undefined || value === null || value === "") return null;
  const normalized = String(value).replace(/,/gu, "").replace(/[()]/gu, "").trim();
  if (!normalized) return null;
  const sign = /^\(.+\)$/u.test(String(value)) ? -1 : 1;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? sign * parsed : null;
}

function ratioPct(numerator, denominator) {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) return null;
  return (numerator / denominator) * 100;
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
  const companyRows = [];
  for (const company of companies) {
    const byYear = records.filter((record) => record.companyId === company.id);
    companyRows.push([
      company.koreanName,
      ...years.flatMap((year) => {
        const record = byYear.find((item) => item.year === year);
        return [
          formatEok(record?.operatingIncome?.amountEokKrw),
          formatEok(record?.revenue?.amountEokKrw)
        ];
      })
    ]);
  }

  const headers = [
    "Company",
    ...years.flatMap((year) => [`${year} operating income`, `${year} revenue`])
  ];

  const partials = records.filter((record) => record.status !== "ok");
  const accountRows = records.map((record) => [
    record.koreanName,
    record.year,
    record.status,
    record.revenue?.accountName ?? "",
    record.operatingIncome?.accountName ?? "",
    record.netIncome?.accountName ?? "",
    record.totalLiabilities?.accountName ?? "",
    record.totalEquity?.accountName ?? "",
    record.reportingBasis ?? "",
    record.fallbackUsed ? "yes" : "no"
  ]);
  return [
    `# ${targetGroup.koreanName} DART Financial Table`,
    "",
    `Generated: ${output.generatedAt}`,
    "",
    "Source: OpenDART `fnlttSinglAcnt.json` with `fnlttSinglAcntAll.json` fallback, annual report code `11011`.",
    "",
    "Values are converted to 억원 from KRW and rounded to the nearest integer.",
    "Revenue is filled only when OpenDART provides an explicit `매출액`, `영업수익`, or `수익(매출액)` account. The paper-stage artifact does not define financial-company revenue from finance-specific accounts such as `이자수익`, `수수료수익`, or `보험수익`.",
    "Net income, total assets, total liabilities, total equity, and debt-to-equity ratio are recorded only when OpenDART provides explicit account labels. These fields are source-backed display fields, not analyst-defined replacements.",
    "",
    table(headers, companyRows),
    "",
    "## Account Selection Detail",
    "",
    table(
      ["Company", "Year", "Status", "Revenue account", "Operating income account", "Net income account", "Liabilities account", "Equity account", "Basis", "Fallback used"],
      accountRows
    ),
    "",
    "## Extraction Status",
    "",
    `- OK records: ${output.totals.okRecords}`,
    `- Partial records: ${output.totals.partialRecords}`,
    `- Error records: ${output.totals.errorRecords}`,
    `- Missing revenue: ${output.totals.missingRevenue}`,
    `- Missing operating income: ${output.totals.missingOperatingIncome}`,
    `- Missing net income: ${output.totals.missingNetIncome}`,
    `- Missing total assets: ${output.totals.missingTotalAssets}`,
    `- Missing total liabilities: ${output.totals.missingTotalLiabilities}`,
    `- Missing total equity: ${output.totals.missingTotalEquity}`,
    "",
    "## Non-OK Records",
    "",
    partials.length === 0
      ? "No partial or error records.\n"
      : table(
          ["Company", "Year", "Status", "DART status", "Message"],
          partials.map((record) => [
            record.koreanName,
            record.year,
            record.status,
            record.dartStatus,
            record.dartMessage
          ])
        ),
    "",
    "## Use Boundary",
    "",
    "This table is suitable as an official API-backed financial source manifest.",
    "Runtime answers must preserve company, year, account label, reporting basis, and source state.",
    ""
  ].join("\n");
}

function table(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map((cell) => String(cell ?? "").replace(/\|/gu, "/")).join(" | ")} |`)
  ].join("\n");
}

function formatEok(value) {
  return value === null || value === undefined ? "" : String(value);
}

function redactedUrl(url) {
  const redacted = new URL(url);
  redacted.searchParams.set("crtfc_key", "[redacted]");
  return redacted.toString();
}

function delay(ms) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, ms));
}
