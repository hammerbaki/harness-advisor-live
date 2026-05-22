import type { GroupProfile } from "./types";

export interface BriefCardModel {
  kind: "news" | "stock" | "financial";
  label: string;
  meta: string;
  headline: string;
  body: string;
  metrics?: BriefMetric[];
  source?: string;
  sourceUrl?: string;
  footerLeft?: string;
  footerRight?: string;
  accent: "green" | "blue" | "orange";
}

export interface BriefMetric {
  label: string;
  value: string;
}

export type UiLocale = "ko" | "en";

export interface HomeSnapshotModel {
  title: string;
  subtitle: string;
  chips: BriefMetric[];
  bullets: string[];
  footer: string;
}

interface GroupSeed {
  price: string;
  change: string;
  revenue: string;
  operatingProfit: string;
  margin: string;
  newsHeadline: string;
  newsBody: string;
  newsSource: string;
  newsUrl: string;
  thesis: string;
  evidenceCount: string;
  evalStatus: string;
  basis: string;
  sourceLine: string;
  primaryCompany: string;
  newsMetrics: BriefMetric[];
  stockMetrics: BriefMetric[];
  financialMetrics: BriefMetric[];
  homeBullets: string[];
  newsMeta?: string;
  newsFooterRight?: string;
  stockMeta?: string;
  stockBody?: string;
  stockFooterLeft?: string;
  stockFooterRight?: string;
  financialMeta?: string;
  financialHeadline?: string;
  financialBody?: string;
  financialFooterLeft?: string;
  financialFooterRight?: string;
}

const groupSeeds: Record<string, GroupSeed> = {
  hanwha: {
    price: "133,400",
    change: "+0.68%",
    revenue: "74.7조",
    operatingProfit: "4.2조",
    margin: "5.6%",
    newsHeadline: "금감원, 한화솔루션 유증 또 제동...2차 정정 요구",
    newsBody:
      "금감원의 2차 정정 요구는 한화솔루션 유증 심사 기준 강화 신호, 에어로스페이스 3.6조 사례와 달리 자금 투명성...",
    newsSource: "한화 공식 IR",
    newsUrl: "https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp",
    thesis: "방산·건설 사이클 전환 신호와 에어로스페이스 수익성 개선 기대",
    evidenceCount: "공식 근거 11건",
    evalStatus: "평가 5/5",
    basis: "IR 2025·DART",
    sourceLine: "한화 공식 IR·OpenDART 기반",
    primaryCompany: "㈜한화",
    newsMetrics: [
      { label: "이슈", value: "유증 정정" },
      { label: "연결축", value: "자금 투명성" },
      { label: "확인", value: "공시 추적" }
    ],
    stockMetrics: [
      { label: "대표", value: "000880" },
      { label: "가격", value: "133,400원" },
      { label: "변화", value: "+0.68%" }
    ],
    financialMetrics: [
      { label: "매출", value: "74.7조" },
      { label: "영업익", value: "4.2조" },
      { label: "OPM", value: "5.6%" }
    ],
    homeBullets: [
      "2025년 실적 개선은 매출 확대와 영업이익 증가가 함께 나타난 기준점입니다.",
      "방산·건설·에너지 포트폴리오의 수익성 지속성과 자본배분 실행 여부가 다음 확인축입니다.",
      "분할·주주환원·유증 관련 공시는 가격 신호와 분리해 추적해야 합니다."
    ]
  },
  samsung: {
    price: "284,000",
    change: "+1.79%",
    revenue: "300.9조",
    operatingProfit: "32.7조",
    margin: "10.9%",
    newsHeadline: '[속보] 삼성전자 사측, 오늘 노조에 "직접 대화 하자"...',
    newsBody:
      "중앙노동위원회 사후조정이 무산된 가운데 삼성전자 사측이 노조에 다시 대화를 하자는 내용의 공문을 보냈습니다. 삼성...",
    newsSource: "SBS",
    newsUrl: "https://news.sbs.co.kr/news/search/main.do?query=%EC%82%BC%EC%84%B1%EC%A0%84%EC%9E%90%20%EC%82%AC%EC%B8%A1%20%EB%85%B8%EC%A1%B0%20%EC%A7%81%EC%A0%91%20%EB%8C%80%ED%99%94",
    thesis: "메모리 가격 회복과 HBM 경쟁력 재평가 가능성",
    evidenceCount: "공식 근거 31건",
    evalStatus: "평가 5/5",
    basis: "DART 2024·IR 2026Q1",
    sourceLine: "삼성전자 OpenDART·2026Q1 IR 기반",
    primaryCompany: "삼성전자",
    newsMeta: "12시간 전 · SBS",
    newsFooterRight: "정렬: 가중합",
    stockMeta: "2026-05-13 종가 · KRX 005930",
    stockBody: "KRX 종가 기준 메모리 가격 회복과 HBM 경쟁력 재평가 가능성을 중심으로 외인 수급, 공시, 업황 신호를 함께 모니터링합니다.",
    stockFooterLeft: "출처: KRX stk_bydd_trd",
    stockFooterRight: "상태: live",
    financialMeta: "DART 접수 2026-05-13",
    financialHeadline: "삼성전자 · 임원 · 주요주주특정증권등소유상황보고서",
    financialBody:
      "삼성 연결 기준 매출 300.9조 · 영업이익 32.7조 (영익률 10.9%). 최신 공시 본문을 DART에서 직접 확인하세요.",
    financialFooterLeft: "출처: DART OpenAPI list.json",
    financialFooterRight: "상태: live",
    newsMetrics: [
      { label: "IR", value: "2026Q1" },
      { label: "전략", value: "HBM4" },
      { label: "제품", value: "AI 메모리" }
    ],
    stockMetrics: [
      { label: "대표", value: "005930" },
      { label: "가격", value: "284,000원" },
      { label: "변화", value: "+1.79%" }
    ],
    financialMetrics: [
      { label: "매출", value: "300.9조" },
      { label: "영업익", value: "32.7조" },
      { label: "OPM", value: "10.9%" }
    ],
    homeBullets: [
      "삼성전자는 2024년 영업이익률 10.9%로 2023년 2.5% 대비 회복 폭이 큽니다.",
      "2026년 1분기 IR은 HBM4·DDR5·SOCAMM2 등 AI향 고부가 제품 확대를 전략 축으로 제시합니다.",
      "실적 회복의 지속성은 메모리 가격, HBM 공급 경쟁력, 파운드리 손익 개선을 분리해 확인해야 합니다."
    ]
  },
  sk: {
    price: "221,000",
    change: "+2.35%",
    revenue: "127.5조",
    operatingProfit: "7.8조",
    margin: "6.1%",
    newsHeadline: "SK하이닉스, HBM 수요 강세 지속...투자 속도 관심",
    newsBody:
      "AI 반도체 밸류체인에서 HBM 공급능력과 고객 집중도가 핵심 투자 포인트로 부상, capex와 재무 안정성 병행 점검...",
    newsSource: "SK 공식 IR",
    newsUrl: "https://www.sk.com/",
    thesis: "HBM 프리미엄과 에너지·통신 포트폴리오 재조정",
    evidenceCount: "공식 근거 16건",
    evalStatus: "평가 4/4",
    basis: "DART 2024·IR",
    sourceLine: "SK하이닉스·SK이노베이션·SK㈜·SK텔레콤 DART/IR 기반",
    primaryCompany: "SK하이닉스",
    newsMetrics: [
      { label: "축", value: "HBM" },
      { label: "변수", value: "CAPEX" },
      { label: "점검", value: "고객 집중도" }
    ],
    stockMetrics: [
      { label: "대표", value: "000660" },
      { label: "가격", value: "221,000원" },
      { label: "변화", value: "+2.35%" }
    ],
    financialMetrics: [
      { label: "하이닉스 매출", value: "66.2조" },
      { label: "영업익", value: "23.5조" },
      { label: "전환", value: "흑자" }
    ],
    homeBullets: [
      "SK하이닉스는 2024년 영업손실에서 대규모 영업이익으로 전환된 점이 핵심 기준점입니다.",
      "HBM 프리미엄은 공급능력, 고객 집중도, CAPEX 부담을 함께 놓고 봐야 합니다.",
      "SK이노베이션·SK텔레콤·SK㈜는 포트폴리오 재조정 신호를 계열사별로 분리해 추적합니다."
    ]
  },
  "hyundai-motor": {
    price: "246,500",
    change: "+0.42%",
    revenue: "262.5조",
    operatingProfit: "26.8조",
    margin: "10.2%",
    newsHeadline: "현대차, 하이브리드·전기차 믹스 전환 속도 주목",
    newsBody:
      "북미 판매와 환율, 하이브리드 수요가 단기 실적 방어 변수로 작용, 전동화 투자와 주주환원 정책 추적 필요...",
    newsSource: "현대차 DART",
    newsUrl: "https://dart.fss.or.kr/",
    thesis: "글로벌 판매 믹스와 주주환원 지속성",
    evidenceCount: "공식 근거 6건",
    evalStatus: "평가 3/3",
    basis: "DART 2024",
    sourceLine: "현대차·기아·현대모비스 OpenDART 기반",
    primaryCompany: "현대차",
    newsMetrics: [
      { label: "축", value: "판매 믹스" },
      { label: "변수", value: "환율" },
      { label: "정책", value: "환원" }
    ],
    stockMetrics: [
      { label: "대표", value: "005380" },
      { label: "가격", value: "246,500원" },
      { label: "변화", value: "+0.42%" }
    ],
    financialMetrics: [
      { label: "현대차 매출", value: "175.2조" },
      { label: "영업익", value: "14.2조" },
      { label: "기아 OPM", value: "11.8%" }
    ],
    homeBullets: [
      "현대차·기아는 2024년 매출 규모와 영업이익 수준이 모두 높은 first-slice 기준입니다.",
      "핵심 변수는 하이브리드·전기차 믹스, 북미 판매, 환율 효과, 주주환원 지속성입니다.",
      "현대모비스는 매출보다 영업이익 개선 폭과 부품·전동화 수익성 기여를 분리해 확인합니다."
    ]
  },
  lg: {
    price: "98,700",
    change: "+0.25%",
    revenue: "176.2조",
    operatingProfit: "8.9조",
    margin: "5.1%",
    newsHeadline: "LG, 배터리·전장 수익성 회복 시점 점검",
    newsBody:
      "배터리 수요 둔화와 전장 성장의 속도 차이가 밸류에이션 핵심 변수, 화학·전자 포트폴리오 방어력 확인 필요...",
    newsSource: "LG DART",
    newsUrl: "https://dart.fss.or.kr/",
    thesis: "배터리 사이클 저점 통과와 전장/가전 현금흐름",
    evidenceCount: "공식 근거 6건",
    evalStatus: "평가 3/3",
    basis: "DART 2024",
    sourceLine: "LG전자·LG화학·LG에너지솔루션 OpenDART 기반",
    primaryCompany: "LG전자",
    newsMetrics: [
      { label: "축", value: "전장" },
      { label: "변수", value: "배터리" },
      { label: "점검", value: "화학 마진" }
    ],
    stockMetrics: [
      { label: "대표", value: "066570" },
      { label: "가격", value: "98,700원" },
      { label: "변화", value: "+0.25%" }
    ],
    financialMetrics: [
      { label: "LG전자 매출", value: "87.7조" },
      { label: "영업익", value: "3.4조" },
      { label: "엔솔 매출", value: "25.6조" }
    ],
    homeBullets: [
      "LG전자는 2024년 매출은 증가했지만 영업이익은 소폭 감소해 마진 방어력이 핵심입니다.",
      "LG화학과 LG에너지솔루션은 2024년 매출과 영업이익이 모두 감소해 사이클 회복 신호 확인이 필요합니다.",
      "LG는 전자·배터리·화학의 수익성 회복 시점과 현금흐름 방어력을 계열사별로 나누어 확인해야 합니다."
    ]
  }
};

const paperEnglishSeeds: Record<string, Partial<GroupSeed>> = {
  hanwha: {
    revenue: "74.7T",
    operatingProfit: "4.2T",
    newsHeadline: "Hanwha: rights-issue scrutiny keeps capital allocation in focus",
    newsBody:
      "Regulatory review of Hanwha Solutions' rights issue highlights funding transparency, defense-cycle earnings, and capital discipline as separate monitoring variables.",
    thesis: "Defense-cycle earnings and capital-allocation execution",
    basis: "IR 2025 · DART",
    sourceLine: "Hanwha official IR and OpenDART",
    primaryCompany: "Hanwha Corp."
  },
  samsung: {
    revenue: "300.9T",
    operatingProfit: "32.7T",
    newsHeadline: "Samsung Electronics: HBM supply expansion supports memory recovery thesis",
    newsBody:
      "AI server demand and high-bandwidth memory mix remain key recovery variables; foundry investment pacing should be monitored separately.",
    thesis: "Memory price recovery and HBM competitiveness re-rating",
    basis: "DART 2024 · IR 2026Q1",
    sourceLine: "Samsung Electronics OpenDART and 2026Q1 IR",
    primaryCompany: "Samsung Electronics"
  },
  sk: {
    revenue: "127.5T",
    operatingProfit: "7.8T",
    newsHeadline: "SK Hynix: HBM demand keeps capex and customer concentration in focus",
    newsBody:
      "HBM supply capacity, customer concentration, and capex burden should be read together rather than as a single growth signal.",
    thesis: "HBM premium and energy/telecom portfolio reset",
    basis: "DART 2024 · IR",
    sourceLine: "SK Hynix, SK Innovation, SK Inc., and SK Telecom DART/IR",
    primaryCompany: "SK Hynix"
  },
  "hyundai-motor": {
    revenue: "262.5T",
    operatingProfit: "26.8T",
    newsHeadline: "Hyundai Motor: hybrid and EV mix shift remains the key margin variable",
    newsBody:
      "North America sales, FX, hybrid demand, electrification spend, and shareholder-return execution should be tracked as separate signals.",
    thesis: "Global sales mix and shareholder-return durability",
    basis: "DART 2024",
    sourceLine: "Hyundai Motor, Kia, and Hyundai Mobis OpenDART",
    primaryCompany: "Hyundai Motor"
  },
  lg: {
    revenue: "176.2T",
    operatingProfit: "8.9T",
    newsHeadline: "LG: battery-cycle recovery and vehicle-component margin timing are the key variables",
    newsBody:
      "Battery demand softness and vehicle-component growth move at different speeds; electronics, battery, and chemical cash flows should be separated.",
    thesis: "Battery-cycle trough and electronics cash-flow resilience",
    basis: "DART 2024",
    sourceLine: "LG Electronics, LG Chem, and LG Energy Solution OpenDART",
    primaryCompany: "LG Electronics"
  }
};

export function buildBriefCards(group: GroupProfile, locale: UiLocale = "ko"): BriefCardModel[] {
  const representativeTicker = representativeTickerForGroup(group, locale);
  const representativeCompany = representativeCompanyForGroup(group);
  const companyName = locale === "en"
    ? representativeCompany?.displayName ?? displayGroupName(group, locale)
    : representativeCompany?.koreanName ?? displayGroupName(group, locale);
  const marketUrl = marketSourceUrl(group);
  const marketFooterLeft =
    locale === "en"
      ? `Source: KRX/Naver Finance (${representativeCompany?.krxCode ?? "unverified"})`
      : `출처: KRX/Naver 금융 (${representativeCompany?.krxCode ?? "미검증"})`;
  const financialFooterLeft = locale === "en" ? "Source: DART/OpenDART" : "출처: DART/OpenDART";
  return [
    {
      kind: "news",
      label: locale === "en" ? "News Brief" : "뉴스 브리프",
      meta: locale === "en" ? "connecting · Naver News" : "실시간 연결 중 · Naver 뉴스",
      headline: locale === "en" ? "Loading current news signal" : "최신 뉴스 신호를 불러오는 중",
      body: locale === "en"
        ? "The live briefing will replace this placeholder after the news interface responds."
        : "Naver 뉴스 검색 응답이 도착하면 대표 상장사 관련 공개 뉴스로 교체됩니다.",
      source: locale === "en" ? "News search" : "뉴스 검색",
      sourceUrl: `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(`${companyName} 실적 주가 공시`)}`,
      footerLeft: locale === "en" ? "Naver News search basis" : "Naver 뉴스 검색 기준",
      footerRight: locale === "en" ? "status: connecting" : "상태: 연결 중",
      accent: "green"
    },
    {
      kind: "stock",
      label: locale === "en" ? "Market Brief" : "주가 브리프",
      meta: representativeTicker,
      headline: locale === "en" ? `${companyName} · market data loading` : `${companyName} · 주가 데이터 연결 중`,
      body:
        locale === "en"
          ? "The live briefing will replace this placeholder after the KRX market interface responds."
          : "KRX 가격 응답이 도착하면 헤더 가격과 주가 브리프가 같은 값으로 교체됩니다.",
      source: locale === "en" ? "Market page" : "네이버 금융",
      sourceUrl: marketUrl,
      footerLeft: marketFooterLeft,
      footerRight: locale === "en" ? "status: connecting" : "상태: 연결 중",
      accent: "blue"
    },
    {
      kind: "financial",
      label: locale === "en" ? "Financial Brief" : "재무 브리프",
      meta: locale === "en" ? "connecting · DART" : "실시간 연결 중 · DART",
      headline:
        locale === "en"
          ? `${companyName} · filing data loading`
          : `${companyName} · 공시 데이터 연결 중`,
      body:
        locale === "en"
          ? "The live briefing will replace this placeholder after the DART interface responds."
          : "DART 공시 응답과 source-backed 재무 claim이 도착하면 최신 공시와 재무 근거로 교체됩니다.",
      source: locale === "en" ? "DART filings" : "DART 전자공시",
      sourceUrl: "https://dart.fss.or.kr/",
      footerLeft: financialFooterLeft,
      footerRight: locale === "en" ? "status: connecting" : "상태: 연결 중",
      accent: "orange"
    }
  ];
}

export function buildHomeSnapshot(group: GroupProfile, locale: UiLocale = "ko"): HomeSnapshotModel {
  const seed = localizedSeed(group, locale);
  if (locale === "en") {
    return {
      title: `${displayGroupName(group, locale)} review axes`,
      subtitle: `${seed.primaryCompany} centered · ${seed.sourceLine}`,
      chips: [
        { label: "evidence", value: seed.evidenceCount },
        { label: "coverage", value: `${group.companies.length} companies` },
        { label: "basis", value: seed.basis }
      ],
      bullets: seed.homeBullets,
      footer: "First-screen information separates official evidence from market-support signals."
    };
  }
  return {
    title: `${displayGroupName(group)} 핵심 검토축`,
    subtitle: `${seed.primaryCompany} 중심 · ${seed.sourceLine}`,
    chips: [
      { label: "자료", value: seed.evidenceCount },
      { label: "커버리지", value: `${group.companies.length}개사` },
      { label: "기준", value: seed.basis }
    ],
    bullets: seed.homeBullets,
    footer: "첫 화면 정보는 공식 자료와 시장 보조 신호를 분리해 구성합니다."
  };
}

export function getMarketSnapshot(group: GroupProfile) {
  const seed = groupSeeds[group.id] ?? groupSeeds.hanwha;
  return {
    ...seed,
    price: "연결 중",
    change: ""
  };
}

export function displayGroupName(group: GroupProfile, locale: UiLocale = "ko") {
  if (locale === "en") return group.displayName.replace(/\s+Group$/u, "");
  return group.koreanName.replace(/그룹$/u, "");
}

export function displayCompactGroupName(group: GroupProfile, locale: UiLocale = "ko") {
  if (locale === "en") {
    return {
      "hyundai-motor": "Hyundai"
    }[group.id] ?? displayGroupName(group, locale);
  }
  return {
    "hyundai-motor": "현대차"
  }[group.id] ?? displayGroupName(group);
}

function representativeTickerForGroup(group: GroupProfile, locale: UiLocale = "ko") {
  const company = representativeCompanyForGroup(group);
  if (locale === "en") return company?.krxCode ? `Representative · KRX ${company.krxCode}` : "Representative · unverified";
  return company?.krxCode ? `대표 상장사 · KRX ${company.krxCode}` : "대표 상장사 · 미검증";
}

function representativeCompanyForGroup(group: GroupProfile) {
  return (
    group.companies.find((item) => item.id === group.defaultCompanyId) ??
    group.companies.find((item) => item.listed && item.krxCode)
  );
}

function marketSourceUrl(group: GroupProfile) {
  const company = representativeCompanyForGroup(group);
  return company?.krxCode
    ? `https://finance.naver.com/item/main.naver?code=${company.krxCode}`
    : "https://data.krx.co.kr/";
}

function newsSearchUrl(group: GroupProfile, seed: GroupSeed) {
  const headlineKeywords = seed.newsHeadline
    .replace(/\.\.\..*$/u, "")
    .replace(/[^\w가-힣\s]/gu, " ")
    .split(/\s+/u)
    .filter(Boolean)
    .slice(0, 6)
    .join(" ");
  const seenTerms = new Set<string>();
  const query = [displayGroupName(group), seed.primaryCompany, ...headlineKeywords.split(/\s+/u)]
    .filter((term) => {
      if (!term || seenTerms.has(term)) return false;
      seenTerms.add(term);
      return true;
    })
    .join(" ");
  return `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(query)}`;
}

function conciseNewsBody(seed: GroupSeed) {
  return seed.newsBody.replace(/\.\.\.$/u, "");
}

function formatBasis(basis: string) {
  return basis.replace(/·/gu, " · ");
}

function localizedSeed(group: GroupProfile, locale: UiLocale) {
  const base = groupSeeds[group.id] ?? groupSeeds.hanwha;
  if (locale === "ko") return base;
  const patch = paperEnglishSeeds[group.id] ?? {};
  return {
    ...base,
    ...patch,
    evidenceCount: base.evidenceCount.replace("공식 근거", "source claims").replace("건", ""),
    evalStatus: base.evalStatus.replace("평가", "eval"),
    homeBullets: englishHomeBullets(group.id)
  };
}

function englishHomeBullets(groupId: string) {
  return {
    samsung: [
      "Samsung Electronics' 2024 operating margin recovered sharply from the 2023 trough.",
      "The 2026Q1 IR deck frames HBM4, DDR5, and other AI memory products as key mix-improvement variables.",
      "Memory price recovery, HBM supply competitiveness, and foundry loss reduction should be tracked separately."
    ],
    sk: [
      "SK Hynix turned from operating loss to large operating profit in 2024.",
      "HBM premium should be read together with supply capacity, customer concentration, and capex burden.",
      "SK Innovation, SK Telecom, and SK Inc. should be analyzed as distinct portfolio-reset signals."
    ],
    "hyundai-motor": [
      "Hyundai Motor and Kia provide the OEM profitability anchor for the first slice.",
      "Hybrid/EV mix, North America sales, FX, and shareholder returns are separate monitoring variables.",
      "Hyundai Mobis, Hyundai Glovis, and Hyundai Rotem extend the slice into parts, logistics, and defense/rail exports."
    ],
    lg: [
      "LG Electronics provides the cash-flow anchor while battery and chemical cycles remain separate variables.",
      "LG Chem and LG Energy Solution require cycle-recovery monitoring rather than simple top-line reading.",
      "LG Innotek and LG Uplus add component and telecom cash-flow axes to the first slice."
    ],
    hanwha: [
      "Hanwha Corp. remains the original reference issuer from the PoC reconstruction.",
      "Defense, energy, systems, and ocean/shipbuilding affiliates need company-scoped source packages.",
      "Capital actions should be separated from market-price signals before runtime claim promotion."
    ]
  }[groupId] ?? [];
}
