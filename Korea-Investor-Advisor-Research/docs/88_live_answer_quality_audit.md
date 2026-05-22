# Live Answer Quality Audit

Generated: 2026-05-07T14:47:17.314Z

## Purpose

This audit checks whether live DART/KRX/Naver inputs preserve investor-facing answer quality. It is stricter than the API connectivity smoke test: it checks visible answer hygiene, source links, follow-up questions, selected source-backed claims, and trace export.

## Summary

- Samples: 15
- Pass samples: 15
- Warning samples: 0
- Blocker samples: 0
- Average score: 100/100
- Server mode: spawned-quality-audit-server
- Cache policy: memory-cache-disabled

## Check Failures

- None.

## Sample Results

| Scenario | Group | Status | Score | Claims | Links | Follow-ups | Elapsed ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `samsung-news-disclosure-brief` | `samsung` | `pass` | 100 | 5 | 5 | 4 | 2537 |
| `samsung-financial-brief` | `samsung` | `pass` | 100 | 5 | 5 | 4 | 1874 |
| `samsung-market-risk-brief` | `samsung` | `pass` | 100 | 5 | 5 | 4 | 1882 |
| `sk-news-disclosure-brief` | `sk` | `pass` | 100 | 5 | 5 | 4 | 1565 |
| `sk-financial-brief` | `sk` | `pass` | 100 | 5 | 5 | 4 | 2090 |
| `sk-market-risk-brief` | `sk` | `pass` | 100 | 5 | 5 | 4 | 1924 |
| `hyundai-motor-news-disclosure-brief` | `hyundai-motor` | `pass` | 100 | 3 | 5 | 4 | 1766 |
| `hyundai-motor-financial-brief` | `hyundai-motor` | `pass` | 100 | 3 | 5 | 4 | 2193 |
| `hyundai-motor-market-risk-brief` | `hyundai-motor` | `pass` | 100 | 3 | 5 | 4 | 1643 |
| `lg-news-disclosure-brief` | `lg` | `pass` | 100 | 5 | 5 | 4 | 1866 |
| `lg-financial-brief` | `lg` | `pass` | 100 | 5 | 5 | 4 | 2148 |
| `lg-market-risk-brief` | `lg` | `pass` | 100 | 5 | 5 | 4 | 1761 |
| `hanwha-news-disclosure-brief` | `hanwha` | `pass` | 100 | 5 | 5 | 4 | 2230 |
| `hanwha-financial-brief` | `hanwha` | `pass` | 100 | 5 | 5 | 4 | 2272 |
| `hanwha-market-risk-brief` | `hanwha` | `pass` | 100 | 5 | 5 | 4 | 1917 |

## Interpretation

No blocker was found. Warning samples, if any, should be reviewed by a human because investor-facing tone quality is partly judgment-based.

## Next Review

The next human review should read the warning samples first, then decide whether answer tone needs expert investment-research editing. This audit does not replace expert judgment; it protects against obvious product regressions.

