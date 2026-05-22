# Tool Interface Stage

Implementation date: 2026-04-30

## Runtime

The Replit demo now runs two local services:

```text
Vite frontend  : http://localhost:5173
Advisor API    : http://localhost:8787
```

`npm run dev` starts both through:

```text
scripts/dev.mjs
```

Production preview runs:

```bash
npm run build
npm run preview
```

The preview server serves the built frontend and the same `/api/*` endpoints.

## API Endpoints

```text
GET  /api/healthz
GET  /api/groups
POST /api/advisor
```

`POST /api/advisor` request:

```json
{
  "groupId": "samsung",
  "question": "삼성 최근 투자 포인트를 공시와 뉴스 기준으로 요약해줘"
}
```

Samsung is the neutral investor-facing default. Hanwha remains the reference
slice for proving the repeatable data/RAG/wiki/prompt-policy reconstruction
method before the same bundle is expanded to other selected targets.

Response includes:

- answer,
- source links,
- follow-up questions,
- trace envelope,
- process trace,
- tool outputs,
- live/fixture mode for each tool.

The trace envelope is versioned as `advisor-trace.v0.1`; see
`docs/11_traceable_demo_architecture.md`.

## Tool Interfaces

### DART

Live source:

```text
https://opendart.fss.or.kr/api/list.json
```

Required secret:

```text
DART_API_KEY
```

Fallback:

```text
fixture:dart
```

### KRX / Market

Primary live source:

```text
https://data-dbg.krx.co.kr/svc/apis/sto/stk_bydd_trd
```

Required secret:

```text
KRX_API_KEY
```

Alternative accepted name:

```text
KRX_AUTH_KEY
```

If no KRX key is available, the market tool attempts a live Yahoo Finance chart
fallback using the configured Yahoo ticker.

### News

Live source:

```text
https://openapi.naver.com/v1/search/news.json
```

Required secrets:

```text
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
```

Fallback:

```text
fixture:news
```

### LLM

Live source:

```text
Anthropic Messages API
```

Required secret:

```text
ANTHROPIC_API_KEY
```

Optional model override:

```text
LLM_MODEL
```

Fallback:

```text
deterministic-composer
```

## Browser Verification

Verified in the in-app browser at:

```text
http://localhost:5173/
```

Observed trace without Replit Secrets:

```text
dart.disclosures · fixture
krx.market · fallback
news.search · fixture
llm.compose · fixture
```

This confirms the interface layer is connected even when credentials are absent.

## Important Limitation

This stage implements live-capable interfaces, not a full production advisor.
Still pending:

- persisted source snapshots,
- downloadable evaluation trace,
- live chart rendering,
- streaming LLM tokens,
- STT/TTS,
- auth/rate limiting,
- proper finance-domain disclaimers and compliance review.
