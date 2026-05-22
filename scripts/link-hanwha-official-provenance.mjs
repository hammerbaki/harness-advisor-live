import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = join(rootDir, "raw", "manifests", "hanwha.local-sources.json");
const scanPath = join(rootDir, "raw", "manifests", "hanwha.official-site-scan.json");
const outputPath = resolve(
  process.env.HANWHA_PROVENANCE_OUT ??
    join(rootDir, "raw", "manifests", "hanwha.source-provenance.json")
);

const inventory = JSON.parse(await readFile(inventoryPath, "utf8"));
const scan = JSON.parse(await readFile(scanPath, "utf8"));

const officialByLocalId = new Map();
for (const download of scan.downloads) {
  if (!download.matchedLocalManifestId) continue;
  officialByLocalId.set(download.matchedLocalManifestId, download);
}

const localSources = inventory.entries.map((entry) => {
  const official = officialByLocalId.get(entry.id);
  return {
    manifestId: entry.id,
    title: entry.title,
    filename: entry.filename,
    localPath: entry.localPath,
    sha256: entry.sha256,
    inferredSourceRole: entry.inferredSourceRole,
    sourceCategory: entry.sourceCategory,
    processingDecision: entry.processingDecision,
    officialProvenanceStatus: official ? "official-site-matched" : "not-matched",
    officialSource: official
      ? {
          sourcePageUrl: official.sourcePageUrl,
          sourcePageTitle: official.sourcePageTitle,
          section: official.section,
          rowNumber: official.rowNumber,
          rowTitle: official.rowTitle,
          filePath: official.filePath,
          fileName: official.fileName,
          downloadUrl: official.downloadUrl,
          sourceKind: official.sourceKind
        }
      : null
  };
});

const unmatchedLocal = localSources.filter((source) => source.officialProvenanceStatus !== "official-site-matched");
const missingLocal = scan.downloads
  .filter((download) => download.localMatchStatus === "missing-local-file")
  .map((download) => ({
    sourcePageUrl: download.sourcePageUrl,
    section: download.section,
    rowNumber: download.rowNumber,
    rowTitle: download.rowTitle,
    fileName: download.fileName,
    extension: download.extension,
    sourceKind: download.sourceKind,
    downloadUrl: download.downloadUrl,
    recommendedAction: recommendAction(download)
  }));

const provenance = {
  schemaVersion: "source-provenance.v0.1",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  officialRootUrl: scan.rootUrl,
  sourceUsePolicy:
    "Local files may be used as official-source candidates only when matched to the official Hanwha IR/investment route and retained as manifest metadata, not redistributed PDFs.",
  scopeConclusion:
    "The local folder covers the current/core Hanwha reference-slice materials, not the entire official Hanwha IR archive.",
  totals: {
    localSources: localSources.length,
    localMatchedOfficial: localSources.length - unmatchedLocal.length,
    localUnmatchedOfficial: unmatchedLocal.length,
    officialDownloadsFound: scan.totals.downloadsFound,
    officialDownloadsMissingLocal: missingLocal.length
  },
  localSources,
  officialDownloadsMissingLocal: missingLocal
};

await mkdir(resolve(outputPath, ".."), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(provenance, null, 2)}\n`, "utf8");
console.log(`Hanwha official provenance written: ${outputPath.replace(`${rootDir}/`, "")}`);
console.log(
  `${provenance.totals.localMatchedOfficial}/${provenance.totals.localSources} local sources matched official site; ` +
    `${provenance.totals.officialDownloadsMissingLocal} official download(s) absent locally.`
);

function recommendAction(download) {
  if (download.extension === "mp3") return "exclude-from-paper-source-set-unless-voice-demo-needs-audio-archive";
  if (download.section === "ir_materials" && download.rowNumber >= 30) return "consider-downloading-if-quarterly-2025-history-is-needed";
  if (download.section === "periodic_reports" && download.rowNumber >= 29) return "consider-downloading-if-2022-2023-continuity-is-needed";
  if (download.section === "audit_reports" && download.rowNumber >= 11) return "consider-downloading-if-2020-audit-baseline-is-needed";
  if (String(download.section).includes("기업지배구조") || String(download.section).includes("이사회")) {
    return "consider-downloading-for-governance-wiki-completeness";
  }
  if (String(download.section).includes("ir홍보자료")) return "optional-archive-material-not-required-for-current-reference-slice";
  return "archive-only-unless-claim-requires-this-source";
}
