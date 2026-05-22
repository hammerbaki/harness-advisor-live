import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  groupsConfig,
  migrationBuckets,
  validateGroup
} from "./researchData";
import {
  buildBriefCards,
  displayCompactGroupName,
  displayGroupName,
  getMarketSnapshot
} from "./briefingTemplate";
import type { BriefCardModel, UiLocale } from "./briefingTemplate";
import { buildBriefCardQuestion, buildQuickQuestion, QUICK_ACTIONS } from "./questionTemplates";
import type {
  AdvisorAssemblyStep,
  AdvisorLink,
  AdvisorResponse,
  AdvisorSourceClaim,
  AdvisorTrace,
  GroupProfile
} from "./types";
import "./styles.css";

const DEV_UI_ENABLED = import.meta.env.VITE_ADVISOR_DEV_UI !== "0";
const RUNTIME_PROCESS_INTERVAL_MS = 680;
const UI_LOCALE: UiLocale = detectUiLocale();
const PAPER_CAPTURE_MODE = detectPaperCaptureMode();

interface HomeBriefingSnapshot {
  schemaVersion: string;
  groupId: string;
  representativeCompanyId?: string;
  generatedAt: string;
  market?: {
    companyId?: string;
    price: string;
    change: string;
    krxCode?: string;
    source?: string;
    sourceUrl?: string;
    status?: string;
  };
  cards?: BriefCardModel[];
  consistencyChecks?: Array<{ name: string; passed: boolean }>;
}

type RuntimeStepStatus = "queued" | "active" | "done" | "warn" | "error";

interface RuntimeStep {
  seq: number;
  title: string;
  detail: string;
  status: RuntimeStepStatus;
  source?: string;
  elapsedMs?: number;
}

function App() {
  const [activeGroupId, setActiveGroupId] = useState("samsung");
  const activeGroup =
    groupsConfig.groups.find((group) => group.id === activeGroupId) ?? groupsConfig.groups[0]!;

  return (
    <main className={PAPER_CAPTURE_MODE ? "product-page paper-capture" : "product-page"}>
      <DeviceFrame>
        <InvestorAdvisorApp
          group={activeGroup}
          groups={groupsConfig.groups}
          locale={UI_LOCALE}
          onGroupChange={setActiveGroupId}
        />
      </DeviceFrame>
      <ResearchAppendix group={activeGroup} />
    </main>
  );
}

function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="device-stage" aria-label="Mobile advisor demo">
      <div className="device-shell">
        <span className="antenna antenna-top-left" aria-hidden="true" />
        <span className="antenna antenna-top-right" aria-hidden="true" />
        <span className="antenna antenna-bottom-left" aria-hidden="true" />
        <span className="antenna antenna-bottom-right" aria-hidden="true" />
        <span className="side-button action-button" aria-hidden="true" />
        <span className="side-button volume-up" aria-hidden="true" />
        <span className="side-button volume-down" aria-hidden="true" />
        <span className="side-button power-button" aria-hidden="true" />
        <span className="side-button camera-control" aria-hidden="true" />
        <div className="screen-bezel" aria-hidden="true" />
        <div className="device-screen">
          <StatusBar />
          {children}
          <div className="home-indicator" />
        </div>
      </div>
    </section>
  );
}

function StatusBar() {
  const [time, setTime] = useState(() => formatClock(new Date()));
  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatClock(new Date())), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="statusbar">
      <span>{time}</span>
      <div className="dynamic-island" />
      <div className="status-glyphs" aria-hidden="true">
        <StatusGlyph name="signal" />
        <StatusGlyph name="wifi" />
        <StatusGlyph name="battery" />
      </div>
    </div>
  );
}

function StatusGlyph({ name }: { name: "battery" | "signal" | "wifi" }) {
  if (name === "signal") {
    return (
      <svg className="status-icon signal-icon" viewBox="0 0 28 18" aria-hidden="true">
        <rect x="1" y="11" width="4" height="6" rx="1" />
        <rect x="8" y="8" width="4" height="9" rx="1" />
        <rect x="15" y="4" width="4" height="13" rx="1" />
        <rect x="22" y="1" width="4" height="16" rx="1" />
      </svg>
    );
  }
  if (name === "wifi") {
    return (
      <svg className="status-icon wifi-icon" viewBox="0 0 26 18" aria-hidden="true">
        <path d="M2.5 5.5c5.9-5 15.1-5 21 0" />
        <path d="M7 10c3.4-2.8 8.6-2.8 12 0" />
        <circle cx="13" cy="14.2" r="1.8" />
      </svg>
    );
  }
  return (
    <svg className="status-icon battery-icon" viewBox="0 0 34 18" aria-hidden="true">
      <rect x="1.5" y="3.5" width="27" height="11" rx="3" />
      <path d="M31 7v4" />
      <rect className="battery-fill" x="5" y="6.5" width="17" height="5" rx="1.5" />
    </svg>
  );
}

function InvestorAdvisorApp({
  group,
  groups,
  locale,
  onGroupChange
}: {
  group: GroupProfile;
  groups: GroupProfile[];
  locale: UiLocale;
  onGroupChange: (id: string) => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [runtimeSteps, setRuntimeSteps] = useState<RuntimeStep[]>([]);
  const [processFinalized, setProcessFinalized] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answerMode, setAnswerMode] = useState("ready");
  const [presentationMode, setPresentationMode] = useState<"text" | "briefing">("text");
  const [isEntityMenuOpen, setEntityMenuOpen] = useState(false);
  const [homeBriefing, setHomeBriefing] = useState<HomeBriefingSnapshot | null>(null);
  const chatRef = useRef<HTMLElement | null>(null);
  const runIdRef = useRef(0);
  const hasConversation = messages.length > 0 || runtimeSteps.length > 0 || activeStep !== null || completed;
  const market = homeBriefing?.market ?? getMarketSnapshot(group);
  const briefCards = useMemo(
    () => homeBriefing?.cards?.length ? homeBriefing.cards : buildBriefCards(group, locale),
    [group, homeBriefing, locale]
  );
  const groupLabel = displayGroupName(group, locale);
  const compactGroupLabel = displayCompactGroupName(group, locale);

  useEffect(() => {
    let cancelled = false;
    setHomeBriefing(null);
    fetchHomeBriefing(group.id, locale)
      .then((snapshot) => {
        if (!cancelled) setHomeBriefing(snapshot);
      })
      .catch(() => {
        if (!cancelled) setHomeBriefing(null);
      });
    return () => {
      cancelled = true;
    };
  }, [group.id, locale]);

  useEffect(() => {
    setInput("");
    setMessages([]);
    setActiveStep(null);
    setRuntimeSteps([]);
    setProcessFinalized(false);
    setCompleted(false);
  }, [group]);

  useEffect(() => {
    const node = chatRef.current;
    if (!node) return;
    requestAnimationFrame(() => node.scrollTo({ top: node.scrollHeight, behavior: "smooth" }));
  }, [messages, runtimeSteps, activeStep, completed]);

  async function runQuestion(question = input) {
    const trimmed = question.trim();
    if (!trimmed) return;
    const runId = ++runIdRef.current;
    setInput("");
    setMessages((prev) => [...prev, { id: `${runId}-user`, role: "user", text: trimmed }]);
    setCompleted(false);
    setAnswerMode("running");
    const pendingSteps = buildPendingRuntimeSteps(group);
    setRuntimeSteps(markRuntimeStepProgress(pendingSteps, 0));
    setProcessFinalized(false);
    setActiveStep(0);

    const timer = window.setInterval(() => {
      setActiveStep((prev) => {
        if (prev === null) return 0;
        const next = Math.min(prev + 1, pendingSteps.length - 1);
        setRuntimeSteps((steps) => markRuntimeStepProgress(steps, next));
        return next;
      });
    }, RUNTIME_PROCESS_INTERVAL_MS);

    try {
      const response = await fetchAdvisor(group.id, trimmed, presentationMode);
      if (runId !== runIdRef.current) return;
      window.clearInterval(timer);
      setActiveStep(null);
      setRuntimeSteps(buildFinalRuntimeSteps(response.processTrace));
      setProcessFinalized(true);
      setCompleted(true);
      setAnswerMode(response.mode);
      setMessages((prev) => [
        ...prev,
        { id: `${runId}-assistant`, role: "assistant", text: response.answer, response }
      ]);
    } catch (error) {
      if (runId !== runIdRef.current) return;
      window.clearInterval(timer);
      setActiveStep(null);
      setRuntimeSteps(buildErrorRuntimeSteps(error));
      setProcessFinalized(true);
      setCompleted(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `${runId}-assistant-error`,
          role: "assistant",
          text: "API 호출이 실패했습니다. 로컬 환경변수와 API server 상태를 확인해 주세요."
        }
      ]);
    }
  }

  return (
    <div className="advisor-app">
      <header className="advisor-header">
        <button className="brand-block" type="button" onClick={() => setEntityMenuOpen((v) => !v)}>
          <span className="brand-logo-slot">
            <GroupLogo group={group} />
          </span>
          <span className="brand-text">
            <strong>{groupLabel}</strong>
          </span>
          <span className="selector-cue" aria-hidden="true">⌄</span>
        </button>
        <div className="ticker-block">
          <span className="price">{market.price}</span>
          <span className="up">▲ {market.change}</span>
        </div>
        {isEntityMenuOpen && (
          <div className="entity-menu">
            <div className="entity-menu-section">
              {groups.map((candidate) => (
                <button
                  className={candidate.id === group.id ? "active" : ""}
                  key={candidate.id}
                  type="button"
                  onClick={() => {
                    onGroupChange(candidate.id);
                    setEntityMenuOpen(false);
                  }}
                >
                  <span className="entity-menu-logo">
                    <GroupLogo group={candidate} />
                  </span>
                  <span className="entity-menu-copy">
                    <strong>{displayGroupName(candidate, locale)}</strong>
                    <span>{groupSelectorNote(candidate, locale)}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <section className={hasConversation ? "briefing compact" : "briefing"}>
        {briefCards.map((card) => (
          <BriefCard
            key={card.kind}
            card={card}
            group={group}
            locale={locale}
            onAsk={runQuestion}
            compact={hasConversation}
          />
        ))}
      </section>

      <main className="conversation" ref={chatRef}>
        {!hasConversation && <div className="empty-space" aria-hidden="true" />}
        {messages.map((message, index) => {
          const shouldShowProcessBeforeAnswer =
            message.role === "assistant" &&
            Boolean(message.response);

          return (
            <React.Fragment key={message.id}>
              {shouldShowProcessBeforeAnswer && (
                <AgentProcessPanel
                  finalized
                  mode={message.response!.trace.runtimeMode}
                  steps={buildFinalRuntimeSteps(message.response!.processTrace)}
                />
              )}
              <MessageBubble message={message} />
              {message.role === "assistant" && message.response && message.response.links.length > 0 && (
                <AnswerSources
                  links={message.response.links}
                  followUps={message.response.followUps}
                  devResponse={DEV_UI_ENABLED ? message.response : null}
                  onAsk={runQuestion}
                />
              )}
            </React.Fragment>
          );
        })}
        {runtimeSteps.length > 0 && messages[messages.length - 1]?.role !== "assistant" && (
          <AgentProcessPanel
            finalized={processFinalized}
            mode={answerMode}
            steps={runtimeSteps}
          />
        )}
      </main>

      <footer className="bottom-dock">
        <div className="mode-toolbar">
          <div className="mode-tabs" role="group" aria-label="응답 모드">
            <button
              className={presentationMode === "text" ? "active" : ""}
              type="button"
              onClick={() => setPresentationMode("text")}
            >
              {locale === "en" ? "Text" : "텍스트"}
            </button>
            <button
              className={presentationMode === "briefing" ? "active" : ""}
              type="button"
              onClick={() => setPresentationMode("briefing")}
            >
              {locale === "en" ? "Briefing" : "회의"}
            </button>
          </div>
          <button className="listen-button" type="button" aria-label="답변 음성으로 듣기">
            <Icon name="volume" />
            {presentationMode === "briefing" && <span>{locale === "en" ? "Voice summary" : "음성 요약"}</span>}
          </button>
        </div>
        <div className="quick-buttons">
          {QUICK_ACTIONS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => runQuestion(buildQuickQuestion(group, topic.id))}
            >
              {topic.id === "target" ? (locale === "en" ? "Group" : compactGroupLabel) : quickActionLabel(topic.id, locale)}
            </button>
          ))}
        </div>
        <div className="input-row">
          <button className="mic" type="button" aria-label="음성으로 질문">
            <Icon name="mic" />
          </button>
          <input
            aria-label="전략투자 컨설턴트에게 질문하기"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") runQuestion();
            }}
            placeholder={locale === "en" ? "Ask a market question" : "기업·시장·리스크를 질문하세요"}
          />
          <button className="send" type="button" onClick={() => runQuestion()} aria-label="전송">
            <Icon name="send" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return <div className="message user">{message.text}</div>;
  }
  return (
    <div className="message assistant rich-message">
      {renderAssistantMessage(message.text)}
    </div>
  );
}

function renderAssistantMessage(text: string) {
  return text
    .split(/\n{2,}/u)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => renderMessageBlock(block, index));
}

function renderMessageBlock(block: string, index: number) {
  const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
  const heading = lines[0]?.match(/^\*\*(.+?)\*\*$/u);
  if (heading) {
    return (
      <section className="message-section" key={`${heading[1]}-${index}`}>
        <strong className="message-heading">{heading[1]}</strong>
        {renderMessageLines(lines.slice(1), index)}
      </section>
    );
  }
  return (
    <section className="message-section" key={`section-${index}`}>
      {renderMessageLines(lines, index)}
    </section>
  );
}

function renderMessageLines(lines: string[], blockIndex: number) {
  if (lines.length === 0) return null;
  if (lines.every((line) => line.startsWith("- "))) {
    return (
      <ul className="message-list">
        {lines.map((line, index) => (
          <li key={`${blockIndex}-li-${index}`}>{renderInlineStrong(line.slice(2))}</li>
        ))}
      </ul>
    );
  }
  return lines.map((line, index) => {
    if (line.startsWith("- ")) {
      return (
        <p className="message-paragraph message-bullet" key={`${blockIndex}-p-${index}`}>
          {renderInlineStrong(line.slice(2))}
        </p>
      );
    }
    return (
      <p className="message-paragraph" key={`${blockIndex}-p-${index}`}>
        {renderInlineStrong(line)}
      </p>
    );
  });
}

function renderInlineStrong(value: string) {
  return value.split(/(\*\*[^*]+\*\*)/u).map((part, index) => {
    const match = part.match(/^\*\*([^*]+)\*\*$/u);
    if (match) return <strong key={`${match[1]}-${index}`}>{match[1]}</strong>;
    return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
  });
}

function BriefCard({
  card,
  group,
  locale,
  onAsk,
  compact
}: {
  card: BriefCardModel;
  group: GroupProfile;
  locale: UiLocale;
  onAsk: (question: string) => void;
  compact: boolean;
}) {
  const question = buildBriefCardQuestion(group, card);

  return (
    <article
      className={`brief-card brief-card-${card.kind} ${card.accent} ${compact ? "brief-card-compact" : ""}`}
      onClick={() => onAsk(question)}
    >
      <div className="brief-body">
        {compact ? (
          <div className="brief-signal">
            <strong>{compactCardLabel(card.label, locale)}</strong>
            <span>{card.headline}</span>
          </div>
        ) : (
          <>
            <div className="brief-meta">
              <span className="brief-icon" aria-hidden="true">
                <Icon name={card.kind === "news" ? "news" : card.kind === "stock" ? "trend" : "bar"} />
              </span>
              <strong>{card.label}</strong>
              <span> · {card.meta}</span>
            </div>
            <h2>{card.headline}</h2>
            <p>→ {card.body}</p>
            {card.source && (
              <a href={card.sourceUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
                {card.source} ↗
              </a>
            )}
            {card.footerLeft && (
              <div className="brief-footer">
                <span>{card.footerLeft}</span>
                <span>{card.footerRight} ⓘ</span>
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function AgentProcessPanel({
  finalized,
  steps,
  mode
}: {
  finalized: boolean;
  steps: RuntimeStep[];
  mode: string;
}) {
  const [expanded, setExpanded] = useState(!finalized);
  const wasFinalized = useRef(finalized);

  useEffect(() => {
    if (!wasFinalized.current && finalized) setExpanded(false);
    if (wasFinalized.current && !finalized) setExpanded(true);
    wasFinalized.current = finalized;
  }, [finalized]);

  const completedCount = finalized
    ? steps.length
    : steps.filter((step) => step.status !== "queued").length;
  const showRunningMode = !finalized && ["running", "error", "degraded"].includes(mode);

  return (
    <section className={`agent-panel ${finalized ? "finalized" : "running"}`} aria-live="polite">
      <button className="agent-panel-title" type="button" onClick={() => setExpanded((value) => !value)}>
        <span><Icon name={finalized ? "check" : "sync"} /></span>
        <strong>{finalized ? `지식이 회수됨(${steps.length})` : `자료를 수집하고 있습니다(${completedCount || 1})`}</strong>
        {showRunningMode && (
          <em className={`trace-mode ${mode}`} title={`runtime mode: ${mode}`}>
            {runtimeModeLabel(mode)}
          </em>
        )}
        <small className="agent-panel-chevron" aria-hidden="true">{expanded ? "⌃" : "⌄"}</small>
      </button>
      {expanded && (
        <ol>
          {steps.map((step) => (
            <li className={step.status} key={`${step.seq}-${step.title}`}>
              <span>{renderStepIcon(step.status, finalized)}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
                {(step.source || typeof step.elapsedMs === "number") && (
                  <small>
                    {step.source ?? "local"}
                    {typeof step.elapsedMs === "number" ? ` · ${step.elapsedMs}ms` : ""}
                  </small>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function runtimeModeLabel(mode: string) {
  return {
    running: "진행 중",
    ready: "대기",
    live: "실시간",
    mixed: "부분 연결",
    fixture: "샘플 원천",
    fallback: "대체 원천",
    degraded: "점검 필요",
    error: "오류"
  }[mode] ?? mode;
}

function renderStepIcon(status: RuntimeStepStatus, finalized: boolean) {
  if (status === "error") return "!";
  if (finalized || status === "done" || status === "warn") return <Icon name="check" />;
  if (status === "active") return <Icon name="sync" />;
  return "";
}

function buildPendingRuntimeSteps(group: GroupProfile): RuntimeStep[] {
  const groupName = displayGroupName(group);
  const representative = group.companies.find((company) => company.id === group.defaultCompanyId);
  const krxCode = representative?.krxCode ? `KRX ${representative.krxCode}` : "대표 종목코드";

  return [
    {
      seq: 1,
      title: "질문 분석",
      detail: `${groupName} 프로필, 대표 상장사, ${krxCode}, wiki namespace를 확인합니다.`,
      status: "queued"
    },
    {
      seq: 2,
      title: "DART 공시 확인",
      detail: "최근 공시와 정기보고서 후보를 tool contract 기준으로 조회합니다.",
      status: "queued"
    },
    {
      seq: 3,
      title: "시장 데이터 확인",
      detail: "KRX/Yahoo 기준 시세와 변동률을 같은 schema로 정규화합니다.",
      status: "queued"
    },
    {
      seq: 4,
      title: "뉴스 검색",
      detail: "공개 뉴스 후보를 검색하고 투자자 질문과 관련된 항목을 선별합니다.",
      status: "queued"
    },
    {
      seq: 5,
      title: "LLM Wiki 대조",
      detail: "compiled wiki, stale note, source-backed claim을 대조합니다.",
      status: "queued"
    },
    {
      seq: 6,
      title: "답변 합성",
      detail: "숫자, 날짜, 출처 상태를 검증한 뒤 투자자용 답변을 구성합니다.",
      status: "queued"
    }
  ];
}

function markRuntimeStepProgress(steps: RuntimeStep[], activeIndex: number) {
  return steps.map((step, index) => {
    if (index < activeIndex) return { ...step, status: "done" as const };
    if (index === activeIndex) return { ...step, status: "active" as const };
    return { ...step, status: "queued" as const };
  });
}

function buildFinalRuntimeSteps(trace: AdvisorTrace[]): RuntimeStep[] {
  if (trace.length === 0) {
    return [
      {
        seq: 1,
        title: "답변 구성 완료",
        detail: "서버 trace가 비어 있습니다. API trace contract를 점검해야 합니다.",
        status: "warn"
      }
    ];
  }

  return trace.map((item, index) => ({
    seq: index + 1,
    title: runtimeTraceTitle(item.label),
    detail: item.summary,
    status: traceStatusToRuntimeStatus(item.status),
    source: item.source,
    elapsedMs: item.elapsedMs
  }));
}

function buildErrorRuntimeSteps(error: unknown): RuntimeStep[] {
  const detail = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  return [
    {
      seq: 1,
      title: "API 호출 실패",
      detail,
      status: "error"
    }
  ];
}

function traceStatusToRuntimeStatus(status: AdvisorTrace["status"]): RuntimeStepStatus {
  if (status === "error") return "error";
  if (status === "fixture" || status === "fallback") return "warn";
  return "done";
}

function runtimeTraceTitle(label: string) {
  return {
    "dart.disclosures": "DART 공시 확인",
    "krx.market": "시장 데이터 확인",
    "news.search": "뉴스 검색",
    "wiki.context": "LLM Wiki 대조",
    "claims.sourceBacked": "근거 claim 선택",
    "llm.compose": "답변 합성"
  }[label] ?? label;
}

function AnswerSources({
  links,
  followUps,
  devResponse,
  onAsk
}: {
  links: AdvisorLink[];
  followUps: string[];
  devResponse: AdvisorResponse | null;
  onAsk: (question: string) => void;
}) {
  return (
    <section className="answer-pack">
      <h3>출처 링크</h3>
      <div className="link-list">
        {links.map((link) => (
          <a href={link.href} target="_blank" rel="noreferrer" key={`${link.href}-${link.label}`}>
            {link.label} ↗
          </a>
        ))}
      </div>
      {devResponse && <DevTracePanel response={devResponse} />}
      <h3>후속 질문</h3>
      <div className="followups">
        {followUps.map((question) => (
          <button key={question} type="button" onClick={() => onAsk(question)}>
            {question}
          </button>
        ))}
      </div>
    </section>
  );
}

function DevTracePanel({ response }: { response: AdvisorResponse }) {
  const [open, setOpen] = useState(false);
  const sections = useMemo(() => extractAnswerSections(response.answer), [response.answer]);
  const checks = useMemo(() => buildDevChecks(response, sections), [response, sections]);
  const statusSummary = summarizeTraceStatuses(response.processTrace);
  const answerAssembly = response.answerAssembly ?? [];

  return (
    <section className="dev-trace-panel">
      <button className="dev-trace-toggle" type="button" onClick={() => setOpen((value) => !value)}>
        <span>
          <em>DEV</em>
          검증 보기
        </span>
        <small title={`runtime mode: ${response.trace.runtimeMode}`}>
          {runtimeModeLabel(response.trace.runtimeMode)} · {response.elapsedMs}ms
        </small>
      </button>
      {open && (
        <div className="dev-trace-body">
          <div className="dev-trace-header">
            <strong>Answer Assembly</strong>
            <span>{response.trace.schemaVersion}</span>
          </div>

          <dl className="dev-kv">
            <div>
              <dt>run</dt>
              <dd>{response.trace.runId.slice(0, 16)}</dd>
            </div>
            <div>
              <dt>mode</dt>
              <dd>{response.mode} · {response.trace.llmMode}</dd>
            </div>
            <div>
              <dt>policy</dt>
              <dd>{response.trace.promptPolicyVersion}</dd>
            </div>
            <div>
              <dt>sources</dt>
              <dd>{statusSummary}</dd>
            </div>
          </dl>

          {response.traceExportUrl && (
            <a className="trace-export-link dev-trace-export" href={response.traceExportUrl} target="_blank" rel="noreferrer">
              평가 trace JSON 열기 ↗
            </a>
          )}

          <div className="dev-section">
            <h4>Quality Checks</h4>
            <ul className="dev-checks">
              {checks.map((check) => (
                <li className={check.status} key={check.label}>
                  <strong>{check.label}</strong>
                  <span>{check.detail}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dev-section">
            <h4>Answer Sections</h4>
            <div className="dev-section-tags">
              {sections.length > 0 ? sections.map((section) => <span key={section}>{section}</span>) : <em>섹션 없음</em>}
            </div>
          </div>

          <div className="dev-section">
            <h4>Answer Pipeline</h4>
            <ol className="dev-assembly">
              {answerAssembly.length > 0
                ? answerAssembly.map((step) => <DevAssemblyStep step={step} key={step.id} />)
                : <li className="warn"><strong>pipeline 없음</strong><p>서버 응답에 answerAssembly가 없습니다.</p></li>}
            </ol>
          </div>

          <div className="dev-section">
            <h4>Tool Trace</h4>
            <ol className="dev-tool-trace">
              {response.processTrace.map((item) => (
                <li key={`${item.label}-${item.elapsedMs}`}>
                  <div>
                    <strong>{devTraceLabel(item.label)}</strong>
                    <span className={`dev-status ${item.status}`}>{statusLabel(item.status)}</span>
                  </div>
                  <p>{item.summary}</p>
                  <small>{item.source ?? "unknown"} · {item.elapsedMs}ms</small>
                </li>
              ))}
            </ol>
          </div>

          <div className="dev-section">
            <h4>Selected Claims</h4>
            <div className="dev-claim-list">
              {response.sourceClaims.length > 0
                ? response.sourceClaims.map((claim) => <DevClaimCard claim={claim} key={claim.id} />)
                : <em>선택된 source-backed claim 없음</em>}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function DevAssemblyStep({ step }: { step: AdvisorAssemblyStep }) {
  return (
    <li className={step.status}>
      <div>
        <strong>{step.title}</strong>
        <span>{step.owner}</span>
      </div>
      <p>{step.summary}</p>
      <small>
        in {step.inputs.join(" · ")}
      </small>
      <small>
        out {step.outputs.join(" · ")}
      </small>
    </li>
  );
}

function DevClaimCard({ claim }: { claim: AdvisorSourceClaim }) {
  const href = claim.officialSourceUrl ?? claim.officialDownloadUrl;
  const body = (
    <>
      <span>
        <strong>{claim.id}</strong>
        <small>{claim.claimType}</small>
      </span>
      <p>{claim.claimText}</p>
      <em>{claim.sourceTitle} · {claim.runtimeUsePolicy}</em>
    </>
  );
  if (!href) return <div className="dev-claim-card">{body}</div>;
  return (
    <a className="dev-claim-card" href={href} target="_blank" rel="noreferrer">
      {body}
    </a>
  );
}

function extractAnswerSections(answer: string) {
  return [...answer.matchAll(/^\*\*(.+?)\*\*$/gmu)].map((match) => match[1]);
}

function buildDevChecks(response: AdvisorResponse, sections: string[]) {
  const devLeakPatterns = [
    "근거 패키지",
    "이번 답변의 공식 근거",
    "sourceBacked",
    "advisor-trace",
    "fixture:",
    "claim id"
  ];
  const leakedTerms = devLeakPatterns.filter((term) => response.answer.includes(term));
  const traceStatuses = response.processTrace.map((item) => item.status);
  const fixtureCount = traceStatuses.filter((status) => status === "fixture").length;
  const fallbackCount = traceStatuses.filter((status) => status === "fallback").length;
  const assembly = response.answerAssembly ?? [];
  const failedAssembly = assembly.filter((step) => step.status === "fail");

  return [
    {
      label: "개발문구 분리",
      status: leakedTerms.length > 0 ? "fail" : "pass",
      detail: leakedTerms.length > 0 ? leakedTerms.join(", ") : "사용자 답변에서 숨김"
    },
    {
      label: "섹션 구조",
      status: sections.length >= 3 ? "pass" : "warn",
      detail: sections.length > 0 ? sections.join(" · ") : "섹션 헤더 없음"
    },
    {
      label: "근거 claim",
      status: response.sourceClaims.length > 0 ? "pass" : "warn",
      detail: `${response.sourceClaims.length}개 선택`
    },
    {
      label: "답변 조립 trace",
      status: failedAssembly.length > 0 ? "fail" : assembly.length >= 5 ? "pass" : "warn",
      detail: failedAssembly.length > 0 ? failedAssembly.map((step) => step.id).join(", ") : `${assembly.length}단계`
    },
    {
      label: "원천 상태",
      status: fixtureCount > 0 || fallbackCount > 0 ? "warn" : "pass",
      detail: `fixture ${fixtureCount} · fallback ${fallbackCount}`
    }
  ];
}

function summarizeTraceStatuses(trace: AdvisorTrace[]) {
  const counts = trace.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = (acc[item.status] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([status, count]) => `${status} ${count}`).join(" · ");
}

function devTraceLabel(label: string) {
  return {
    "dart.disclosures": "DART 공시",
    "krx.market": "시장 데이터",
    "news.search": "뉴스 검색",
    "wiki.context": "Wiki Context",
    "claims.sourceBacked": "Source-backed Claims",
    "llm.compose": "Answer Composer"
  }[label] ?? label;
}

function statusLabel(status: AdvisorTrace["status"]) {
  return {
    live: "live",
    fallback: "fallback",
    fixture: "fixture",
    local: "local",
    error: "error"
  }[status];
}

function ResearchAppendix({ group }: { group: GroupProfile }) {
  const validation = useMemo(() => validateGroup(group), [group]);
  return (
    <section className="research-appendix">
      <div>
        <p className="eyebrow">Research appendix</p>
        <h1>Reproducible product reconstruction</h1>
        <p>
          모바일 UI는 원본 PoC의 현재 경험을 복원하고, 역할은 내부 경영진 전략 참모에서 공개 데이터 기반
          가치투자 전략 컨설턴트로 재포지셔닝합니다.
        </p>
      </div>
      <div className="appendix-grid">
        <div>
          <h2>Profile checks</h2>
          {validation.map((item) => (
            <p key={item.label}>
              <strong>{item.label}</strong>: {item.detail}
            </p>
          ))}
        </div>
        <div>
          <h2>Migration buckets</h2>
          {migrationBuckets.map((bucket) => (
            <p key={bucket.label}>
              <strong>{bucket.label}</strong>: {bucket.items.length} items
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  response?: AdvisorResponse;
}

async function fetchAdvisor(
  groupId: string,
  question: string,
  presentationMode: "text" | "briefing"
): Promise<AdvisorResponse> {
  const res = await fetch("/api/advisor", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ groupId, question, presentationMode })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 180)}`);
  }
  return (await res.json()) as AdvisorResponse;
}

async function fetchHomeBriefing(groupId: string, locale: UiLocale): Promise<HomeBriefingSnapshot> {
  const res = await fetch(`/api/briefing?groupId=${encodeURIComponent(groupId)}&locale=${locale}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 180)}`);
  }
  return (await res.json()) as HomeBriefingSnapshot;
}

function Icon({ name }: { name: "bar" | "check" | "mic" | "news" | "send" | "sync" | "trend" | "volume" }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };

  if (name === "news") {
    return (
      <svg {...common}>
        <path d="M6 4h10a2 2 0 0 1 2 2v14H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M8 8h6M8 12h8M8 16h5" />
        <path d="M18 8h2v10a2 2 0 0 1-2 2" />
      </svg>
    );
  }
  if (name === "trend") {
    return (
      <svg {...common}>
        <path d="m4 16 5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
      </svg>
    );
  }
  if (name === "bar") {
    return (
      <svg {...common}>
        <path d="M5 20V9M12 20V4M19 20v-7" />
        <path d="M3 20h18" />
      </svg>
    );
  }
  if (name === "mic") {
    return (
      <svg {...common}>
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8" />
      </svg>
    );
  }
  if (name === "send") {
    return (
      <svg {...common}>
        <path d="m21 3-7.5 18-4-8.5L3 9l18-6Z" />
        <path d="M9.5 12.5 21 3" />
      </svg>
    );
  }
  if (name === "volume") {
    return (
      <svg {...common}>
        <path d="M4 10v4h4l5 4V6L8 10H4Z" />
        <path d="M16 9a4 4 0 0 1 0 6" />
        <path d="M19 6a8 8 0 0 1 0 12" />
      </svg>
    );
  }
  if (name === "sync") {
    return (
      <svg {...common}>
        <path d="M20 11a8 8 0 0 0-14.5-4L4 9" />
        <path d="M4 4v5h5" />
        <path d="M4 13a8 8 0 0 0 14.5 4L20 15" />
        <path d="M20 20v-5h-5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function formatClock(date: Date) {
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function groupSelectorNote(group: GroupProfile, locale: UiLocale) {
  if (locale === "ko") return group.selectorNote;
  return {
    samsung: "semiconductors · battery · bio",
    sk: "semiconductors · energy · telecom",
    "hyundai-motor": "autos · parts · logistics",
    lg: "electronics · battery · telecom",
    hanwha: "defense · energy · shipbuilding"
  }[group.id] ?? "public-source coverage";
}

function quickActionLabel(id: string, locale: UiLocale) {
  if (locale === "en") {
    return {
      market: "Market",
      global: "Global",
      rival: "Peers",
      filing: "Filings"
    }[id] ?? id;
  }
  return QUICK_ACTIONS.find((topic) => topic.id === id)?.label ?? id;
}

function compactCardLabel(label: string, locale: UiLocale) {
  if (locale === "en") return label.replace(/\s*Brief$/u, "");
  return label.replace(/\s*브리프$/u, "");
}

function detectUiLocale(): UiLocale {
  const params = new URLSearchParams(window.location.search);
  return params.get("paper") === "en" || params.get("lang") === "en" ? "en" : "ko";
}

function detectPaperCaptureMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("capture") === "paper";
}

function GroupLogo({ group }: { group: GroupProfile }) {
  const logo = group.logoAsset;
  const classId = group.id === "hyundai-motor" ? "hyundai" : group.id;
  return (
    <span className={`group-logo group-logo-${classId} group-logo-slot-${logo.slot}`} aria-label={logo.label}>
      <img src={logo.src} alt="" />
    </span>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
