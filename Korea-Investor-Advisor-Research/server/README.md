# Server

This folder contains the fixture-compatible advisor API used by the mobile demo.

Endpoints:

```text
GET  /api/healthz
GET  /api/groups
POST /api/advisor
```

`POST /api/advisor` runs the current public-data tool interface:

- DART disclosures through `DART_API_KEY`, otherwise fixture disclosure output;
- KRX EOD market data through `KRX_API_KEY` or `KRX_AUTH_KEY`, otherwise Yahoo
  Finance fallback when a Yahoo ticker exists;
- Naver News through `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET`, otherwise
  fixture news output;
- Anthropic Messages through `ANTHROPIC_API_KEY`, otherwise deterministic answer
  composition.

The server always returns links, follow-up questions, and a process trace so the
UI can show how the answer was produced. This trace is important for the paper:
it makes fixture, fallback, and live runs distinguishable.
