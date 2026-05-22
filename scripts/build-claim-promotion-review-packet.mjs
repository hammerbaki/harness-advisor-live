import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));

const groupIds = ["samsung", "sk", "hyundai-motor", "lg", "hanwha"];
const policyPath = "configs/first-slice-selection-policy.json";
const outputPath =
  process.env.CLAIM_REVIEW_PACKET_OUT ?? "raw/manifests/claim-promotion-review-packet.json";
const docPath = process.env.CLAIM_REVIEW_PACKET_DOC ?? "docs/82_claim_promotion_review_packet.md";
const priorityLimitPerCompany = Number(process.env.CLAIM_REVIEW_PRIORITY_PER_COMPANY ?? 1);
const alternateLimitPerCompany = Number(process.env.CLAIM_REVIEW_ALTERNATES_PER_COMPANY ?? 2);

const policy = await readJson(policyPath);
const firstSliceByGroup = new Map(
  Object.entries(policy.firstSliceCompanies ?? {}).map(([groupId, companies]) => [
    groupId,
    new Map(companies.map((company) => [company.companyId, company]))
  ])
);

const extractionByGroup = new Map();
const localSourcesByGroup = new Map();
for (const groupId of groupIds) {
  extractionByGroup.set(groupId, await loadExtractionMaps(groupId));
  localSourcesByGroup.set(groupId, await loadLocalSources(groupId));
}

const groups = [];
for (const groupId of groupIds) {
  const queuePath = `raw/manifests/${groupId}.narrative-claim-queue.json`;
  const queue = await readJsonIfExists(queuePath, null);
  const firstSlice = firstSliceByGroup.get(groupId) ?? new Map();
  if (!queue) {
    groups.push({
      groupId,
      queuePath,
      firstSliceCompanies: [...firstSlice.values()],
      candidates: [],
      priorityCandidates: [],
      alternateCandidates: [],
      missingFirstSliceCompanies: [...firstSlice.values()],
      blockedSummary: [],
      totals: emptyTotals()
    });
    continue;
  }

  const candidates = [];
  const blockedSummary = [];
  for (const record of queue.records ?? []) {
    if (!firstSlice.has(record.companyId)) continue;
    const normalized = normalizeQueueRecord({ groupId, record });
    candidates.push(...normalized.candidates);
    blockedSummary.push(...normalized.blocked);
  }

  const candidateCompanyIds = new Set(candidates.map((candidate) => candidate.companyId));
  for (const company of firstSlice.values()) {
    if (candidateCompanyIds.has(company.companyId)) continue;
    const localFallback = buildLocalSourceFallbackCandidates({ groupId, company });
    candidates.push(...localFallback.candidates);
    blockedSummary.push(...localFallback.blocked);
  }

  const selectedByCompany = selectCandidatesByCompany(candidates, firstSlice);
  const priorityCandidates = selectedByCompany.flatMap((entry) => entry.priority);
  const alternateCandidates = selectedByCompany.flatMap((entry) => entry.alternates);
  const companiesWithPriority = new Set(priorityCandidates.map((candidate) => candidate.companyId));
  const missingFirstSliceCompanies = [...firstSlice.values()].filter(
    (company) => !companiesWithPriority.has(company.companyId)
  );

  groups.push({
    groupId,
    queuePath,
    firstSliceCompanies: [...firstSlice.values()],
    candidates: candidates.sort(sortCandidate),
    priorityCandidates,
    alternateCandidates,
    missingFirstSliceCompanies,
    blockedSummary: summarizeBlocked(blockedSummary),
    totals: {
      queueRecords: queue.records?.length ?? 0,
      firstSliceCompanies: firstSlice.size,
      candidates: candidates.length,
      priorityCandidates: priorityCandidates.length,
      alternateCandidates: alternateCandidates.length,
      missingFirstSliceCompanies: missingFirstSliceCompanies.length,
      blockedItems: blockedSummary.length,
      byCompanyId: countBy(candidates, (candidate) => candidate.companyId),
      byDocumentType: countBy(candidates, (candidate) => candidate.documentType ?? "unknown"),
      byReviewState: countBy(candidates, (candidate) => candidate.reviewState)
    }
  });
}

const allPriority = groups.flatMap((group) => group.priorityCandidates);
const allAlternates = groups.flatMap((group) => group.alternateCandidates);
const allCandidates = groups.flatMap((group) => group.candidates);
const output = {
  schemaVersion: "claim-promotion-review-packet.v0.1",
  generatedAt: new Date().toISOString(),
  purpose:
    "Human-review packet for promoting narrative source rows into atomic source-backed claims. This artifact does not modify runtime claim manifests.",
  policy: {
    firstSliceSelectionPolicy: policyPath,
    priorityLimitPerCompany,
    alternateLimitPerCompany,
    promotionBoundary:
      "A source can become runtime evidence only after a reviewer writes one atomic claim, verifies the evidence locator, labels forward-looking/staleness state, and keeps companyId/companyScope intact.",
    nonGoals: [
      "Do not auto-generate runtime claims from raw extracted text.",
      "Do not treat LLM Wiki pages as source of truth.",
      "Do not expose this packet in the customer UI."
    ]
  },
  totals: {
    groups: groups.length,
    firstSliceCompanies: groups.reduce((sum, group) => sum + group.firstSliceCompanies.length, 0),
    candidates: allCandidates.length,
    priorityCandidates: allPriority.length,
    alternateCandidates: allAlternates.length,
    missingFirstSliceCompanies: groups.reduce((sum, group) => sum + group.missingFirstSliceCompanies.length, 0),
    blockedItems: groups.reduce((sum, group) => sum + group.blockedSummary.reduce((inner, row) => inner + row.count, 0), 0),
    byGroup: Object.fromEntries(groups.map((group) => [group.groupId, group.totals])),
    byDocumentType: countBy(allCandidates, (candidate) => candidate.documentType ?? "unknown"),
    byClaimFamily: countBy(
      allPriority.flatMap((candidate) => candidate.suggestedClaimFamilies),
      (family) => family
    )
  },
  reviewerWorkflow: [
    "Start from priorityCandidates. One candidate per first-slice company is enough for the first promotion pass.",
    "For each candidate, open markdownPath or the official URL, then draft one atomic factual claim only.",
    "Fill reviewerDecision, approvedClaimText, evidenceLocator, claimType, forwardLooking, stalenessPolicy, and reviewerNote.",
    "Only after review, move approved rows into a group-specific narrative seed config and run the existing promote script.",
    "Keep rejected or ambiguous rows in this packet; do not delete source records."
  ],
  groups
};

await writeJson(outputPath, output);
await writeFile(join(rootDir, docPath), renderDoc(output), "utf8");

console.log(`Claim promotion review packet written: ${outputPath}`);
console.log(`Readable review packet written: ${docPath}`);
console.log(`${output.totals.priorityCandidates} priority candidate(s), ${output.totals.alternateCandidates} alternate candidate(s).`);

function normalizeQueueRecord({ groupId, record }) {
  const candidates = [];
  const blocked = [];
  const base = {
    groupId,
    companyId: record.companyId,
    companyScope: record.companyScope ?? "listed_company",
    koreanName: record.koreanName,
    parentQueueId: record.id,
    answerUse: Array.isArray(record.answerUse) ? record.answerUse : record.answerUse ? [record.answerUse] : [],
    suggestedWikiTarget: record.suggestedWikiTarget ?? `wiki/groups/${groupId}/companies/${record.companyId}.md`,
    suggestedClaimFamilies:
      record.candidateClaimFamilies ?? record.suggestedClaimTypes ?? ["source_review"]
  };

  const readySources = [
    ...normalizeSourceList(record.readySources, "readySources"),
    ...normalizeSourceList(record.localSources, "localSources"),
    ...normalizeSourceList(record.dartSources, "dartSources")
  ];

  if (readySources.length > 0) {
    for (const source of readySources) {
      const enriched = enrichSourceFromExtraction(groupId, source);
      const ready = sourceIsReviewReady(source, enriched);
      const candidate = buildCandidate({
        ...base,
        source: { ...source, ...enriched },
        reviewState: ready ? "priority_review_ready" : "needs_metadata_before_review"
      });
      if (ready) candidates.push(candidate);
      else blocked.push(blockedItem(base, source, candidate.reviewState));
    }
    for (const source of normalizeSourceList(record.blockedSources, "blockedSources")) {
      blocked.push(blockedItem(base, source, source.blockReason ?? "blocked_source"));
    }
    return { candidates, blocked };
  }

  if (record.queueState === "ready_for_human_claim_review" || record.queueState === "partially_ready_for_human_claim_review") {
    const source = {
      manifestId: record.sourceManifestId,
      title: record.sourceTitle,
      documentType: record.documentType ?? record.sourceCategory,
      period: record.period,
      sourcePageUrl: record.sourcePageUrl,
      publicDocumentUrl: record.publicDocumentUrl,
      dartReceiptUrl: record.dartReceiptUrl,
      documentUrlStatus: record.documentUrlStatus,
      extractionStatus: record.extractionStatus,
      textCharCount: record.textCharCount,
      textSha256: record.textSha256,
      lowTextWarning: record.lowTextWarning,
      sourceUse: record.selectionReason,
      promotionReadiness: "ready_for_evidence_locator_review"
    };
    candidates.push(
      buildCandidate({
        ...base,
        source: { ...source, ...enrichSourceFromExtraction(groupId, source) },
        reviewState: "priority_review_ready"
      })
    );
  } else {
    blocked.push(blockedItem(base, record, record.blockedReason ?? record.queueState ?? "blocked_before_claim_review"));
  }
  return { candidates, blocked };
}

function buildLocalSourceFallbackCandidates({ groupId, company }) {
  const candidates = [];
  const blocked = [];
  const sources = (localSourcesByGroup.get(groupId) ?? []).filter(
    (source) =>
      source.companyId === company.companyId &&
      source.sourceRole === "official_issuer" &&
      source.processingDecision === "extract-to-markdown-and-wiki-candidate"
  );
  for (const source of sources) {
    const enriched = enrichSourceFromExtraction(groupId, {
      manifestId: source.id,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      publicDocumentUrl: source.publicDocumentUrl,
      sourcePageUrl: source.sourcePageUrl,
      documentUrlStatus: source.documentUrlStatus,
      promotionReadiness: source.documentUrlStatus
    });
    const merged = {
      manifestId: source.id,
      title: source.title,
      documentType: source.documentType,
      period: source.period,
      publicDocumentUrl: source.publicDocumentUrl,
      sourcePageUrl: source.sourcePageUrl,
      documentUrlStatus: source.documentUrlStatus,
      sourceUse: source.selectionReason,
      promotionReadiness: source.documentUrlStatus,
      ...enriched
    };
    if (sourceIsReviewReady(merged, enriched)) {
      candidates.push(
        buildCandidate({
          groupId,
          companyId: company.companyId,
          companyScope: "listed_company",
          koreanName: company.koreanName,
          parentQueueId: "local-source-fallback",
          answerUse: ["first-slice source-backed narrative fallback"],
          suggestedWikiTarget: `wiki/groups/${groupId}/companies/${company.companyId}.md`,
          suggestedClaimFamilies: fallbackClaimFamilies(merged.documentType),
          source: merged,
          reviewState: "local_source_fallback_review_ready"
        })
      );
    } else {
      blocked.push(
        blockedItem(
          {
            groupId,
            companyId: company.companyId,
            koreanName: company.koreanName,
            parentQueueId: "local-source-fallback"
          },
          { ...source, manifestId: source.id },
          "local_source_fallback_not_review_ready"
        )
      );
    }
  }
  return { candidates, blocked };
}

function normalizeSourceList(value, sourceContainer) {
  if (!Array.isArray(value)) return [];
  return value.map((source) => ({
    ...source,
    sourceContainer,
    manifestId: source.manifestId ?? source.sourceManifestId,
    title: source.title ?? source.sourceTitle,
    documentType: source.documentType ?? source.sourceCategory,
    publicDocumentUrl: source.publicDocumentUrl ?? source.downloadUrl ?? null,
    sourcePageUrl: source.sourcePageUrl ?? source.providerUrl ?? null,
    promotionReadiness: source.promotionReadiness ?? source.urlStatus ?? null
  }));
}

function enrichSourceFromExtraction(groupId, source) {
  const maps = extractionByGroup.get(groupId);
  const manifestId = source.manifestId ?? source.sourceManifestId;
  const extraction = maps?.byManifestId.get(manifestId);
  if (!extraction) return {};
  return {
    title: source.title ?? extraction.title,
    documentType: source.documentType ?? extraction.documentType ?? extraction.sourceCategory,
    period: source.period ?? extraction.period ?? extraction.documentDate ?? extraction.folderYear ?? null,
    publicDocumentUrl: source.publicDocumentUrl ?? extraction.publicDocumentUrl ?? extraction.sourceUrl ?? null,
    sourcePageUrl: source.sourcePageUrl ?? extraction.sourcePageUrl ?? null,
    dartReceiptUrl: source.dartReceiptUrl ?? extraction.dartReceiptUrl ?? null,
    documentUrlStatus: source.documentUrlStatus ?? extraction.documentUrlStatus ?? null,
    extractionStatus: source.extractionStatus ?? extraction.extractionStatus ?? null,
    textCharCount: source.textCharCount ?? extraction.textCharCount ?? 0,
    textSha256: source.textSha256 ?? extraction.textSha256 ?? null,
    markdownPath: source.markdownPath ?? extraction.markdownPath ?? null,
    lowTextWarning: source.lowTextWarning ?? extraction.lowTextWarning ?? false
  };
}

function sourceIsReviewReady(source, enriched) {
  const merged = { ...source, ...enriched };
  if (merged.lowTextWarning) return false;
  if (merged.extractionStatus && merged.extractionStatus !== "ok") return false;
  if (!merged.markdownPath && !merged.textSha256 && !merged.publicDocumentUrl && !merged.sourcePageUrl && !merged.dartReceiptUrl) return false;
  const readiness = String(merged.promotionReadiness ?? merged.urlStatus ?? "");
  if (/blocked|pending|missing/iu.test(readiness)) return false;
  return true;
}

function buildCandidate({ groupId, companyId, companyScope, koreanName, parentQueueId, answerUse, suggestedWikiTarget, suggestedClaimFamilies, source, reviewState }) {
  const documentType = normalizeDocumentType(source.documentType);
  const candidateId = [
    "cprp",
    groupId,
    companyId,
    source.manifestId ?? parentQueueId
  ]
    .join("-")
    .replace(/[^a-z0-9가-힣_-]+/giu, "-")
    .replace(/-+/gu, "-")
    .toLowerCase();
  const score = scoreCandidate({ documentType, period: source.period, textCharCount: source.textCharCount, source });
  return {
    candidateId,
    groupId,
    companyId,
    companyScope,
    koreanName,
    parentQueueId,
    sourceManifestId: source.manifestId ?? null,
    sourceTitle: source.title ?? "(untitled source)",
    documentType,
    period: source.period ?? null,
    sourcePageUrl: source.sourcePageUrl ?? null,
    publicDocumentUrl: source.publicDocumentUrl ?? null,
    dartReceiptUrl: source.dartReceiptUrl ?? null,
    documentUrlStatus: source.documentUrlStatus ?? source.urlStatus ?? null,
    markdownPath: source.markdownPath ?? null,
    textSha256: source.textSha256 ?? null,
    textCharCount: source.textCharCount ?? 0,
    reviewState,
    score,
    answerUse,
    suggestedWikiTarget,
    suggestedClaimFamilies,
    suggestedClaimDraftingTasks: claimDraftingTasks(documentType, suggestedClaimFamilies),
    reviewerFields: {
      reviewerDecision: "todo_approve_reject_or_rewrite",
      approvedClaimText: "",
      evidenceLocator: "",
      claimType: "",
      forwardLooking: "todo_true_false",
      stalenessPolicy: "todo_current_until_newer_period_or_disclosure",
      reviewerNote: ""
    },
    promotionBoundary:
      "Review packet only. Do not copy into runtime source-backed claims until reviewerFields are complete and the group promotion validator passes."
  };
}

function selectCandidatesByCompany(candidates, firstSlice) {
  const out = [];
  for (const company of firstSlice.values()) {
    const companyCandidates = candidates
      .filter((candidate) => candidate.companyId === company.companyId)
      .sort(sortCandidate);
    const priority = takeDiverse(companyCandidates, priorityLimitPerCompany);
    const priorityIds = new Set(priority.map((candidate) => candidate.candidateId));
    const alternates = takeDiverse(
      companyCandidates.filter((candidate) => !priorityIds.has(candidate.candidateId)),
      alternateLimitPerCompany
    );
    out.push({ company, priority, alternates });
  }
  return out;
}

function takeDiverse(candidates, limit) {
  const selected = [];
  const buckets = new Set();
  for (const candidate of candidates) {
    const bucket = documentBucket(candidate.documentType);
    if (!buckets.has(bucket) || selected.length + (new Set(candidates.map((c) => documentBucket(c.documentType))).size - buckets.size) <= limit) {
      selected.push(candidate);
      buckets.add(bucket);
    }
    if (selected.length >= limit) break;
  }
  return selected;
}

function sortCandidate(a, b) {
  return b.score - a.score || String(b.period ?? "").localeCompare(String(a.period ?? ""), "ko-KR") || a.sourceTitle.localeCompare(b.sourceTitle, "ko-KR");
}

function scoreCandidate({ documentType, period, textCharCount, source }) {
  const baseByType = {
    earnings_presentation: 120,
    earnings_material: 120,
    earnings_release: 120,
    review_report: 110,
    value_up_plan: 108,
    value_up: 108,
    investor_presentation: 104,
    ir_material: 100,
    annual_report: 96,
    business_report: 96,
    periodic_report: 94,
    quarterly_report: 90,
    semiannual_report: 88,
    audit_report: 80,
    governance: 74,
    agm: 70
  };
  const base = baseByType[documentType] ?? 60;
  const recency = periodScore(period);
  const textScore = Math.min(10, Math.floor(Number(textCharCount ?? 0) / 50000));
  const urlScore = source.publicDocumentUrl || source.dartReceiptUrl ? 8 : source.sourcePageUrl ? 4 : 0;
  return base + recency + textScore + urlScore;
}

function periodScore(period) {
  const text = String(period ?? "");
  const year = Number(text.match(/20\d{2}/u)?.[0] ?? 0);
  const quarter = Number(text.match(/Q([1-4])/iu)?.[1] ?? 0);
  if (!year) return 0;
  return Math.max(0, year - 2020) * 5 + quarter;
}

function normalizeDocumentType(type) {
  const text = String(type ?? "unknown").toLowerCase();
  if (/earnings|실적/u.test(text)) return "earnings_presentation";
  if (/value|밸류|기업가치/u.test(text)) return "value_up_plan";
  if (/investor|presentation|ir_material/u.test(text)) return "investor_presentation";
  if (/business_report|annual|사업보고서/u.test(text)) return "business_report";
  if (/quarter|분기/u.test(text)) return "quarterly_report";
  if (/semi|반기/u.test(text)) return "semiannual_report";
  if (/audit|검토|감사/u.test(text)) return "audit_report";
  if (/governance|지배/u.test(text)) return "governance";
  return text || "unknown";
}

function documentBucket(documentType) {
  if (/earnings|review|quarter|semi/u.test(documentType)) return "earnings";
  if (/value|investor|governance|agm/u.test(documentType)) return "capital_policy";
  if (/annual|business|periodic|audit/u.test(documentType)) return "filing";
  return "other";
}

function claimDraftingTasks(documentType, families) {
  const tasks = [];
  if (/earnings|quarter|review|semi/u.test(documentType)) {
    tasks.push("기간이 명시된 실적 수치, 사업부 요인, 마진/현금흐름 관련 사실을 한 문장 claim으로 분리");
  }
  if (/annual|business|periodic|audit/u.test(documentType)) {
    tasks.push("DART/사업보고서 본문에서 재무제표 계정명, 사업부 구조, 주요 위험요인을 근거 locator와 함께 확인");
  }
  if (/value|investor|governance|agm/u.test(documentType)) {
    tasks.push("주주환원, 자본배분, 포트폴리오 정책은 계획/목표/시행 여부를 구분하고 forward-looking label 부여");
  }
  if (families.some((family) => /risk|리스크/iu.test(family))) {
    tasks.push("리스크 문구는 투자 의견으로 바꾸지 말고 공식 문서가 말한 조건·불확실성만 원자화");
  }
  if (tasks.length === 0) tasks.push("공식 문서에서 사용자 답변에 반복적으로 쓰일 사실 claim 1개를 원자화");
  return tasks;
}

function fallbackClaimFamilies(documentType) {
  if (/earnings|quarter|review|semi/u.test(documentType)) {
    return ["financial_update", "segment_performance", "management_outlook"];
  }
  if (/annual|business|periodic|audit/u.test(documentType)) {
    return ["financial_context", "business_segment", "risk_factor"];
  }
  if (/value|investor|governance|agm/u.test(documentType)) {
    return ["capital_allocation", "shareholder_return", "governance"];
  }
  return ["source_review"];
}

function blockedItem(base, source, reason) {
  return {
    groupId: base.groupId,
    companyId: base.companyId,
    koreanName: base.koreanName,
    parentQueueId: base.parentQueueId,
    sourceManifestId: source.manifestId ?? source.sourceManifestId ?? source.id ?? null,
    sourceTitle: source.title ?? source.sourceTitle ?? "(untitled source)",
    documentType: source.documentType ?? source.sourceCategory ?? null,
    reason
  };
}

function summarizeBlocked(items) {
  const keyed = new Map();
  for (const item of items) {
    const key = `${item.companyId}::${item.reason}`;
    const existing = keyed.get(key) ?? {
      groupId: item.groupId,
      companyId: item.companyId,
      koreanName: item.koreanName,
      reason: item.reason,
      count: 0,
      examples: []
    };
    existing.count += 1;
    if (existing.examples.length < 3) existing.examples.push(item.sourceTitle);
    keyed.set(key, existing);
  }
  return [...keyed.values()].sort((a, b) => b.count - a.count || a.companyId.localeCompare(b.companyId, "ko-KR"));
}

async function loadExtractionMaps(groupId) {
  const paths = [
    `raw/manifests/${groupId}.extraction-report.json`,
    `raw/manifests/${groupId}.dart-filing-extraction-report.json`
  ];
  const byManifestId = new Map();
  for (const path of paths) {
    if (!existsSync(join(rootDir, path))) continue;
    const json = await readJson(path);
    for (const row of json.results ?? json.records ?? json.entries ?? []) {
      if (row.manifestId) byManifestId.set(row.manifestId, { ...row, extractionReportPath: path });
    }
  }
  return { byManifestId };
}

async function loadLocalSources(groupId) {
  const path = `raw/manifests/${groupId}.local-sources.json`;
  const json = await readJsonIfExists(path, { entries: [] });
  return json.entries ?? [];
}

function renderDoc(packet) {
  const lines = [
    "# Claim Promotion Review Packet",
    "",
    `Generated: ${packet.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This packet is the human-review gate between official source ingestion and runtime source-backed claims. It makes the next promotion step reproducible without allowing raw PDFs or LLM-generated summaries to enter the product automatically.",
    "",
    "## Current Scope",
    "",
    `- Groups: ${packet.totals.groups}`,
    `- First-slice companies: ${packet.totals.firstSliceCompanies}`,
    `- Priority candidates: ${packet.totals.priorityCandidates}`,
    `- Alternate candidates: ${packet.totals.alternateCandidates}`,
    `- Missing first-slice priority candidates: ${packet.totals.missingFirstSliceCompanies}`,
    `- Blocked/non-ready items summarized: ${packet.totals.blockedItems}`,
    "",
    "## Reviewer Workflow",
    "",
    ...packet.reviewerWorkflow.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Priority Candidates",
    "",
    table(
      ["Group", "Company", "Source", "Type", "Period", "Review task", "Source"],
      packet.groups.flatMap((group) =>
        group.priorityCandidates.map((candidate) => [
          `\`${group.groupId}\``,
          `${candidate.koreanName}<br><code>${candidate.companyId}</code>`,
          `${candidate.sourceTitle}<br><code>${candidate.sourceManifestId ?? ""}</code>`,
          `\`${candidate.documentType}\``,
          candidate.period ?? "",
          candidate.suggestedClaimDraftingTasks[0] ?? "",
          sourceLinkLabel(candidate)
        ])
      )
    ),
    "",
    "## Group Status",
    "",
    table(
      ["Group", "Candidates", "Priority", "Alternates", "Missing priority", "Blocked summary"],
      packet.groups.map((group) => [
        `\`${group.groupId}\``,
        String(group.totals.candidates),
        String(group.totals.priorityCandidates),
        String(group.totals.alternateCandidates),
        group.missingFirstSliceCompanies.map((company) => company.koreanName).join(", ") || "none",
        group.blockedSummary.map((row) => `${row.koreanName}: ${row.reason} (${row.count})`).join("<br>") || "none"
      ])
    ),
    "",
    "## Missing First-Slice Priority Candidates",
    ""
  ];

  const missing = packet.groups.flatMap((group) =>
    group.missingFirstSliceCompanies.map((company) => ({
      groupId: group.groupId,
      ...company
    }))
  );
  if (missing.length === 0) {
    lines.push("All first-slice companies have at least one priority review candidate.", "");
  } else {
    lines.push(
      table(
        ["Group", "Company", "Next action"],
        missing.map((company) => [
          `\`${company.groupId}\``,
          `${company.koreanName}<br><code>${company.companyId}</code>`,
          "Regenerate narrative queue or add/extract an official source row before claim promotion."
        ])
      ),
      ""
    );
  }

  lines.push(
    "## Promotion Boundary",
    "",
    "This document is not customer-facing runtime knowledge. The reviewer must turn each selected source into atomic claim text and evidence locators before a group-specific promotion script can add it to `raw/manifests/*.source-backed-claims.json`.",
    "",
    "## Machine Artifact",
    "",
    `- \`${outputPath}\``
  );

  return `${lines.join("\n")}\n`;
}

function sourceLinkLabel(candidate) {
  if (candidate.publicDocumentUrl) return "document URL";
  if (candidate.dartReceiptUrl) return "DART receipt";
  if (candidate.sourcePageUrl) return "source page";
  if (candidate.markdownPath) return "extracted markdown";
  return "metadata only";
}

function table(headers, rows) {
  if (rows.length === 0) return "No rows.";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escapeTable).join(" | ")} |`)
  ].join("\n");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/gu, "/");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items ?? []) {
    const key = keyFn(item) ?? "unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function emptyTotals() {
  return {
    queueRecords: 0,
    firstSliceCompanies: 0,
    candidates: 0,
    priorityCandidates: 0,
    alternateCandidates: 0,
    missingFirstSliceCompanies: 0,
    blockedItems: 0,
    byCompanyId: {},
    byDocumentType: {},
    byReviewState: {}
  };
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function readJsonIfExists(relativePath, fallback) {
  if (!existsSync(join(rootDir, relativePath))) return fallback;
  return readJson(relativePath);
}

async function writeJson(relativePath, data) {
  const fullPath = join(rootDir, relativePath);
  await mkdir(dirname(fullPath), { recursive: true });
  await writeFile(fullPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}
