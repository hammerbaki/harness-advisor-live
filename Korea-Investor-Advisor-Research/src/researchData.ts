import configJson from "../configs/groups.json";
import type { GroupProfile, GroupsConfig, ValidationResult } from "./types";

const rawGroupsConfig = configJson as GroupsConfig;

export const groupsConfig: GroupsConfig = {
  ...rawGroupsConfig,
  groups: [...rawGroupsConfig.groups].sort((a, b) => a.displayOrder - b.displayOrder)
};

export const migrationBuckets = [
  {
    label: "그대로 재활용",
    tone: "green",
    description:
      "검증 후 거의 그대로 사용할 수 있는 구조와 값입니다. 단, 논문 freeze 전 출처 재확인이 필요합니다.",
    items: [
      "한화 계열사 식별자 데이터 모델: company id, KRX code, Yahoo ticker, DART corp code, aliases",
      "schema-first 접근: OpenAPI/Zod/typed client를 우선 설계하는 방식",
      "회귀 테스트를 연구 artifact로 남기는 습관"
    ]
  },
  {
    label: "재사용",
    tone: "blue",
    description:
      "아이디어와 일부 코드는 살리되, 다중 대상/재현성/논문용 평가에 맞게 인터페이스를 다시 잡아야 합니다.",
    items: [
      "DART, KRX/Yahoo, Naver News adapter",
      "date, number, chart placeholder, citation, TTS 관련 deterministic validators",
      "운영 관측성 counters와 regression scenario",
      "상단 group selector를 중심으로 한 advisor shell UI"
    ]
  },
  {
    label: "재작성",
    tone: "amber",
    description:
      "PoC에서는 유용했지만 논문/상용화 경로에서는 구조적 리스크가 큰 영역입니다.",
    items: [
      "거대한 system prompt와 inline RAG",
      "한화 내부자 전용 persona",
      "ACTIVE_ENTITY 단일 전역 상태",
      "single-instance polling turn store",
      "Hanwha/HD-era가 섞인 static IR/orderbook 데이터"
    ]
  },
  {
    label: "보관",
    tone: "slate",
    description:
      "논문 부록이나 개발사 기록에는 쓸 수 있지만 깨끗한 source of truth로 쓰면 안 됩니다.",
    items: [
      "attached_assets/Pasted-* 개발 지시문",
      "screenshots",
      "exports zip/tar archives",
      "mockup sandbox duplicate UI kit"
    ]
  }
];

export const architectureSteps = [
  {
    title: "GroupProfile",
    body:
      "모든 대상별 차이는 config와 wiki namespace에 둡니다. orchestration code에는 Hanwha 전용 분기가 들어가지 않아야 합니다."
  },
  {
    title: "Raw Sources",
    body:
      "DART, IR, KRX, news source manifest는 원본 계층입니다. LLM은 원본을 덮어쓰지 않습니다."
  },
  {
    title: "LLM Wiki",
    body:
      "LLM이 읽기 쉬운 compiled knowledge layer입니다. 모든 material claim은 source trace와 last_checked를 가져야 합니다."
  },
  {
    title: "Deterministic Validators",
    body:
      "날짜, 숫자, 종목코드, citation, chart data, TTS formatting은 prompt가 아니라 코드가 검증합니다."
  },
  {
    title: "Advisor Composer",
    body:
      "LLM은 판단과 서술을 담당합니다. 상태 전이, fallback, schema, 권한, 검증은 시스템이 담당합니다."
  }
];

export const paperPositioning = [
  "Public-data advisor for external investors monitoring Korean conglomerates.",
  "Hanwha is the reference slice, not the final product boundary.",
  "Replit is the live demo path; local/container reproducibility remains the paper artifact path.",
  "The prior SCIE paper is a methodological reference for deployed LLM agents, not finance-domain evidence."
];

export const sampleQuestions = [
  "삼성 최근 투자 포인트를 공시와 뉴스 기준으로 요약해줘",
  "한화 reference slice를 다른 대상에 복제하려면 무엇을 채워야 해?",
  "삼성으로 확장할 때 필요한 데이터 소스를 점검해줘",
  "이 답변의 출처와 검증 단계를 보여줘"
];

export const demoProcessSteps = [
  {
    title: "대상 컨텍스트 확인",
    detail: "선택된 프로필에서 대표 상장사, KRX 코드, DART 코드, wiki namespace를 로딩합니다."
  },
  {
    title: "공개 데이터 수집",
    detail: "DART 공시, KRX/Yahoo 시세, 뉴스 검색, IR source manifest를 tool contract 기준으로 조회합니다."
  },
  {
    title: "LLM Wiki 대조",
    detail: "compiled wiki의 last_checked, stale note, contradiction note를 확인합니다."
  },
  {
    title: "결정론적 검증",
    detail: "날짜, 숫자, 종목코드, citation, chart payload, TTS 표현을 코드 validator로 검사합니다."
  },
  {
    title: "투자자용 답변 합성",
    detail: "LLM은 구조화된 근거 패키지를 바탕으로 요약과 후속 질문을 작성합니다."
  }
];

export const demoLinks = [
  {
    label: "DART 전자공시시스템",
    href: "https://dart.fss.or.kr/"
  },
  {
    label: "KRX 정보데이터시스템",
    href: "https://data.krx.co.kr/"
  },
  {
    label: "Hanwha Group IR",
    href: "https://www.hanwha.com/"
  }
];

export const followUpQuestions = [
  "한화에어로스페이스만 따로 투자 포인트를 정리해줘",
  "최근 공시 중 리스크 신호만 추려줘",
  "삼성 반도체 투자 포인트와 비교해줘",
  "부채와 현금흐름 리스크를 보수적으로 봐줘"
];

export function validateGroup(group: GroupProfile): ValidationResult[] {
  const listed = group.companies.filter((company) => company.listed);
  const dartMissing = listed.filter((company) => !company.dartCode);
  const tickerMissing = listed.filter((company) => !company.krxCode || !company.yahooTicker);
  const duplicateKrx = findDuplicates(listed.map((company) => company.krxCode).filter(Boolean));

  return [
    {
      label: "Group profile",
      status: group.companies.length > 0 ? "pass" : "fail",
      detail: `${group.companies.length} companies configured.`
    },
    {
      label: "Listed tickers",
      status: tickerMissing.length === 0 ? "pass" : "warn",
      detail:
        tickerMissing.length === 0
          ? `${listed.length} listed companies have KRX and Yahoo tickers.`
          : `${tickerMissing.length} listed companies need ticker completion.`
    },
    {
      label: "DART corp codes",
      status: dartMissing.length === 0 ? "pass" : "warn",
      detail:
        dartMissing.length === 0
          ? "All listed companies have DART corp codes in this profile."
          : `${dartMissing.length} listed companies still need DART verification.`
    },
    {
      label: "Duplicate KRX codes",
      status: duplicateKrx.length === 0 ? "pass" : "fail",
      detail:
        duplicateKrx.length === 0
          ? "No duplicate KRX codes detected."
          : `Duplicate KRX codes: ${duplicateKrx.join(", ")}.`
    },
    {
      label: "Source status",
      status: group.status === "source-ready" ? "pass" : "warn",
      detail:
        group.status === "source-ready"
          ? "DART financial claims and document-level URL intake are ready for product-side review."
          : group.sourceStatus === "poc-extracted"
            ? "Extracted from PoC; independent source verification is required before paper freeze."
            : "Seed profile; values are intentionally marked unverified."
    }
  ];
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return Array.from(duplicates);
}
