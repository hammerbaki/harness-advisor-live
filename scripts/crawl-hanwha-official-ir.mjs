import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const baseUrl = "https://www.hanwhacorp.co.kr";
const seedUrl = `${baseUrl}/hanwha/investment/ir_event.jsp`;
const maxPages = Number(process.env.HANWHA_OFFICIAL_CRAWL_MAX_PAGES ?? 120);
const outputPath = resolve(
  process.env.HANWHA_OFFICIAL_SCAN_OUT ??
    join(rootDir, "raw", "manifests", "hanwha.official-site-scan.json")
);
const localInventoryPath = join(rootDir, "raw", "manifests", "hanwha.local-sources.json");

const localInventory = JSON.parse(await readFile(localInventoryPath, "utf8"));
const localByFilename = new Map(
  localInventory.entries.map((entry) => [normalizeFilename(entry.filename), entry])
);
const localByTitle = new Map(
  localInventory.entries.map((entry) => [normalizeTitle(entry.title), entry])
);

const queue = [seedUrl];
const visited = new Set();
const pages = [];
const downloads = [];

for (let idx = 0; idx < queue.length && visited.size < maxPages; idx += 1) {
  const url = queue[idx];
  if (visited.has(url) || !isInvestmentUrl(url)) continue;
  visited.add(url);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "enterprise-llm-agent-harness/0.1 source-provenance-crawler"
    }
  });
  const html = await response.text();
  const pageTitle = extractTitle(html);

  pages.push({
    url,
    status: response.status,
    title: pageTitle,
    htmlSha256: sha256(html),
    downloadCount: 0
  });

  for (const link of extractLinks(html, url)) {
    if (!visited.has(link) && !queue.includes(link) && isInvestmentUrl(link)) queue.push(link);
  }

  const pageDownloads = extractDownloads(html, url, pageTitle);
  pages.at(-1).downloadCount = pageDownloads.length;
  downloads.push(...pageDownloads);
}

const uniqueDownloads = dedupeDownloads(downloads).map((download) => {
  const localMatch =
    localByFilename.get(normalizeFilename(download.fileName)) ??
    localByTitle.get(normalizeTitle(stripExtension(download.fileName))) ??
    localByTitle.get(normalizeTitle(download.rowTitle)) ??
    null;
  return {
    ...download,
    matchedLocalManifestId: localMatch?.id ?? null,
    matchedLocalPath: localMatch?.localPath ?? null,
    localMatchStatus: localMatch ? "matched" : "missing-local-file"
  };
});

const localMatchedIds = new Set(uniqueDownloads.map((download) => download.matchedLocalManifestId).filter(Boolean));
const localUnmatched = localInventory.entries
  .filter((entry) => !localMatchedIds.has(entry.id))
  .map((entry) => ({
    id: entry.id,
    filename: entry.filename,
    title: entry.title,
    localPath: entry.localPath,
    inferredSourceRole: entry.inferredSourceRole,
    sourceCategory: entry.sourceCategory,
    reason: "not matched to crawled official download filename"
  }));

const scan = {
  schemaVersion: "official-site-scan.v0.1",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  rootUrl: seedUrl,
  scope:
    "Crawls same-origin /hanwha/investment/ pages reachable from the official IR event page and records hCorpfileDownload assets.",
  pagesVisited: pages.length,
  totals: {
    pagesVisited: pages.length,
    downloadsFound: uniqueDownloads.length,
    downloadsMatchedLocal: uniqueDownloads.filter((download) => download.localMatchStatus === "matched").length,
    downloadsMissingLocal: uniqueDownloads.filter((download) => download.localMatchStatus === "missing-local-file").length,
    localSourcesUnmatchedToOfficialDownload: localUnmatched.length,
    bySection: countBy(uniqueDownloads, (download) => download.section),
    byExtension: countBy(uniqueDownloads, (download) => download.extension)
  },
  pages,
  downloads: uniqueDownloads,
  localUnmatched
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(scan, null, 2)}\n`, "utf8");
console.log(`Hanwha official IR scan written: ${relativePath(outputPath)}`);
console.log(
  `${scan.totals.downloadsFound} official download(s), ` +
    `${scan.totals.downloadsMatchedLocal} matched local, ` +
    `${scan.totals.downloadsMissingLocal} missing local.`
);
if (scan.totals.localSourcesUnmatchedToOfficialDownload > 0) {
  console.log(`${scan.totals.localSourcesUnmatchedToOfficialDownload} local source(s) were not matched by filename to crawled official downloads.`);
}

function extractLinks(html, sourceUrl) {
  const links = [];
  const hrefPattern = /<a\b[^>]*\bhref=["']([^"']+)["']/giu;
  let match;
  while ((match = hrefPattern.exec(html))) {
    const href = decodeHtml(match[1]).trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;
    try {
      const absolute = new URL(href, sourceUrl);
      absolute.hash = "";
      links.push(absolute.href);
    } catch {
      // Ignore malformed links.
    }
  }
  return [...new Set(links)];
}

function extractDownloads(html, pageUrl, pageTitle) {
  const output = [];
  const tableRows = html.match(/<tr[\s\S]*?<\/tr>/giu) ?? [];
  for (const row of tableRows) {
    const downloadMatches = [...row.matchAll(/hCorpfileDownload\('([^']+)'\s*,\s*'([^']+)'\)/giu)];
    if (downloadMatches.length === 0) continue;
    const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/giu)].map((cell) => cleanText(cell[1]));
    const rowNumber = /^\d+$/u.test(cells[0] ?? "") ? Number(cells[0]) : null;
    const rowTitle = cells.find((cell) => cell && cell !== String(rowNumber)) ?? null;
    for (const downloadMatch of downloadMatches) {
      const filePath = decodeHtml(downloadMatch[1]);
      const fileName = decodeHtml(downloadMatch[2]).normalize("NFC");
      output.push({
        sourcePageUrl: pageUrl,
        sourcePageTitle: pageTitle,
        rowNumber,
        rowTitle,
        filePath,
        fileName,
        extension: extensionOf(fileName),
        downloadUrl: `${baseUrl}/common/fileDownload.do?path=${encodeURIComponent(filePath)}&name=${encodeURIComponent(fileName)}`,
        section: inferSection(pageUrl, pageTitle),
        sourceKind: inferSourceKind(pageUrl, rowTitle, fileName)
      });
    }
  }

  const directDownloadPattern = /<a\b([^>]*)\bhref=["']([^"']*\/common\/fileDownload\.do\?[^"']+)["']([^>]*)>([\s\S]*?)<\/a>/giu;
  let directMatch;
  while ((directMatch = directDownloadPattern.exec(html))) {
    const href = decodeHtml(directMatch[2]);
    const linkText = cleanText(directMatch[4]);
    const url = new URL(href, pageUrl);
    const filePath = url.searchParams.get("path") ?? "";
    const fileName = (url.searchParams.get("name") ?? linkText).normalize("NFC");
    output.push({
      sourcePageUrl: pageUrl,
      sourcePageTitle: pageTitle,
      rowNumber: null,
      rowTitle: linkText || null,
      filePath,
      fileName,
      extension: extensionOf(fileName),
      downloadUrl: url.href,
      section: inferSection(pageUrl, pageTitle),
      sourceKind: inferSourceKind(pageUrl, linkText, fileName)
    });
  }

  return output;
}

function dedupeDownloads(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = `${item.filePath}|${item.fileName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(item);
  }
  return output;
}

function isInvestmentUrl(url) {
  const parsed = new URL(url);
  return parsed.origin === baseUrl && parsed.pathname.startsWith("/hanwha/investment/");
}

function extractTitle(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/iu)?.[1] ?? "";
  const h2 = html.match(/<h2>([\s\S]*?)<\/h2>/iu)?.[1] ?? "";
  return cleanText(title || h2);
}

function inferSection(url, title) {
  const path = new URL(url).pathname;
  if (path.includes("performance_report")) return "ir_materials";
  if (path.includes("periodic_report")) return "periodic_reports";
  if (path.includes("audit_report")) return "audit_reports";
  if (path.includes("association")) return "governance";
  if (path.includes("stockholder")) return "shareholder_meeting";
  return normalizeTitle(title).replaceAll("-", "_") || "investment_page";
}

function inferSourceKind(url, rowTitle, fileName) {
  const text = `${url} ${rowTitle ?? ""} ${fileName}`;
  if (/증권|애널리스트|투자증권/u.test(text)) return "third_party_analyst";
  if (/실적|Earnings|기업가치|우선주|IRData/u.test(text)) return "official_ir_material";
  if (/사업보고서|분기보고서|반기보고서|Periodic/u.test(text)) return "official_periodic_report";
  if (/감사보고서/u.test(text)) return "official_audit_report";
  if (/정관|주주총회|지배구조/u.test(text)) return "official_governance";
  return "official_site_asset";
}

function cleanText(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .normalize("NFC");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/gu, "&")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/&quot;/gu, "\"")
    .replace(/&#39;/gu, "'")
    .replace(/&#x([0-9a-f]+);/giu, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/gu, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)));
}

function normalizeFilename(value) {
  return String(value ?? "").trim().normalize("NFC");
}

function normalizeTitle(value) {
  return stripExtension(value)
    .normalize("NFC")
    .replace(/\s+/gu, "")
    .replace(/[_-]/gu, "")
    .replace(/[㈜()（）\[\]]/gu, "")
    .toLowerCase();
}

function stripExtension(value) {
  return String(value ?? "").replace(/\.[a-z0-9]+$/iu, "");
}

function extensionOf(fileName) {
  return fileName.match(/\.([a-z0-9]+)$/iu)?.[1]?.toLowerCase() ?? "none";
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

function relativePath(path) {
  return path.replace(`${rootDir}/`, "");
}
