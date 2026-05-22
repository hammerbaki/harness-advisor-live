import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const claimPlanPath = process.env.SAMSUNG_CLAIM_PLAN ?? "raw/manifests/samsung.claim-candidate-plan.json";
const urlIntakePath = process.env.SAMSUNG_DOCUMENT_URL_INTAKE ?? "raw/manifests/samsung.document-url-intake.json";
const dartExtractionPath = process.env.SAMSUNG_DART_FILING_EXTRACT_REPORT ?? "raw/manifests/samsung.dart-filing-extraction-report.json";
const outputPath = process.env.SAMSUNG_NARRATIVE_QUEUE_OUT ?? "raw/manifests/samsung.narrative-claim-queue.json";
const docPath = process.env.SAMSUNG_NARRATIVE_QUEUE_DOC ?? "docs/42_samsung_url_and_narrative_claim_readiness.md";

const claimPlan = await readJson(claimPlanPath);
const urlIntake = await readJson(urlIntakePath);
const dartExtraction = existsSync(join(rootDir, dartExtractionPath)) ? await readJson(dartExtractionPath) : null;
const urlBySourceId = new Map((urlIntake.entries ?? []).map((entry) => [entry.sourceId, entry]));
const dartExtractionById = new Map((dartExtraction?.results ?? []).map((entry) => [entry.manifestId, entry]));

const claimFamilies = {
  "samsung-electronics-memory-hbm-recovery": [
    "DS/메모리 실적 회복 근거",
    "HBM 또는 AI 수요 관련 경영진 설명",
    "실적 수치와 전망성 문구의 분리"
  ],
  "samsung-sdi-battery-ess-profitability": [
    "배터리/ESS 수요 및 수익성 근거",
    "분기 실적 둔화 또는 회복 변수",
    "전망성 문구와 확정 실적의 분리"
  ],
  "samsung-ct-portfolio-shareholder-return": [
    "포트폴리오 및 세그먼트 성과 근거",
    "주주서한 또는 배당/환원 정책 근거",
    "바이오/건설/상사 등 사업별 수익성 근거"
  ],
  "samsung-biologics-capacity-orders-growth": [
    "CDMO 매출 규모와 수익성 근거",
    "수주/공장/생산능력 관련 근거",
    "가이던스와 확정 실적의 분리"
  ],
  "samsung-life-capital-shareholder-return": [
    "보험 자본건전성 및 손익 근거",
    "주주환원 또는 배당정책 근거",
    "DART filing 본문에서 기간/계정명 확인"
  ],
  "samsung-fire-capital-loss-ratio-shareholder-return": [
    "손해율/보험손익/자본 관련 근거",
    "주주환원 또는 배당정책 근거",
    "DART filing 본문에서 기간/계정명 확인"
  ]
};

const records = (claimPlan.records ?? []).map((theme) => {
  const localSources = (theme.usableSources ?? []).map((source) => {
    const intake = urlBySourceId.get(source.manifestId);
    return {
      manifestId: source.manifestId,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      sourcePageUrl: intake?.sourcePageUrl ?? source.sourcePageUrl,
      publicDocumentUrl: intake?.publicDocumentUrl ?? null,
      urlStatus: intake?.urlStatus ?? "missing_from_url_intake",
      promotionReadiness: intake?.promotionReadiness ?? "blocked_missing_document_url",
      evidenceTermHits: source.evidenceTermHits ?? []
    };
  });

  const dartSources = (theme.dartViewerSources ?? []).map((source) => {
    const intake = urlBySourceId.get(source.manifestId);
    const extraction = dartExtractionById.get(source.manifestId);
    return {
      manifestId: source.manifestId,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      rceptNo: source.rceptNo,
      publicDocumentUrl: intake?.publicDocumentUrl ?? source.sourcePageUrl ?? null,
      urlStatus: intake?.urlStatus ?? "dart_viewer_url_supplied",
      extractionStatus: extraction?.extractionStatus ?? "not_run",
      textCharCount: extraction?.textCharCount ?? null,
      markdownPath: extraction?.markdownPath ?? null
    };
  });

  const readyLocalSources = localSources.filter((source) => source.promotionReadiness === "ready_for_claim_review");
  const readyDartSources = dartSources.filter((source) => source.extractionStatus === "ok" && source.markdownPath);
  const blockers = [];
  if (localSources.some((source) => source.promotionReadiness === "blocked_missing_document_url")) {
    blockers.push("local_pdf_document_url_missing");
  }
  if (dartSources.some((source) => source.extractionStatus !== "ok" || !source.markdownPath)) {
    blockers.push("dart_filing_text_not_extracted");
  }

  const queueState =
    readyLocalSources.length > 0 || readyDartSources.length > 0
      ? blockers.length > 0
        ? "partially_ready_for_human_claim_review"
        : "ready_for_human_claim_review"
      : "blocked_before_claim_review";

  return {
    id: theme.id,
    groupId: "samsung",
    companyId: theme.companyId,
    koreanName: theme.koreanName,
    answerUse: theme.answerUse,
    suggestedWikiTarget: theme.suggestedWikiTarget,
    verificationState: "narrative_claim_queue_not_runtime_eligible",
    queueState,
    candidateClaimFamilies: claimFamilies[theme.id] ?? [],
    localSources,
    dartSources,
    blockers,
    promotionRule:
      "Draft atomic narrative claims only after public document URL, period/reporting basis, extracted text hash, evidence locator, and forward-looking label are available.",
    nextAction: nextActionFor({ localSources, dartSources, readyLocalSources, readyDartSources, blockers })
  };
});

const output = {
  schemaVersion: "narrative-claim-queue.v0.1",
  groupId: "samsung",
  generatedAt: new Date().toISOString(),
  inputArtifacts: {
    claimPlan: claimPlanPath,
    documentUrlIntake: urlIntakePath,
    dartFilingExtraction: dartExtraction ? dartExtractionPath : null
  },
  policy:
    "Narrative claims remain non-runtime until public document URLs and evidence locators are complete. This queue prepares review work but does not promote claims.",
  totals: {
    records: records.length,
    readyForHumanClaimReview: records.filter((record) => record.queueState === "ready_for_human_claim_review").length,
    partiallyReadyForHumanClaimReview: records.filter((record) => record.queueState === "partially_ready_for_human_claim_review").length,
    blockedBeforeClaimReview: records.filter((record) => record.queueState === "blocked_before_claim_review").length,
    urlIntakePendingUserUrls: (urlIntake.entries ?? []).filter((entry) => entry.urlStatus === "pending_user_url").length,
    urlIntakeReadyForClaimReview: (urlIntake.entries ?? []).filter((entry) => entry.promotionReadiness === "ready_for_claim_review").length,
    localPdfSourcesWaitingForUrl: records.flatMap((record) => record.localSources)
      .filter((source) => source.promotionReadiness === "blocked_missing_document_url").length,
    dartSourcesWaitingForExtraction: records.flatMap((record) => record.dartSources)
      .filter((source) => source.extractionStatus !== "ok" || !source.markdownPath).length,
    byCompany: countBy(records, (record) => record.koreanName ?? "unknown")
  },
  records
};

await writeJson(outputPath, output);
await writeFile(join(rootDir, docPath), renderDoc(output), "utf8");

console.log(`Samsung narrative claim queue written: ${outputPath}`);
console.log(`Readable readiness note written: ${docPath}`);
console.log(
  `${output.totals.records} themes; ${output.totals.localPdfSourcesWaitingForUrl} local source URL(s) pending, ` +
    `${output.totals.dartSourcesWaitingForExtraction} DART source(s) pending extraction.`
);

function nextActionFor({ localSources, dartSources, readyLocalSources, readyDartSources, blockers }) {
  if (readyLocalSources.length > 0 || readyDartSources.length > 0) {
    return "review ready sources and draft atomic candidate claims without runtime promotion";
  }
  if (blockers.includes("local_pdf_document_url_missing") && localSources.length > 0) {
    return "wait for user-supplied document-level URLs";
  }
  if (blockers.includes("dart_filing_text_not_extracted") && dartSources.length > 0) {
    return "run Samsung DART filing extraction with DART_API_KEY and text output enabled";
  }
  return "collect official source material";
}

function renderDoc(queue) {
  const allQueueInputsReady =
    queue.totals.localPdfSourcesWaitingForUrl === 0 && queue.totals.dartSourcesWaitingForExtraction === 0;
  const purpose = allQueueInputsReady
    ? "This note prepares the Samsung second seed layer after document-level URLs and DART filing text extraction have been attached to the active narrative queue. It keeps these materials out of runtime answers until reviewer-authored atomic claims, evidence locators, and source labels are promoted."
    : "This note prepares the Samsung second seed layer while missing document-level URLs or DART filing text are still being collected. It prevents local extracted PDFs and viewer-only filings from becoming runtime evidence too early.";
  const lines = [
    "# Samsung URL And Narrative Claim Readiness",
    "",
    `Generated: ${queue.generatedAt}`,
    "",
    "## Purpose",
    "",
    purpose,
    "",
    "## Current Gate",
    "",
    `- Queue themes: ${queue.totals.records}`,
    `- Local PDF sources waiting for document URL: ${queue.totals.localPdfSourcesWaitingForUrl}`,
    `- DART sources waiting for text extraction: ${queue.totals.dartSourcesWaitingForExtraction}`,
    `- URL intake entries still pending: ${queue.totals.urlIntakePendingUserUrls}`,
    `- Ready themes: ${queue.totals.readyForHumanClaimReview}`,
    `- Partially ready themes: ${queue.totals.partiallyReadyForHumanClaimReview}`,
    "",
    "## Theme Queue",
    "",
    "| Company | Theme | State | Blockers | Next action |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const record of queue.records) {
    lines.push(
      `| ${record.koreanName} | \`${record.id}\` | \`${record.queueState}\` | ${record.blockers.join(", ") || "none"} | ${record.nextAction} |`
    );
  }

  lines.push(
    "",
    "## Product Input State",
    "",
    queue.totals.localPdfSourcesWaitingForUrl > 0
      ? "For local PDF sources in the active narrative queue, fill `publicDocumentUrl` in `raw/manifests/samsung.document-url-intake.json` with the exact document-level public URL. Do not use a broad IR index page when a file-level URL exists."
      : "All active narrative-queue local PDF sources now have document-level public URLs.",
    "",
    queue.totals.dartSourcesWaitingForExtraction > 0
      ? "For Samsung Life and Samsung Fire, DART viewer URLs are already present. The next technical step is DART document extraction, not manual URL collection."
      : "Samsung Life and Samsung Fire DART text extraction is complete for the queued filings.",
    "",
    queue.totals.urlIntakePendingUserUrls > 0
      ? "A non-blocking URL-intake item remains pending. Keep it excluded from runtime promotion until an exact document-level URL is confirmed."
      : "No URL-intake items remain pending.",
    "",
    "## Promotion Boundary",
    "",
    "This queue is not runtime knowledge. A narrative claim can be promoted only after the source has a public document URL, extraction hash, evidence locator, period/reporting basis, and forward-looking label when needed.",
    "",
    "## Source References",
    "",
    "- `raw/manifests/samsung.document-url-intake.json`",
    "- `raw/manifests/samsung.narrative-claim-queue.json`",
    "- `raw/manifests/samsung.claim-candidate-plan.json`",
    "- `raw/manifests/samsung.dart-filing-extraction-report.json`"
  );
  return `${lines.join("\n")}\n`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}
