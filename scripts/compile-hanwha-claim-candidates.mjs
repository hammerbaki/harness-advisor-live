import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultKnowledgePath = await findKnowledgePath();
const inputPath = resolve(process.env.HANWHA_KNOWLEDGE_MD ?? defaultKnowledgePath);
const outputPath = resolve(
  process.env.HANWHA_CLAIM_OUT ?? join(rootDir, "raw", "manifests", "hanwha.claim-candidates.json")
);
const extractionReportPath = join(rootDir, "raw", "manifests", "hanwha.extraction-report.json");

const extractionReport = JSON.parse(await readFile(extractionReportPath, "utf8"));
const extractionByTitle = new Map(extractionReport.results.map((result) => [result.title, result]));

const sourceShortcuts = {
  valueUpPlan: findSourceByTitle("(주)한화, 기업가치 제고계획_20260114"),
  valueUpPresentation: findSourceByTitle("1. (주)한화, 기업설명회_20260114"),
  earnings1q25: findSourceByTitle("1. (주)한화_1Q25 Earnings(연결)_검"),
  earnings2q25: findSourceByTitle("1. (주)한화_2Q25 Earnings(연결)_검"),
  earnings3q25: findSourceByTitle("1. (주)한화_3Q25 Earnings(연결)_검"),
  earnings4q25: findSourceByTitle("(주)한화_4Q25 Earnings(연결)"),
  latestAnnual: findSourceByTitle("[한화][정정]사업보고서(2026.03.31)"),
  annual2022: findSourceByTitle("22년도_[한화][정정]사업보고서(2025.12.18)"),
  annual2021: findSourceByTitle("[한화][정정]사업보고서(2022.03.24)"),
  latestStandaloneAudit: findSourceByTitle("(주)한화_감사보고서"),
  latestConsolidatedAudit: findSourceByTitle("(주)한화_연결감사보고서"),
  disclosurePolicy: findSourceByTitle("(주)한화 공시 관리 규정"),
  governanceCharter: findSourceByTitle("(주)한화 기업지배구조헌장"),
  boardPolicy: findSourceByTitle("(주)한화 이사회 규정_15차 개정본"),
  auditCommitteePolicy: findSourceByTitle("(주)한화 감사위원회 규정_6차 개정본"),
  internalTransactionPolicy: findSourceByTitle("(주)한화 내부거래위원회 규정_6차 개정본"),
  outsideDirectorNominationPolicy: findSourceByTitle("(주)한화 사외이사후보추천위원회 규정_5차 개정본"),
  esgCommitteePolicy: findSourceByTitle("(주)한화 ESG위원회 규정_제정본"),
  compensationCommitteePolicy: findSourceByTitle("(주)한화 보상위원회 규정_제정본")
};

const raw = await readFile(inputPath, "utf8");
const sections = parseSections(raw);
const candidates = sections.flatMap((section) => claimCandidatesForSection(section));

const output = {
  schemaVersion: "claim-candidates.v0.1",
  groupId: "hanwha",
  generatedAt: new Date().toISOString(),
  sourceMarkdown: relative(rootDir, inputPath).normalize("NFC"),
  policy:
    "These are claim candidates extracted from a prior RAG markdown summary. They are not source-backed until linked to official manifest IDs and reviewed.",
  totals: {
    sections: sections.length,
    candidates: candidates.length,
    byKind: countBy(candidates, (candidate) => candidate.kind),
    bySuggestedTarget: countBy(candidates, (candidate) => candidate.suggestedWikiTarget),
    byVerificationState: countBy(candidates, (candidate) => candidate.verificationState)
  },
  sourceShortcuts,
  candidates
};

await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Hanwha claim candidates written: ${relative(rootDir, outputPath)}`);
console.log(`${output.totals.candidates} candidates across ${output.totals.sections} sections.`);

async function findKnowledgePath() {
  const parent = resolve(rootDir, "..");
  const names = await readdir(parent);
  const match = names.find((name) => {
    const normalized = name.normalize("NFC");
    return normalized.includes("IR") && normalized.includes("지식체계") && normalized.endsWith(".md");
  });
  if (!match) {
    throw new Error("Could not find Hanwha IR knowledge markdown. Set HANWHA_KNOWLEDGE_MD.");
  }
  return join(parent, match);
}

function parseSections(markdown) {
  const lines = markdown.split(/\r?\n/u);
  const sections = [];
  const stack = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const heading = line.match(/^(#{1,6})\s+(.+)$/u);
    if (heading) {
      if (current) {
        current.endLine = index;
        current.body = lines.slice(current.startLine, index).join("\n").trim();
        sections.push(current);
      }

      const level = heading[1].length;
      stack.length = level - 1;
      stack[level - 1] = heading[2].trim();
      current = {
        id: `section-${sections.length + 1}`,
        level,
        heading: heading[2].trim(),
        headingPath: stack.filter(Boolean),
        startLine: index + 1,
        endLine: index + 1,
        body: ""
      };
    }
  }

  if (current) {
    current.endLine = lines.length;
    current.body = lines.slice(current.startLine).join("\n").trim();
    sections.push(current);
  }

  return sections.filter((section) => section.body.length > 0);
}

function claimCandidatesForSection(section) {
  const units = splitClaimUnits(section.body);
  return units.map((unit, index) => {
    const sourceHints = inferSourceHints(section, unit.text);
    return {
      id: `${section.id}-claim-${index + 1}`,
      groupId: "hanwha",
      headingPath: section.headingPath,
      sourceLineStart: unit.lineStart + section.startLine,
      sourceLineEnd: unit.lineEnd + section.startLine,
      kind: unit.kind,
      text: unit.text,
      textSha256: sha256(unit.text),
      suggestedWikiTarget: inferWikiTarget(section),
      sourceHints,
      verificationState: "needs_source_link",
      promotionRule:
        "Promote only after matching the claim to a manifest entry, public URL, date, and source page/section."
    };
  });
}

function splitClaimUnits(body) {
  const lines = body.split(/\r?\n/u);
  const units = [];
  let paragraph = [];
  let paragraphStart = 1;

  function flushParagraph(endLine) {
    const text = paragraph.join(" ").replace(/\s+/gu, " ").trim();
    if (text && !isStructural(text)) {
      units.push({ kind: "paragraph", text, lineStart: paragraphStart, lineEnd: endLine });
    }
    paragraph = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const line = lines[index].trim();

    if (!line) {
      flushParagraph(lineNo - 1);
      continue;
    }

    if (isTableRow(line)) {
      flushParagraph(lineNo - 1);
      if (!isTableSeparator(line) && !isLikelyTableHeader(line)) {
        units.push({ kind: "table_row", text: line, lineStart: lineNo, lineEnd: lineNo });
      }
      continue;
    }

    if (/^[-*]\s+/u.test(line)) {
      flushParagraph(lineNo - 1);
      units.push({ kind: "bullet", text: line.replace(/^[-*]\s+/u, ""), lineStart: lineNo, lineEnd: lineNo });
      continue;
    }

    if (paragraph.length === 0) paragraphStart = lineNo;
    paragraph.push(line);
  }

  flushParagraph(lines.length);
  return units.filter((unit) => unit.text.length >= 12);
}

function inferSourceHints(section, text) {
  const scope = [...section.headingPath, text].join(" ");
  const hints = [];

  if (/기업가치|인적분할|주주환원|ROE|NAV|자사주|DPS/u.test(scope)) {
    hints.push(sourceShortcuts.valueUpPlan, sourceShortcuts.valueUpPresentation);
  }
  if (/종목코드|보통주|우선주|발행주식수|액면가|자본금/u.test(scope)) {
    hints.push(
      sourceShortcuts.latestAnnual,
      { manifestId: "dart-company-profile-required", role: "regulatory_profile", note: "Needs DART company profile or public filing cross-check." },
      { manifestId: "krx-issue-profile-required", role: "market_data", note: "Needs KRX issue profile for listed share classes and tickers." }
    );
  }
  if (/신용등급|회사채|기업어음|Stable/u.test(scope)) {
    hints.push({
      manifestId: "credit-rating-source-required",
      role: "rating_agency_or_issuer",
      note: "Needs NICE/KIS/KR/I issuer rating page or official issuer rating disclosure."
    });
  }
  if (/1Q25|1분기/u.test(scope)) hints.push(sourceShortcuts.earnings1q25);
  if (/2Q25|2분기/u.test(scope)) hints.push(sourceShortcuts.earnings2q25);
  if (/3Q25|3분기/u.test(scope)) hints.push(sourceShortcuts.earnings3q25);
  if (/4Q25|4분기|잠정|2025년 연간/u.test(scope)) hints.push(sourceShortcuts.earnings4q25);
  if (/건설|수주|BNCP|이라크|복합개발|서울역|수서역|잠실 MICE|대전역세권/u.test(scope)) {
    hints.push(sourceShortcuts.valueUpPresentation, sourceShortcuts.earnings4q25, sourceShortcuts.latestAnnual);
  }
  if (/글로벌|화약|소재|질산|초안|용인 반도체|신공항|반도체|디스플레이/u.test(scope)) {
    hints.push(sourceShortcuts.valueUpPresentation, sourceShortcuts.earnings4q25, sourceShortcuts.latestAnnual);
  }
  if (/재무|손익|매출|영업이익|당기순이익|부채|자산|자본|부문별|계열사/u.test(scope)) {
    hints.push(sourceShortcuts.latestAnnual, sourceShortcuts.annual2022, sourceShortcuts.annual2021, sourceShortcuts.earnings4q25);
  }
  if (/감사보고서|연결감사보고서/u.test(scope)) {
    hints.push(sourceShortcuts.latestStandaloneAudit, sourceShortcuts.latestConsolidatedAudit);
  }
  if (/지배구조|이사회|위원회|감사위원회|내부거래|사외이사|보상위원회|ESG|공시|정관/u.test(scope)) {
    hints.push(
      sourceShortcuts.governanceCharter,
      sourceShortcuts.disclosurePolicy,
      sourceShortcuts.boardPolicy,
      sourceShortcuts.auditCommitteePolicy,
      sourceShortcuts.internalTransactionPolicy,
      sourceShortcuts.outsideDirectorNominationPolicy,
      sourceShortcuts.esgCommitteePolicy,
      sourceShortcuts.compensationCommitteePolicy
    );
  }
  if (/애널리스트|증권사|투자의견|목표주가|BUY/u.test(scope)) hints.push({ manifestId: "analyst-report-bucket", role: "third_party_analyst", note: "Use as secondary signal only." });
  if (/주가|시가총액|외국인|국내기관|주주/u.test(scope)) hints.push({ manifestId: "market-data-required", role: "market_data", note: "Needs KRX or DART shareholder source." });

  return dedupeHints(hints.filter(Boolean));
}

function inferWikiTarget(section) {
  const path = section.headingPath.join(" ");
  if (/주식/u.test(path)) return "wiki/groups/hanwha/market.md";
  if (/재무|실적|계열사/u.test(path)) return "wiki/groups/hanwha/financials.md";
  if (/기업가치|인적분할|주주환원/u.test(path)) return "wiki/groups/hanwha/value-up.md";
  if (/지배구조|경영진|ESG/u.test(path)) return "wiki/groups/hanwha/governance.md";
  if (/사업|리스크|투자 포인트/u.test(path)) return "wiki/groups/hanwha/investment-thesis.md";
  if (/애널리스트/u.test(path)) return "wiki/groups/hanwha/market-views.md";
  return "wiki/groups/hanwha/overview.md";
}

function findSourceByTitle(title) {
  const found = extractionByTitle.get(title);
  if (!found) return null;
  return {
    manifestId: found.manifestId,
    title: found.title,
    role: found.inferredSourceRole,
    sourceCategory: found.sourceCategory,
    textSha256: found.textSha256
  };
}

function isTableRow(line) {
  return line.startsWith("|") && line.endsWith("|");
}

function isTableSeparator(line) {
  return /^\|(?:\s*:?-{2,}:?\s*\|)+$/u.test(line);
}

function isLikelyTableHeader(line) {
  const cells = line.split("|").map((cell) => cell.trim()).filter(Boolean);
  if (cells.length === 0) return false;
  const first = cells[0];
  return ["구분", "항목", "연도", "계열사", "부문", "증권사", "성명"].includes(first);
}

function isStructural(text) {
  return text === "---" ||
    text.startsWith("> **버전") ||
    text.startsWith("*본 문서는") ||
    /^\*\*.+:\*\*$/u.test(text);
}

function dedupeHints(hints) {
  const seen = new Set();
  const output = [];
  for (const hint of hints) {
    const key = hint.manifestId ?? JSON.stringify(hint);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(hint);
  }
  return output;
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) counts[keyFn(item)] = (counts[keyFn(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b, "ko-KR")));
}

function sha256(text) {
  return createHash("sha256").update(text.normalize("NFC")).digest("hex");
}
