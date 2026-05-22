import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packetPath =
  process.env.CLAIM_REVIEW_PACKET_IN ?? "raw/manifests/claim-promotion-review-packet.json";
const outputPath =
  process.env.CLAIM_REVIEW_PROPOSAL_OUT ?? "raw/manifests/claim-review-proposals.json";
const docPath =
  process.env.CLAIM_REVIEW_PROPOSAL_DOC ?? "docs/83_claim_review_proposals_for_approval.md";

const packet = await readJson(packetPath);
const priorityCandidates = packet.groups.flatMap((group) => group.priorityCandidates ?? []);
const candidateById = new Map(priorityCandidates.map((candidate) => [candidate.candidateId, candidate]));
const proposalById = new Map(buildProposalSpecs().map((proposal) => [proposal.candidateId, proposal]));

const unknownCandidateIds = [...proposalById.keys()].filter((candidateId) => !candidateById.has(candidateId));
const missingProposalCandidates = priorityCandidates.filter(
  (candidate) => !proposalById.has(candidate.candidateId)
);
if (unknownCandidateIds.length > 0) {
  throw new Error(`Proposal references unknown candidate(s): ${unknownCandidateIds.join(", ")}`);
}
if (missingProposalCandidates.length > 0) {
  throw new Error(
    `Missing proposal(s) for candidate(s): ${missingProposalCandidates
      .map((candidate) => candidate.candidateId)
      .join(", ")}`
  );
}

const records = [];
for (const candidate of priorityCandidates) {
  const spec = proposalById.get(candidate.candidateId);
  const evidenceMarkdownPath = spec.evidenceMarkdownPath ?? candidate.markdownPath;
  const reviewSource = {
    sourceManifestId: spec.sourceManifestId ?? candidate.sourceManifestId,
    sourceTitle: spec.sourceTitle ?? candidate.sourceTitle,
    publicDocumentUrl: spec.publicDocumentUrl ?? candidate.publicDocumentUrl,
    sourcePageUrl: spec.sourcePageUrl ?? candidate.sourcePageUrl
  };
  const evidenceMatches = await locateEvidence(evidenceMarkdownPath, spec.evidenceNeedles);
  const evidenceStatus = evidenceMatches.every((match) => match.found) ? "located" : "missing_locator";
  const proposedDecision =
    spec.proposedDecision.startsWith("approve") && evidenceStatus !== "located"
      ? "hold_needs_manual_locator"
      : spec.proposedDecision;

  records.push({
    candidateId: candidate.candidateId,
    groupId: candidate.groupId,
    companyId: candidate.companyId,
    koreanName: candidate.koreanName,
    sourceManifestId: candidate.sourceManifestId,
    sourceTitle: candidate.sourceTitle,
    documentType: candidate.documentType,
    period: candidate.period,
    markdownPath: candidate.markdownPath,
    publicDocumentUrl: candidate.publicDocumentUrl,
    sourcePageUrl: candidate.sourcePageUrl,
    reviewEvidenceMarkdownPath: evidenceMarkdownPath,
    reviewSourceManifestId: reviewSource.sourceManifestId,
    reviewSourceTitle: reviewSource.sourceTitle,
    reviewPublicDocumentUrl: reviewSource.publicDocumentUrl,
    reviewSourcePageUrl: reviewSource.sourcePageUrl,
    proposedDecision,
    confidence: spec.confidence,
    proposedClaimText: spec.proposedClaimText,
    claimType: spec.claimType,
    forwardLooking: spec.forwardLooking,
    stalenessPolicy: spec.stalenessPolicy,
    runtimeUsePolicy: spec.runtimeUsePolicy,
    reviewerRationale: spec.reviewerRationale,
    reviewerActionRequired: spec.reviewerActionRequired,
    evidenceStatus,
    evidenceMatches,
    promotionBoundary:
      "Approval proposal only. Do not add this row to runtime source-backed claims until the user approves and group-specific promote validators pass."
  });
}

const output = {
  schemaVersion: "claim-review-proposals.v0.2",
  generatedAt: new Date().toISOString(),
  inputPacket: packetPath,
  purpose:
    "Assistant first-pass review proposal for the 25-company claim-promotion packet. This artifact asks for user approval and does not modify runtime source-backed claims.",
  policy: {
    approvalBoundary:
      "Only rows with proposedDecision approve_for_seed_review and user approval may be converted into group-specific narrative seed configs.",
    holdBoundary:
      "Held rows remain useful source inventory, but should not become runtime claims until locator, OCR, or source-choice problems are resolved.",
    customerUiBoundary:
      "Do not expose this artifact in the customer UI; it is reviewer and paper-trace evidence."
  },
  totals: {
    records: records.length,
    byDecision: countBy(records, (record) => record.proposedDecision),
    byGroup: Object.fromEntries(
      packet.groups.map((group) => {
        const groupRecords = records.filter((record) => record.groupId === group.groupId);
        return [
          group.groupId,
          {
            records: groupRecords.length,
            byDecision: countBy(groupRecords, (record) => record.proposedDecision),
            missingEvidenceLocators: groupRecords.filter((record) => record.evidenceStatus !== "located").length
          }
        ];
      })
    ),
    missingEvidenceLocators: records.filter((record) => record.evidenceStatus !== "located").length
  },
  records
};

await writeJson(outputPath, output);
await writeFile(join(rootDir, docPath), renderDoc(output), "utf8");

console.log(`Claim review proposals written: ${outputPath}`);
console.log(`Readable approval document written: ${docPath}`);
console.log(`${output.totals.records} proposal(s), decisions: ${JSON.stringify(output.totals.byDecision)}`);

async function locateEvidence(markdownPath, evidenceNeedles) {
  if (!markdownPath) {
    return evidenceNeedles.map((needle) => ({
      needle,
      found: false,
      reason: "candidate_has_no_markdown_path"
    }));
  }
  const absolutePath = join(rootDir, markdownPath);
  const lines = (await readFile(absolutePath, "utf8")).split(/\r?\n/u);
  return evidenceNeedles.map((needle) => {
    const normalizedNeedle = normalizeText(needle);
    const lineIndex = lines.findIndex((line) => normalizeText(line).includes(normalizedNeedle));
    if (lineIndex < 0) {
      return {
        needle,
        found: false,
        reason: "needle_not_found_in_markdown",
        markdownPath
      };
    }
    return {
      needle,
      found: true,
      markdownPath,
      lineNumber: lineIndex + 1,
      pageHeading: nearestPageHeading(lines, lineIndex),
      linePreview: lines[lineIndex].trim().slice(0, 360)
    };
  });
}

function nearestPageHeading(lines, lineIndex) {
  for (let i = lineIndex; i >= 0; i -= 1) {
    if (/^## Page /u.test(lines[i])) return lines[i].replace(/^## /u, "");
  }
  return null;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/gu, "")
    .replace(/[’‘`]/gu, "'")
    .toLowerCase();
}

async function readJson(path) {
  return JSON.parse(await readFile(join(rootDir, path), "utf8"));
}

async function writeJson(path, value) {
  const absolutePath = join(rootDir, path);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function countBy(records, keyFn) {
  return records.reduce((acc, record) => {
    const key = keyFn(record) ?? "unknown";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

function renderDoc(output) {
  const lines = [
    "# Claim Review Proposals for Approval",
    "",
    `Generated: ${output.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This document is Codex's first-pass reviewer decision for the 25-company priority claim packet. It is an approval request, not runtime knowledge. Rows marked `approve_for_seed_review` can be promoted only after the user approves them and the group-specific promotion validators pass.",
    "",
    "## Summary",
    "",
    `- Total proposals: ${output.totals.records}`,
    `- Approve: ${output.totals.byDecision.approve_for_seed_review ?? 0}`,
    `- Hold: ${output.totals.byDecision.hold_needs_manual_locator ?? 0}`,
    `- Missing evidence locators: ${output.totals.missingEvidenceLocators}`,
    "",
    "## Approval Boundary",
    "",
    "- This artifact does not modify `raw/manifests/*.source-backed-claims.json`.",
    "- Approval means the row may be converted into a group-specific narrative seed config in the next step.",
    "- Held rows stay in the source ledger but must not be exposed in customer answers.",
    "- Forward-looking rows must keep the forward-looking/staleness label after promotion.",
    ""
  ];

  for (const groupId of ["samsung", "sk", "hyundai-motor", "lg", "hanwha"]) {
    const records = output.records.filter((record) => record.groupId === groupId);
    if (records.length === 0) continue;
    lines.push(`## ${groupId}`, "");
    lines.push(
      "| Company | Decision | Proposed claim | Evidence locator | Reviewer note |",
      "| --- | --- | --- | --- | --- |"
    );
    for (const record of records) {
      const evidence = record.evidenceMatches
        .map((match) =>
          match.found
            ? `${match.markdownPath}:${match.lineNumber}${match.pageHeading ? ` (${match.pageHeading})` : ""}`
            : `missing: ${match.needle}`
        )
        .join("<br>");
      lines.push(
        `| ${escapeMd(record.koreanName)}<br><code>${record.companyId}</code> | <code>${record.proposedDecision}</code><br>${record.confidence} | ${escapeMd(record.proposedClaimText)} | ${escapeMd(evidence)} | ${escapeMd(record.reviewerRationale)} |`
      );
    }
    lines.push("");
  }

  lines.push("## User Approval Checklist", "");
  lines.push(
    "- Approve all `approve_for_seed_review` rows as written.",
    "- Or identify rows whose wording should be revised before promotion.",
  );
  const heldRecords = output.records.filter((record) => record.proposedDecision !== "approve_for_seed_review");
  if (heldRecords.length > 0) {
    lines.push(
      `- Keep held rows out of runtime claims until their evidence gaps are resolved: ${heldRecords
        .map((record) => `\`${record.companyId}\``)
        .join(", ")}.`
    );
  } else {
    lines.push("- No rows are currently on hold; promotion still requires explicit approval and group-specific validators.");
  }
  lines.push(
    "",
    "## Machine Artifact",
    "",
    "- `raw/manifests/claim-review-proposals.json`",
    ""
  );
  return `${lines.join("\n")}\n`;
}

function escapeMd(value) {
  return String(value ?? "").replace(/\|/gu, "\\|").replace(/\n/gu, "<br>");
}

function buildProposalSpecs() {
  return [
  {
    candidateId: "cprp-samsung-samsung-electronics-samsung-local-629eb49c47b4",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "삼성전자는 2026년 1분기 연결 기준 매출액 133.9조원, 영업이익 57.2조원, 영업이익률 42.8%를 제시했다.",
    evidenceNeedles: ["연결기준 전사 매출 및 손익 세부"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "실적발표 자료의 핵심 연결 손익 수치가 한 줄에 제시되어 있고, 답변 카드와 재무 브리프에 반복 사용하기 좋다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-samsung-samsung-sdi-samsung-local-3fbe76fb3e6d",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "삼성SDI는 2026년 1분기 매출 35,764억원, 영업손실 1,556억원, 당기순이익 561억원을 제시했고, 전년 동기 대비 매출은 12.6% 증가했다.",
    evidenceNeedles: ["매출 31,768 38,587 35,764"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "적자 축소와 흑자전환 항목이 명확해 배터리/ESS 질문의 기본 수치 claim으로 적합하다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-samsung-samsung-ct-samsung-local-d59eae497f33",
    proposedDecision: "approve_for_seed_review",
    confidence: "medium",
    claimType: "financial_metric_regulatory_filing",
    proposedClaimText:
      "삼성물산은 2025년 1~3분기 연결 누적 매출액 29.9조원, 영업이익 2.47조원, 분기순이익 2.35조원을 공시했다.",
    evidenceNeedles: ["I. 매 출 액 27 10,150"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_regulatory_filing_label",
    stalenessPolicy: "current_until_newer_quarterly_or_annual_filing",
    reviewerRationale:
      "검토보고서 기반이라 보수적으로 공시 label을 붙이면 상사/건설/바이오 보유구조 질문에 쓸 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-samsung-samsung-biologics-samsung-local-0c3e655da338",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_pipeline",
    proposedClaimText:
      "삼성바이오로직스는 2026년 1분기 매출 12,571억원, 영업이익 5,808억원을 제시했고, 누적 CMO 수주 금액 214억 달러와 CMO 제품 112건, CDO 제품 169건을 함께 밝혔다.",
    evidenceNeedles: ["1 ~ 4 공장 Full 가동 효과", "CMO 수주 금액"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_contract_update",
    reviewerRationale:
      "단순 매출보다 CDMO 수주 지표가 같이 있어 바이오 계열사 설명력과 투자자용 맥락이 높다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-samsung-samsung-electro-mechanics-samsung-local-d9c2c0fbf645",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "삼성전기는 AI 서버 및 EV 등 응용처 수요 증가에 힘입어 2025년 매출액 11조 3,145억원, 영업이익 9,133억원을 기록했고, 전년 대비 각각 10%, 24% 증가했다고 설명했다.",
    evidenceNeedles: ["AI 서버 및 EV를 필두로"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_regulatory_filing_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_filing",
    reviewerRationale:
      "사업보고서 MD&A 문장이라 AI 서버/전장 수요와 실적 개선을 한 문장에 근거화할 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-sk-sk-hynix-sk-local-d92b4fd12117",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_regulatory_filing",
    proposedClaimText:
      "SK하이닉스는 2025년 3분기 연결 기준 매출 24.45조원, 영업이익 11.38조원, 분기순이익 12.60조원을 공시했고, 9개월 누적 매출은 64.32조원이었다.",
    evidenceNeedles: ["Revenue 4,21,28 W 24,448,929"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_regulatory_filing_label",
    stalenessPolicy: "current_until_newer_quarterly_or_annual_filing",
    reviewerRationale:
      "감사인 검토보고서의 손익계산서 수치라 HBM/메모리 회복 질문의 안전한 기준점으로 쓸 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-sk-sk-innovation-sk-local-e4f0fa5ef4ed",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_portfolio_transition",
    proposedClaimText:
      "SK이노베이션은 2025년 매출 80.30조원, 영업이익 4,481억원, EBITDA 3.69조원을 제시했고, 순차입금은 2024년 말 28.53조원에서 2025년 말 22.51조원으로 감소했다고 밝혔다.",
    evidenceNeedles: ["FY 2025 Revenue 20,418.8", "Net Debt 28,526.6 22,511.0"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "포트폴리오 리밸런싱 논리를 실적과 순차입금 개선으로 분리해 설명할 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-sk-sk-inc-sk-local-5b7e15dc9476",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "holding_company_financial_context",
    proposedClaimText:
      "㈜SK는 FY25 주요 비상장사·자체사업 합산 매출이 전년 대비 20.7% 증가했고, FY25 ROE는 6.4%로 전년 대비 12%p 개선됐으며, 별도 기준 순차입금은 8.6조원으로 전년 대비 18% 감소했다고 제시했다.",
    evidenceNeedles: ["주요 비상장사 ∙ 자체사업 합산 실적"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "지주회사 질문에 필요한 자체사업, ROE, 순차입금 축을 함께 제공하되 투자판단 표현은 피한다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-sk-sk-telecom-sk-local-77570239f18d",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "SK텔레콤은 2025년 연결 매출 17조 992억원, 영업이익 1조 732억원, 순이익 3,751억원을 발표했고, AI 데이터센터 관련 매출은 5,199억원으로 전년 대비 34.9% 성장했다고 밝혔다.",
    evidenceNeedles: ["연결 매출 17 조 992 억 원"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_result",
    reviewerRationale:
      "통신 본업과 AI 데이터센터 성장 근거를 함께 묶되, 사업 성과 claim으로 제한하면 안전하다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-sk-sk-square-sk-local-a8520c7b2b32",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "shareholder_value_forward_looking",
    proposedClaimText:
      "SK스퀘어는 2025년 3분기 기준 NAV 할인율 52.9%, ROE 33.7%, PBR 1.1배를 제시하고, 2028년까지 NAV 할인율 30% 이하를 목표로 제시했다.",
    evidenceNeedles: ["시가총액 7.3 10.7 26.6 NAV 27.1 31.2 56.5", "28년까지 NAV 할인율 30% 이하"],
    forwardLooking: true,
    runtimeUsePolicy: "eligible_for_bounded_context_with_forward_looking_label",
    stalenessPolicy: "current_until_newer_value_up_plan_or_shareholder_return_update",
    reviewerRationale:
      "이미 일부 claim이 승격된 회사지만, 가치제고계획의 핵심 축을 명시한 source-backed 문장으로 유지 가치가 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hyundai-motor-hyundai-motor-hyundai-local-8a594d025684",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "현대자동차는 2025년 연간 매출 186.254조원, 영업이익 11.468조원, 당기순이익 10.365조원을 제시했고, 영업이익률은 6.2%였다.",
    evidenceNeedles: ["2024 2025 전년 대비 매출액 175,231 186,254"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_result",
    reviewerRationale:
      "완성차 그룹 대표사의 연간 수익성 기준점이며, 관세/믹스 영향 질문의 출발점으로 쓰기 좋다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hyundai-motor-kia-hyundai-local-3e0392d5ac42",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "기아는 2026년 1분기 매출 29.502조원, 영업이익 2.205조원, 당기순이익 1.830조원, 영업이익률 7.5%를 제시했다.",
    evidenceNeedles: ["매출액 28,018 100% 29,502"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "현대차와 같은 완성차 축이지만 수익성 수준이 달라 비교 답변에 쓰기 좋다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hyundai-motor-hyundai-mobis-hyundai-local-14aca26a0371",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "현대모비스는 2026년 1분기 매출액 15조 5,605억원, 영업이익 8,026억원을 제시했고, 모듈·핵심부품 매출은 전년 동기 대비 4.9%, A/S 사업 매출은 7.4% 증가했다고 설명했다.",
    evidenceNeedles: ["1. Highlights 분기 실적 매출액"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "부품/AS의 다른 수익성 구조가 드러나 완성차 그룹 내 사업별 비교에 유용하다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hyundai-motor-hyundai-glovis-hyundai-local-debc793368dd",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "현대글로비스는 2026년 1분기 매출 7.813조원, 영업이익 5,215억원, 영업이익률 6.7%, 순이익 3,410억원을 제시했다.",
    evidenceNeedles: ["Sales 7,223.4 7,472.0 7,812.7"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "물류/해운/유통 축의 수익성 기준점으로 그룹 포트폴리오 답변에 필요하다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hyundai-motor-hyundai-rotem-hyundai-local-52e6ad6af43c",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_metric",
    proposedClaimText:
      "현대로템은 2025년 사업보고서 기준 전체 매출액 58,390억원, 디펜스솔루션 32,153억원, 레일솔루션 20,896억원, 에코플랜트 5,341억원을 제시했고, 수주잔고는 297,735억원이었다.",
    evidenceMarkdownPath: "raw/extracted/hyundai-motor/official/hyundai-local-c2f206365990-2025_사업보고서.md",
    sourceManifestId: "hyundai-local-c2f206365990",
    sourceTitle: "2025_사업보고서",
    publicDocumentUrl: "https://dart.fss.or.kr/pdf/download/pdf.do?rcp_no=20260319001275&dcm_no=11152848",
    sourcePageUrl: "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260319001275",
    evidenceNeedles: [
      "사업보고서 작성기준일 현재 전체 매출액은 58,390억원이며",
      "디펜스솔루션 부문 제품 방산물자 32,153"
    ],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_dart_report_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_report",
    reviewerRationale:
      "신규 DART 사업보고서 추출물에서 항목명과 숫자 매핑이 확인되어 보류 사유가 해소됐다. 4Q IR 표는 보조 근거로 유지하고, 고객 답변 claim은 사업보고서 문장을 우선한다.",
    reviewerActionRequired: "user_approval_after_rotem_backfill"
  },
  {
    candidateId: "cprp-lg-lg-electronics-lg-local-a1e7cd3cc841",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "LG전자는 2026년 1분기 연결 기준 매출 23.7조원, 영업이익 1조 6,737억원을 기록했고, HS와 VS 사업본부가 사상 최대 분기 매출을 달성했다고 설명했다.",
    evidenceNeedles: ["2026 년 1 분기 연결 기준 매출액은 23.7 조원"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "가전, 전장, B2B 전환 질문에 쓰기 좋은 대표 실적/사업부 claim이다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-lg-lg-chem-lg-local-310be2f77733",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "LG화학은 2026년 1분기 매출 12.247조원, 영업손실 500억원, EBITDA 1.442조원을 제시했고, 당기순손실은 7,820억원이었다.",
    evidenceNeedles: ["매출액 12,579 11,908 11,562 11,530 12,247"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "화학/첨단소재/에너지솔루션 포함 구조에서 수익성 압박을 수치로 보여준다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-lg-lg-energy-solution-lg-local-429a8992830d",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "LG에너지솔루션은 2026년 1분기 매출 6.555조원, 영업손실 2,080억원을 제시했고, 북미 ESS 생산 확대에도 EV 파우치 물량 감소와 ESS 초기 가동 비용 부담을 적자 요인으로 설명했다.",
    evidenceNeedles: ["북미 주요 고객사 재고 조정으로 EV 향 파우치 물량은 감소"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "배터리 업황 질문에서 단순 적자보다 ESS/EV mix 변수를 함께 제공한다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-lg-lg-innotek-lg-local-41b3c43eb3a3",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "LG이노텍은 2025년 4분기 매출 7.610조원, 영업이익 3,247억원, 영업이익률 4.3%, 순이익 1,359억원을 제시했고, 매출과 영업이익은 전년 동기 대비 각각 14.8%, 31.0% 증가했다.",
    evidenceNeedles: ["Revenue 7,609.8 5,369.4 +41.7%"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "광학솔루션 중심의 계절성과 수익성 개선을 동시에 설명할 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-lg-lg-uplus-lg-local-a75cbda10689",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "LG유플러스는 2025년 연결 서비스수익 12조 2,633억원, 영업이익 8,921억원을 제시했고, AIDC 매출은 전년 대비 18.4%, 기업인프라 수익은 6.0% 성장했다고 밝혔다.",
    evidenceNeedles: ["2025 Highlights 서비스 수익"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_result",
    reviewerRationale:
      "통신 본업과 AIDC 성장축을 함께 제시해 LG 그룹의 AI 인프라 문맥을 보강한다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hanwha-hanwha-hanwha-local-70253ef29b11",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_metric_preliminary",
    proposedClaimText:
      "㈜한화는 2025년 연결 기준 매출 747,474억원, 영업이익 41,560억원, 당기순이익 19,650억원을 제시했고, 영업이익은 전년 대비 72% 증가했다.",
    evidenceNeedles: ["연결 매출액 210,760"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_annual_or_quarterly_result",
    reviewerRationale:
      "원본 PoC의 한화 기준축을 계열사 확장 구조에서도 유지할 수 있는 연결 실적 claim이다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hanwha-hanwha-aerospace-hanwha-local-6340a4d368a9",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "한화에어로스페이스는 2026년 1분기 매출 57,510억원, 영업이익 6,389억원, 당기순이익 5,259억원을 제시했고, 영업이익은 전년 동기 대비 21% 증가했다.",
    evidenceNeedles: ["1Q26 손익현황 (Ⅱ)"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "방산/우주항공 대표 계열사의 확정 분기 수치로 한화 reference slice 보강에 필요하다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hanwha-hanwha-solutions-hanwha-local-4ea5a5c64929",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "한화솔루션은 2026년 1분기 매출 38,820억원, 영업이익 926억원, 영업이익률 2.4%를 제시했고, 신재생에너지 모듈 판매량과 ASP 증가, 케미칼 원가 절감 등을 흑자전환 요인으로 설명했다.",
    evidenceNeedles: ["구 분 1 Q 2 6 4Q 2 5"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "태양광/케미칼 전환축을 재무 수치와 사업 요인으로 분리해 답변할 수 있다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hanwha-hanwha-systems-hanwha-local-becc0f32f9b8",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "한화시스템은 2025년 3분기 연결 매출액 8,077억원, 영업이익 225억원, 당기순이익 1,518억원을 제시했고, 방산 부문 매출은 전년 동기 대비 3% 증가했다.",
    evidenceNeedles: ["실적 요약 – ’25 년 3 분기 연결 매출 및 손익"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "방산과 ICT를 분리한 계열사 claim으로 한화의 방산 포트폴리오 답변을 더 세밀하게 만든다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  },
  {
    candidateId: "cprp-hanwha-hanwha-ocean-hanwha-local-cb1391385895",
    proposedDecision: "approve_for_seed_review",
    confidence: "high",
    claimType: "financial_business_driver",
    proposedClaimText:
      "한화오션은 2026년 1분기 연결 기준 매출액 3조 2,099억원, 영업이익 4,411억원, 당기순이익 5,000억원을 기록했고, 영업이익은 전분기 대비 78% 증가했다고 밝혔다.",
    evidenceNeedles: ["’ 26 년 1 분기 연결 기준 실적은 매출액 3 조 2,099 억 원"],
    forwardLooking: false,
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_result_label",
    stalenessPolicy: "current_until_newer_quarterly_result_or_audited_filing",
    reviewerRationale:
      "조선 수익성 개선을 수치로 근거화해 한화의 방산/조선 확장 narrative를 보완한다.",
    reviewerActionRequired: "user_approval_before_seed_config"
  }
  ];
}
