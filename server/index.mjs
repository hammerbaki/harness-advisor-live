import { createServer } from "node:http";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL("..", import.meta.url)));
loadDotEnv(join(rootDir, ".env"));
const config = normalizeConfig(JSON.parse(await readFile(join(rootDir, "configs/groups.json"), "utf8")));
const promptBlocks = await loadPromptBlocks();
const port = Number(process.env.PORT ?? 8787);
const staticDir = process.env.STATIC_DIR === "" ? "" : join(rootDir, "dist");
const traceSchemaVersion = "advisor-trace.v0.1";
const promptPolicyVersion = "prompt-policy.v0.1";
const wikiContextVersion = "wiki-context.v0.1";
const llmOutputContractVersion = "advisor-llm-output-contract.v0.1";
const promptPolicy = promptBlocks.map((block) => `${block.name}\n${block.text}`).join("\n---\n");
const memoryCacheEnabled = process.env.ADVISOR_DISABLE_MEMORY_CACHE !== "1";
const wikiContextCache = new Map();
const sourceClaimManifestCache = new Map();
const dartDisclosureCache = new Map();
const krxDailyRowsCache = new Map();
const marketSnapshotCache = new Map();
const newsSearchCache = new Map();
const MAX_SELECTED_SOURCE_CLAIMS = 5;

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    if (process.env[key]) continue;
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

const advisorSectionTitles = [
  "핵심 인사이트",
  "왜 중요한가",
  "근거 신호",
  "반증 리스크",
  "다음 관찰 포인트",
  "현황요약",
  "이슈 요약",
  "공시 연결",
  "시장 반응",
  "재무 포인트",
  "산업맥락",
  "사업 파이프라인",
  "가치제고 포인트",
  "주주환원 체크",
  "거버넌스 포인트",
  "공시·IR 체크",
  "브리핑 검토축",
  "확인 우선순위",
  "리스크 체크"
];
const advisorSectionPlans = {
  general: ["핵심 인사이트", "근거 신호", "반증 리스크", "다음 관찰 포인트"],
  financial: ["핵심 인사이트", "재무 포인트", "반증 리스크", "다음 관찰 포인트"],
  pipeline: ["핵심 인사이트", "사업 파이프라인", "반증 리스크", "다음 관찰 포인트"],
  valueUp: ["핵심 인사이트", "주주환원 체크", "반증 리스크", "다음 관찰 포인트"],
  governance: ["핵심 인사이트", "거버넌스 포인트", "반증 리스크", "다음 관찰 포인트"],
  market: ["핵심 인사이트", "시장 반응", "반증 리스크", "다음 관찰 포인트"],
  global: ["핵심 인사이트", "왜 중요한가", "반증 리스크", "다음 관찰 포인트"],
  rival: ["핵심 인사이트", "산업맥락", "반증 리스크", "다음 관찰 포인트"]
};
const llmOutputContract = {
  schemaVersion: llmOutputContractVersion,
  purpose: "Validate only the live LLM composition boundary; routing, claims, links, follow-ups, and trace metadata remain code-owned. The visible answer must be insight-first, not a narration of the analysis process.",
  requiredShape: {
    sections: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      item: {
        title: advisorSectionTitles,
        body: "string or string[]; Korean investor-facing prose only"
      }
    },
    sourceLimitationNote: "optional string when live sources are unavailable or incomplete"
  },
  sectionPlanning: {
    policy: "Choose section titles from the recommended answerPlan in the bounded context when possible; lead with 핵심 인사이트; do not reuse one fixed table of contents for every question.",
    plans: advisorSectionPlans
  },
  audiencePolicy: [
    "The first section must answer what the audience should understand, not what the system just collected.",
    "Use source/process details as supporting evidence only.",
    "Keep analysis process, claim IDs, tool states, and validation details in trace/developer UI.",
    "Use concise professional Korean for investors; avoid pedagogical wording such as how to read the data."
  ],
  codeOwnedFields: [
    "followUps",
    "links",
    "sourceClaims",
    "processTrace",
    "answerAssembly",
    "runtimeMode"
  ],
  disallowedVisibleText: [
    "raw claim ids",
    "fixture labels",
    "trace schema names",
    "prompt/schema/evaluation/debug terms",
    "buy/sell/target-price recommendations"
  ]
};
const visibleAnswerDevLeakPattern = /근거 패키지|이번 답변의 공식 근거|advisor-trace|schemaVersion|processTrace|\bfixture:|\bclaim\b|hanwha-sbc-\d+|evaluation|\bJSON\b|프롬프트|prompt|rubric|eval|논문|영업\s*캡처/iu;
const noviceVisiblePhrasePattern = /어떻게\s*봐야|보는\s*방법|확인해야\s*합니다|봐야\s*합니다|브리핑\s*근거로\s*쓰|쉽습니다/iu;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg"
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    if (url.pathname === "/api/healthz") {
      return sendJson(res, 200, { ok: true, generatedAt: new Date().toISOString() });
    }
    if (url.pathname === "/api/advisor" && req.method === "POST") {
      const body = await readJson(req);
      const result = await runAdvisor(body);
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/api/briefing" && req.method === "GET") {
      const group = findGroup(String(url.searchParams.get("groupId") ?? "samsung"));
      const locale = url.searchParams.get("locale") === "en" ? "en" : "ko";
      const result = await buildBriefingSnapshot(group, locale);
      return sendJson(res, 200, result);
    }
    if (url.pathname.startsWith("/api/traces/") && req.method === "GET") {
      const result = await readTraceExport(url.pathname);
      return sendJson(res, 200, result);
    }
    if (url.pathname === "/api/groups") {
      return sendJson(res, 200, config);
    }
    if (staticDir) return serveStatic(url.pathname, res);
    return sendJson(res, 404, { error: "NOT_FOUND" });
  } catch (error) {
    return sendJson(res, 500, {
      error: "SERVER_ERROR",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`[advisor-api] listening on http://0.0.0.0:${port}`);
  if (memoryCacheEnabled && process.env.ADVISOR_PREWARM !== "0") {
    prewarmRuntimeCaches().catch((error) => {
      console.warn(`[advisor-api] cache prewarm skipped: ${error instanceof Error ? error.message : String(error)}`);
    });
  }
});

async function prewarmRuntimeCaches() {
  await Promise.all(config.groups.map(async (group) => {
    await Promise.all([
      loadWikiContext(group),
      loadSourceBackedClaims(group, "")
    ]);
  }));

  const key = process.env.KRX_API_KEY ?? process.env.KRX_AUTH_KEY;
  if (key) {
    await fetchKrxDailyRows(tradingDateCandidates()[0], key);
  }
}

async function runAdvisor(body) {
  const group = findGroup(String(body?.groupId ?? "samsung"));
  const question = String(body?.question ?? "").trim();
  const presentationMode = body?.presentationMode === "briefing" ? "briefing" : "text";
  const defaultCompany =
    group.companies.find((company) => company.id === group.defaultCompanyId) ??
    group.companies[0];
  const mentionedCompanies = detectMentionedCompanies(group, question);
  const representativeCompany = mentionedCompanies[0] ?? defaultCompany;
  const listedCompany = representativeCompany?.listed && representativeCompany?.krxCode
    ? representativeCompany
    : group.companies.find((company) => company.listed && company.krxCode) ?? representativeCompany;

  const runId = `run_${randomUUID()}`;
  const generatedAt = new Date().toISOString();
  const startedAt = Date.now();
  const traces = [];

  const answerPlan = buildAnswerPlan(question);
  const [
    dartTask,
    marketTask,
    newsTask,
    wikiTask,
    sourceBackedClaimsTask
  ] = await Promise.all([
    tracedTask("dart.disclosures", () => fetchDartDisclosures(representativeCompany)),
    tracedTask("krx.market", () => fetchKrxMarket(listedCompany)),
    tracedTask("news.search", () => searchNews(`${displayGroupName(group)} ${listedCompany.koreanName}`)),
    tracedTask("wiki.context", () => loadWikiContext(group)),
    tracedTask("claims.sourceBacked", () => loadSourceBackedClaims(group, question))
  ]);
  traces.push(
    dartTask.trace,
    marketTask.trace,
    newsTask.trace,
    wikiTask.trace,
    sourceBackedClaimsTask.trace
  );
  const dart = dartTask.output;
  const market = marketTask.output;
  const news = newsTask.output;
  const wiki = wikiTask.output;
  const sourceBackedClaims = sourceBackedClaimsTask.output;

  const contextPackage = {
    group: {
      id: group.id,
      displayName: group.displayName,
      koreanName: group.koreanName,
      wikiNamespace: group.wikiNamespace,
      companyCount: group.companies.length,
      representativeCompanyId: representativeCompany?.id,
      representativeCompanyName: representativeCompany?.koreanName,
      mentionedCompanyIds: mentionedCompanies.map((company) => company.id),
      mentionedCompanyNames: mentionedCompanies.map((company) => company.koreanName)
    },
    question,
    presentationMode,
    answerPlan,
    wiki,
    sourceBackedClaims,
    tools: { dart, market, news },
    promptPolicy: {
      version: promptPolicyVersion,
      blockNames: promptBlocks.map((block) => block.name)
    },
    generatedAt
  };

  const ablation = resolveAblation(body);
  const llm = await traced(traces, "llm.compose", () =>
    composeWithLLM(contextPackage, ablation)
  );
  const answerAssembly = buildAnswerAssembly({
    contextPackage,
    traces,
    llm,
    defaultCompany: representativeCompany,
    listedCompany
  });

  const elapsedMs = Date.now() - startedAt;
  const result = {
    groupId: group.id,
    representativeCompanyId: representativeCompany?.id,
    question,
    mode: llm.mode,
    trace: buildTraceEnvelope({
      runId,
      group,
      representativeCompany,
      question,
      presentationMode,
      traces,
      generatedAt,
      elapsedMs,
      llm
    }),
    answer: llm.answer,
    links: buildLinks(group, dart, market, news, sourceBackedClaims),
    followUps: buildFollowUps(group, listedCompany, question),
    sourceClaims: sourceBackedClaims.selectedClaims ?? [],
    processTrace: traces,
    answerAssembly,
    toolOutputs: {
      dart,
      market,
      news,
      wiki,
      sourceBackedClaims
    },
    elapsedMs
  };

  await persistTraceExport(result);

  return result;
}

async function buildBriefingSnapshot(group, locale = "ko") {
  const representativeCompany = representativeCompanyForGroup(group);
  const [
    dartTask,
    marketTask,
    newsTask,
    claimsTask
  ] = await Promise.all([
    tracedTask("dart.disclosures", () => fetchDartDisclosures(representativeCompany)),
    tracedTask("krx.market", () => fetchKrxMarket(representativeCompany)),
    tracedTask("news.search", () => searchNews(buildBriefingNewsQuery(group, representativeCompany))),
    tracedTask("claims.sourceBacked", () =>
      loadSourceBackedClaims(group, `${representativeCompany?.koreanName ?? displayGroupName(group)} 재무 실적 매출 영업이익`)
    )
  ]);
  const dart = dartTask.output;
  const market = marketTask.output;
  const news = newsTask.output;
  const sourceClaims = claimsTask.output;
  const marketItem = market.items?.[0] ?? {};
  let newsItem = selectBriefingNewsItem(news.items ?? [], group, representativeCompany) ?? {};
  let financialClaim = selectBriefingFinancialClaim(sourceClaims.selectedClaims ?? [], representativeCompany);
  let financialDisclosure = selectBriefingFinancialDisclosure(dart.items ?? []) ?? {};

  let marketPrice = formatMarketPrice(marketItem.close);
  let marketChange = formatMarketChange(marketItem.changePct);
  let marketDateLabel = formatMarketDate(marketItem.date, locale);
  let marketSource = market.source;
  let marketStatus = market.status;
  let stockBody = locale === "en"
    ? `${displayCompanyName(representativeCompany, locale)} price movement is checked with filings, news, and industry signals from the same representative ticker.`
    : `${displayCompanyName(representativeCompany, locale)} 가격 변화를 같은 대표 상장사 기준의 공시·뉴스·업황 신호와 함께 점검합니다.`;
  let newsFooterRight = locale === "en"
    ? (news.status === "live" ? "ranked: latest" : `status: ${news.status}`)
    : (news.status === "live" ? "정렬: 최신순" : `상태: ${news.status}`);
  let financialMetaOverride = "";
  let financialHeadlineOverride = "";
  let financialBodyOverride = "";

  const krxCode = representativeCompany?.krxCode ?? "미검증";
  const marketSourceUrl = representativeCompany?.krxCode
    ? `https://finance.naver.com/item/main.naver?code=${representativeCompany.krxCode}`
    : "https://data.krx.co.kr/";
  let newsSourceLabel = shortSourceLabel(newsItem.url) || (locale === "en" ? "News" : "뉴스");
  const dartSourceUrl = financialDisclosure.url ?? "https://dart.fss.or.kr/";
  const priceHeadline = locale === "en"
    ? `${displayCompanyName(representativeCompany, locale)} · KRW ${marketPrice} (${marketChange})`
    : `${displayCompanyName(representativeCompany, locale)} · ${marketPrice}원 (${marketChange})`;

  const cards = [
    {
      kind: "news",
      label: locale === "en" ? "News Brief" : "뉴스 브리프",
      meta: locale === "en"
        ? `${formatRelativeNewsTime(newsItem.pubDate, locale)} · ${newsSourceLabel}`
        : `${formatRelativeNewsTime(newsItem.pubDate, locale)} · ${newsSourceLabel}`,
      headline: conciseCardText(newsItem.title ?? `${displayCompanyName(representativeCompany, locale)} 주요 뉴스 확인`, 52),
      body: conciseCardText(newsItem.description ?? `${displayCompanyName(representativeCompany, locale)} 관련 최신 공개 뉴스 원문을 확인합니다.`, 92),
      source: newsSourceLabel,
      sourceUrl: newsItem.url ?? `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(buildBriefingNewsQuery(group, representativeCompany))}`,
      footerLeft: locale === "en" ? "Naver News OpenAPI basis" : "Naver 뉴스 검색 기준",
      footerRight: newsFooterRight,
      accent: "green",
      entityCompanyId: representativeCompany?.id
    },
    {
      kind: "stock",
      label: locale === "en" ? "Market Brief" : "주가 브리프",
      meta: locale === "en"
        ? `${marketDateLabel} · KRX ${krxCode}`
        : `${marketDateLabel} · KRX ${krxCode}`,
      headline: priceHeadline,
      body: stockBody,
      source: locale === "en" ? "Naver Finance" : "네이버 금융",
      sourceUrl: marketSourceUrl,
      footerLeft: locale === "en" ? `Source: ${marketSource}` : `출처: ${marketSource}`,
      footerRight: locale === "en" ? `status: ${marketStatus}` : `상태: ${marketStatus}`,
      accent: "blue",
      entityCompanyId: representativeCompany?.id
    },
    {
      kind: "financial",
      label: locale === "en" ? "Financial Brief" : "재무 브리프",
      meta: financialMetaOverride || formatFinancialDisclosureMeta(financialDisclosure, locale),
      headline: conciseCardText(
        financialHeadlineOverride ||
          buildFinancialDisclosureHeadline(representativeCompany, financialDisclosure, financialClaim, locale),
        56
      ),
      body: conciseCardText(financialBodyOverride || (financialClaim?.claimText ?? `${displayCompanyName(representativeCompany, locale)} 최신 공시 본문을 DART에서 직접 확인합니다.`), 100),
      source: locale === "en" ? "DART filings" : "DART 전자공시",
      sourceUrl: financialDisclosure.url ?? financialClaim?.officialSourceUrl ?? financialClaim?.officialDownloadUrl ?? dartSourceUrl,
      footerLeft: locale === "en" ? `Source: ${dart.source}` : `출처: ${dart.source}`,
      footerRight: locale === "en" ? `status: ${dart.status}` : `상태: ${dart.status}`,
      accent: "orange",
      entityCompanyId: representativeCompany?.id
    }
  ];

  return {
    schemaVersion: "advisor-home-briefing.v0.1",
    groupId: group.id,
    representativeCompanyId: representativeCompany?.id,
    generatedAt: new Date().toISOString(),
    market: {
      companyId: representativeCompany?.id,
      price: marketPrice,
      change: marketChange,
      krxCode,
      source: market.source,
      sourceUrl: marketSourceUrl,
      status: market.status
    },
    cards,
    consistencyChecks: [
      {
        name: "header-stock-card-company-match",
        passed: cards[1]?.entityCompanyId === representativeCompany?.id
      },
      {
        name: "header-stock-card-price-match",
        passed: cards[1]?.headline?.includes(marketPrice) && cards[1]?.headline?.includes(marketChange)
      },
      {
        name: "cards-have-source-links",
        passed: cards.every((card) => Boolean(card.sourceUrl))
      }
    ],
    processTrace: [dartTask.trace, marketTask.trace, newsTask.trace, claimsTask.trace]
  };
}

async function traced(traces, label, fn) {
  const task = await tracedTask(label, fn);
  traces.push(task.trace);
  return task.output;
}

async function tracedTask(label, fn) {
  const startedAt = Date.now();
  try {
    const output = await fn();
    return {
      output,
      trace: {
      label,
      status: output.status ?? (output.live ? "live" : "fixture"),
      source: output.source,
      elapsedMs: Date.now() - startedAt,
      summary: output.summary
      }
    };
  } catch (error) {
    const output = {
      live: false,
      status: "error",
      source: "error-fallback",
      summary: `${label} failed; deterministic fallback used.`,
      error: error instanceof Error ? error.message : String(error),
      items: []
    };
    return {
      output,
      trace: {
        label,
        status: "error",
        source: "error-fallback",
        elapsedMs: Date.now() - startedAt,
        summary: error instanceof Error ? error.message : String(error)
      }
    };
  }
}

async function fetchDartDisclosures(company) {
  if (!process.env.DART_API_KEY || !company?.dartCode) {
    return {
      live: false,
      status: "fixture",
      source: "fixture:dart",
      summary: "DART key or corp code is missing; using disclosure fixture.",
      items: [
        {
          reportName: `${company?.koreanName ?? "대상 회사"} 최근 정기공시 확인 필요`,
          receiptDate: "fixture",
          url: "https://dart.fss.or.kr/"
        }
      ]
    };
  }

  const cacheKey = `dart:${company.dartCode}:${dateDaysAgo(120)}`;
  if (memoryCacheEnabled && dartDisclosureCache.has(cacheKey)) {
    const cached = dartDisclosureCache.get(cacheKey);
    return {
      ...cached,
      summary: `${cached.items.length} recent disclosures loaded from DART memory cache.`
    };
  }

  const url = new URL("https://opendart.fss.or.kr/api/list.json");
  url.searchParams.set("crtfc_key", process.env.DART_API_KEY);
  url.searchParams.set("corp_code", company.dartCode);
  url.searchParams.set("bgn_de", dateDaysAgo(120));
  url.searchParams.set("page_count", "5");

  const json = await fetchJson(url, { timeoutMs: 10000 });
  if (json.status && json.status !== "000") {
    throw new Error(`DART_${json.status}: ${json.message ?? "non-000"}`);
  }
  const list = Array.isArray(json.list) ? json.list : [];
  const output = {
    live: true,
    status: "live",
    source: "DART OpenAPI list.json",
    summary: `${list.length} recent disclosures loaded from DART.`,
    items: list.slice(0, 5).map((item) => ({
      reportName: item.report_nm,
      receiptDate: item.rcept_dt,
      url: `https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${item.rcept_no}`
    }))
  };
  if (memoryCacheEnabled) dartDisclosureCache.set(cacheKey, output);
  return output;
}

async function fetchKrxMarket(company) {
  if (!company?.krxCode) {
    return {
      live: false,
      status: "fixture",
      source: "fixture:market",
      summary: "No listed ticker available.",
      items: []
    };
  }

  const marketCacheKey = `market:${company.krxCode}:${latestTradingDate()}:${process.env.KRX_API_KEY || process.env.KRX_AUTH_KEY ? "krx" : "fallback"}`;
  if (memoryCacheEnabled && marketSnapshotCache.has(marketCacheKey)) {
    const cached = marketSnapshotCache.get(marketCacheKey);
    return {
      ...cached,
      summary: `${company.koreanName} market snapshot loaded from memory cache.`
    };
  }

  if (process.env.KRX_API_KEY || process.env.KRX_AUTH_KEY) {
    const key = process.env.KRX_API_KEY ?? process.env.KRX_AUTH_KEY;
    for (const basDd of tradingDateCandidates()) {
      const rows = await fetchKrxDailyRows(basDd, key);
      const row = rows.find((r) => krxShortCode(r) === company.krxCode);
      if (row) {
        const output = {
          live: true,
          status: "live",
          source: "KRX stk_bydd_trd",
          summary: `${company.koreanName} KRX EOD row loaded for ${row.BAS_DD}.`,
          items: [
            {
              ticker: company.krxCode,
              date: row.BAS_DD,
              close: row.TDD_CLSPRC,
              changePct: row.FLUC_RT,
              marketCap: row.MKTCAP
            }
          ]
        };
        if (memoryCacheEnabled) marketSnapshotCache.set(marketCacheKey, output);
        return output;
      }
    }
  }

  const yahooUrl = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${company.yahooTicker}`);
  yahooUrl.searchParams.set("range", "5d");
  yahooUrl.searchParams.set("interval", "1d");
  const yahoo = await fetchJson(yahooUrl, { timeoutMs: 10000 });
  const result = yahoo.chart?.result?.[0];
  const meta = result?.meta;
  const quote = result?.indicators?.quote?.[0];
  const closes = quote?.close?.filter((v) => typeof v === "number") ?? [];
  const close = closes.at(-1) ?? meta?.regularMarketPrice ?? null;
  const output = {
    live: true,
    status: "fallback",
    source: "Yahoo Finance fallback for market price",
    summary: `${company.koreanName} market snapshot loaded via Yahoo fallback.`,
    items: [
      {
        ticker: company.yahooTicker,
        close,
        currency: meta?.currency ?? "KRW",
        exchange: meta?.exchangeName ?? "KSC"
      }
    ]
  };
  if (memoryCacheEnabled) marketSnapshotCache.set(marketCacheKey, output);
  return output;
}

async function fetchKrxDailyRows(basDd, key) {
  const cacheKey = `krx-daily:${basDd}`;
  if (memoryCacheEnabled && krxDailyRowsCache.has(cacheKey)) {
    return krxDailyRowsCache.get(cacheKey);
  }
  const url = new URL("https://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd");
  url.searchParams.set("basDd", basDd);
  const json = await fetchJson(url, {
    timeoutMs: 10000,
    headers: { AUTH_KEY: key, Accept: "application/json" }
  });
  const rows = Array.isArray(json.OutBlock_1) ? json.OutBlock_1 : [];
  if (memoryCacheEnabled) krxDailyRowsCache.set(cacheKey, rows);
  return rows;
}

function krxShortCode(row) {
  return String(row.ISU_SRT_CD ?? row.ISU_CD ?? row.SHRT_CODE ?? "")
    .replace(/[^0-9]/gu, "")
    .padStart(6, "0");
}

function tradingDateCandidates() {
  const start = latestTradingDate();
  const year = Number(start.slice(0, 4));
  const month = Number(start.slice(4, 6)) - 1;
  const day = Number(start.slice(6, 8));
  const cursor = new Date(Date.UTC(year, month, day));
  const dates = [];
  while (dates.length < 7) {
    const dayOfWeek = cursor.getUTCDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(
        `${cursor.getUTCFullYear()}${String(cursor.getUTCMonth() + 1).padStart(2, "0")}${String(cursor.getUTCDate()).padStart(2, "0")}`
      );
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return dates;
}

async function searchNews(query) {
  if (!process.env.NAVER_CLIENT_ID || !process.env.NAVER_CLIENT_SECRET) {
    return {
      live: false,
      status: "fixture",
      source: "fixture:news",
      summary: "Naver News credentials are missing; using news fixture.",
      items: [
        {
          title: `${query} 공개 뉴스 검색 연결 예정`,
          publisher: "fixture",
          url: "https://search.naver.com/search.naver?where=news"
        }
      ]
    };
  }
  const cacheKey = `news:${query}`;
  if (memoryCacheEnabled && newsSearchCache.has(cacheKey)) {
    const cached = newsSearchCache.get(cacheKey);
    return {
      ...cached,
      summary: `${cached.items.length} recent news items loaded from memory cache.`
    };
  }
  const url = new URL("https://openapi.naver.com/v1/search/news.json");
  url.searchParams.set("query", query);
  url.searchParams.set("display", "10");
  url.searchParams.set("sort", "date");
  const json = await fetchJson(url, {
    timeoutMs: 10000,
    headers: {
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
      Accept: "application/json"
    }
  });
  const items = Array.isArray(json.items) ? json.items : [];
  const output = {
    live: true,
    status: "live",
    source: "Naver News OpenAPI",
    summary: `${items.length} recent news items loaded from Naver.`,
    items: items.slice(0, 5).map((item) => ({
      title: stripHtml(item.title ?? ""),
      description: stripHtml(item.description ?? ""),
      url: item.originallink || item.link,
      pubDate: item.pubDate
    }))
  };
  if (memoryCacheEnabled) newsSearchCache.set(cacheKey, output);
  return output;
}

async function loadPromptBlocks() {
  const blockNames = [
    "advisor-role.md",
    "evidence-policy.md",
    "output-style.md"
  ];
  const blocks = [];
  for (const name of blockNames) {
    const path = join(rootDir, "prompts", name);
    const text = existsSync(path)
      ? await readFile(path, "utf8")
      : fallbackPromptBlock(name);
    blocks.push({ name, text: text.trim() });
  }
  return blocks;
}

function fallbackPromptBlock(name) {
  return {
    "advisor-role.md": "You are a public-data Korean conglomerate investor advisor research assistant.",
    "evidence-policy.md": "Use only the bounded JSON context supplied by the runtime.",
    "output-style.md": "Write concise Korean prose for a mobile advisor UI."
  }[name] ?? "";
}

async function loadWikiContext(group) {
  const namespace = group.wikiNamespace;
  if (memoryCacheEnabled && wikiContextCache.has(namespace)) {
    const cached = wikiContextCache.get(namespace);
    return {
      ...cached,
      summary: `${cached.pages.length} compiled wiki pages loaded from ${namespace} memory cache.`
    };
  }
  const namespacePath = join(rootDir, "wiki", namespace);
  if (!existsSync(namespacePath)) {
    return {
      live: false,
      status: "fixture",
      source: "wiki:missing",
      version: wikiContextVersion,
      namespace,
      summary: `${namespace} has no compiled wiki directory yet.`,
      pages: []
    };
  }

  const pages = await readWikiMarkdownPages(namespacePath, namespacePath);
  if (pages.length === 0) {
    return {
      live: false,
      status: "fixture",
      source: "wiki:empty",
      version: wikiContextVersion,
      namespace,
      summary: `${namespace} has no compiled wiki pages yet.`,
      pages: []
    };
  }

  const output = {
    live: false,
    status: "local",
    source: "wiki:markdown",
    version: wikiContextVersion,
    namespace,
    summary: `${pages.length} compiled wiki pages loaded from ${namespace}.`,
    pages: pages.slice(0, 8)
  };
  if (memoryCacheEnabled) wikiContextCache.set(namespace, output);
  return output;
}

async function loadSourceBackedClaims(group, question) {
  const manifestPath = join(rootDir, "raw", "manifests", `${group.id}.source-backed-claims.json`);
  if (!existsSync(manifestPath)) {
    return {
      live: false,
      status: "local",
      source: "source-backed-claims:missing",
      summary: `${displayGroupName(group)} has no source-backed claim manifest yet.`,
      manifestPath: relativeProjectPath(manifestPath),
      totalClaims: 0,
      selectedClaims: []
    };
  }

  const manifest = await readSourceBackedClaimManifest(manifestPath);
  const records = Array.isArray(manifest.records) ? manifest.records : [];
  const selectedClaims = selectClaimsForQuestion(records, question, group).map(toRuntimeClaim);

  return {
    live: false,
    status: "local",
    source: `source-backed-claims:${group.id}`,
    summary: `${records.length} source-backed seed claims available; ${selectedClaims.length} selected for this question.`,
    schemaVersion: manifest.schemaVersion,
    manifestPath: relativeProjectPath(manifestPath),
    generatedAt: manifest.generatedAt,
    totalClaims: records.length,
    selectedClaims
  };
}

async function readSourceBackedClaimManifest(manifestPath) {
  if (memoryCacheEnabled && sourceClaimManifestCache.has(manifestPath)) {
    return sourceClaimManifestCache.get(manifestPath);
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (memoryCacheEnabled) sourceClaimManifestCache.set(manifestPath, manifest);
  return manifest;
}

async function readWikiMarkdownPages(dir, baseDir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      pages.push(...await readWikiMarkdownPages(path, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const raw = await readFile(path, "utf8");
      const parsed = parseWikiPage(raw);
      pages.push({
        path: path.slice(baseDir.length + 1),
        title: parsed.frontMatter.title ?? entry.name.replace(/\.md$/u, ""),
        sourceStatus: parsed.frontMatter.source_status ?? "draft",
        lastChecked: parsed.frontMatter.last_checked ?? "",
        confidence: parsed.frontMatter.confidence ?? "low",
        excerpt: parsed.body.replace(/\s+/gu, " ").trim().slice(0, 700)
      });
    }
  }
  return pages.sort((a, b) => a.path.localeCompare(b.path));
}

function parseWikiPage(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u);
  if (!match) return { frontMatter: {}, body: raw };
  const frontMatter = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^"|"$/gu, "");
    frontMatter[key] = value;
  }
  return { frontMatter, body: match[2] };
}

function buildAnswerPlan(question) {
  const intent = classifyAnswerIntent(question);
  return {
    intent,
    recommendedSections: advisorSectionPlans[intent] ?? advisorSectionPlans.general,
    variationPolicy: "Keep source and safety rules fixed, but adapt section titles and emphasis to the user's question."
  };
}

function classifyAnswerIntent(question) {
  const value = String(question ?? "");
  if (/재무|실적|매출|영업이익|영업이익률|순이익|부채|현금흐름|가치투자/u.test(value)) return "financial";
  if (/기업가치|밸류|주주환원|배당|자사주|ROE|roe|자본배분/u.test(value)) return "valueUp";
  if (/수주|BNCP|건설|파이프라인|질산|사업/u.test(value)) return "pipeline";
  if (/공시관리|거버넌스|지배|IR|ir|소통/u.test(value)) return "governance";
  if (/경쟁|경쟁사|동종|비교/u.test(value)) return "rival";
  if (/국제|미국|중국|유럽|중동|환율|금리|공급망|지정학/u.test(value)) return "global";
  if (/주가|가격|시장|수급|외인|기관|변동/u.test(value)) return "market";
  return "general";
}

async function composeWithLLM(contextPackage, ablation = resolveAblation()) {
  const requestedProvider = normalizeLLMProvider(process.env.ADVISOR_LIVE_LLM_PROVIDER ?? process.env.LLM_PROVIDER);
  const provider = requestedProvider ?? firstConfiguredLLMProvider();
  if (!provider) {
    return deterministicAnswer(contextPackage, "fixture");
  }
  const model = llmModelForProvider(provider);
  const apiKey = llmApiKeyForProvider(provider);
  const compositionProcess = [];
  if (!apiKey) {
    compositionProcess.push({
      stage: "credential_check",
      status: "fail",
      reason: "missing_api_key",
      provider,
      model
    });
    compositionProcess.push({
      stage: "recovery",
      status: "used",
      method: "deterministic_composer",
      reason: "missing_credentials"
    });
    const fallback = deterministicAnswer(contextPackage, "live-llm-missing-credentials-fallback");
    return {
      ...fallback,
      status: "fallback",
      provider,
      model,
      source: `${llmProviderLabel(provider)} + deterministic-composer`,
      summary: `Live LLM credentials missing for ${provider}; deterministic composer used.`,
      outputContract: {
        version: llmOutputContractVersion,
        status: "missing_credentials",
        errors: [`Missing API key for provider: ${provider}`],
        process: compositionProcess
      }
    };
  }
  compositionProcess.push({
    stage: "credential_check",
    status: "pass",
    provider,
    model,
    temperature: llmTemperature()
  });

  const prompt = [
    promptPolicy,
    "The runtime will attach execution-mode, links, follow-up questions, and trace metadata in code.",
    "Lead with audience-facing investment understanding. Do not present the analysis process as the result.",
    "Return only a JSON object that follows the LLM output contract. Do not wrap it in Markdown fences.",
    "The JSON object MUST have a top-level sections array. Each section item MUST have a title and a body.",
    "Example shape: {\"sections\":[{\"title\":\"핵심 인사이트\",\"body\":[\"one investor-facing sentence\"]},{\"title\":\"재무 포인트\",\"body\":[\"one investor-facing sentence\"]},{\"title\":\"반증 리스크\",\"body\":[\"one investor-facing sentence\"]}],\"sourceLimitationNote\":\"optional\"}",
    "Do not invent unavailable sources, raw claim ids, trace labels, schema names, or investment recommendations.",
    "When the selected source-backed claims come from DART or OpenDART, include the visible term OpenDART at least once in the answer body.",
    "Use a concise professional investor memo tone. Do not explain how to read basic data, and do not mention paper, demo, capture, or development workflow.",
    "",
    "LLM output contract:",
    JSON.stringify(llmOutputContract, null, 2),
    "",
    "Bounded context package:",
    "",
    JSON.stringify(contextPackage, null, 2)
  ].join("\n");

  let text = "";
  try {
    text = await callLiveLLMProvider({ provider, model, apiKey, prompt });
    compositionProcess.push({
      stage: "live_llm_call",
      status: "pass",
      liveOutput: summarizeLiveLLMOutput(text)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    compositionProcess.push({
      stage: "live_llm_call",
      status: "fail",
      reason: "provider_call_error",
      error: message
    });
    compositionProcess.push({
      stage: "recovery",
      status: "used",
      method: "deterministic_composer",
      reason: "provider_call_error"
    });
    const fallback = deterministicAnswer(contextPackage, "live-llm-error-fallback");
    return {
      ...fallback,
      status: "fallback",
      provider,
      model,
      source: `${llmProviderLabel(provider)} + deterministic-composer`,
      summary: `Live LLM call failed; deterministic composer used. ${message}`,
      outputContract: {
        version: llmOutputContractVersion,
        status: "fallback",
        errors: [message],
        process: compositionProcess
      }
    };
  }

  const structured = parseStructuredLLMOutput(text);
  compositionProcess.push({
    stage: "json_parse",
    status: structured && typeof structured === "object" && !Array.isArray(structured) ? "pass" : "fail",
    reason: structured && typeof structured === "object" && !Array.isArray(structured)
      ? undefined
      : "not_json_object"
  });

  const validation = validateStructuredAdvisorOutput(structured, contextPackage);

  if (ablation === "prompt-only") {
    // Ablation C3: the code-owned output-contract gate and deterministic
    // fallback are disabled, so the live model's output reaches the reader
    // unguarded. The validation result is still recorded for reporting, but it
    // no longer changes the answer. Downstream contract checks then run on
    // ungated output — this is the counterfactual the ablation measures.
    const rawAnswer = structured && typeof structured === "object" && !Array.isArray(structured)
      ? renderStructuredAdvisorOutput(structured)
      : String(text ?? "");
    compositionProcess.push({
      stage: "output_contract_validation",
      status: validation.passed ? "pass" : "fail",
      ablationBypassed: true,
      errorCount: validation.errors.length,
      errors: validation.errors.slice(0, 8)
    });
    compositionProcess.push({ stage: "recovery", status: "disabled_by_ablation" });
    return {
      mode: "prompt-only-raw",
      live: true,
      status: "live",
      provider,
      model,
      ablation: "prompt-only",
      source: llmProviderLabel(provider),
      summary: "Prompt-only ablation: live output passed through without code-owned contract enforcement.",
      outputContract: {
        version: llmOutputContractVersion,
        status: validation.passed ? "validated" : "ungated_failure",
        errors: validation.errors.slice(0, 8),
        process: compositionProcess,
        liveOutput: summarizeLiveLLMOutput(text)
      },
      answer: finalizeAdvisorAnswer(rawAnswer)
    };
  }

  if (validation.passed) {
    compositionProcess.push({
      stage: "output_contract_validation",
      status: "pass",
      errorCount: 0
    });
    compositionProcess.push({
      stage: "recovery",
      status: "not_needed"
    });
    return {
      mode: "live-llm-structured",
      live: true,
      status: "live",
      provider,
      model,
      source: llmProviderLabel(provider),
      summary: "LLM composed structured answer that passed the code-owned output contract.",
      outputContract: {
        version: llmOutputContractVersion,
        status: "validated",
        errors: [],
        process: compositionProcess,
        liveOutput: summarizeLiveLLMOutput(text)
      },
      answer: finalizeAdvisorAnswer(renderStructuredAdvisorOutput(structured))
    };
  }

  compositionProcess.push({
    stage: "output_contract_validation",
    status: "fail",
    errorCount: validation.errors.length,
    errors: validation.errors.slice(0, 8)
  });
  compositionProcess.push({
    stage: "recovery",
    status: "used",
    method: "deterministic_composer",
    reason: "output_contract_failure"
  });
  const fallback = deterministicAnswer(contextPackage, "live-llm-contract-fallback");
  return {
    ...fallback,
    status: "fallback",
    provider,
    model,
    source: `${llmProviderLabel(provider)} + deterministic-composer`,
    summary: `Live LLM output failed the output contract; deterministic composer used. ${validation.errors.slice(0, 2).join(" ")}`,
    outputContract: {
      version: llmOutputContractVersion,
      status: "fallback",
      errors: validation.errors.slice(0, 8),
      process: compositionProcess,
      liveOutput: summarizeLiveLLMOutput(text)
    }
  };
}

function normalizeAblation(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (["prompt-only", "promptonly", "c3"].includes(normalized)) return "prompt-only";
  if (["harness", "c0", "full"].includes(normalized)) return "harness";
  return null;
}

// Ablation condition for the composition boundary. A per-request body.ablation
// wins over the ADVISOR_ABLATION env var; the default "harness" path is the
// unchanged production behavior.
function resolveAblation(body) {
  return normalizeAblation(body?.ablation) ?? normalizeAblation(process.env.ADVISOR_ABLATION) ?? "harness";
}

function normalizeLLMProvider(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized) return null;
  if (["anthropic", "claude"].includes(normalized)) return "anthropic";
  if (["openai", "gpt"].includes(normalized)) return "openai";
  if (["gemini", "google"].includes(normalized)) return "gemini";
  if (["openrouter", "router"].includes(normalized)) return "openrouter";
  return null;
}

function firstConfiguredLLMProvider() {
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return "gemini";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  return null;
}

function llmApiKeyForProvider(provider) {
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY;
  if (provider === "openai") return process.env.OPENAI_API_KEY;
  if (provider === "gemini") return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY;
  if (provider === "openrouter") return process.env.OPENROUTER_API_KEY;
  return "";
}

function llmModelForProvider(provider) {
  if (process.env.ADVISOR_LIVE_LLM_MODEL) return process.env.ADVISOR_LIVE_LLM_MODEL;
  if (provider === "anthropic") return process.env.ANTHROPIC_MODEL ?? process.env.LLM_MODEL ?? "claude-sonnet-4-5";
  if (provider === "openai") return process.env.OPENAI_MODEL ?? process.env.LLM_MODEL ?? "gpt-4.1-mini";
  if (provider === "gemini") return process.env.GEMINI_MODEL ?? process.env.LLM_MODEL ?? "gemini-2.5-flash";
  if (provider === "openrouter") return process.env.OPENROUTER_MODEL ?? process.env.LLM_MODEL ?? "anthropic/claude-sonnet-4";
  return process.env.LLM_MODEL ?? "unknown";
}

function llmTemperature() {
  const raw = process.env.ADVISOR_LIVE_LLM_TEMPERATURE ?? process.env.LLM_TEMPERATURE ?? "0.2";
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0.2;
}

function llmProviderLabel(provider) {
  if (provider === "anthropic") return "Anthropic Messages API";
  if (provider === "openai") return "OpenAI Responses API";
  if (provider === "gemini") return "Google Gemini API";
  if (provider === "openrouter") return "OpenRouter Chat Completions API";
  return "Live LLM API";
}

function summarizeLiveLLMOutput(text) {
  const raw = String(text ?? "");
  const summary = {
    sha256: sha256(raw),
    charCount: raw.length,
    preview: raw.slice(0, 500)
  };
  if (process.env.ADVISOR_LIVE_LLM_STORE_RAW_OUTPUT === "1") {
    summary.raw = raw;
  }
  return summary;
}

async function callLiveLLMProvider({ provider, model, apiKey, prompt }) {
  const temperature = llmTemperature();
  if (provider === "anthropic") {
    const res = await fetchJson("https://api.anthropic.com/v1/messages", {
      timeoutMs: 30000,
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: 900,
        temperature,
        messages: [{ role: "user", content: prompt }]
      })
    });
    return res.content?.map((part) => part.text ?? "").join("\n").trim() ?? "";
  }

  if (provider === "openai") {
    const res = await fetchJson("https://api.openai.com/v1/responses", {
      timeoutMs: 30000,
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        input: prompt,
        max_output_tokens: 900,
        temperature
      })
    });
    if (typeof res.output_text === "string") return res.output_text.trim();
    return (res.output ?? [])
      .flatMap((item) => item.content ?? [])
      .map((part) => part.text ?? "")
      .join("\n")
      .trim();
  }

  if (provider === "gemini") {
    const encodedModel = encodeURIComponent(model);
    const res = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodedModel}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      timeoutMs: 30000,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 900,
          temperature
        }
      })
    });
    return (res.candidates ?? [])
      .flatMap((candidate) => candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("\n")
      .trim();
  }

  if (provider === "openrouter") {
    const res = await fetchJson("https://openrouter.ai/api/v1/chat/completions", {
      timeoutMs: 30000,
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
        "http-referer": "https://github.com/hammerbaki/enterprise-llm-agent-harness",
        "x-title": "Enterprise LLM Agent Harness"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 900,
        temperature
      })
    });
    return res.choices?.map((choice) => choice.message?.content ?? "").join("\n").trim() ?? "";
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}

function deterministicAnswer(contextPackage, mode) {
  const answer = composeDeterministicInvestorAnswer(contextPackage);
  return {
    mode,
    live: false,
    status: "fixture",
    provider: "deterministic",
    model: null,
    source: "deterministic-composer",
    summary: "Investor-facing answer composed from bounded source claims.",
    outputContract: {
      version: llmOutputContractVersion,
      status: "code",
      errors: []
    },
    answer: finalizeAdvisorAnswer(answer)
  };
}

function parseStructuredLLMOutput(text) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const withoutFence = raw
    .replace(/^```(?:json)?\s*/iu, "")
    .replace(/\s*```$/u, "")
    .trim();
  const firstBrace = withoutFence.indexOf("{");
  const lastBrace = withoutFence.lastIndexOf("}");
  const candidate = firstBrace >= 0 && lastBrace > firstBrace
    ? withoutFence.slice(firstBrace, lastBrace + 1)
    : withoutFence;
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function validateStructuredAdvisorOutput(value, contextPackage) {
  const errors = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { passed: false, errors: ["LLM output is not a JSON object."] };
  }

  const sections = value.sections;
  if (!Array.isArray(sections)) {
    errors.push("sections must be an array.");
  } else {
    if (sections.length < 3) errors.push("sections must include at least three sections.");
    if (sections.length > 6) errors.push("sections must not exceed six sections.");
    const titles = new Set();
    for (const [index, section] of sections.entries()) {
      if (!section || typeof section !== "object" || Array.isArray(section)) {
        errors.push(`sections[${index}] must be an object.`);
        continue;
      }
      const title = String(section.title ?? "").trim();
      if (!advisorSectionTitles.includes(title)) {
        errors.push(`sections[${index}].title is not an allowed investor briefing title.`);
      }
      if (titles.has(title)) errors.push(`duplicate section title: ${title}`);
      titles.add(title);
      const lines = normalizeStructuredBody(section.body);
      if (lines.length === 0) {
        errors.push(`sections[${index}].body is empty.`);
      }
      for (const line of lines) {
        if (line.length > 360) errors.push(`sections[${index}].body line is too long.`);
        if (visibleAnswerDevLeakPattern.test(line)) {
          errors.push(`sections[${index}].body contains developer-facing text.`);
        }
        if (noviceVisiblePhrasePattern.test(line)) {
          errors.push(`sections[${index}].body contains novice-facing explanatory wording.`);
        }
        if (/매수|매도|목표가|투자의견\s*상향|투자의견\s*하향/u.test(line)) {
          errors.push(`sections[${index}].body contains recommendation-style language.`);
        }
      }
    }
    const recommendedTitles = contextPackage.answerPlan?.recommendedSections ?? [];
    const recommendedMatches = recommendedTitles.filter((title) => titles.has(title)).length;
    if (recommendedTitles.length > 0 && recommendedMatches < Math.min(2, recommendedTitles.length)) {
      errors.push("sections do not sufficiently match the question-specific answer plan.");
    }
    const firstTitle = String(sections[0]?.title ?? "").trim();
    if (firstTitle !== "핵심 인사이트") {
      errors.push("first section must be 핵심 인사이트.");
    }
    const firstBody = normalizeStructuredBody(sections[0]?.body).join(" ");
    if (/(수집했|조회했|로드했|검증했|trace|프로세스|분석 과정|근거 패키지)/iu.test(firstBody.slice(0, 180))) {
      errors.push("first section reads like process narration instead of audience-facing insight.");
    }
  }

  const note = String(value.sourceLimitationNote ?? "").trim();
  if (note && (note.length > 260 || visibleAnswerDevLeakPattern.test(note))) {
    errors.push("sourceLimitationNote is too long or developer-facing.");
  }
  if (sourceLimitationRequired(contextPackage)) {
    const visibleText = [
      ...(Array.isArray(sections)
        ? sections.flatMap((section) => normalizeStructuredBody(section?.body))
        : []),
      note
    ].join(" ");
    if (!/(실시간|연결 전|재확인|보조|제한|공식|확인)/u.test(visibleText)) {
      errors.push("source limitation must be visible when live sources are incomplete.");
    }
  }

  return { passed: errors.length === 0, errors };
}

function sourceLimitationRequired(contextPackage) {
  return Object.values(contextPackage.tools ?? {}).some((tool) =>
    ["fixture", "fallback", "error"].includes(tool?.status)
  );
}

function normalizeStructuredBody(body) {
  const values = Array.isArray(body) ? body : [body];
  return values
    .map((line) => String(line ?? "").trim())
    .filter(Boolean);
}

function renderStructuredAdvisorOutput(value) {
  const sections = Array.isArray(value?.sections) ? value.sections : [];
  const note = String(value?.sourceLimitationNote ?? "").trim();
  const normalizedSections = sections.map((section) => ({
    title: section.title,
    lines: normalizeStructuredBody(section.body)
  }));

  if (note) {
    const targetIndex = normalizedSections.findIndex((section) =>
      section.title === "다음 관찰 포인트" || section.title === "확인 우선순위"
    );
    if (targetIndex >= 0 && !normalizedSections[targetIndex].lines.includes(note)) {
      normalizedSections[targetIndex].lines.push(note);
    } else if (normalizedSections.length < 6) {
      normalizedSections.push({ title: "다음 관찰 포인트", lines: [note] });
    } else if (normalizedSections.length > 0 && !normalizedSections.at(-1).lines.includes(note)) {
      normalizedSections.at(-1).lines.push(note);
    }
  }

  return normalizedSections
    .map((section) => formatAnswerSection(section.title, section.lines))
    .filter(Boolean)
    .join("\n\n");
}

function composeDeterministicInvestorAnswer(contextPackage) {
  const groupLabel = displayGroupName(contextPackage.group);
  const subjectLabel = answerSubjectLabel(contextPackage);
  const question = String(contextPackage.question ?? "");
  const answerIntent = contextPackage.answerPlan?.intent ?? classifyAnswerIntent(question);
  const recommendedSections = contextPackage.answerPlan?.recommendedSections ?? advisorSectionPlans[answerIntent] ?? advisorSectionPlans.general;
  const claims = contextPackage.sourceBackedClaims?.selectedClaims ?? [];
  const market = contextPackage.tools?.market?.items?.[0];
  const news = contextPackage.tools?.news;
  const disclosure = contextPackage.tools?.dart?.items?.[0];

  const financialClaims = claims.filter((claim) => claim.claimType.includes("financial"));
  const valueUpClaims = claims.filter((claim) =>
    /value|capital|shareholder/u.test(claim.claimType)
  );
  const businessClaims = claims.filter((claim) =>
    /business/u.test(claim.claimType) && !claim.claimType.includes("financial")
  );
  const governanceClaims = claims.filter((claim) =>
    /governance|communication/u.test(claim.claimType)
  );

  const isFinancialQuestion = /재무|실적|매출|영업|이익|부채|현금흐름|가치투자/u.test(question);
  const isGovernanceQuestion = /공시관리|지배|거버넌스|ir\s*활동|ir\s*소통|IR\s*소통|소통\s*체계|governance/u.test(question);
  const isValueUpQuestion = /기업가치|가치\s*제고|밸류|value|주주환원|roe|배당|자사주/u.test(question);
  const financialSnapshot = buildFinancialSnapshot(claims);
  const sections = [];
  const sectionTitle = (fallback, index) => recommendedSections[index] ?? fallback;

  const insight = [];
  if (financialSnapshot.latest && financialSnapshot.previous) {
    insight.push(`${subjectLabel}의 재무 초점은 매출 성장보다 영업이익률 회복 폭과 지속성입니다. ${financialSnapshot.latest.year}년 영업이익률은 ${formatPct(financialSnapshot.latest.operatingMarginPct)}로 전년 ${formatPct(financialSnapshot.previous.operatingMarginPct)} 대비 크게 개선됐습니다.`);
  } else if (financialSnapshot.latest) {
    insight.push(`${subjectLabel}의 재무 초점은 매출 규모보다 ${financialSnapshot.latest.year}년 영업이익률 ${formatPct(financialSnapshot.latest.operatingMarginPct)}의 지속성입니다.`);
  } else if (financialClaims[0]) {
    insight.push(`${subjectLabel}의 투자 포인트는 성장 수치보다 수익성, 현금흐름, 자본배분으로 이어지는 경로입니다.`);
  } else {
    insight.push(`${subjectLabel}의 투자 포인트는 현재 확보된 공식 자료 범위와 미확정 항목을 분리하는 데 있습니다.`);
  }
  if (valueUpClaims[0]) {
    insight.push("주주환원·ROE 개선 계획은 반복 가능한 실행 공시와 현금흐름이 동반될 때 밸류에이션 근거가 강화됩니다.");
  }
  if (!isFinancialQuestion && !isValueUpQuestion && !isGovernanceQuestion) {
    insight.push("실적, 사업 파이프라인, 시장 반응은 서로 다른 속도의 신호로 분리해 해석합니다.");
  }
  if (isGovernanceQuestion) {
    insight.push(`${subjectLabel}의 거버넌스 포인트는 제도 존재보다 정보 비대칭을 줄이는 반복 가능한 공시·IR 접점입니다.`);
  }
  sections.push(formatAnswerSection(sectionTitle("핵심 인사이트", 0), insight.join(" ")));

  if (financialClaims.length > 0) {
    const financialPoints = buildFinancialSectionPoints({
      financialClaims,
      financialSnapshot,
      question,
      isFinancialQuestion
    });
    const financialTitle = answerIntent === "financial" ? sectionTitle("재무 포인트", 1) : "근거 신호";
    sections.push(formatAnswerSection(financialTitle, financialPoints));
  }

  if (businessClaims.length > 0) {
    const businessPoints = businessClaims.slice(0, 2).map((claim) => stripFinalPunctuation(claim.claimText));
    businessPoints.push("사업 포트폴리오와 파이프라인의 투자 의미는 매출 전환 속도와 마진 기여도에 좌우됩니다.");
    const businessTitle = answerIntent === "pipeline" ? sectionTitle("사업 파이프라인", 1) : answerIntent === "rival" ? sectionTitle("산업맥락", 1) : "왜 중요한가";
    sections.push(formatAnswerSection(businessTitle, businessPoints));
  }

  if (governanceClaims.length > 0 && isGovernanceQuestion) {
    const governancePoints = governanceClaims.slice(0, 2).map((claim) => stripFinalPunctuation(claim.claimText));
    governancePoints.push("핵심 변수는 공시 주기, 책임 주체, 투자자 질의 대응 기록의 반복성입니다.");
    sections.push(formatAnswerSection(sectionTitle("거버넌스 포인트", 1), governancePoints));
  }

  if (valueUpClaims.length > 0 && isValueUpQuestion) {
    const valueUpPoints = valueUpClaims.slice(0, 3).map((claim) => stripFinalPunctuation(claim.claimText));
    valueUpPoints.push("핵심 변수는 목표 제시 자체보다 배당, 소각, 투자 집행이 같은 자본배분 원칙으로 이어지는지입니다.");
    sections.push(formatAnswerSection(sectionTitle("주주환원 체크", 1), valueUpPoints));
  }

  const riskPoints = [];
  if (valueUpClaims[0]) {
    const enterpriseValueClaim = valueUpClaims.find((claim) =>
      /기업가치|ROE|주주환원|배당|자사주/u.test(claim.claimText)
    );
    if (enterpriseValueClaim) riskPoints.push(stripFinalPunctuation(enterpriseValueClaim.claimText));
    if (valueUpClaims[0] !== enterpriseValueClaim) riskPoints.push(stripFinalPunctuation(valueUpClaims[0].claimText));
    riskPoints.push("자본배분 계획이 반복 가능한 실행 구조가 아니라 일회성 발표에 그치면 밸류에이션 근거가 약해집니다.");
  }
  if (financialClaims.length > 0) {
    riskPoints.push("실적 개선이 가격 사이클 반등에 그치고 현금흐름·자본배분 개선으로 이어지지 않으면 재평가 폭은 제한됩니다.");
  }
  if (businessClaims.length > 0 && !isGovernanceQuestion) riskPoints.push("사업 파이프라인은 매출 전환 시점과 마진 기여도가 약할 경우 투자 설명력이 낮아집니다.");
  if (governanceClaims[0] && isGovernanceQuestion) {
    riskPoints.push(stripFinalPunctuation(governanceClaims[0].claimText));
  }
  riskPoints.push("공식 IR 근거와 시장 가격은 성격이 다르므로, 실시간 KRX·뉴스 연결 전 가격 해석은 보조 신호로 제한됩니다.");
  sections.push(formatAnswerSection("반증 리스크", riskPoints));

  const monitorPoints = [];
  monitorPoints.push("1순위: 영업이익률과 현금흐름의 동행 여부.");
  if (valueUpClaims.length > 0) monitorPoints.push("2순위: ROE·주주환원 계획의 배당, 소각, 투자 집행 연결성.");
  else if (businessClaims.length > 0) monitorPoints.push("2순위: 수주잔고의 매출 인식과 마진 개선 전환 시점.");
  else monitorPoints.push("2순위: 공식 공시와 시장 가격 신호의 방향성 차이.");
  if (market?.close) {
    monitorPoints.push(`3순위: ${market.ticker ?? "대표 종목"} ${formatKrw(market.close)}원은 보조 신호이며 KRX 확정가 기준 확인 필요.`);
  } else if (news?.status === "fixture") {
    monitorPoints.push("3순위: 최신 뉴스 실시간 연결 전에는 공식 IR 범위 안에서만 해석.");
  }
  if (news?.items?.[0]?.title && news.status !== "fixture") {
    monitorPoints.push("뉴스: 최신 보도는 공시·실적 근거와 연결되는 경우에만 관찰 신호로 반영.");
  } else if (news?.status === "fixture") {
    monitorPoints.push("뉴스: 실시간 연결 전이므로 현재 답변은 공식 IR과 보조 시장 원천에 제한.");
  }
  if (disclosure?.receiptDate && disclosure.receiptDate !== "fixture") {
    const reportLabel = investorSafeDisclosureLabel(disclosure.reportName);
    monitorPoints.push(`공시: ${reportLabel}(${disclosure.receiptDate}).`);
  }
  sections.push(formatAnswerSection("다음 관찰 포인트", monitorPoints));

  return mergeDuplicateAnswerSections(sections).join("\n\n");
}

function buildFinancialSectionPoints({ financialClaims, financialSnapshot, question, isFinancialQuestion }) {
  const points = [];
  const latest = financialSnapshot.latest;
  const previous = financialSnapshot.previous;
  const primaryCompanyId = latest?.companyId ?? previous?.companyId;
  const asksDetailedAccountingMetrics =
    /순이익|부채|부채비율|동종|업계|peer|피어|수익성\s*포지션/u.test(question);
  if (latest?.revenueEokKrw && latest?.operatingIncomeEokKrw) {
    const latestParts = [
      `매출액 ${formatEokAsJo(latest.revenueEokKrw)}`,
      `영업이익 ${formatEokAsJo(latest.operatingIncomeEokKrw)}`,
      `영업이익률 ${formatPct(latest.operatingMarginPct)}`
    ];
    if (latest.netIncomeEokKrw) latestParts.push(`순이익 ${formatEokAsJo(latest.netIncomeEokKrw)}`);
    if (latest.debtToEquityPct) latestParts.push(`부채비율 ${formatPct(latest.debtToEquityPct)}`);
    points.push(`OpenDART ${latest.year}년 연결: ${latestParts.join(", ")}.`);
  }
  if (latest && previous) {
    const trendParts = [
      `매출액 ${formatSignedPctChange(latest.revenueEokKrw, previous.revenueEokKrw)}`,
      `영업이익 ${formatSignedPctChange(latest.operatingIncomeEokKrw, previous.operatingIncomeEokKrw)}`,
      `마진 ${formatPct(previous.operatingMarginPct)} → ${formatPct(latest.operatingMarginPct)}`
    ];
    if (latest.netIncomeEokKrw && previous.netIncomeEokKrw) {
      trendParts.push(`순이익 ${formatSignedPctChange(latest.netIncomeEokKrw, previous.netIncomeEokKrw)}`);
    }
    if (latest.debtToEquityPct && previous.debtToEquityPct) {
      trendParts.push(`부채비율 ${formatPct(previous.debtToEquityPct)} → ${formatPct(latest.debtToEquityPct)}`);
    }
    points.push(`OpenDART 전년 대비: ${trendParts.join(", ")}.`);
  }
  const narrativeFinancialPoints = financialClaims
    .filter((claim) =>
      (!primaryCompanyId || claim.companyId === primaryCompanyId) &&
      (!Array.isArray(claim.financialMetrics) || claim.financialMetrics.length === 0)
    )
    .slice(0, asksDetailedAccountingMetrics ? 0 : (isFinancialQuestion ? 1 : 2))
    .map((claim) => stripFinalPunctuation(claim.claimText));
  points.push(...narrativeFinancialPoints);
  if (points.length === 0) {
    points.push(...financialClaims.slice(0, isFinancialQuestion ? 3 : 2).map((claim) => stripFinalPunctuation(claim.claimText)));
  }
  if (/동종|업계|peer|피어|경쟁/u.test(question)) {
    points.push("동종업계 정량 순위는 peer universe가 고정된 뒤 표시하고, 현재 답변은 OPM·순이익 추세·부채비율 중심으로 제한합니다.");
  }
  return points;
}

function buildFinancialSnapshot(claims) {
  const metrics = claims
    .flatMap((claim) => Array.isArray(claim.financialMetrics) ? claim.financialMetrics : [])
    .filter((metric) => metric?.year && metric.revenueEokKrw && metric.operatingIncomeEokKrw);
  const preferredCompanyId = metrics.find((metric) => metric.companyId)?.companyId;
  const scopedMetrics = preferredCompanyId
    ? metrics.filter((metric) => metric.companyId === preferredCompanyId)
    : metrics;
  const unique = new Map();
  for (const metric of scopedMetrics) {
    const key = `${metric.companyId ?? ""}:${metric.year}`;
    if (!unique.has(key)) unique.set(key, metric);
  }
  const ordered = [...unique.values()].sort((a, b) => Number(a.year) - Number(b.year));
  return {
    metrics: ordered,
    latest: ordered.at(-1),
    previous: ordered.at(-2)
  };
}

function mergeDuplicateAnswerSections(sectionBlocks) {
  const merged = new Map();
  for (const block of sectionBlocks.filter(Boolean)) {
    const match = block.match(/^\*\*(.+?)\*\*\n([\s\S]*)$/u);
    if (!match) continue;
    const title = match[1];
    const body = match[2].trim();
    const current = merged.get(title);
    merged.set(title, current ? `${current}\n${body}` : body);
  }
  return [...merged.entries()].map(([title, body]) => `**${title}**\n${body}`);
}

function answerSubjectLabel(contextPackage) {
  const names = contextPackage.group?.mentionedCompanyNames ?? [];
  if (names.length === 1) return names[0];
  if (names.length > 1) return names.slice(0, 3).join("·");
  if (contextPackage.group?.representativeCompanyName) return contextPackage.group.representativeCompanyName;
  return displayGroupName(contextPackage.group);
}

function formatAnswerSection(title, content) {
  if (Array.isArray(content)) {
    const lines = content.filter(Boolean);
    if (lines.length === 0) return "";
    return `**${title}**\n${lines.map((line) => `- ${line}`).join("\n")}`;
  }
  const body = String(content ?? "").trim();
  if (!body) return "";
  return `**${title}**\n${body}`;
}

function investorSafeDisclosureLabel(reportName) {
  const value = String(reportName ?? "").trim();
  if (!value) return "최근 DART 공시";
  if (/특수관계인/u.test(value) && /(유가증권|기타유가증권|주식)/u.test(value)) {
    return "특수관계인 증권거래 관련 공시";
  }
  if (/(유가증권매수|유가증권매도|주식매수|주식매도)/u.test(value)) {
    return "증권거래 관련 공시";
  }
  return value;
}

function stripFinalPunctuation(value) {
  return String(value ?? "").replace(/[.。]+$/u, "");
}

function formatKrw(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  return number.toLocaleString("ko-KR");
}

function formatEokAsJo(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return String(value);
  if (Math.abs(number) >= 10000) return `${round1(number / 10000)}조원`;
  return `${Math.round(number).toLocaleString("ko-KR")}억원`;
}

function formatSignedPctChange(current, previous) {
  const now = Number(current);
  const then = Number(previous);
  if (!Number.isFinite(now) || !Number.isFinite(then) || then === 0) return "n/a";
  const pct = ((now - then) / Math.abs(then)) * 100;
  return `${pct >= 0 ? "+" : ""}${round1(pct)}%`;
}

function formatPct(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "n/a";
  return `${round1(number)}%`;
}

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function finalizeAdvisorAnswer(answer) {
  return normalizeAnswerText(answer).slice(0, 1600);
}

function normalizeAnswerText(value) {
  return String(value ?? "")
    .replace(/\r\n/gu, "\n")
    .replace(/[ \t]+/gu, " ")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function buildAnswerAssembly({ contextPackage, traces, llm, defaultCompany, listedCompany }) {
  const claims = contextPackage.sourceBackedClaims?.selectedClaims ?? [];
  const wikiPages = contextPackage.wiki?.pages ?? [];
  const answerSections = extractAnswerSectionTitles(llm.answer);
  const traceByLabel = new Map(traces.map((item) => [item.label, item]));
  const externalStatuses = traces
    .filter((item) => item.status !== "local")
    .map((item) => item.status);
  const limitedSourceCount = externalStatuses.filter((status) =>
    ["fixture", "fallback", "error"].includes(status)
  ).length;
  const sourceStatus = limitedSourceCount > 0 ? "warn" : "pass";
  const answerHasDevLeak = visibleAnswerDevLeakPattern.test(llm.answer ?? "");
  const hasSourceLimitation = /(실시간|연결 전|재확인|공식|보수적|제한|확인해야|확인 필요)/u
    .test(llm.answer ?? "");

  return [
    {
      id: "intent.route",
      title: "질문 의도와 대상 고정",
      owner: "code",
      status: "pass",
      summary: "그룹, 대표 회사, 표시 모드, 질문 해시를 코드에서 고정해 프롬프트 해석 여지를 줄였습니다.",
      inputs: [
        `group:${contextPackage.group.id}`,
        `questionHash:${sha256(contextPackage.question).slice(0, 12)}`,
        `presentation:${contextPackage.presentationMode}`
      ],
      outputs: [
        `representative:${defaultCompany?.id ?? "unknown"}`,
        `marketTarget:${listedCompany?.id ?? "unknown"}`
      ]
    },
    {
      id: "source.collect",
      title: "공시·시장·뉴스 원천 수집",
      owner: "source",
      status: sourceStatus,
      summary: "외부 원천은 동일 trace schema로 수집하고 live, fixture, fallback, error 상태를 분리했습니다.",
      inputs: ["dart.disclosures", "krx.market", "news.search"],
      outputs: ["dart.disclosures", "krx.market", "news.search"].map((label) => {
        const trace = traceByLabel.get(label);
        return `${label}:${trace?.status ?? "missing"}`;
      })
    },
    {
      id: "wiki.crosscheck",
      title: "LLM Wiki 대조",
      owner: "wiki",
      status: wikiPages.length > 0 ? "pass" : "warn",
      summary: "Raw source가 아닌 compiled wiki namespace를 보조 맥락으로 불러오고 stale 상태를 trace에 남깁니다.",
      inputs: [`namespace:${contextPackage.group.wikiNamespace}`],
      outputs: [
        `pages:${wikiPages.length}`,
        `source:${contextPackage.wiki?.source ?? "unknown"}`
      ]
    },
    {
      id: "claim.select",
      title: "Source-backed claim 선택",
      owner: "source",
      status: claims.length > 0 ? "pass" : "warn",
      summary: "답변에 들어갈 material claim은 공식 원천에 연결된 claim manifest에서만 선택했습니다.",
      inputs: [
        `manifest:${contextPackage.sourceBackedClaims?.manifestPath ?? "missing"}`,
        `available:${contextPackage.sourceBackedClaims?.totalClaims ?? 0}`
      ],
      outputs: [
        `selected:${claims.length}`,
        ...claims.slice(0, 4).map((claim) => `${claim.id}:${claim.claimType}`)
      ]
    },
    {
      id: "answer.plan",
      title: "답변 섹션 구성",
      owner: llm.live ? "llm" : "code",
      status: answerSections.length >= 3 ? "pass" : "warn",
      summary: "사용자에게는 핵심 인사이트를 먼저 보여주고, claim ID와 trace 세부 정보는 개발/논문용 기록으로 분리했습니다.",
      inputs: [
        `composer:${llm.mode}`,
        `provider:${llm.provider ?? "unknown"}`,
        `model:${llm.model ?? "none"}`,
        `policy:${contextPackage.promptPolicy.version}`,
        `outputContract:${llm.outputContract?.version ?? llmOutputContractVersion}`,
        `contractStatus:${llm.outputContract?.status ?? "unknown"}`,
        `answerIntent:${contextPackage.answerPlan?.intent ?? "unknown"}`
      ],
      outputs: [
        `recommended:${(contextPackage.answerPlan?.recommendedSections ?? []).join("|")}`,
        ...(answerSections.length > 0 ? answerSections : ["section:none"])
      ]
    },
    {
      id: "guardrail.validate",
      title: "가시 답변 guardrail 검증",
      owner: "code",
      status: answerHasDevLeak ? "fail" : sourceStatus === "warn" && !hasSourceLimitation ? "warn" : "pass",
      summary: "개발 문구 노출, 원천 제한 고지, 인사이트 우선 섹션 구조를 코드에서 점검해 논문용 trace와 사용자 UI를 분리합니다.",
      inputs: [
        `devLeak:${answerHasDevLeak ? "yes" : "no"}`,
        `sourceLimited:${limitedSourceCount}`,
        `contractStatus:${llm.outputContract?.status ?? "unknown"}`
      ],
      outputs: [
        `sourceDisclosure:${hasSourceLimitation ? "present" : "missing"}`,
        `sections:${answerSections.length}`,
        `contractErrors:${llm.outputContract?.errors?.length ?? 0}`
      ]
    }
  ];
}

function extractAnswerSectionTitles(answer) {
  return [...String(answer ?? "").matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

function buildTraceEnvelope({ runId, group, representativeCompany, question, presentationMode, traces, generatedAt, elapsedMs, llm }) {
  const statusCounts = traces.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  const externalStatusCounts = traces
    .filter((item) => item.status !== "local")
    .reduce((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    }, {});
  const runtimeMode = externalStatusCounts.error
    ? "degraded"
    : externalStatusCounts.fixture
      ? externalStatusCounts.live || externalStatusCounts.fallback
        ? "mixed"
        : "fixture"
      : externalStatusCounts.fallback
        ? "fallback"
        : "live";

  return {
    schemaVersion: traceSchemaVersion,
    runId,
    generatedAt,
    runtimeMode,
    presentationMode,
    groupId: group.id,
    representativeCompanyId: representativeCompany?.id,
    questionHash: sha256(question),
    promptPolicyHash: sha256(promptPolicy),
    promptPolicyVersion,
    llmMode: llm.mode,
    llmProvider: llm.provider ?? null,
    llmModel: llm.model ?? null,
    llmTemperature: llm.provider ? llmTemperature() : null,
    llmOutputContractVersion,
    llmOutputContractStatus: llm.outputContract?.status ?? "unknown",
    llmOutputContractErrors: llm.outputContract?.errors ?? [],
    llmCompositionProcess: llm.outputContract?.process ?? [],
    llmLiveOutput: llm.outputContract?.liveOutput ?? null,
    statusCounts,
    elapsedMs,
    reproducibility: {
      configSchemaVersion: config.schemaVersion,
      wikiNamespace: group.wikiNamespace,
      wikiContextVersion,
      sourceStatus: group.sourceStatus,
      toolOrder: traces.map((item) => item.label)
    }
  };
}

function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

function buildLinks(group, dart, market, news, sourceBackedClaims) {
  const links = [
    { label: "DART 전자공시시스템", href: "https://dart.fss.or.kr/", source: dart.source },
    { label: "KRX 정보데이터시스템", href: "https://data.krx.co.kr/", source: market.source }
  ];
  const firstDart = dart.items?.find((item) => item.url);
  const firstNews = news.items?.find((item) => item.url);
  const firstClaim = sourceBackedClaims?.selectedClaims?.find((claim) => claim.officialSourceUrl || claim.officialDownloadUrl);
  if (firstDart && dart.status !== "fixture") links.unshift({ label: firstDart.reportName ?? "최근 DART 공시", href: firstDart.url, source: dart.source });
  if (firstClaim) {
    links.unshift({
      label: firstClaim.sourceTitle ?? `${displayGroupName(group)} 공식 IR 근거`,
      href: firstClaim.officialSourceUrl ?? firstClaim.officialDownloadUrl,
      source: firstClaim.sourceManifestId
    });
  }
  if (firstNews && news.status !== "fixture") links.push({ label: firstNews.title ?? "최근 뉴스", href: firstNews.url, source: news.source });
  links.push({
    label: `${displayGroupName(group)} 공식 사이트`,
    href: publicWebsiteForGroup(group.id),
    source: "group-profile"
  });
  return links.slice(0, 5);
}

async function persistTraceExport(result) {
  const traceDir = join(rootDir, "evals", "traces");
  await mkdir(traceDir, { recursive: true });
  const fileName = `${safeTraceFileName(result.trace.runId)}.json`;
  const relativePath = join("evals", "traces", fileName);
  result.traceExportUrl = `/api/traces/${fileName}`;
  result.traceArtifactPath = relativePath;
  const artifact = {
    schemaVersion: "advisor-evaluation-trace.v0.1",
    exportedAt: new Date().toISOString(),
    purpose: "paper-and-demo-evaluation-trace",
    response: result
  };
  await writeFile(join(rootDir, relativePath), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  return {
    url: result.traceExportUrl,
    path: result.traceArtifactPath
  };
}

async function readTraceExport(pathname) {
  const fileName = pathname.split("/").at(-1) ?? "";
  if (!/^run_[a-z0-9-]+\.json$/u.test(fileName)) {
    return { error: "INVALID_TRACE_ID" };
  }
  const tracePath = join(rootDir, "evals", "traces", fileName);
  if (!existsSync(tracePath)) return { error: "TRACE_NOT_FOUND" };
  return JSON.parse(await readFile(tracePath, "utf8"));
}

function safeTraceFileName(runId) {
  return String(runId).replace(/[^a-zA-Z0-9_-]/gu, "_");
}

function selectClaimsForQuestion(records, question, group) {
  const normalized = String(question ?? "").toLowerCase();
  const mentionedCompanies = detectMentionedCompanies(group, normalized);
  const mentionedCompanyIds = new Set(mentionedCompanies.map((company) => company.id));
  const financialIntent = /재무|실적|매출|영업|이익|margin|순이익|부채|부채비율|동종|업계|peer|피어|수익성|financial/u.test(normalized);
  const contextHeavyIntent = /가치|밸류|주주|배당|자사주|roe|nav|할인율|포트폴리오|수주|사업|전략|ai|hbm|배터리|데이터센터|전환|집중도/u.test(normalized);
  const targetCompanyId = mentionedCompanyIds.values().next().value ?? group.defaultCompanyId ?? group.companies?.[0]?.id;
  const scopedRecords = mentionedCompanyIds.size > 0 && records.some((record) => mentionedCompanyIds.has(record.companyId))
    ? records.filter((record) => !record.companyId || mentionedCompanyIds.has(record.companyId))
    : records;
  const scored = scopedRecords
    .map((record, index) => ({ record, index, score: scoreClaim(record, normalized, mentionedCompanyIds) }))
    .filter((item) => item.score > 0);
  const candidates = scored.length > 0
    ? scored.sort((a, b) => b.score - a.score || a.index - b.index)
    : scopedRecords.map((record, index) => ({ record, index, score: scopedRecords.length - index }));
  if (mentionedCompanies.length > 1) {
    const topCandidateRecords = uniqueClaimRecords(candidates.map((item) => item.record)).slice(0, MAX_SELECTED_SOURCE_CLAIMS);
    const topCandidateCompanyIds = new Set(topCandidateRecords.map((record) => record.companyId).filter(Boolean));
    if (mentionedCompanies.every((company) => topCandidateCompanyIds.has(company.id))) {
      return topCandidateRecords;
    }
    const comparisonSeeds = [];
    for (const company of mentionedCompanies) {
      const companyRecords = records.filter((record) => record.companyId === company.id);
      const financialRecords = companyRecords
        .filter((record) => /financial_metric|financial_trend/u.test(record.claimType ?? ""))
        .sort((a, b) => claimMetricYear(b) - claimMetricYear(a));
      const contextRecords = companyRecords
        .filter((record) => !/financial_metric|financial_trend/u.test(record.claimType ?? ""))
        .map((record, index) => ({ record, index, score: scoreClaim(record, normalized, mentionedCompanyIds) }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((item) => item.record);
      const orderedRecords = contextHeavyIntent
        ? [...contextRecords, ...financialRecords]
        : [...financialRecords, ...contextRecords];
      comparisonSeeds.push(...orderedRecords.slice(0, 2));
    }
    return uniqueClaimRecords([
      ...comparisonSeeds,
      ...candidates.map((item) => item.record)
    ]).slice(0, MAX_SELECTED_SOURCE_CLAIMS);
  }
  if (financialIntent && targetCompanyId) {
    const targetFinancialRecords = records
      .filter((record) =>
        record.companyId === targetCompanyId &&
        /financial_metric|financial_trend/u.test(record.claimType ?? "")
      )
      .sort((a, b) => claimMetricYear(b) - claimMetricYear(a));
    const targetContextRecords = candidates
      .map((item) => item.record)
      .filter((record) =>
        record.companyId === targetCompanyId &&
        !/financial_metric|financial_trend/u.test(record.claimType ?? "")
      );
    const financialTake = contextHeavyIntent ? 1 : 2;
    const contextTake = contextHeavyIntent ? 4 : 1;
    return uniqueClaimRecords([
      ...targetContextRecords.slice(0, contextTake),
      ...targetFinancialRecords.slice(0, financialTake),
      ...candidates.map((item) => item.record)
    ]).slice(0, MAX_SELECTED_SOURCE_CLAIMS);
  }
  return candidates.slice(0, MAX_SELECTED_SOURCE_CLAIMS).map((item) => item.record);
}

function uniqueClaimRecords(records) {
  const seen = new Set();
  const unique = [];
  for (const record of records) {
    if (!record?.id || seen.has(record.id)) continue;
    seen.add(record.id);
    unique.push(record);
  }
  return unique;
}

function claimMetricYear(record) {
  const location = record?.evidenceLocations?.find((item) => item?.year) ?? record?.evidenceRecords?.find((item) => item?.year);
  return Number(location?.year ?? record?.sourceDocumentDate ?? 0);
}

function scoreClaim(record, question, mentionedCompanyIds = new Set()) {
  const haystack = [
    record.claimType,
    record.claimText,
    record.targetWikiPage,
    record.sourceDocumentDate,
    record.runtimeUsePolicy,
    record.reviewNote,
    record.paperUseLevel
  ].join(" ").toLowerCase();
  const governanceIntent = /공시관리|지배|거버넌스|ir\s*활동|소통|governance/u.test(question);
  let score = 0;
  if (mentionedCompanyIds.size > 0 && record.companyId) {
    if (mentionedCompanyIds.has(record.companyId)) score += 18;
    else score -= 8;
  }
  if (!governanceIntent && /뉴스|투자|포인트|요약|브리프/u.test(question) && /financial|business|value|capital|shareholder|매출|영업|사업|수주|주주|배당|roe/u.test(haystack)) score += 5;
  if (!governanceIntent && /최근|투자|포인트|요약|브리프|핵심|변수/u.test(question) && /2025|2026|business|pipeline|value|capital|shareholder|주주|수주|ai|hbm|ess|cdmo|가이던스|배당|k-ics/u.test(haystack)) score += 4;
  if (!governanceIntent && /뉴스|투자|포인트|요약|브리프/u.test(question) && /business_strategy|business_pipeline|사업|수주|질산|bncp|이라크/u.test(haystack)) score += 4;
  if (!governanceIntent && /최근|투자|포인트|요약|브리프|핵심/u.test(question) && /source-backed-narrative-seed-claim/u.test(haystack)) score += 3;
  if (!governanceIntent && /뉴스|투자|포인트|요약|브리프/u.test(question) && /governance_process|investor_communication/u.test(haystack)) score -= 8;
  if (!governanceIntent && /뉴스|투자|포인트|요약|브리프/u.test(question) && /영업이익률|financial_metric/u.test(haystack)) score += 3;
  if (/재무|실적|매출|영업|이익|margin|financial/u.test(question) && /financial|매출|영업|이익/u.test(haystack)) score += 8;
  if (/가치|밸류|분할|주주|배당|자사주|roe|dps|환원/u.test(question) && /value|capital|shareholder|분할|주주|배당|roe|dps|환원/u.test(haystack)) score += 8;
  if (/건설|bncp|이라크|수주|질산|글로벌|사업|투자 포인트|ai|hbm|ess|배터리|바이오|cdmo|데이터센터/u.test(question) && /business|건설|bncp|이라크|수주|질산|글로벌|ai|hbm|ess|배터리|바이오|cdmo|데이터센터/u.test(haystack)) score += 8;
  if (governanceIntent && /governance|communication|공시|소통|ir/u.test(haystack)) score += 8;
  if (governanceIntent) {
    const governanceCore = `${record.claimType} ${record.claimText}`.toLowerCase();
    if (/governance|communication|공시관리|공시통제|소통|ir/u.test(governanceCore)) score += 20;
    else score -= 10;
  }
  if (question.includes("한화") || question.includes("hanwha")) score += 1;
  if (question.includes("삼성") || question.includes("samsung")) score += 1;
  return score;
}

function toRuntimeClaim(record) {
  return {
    id: record.id,
    companyId: record.companyId,
    companyScope: record.companyScope,
    claimText: record.claimText,
    claimType: record.claimType,
    sourceManifestId: record.sourceManifestId,
    sourceTitle: record.sourceTitle,
    sourceDocumentDate: record.sourceDocumentDate,
    runtimeUsePolicy: record.runtimeUsePolicy,
    verificationState: record.verificationState,
    financialMetrics: compactFinancialMetrics(record),
    officialSourceUrl: record.officialSource?.sourcePageUrl,
    officialDownloadUrl: record.officialSource?.downloadUrl
  };
}

function compactFinancialMetrics(record) {
  const evidence = [
    ...(Array.isArray(record.evidenceLocations) ? record.evidenceLocations : []),
    ...(Array.isArray(record.evidenceRecords) ? record.evidenceRecords : [])
  ];
  const metrics = [];
  const seen = new Set();
  for (const item of evidence) {
    const revenueEokKrw = item.revenueAmountEokKrw ?? item.revenue?.amountEokKrw;
    const operatingIncomeEokKrw =
      item.operatingIncomeAmountEokKrw ?? item.operatingIncome?.amountEokKrw;
    const netIncomeEokKrw = item.netIncomeAmountEokKrw ?? item.netIncome?.amountEokKrw;
    const totalAssetsEokKrw = item.totalAssetsAmountEokKrw ?? item.totalAssets?.amountEokKrw;
    const totalLiabilitiesEokKrw =
      item.totalLiabilitiesAmountEokKrw ?? item.totalLiabilities?.amountEokKrw;
    const totalEquityEokKrw = item.totalEquityAmountEokKrw ?? item.totalEquity?.amountEokKrw;
    const debtToEquityPct =
      item.debtToEquityPct ??
      (Number.isFinite(Number(totalLiabilitiesEokKrw)) && Number.isFinite(Number(totalEquityEokKrw)) && Number(totalEquityEokKrw) !== 0
        ? (Number(totalLiabilitiesEokKrw) / Number(totalEquityEokKrw)) * 100
        : null);
    if (!item.year || !revenueEokKrw || !operatingIncomeEokKrw) continue;
    const key = `${item.companyId ?? record.companyId ?? ""}:${item.year}`;
    if (seen.has(key)) continue;
    seen.add(key);
    metrics.push({
      companyId: item.companyId ?? record.companyId,
      koreanName: item.koreanName,
      year: String(item.year),
      reportingBasis: item.reportingBasis,
      revenueAccount: item.revenueAccount ?? item.revenue?.accountName,
      operatingIncomeAccount: item.operatingIncomeAccount ?? item.operatingIncome?.accountName,
      netIncomeAccount: item.netIncomeAccount ?? item.netIncome?.accountName,
      totalAssetsAccount: item.totalAssetsAccount ?? item.totalAssets?.accountName,
      totalLiabilitiesAccount: item.totalLiabilitiesAccount ?? item.totalLiabilities?.accountName,
      totalEquityAccount: item.totalEquityAccount ?? item.totalEquity?.accountName,
      revenueEokKrw,
      operatingIncomeEokKrw,
      netIncomeEokKrw,
      totalAssetsEokKrw,
      totalLiabilitiesEokKrw,
      totalEquityEokKrw,
      debtToEquityPct,
      operatingMarginPct: (Number(operatingIncomeEokKrw) / Number(revenueEokKrw)) * 100,
      dartStatus: item.dartStatus,
      sourceEndpoint: item.sourceEndpoint ?? item.revenue?.sourceEndpoint ?? item.operatingIncome?.sourceEndpoint
    });
  }
  return metrics.sort((a, b) => Number(a.year) - Number(b.year));
}

function relativeProjectPath(path) {
  return path.startsWith(rootDir) ? path.slice(rootDir.length + 1) : path;
}

function publicWebsiteForGroup(groupId) {
  return {
    hanwha: "https://www.hanwha.com/",
    samsung: "https://www.samsung.com/global/ir/",
    sk: "https://www.sk.com/",
    "hyundai-motor": "https://www.hyundaimotorgroup.com/",
    lg: "https://www.lgcorp.com/"
  }[groupId] ?? "https://www.google.com/search?q=Korean+business+group+IR";
}

function buildFollowUps(group, company, question) {
  const groupLabel = displayGroupName(group);
  const mentionedCompanies = detectMentionedCompanies(group, question);
  const targetLabel = mentionedCompanies.length > 0
    ? mentionedCompanies.slice(0, 3).map((item) => item.koreanName).join("·")
    : groupLabel;
  const companyLabel = mentionedCompanies[0]?.koreanName ?? company?.koreanName ?? targetLabel;
  const topic = classifyFollowUpTopic(question);
  const common = [
    `${targetLabel} 최근 공시 중 리스크 신호만 추려줘`,
    `${targetLabel} 뉴스와 공시 근거를 분리해줘`,
    `${targetLabel} 지금 가격에서 확인할 핵심 변수는?`,
    `${targetLabel} 투자 리스크를 보수적으로 다시 봐줘`
  ];

  const questions = (() => {
    if (topic === "financial") {
      return [
      `${targetLabel} 실적 개선폭을 표로 정리해줘`,
      `${companyLabel} 영업이익률 지속성을 봐줘`,
      `${targetLabel} 부채와 현금흐름 리스크는?`,
        `${targetLabel} 주주환원 여력을 재무 기준으로 봐줘`
      ];
    }

    if (topic === "valueUp") {
      return [
      `${targetLabel} 주주환원 실행 가능성을 봐줘`,
      `${targetLabel} ROE 목표의 전제는 무엇이야?`,
      `${targetLabel} 자본배분 리스크만 추려줘`,
        `${targetLabel} 기업가치 제고 계획의 체크포인트는?`
      ];
    }

    if (topic === "pipeline") {
      return [
      `${targetLabel} 수주잔고의 매출 전환을 봐줘`,
      `${targetLabel} BNCP 관련 리스크를 정리해줘`,
      `${targetLabel} 사업 파이프라인을 계열사별로 나눠줘`,
      common[0]
      ];
    }

    if (topic === "governance") {
      return [
      `${targetLabel} 공시관리 체계의 약점은?`,
      `${targetLabel} IR 소통 계획을 요약해줘`,
      `${targetLabel} 투자자 보호 관점 리스크는?`,
        `${targetLabel} 최근 공시의 투자자 영향은?`
      ];
    }

    if (topic === "rival") {
      return [
      `${targetLabel} 경쟁사 대비 강점만 추려줘`,
      `${targetLabel} 경쟁사 대비 약점만 추려줘`,
      `${targetLabel} 동종업계 밸류에이션 비교는?`,
      common[0]
      ];
    }

    if (topic === "global") {
      return [
      `${targetLabel} 국제 변수의 실적 민감도는?`,
      `${targetLabel} 환율·금리 영향만 따로 봐줘`,
      `${targetLabel} 공급망 리스크를 정리해줘`,
      common[0]
      ];
    }

    return [
    `${targetLabel} 투자 포인트를 더 압축해서 정리해줘`,
      common[1],
    common[0],
      common[2]
    ];
  })();

  return sanitizeCustomerFollowUps(questions);
}

function sanitizeCustomerFollowUps(questions) {
  const banned = /논문|evaluation|trace|로그|데모|개발|검증용|schema|JSON|프롬프트|prompt|rubric|eval/u;
  const seen = new Set();
  return questions
    .map((question) => String(question ?? "").trim())
    .filter((question) => question.length > 0 && question.length <= 80)
    .filter((question) => !banned.test(question))
    .filter((question) => {
      if (seen.has(question)) return false;
      seen.add(question);
      return true;
    })
    .slice(0, 4);
}

function classifyFollowUpTopic(question) {
  const value = String(question ?? "");
  if (/재무|실적|매출|영업이익|영업이익률|순이익|부채|현금흐름/u.test(value)) return "financial";
  if (/기업가치|밸류|주주환원|배당|자사주|ROE|자본배분/u.test(value)) return "valueUp";
  if (/수주|BNCP|건설|파이프라인|질산|사업/u.test(value)) return "pipeline";
  if (/공시관리|거버넌스|지배|IR|소통/u.test(value)) return "governance";
  if (/경쟁|경쟁사|동종|비교/u.test(value)) return "rival";
  if (/국제|미국|중국|유럽|중동|환율|금리|공급망|지정학/u.test(value)) return "global";
  return "general";
}

function displayGroupName(group) {
  return String(group?.koreanName ?? "").replace(/그룹$/u, "");
}

function representativeCompanyForGroup(group) {
  return (
    group?.companies?.find((company) => company.id === group.defaultCompanyId) ??
    group?.companies?.find((company) => company.listed && company.krxCode) ??
    group?.companies?.[0] ??
    null
  );
}

function displayCompanyName(company, locale = "ko") {
  if (!company) return locale === "en" ? "Representative company" : "대표 상장사";
  return locale === "en" ? company.displayName : company.koreanName;
}

function selectBriefingFinancialClaim(claims, company) {
  const companyClaims = claims.filter((claim) => !company?.id || !claim.companyId || claim.companyId === company.id);
  // Prefer audited annual OpenDART figures for the headline financial card.
  // The exact-match guard excludes preliminary/forward narrative variants such as
  // financial_metric_preliminary and financial_business_pipeline, whose seed-level
  // quarterly figures should not headline the briefing as confirmed results.
  const isAuditedMetric = (claim) => /^financial_(metric|trend)$/u.test(String(claim.claimType ?? ""));
  return (
    companyClaims.find((claim) => isAuditedMetric(claim) && /OpenDART/u.test(String(claim.claimText ?? ""))) ??
    companyClaims.find((claim) => isAuditedMetric(claim)) ??
    companyClaims.find((claim) => /financial_metric|financial_trend/u.test(String(claim.claimType ?? ""))) ??
    companyClaims.find((claim) => /매출|영업이익|순이익|부채|현금흐름/u.test(String(claim.claimText ?? ""))) ??
    companyClaims[0] ??
    null
  );
}

function selectBriefingFinancialDisclosure(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    items.find((item) => /사업보고서|분기보고서|반기보고서|영업\(잠정\)실적|연결재무제표|감사보고서/u.test(String(item.reportName ?? ""))) ??
    items.find((item) => /보고서/u.test(String(item.reportName ?? ""))) ??
    null
  );
}

function formatFinancialMeta(claim, disclosure, locale = "ko") {
  const claimYear = String(claim?.sourceDocumentDate ?? "").match(/\d{4}/u)?.[0];
  if (claimYear) return locale === "en" ? `DART/IR ${claimYear}` : `DART/IR ${claimYear}`;
  const date = formatDartDate(disclosure?.receiptDate);
  return locale === "en" ? `DART financial source ${date}` : `DART 재무 근거 ${date}`;
}

function formatFinancialDisclosureMeta(disclosure, locale = "ko") {
  const date = formatDartDate(disclosure?.receiptDate);
  if (date === "확인 필요") return locale === "en" ? "DART filing check" : "DART 공시 확인";
  return locale === "en" ? `DART filing ${date}` : `DART 접수 ${date}`;
}

function buildFinancialHeadline(company, claim, locale = "ko") {
  const companyName = displayCompanyName(company, locale);
  const metrics = summarizeFinancialClaimText(claim?.claimText);
  if (metrics) return `${companyName} · ${metrics}`;
  return locale === "en"
    ? `${companyName} · financial source checked`
    : `${companyName} · 재무 근거 확인`;
}

function buildFinancialDisclosureHeadline(company, disclosure, claim, locale = "ko") {
  const reportName = String(disclosure?.reportName ?? "").trim();
  if (reportName && reportName !== "undefined") {
    return `${displayCompanyName(company, locale)} · ${reportName}`;
  }
  return buildFinancialHeadline(company, claim, locale);
}

function summarizeFinancialClaimText(value) {
  const text = String(value ?? "");
  const year = text.match(/20\d{2}년/u)?.[0] ?? "";
  const revenue = text.match(/매출(?:액)?(?:은|은\s*)?\s*([0-9,.]+조원|[0-9,.]+억원)/u)?.[1];
  const op = text.match(/영업이익(?:은|은\s*)?\s*([0-9,.]+조원|[0-9,.]+억원)/u)?.[1];
  const margin = text.match(/영업이익률(?:은|은\s*)?\s*([0-9.]+%)/u)?.[1];
  if (revenue && op && margin) return `${year} 매출 ${revenue} · 영업익 ${op} · OPM ${margin}`.trim();
  if (revenue && op) return `${year} 매출 ${revenue} · 영업익 ${op}`.trim();
  if (op && margin) return `${year} 영업익 ${op} · OPM ${margin}`.trim();
  return "";
}

function buildBriefingNewsQuery(group, company) {
  const companyName = company?.koreanName ?? displayGroupName(group);
  return [companyName, "실적", "주가", "공시"].filter(Boolean).join(" ");
}

function selectBriefingNewsItem(items, group, company) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return [...items]
    .map((item, index) => ({
      item,
      index,
      score: scoreBriefingNewsItem(item, group, company)
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item ?? items[0];
}

function scoreBriefingNewsItem(item, group, company) {
  const title = String(item?.title ?? "");
  const description = String(item?.description ?? "");
  const url = String(item?.url ?? "");
  const text = `${title} ${description} ${url}`;
  const normalizedTitle = normalizeCompanyMatch(title);
  const normalizedDescription = normalizeCompanyMatch(description);
  const normalizedUrl = normalizeCompanyMatch(url);
  const companyTerms = [
    company?.koreanName,
    company?.displayName,
    company?.krxCode,
    ...(company?.aliases ?? [])
  ].filter(Boolean);
  let score = 0;
  for (const term of companyTerms) {
    const normalizedTerm = normalizeCompanyMatch(term);
    if (!normalizedTerm) continue;
    if (normalizedTitle.includes(normalizedTerm)) score += normalizedTerm.length >= 4 ? 18 : 8;
    if (normalizedDescription.includes(normalizedTerm)) score += normalizedTerm.length >= 4 ? 7 : 3;
    if (normalizedUrl.includes(normalizedTerm)) score += 2;
  }
  if (company?.koreanName && !normalizedTitle.includes(normalizeCompanyMatch(company.koreanName))) score -= 4;
  if (/IR|공시|실적|주가|증권|투자|영업이익|매출|반도체|배터리|전장|방산|조선|에너지/u.test(text)) score += 8;
  if (/주요공시|외\b|외$/u.test(title) && !title.includes(company?.koreanName ?? "")) score -= 6;
  if (/야구|프로야구|이글스|고척|감독|선수|훈련|경기|MK포토|연예|드라마|예능/u.test(text)) score -= 30;
  if (/선거|표심|유권자|후보|정당|지방선거|교육감|정치|충남|천안|아산/u.test(text)) score -= 18;
  if (group.id === "hanwha" && !/㈜한화|한화솔루션|한화에어로스페이스|한화오션|한화시스템|000880|주가|공시|IR/u.test(text)) score -= 20;
  return score;
}

function formatMarketPrice(value) {
  const numeric = Number(String(value ?? "").replace(/[^0-9.-]/gu, ""));
  if (!Number.isFinite(numeric)) return "확인 필요";
  return Math.round(numeric).toLocaleString("ko-KR");
}

function formatMarketChange(value) {
  const numeric = Number(String(value ?? "").replace(/[^0-9.-]/gu, ""));
  if (!Number.isFinite(numeric)) return "확인 필요";
  const sign = numeric > 0 ? "+" : "";
  return `${sign}${numeric.toFixed(2)}%`;
}

function formatMarketDate(value, locale = "ko") {
  const raw = String(value ?? "").replace(/[^0-9]/gu, "");
  if (raw.length === 8) {
    return locale === "en"
      ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} close`
      : `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)} 종가`;
  }
  return locale === "en" ? "latest close" : "최근 종가";
}

function formatDartDate(value) {
  const raw = String(value ?? "").replace(/[^0-9]/gu, "");
  return raw.length === 8 ? `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}` : "확인 필요";
}

function formatRelativeNewsTime(pubDate, locale = "ko") {
  const date = pubDate ? new Date(pubDate) : null;
  if (!date || Number.isNaN(date.getTime())) return locale === "en" ? "recent" : "최근";
  const diffMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return locale === "en" ? `${diffMinutes || 1}m ago` : `${diffMinutes || 1}분 전`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return locale === "en" ? `${diffHours}h ago` : `${diffHours}시간 전`;
  const diffDays = Math.round(diffHours / 24);
  return locale === "en" ? `${diffDays}d ago` : `${diffDays}일 전`;
}

function shortSourceLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./u, "");
    const root = host.split(".")[0] ?? host;
    return root.length <= 3 ? root.toUpperCase() : root;
  } catch {
    return "";
  }
}

function conciseCardText(value, maxLength) {
  const text = String(value ?? "").replace(/\s+/gu, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function normalizeConfig(value) {
  return {
    ...value,
    groups: [...(value.groups ?? [])].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
  };
}

function findGroup(groupId) {
  return config.groups.find((group) => group.id === groupId) ?? config.groups[0];
}

function inferCompanyFromQuestion(group, question) {
  return detectMentionedCompanies(group, question)[0] ?? null;
}

function detectMentionedCompanies(group, question) {
  const rawQuestion = String(question ?? "");
  const normalizedQuestion = normalizeCompanyMatch(question);
  const primaryMatched = [];
  const scored = (group?.companies ?? [])
    .map((company, index) => {
      let score = 0;
      let primaryScore = 0;
      let aliasScore = 0;
      let matchedAt = Number.POSITIVE_INFINITY;
      for (const term of companyMatchTerms(company)) {
        const matched = term.strict
          ? matchesStrictCompanyTerm(rawQuestion, term.value, term.normalized)
          : normalizedQuestion.includes(term.normalized);
        if (!term.normalized || !matched) continue;
        const termIndex = normalizedQuestion.indexOf(term.normalized);
        if (termIndex >= 0) matchedAt = Math.min(matchedAt, termIndex);
        score += term.weight;
        if (term.kind === "primary") primaryScore += term.weight;
        else aliasScore += term.weight;
      }
      if (primaryScore > 0) primaryMatched.push(company.id);
      return { company, index, score, primaryScore, aliasScore, matchedAt };
    })
    .filter((item) => item.score > 0)
    .filter((item) => primaryMatched.length === 0 || item.primaryScore > 0 || item.aliasScore >= 14)
    .sort((a, b) => a.matchedAt - b.matchedAt || b.score - a.score || a.index - b.index);

  return scored.map((item) => item.company);
}

function companyMatchTerms(company) {
  const terms = [
    { value: company.koreanName, weight: 30, kind: "primary" },
    { value: company.displayName, weight: 18, kind: "primary" },
    ...(company.aliases ?? []).map((value) => ({ value, weight: String(value).length >= 4 ? 14 : 8, kind: "alias" }))
  ];
  return terms
    .map((term) => {
      const normalized = normalizeCompanyMatch(term.value);
      return {
        ...term,
        normalized,
        strict: normalized.length <= 3
      };
    })
    .filter((term, index, list) =>
      term.normalized.length >= 2 &&
      list.findIndex((candidate) => candidate.normalized === term.normalized) === index
    );
}

function matchesStrictCompanyTerm(question, value, normalized) {
  const raw = String(question ?? "");
  const term = String(value ?? "").trim();
  if (!term) return false;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const rawPattern = new RegExp(`(^|[^0-9A-Za-z가-힣])${escaped}($|[^0-9A-Za-z가-힣]|[와과의은는이가을를도만])`, "iu");
  if (rawPattern.test(raw)) return true;
  return normalizeCompanyMatch(raw) === normalized;
}

function normalizeCompanyMatch(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\s().,·ㆍ\-_/]+/gu, "");
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body));
}

function serveStatic(pathname, res) {
  let target = pathname === "/" ? "/index.html" : pathname;
  target = target.replace(/\.\.+/g, "");
  const filePath = join(staticDir, target);
  if (!existsSync(filePath)) {
    const indexPath = join(staticDir, "index.html");
    res.writeHead(200, { "content-type": mime[".html"] });
    createReadStream(indexPath).pipe(res);
    return;
  }
  res.writeHead(200, { "content-type": mime[extname(filePath)] ?? "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}

async function fetchJson(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10000);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function stripHtml(value) {
  return String(value)
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&apos;/g, "'");
}

function latestTradingDate(now = new Date()) {
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  let cursor = new Date(kstMs);
  const hour = cursor.getUTCHours();
  const minute = cursor.getUTCMinutes();
  if (!(hour > 16 || (hour === 16 && minute >= 30))) {
    cursor = new Date(kstMs - 86400000);
  }
  while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6) {
    cursor = new Date(cursor.getTime() - 86400000);
  }
  return `${cursor.getUTCFullYear()}${String(cursor.getUTCMonth() + 1).padStart(2, "0")}${String(cursor.getUTCDate()).padStart(2, "0")}`;
}

function dateDaysAgo(days) {
  const d = new Date(Date.now() - days * 86400000);
  return `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
}
