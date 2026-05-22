# Live API Connection Smoke Test

Generated: 2026-05-09T05:32:22.264Z

## Purpose

This smoke test verifies that the local advisor API can call DART, KRX, and Naver News with the configured service-level credentials. Secret values are loaded from the local environment or `.env` and are not written to this document.

## Summary

- Groups checked: 5
- Server mode: existing-local-server
- Cache policy: may-use-existing-memory-cache
- All required API traces live: yes
- DART live groups: 5/5
- KRX live groups: 5/5
- Naver News live groups: 5/5
- Minimum selected source claims: 5
- Max elapsed ms: 190

## Group Results

| Group | Runtime | DART | KRX | News | Claims | Elapsed ms |
| --- | --- | --- | --- | --- | --- | --- |
| `samsung` | mixed | live | live | live | 5 | 190 |
| `sk` | mixed | live | live | live | 5 | 96 |
| `hyundai-motor` | mixed | live | live | live | 5 | 108 |
| `lg` | mixed | live | live | live | 5 | 94 |
| `hanwha` | mixed | live | live | live | 5 | 90 |

## Interpretation

This is a connectivity smoke test, not a claim that live data is production-hardened. Product use still requires cache policy, fallback behavior, source freshness display, rate-limit handling, monitoring, and UI-level answer review.

