# Live API Integration Readiness

Date: 2026-05-05

## Decision

The next major product step after first-slice data backfill is live API
hardening. It should not be treated as a new architecture task because the
current advisor server already has a live-capable tool interface:

- DART disclosure list through `DART_API_KEY`;
- KRX end-of-day market rows through `KRX_API_KEY` or `KRX_AUTH_KEY`;
- Naver News search through `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`;
- deterministic answer composition unless a live LLM key and output contract
  are enabled.

The correct sequence is:

1. close first-slice source-package gaps;
2. promote source-backed company claims;
3. verify DART/KRX/Naver live calls against the same trace schema;
4. add source snapshot persistence and freshness labels;
5. only then use live LLM composition as an optional composer layer.

## Current Local Smoke Test

A local `/api/advisor` smoke test for Samsung returned this tool state after
adding the Naver News credentials and restarting the server:

| Tool step | Status | Meaning |
| --- | --- | --- |
| `dart.disclosures` | `live` | DART key and Samsung Electronics corp code are working for recent disclosure lookup. |
| `krx.market` | `live` | KRX key is working for the representative ticker end-of-day row. |
| `news.search` | `live` | Naver News OpenAPI returns recent public news results. |
| `wiki.context` | `local` | Compiled wiki namespace is loaded from local markdown. |
| `claims.sourceBacked` | `local` | Promoted claim manifest is used for bounded context. |
| `llm.compose` | `fixture` | Deterministic composer is active; live LLM is not required for this stage. |

The observed runtime mode remains `mixed`, which is expected because external
data tools are live while wiki context, source-backed claims, and deterministic
composition remain local/fixture by design.

## Five-Group Smoke Test

After the Naver credentials were added, the same smoke test was run for all
five first-screen groups. Each group returned live external data and preserved
the local source-backed harness:

| Group | DART | KRX/Market | Naver News | Wiki | Claims | Composer |
| --- | --- | --- | --- | --- | --- | --- |
| Samsung | `live` | `live` | `live` | `local` | `local` | `fixture` |
| SK | `live` | `live` | `live` | `local` | `local` | `fixture` |
| Hyundai Motor | `live` | `live` | `live` | `local` | `local` | `fixture` |
| LG | `live` | `live` | `live` | `local` | `local` | `fixture` |
| Hanwha | `live` | `live` | `live` | `local` | `local` | `fixture` |

This is the desired pre-live-LLM state: freshness-sensitive external signals
are live, while durable knowledge and visible answer structure remain governed
by the source-backed claim and deterministic composer layers.

The current reproducible smoke test is now executable:

```bash
npm run smoke:live-api
```

For a stricter run that starts a separate smoke server and disables the in-memory
server cache:

```bash
ADVISOR_SMOKE_NO_EXISTING_SERVER=1 npm run smoke:live-api
```

The latest cache-disabled run is recorded in
`docs/87_live_api_connection_smoke_test.md` and
`raw/manifests/live-api-smoke-test.json`. Result: DART 5/5 live, KRX 5/5 live,
Naver News 5/5 live, minimum selected source claims 5, max elapsed 1813 ms.

## Required User Inputs

No separate API key is needed per company. API keys are service-level secrets.
Company-specific routing depends on corp codes, KRX tickers, Yahoo tickers, and
source manifests.

Already available locally:

- `DART_API_KEY`;
- `KRX_API_KEY`.
- `NAVER_CLIENT_ID`;
- `NAVER_CLIENT_SECRET`.

Optional later:

- `ANTHROPIC_API_KEY` or another approved LLM provider key if live LLM
  composition is required.

## Integration Rules

Live API output must not bypass the harness. Every live result must be stored
or exposed through the same structures used by fixture and local sources:

- `processTrace` status must show `live`, `fixture`, `fallback`, `local`, or
  `error`;
- source links must identify whether the answer relies on DART, KRX, Naver, or
  local source-backed claims;
- answers must not expose raw API status prose in the customer UI;
- paper/evaluation traces may show tool status and elapsed time;
- runtime claims still require company scope and source-backed promotion before
  being treated as durable knowledge.

## Why API Integration Comes After Backfill

DART/KRX/Naver are freshness layers, not substitutes for the knowledge base.
They answer questions such as:

- What recent filings exist?
- What is the latest market-price row?
- What recent public news items match the target company?

They do not decide which historical IR document is authoritative, which claim
is eligible for runtime context, or whether a company has enough source-backed
coverage. Those decisions remain in the source-selection, claim-promotion, and
wiki layers.

## Immediate Next Step

The live API layer is connected for DART/KRX/Naver and should now move into
hardening, not architecture discovery. The next product checks are cache and
fallback policy, source freshness display, rate-limit behavior, and UI-level
answer review under live news and disclosure noise. Live LLM composition remains
later than these data-source checks.
