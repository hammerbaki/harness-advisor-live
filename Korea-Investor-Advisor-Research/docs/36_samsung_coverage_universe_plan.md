# Samsung Coverage Universe Plan

Date: 2026-05-02

## Purpose

Samsung is the first expansion test after the Hanwha reference slice. The goal
is not to make every Samsung affiliate equally deep on day one. The goal is to
prove that the Hanwha template can absorb a broader listed-company universe
without losing reproducibility, source discipline, or UI consistency.

## Current Decision

The supplied Samsung table is now treated as a `seed-unverified` coverage
universe:

- 14 supplied listed companies are recorded in
  `raw/manifests/samsung.coverage-universe.seed.json`.
- 15 listed companies are registered in `configs/groups.json` because Samsung
  Biologics is already part of the app's Samsung profile and should remain in
  the investor coverage universe.
- The supplied OpenDART/KRX verification file has been recorded as
  `raw/manifests/samsung.identifier-verification.json`, and DART/KRX live smoke
  tests now pass for Samsung Electronics.
- The first Samsung source gate now exists. `raw/manifests/samsung.local-sources.json`
  inventories 53 source entries, and `raw/manifests/samsung.extraction-report.json`
  confirms 40/40 local official PDF candidates are extractable.
- The first Samsung claim-candidate plan now exists in
  `raw/manifests/samsung.claim-candidate-plan.json`. It identifies 4
  local-PDF-ready themes and 2 DART-pending insurance themes, but it does not
  promote any Samsung claim into runtime knowledge yet.
- A generated Samsung LLM Wiki seed now exists under `wiki/groups/samsung/`.
  It is a source-routing and review dictionary, not runtime source-backed
  knowledge.
- Candidate investor questions now exist in
  `evals/questions/samsung.investor-candidate-questions.json`. They are useful
  for source planning, but they are not frozen evaluation scenarios until
  Samsung source-backed claims are promoted.
- A DART API-backed 2022-2024 financial table now exists in
  `raw/manifests/samsung.dart-financial-table.2022-2024.json` and
  `docs/39_samsung_dart_financial_table.md`. Current status: 35 complete
  company-year records, 6 partial financial-sector records, and 4 2022
  financial-company records where OpenDART returns no data.
- A DART account availability audit now exists in
  `raw/manifests/samsung.dart-financial-account-audit.2022-2024.json` and
  `docs/40_samsung_financial_sector_dart_account_audit.md`. It records what
  OpenDART provides for Samsung Life, Fire, Card, and Securities without
  defining financial-company revenue.
- A first Samsung source-backed seed claim set now exists in
  `raw/manifests/samsung.source-backed-claims.json` and
  `docs/41_samsung_source_backed_seed_claims.md`. It promotes 19 OpenDART
  financial claims: the 2024 DART baseline for the 15 registered listed
  affiliates and four 2023-2024 trend claims for Samsung Electronics, Samsung
  SDI, Samsung C&T, and Samsung Biologics.
- Narrative IR/PDF claims are still not runtime-eligible until they are
  verified against document-level public URLs, periods, reporting bases, and
  evidence locations.

This is the right level for the current paper/product phase. It lets the demo
show that the template can scale beyond Hanwha while keeping the paper honest
about evidence maturity.

## IR Source Topology Decision

Hanwha can be treated as a single-site reference slice because the current
source corpus was collected from one official Hanwha Corporation investment
route and its adjacent/subordinate routes.

Samsung should not be forced into a single-site model. Samsung listed
affiliates maintain separate investor-relations pages, so the correct
architecture is:

```text
Samsung group namespace
  -> DART as the common official filing backbone
  -> KRX/market identifier layer
  -> company-specific IR source modules
  -> group-level LLM wiki synthesis
  -> source-backed claims with both groupId and companyId
```

This does not require a visible `group -> company` selector in the current
product UI. The investor-facing UI should remain group-first. Company-specific
sources are retrieved by routing, aliases, materiality, and the user's question.
A company selector may be added later as an advanced filter, but making it the
main navigation now would widen the paper scope and make the demo feel like a
database browser rather than an advisor.

## Initial Company IR Source Map

These URLs are intake candidates, not yet verified claim sources. Each must be
converted into manifest entries with access date, source role, document URLs,
and extraction notes before becoming runtime evidence.

| Company | Source URL | Source role | Current treatment |
| --- | --- | --- | --- |
| 삼성전자 | https://www.samsung.com/sec/ir/ir-events-presentations/events/ | issuer IR events and presentations | primary affiliate IR source |
| 삼성SDI | https://www.samsungsdi.co.kr/ir/ir-activity/index.html | issuer IR activity | primary affiliate IR source |
| 삼성물산 | https://www.samsungcnt.com/ir/overview.do | issuer IR overview | primary affiliate IR source |
| 삼성생명 | https://m.irgo.co.kr/IR-ROOM/032830 | IR platform page | useful index, but prefer DART and issuer-owned sources for official claims |
| 삼성화재 | https://www.samsungfire.com/vh/page/VH.HPMK0201.do | issuer investor page candidate | needs crawl/extraction check |
| 삼성바이오로직스 | https://samsungbiologics.com/kr/ir/overview | issuer IR overview | primary affiliate IR source |

## Collection Depth Rule

Do not collect every downloadable file from every affiliate at the start.
Collect by role:

1. mandatory backbone: DART annual/business reports and corp-code confirmation
   for every registered listed company;
2. reference-layer IR: latest annual/quarterly presentation, earnings material,
   shareholder-return/value-up material, and business-segment source for the
   priority companies;
3. optional issue sources: additional IR/news materials only when they explain a
   current investor question that the backbone cannot answer;
4. archive-only material: old presentations, duplicated decks, or marketing
   pages without claim value.

This keeps Samsung extensible without turning the first expansion into a
manual web-archive project.

## Layered Expansion Model

1. Coverage layer

   Register all major listed companies, identifiers, aliases, and seed
   financial rows. This supports routing, source requests, and future data
   ingestion.

2. Reference layer

   Promote only source-backed claims for companies that matter most to the
   research demo. For Samsung, the initial deep candidates should be Samsung
   Electronics, Samsung SDI, Samsung C&T, Samsung Biologics, Samsung Life, and
   Samsung Fire & Marine.

3. Expansion layer

   The remaining companies can start with DART filing links, basic annual
   figures, and news/market routing. They do not need full narrative wiki pages
   before the template is proven.

## Materials The User Should Add

For each Samsung company, collect only bounded materials. Do not request
"everything related to Samsung."

Local intake folder:

```text
../samsung_knowledge/
```

Use the README in that folder as the working checklist before promoting
anything into `raw/manifests/`.

### Required For Every Listed Company

- DART corp code and confirmation source.
- KRX code confirmation source.
- 2022, 2023, and 2024 annual report or audited business report.
- Exact source page or PDF URL for revenue and operating profit.
- Filing/publication date and reporting basis, for example consolidated or
  separate.
- Notes for restatements, renamed entities, mergers, spin-offs, or accounting
  basis changes.

The first two items are complete for the 15-company Samsung universe at the
identifier level. For the first six reference-layer companies, the current local
and DART package is enough to begin claim-candidate generation. The remaining
work is document-level financial and IR source verification before promotion.

### Required For Reference-Layer Companies First

- Latest IR presentation or earnings deck.
- Annual report section explaining business segments.
- Recent value-up, dividend, treasury-share, or shareholder-return disclosure
  if available.
- One official strategy or pipeline source, for example semiconductor/HBM,
  battery, construction, insurance capital policy, or bio manufacturing
  capacity.
- Two to five public news sources only when they explain a current market issue
  that official documents alone do not explain.

### Useful But Not Required At This Stage

- Analyst reports, if redistribution rights are clear. Otherwise store only
  metadata.
- Investor-relations web pages that contain no downloadable or timestamped
  evidence.
- ESG reports, unless a specific investor question requires them.

## Company Checklist

| Company | Config status | Financial seed | Immediate next source need |
| --- | --- | --- | --- |
| 삼성전자 | registered, identifiers verified | DART source-backed seed | claim candidates from latest IR decks; add narrative source locators before promotion |
| 삼성전기 | registered, identifiers verified | DART source-backed seed | annual reports, segment source |
| 삼성SDI | registered, identifiers verified | DART source-backed seed | claim candidates from latest IR decks; add narrative source locators before promotion |
| 삼성SDS | registered, identifiers verified | DART source-backed seed | annual reports, cloud/logistics source |
| 삼성물산 | registered, identifiers verified | DART source-backed seed | non-text recording file excluded; use PPT/subtitle/report substitutes for segment/shareholder-return candidates |
| 삼성중공업 | registered, identifiers verified | DART source-backed seed | annual reports, order backlog source |
| 삼성이앤에이 | registered, identifiers verified | DART source-backed seed | annual reports, order/pipeline source |
| 삼성생명 | registered, identifiers verified | DART limited seed, revenue blank | extract DART viewer filings for capital/shareholder-return source |
| 삼성화재 | registered, identifiers verified | DART limited seed, revenue blank | extract DART viewer filings for capital/shareholder-return source |
| 삼성카드 | registered, identifiers verified | DART source-backed seed | annual reports, credit/capital source |
| 삼성증권 | registered, identifiers verified | DART limited seed, revenue blank | annual reports, brokerage/IB source |
| 제일기획 | registered, identifiers verified | DART source-backed seed | annual reports, geographic/advertising source |
| 호텔신라 | registered, identifiers verified | DART source-backed seed | annual reports, hotel/duty-free source |
| 에스원 | registered, identifiers verified | DART source-backed seed | annual reports, security-service source |
| 삼성바이오로직스 | registered, identifiers verified | DART source-backed seed | claim candidates from current reports; add narrative source locators before promotion |

## Claim Promotion Rule

A Samsung claim can move from seed to runtime only when all conditions are met:

- it is atomic enough to cite;
- it has an official source URL or filing pointer;
- the source date and reporting basis are known;
- the claim does not combine unrelated companies without a group-level source;
- forward-looking claims are labeled as plans, targets, or management guidance;
- the answer UI can expose a customer-readable source link while the dev trace
  stores the full manifest id.

The current claim-candidate plan is intentionally one step earlier than this
promotion rule. It tells the researcher which source packages can support
claim drafting, while keeping every Samsung candidate in
`candidate_plan_not_runtime_eligible` state.

## DART Financial Table Rule

The Samsung DART financial table is an official API extraction artifact, but it
is not automatically a runtime claim set. The app may use it only after the
answer also preserves:

- company and year;
- account label selected by the API extraction rule;
- consolidated/separate basis where available;
- OpenDART endpoint and status;
- whether the value is complete, partial, or unavailable.

For finance companies, do not replace revenue with `이자수익`, `수수료수익`,
`보험수익`, `보험영업수익`, or similar accounts. If OpenDART does not provide
an explicit `매출액`, `영업수익`, or `수익(매출액)` account, the revenue field
must remain blank and the available DART accounts should be shown in the
account audit. The current paper does not define a cross-industry
financial-company revenue proxy.

## Why This Helps The Paper

This plan turns Samsung expansion into a reproducible experiment:

- Hanwha proves the deep reference-slice method.
- Samsung tests whether the same schema scales to a broad group with many
  listed affiliates.
- The paper can show evidence maturity by layer instead of pretending every
  group is equally complete.
