# Hanwha-to-Samsung Transfer Audit

Date: 2026-05-03

## Verdict

Hanwha can be used as the reference template for Samsung, and the current
Samsung implementation does not show a blocking architecture problem.

The transfer is valid under a bounded claim:

```text
Hanwha demonstrates the reference architecture. Samsung demonstrates the first
template-transfer slice with affiliate-level routing.
```

It is not yet valid to claim:

```text
The full Samsung group, all Samsung affiliates, or all five Korean groups are
commercially complete.
```

## What Was Checked

This audit checked whether the Hanwha reference slice transfers to Samsung
across the dimensions that matter for the paper and product:

- source inventory and extraction chain;
- source-backed claim schema;
- LLM Wiki namespace;
- runtime source routing;
- group-level UI with affiliate-level company routing;
- visible answer quality and development-trace separation;
- frozen evaluation scenarios;
- Agent Dog paper-stage quality seed;
- Replit/demo readiness.

## Evidence From Validators

### Hanwha

Command:

```bash
npm run validate:hanwha-ingestion
```

Result:

```text
Hanwha ingestion validation passed: 45 local files, 37/37 PDF extractions, 106 claim candidates.
Warning: official-site-scan has 86 official downloads absent locally; scope must be declared.
```

Interpretation:

- Hanwha is deep enough to remain the reference slice.
- The source scope is not complete across every official download; the paper
  must describe Hanwha as a reference slice, not exhaustive official-site
  coverage.

### Samsung

Commands:

```bash
npm run validate:samsung-ingestion
npm run validate:samsung-financials
npm run validate:samsung-claims
npm run validate:samsung-narrative
```

Results:

```text
Samsung ingestion validation passed: 43 local files, 40/40 valid local PDFs,
40/40 PDF extractions, 10 DART viewer filings.

Samsung financial validation passed.
Samsung source-backed claim validation passed: 31 claims checked.
Samsung narrative readiness validation passed: 50 URL intake entries,
6 narrative queue themes.
```

Warnings:

- Samsung Life, Fire, Card, and Securities have partial or missing OpenDART
  financial-sector revenue records for some years.
- Financial-company revenue is intentionally left blank unless OpenDART
  explicitly provides `매출액`, `영업수익`, or `수익(매출액)`.
- One Samsung C&T local issuer document still needs a document-level URL.

Interpretation:

- Samsung is ready as a first transfer slice.
- The finance-sector boundary is correct for the paper: the project does not
  define financial-company revenue by itself.
- Samsung is not yet full group coverage; it is a verified first-transfer
  layer covering selected high-materiality affiliates and themes.

## Source-Backed Claim Comparison

| Dimension | Hanwha | Samsung | Transfer Judgment |
| --- | --- | --- | --- |
| Runtime source-backed claims | 11 | 31 | Compatible |
| Official URL/download present | 11/11 | 31/31 | Compatible |
| Missing required claim fields | 0 | 0 | Compatible |
| `companyId` coverage | 0/11 | 31/31 | Samsung improves the template |
| Claim scope | Group/reference-slice | Affiliate-aware first-transfer slice | Compatible with caveat |

The `companyId` difference is important. It is not a blocker because Hanwha was
rebuilt as a group-level reference slice, while Samsung requires affiliate-level
routing. However, this is a template improvement:

```text
For every future multi-affiliate group, source-backed claims should include
companyId whenever the claim is tied to a specific listed or material affiliate.
```

For future Hanwha affiliate-level questions, Hanwha claims should eventually be
backfilled with company IDs. This is not required for the current Hanwha
reference scenarios, but it would strengthen commercial reuse.

## Frozen Evaluation Results

### Hanwha Regression Check

Command:

```bash
ADVISOR_EVAL_BASE_URL=http://127.0.0.1:5173 \
ADVISOR_EVAL_DATE=2026-05-03 \
npm run eval:advisor
```

Result:

```text
Advisor auto-eval complete: 5 scenario(s)
Average score: 97/100
Paper baseline: 5/5
Required failures: 0
Result: evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-03.json
```

### Samsung Transfer Check

Command:

```bash
ADVISOR_EVAL_SCENARIO=evals/scenarios/samsung.reference-slice.json \
ADVISOR_EVAL_DATE=2026-05-03 \
ADVISOR_EVAL_BASE_URL=http://127.0.0.1:5173 \
npm run eval:advisor
```

Result:

```text
Advisor auto-eval complete: 5 scenario(s)
Average score: 97/100
Paper baseline: 5/5
Required failures: 0
Result: evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json
```

### Interpreting The 97/100 Score

Both Hanwha and Samsung lose only the latency-budget check in the current
evaluation run. Required source, trace, answer-quality, follow-up, and
development-leak checks pass.

This means the current issue is not architectural transfer failure. It is a
speed/product-hardening issue. KRX/DART live calls should eventually be cached,
timed out, or preloaded for production use.

## Runtime Routing Result

The Samsung transfer now checks `expectedRepresentativeCompanyId` in frozen
scenarios.

Observed routes:

| Scenario | Expected route | Observed route | Result |
| --- | --- | --- | --- |
| Samsung Electronics HBM/memory | `samsung-electronics` | `samsung-electronics` | Pass |
| Samsung SDI ESS/profitability | `samsung-sdi` | `samsung-sdi` | Pass |
| Samsung C&T shareholder letter | `samsung-ct` | `samsung-ct` | Pass |
| Samsung Biologics orders/guidance | `samsung-biologics` | `samsung-biologics` | Pass |
| Samsung Life/Fire capital-dividend | `samsung-life` | `samsung-life` | Pass |

The final case intentionally routes the primary representative company to
Samsung Life because the question names both Samsung Life and Samsung Fire.
The answer still selects claims for both companies. This is acceptable for the
current single-representative trace schema, but a future enhancement may add
`representativeCompanyIds` for multi-company questions.

## Product/UI Transfer Judgment

The user-facing UI does not need a visible group-to-company selector at this
stage. The better pattern is:

```text
visible selector: group
runtime routing: affiliate inferred from question aliases and source claims
```

This keeps the mobile UI simple while still allowing Samsung questions to use
company-specific DART, KRX, wiki, and source-backed claims.

After the latest patch, visible answers and follow-up questions are
affiliate-aware. For example, a Samsung Electronics question now says
`삼성전자` rather than falling back to the broad `삼성` label.

## Transfer Risks

### 1. Hanwha Is Deeper, Samsung Is Broader

Hanwha has the original PoC context and deeper reference-slice history.
Samsung has broader affiliate identifiers, financial tables, and routing.

This is not a contradiction. It should be described in the paper as:

```text
Hanwha provides the reconstruction template; Samsung tests transferability.
```

### 2. Samsung Is Not Full Coverage Yet

Samsung currently has 31 runtime-promoted claims, concentrated around:

- Samsung Electronics;
- Samsung SDI;
- Samsung C&T;
- Samsung Biologics;
- Samsung Life;
- Samsung Fire;
- DART financial baseline/trend records.

This is enough for a first transfer slice, not enough for full Samsung group
coverage.

### 3. Financial-Company Revenue Must Stay Strict

The Samsung transfer correctly avoids defining financial-company revenue when
OpenDART does not provide an accepted explicit revenue account. This protects
the paper scope.

### 4. News Is Still Fixture Without News Credentials

The current architecture can disclose fixture/live/fallback states, but the
product should not claim live news completeness until news credentials and
source policies are connected.

### 5. Latency Needs Product Hardening

Both Hanwha and Samsung failed only the latency-budget check. Production should
add:

- KRX/DART caching;
- stale-but-valid source snapshots;
- per-tool timeout policy;
- background refresh for market/news data.

## Final Decision

The Hanwha reference template is suitable for Samsung application. The current
Samsung transfer is structurally consistent, reproducible, traceable, and
evaluation-gated.

The transfer is safe to use in the paper and product roadmap as a
first-transfer demonstration, with the following caveats:

1. do not claim exhaustive Samsung coverage yet;
2. keep the finance-sector revenue boundary strict;
3. treat missing Samsung C&T document-level URL and news-live integration as
   remaining data tasks;
4. treat latency as a product-hardening task;
5. backfill `companyId` into Hanwha claims later if Hanwha affiliate-level
   routing becomes a product requirement.

## Next Recommended Step

Proceed to SK using the Samsung-expanded template:

```text
identifier verification -> source inventory -> DART financial table ->
wiki seed -> source-backed claims -> frozen scenario -> Agent Dog seed
```

Before SK can reach Samsung-level readiness, the user should provide:

- SK 주요 상장사 목록;
- 각 회사 IR URL;
- 가능한 문서 단위 PDF/PPT URL;
- if available, known DART corp codes and KRX tickers.
