import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const inventoryPath = process.env.SAMSUNG_INVENTORY ?? "raw/manifests/samsung.local-sources.json";
const extractionPath = process.env.SAMSUNG_EXTRACTION ?? "raw/manifests/samsung.extraction-report.json";
const dartExtractionPath = process.env.SAMSUNG_DART_EXTRACTION ?? "raw/manifests/samsung.dart-filing-extraction-report.json";
const outputPath = process.env.SAMSUNG_CLAIM_PLAN_OUT ?? "raw/manifests/samsung.claim-candidate-plan.json";

const inventory = await readJson(inventoryPath);
const extraction = await readJson(extractionPath);
const dartExtraction = existsSync(join(rootDir, dartExtractionPath)) ? await readJson(dartExtractionPath) : { results: [] };
const dartTextByManifestId = new Map();
for (const result of dartExtraction.results ?? []) {
  if (result.extractionStatus !== "ok" || !result.markdownPath) continue;
  try {
    dartTextByManifestId.set(result.manifestId, await readFile(join(rootDir, result.markdownPath), "utf8"));
  } catch {
    dartTextByManifestId.set(result.manifestId, "");
  }
}
const extractedByCompany = groupBy(extraction.results ?? [], (result) => result.companyId ?? "unknown");
const dartExtractedByCompany = groupBy(
  (dartExtraction.results ?? []).filter((result) => result.extractionStatus === "ok" && result.markdownPath),
  (result) => result.companyId ?? "unknown"
);
const inventoryByCompany = groupBy(inventory.entries ?? [], (entry) => entry.companyId ?? "unknown");

const candidateThemes = [
  {
    id: "samsung-electronics-memory-hbm-recovery",
    companyId: "samsung-electronics",
    koreanName: "삼성전자",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-electronics.md",
    answerUse: "memory/HBM and DS-led operating recovery context",
    preferredDocumentTypes: ["earnings_presentation"],
    evidenceTerms: ["HBM", "메모리", "DS", "영업이익", "AI"],
    claimDraftPolicy:
      "Draft only after reviewer confirms the reporting period, unit, and whether the claim is actual result or management outlook."
  },
  {
    id: "samsung-sdi-battery-ess-profitability",
    companyId: "samsung-sdi",
    koreanName: "삼성SDI",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-sdi.md",
    answerUse: "battery/ESS demand, profitability pressure, and recovery variables",
    preferredDocumentTypes: ["earnings_presentation"],
    evidenceTerms: ["ESS", "배터리", "매출", "영업이익", "LFP", "NCA"],
    claimDraftPolicy:
      "Separate historical loss/profit figures from forward-looking ESS or battery demand statements."
  },
  {
    id: "samsung-ct-portfolio-shareholder-return",
    companyId: "samsung-ct",
    koreanName: "삼성물산",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-ct.md",
    answerUse: "portfolio, segment performance, shareholder letter, and governance context",
    preferredDocumentTypes: ["business_report", "quarterly_report", "shareholder_letter"],
    evidenceTerms: ["주주", "배당", "포트폴리오", "매출", "영업이익", "바이오"],
    claimDraftPolicy:
      "Use shareholder letters for management policy claims and financial reports for numeric claims."
  },
  {
    id: "samsung-biologics-capacity-orders-growth",
    companyId: "samsung-biologics",
    koreanName: "삼성바이오로직스",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-biologics.md",
    answerUse: "CDMO revenue scale, operating margin, capacity expansion, and order/backlog context",
    preferredDocumentTypes: ["earnings_presentation", "business_report", "operating_report"],
    evidenceTerms: ["매출", "영업이익", "수주", "공장", "CDMO", "CMO", "CDO"],
    claimDraftPolicy:
      "Label capacity, order, and guidance claims as company presentation or plan unless audited filing confirms them."
  },
  {
    id: "samsung-electro-mechanics-mlcc-component-cycle",
    companyId: "samsung-electro-mechanics",
    koreanName: "삼성전기",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-electro-mechanics.md",
    answerUse: "MLCC, camera module, package substrate, and component-cycle context",
    preferredDocumentTypes: ["earnings_presentation", "business_report", "operating_report"],
    evidenceTerms: ["MLCC", "카메라", "패키지", "기판", "매출", "영업이익", "전장"],
    claimDraftPolicy:
      "Use earnings releases for component-cycle commentary and annual reports for audited business and financial basis."
  },
  {
    id: "samsung-life-capital-shareholder-return",
    companyId: "samsung-life",
    koreanName: "삼성생명",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-life.md",
    answerUse: "insurance capital strength, profitability, and shareholder-return context",
    preferredDocumentTypes: ["business_report", "quarterly_report", "semiannual_report"],
    evidenceTerms: ["자본", "보험", "배당", "주주", "손익"],
    requiresPipeline: "dart-document-extraction",
    claimDraftPolicy:
      "Use DART filing text before drafting. Do not rely on SPA index pages for source-backed claims."
  },
  {
    id: "samsung-fire-capital-loss-ratio-shareholder-return",
    companyId: "samsung-fire-marine",
    koreanName: "삼성화재",
    suggestedWikiTarget: "wiki/groups/samsung/companies/samsung-fire-marine.md",
    answerUse: "capital, loss ratio, profitability, and shareholder-return context",
    preferredDocumentTypes: ["business_report", "quarterly_report", "semiannual_report"],
    evidenceTerms: ["자본", "보험", "손해율", "배당", "주주", "손익"],
    requiresPipeline: "dart-document-extraction",
    claimDraftPolicy:
      "Use DART filing text before drafting. Insurance metrics must preserve reporting basis and period."
  }
];

const records = candidateThemes.map((theme) => {
  const extracted = extractedByCompany.get(theme.companyId) ?? [];
  const dartExtracted = dartExtractedByCompany.get(theme.companyId) ?? [];
  const inventoryEntries = inventoryByCompany.get(theme.companyId) ?? [];
  const usableSources = extracted
    .filter((source) => theme.preferredDocumentTypes.includes(source.documentType))
    .map((source) => ({
      manifestId: source.manifestId,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      sourcePageUrl: source.sourcePageUrl,
      textSha256: source.textSha256,
      textCharCount: source.textCharCount,
      evidenceTermHits: theme.evidenceTerms.filter((term) => sourceHasTerm(source, term))
    }))
    .filter((source) => source.evidenceTermHits.length > 0)
    .sort((a, b) => b.evidenceTermHits.length - a.evidenceTermHits.length || String(b.period).localeCompare(String(a.period)));

  const usableDartSources = dartExtracted
    .filter((source) => theme.preferredDocumentTypes.includes(source.documentType))
    .map((source) => ({
      manifestId: source.manifestId,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      sourcePageUrl: source.sourcePageUrl,
      textSha256: source.textSha256,
      textCharCount: source.textCharCount,
      markdownPath: source.markdownPath,
      rceptNo: source.rceptNo,
      evidenceTermHits: theme.evidenceTerms.filter((term) => sourceHasTerm(source, term))
    }))
    .filter((source) => source.evidenceTermHits.length > 0)
    .sort((a, b) => b.evidenceTermHits.length - a.evidenceTermHits.length || String(b.period).localeCompare(String(a.period)));

  const dartViewerSources = inventoryEntries
    .filter((entry) => entry.processingDecision === "extract-via-dart-document-pipeline")
    .map((entry) => ({
      manifestId: entry.id,
      title: entry.title,
      documentType: entry.documentType,
      period: entry.period,
      rceptNo: entry.rceptNo,
      sourcePageUrl: entry.sourcePageUrl
    }));

  const sourceState =
    usableSources.length > 0
      ? "local_pdf_extracted"
      : usableDartSources.length > 0
        ? "dart_text_extracted"
        : dartViewerSources.length > 0
        ? "dart_viewer_pending_extraction"
        : "source_gap";

  return {
    id: theme.id,
    groupId: "samsung",
    companyId: theme.companyId,
    koreanName: theme.koreanName,
    suggestedWikiTarget: theme.suggestedWikiTarget,
    answerUse: theme.answerUse,
    evidenceTerms: theme.evidenceTerms,
    sourceState,
    usableSourceCount: usableSources.length + usableDartSources.length,
    usableSources: [...usableSources, ...usableDartSources].slice(0, 5),
    dartViewerSources,
    verificationState: "candidate_plan_not_runtime_eligible",
    nextAction:
      sourceState === "local_pdf_extracted"
        ? "review extracted markdown and draft atomic source-backed seed claims"
        : sourceState === "dart_text_extracted"
          ? "review extracted DART markdown and draft atomic source-backed seed claims"
        : sourceState === "dart_viewer_pending_extraction"
          ? "run DART document extraction before claim drafting"
          : "collect official source documents",
    claimDraftPolicy: theme.claimDraftPolicy
  };
});

const output = {
  schemaVersion: "claim-candidate-plan.v0.1",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  inventoryPath,
  extractionPath,
  policy:
    "This is a claim-candidate plan, not runtime knowledge. Claims become runtime-eligible only after reviewer-authored atomic claim text, source URL, period, reporting basis, and evidence location are recorded.",
  totals: {
    records: records.length,
    localPdfReadyThemes: records.filter((record) => record.sourceState === "local_pdf_extracted").length,
    dartTextReadyThemes: records.filter((record) => record.sourceState === "dart_text_extracted").length,
    dartViewerPendingThemes: records.filter((record) => record.sourceState === "dart_viewer_pending_extraction").length,
    sourceGapThemes: records.filter((record) => record.sourceState === "source_gap").length
  },
  records
};

await writeFile(join(rootDir, outputPath), `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Samsung claim candidate plan written: ${outputPath}`);
console.log(
  `${output.totals.localPdfReadyThemes} local-PDF-ready theme(s), ` +
    `${output.totals.dartTextReadyThemes} DART-text-ready theme(s), ` +
    `${output.totals.dartViewerPendingThemes} DART-pending theme(s), ` +
    `${output.totals.sourceGapThemes} source-gap theme(s).`
);

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  return groups;
}

function sourceHasTerm(source, term) {
  const haystack = `${source.title ?? ""} ${source.documentType ?? ""} ${source.period ?? ""} ${
    dartTextByManifestId.get(source.manifestId) ?? ""
  }`.toLowerCase();
  return haystack.includes(term.toLowerCase()) || likelyTextTermHit(source, term);
}

function likelyTextTermHit(source, term) {
  // The extraction report intentionally stores hashes and metadata, not full text.
  // Use title/type metadata here; human review happens against raw/extracted/.
  if (term === "매출" || term === "영업이익") {
    return ["earnings_presentation", "business_report", "quarterly_report", "semiannual_report", "operating_report"].includes(source.documentType);
  }
  if (term === "주주" || term === "배당") return source.documentType === "shareholder_letter";
  return false;
}
