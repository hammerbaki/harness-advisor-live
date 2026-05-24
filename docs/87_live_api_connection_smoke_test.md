# Live API Connection Smoke Test

Generated: 2026-05-24T03:58:49.392Z

## Purpose

This smoke test verifies that the local advisor API can call DART, KRX, and Naver News with the configured service-level credentials. Secret values are loaded from the local environment or `.env` and are not written to this document.

## Summary

- Groups checked: 5
- Server mode: spawned-smoke-server
- Cache policy: server-default-cache-policy
- All required API traces live: yes
- DART live groups: 5/5
- KRX live groups: 5/5
- Naver News live groups: 5/5
- Minimum selected source claims: 5
- Max elapsed ms: 1817

## Group Results

| Group | Runtime | DART | KRX | News | Claims | Elapsed ms |
| --- | --- | --- | --- | --- | --- | --- |
| `samsung` | mixed | live | live | live | 5 | 1817 |
| `sk` | mixed | live | live | live | 5 | 414 |
| `hyundai-motor` | mixed | live | live | live | 5 | 128 |
| `lg` | mixed | live | live | live | 5 | 86 |
| `hanwha` | mixed | live | live | live | 5 | 91 |

## Interpretation

This is a connectivity smoke test, not a claim that live data is production-hardened. Product use still requires cache policy, fallback behavior, source freshness display, rate-limit handling, monitoring, and UI-level answer review.

