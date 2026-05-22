import type { BriefCardModel } from "./briefingTemplate";
import { displayGroupName } from "./briefingTemplate";
import type { GroupProfile } from "./types";

export type QuickTopicId = "market" | "global" | "target" | "rival" | "filing";

export const QUICK_ACTIONS: Array<{ id: QuickTopicId; label: string }> = [
  { id: "market", label: "시장" },
  { id: "global", label: "국제" },
  { id: "target", label: "종목" },
  { id: "rival", label: "경쟁사" },
  { id: "filing", label: "공시" }
];

export function buildQuickQuestion(group: GroupProfile, topic: QuickTopicId) {
  const groupLabel = displayGroupName(group);
  const companyNames = representativeCompanyNames(group);
  const lens = sectorLens(group);
  const rivals = rivalLens(group);

  if (topic === "market") {
    return `${groupLabel} 시장 동향을 투자자 관점에서 요약해줘. ${lens} 업황, 수요·가격·정책 변화, 공시와 뉴스 확인 포인트를 구분해줘.`;
  }

  if (topic === "global") {
    return `${groupLabel}에 영향을 줄 국제 변수들을 정리해줘. 미국·중국·유럽 정책, 지정학, 환율·금리, 공급망 이슈가 ${lens}에 미치는 영향을 공시·뉴스 기준으로 구분해줘.`;
  }

  if (topic === "target") {
    return `${groupLabel} 핵심 종목(${companyNames})의 최근 투자 포인트를 뉴스·공시·재무 지표 기준으로 요약해줘. 검증된 근거와 아직 부족한 데이터도 구분해줘.`;
  }

  if (topic === "rival") {
    return `${groupLabel} 경쟁사 동향을 정리해줘. 비교 대상은 ${rivals} 중심으로 보고, ${groupLabel} 투자 관점에서 확인할 변수를 수주·가격·수익성·밸류에이션으로 나눠줘.`;
  }

  return `${groupLabel} 최근 공시를 확인해줘. 최근 7일을 우선 보고, 없으면 최근 30일까지 확장해서 리스크 신호·자본정책·실적 관련 공시를 구분해줘.`;
}

export function buildBriefCardQuestion(group: GroupProfile, card: BriefCardModel) {
  const groupLabel = displayGroupName(group);
  const body = cleanBriefText(card.body);
  const bodyTail = body ? ` (한줄 분석: ${body})` : "";

  if (card.kind === "news") {
    return `${groupLabel} 뉴스 "${card.headline}"를 투자자 관점에서 핵심 이슈, 공시 연결성, 단기 리스크로 구분해줘.${bodyTail}`;
  }

  if (card.kind === "stock") {
    return `${groupLabel} 주가 브리프 "${card.headline}"의 배경을 수급·공시·업황 신호로 나눠 정리해줘.`;
  }

  return `${groupLabel} 재무 브리프 기준으로 매출, 영업이익률, 순이익, 부채비율, 전년 대비 개선폭, 동종업계 수익성 포지션을 정리해줘. 검증되지 않은 항목은 별도 표시해줘.`;
}

function cleanBriefText(value?: string) {
  return String(value ?? "")
    .replace(/^→\s*/u, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function representativeCompanyNames(group: GroupProfile) {
  const listed = group.companies
    .filter((company) => company.listed)
    .slice(0, 3)
    .map((company) => company.koreanName);
  return listed.length > 0 ? listed.join("·") : displayGroupName(group);
}

function sectorLens(group: GroupProfile) {
  const aliases = group.companies
    .flatMap((company) => company.aliases)
    .filter(Boolean)
    .slice(0, 7);
  if (aliases.length > 0) return aliases.join("·");
  return "주요 사업 포트폴리오";
}

function rivalLens(group: GroupProfile) {
  return {
    samsung: "SK하이닉스·TSMC·LG에너지솔루션·애플 공급망",
    sk: "삼성전자·마이크론·LG에너지솔루션·KT/LG유플러스",
    "hyundai-motor": "토요타·테슬라·GM·폭스바겐·부품 경쟁사",
    lg: "삼성전자·삼성SDI·SK온·글로벌 배터리/가전 경쟁사",
    hanwha: "LIG넥스원·현대로템·KAI·HD현대·SK이노베이션·삼성생명"
  }[group.id] ?? "동종 대형 그룹과 핵심 상장 경쟁사";
}
