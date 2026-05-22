# Latency Hardening And Measurement

Date: 2026-05-03

## Purpose

The common harness already passes source, trace, answer, and UI-safety checks
across Hanwha, Samsung, and SK frozen scenarios. The remaining product
weakness is latency. This document records the first latency-hardening step so
that performance changes remain reproducible and paper-safe.

## What Changed

The advisor server now performs independent context collection steps in
parallel:

```text
dart.disclosures
krx.market
news.search
wiki.context
claims.sourceBacked
```

The trace order remains deterministic. Even though collection runs in
parallel, `processTrace` is written in the same fixed order expected by the
evaluation scenarios.

The server also caches local wiki context and source-backed claim manifests in
process memory. This avoids repeated filesystem reads during frozen scenario
evaluation and repeated demo questions. The cache can be disabled with:

```bash
ADVISOR_DISABLE_MEMORY_CACHE=1
```

Runtime cache prewarming is enabled by default. On server start, the API warms
wiki pages, source-backed claim manifests, and the latest KRX daily row table
when a KRX key is present. It can be disabled with:

```bash
ADVISOR_PREWARM=0
```

## Why This Is A Harness Change

This is not a prompt change and not an LLM-quality change. It keeps the same
source rules, claim rules, and output contract, while reducing the amount of
serial waiting before answer composition. This matches the project principle:
when behavior can be made deterministic and measurable in code, it should not
be left to the prompt.

## Measurement Command

Latency can be summarized from frozen evaluation results and exported traces:

```bash
npm run latency:advisor
```

The output is:

```text
evals/dashboard/advisor-latency-baseline.2026-05-03.json
```

The report measures:

- scenario count;
- average, median, p90, and max latency;
- latency-budget pass rate;
- step-level latency by trace label;
- group-step latency breakdown;
- slowest scenarios.

## Evaluation Rule

Latency is currently a non-required paper-stage check. A scenario may pass the
paper baseline while failing the product latency budget. For commercial
readiness, the latency budget should become stricter and eventually required.

## Product Interpretation

The first hardening target is repeated local and fixture-compatible demo use.
Live DART, KRX, news, and LLM calls will need additional provider-level caching,
timeouts, retry policy, and cost controls before they become the default
production path.

## Baseline Measurement

Before hardening, the combined Hanwha, Samsung, and SK frozen scenarios showed:

| Metric | Result |
| --- | ---: |
| Scenarios | 14 |
| Average latency | 2008.57ms |
| Median latency | 2156ms |
| p90 latency | 2467ms |
| Max latency | 2474ms |
| Latency-budget pass | 2/14 |
| Average score | 97.43/100 |

Step-level diagnosis:

| Step | Average latency |
| --- | ---: |
| `krx.market` | 1904.86ms |
| `dart.disclosures` | 99.57ms |
| `wiki.context` | 2.79ms |
| `claims.sourceBacked` | 0.50ms |
| `news.search` | 0.07ms |

The bottleneck was not LLM composition or local RAG/wiki loading. It was the
market-data path. KRX returns a daily market table, so requesting it
independently for each company repeated the same expensive table fetch.

## Optimized Measurement

After parallel collection and in-process caching of KRX daily rows, DART
disclosures, news results, wiki context, and source-backed claim manifests, the
same frozen scenarios showed:

| Metric | Result |
| --- | ---: |
| Scenarios | 14 |
| Average latency | 171.14ms |
| Median latency | 86ms |
| p90 latency | 143ms |
| Max latency | 1534ms |
| Latency-budget pass | 13/14 |
| Average score | 99.79/100 |

Optimized artifact:

```text
evals/dashboard/advisor-latency-optimized.2026-05-03.json
```

The only remaining latency-budget failure was the first Hanwha scenario, which
performed the initial KRX table fetch before the process cache was warm. The
server now includes startup prewarming so subsequent runs and demos can avoid
that cold-start path when a KRX key is configured.
