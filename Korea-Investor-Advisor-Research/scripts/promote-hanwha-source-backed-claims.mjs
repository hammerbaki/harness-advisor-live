import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const now = new Date().toISOString();
const outputPath = join(rootDir, "raw", "manifests", "hanwha.source-backed-claims.json");
const docPath = join(rootDir, "docs", "23_hanwha_source_backed_claims.md");

const extraction = await readJson("raw/manifests/hanwha.extraction-report.json");
const provenance = await readJson("raw/manifests/hanwha.source-provenance.json");
const claims = await readJson("raw/manifests/hanwha.claim-candidates.json");
const localSources = await readJson("raw/manifests/hanwha.local-sources.json");
const policy = await readJson("configs/source-selection-policy.json");

const extractionById = new Map((extraction.results ?? []).map((source) => [source.manifestId, source]));
const provenanceById = new Map((provenance.localSources ?? []).map((source) => [source.manifestId, source]));
const inventoryById = new Map((localSources.entries ?? []).map((source) => [source.id, source]));
const knownPolicyRuleIds = new Set([
  ...(policy.scopePrinciples ?? []).map((rule) => rule.id),
  ...(policy.selectionRules ?? []).map((rule) => rule.id)
]);

const curatedClaims = [
  {
    id: "hanwha-sbc-001",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "2025년 연결 기준 매출액은 747,474억원, 영업이익은 41,560억원, 영업이익률은 5.6%로 확인된다.",
    sourceManifestId: "hanwha-local-70253ef29b11",
    evidenceLocations: [
      { pageNumber: 7, lineStart: 44, lineEnd: 44, note: "4Q25 연결 기준 손익 표" },
      { pageNumber: 18, lineStart: 88, lineEnd: 88, note: "주요 자회사 실적 표의 2025 연결 영업이익률" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-05", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "앱의 재무 브리프 headline metric seed로 사용할 수 있다."
  },
  {
    id: "hanwha-sbc-002",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "2025년 연결 매출액은 2024년 556,468억원 대비 34% 증가했고, 연결 영업이익은 2024년 24,161억원 대비 72% 증가했다.",
    sourceManifestId: "hanwha-local-70253ef29b11",
    evidenceLocations: [
      { pageNumber: 7, lineStart: 44, lineEnd: 44, note: "연결 매출액 및 영업이익 YoY 표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-05", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "전년 대비 실적 설명의 최소 검증 claim이다."
  },
  {
    id: "hanwha-sbc-003",
    targetWikiPage: "wiki/groups/hanwha/investment-thesis.md",
    claimType: "business_pipeline",
    claimText:
      "건설 부문은 이라크 BNCP 8.9조원을 제외한 2025년 수주잔고 13.7조원과 2026년 총 수주 계획 3.1조원을 제시했다.",
    sourceManifestId: "hanwha-local-70253ef29b11",
    evidenceLocations: [
      { pageNumber: 5, lineStart: 36, lineEnd: 36, note: "건설 수주액 및 수주잔고 페이지" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-05", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "건설 사이클 전환 thesis의 근거 seed다."
  },
  {
    id: "hanwha-sbc-004",
    targetWikiPage: "wiki/groups/hanwha/investment-thesis.md",
    claimType: "business_pipeline",
    claimText:
      "이라크 BNCP는 7만 세대 규모 사업으로, 2025년 4분기 말 기준 약 8.9조원의 수주잔고와 공사 재개가 제시됐다.",
    sourceManifestId: "hanwha-local-70253ef29b11",
    evidenceLocations: [
      { pageNumber: 4, lineStart: 32, lineEnd: 32, note: "건설 4분기 실적 및 2026년 전망 페이지" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-05", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "BNCP 관련 질의에는 stale check가 필요하다."
  },
  {
    id: "hanwha-sbc-005",
    targetWikiPage: "wiki/groups/hanwha/investment-thesis.md",
    claimType: "business_strategy",
    claimText:
      "글로벌 부문 질산 사업은 온산 12만톤과 여수 40만톤을 합산한 52만톤 판매 계획과 질산-초안-화약 수직계열화 강화를 핵심 논리로 제시한다.",
    sourceManifestId: "hanwha-local-70253ef29b11",
    evidenceLocations: [
      { pageNumber: 16, lineStart: 80, lineEnd: 80, note: "글로벌 부문 질산 판매 계획 appendix" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-05", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "소재/화약 수직계열화 질문의 공식 IR seed다."
  },
  {
    id: "hanwha-sbc-006",
    targetWikiPage: "wiki/groups/hanwha/value-up.md",
    claimType: "capital_action",
    claimText:
      "한화의 2026년 인적분할 자료는 존속 76%, 신설 24%의 분할 방식과 2026년 6월 15일 임시주주총회, 2026년 7월 1일 분할기일, 2026년 7월 24일 변경상장 및 신규상장 예정일을 잠정 일정으로 제시한다.",
    sourceManifestId: "hanwha-local-55e3664d4fc8",
    evidenceLocations: [
      { pageNumber: 5, lineStart: 36, lineEnd: 36, note: "인적분할 개요 및 잠정 일정" },
      { pageNumber: 30, lineStart: 136, lineEnd: 136, note: "인적분할 일정 appendix" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-06", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_staleness_check",
    reviewNote: "잠정 일정이므로 공시/DART 업데이트 확인이 필요하다."
  },
  {
    id: "hanwha-sbc-007",
    targetWikiPage: "wiki/groups/hanwha/value-up.md",
    claimType: "value_up_plan",
    claimText:
      "기업가치 제고계획은 연결매출 성장, ROE 개선, 주주환원 확대를 핵심축으로 제시하며 2030년 ROE 12% 달성을 목표로 한다.",
    sourceManifestId: "hanwha-local-55e3664d4fc8",
    evidenceLocations: [
      { pageNumber: 4, lineStart: 32, lineEnd: 32, note: "기업가치 제고 계획의 세 가지 축" },
      { pageNumber: 11, lineStart: 60, lineEnd: 60, note: "ROE 2030 목표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-06", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_forward_looking_label",
    reviewNote: "전망성 문구이므로 답변 시 계획/목표 표현을 유지해야 한다."
  },
  {
    id: "hanwha-sbc-008",
    targetWikiPage: "wiki/groups/hanwha/value-up.md",
    claimType: "shareholder_return",
    claimText:
      "주주환원 정책은 보통주 최소 DPS 1,000원, 임직원 성과보상분 제외 보통주 약 445만주 소각, 제1우선주 전량 매입 및 소각을 포함한다.",
    sourceManifestId: "hanwha-local-55e3664d4fc8",
    evidenceLocations: [
      { pageNumber: 11, lineStart: 60, lineEnd: 60, note: "주주환원 확대 및 정책 가시화" },
      { pageNumber: 14, lineStart: 72, lineEnd: 72, note: "배당정책 개선 및 자사주 소각" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-06", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_staleness_check",
    reviewNote: "배당과 소각은 최신 공시로 이행 상태를 별도 확인해야 한다."
  },
  {
    id: "hanwha-sbc-009",
    targetWikiPage: "wiki/groups/hanwha/value-up.md",
    claimType: "capital_allocation",
    claimText:
      "2026-2030 중기 자본 배분 계획은 재무구조 개선 및 운영자금 45%, 주주환원 25%, 미래 전략투자 30%를 제시하고, 2030년까지 총 7천억원 투자를 계획한다.",
    sourceManifestId: "hanwha-local-0d0d62143448",
    evidenceLocations: [
      { pageNumber: 21, lineStart: 100, lineEnd: 100, note: "중기 자본 배분 계획" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-06", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_forward_looking_label",
    reviewNote: "자본 배분 계획은 계획값으로 표기해야 한다."
  },
  {
    id: "hanwha-sbc-010",
    targetWikiPage: "wiki/groups/hanwha/governance.md",
    claimType: "governance_process",
    claimText:
      "한화 공시관리 규정은 공시정보를 투자 판단에 영향을 미칠 수 있는 정보로 정의하고, 공시통제조직을 대표이사, 공시책임자, 공시담당부서, 사업부서로 규정한다.",
    sourceManifestId: "hanwha-local-eec91ff3b25f",
    evidenceLocations: [
      { pageNumber: 2, lineStart: 24, lineEnd: 24, note: "공시정보 및 공시통제조직 정의" },
      { pageNumber: 3, lineStart: 28, lineEnd: 28, note: "공시통제조직 관련 정의의 연속" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-07", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "공시 프로세스 관련 답변의 governance seed다."
  },
  {
    id: "hanwha-sbc-011",
    targetWikiPage: "wiki/groups/hanwha/governance.md",
    claimType: "investor_communication",
    claimText:
      "기업가치 제고계획의 소통 계획은 IR 자료 공개, 기업설명회, 국내외 NDR 및 1:1 미팅, 컨퍼런스, IR 대표번호와 이메일 문의 대응, 진행 경과의 연 1회 이상 공시를 포함한다.",
    sourceManifestId: "hanwha-local-0d0d62143448",
    evidenceLocations: [
      { pageNumber: 23, lineStart: 108, lineEnd: 108, note: "주주 및 이해관계자 소통 계획" }
    ],
    sourceRuleIds: ["SCOPE-02", "SRC-01", "SRC-06", "SRC-07", "SRC-10", "SRC-11"],
    runtimeUsePolicy: "eligible_for_bounded_context",
    reviewNote: "투자자 커뮤니케이션 관련 UI 후속질문/링크 seed로 쓸 수 있다."
  },
  {
    id: "hanwha-sbc-012",
    companyId: "hanwha-aerospace",
    companyScope: "listed_company",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "한화에어로스페이스는 2026년 1분기 연결 기준 매출액 57,510억원, 영업이익 6,389억원, 영업이익률 11.1%를 제시했다.",
    sourceManifestId: "hanwha-local-6340a4d368a9",
    evidenceLocations: [
      { pageNumber: 7, lineStart: 44, lineEnd: 44, note: "1Q26 손익현황 표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-05", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_recent_ir_label",
    reviewNote: "한화에어로스페이스 첫 슬라이스 계열사 claim promotion seed다."
  },
  {
    id: "hanwha-sbc-013",
    companyId: "hanwha-solutions",
    companyScope: "listed_company",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "한화솔루션은 2025년 연결 기준 매출액 133,544억원, 영업손실 3,533억원, 영업이익률 -2.6%를 제시했다.",
    sourceManifestId: "hanwha-local-440a6de8fb0d",
    evidenceLocations: [
      { pageNumber: 10, lineStart: 56, lineEnd: 56, note: "2025 손익현황 표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-05", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_recent_ir_label",
    reviewNote: "적자 및 사업부별 손익 설명을 투자자 답변에서 숫자로 고정하기 위한 seed다."
  },
  {
    id: "hanwha-sbc-014",
    companyId: "hanwha-systems",
    companyScope: "listed_company",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "한화시스템은 2025년 연결 기준 매출액 36,641억원, 영업이익 1,119억원, 영업이익률 3.3%, 당기순이익 2,091억원을 제시했다.",
    sourceManifestId: "hanwha-local-c7cf5664d769",
    evidenceLocations: [
      { pageNumber: 5, lineStart: 36, lineEnd: 36, note: "2025년 연결 매출 및 손익 표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-05", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_preliminary_ir_label",
    reviewNote: "한화시스템은 이미 사업보고서도 보유하므로 계열사 claim routing 검증에 적합하다."
  },
  {
    id: "hanwha-sbc-015",
    companyId: "hanwha-ocean",
    companyScope: "listed_company",
    targetWikiPage: "wiki/groups/hanwha/financials.md",
    claimType: "financial_metric",
    claimText:
      "한화오션은 2025년 연결 기준 매출액 127,835억원, 영업이익 11,676억원, 영업이익률 9.1%를 제시했다.",
    sourceManifestId: "hanwha-local-7fce556971af",
    evidenceLocations: [
      { pageNumber: 6, lineStart: 40, lineEnd: 40, note: "2025 연결 손익현황 표" }
    ],
    sourceRuleIds: ["SCOPE-02", "SCOPE-03", "SRC-01", "SRC-05", "SRC-10", "SRC-11", "SRC-12"],
    runtimeUsePolicy: "eligible_for_bounded_context_with_recent_ir_label",
    reviewNote: "한화오션 첫 슬라이스 조선/특수선 축의 runtime seed다."
  }
];

const records = curatedClaims.map(enrichClaim);
const output = {
  schemaVersion: "source-backed-claims.v0.1",
  groupId: "hanwha",
  generatedAt: now,
  selectionPolicyVersion: policy.policyVersion,
  inputArtifacts: {
    extractionReport: "raw/manifests/hanwha.extraction-report.json",
    provenance: "raw/manifests/hanwha.source-provenance.json",
    claimCandidates: "raw/manifests/hanwha.claim-candidates.json",
    sourceSelectionPolicy: "configs/source-selection-policy.json"
  },
  policy:
    "Only reviewed atomic claims that point to official-source manifests and extraction locators are eligible for bounded runtime context.",
  totals: {
    candidatesReviewedFromOldRag: claims.totals?.candidates ?? 0,
    claims: records.length,
    byClaimType: countBy(records, (record) => record.claimType),
    byCompanyId: countBy(records, (record) => record.companyId),
    byTargetWikiPage: countBy(records, (record) => record.targetWikiPage),
    byRuntimeUsePolicy: countBy(records, (record) => record.runtimeUsePolicy),
    byVerificationState: countBy(records, (record) => record.verificationState)
  },
  records
};

validateOutput(output);
await writeJson(outputPath, output);
await writeFile(docPath, buildDoc(output), "utf8");
await updateWikiPages(output.records);

console.log(`Hanwha source-backed claims written: ${relative(rootDir, outputPath)}`);
console.log(`Readable audit note written: ${relative(rootDir, docPath)}`);
console.log(`${output.totals.claims} source-backed seed claims promoted.`);

function enrichClaim(claim) {
  const source = extractionById.get(claim.sourceManifestId);
  const sourceProvenance = provenanceById.get(claim.sourceManifestId) ?? null;
  const inventorySource = inventoryById.get(claim.sourceManifestId) ?? null;
  if (!source) throw new Error(`Missing extraction source for ${claim.sourceManifestId}`);
  if (!sourceProvenance && !inventorySource) {
    throw new Error(`Missing provenance or inventory source for ${claim.sourceManifestId}`);
  }

  const evidenceLocations = claim.evidenceLocations.map((location) => ({
    ...location,
    localExtractedPath: source.markdownPath ?? null,
    sourceTextSha256: source.textSha256
  }));

  return {
    ...claim,
    groupId: "hanwha",
    companyId: claim.companyId ?? inventorySource?.companyId ?? "hanwha",
    companyScope: claim.companyScope ?? inventorySource?.companyScope ?? "listed_company",
    claimTextSha256: sha256(claim.claimText),
    verificationState: "source_backed_seed",
    sourceTitle: source.title,
    sourceRole: source.inferredSourceRole,
    sourceCategory: source.sourceCategory,
    sourceDocumentDate: source.documentDate ?? inventorySource?.documentDate ?? null,
    sourceSha256: source.sha256,
    sourceTextSha256: source.textSha256,
    officialSource: officialSourceFor(sourceProvenance, inventorySource),
    evidenceLocations,
    rightsPolicy:
      "Public official source metadata may be cited. Local extracted full text is for private review and should not be redistributed unless rights are verified.",
    paperUseLevel: "source-backed-seed-claim",
    promotedAt: now
  };
}

function officialSourceFor(sourceProvenance, inventorySource) {
  const existing = sourceProvenance?.officialSource ?? null;
  if (existing?.sourcePageUrl || existing?.downloadUrl || existing?.receiptUrl) return existing;
  if (!inventorySource) return null;

  return {
    sourcePageUrl: inventorySource.sourcePageUrl ?? null,
    downloadUrl: inventorySource.publicDocumentUrl ?? null,
    receiptUrl: inventorySource.dartReceiptUrl ?? null,
    sourcePageTitle: inventorySource.title ?? null,
    documentUrlStatus: inventorySource.documentUrlStatus ?? null,
    requestPackage: inventorySource.requestPackage ?? null,
    rightsLevel: inventorySource.rightsLevel ?? null,
    provenanceKind: inventorySource.publicDocumentUrl
      ? "document-url-ledger"
      : "source-page-ledger",
    note:
      "Accepted under SRC-01/SRC-10: official IR source page plus local checksum and extraction hash identify the document when direct document URL is dynamic or unavailable."
  };
}

function validateOutput(sourceBackedClaims) {
  const targetPages = new Set(sourceBackedClaims.records.map((record) => record.targetWikiPage));
  for (const targetPage of targetPages) {
    if (!existsSync(join(rootDir, targetPage))) throw new Error(`Missing wiki target page: ${targetPage}`);
  }

  for (const record of sourceBackedClaims.records) {
    if (record.groupId !== "hanwha") throw new Error(`${record.id} must be groupId hanwha`);
    if (!record.companyId || !record.companyScope) throw new Error(`${record.id} missing company scope`);
    if (record.verificationState !== "source_backed_seed") throw new Error(`${record.id} has invalid state`);
    if (!record.claimText || !record.claimTextSha256) throw new Error(`${record.id} missing claim text/hash`);
    if (!record.officialSource?.sourcePageUrl && !record.officialSource?.downloadUrl) {
      throw new Error(`${record.id} missing official source URL`);
    }
    if (!Array.isArray(record.evidenceLocations) || record.evidenceLocations.length === 0) {
      throw new Error(`${record.id} missing evidence location`);
    }
    for (const ruleId of record.sourceRuleIds) {
      if (!knownPolicyRuleIds.has(ruleId)) throw new Error(`${record.id} references unknown rule ${ruleId}`);
    }
  }
}

async function updateWikiPages(records) {
  const byPage = groupBy(records, (record) => record.targetWikiPage);
  for (const [targetPage, pageRecords] of byPage) {
    const absolutePath = join(rootDir, targetPage);
    const raw = await readFile(absolutePath, "utf8");
    const block = buildWikiBlock(pageRecords);
    const updated = replaceGeneratedBlock(raw, "source-backed-seed-claims", block);
    await writeFile(absolutePath, updated, "utf8");
  }

  const sourcesPath = join(rootDir, "wiki/groups/hanwha/sources.md");
  const sourcesRaw = await readFile(sourcesPath, "utf8");
  const sourcesBlock = [
    "## Source-Backed Claim Manifest",
    "",
    "- `raw/manifests/hanwha.source-backed-claims.json` records the first reviewed seed claims.",
    "- `docs/23_hanwha_source_backed_claims.md` explains the promotion gate and claim table.",
    "- These claims are eligible for bounded runtime context; the older RAG claim backlog remains `needs_source_link`."
  ].join("\n");
  await writeFile(sourcesPath, replaceGeneratedBlock(sourcesRaw, "source-backed-claim-manifest", sourcesBlock), "utf8");
}

function buildWikiBlock(records) {
  const lines = [
    "## Source-Backed Seed Claims",
    "",
    "These claims are the first reviewed seed set promoted from official-source extraction.",
    "The page remains `draft` until every runtime claim in this namespace is reviewed.",
    "",
    "| Claim ID | Claim | Source | Runtime policy |",
    "| --- | --- | --- | --- |"
  ];

  for (const record of records) {
    lines.push(
      `| \`${record.id}\` | ${escapeTable(record.claimText)} | \`${record.sourceManifestId}\` | \`${record.runtimeUsePolicy}\` |`
    );
  }

  lines.push(
    "",
    "Source manifest: `raw/manifests/hanwha.source-backed-claims.json`"
  );
  return lines.join("\n");
}

function buildDoc(sourceBackedClaims) {
  const lines = [
    "# Hanwha Source-Backed Seed Claims",
    "",
    `Generated: ${sourceBackedClaims.generatedAt}`,
    "",
    "## Purpose",
    "",
    "This note records the first Hanwha claims promoted from old RAG-style prose into claim-level, source-backed seed knowledge. The goal is not to certify the entire Hanwha corpus. The goal is to establish a reproducible promotion gate that can be reused for Samsung, SK, Hyundai Motor, LG, and future groups.",
    "",
    "## Promotion Gate",
    "",
    "A claim is promoted only when all of the following are true:",
    "",
    "1. the claim is atomic enough to answer or cite directly;",
    "2. the claim points to an official source manifest ID;",
    "3. the source has official-site provenance with a page URL or download URL;",
    "4. the extracted text has a text hash and review locator;",
    "5. the claim records source-selection rule IDs;",
    "6. the runtime policy states whether stale or forward-looking handling is needed.",
    "",
    "## Summary",
    "",
    `- Old RAG candidates reviewed as backlog: ${sourceBackedClaims.totals.candidatesReviewedFromOldRag}`,
    `- Source-backed seed claims promoted: ${sourceBackedClaims.totals.claims}`,
    `- Source-selection policy version: ${sourceBackedClaims.selectionPolicyVersion}`,
    "",
    "## Claims",
    "",
    "| ID | Target | Claim type | Source | Runtime policy |",
    "| --- | --- | --- | --- | --- |"
  ];

  for (const record of sourceBackedClaims.records) {
    lines.push(
      `| \`${record.id}\` / \`${record.companyId}\` | \`${record.targetWikiPage}\` | \`${record.claimType}\` | \`${record.sourceManifestId}\` | \`${record.runtimeUsePolicy}\` |`
    );
  }

  lines.push(
    "",
    "## Runtime Rule",
    "",
    "Runtime answers may use these claims only as bounded context. They should still show source links, source dates or periods, and stale/forward-looking labels when the `runtimeUsePolicy` requires it. Claims outside this manifest remain unverified unless separately promoted.",
    "",
    "## Source References",
    "",
    "- `raw/manifests/hanwha.source-backed-claims.json`",
    "- `raw/manifests/hanwha.extraction-report.json`",
    "- `raw/manifests/hanwha.source-provenance.json`",
    "- `raw/manifests/hanwha.claim-candidates.json`",
    "- `configs/source-selection-policy.json`"
  );

  return `${lines.join("\n")}\n`;
}

function replaceGeneratedBlock(raw, blockName, block) {
  const start = `<!-- BEGIN GENERATED:${blockName} -->`;
  const end = `<!-- END GENERATED:${blockName} -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  const pattern = new RegExp(`${escapeRegExp(start)}[\\s\\S]*?${escapeRegExp(end)}`, "u");
  if (pattern.test(raw)) return `${raw.replace(pattern, wrapped).trim()}\n`;
  return `${raw.trim()}\n\n${wrapped}\n`;
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(rootDir, relativePath), "utf8"));
}

async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function groupBy(items, keyFn) {
  const groups = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function escapeTable(text) {
  return text.replace(/\|/gu, "\\|").replace(/\n/gu, " ");
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function sha256(text) {
  return createHash("sha256").update(text.normalize("NFC")).digest("hex");
}
