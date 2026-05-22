# Project Context

Last updated: 2026-05-09

## Purpose

This project reconstructs a Replit-built Hanwha advisor PoC into a reproducible
research and commercialization artifact.

The project must distinguish three maturity levels:

1. the initial exploratory PoC built for fast Replit demonstration;
2. the current traceable research PoC, which is the paper reference
   implementation;
3. a future commercial product, which requires live-data, security,
   compliance, monitoring, and client-operation hardening.

The research path is:

1. clean the PoC into a traceable public-data investor advisor;
2. develop the product and evidence package toward SCI-level rigor;
3. publish an arXiv-style method/demo paper as a pre-publication milestone that
   captures the core harness strategy without overclaiming commercial
   operation;
4. use the demo and research artifact for real client sales and pilots;
5. prepare a later SCI journal paper around multi-group source-backed
   evaluation, quality dashboards, numeric consistency, source freshness,
   trace completeness, and failure analysis. Real client operation logs are
   useful but not mandatory evidence; they may be used only if contracts,
   retention policy, confidentiality, and publication rights are cleared.

The product position is no longer an internal Hanwha executive assistant. It is
a public-data strategic investment advisor for external investors monitoring
major Korean business groups.

The current post-API priority is accuracy first, then reproducibility,
consistency, extensibility, and speed. Live API integration is now connected,
but it remains evidence only when the reusable template, source-selection
rules, claim-promotion gate, trace contract, and live answer-quality smoke
checks pass.

## Current Target Order

The investor-facing selector uses the Korean business-group order:

```text
Samsung -> SK -> Hyundai Motor -> LG -> Hanwha
```

Samsung is the neutral default for the UI. Hanwha remains the reference slice
because the original PoC and current source corpus are deepest there.

## Current Status

- The clean implementation lives in this folder, separate from
  `../HanWha-Advisor-main`.
- `NEXT_WORKER_HANDOFF.md` is now the first-read operational guide for any new
  worker. It captures workspace boundaries, Knowledge Base rules, validation
  commands, source intake, claim promotion, UI rules, paper boundaries, and
  known gaps so future work does not require reconstructing the full project
  history.
- The local demo runs at `http://localhost:5173`.
- The Replit-ready app is a Vite/React mobile advisor UI with a Node API server.
- Hanwha has a completed source-ingestion chain:
  inventory, official crawl, provenance, rationale, backfill, extraction,
  claim candidates, and source-backed seed claims.
- Hanwha source inventory currently has 104 local source files after official
  backfill and the later `ir_download` source-package reconciliation.
- Hanwha official-site backfill is now resolved as a claim-driven backlog, not
  as a requirement to download every archive item. The official scan still
  lists 86 missing downloads, but `raw/manifests/hanwha.official-backfill-plan.json`
  records `remainingMissingDownloadsAreBlockers=false`, with 83
  `defer-claim-driven` and 3 `defer-manifest-only` decisions.
- 95/95 Hanwha official PDF extraction candidates pass extraction, with
  review Markdown written under `raw/extracted/hanwha`.
- 106 old RAG-derived claims remain `needs_source_link`.
- 15 official-source-backed Hanwha seed claims are promoted for bounded runtime
  context. ㈜한화 issuer claims carry `companyId=hanwha`; affiliate-specific
  claims now use their own company IDs for Hanwha Aerospace, Hanwha Solutions,
  Hanwha Systems, and Hanwha Ocean.
- The advisor API now returns `sourceClaims` and a `claims.sourceBacked` trace
  step for the Hanwha reference slice.
- The deterministic fallback composer now writes investor-facing summaries from
  selected source-backed claims instead of development-status prose. The visible
  answer uses sectioned investment-memo structure, while raw claim IDs and
  runtime trace details remain in exported JSON rather than the default user UI.
- The answer harness now uses an insight-first visible contract. The first
  section must be `핵심 인사이트`; source collection, claim selection, tool
  states, and validation details support the answer but remain in
  `processTrace`, `answerAssembly`, development UI, and evaluation JSON.
- A collapsed development trace UI is available for research control. It shows
  answer quality checks, selected claims, tool trace statuses, and runtime
  metadata. It is guarded by `VITE_ADVISOR_DEV_UI`; set
  `VITE_ADVISOR_DEV_UI=0` for clean client-facing or paper-screenshot builds.
- Advisor responses now include `answerAssembly`, a code-owned process trace
  for question routing, source collection, wiki cross-checking, claim
  selection, answer planning, and guardrail validation.
- The mobile UI now restores the original PoC's long-running collection and
  analysis affordance as a collapsible process rail. With the current single
  `/api/advisor` POST, pending steps are deterministic planned steps and the
  finalized rail is replaced by actual `processTrace` entries from the API. Full
  server-pushed polling/streaming parity remains the next runtime architecture
  task.
- Demo answers are exported as local JSON traces under `evals/traces/` and
  served from `/api/traces/<runId>.json` for paper-grade evaluation review.
- The pre-API stage gate is explicit: a target/client must pass template,
  source-request, source-selection, claim-promotion, prompt-budget, and trace
  readiness checks before live APIs are treated as product evidence.
- Hanwha now has a frozen pre-API evaluation scenario set in
  `evals/scenarios/hanwha.reference-slice.json`.
- The first Hanwha frozen runtime check passed across five scenario classes:
  investment brief, financial metrics, business pipeline, value-up, and
  governance/disclosure.
- The Hanwha advisor auto-eval baseline now passes 5/5 frozen scenarios at
  99.4/100 after the insight-first harness revision. This baseline adapts
  autoresearch-style fixed-scenario scoring to source-backed finance answers
  and customer-facing investor-briefing quality checks.
- A first paper draft now exists in `docs/34_paper_draft.md`. It frames the
  manuscript as a PoC-to-architecture reconstruction paper, not as a claim of
  completed commercial product readiness.
- DSPy is selected as the paper-facing LLM programming framework, but it is
  not installed into the runtime yet. It should first be used as an offline
  composer-optimization sidecar after the Hanwha baseline is frozen.
- Live LLM composition now has a code-owned structured output contract
  (`advisor-llm-output-contract.v0.1`). If live model output fails the contract,
  the runtime falls back to the deterministic composer and records the failure
  in trace metadata rather than exposing it in the customer UI.
- The output contract now includes question-intent answer plans so safe
  structure does not collapse into one rigid table of contents. Financial,
  news/general, pipeline, value-up, governance, market, global, and competitor
  questions can use different approved section patterns.
- The current section plans are audience-facing rather than process-facing:
  `핵심 인사이트`, one intent-specific evidence section, `반증 리스크`, and
  `다음 관찰 포인트`. This prevents the UI from showing the analysis process
  as the final product.
- The DART financial extraction harness now preserves explicit OpenDART account
  labels for revenue, operating income, net income, total assets, total
  liabilities, total equity, and debt-to-equity ratio. Runtime answers may show
  net income and debt ratio only when these fields are present in source-backed
  evidence. Detailed accounting questions suppress unrelated preliminary IR
  narrative claims so the visible answer remains investor-facing and
  source-bounded.
- The current implementation is still a PoC, but it is no longer the original
  exploratory demo PoC. It is a traceable research PoC: source-backed,
  template-oriented, evaluation-gated, and designed as a reference slice for
  replication to other groups.
- Prompt-to-code migration is now tracked by
  `raw/manifests/prompt-control-plane-audit.json` and validated by
  `npm run validate:prompt-control`. Runtime prompts remain short policy
  blocks; deterministic behavior, source facts, and deletion/archive decisions
  are controlled outside the prompt.
- The source-selection harness now requires company-scoped runtime claims.
  `SRC-12` records the rule, and `npm run validate:stage-gate` fails if a
  runtime-promoted source-backed claim lacks `companyId` or `companyScope`.
- Frozen scenarios are evaluation anchors, not a product limitation. Real
  client questions must use the same source-backed claim and trace architecture,
  and should disclose evidence gaps instead of improvising unsupported claims.
- Original PoC question UX patterns were rechecked and safely refactored:
  brief-card clicks now include visible headline/context, quick buttons generate
  richer intent-bundle prompts, and follow-up questions are topic-aware.
- The first-screen briefing cards were upgraded for paper/product screenshots.
  They now show a concise headline, a two-line explanatory body, and a single
  bottom source link instead of metric-chip buttons or development status. Raw
  claim IDs remain hidden from the customer UI.
- Paper figures now have a separate English capture mode at `/?paper=en` or
  `/?lang=en`. The product default remains Korean at `/`. The English mode only
  localizes presentation labels and first-screen copy; it does not alter source
  manifests, runtime traces, API contracts, group order, or the Korean product
  surface. Until the final paper-submission stage, all product review,
  iteration, and screenshot discussion should use the Korean default layout;
  English capture mode is reserved for final paper figures. The policy is
  recorded in `docs/74_paper_capture_ui_mode.md`.
- Live API readiness is recorded in `docs/75_live_api_integration_readiness.md`.
  The server already has live-capable DART/KRX/Naver tool routes. A local smoke
  test after adding Naver credentials shows DART disclosures, KRX market rows,
  and Naver News returning `live` for all five first-screen groups, while LLM
  composition remains deterministic.
  Service-level API keys are shared across companies; company-specific routing
  depends on corp codes, KRX/Yahoo tickers, and source manifests.
- Documentation has been audited for consolidation in
  `docs/76_document_consolidation_audit.md`. The current rule is to keep all
  numbered intermediate docs as trace evidence, but make `docs/README.md` a
  short active reading path. Physical moves/deletions should wait until the
  25-company first slice is stable because several scripts write to fixed doc
  paths. The audit is now executable via `npm run audit:docs`, which writes
  `raw/manifests/document-consolidation-audit.json` and regenerates the
  readable consolidation audit.
- The `ir_download` backfill check scanned 210 files for Hanwha Aerospace,
  Hanwha Solutions, Hanwha Systems, Hanwha Ocean, Samsung Electro-Mechanics, SK
  Square, and Kia. All 210 were already present in `../Knowledge Base` by
  SHA-256 hash, so no duplicate copy was made. The inventory scripts were
  hardened so those files are now routed to the correct `companyId`, document
  type, request package, and selection reason. Current extracted Markdown
  counts are Hanwha 95, Samsung 58, SK 132, Hyundai Motor 153, and LG 87.
- The first-slice readiness audit now recognizes local source packages, wiki
  pages, and source-backed claims for all 25 companies. Current readiness is
  25 `runtime-seed-ready` with 0 open gaps across Samsung, SK, Hyundai Motor,
  LG, and Hanwha.
- A cross-group claim promotion review packet now exists at
  `docs/82_claim_promotion_review_packet.md` and
  `raw/manifests/claim-promotion-review-packet.json`. It produces one priority
  human-review candidate for each of the 25 first-slice companies and two
  alternates per company, while keeping runtime promotion behind reviewer
  fields, evidence locators, forward-looking labels, and group-specific
  promotion validators. Samsung Electro-Mechanics and SK Square are included
  through local-source fallback because their source packages are present even
  though the older narrative queue scripts do not yet emit those companies as
  first-class queue themes.
- Codex first-pass claim decisions and the user's approval are now recorded as
  separate artifacts. `docs/83_claim_review_proposals_for_approval.md` and
  `raw/manifests/claim-review-proposals.json` propose 25/25 priority rows for
  seed review approval with 0 holds. `docs/84_claim_review_approval_record.md`
  and `raw/manifests/claim-review-approval-record.json` record the user's
  approval quote, approval criteria, approved wording, and 29 evidence
  locators. Hyundai Rotem's earlier hold was resolved by using the 2025 DART
  business-report extraction as the primary evidence locator.
- The approved rows have now been promoted into runtime source-backed claim
  manifests through `npm run promote:approved-review` and validated with
  `npm run validate:approved-review-claims`. The promotion writes
  `docs/85_review_approved_runtime_claims.md` and
  `raw/manifests/review-approved-runtime-promotion.json`, adding 25
  `source-backed-review-approved-claim` records across the five groups while
  preserving existing seed claims. Counts after promotion are Samsung 36, SK
  27, Hyundai Motor 15, LG 15, and Hanwha 20 source-backed claims. Older
  group-specific `promote:*` scripts may overwrite this layer if rerun; rerun
  `npm run promote:approved-review` afterward until those scripts are hardened
  to preserve review-approved claims directly.
- The runtime claim selector now allows up to five selected source-backed
  claims per question, matching the 25-company/5-company slice and preventing a
  newly approved claim from displacing a still-relevant company-scoped claim.
  Context-heavy questions such as NAV, portfolio, AI, battery, value-up, or
  shareholder-return now prioritize company-scoped narrative/context claims
  before generic financial rows. The visible answer also no longer quotes live
  news headlines directly in the monitoring section, because external headlines
  may contain trading-action words; the news link remains available in the
  source-link package.
- The five group auto-eval baselines have been rerun after review-approved
  promotion. Current results: Samsung 5/5 at 99.4/100, SK 5/5 at 99.4/100,
  Hyundai Motor 3/3 at 99/100, LG 3/3 at 99/100, and Hanwha 5/5 at 99.4/100.
  SK, Hyundai, and LG scenario expected-claim lists were corrected to match the
  current company-scoped routing rule rather than older group-wide financial
  expectations.
- Product and paper readiness is now audited by `npm run audit:product-paper`.
  The current stage is
  `stage-4-live-api-quality-smoke-passed-needs-expert-review`: the multi-group
  source-backed research product beta is structurally ready, live API
  connectivity and live answer-quality smoke checks pass, and the bounded
  arXiv method/demo paper has enough product evidence. SCI validation and
  commercial v1 deployment are not complete. The readable record is
  `docs/86_product_and_paper_readiness.md`; the machine record is
  `raw/manifests/product-paper-readiness-audit.json`.
- The latest product packaging checks also pass: `npm run check:replit`
  confirms the target group order, and `npm run build` produces a production
  Vite build.
- DART, KRX, and Naver News credentials are now connected and verified through
  `npm run smoke:live-api`. The latest five-group smoke run returned DART 5/5
  live, KRX 5/5 live, Naver News 5/5 live, minimum selected source claims 5,
  and max elapsed 190 ms on an existing local server with memory cache allowed.
  The evidence is `docs/87_live_api_connection_smoke_test.md` and
  `raw/manifests/live-api-smoke-test.json`. Secret values are intentionally
  omitted from artifacts.
- Live API answer quality is now checked by `npm run audit:live-answer`. The
  latest cache-disabled run covered five groups and three representative
  question types per group: news/disclosure brief, financial brief, and
  market/risk brief. Result: 15/15 pass, 0 warnings, 0 blockers, 100/100
  average score, with DART/KRX/Naver live trace checks, selected source-backed
  claims, source-link packages, customer-facing follow-ups, trace export,
  development-leak prevention, and recommendation-language safety all passing.
  The evidence is `docs/88_live_answer_quality_audit.md` and
  `raw/manifests/live-answer-quality-audit.json`. This is an automated smoke
  gate, not a substitute for human investment-research review.
- Actual customer-facing answers are now collected for human review through
  `npm run review:answers`. The latest cache-disabled run generated
  `docs/89_human_answer_review_packet.md` and
  `raw/manifests/human-answer-review-packet.json` with 15 samples across the
  five groups, 69 selected source-backed claims, 75 source links, and 60
  follow-up questions. The packet includes review focus, answer text, selected
  claims, links, trace artifact paths, and empty reviewer-note slots. Its
  purpose is to support expert investment-research judgment after automated
  smoke tests; it is not a commercial-readiness certificate.
- Workspace-level folders are now classified in
  `docs/78_project_folder_reclassification.md` and
  `raw/manifests/project-folder-classification.json`. Current safe taxonomy:
  `Korea-Investor-Advisor-Research` is the active product/research repository,
  `Knowledge Base` is the immutable raw source package root,
  `HanWha-Advisor-main` is the original PoC archive, `arxiv-paper` is the
  active paper workspace, and root-level PDFs are references. If
  `Knowledge Base/ir_download` appears, treat it as an ad hoc manual
  inspection/download trace rather than product structure; it can be ignored or
  deleted after the user confirms inspection is complete. Do not physically
  rename or move active roots until inventory scripts, Replit export, paper
  build paths, and validation checks are path-agnostic.
- Deep raw source folders are now consolidated through a project-level source
  ledger rather than by physically flattening files. `npm run
  audit:source-ledger` writes `raw/manifests/source-ledger.v0.1.json`,
  `raw/manifests/company-source-index.json`, and
  `docs/79_source_ledger_and_consolidation.md`. The current ledger covers 607
  source records, 38 company index rows, 583 PDFs, 598 sources with URL/source
  provenance, 595 sources with selection reasons, all 210 reconciled
  `ir_download` staging files, and 3 metadata-only DART/source-index rows.
  Inventory/import scripts now accept `KNOWLEDGE_BASE_ROOT` and
  `IR_DOWNLOAD_ROOT`, which prepares a later physical migration without
  breaking provenance.
- The integrated IR Source Index at
  `/Users/jj/Downloads/통합 IR 자료 Source Index.md` has been imported
  through `npm run import:source-index`. It normalizes 79 rows: 17 Kia rows and
  62 Hanwha/Hanwha-affiliate rows. 76 rows are matched to local Knowledge Base
  files, 3 rows are preserved as metadata-only official DART/source-index
  records, and 0 rows are unmatched.
- The `Knowledge Base` folder itself is now organized for the project without
  flattening raw files. `npm run organize:knowledge-base` writes
  `../Knowledge Base/README.md`, generated navigation files under
  `../Knowledge Base/_index/`, and group-level README files for Samsung, SK,
  Hyundai Motor, LG, and Hanwha. The organization result is recorded in
  `docs/80_knowledge_base_folder_organization.md` and
  `raw/manifests/knowledge-base-organization.json`. Local `.DS_Store` files are
  documented as ignored system files instead of being removed during the
  non-destructive organization pass. Folder names are abstracted through
  `configs/source-folder-taxonomy.json`, which generates
  `../Knowledge Base/_index/folder-taxonomy.md` and `.csv`; this lets Korean,
  English, and legacy collector folder names map to stable source categories
  without flattening raw evidence.
- The integrated Kia and Hanwha affiliate source index from the user's
  Downloads folder was normalized through `npm run import:source-index`. The
  importer writes `../Knowledge Base/hyundai_knowledge/source_index_kia_hanwha_backfill.md`,
  `../Knowledge Base/hanhwa_knowledge/source_index_affiliate_backfill.md`, and
  `raw/manifests/integrated-source-index-import-report.json`. It moves non-URL
  download notes out of `direct_document_url`, infers request packages, marks
  analyst reports as metadata-only, recalculates local SHA-256 checksums, and
  keeps source-page-only provenance eligible for review when dynamic issuer
  downloads are identified. The first-slice readiness audit now reports 0 open
  gaps across 25 companies after this import.
- Hyundai and Hanwha inventory matching was hardened after duplicate local
  filenames exposed a cross-company routing risk. Exact local paths now take
  priority, and basename fallback is accepted only when the basename is unique
  and does not conflict with the company inferred from the folder path. This
  prevents Kia earnings files from being attached to Hyundai Glovis records and
  preserves company-scoped provenance for repeatable claim review.
- Hyundai/Kia and Hanwha/Hanwha-affiliate narrative claim queues now follow the
  same review-gated pattern. `raw/manifests/hyundai-motor.narrative-claim-queue.json`
  contains 148 official source rows: 122 ready for human claim review and 26
  blocked, with Kia correctly scoped to 17 rows. The remaining Hyundai blocked
  rows are mostly OCR/low-text cases, plus 5 Hyundai E&C source-provenance rows
  and 1 invalid Kia PDF extraction case. `raw/manifests/hanwha.narrative-claim-queue.json`
  contains 95 official source rows and all 95 are now ready for human claim
  review after the blocked-URL supplement. These queue rows are not runtime
  claims; they are candidates for reviewer-approved source-backed promotion.
- The user's blocked-URL supplement
  `/Users/jj/Downloads/한화 Blocked 자료 URL 보강 + 현대차 누락 필드 보강.md`
  is imported as a non-destructive supplemental ledger, not as a replacement for
  earlier source indexes. It writes
  `../Knowledge Base/hyundai_knowledge/source_index_blocked_url_supplement.md`,
  `../Knowledge Base/hanhwa_knowledge/source_index_blocked_url_supplement.md`,
  and `raw/manifests/blocked-url-supplement-source-index-import-report.json`.
  The import normalized 97 rows: 52 Hyundai Motor Group rows and 45 Hanwha rows,
  all matched to local files. The importer now routes all Hyundai company IDs to
  the Hyundai target and strips `hyundai_knowledge/` or `hanhwa_knowledge/`
  prefixes before local file matching.
- The temporary `ir_download` folder was previously retired after
  `npm run import:ir-download` confirmed that all 210 files were represented in
  `../Knowledge Base` by SHA-256 hash. If the folder reappears because the user
  re-downloaded files for inspection, ignore it as a manual check trace and do
  not treat it as product architecture or runtime evidence. Runtime code should
  continue to consume promoted claims and manifests, not the staging folder
  directly. Future external source packages should follow the same sequence:
  stage temporarily, reconcile by hash into `Knowledge Base`, regenerate
  ledgers/indexes, then retire the staging folder.
- The first-screen and selector UI are now treated as product surfaces, not
  development-status surfaces. The group selector no longer shows internal
  labels such as `검증`, `기준`, `planned`, or `reference`; it shows sector
  scope and source type instead of affiliate counts. The first briefing card
  label is `뉴스 브리프`, not `이슈 브리프`, and first-screen cards show
  customer-facing source links with richer two-line descriptions so paper
  screenshots contain enough product information without exposing development
  trace details.
- First-screen source links must match the information type. `뉴스 브리프`
  links to an internet news search, `주가 브리프` links to market-price
  context, and `재무 브리프` links to DART. DART/IR links should not appear as
  the bottom link of a news card because that makes the card's information
  source ambiguous to product users.
- Constrained mobile controls must use compact display labels while preserving
  full names in prompts and source manifests. For example, the Hyundai Motor
  quick-topic button shows `현대차` to avoid a two-line control, while runtime
  questions still use the full group identity.
- SK source folder structure was rechecked after the user reorganized
  `../sk_knowledge` into company folders. `npm run inventory:sk` passes with
  58 local entries, 57/57 valid PDFs, 63 URL ledger records, 56 matched local
  source URLs, and one local SK Inc. review report still pending exact URL
  reconciliation. The paper-facing summary is recorded in
  `docs/66_source_url_coverage_check.md`.
- Hanwha official URL coverage was refreshed from the official investment route
  `https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp`. The scan still
  finds 131 official downloads, 45/45 local matches, and 86 absent local
  downloads. The backfill plan remains claim-driven with 0 download-now items;
  the full URL evidence lives in the manifests, not manually maintained prose.
- In-app follow-up questions must be customer-facing investor questions only.
  Research, evaluation trace, prompt, schema, log, and paper-workflow questions
  belong in the Codex/research workflow, not in the product UI.
- Customer-facing wording must avoid recommendation or advisory trigger
  phrases such as `투자 판단`, `매수`, `매도`, `목표가`, and `투자의견` unless
  they are quoted from official source material. Prefer neutral product wording
  such as `투자 관점`, `확인할 변수`, `검토 포인트`, and `리스크 신호`.
- Follow-up questions are independent conversation turns. Each assistant answer
  owns its own process trace, source links, development trace, and next
  follow-up questions; these must not be stored as a single global latest
  answer package.
- LG has moved from a profile/template target to a bounded fourth-transfer
  financial seed plus a 9-company local IR source package. OpenDART identifiers
  are verified for LG Electronics, LG Chem, LG Energy Solution, LG H&H, LG
  Display, LG Innotek, LG Uplus, LG CNS, and LG Corp. `configs/groups.json`
  keeps LG as `financial-source-backed-seed` because only DART financial claims
  are runtime-promoted so far.
- Group data completion is now tracked by `npm run audit:group-data`, which
  writes `raw/manifests/group-data-completion-audit.json` and
  `docs/67_group_data_completion_audit.md`. This is the product readiness gate
  for multi-group data reinforcement before the paper is updated.
- Hanwha is no longer treated as a loose PoC-only exception. Its affiliate IDs
  now follow stable company-scoped IDs such as `hanwha-aerospace`,
  `hanwha-solutions`, `hanwha-systems`, and `hanwha-ocean`; the current
  promoted claim set remains issuer-scoped to `companyId=hanwha` until
  affiliate-specific evidence is promoted. The Hanwha ingestion validator now
  treats unmatched affiliate package URLs as reconciliation warnings instead of
  failing the whole harness, because the validator must distinguish the Hanwha
  Corp official IR root from affiliate-level source packages.
- All five groups now have a source-intake template. The remaining data gaps
  are explicit: SK URL reconciliation, Hyundai source URL reconciliation, LG
  source-page-only records, and Hanwha affiliate claim promotion beyond the
  issuer slice.
- Group company balance is tracked in
  `docs/68_group_company_balance_plan.md`. The recommended product rule is a
  five-listed-company first slice per group, with broader affiliates held as
  second-wave coverage until source-backed claims are balanced enough.
- First-slice promotion criteria are now fixed in
  `docs/71_first_slice_selection_criteria.md` and
  `configs/first-slice-selection-policy.json`. A company enters the 25-company
  reference slice because it improves group representativeness, sector
  diversity, public-source availability, cross-group comparability, and
  runtime claim feasibility under a controlled first-paper scope.
- First-slice readiness is now audited at company level by
  `npm run audit:first-slice`, which writes
  `raw/manifests/first-slice-readiness-audit.json` and
  `docs/72_first_slice_readiness_audit.md`. This separates correct company
  selection from current source package, URL, extraction, wiki, and
  source-backed claim readiness.
- Source provenance policy is now intentionally less brittle than a strict
  document-level-URL requirement. Exact PDF URLs and DART receipt URLs are
  preferred, but official IR source pages are acceptable when issuer downloads
  are dynamic or session-based, as long as the ledger records exact document
  title, period, access date, local checksum, extraction hash, and claim-level
  evidence locator. This keeps Hanwha Systems, Hanwha Ocean, and similar IR
  page archives within the same reproducible harness without pretending every
  issuer exposes stable file URLs.
- The first-slice gap closure plan is recorded in
  `docs/73_first_slice_gap_closure_plan.md`. The largest remaining gaps are
  Hanwha affiliate source packages, Samsung Electro-Mechanics, SK Square, Kia,
  and document-level selection reasons for existing Samsung/SK source ledgers.
- Samsung is the first template-transfer target: it has identifier verification,
  DART-backed financial seed claims, document-level URL intake, DART filing
  text extraction, and a small runtime-promoted narrative claim set. It is not
  yet full Samsung coverage.
- Samsung now has a first expansion coverage universe:
  `raw/manifests/samsung.coverage-universe.seed.json` records the supplied
  14-company 2022-2024 financial table as `seed-unverified`, while
  `configs/groups.json` registers 15 Samsung listed companies including
  Samsung Biologics. This is scope metadata and a source-request checklist, not
  source-backed runtime evidence.
- Samsung identifier verification is now recorded in
  `raw/manifests/samsung.identifier-verification.json`. The 15 Samsung DART
  corp codes have been populated into `configs/groups.json`, and local
  DART/KRX live smoke tests passed for Samsung Electronics. Samsung now has a
  source-backed claim manifest that combines DART financial baseline claims
  with a reviewer-authored official IR/DART narrative subset.
- Samsung source adequacy is now recorded in
  `raw/manifests/samsung.local-source-adequacy-audit.json` and
  `docs/37_samsung_source_adequacy_audit.md`. Verdict: the 6-company package is
  enough to begin a first Samsung reference layer, but not enough to freeze the
  full 2022-2024 historical financial table without DART/account-policy caveats.
  The Samsung C&T recording/non-text file has been excluded from the knowledge
  dictionary path, and PPT/report/subtitle substitutes are used for text
  evidence.
- Samsung now has an executable source gate. `npm run inventory:samsung`
  produced 53 source entries: 43 local files, 40/40 valid local PDFs, and 10
  DART viewer filings for Samsung Life and Samsung Fire. `SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run
  extract:samsung` extracted 40/40 local official PDF candidates with 0
  low-text warnings and generated 40 private local markdown review files under
  `raw/extracted/samsung/official/`. `npm run validate:samsung-ingestion`
  passes.
- Samsung now has a claim-candidate plan in
  `raw/manifests/samsung.claim-candidate-plan.json`. Four themes are local-PDF
  ready (Samsung Electronics, SDI, C&T, Biologics) and two insurance themes
  are DART-text-ready (Samsung Life, Samsung Fire). A 12-claim subset is now
  runtime-promoted only because exact public URLs, extraction hashes, evidence
  needles, line locators, period labels, and forward-looking labels are present.
- Samsung now has generated LLM Wiki seed pages under `wiki/groups/samsung/`
  and a candidate investor-question set in
  `evals/questions/samsung.investor-candidate-questions.json`. These artifacts
  support source review and future evaluation design, but they are not
  source-backed runtime claims.
- Samsung now has a DART API-backed 2022-2024 financial table in
  `raw/manifests/samsung.dart-financial-table.2022-2024.json` and
  `docs/39_samsung_dart_financial_table.md`. The current extraction returns 35
  complete company-year records, 6 partial financial-sector records, and 4 2022
  financial-company records where OpenDART returns no data. The table preserves
  selected account labels and does not define financial-company revenue. Revenue
  is filled only when OpenDART explicitly provides `매출액`, `영업수익`, or
  `수익(매출액)`.
- Samsung financial-sector DART account availability is audited in
  `raw/manifests/samsung.dart-financial-account-audit.2022-2024.json` and
  `docs/40_samsung_financial_sector_dart_account_audit.md`. The audit records
  what DART provides for Samsung Life, Fire, Card, and Securities without
  reclassifying finance-specific accounts as revenue.
- Samsung now has 31 source-backed seed claims in
  `raw/manifests/samsung.source-backed-claims.json` and
  `docs/41_samsung_source_backed_seed_claims.md`: 19 OpenDART financial
  baseline/trend claims plus 12 official IR/DART narrative claims covering
  Samsung Electronics, Samsung SDI, Samsung C&T, Samsung Biologics, Samsung
  Life, and Samsung Fire. Samsung Life, Samsung Fire, and Samsung Securities
  are intentionally labeled as missing-revenue cases when OpenDART does not
  provide an accepted explicit revenue account.
- Samsung second-seed preparation is now complete for the active six-theme
  narrative queue. `raw/manifests/samsung.document-url-intake.json` records 50
  source URL intake entries: 49 are ready for claim review, while one
  non-blocking Samsung C&T 2026 Q1 PPT row remains pending because the supplied
  note says it shares the report URL rather than providing an exact document
  URL. `raw/manifests/samsung.dart-filing-extraction-report.json` records
  completed Samsung Life/Fire DART filing text extraction. The narrative queue
  remains the review ledger, while runtime promotion is limited to the 12
  claims that passed evidence-locator validation.
- Samsung now has a frozen first-transfer evaluation scenario set in
  `evals/scenarios/samsung.reference-slice.json`. It covers five product
  routes: Samsung Electronics memory/HBM, Samsung SDI ESS/profitability,
  Samsung C&T shareholder-letter/portfolio direction, Samsung Biologics
  orders/guidance, and Samsung Life/Fire capital-dividend checks.
- The Samsung first-transfer auto-eval baseline passed 5/5 frozen scenarios at
  97/100 using `advisor-answer-quality-v0.2`. Required failures were 0, and
  the result is stored at
  `evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`.
  The paper-stage Agent Dog seed for this transfer slice is stored at
  `evals/dashboard/agent-dog.samsung-paper-seed.2026-05-03.json`.
- The advisor evaluation harness now supports optional
  `expectedRepresentativeCompanyId` checks. This makes group-level UI
  compatible with affiliate-level source routing: a Samsung question can remain
  under the Samsung group selector while DART, KRX, news, wiki, and
  source-backed claims route to Samsung Electronics, SDI, C&T, Biologics, Life,
  or Fire when the question names that affiliate.
- Advisor wording is now affiliate-aware when the question names a Samsung
  company. The visible answer and follow-up questions use labels such as
  `삼성전자`, `삼성SDI`, or `삼성생명·삼성화재` instead of falling back to the
  broad `삼성` label, while general Samsung questions still remain group-level.
- The Hanwha-to-Samsung transfer audit is recorded in
  `docs/43_hanwha_to_samsung_transfer_audit.md`. Verdict: Hanwha is suitable as
  the reference template for Samsung, and Samsung passes the first-transfer
  architecture check. The remaining caveats are bounded scope, finance-sector
  revenue strictness, one pending Samsung C&T document-level URL, fixture news
  without news credentials, and latency hardening.
- SK has now moved from pure visual/planned profile to a bounded second
  transfer slice. OpenDART corp codes were verified for SK Hynix
  (`00164779`), SK Innovation (`00631518`), SK Inc. (`00181712`),
  SK Telecom (`00159023`), and SK Square (`01596425`), and recorded in
  `raw/manifests/sk.identifier-verification.json`.
- SK has an OpenDART 2022-2024 annual financial table at
  `raw/manifests/sk.dart-financial-table.2022-2024.json` and
  `docs/45_sk_dart_financial_table.md`. The extraction passed 12/12 records with
  explicit `매출액` and `영업이익` accounts, so no finance-sector revenue
  definition caveat is needed for the current four-company SK seed.
- SK has 20 source-backed seed claims in
  `raw/manifests/sk.source-backed-claims.json`: 8 OpenDART financial
  baseline/trend claims plus 12 official IR/DART narrative claims promoted from
  reviewer-authored seeds with document URLs, extracted-text hashes, company
  routing, evidence needles, and locators. The promotion evidence is summarized
  in `docs/49_sk_source_backed_narrative_claims.md`. The newest promoted
  SK Square claims cover NAV discount/ROE/PBR value-up framing, 2025 portfolio
  update financial metrics, shareholder return execution, and portfolio NAV
  concentration.
- SK has local source inventory and extraction artifacts:
  `raw/manifests/sk.local-sources.json`,
  `raw/manifests/sk.extraction-report.json`, and
  `docs/47_sk_source_inventory_and_ingestion.md`. The supplied
  `../Knowledge Base/sk_knowledge` package currently contains 132 local
  entries and 132 extraction rows, with SK Square's 75 local sources now
  represented in the common source ledger. Low-text PDFs and extraction-error
  files remain source backlog;
  they are not promoted into runtime knowledge until OCR, transcript, or
  alternate text-bearing official material is available.
- SK has a narrative claim queue in
  `raw/manifests/sk.narrative-claim-queue.json` and
  `docs/48_sk_narrative_claim_queue.md`. The queue remains the review ledger
  for future expansion, while the current runtime slice is limited to the 20
  promoted source-backed claims.
- SK has generated LLM Wiki pages under `wiki/groups/sk/`, including company
  pages for SK Hynix, SK Innovation, SK Inc., SK Telecom, and SK Square. These
  pages are a maintained synthesis layer compiled from manifests and promoted
  claims, not the source of truth.
- Across all groups, group-specific source intake is allowed only before the
  common harness boundary. After intake, targets must converge to common source
  inventory, extraction report, narrative claim queue, source-backed claim,
  wiki, and evaluation scenario schemas.
- SK financial seed evaluation is frozen in `evals/scenarios/sk.financial-seed.json`.
  The latest run passed 4/4 scenarios at 97.75/100 with 0 required failures, and
  the result is stored at
  `evals/results/sk-financial-seed-v0.1.autoeval-baseline.2026-05-03.json`.
  Agent Dog paper-stage output is stored at
  `evals/dashboard/agent-dog.sk-financial-seed.2026-05-03.json`.
- SK reference-slice evaluation is defined in
  `evals/scenarios/sk.reference-slice.json` and now covers SK Hynix, SK
  Innovation, SK Inc., SK Telecom, and SK Square.
- SK reference-slice evaluation passed 5/5 scenarios at 100/100 with 0
  required failures after adding the SK Square NAV/value-up/shareholder-return
  scenario. The result is stored at
  `evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`,
  the Agent Dog static report is stored at
  `evals/dashboard/agent-dog.sk-reference-slice.2026-05-03.json`, and the
  interpretation is recorded in `docs/50_sk_reference_slice_evaluation.md`.
- Latency hardening has started. `docs/51_latency_hardening_and_measurement.md`
  records the baseline and optimized measurements. The server now collects
  DART, KRX, news, wiki, and source-backed claims in parallel while preserving
  deterministic trace order. It also caches KRX daily rows, market snapshots,
  DART disclosures, news results, wiki pages, and claim manifests in process
  memory. The combined Hanwha/Samsung/SK frozen scenarios improved from
  2008.57ms average latency and 2/14 latency-budget passes to 171.14ms average
  latency and 13/14 latency-budget passes. The remaining product follow-up is
  market snapshot prewarming for the first request.
- Hyundai Motor Group has advanced from intake preparation to a bounded third
  transfer financial seed. DART/KRX identifiers for Hyundai Motor, Kia, and
  Hyundai Mobis were verified from OpenDART `corpCode.xml` and entered into
  `configs/groups.json`; optional second-wave identifiers are recorded in
  `raw/manifests/hyundai-motor.identifier-verification.json`.
- Hyundai second-wave intake has been processed for the user's current expanded
  collection set: Hyundai Rotem, Hyundai AutoEver, Hyundai Wia, Hyundai
  Engineering & Construction, Hyundai Glovis, Innocean, Hyundai Motor
  Securities, and Hyundai BNG Steel. These are identifier-verified intake
  candidates, not runtime-promoted coverage. Hyundai Motor Securities is marked
  with the financial-company rule: preserve explicit DART account labels and
  do not define revenue by policy.
- Hyundai source intake now records 84 local official PDF entries in
  `raw/manifests/hyundai-motor.local-sources.json`. Two Hyundai E&C duplicate
  files are marked `duplicate_reference_only`, leaving 82 extraction
  candidates. The current unmatched backlog is 9 Kia SPA/download rows without
  local files. PDF extraction passed 82/82 official candidates and recorded 7
  low-text/OCR warnings in
  `raw/manifests/hyundai-motor.extraction-report.json`; these files remain
  narrative-claim backlog until OCR or text-bearing substitutes exist.
- Hyundai has an OpenDART 2022-2024 annual financial table at
  `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json` and
  `docs/54_hyundai_motor_dart_financial_table.md`. The current first slice
  covers Hyundai Motor, Kia, and Hyundai Mobis with explicit DART financial
  account labels.
- Hyundai has 6 source-backed financial seed claims in
  `raw/manifests/hyundai-motor.source-backed-claims.json` and
  `docs/56_hyundai_motor_source_backed_financial_seed.md`: 2024 baseline and
  2023-2024 trend claims for Hyundai Motor, Kia, and Hyundai Mobis. The
  narrative queue in `raw/manifests/hyundai-motor.narrative-claim-queue.json`
  and `docs/55_hyundai_motor_narrative_claim_queue.md` records 75 ready
  records, 7 blocked low-text/OCR records, and 2 skipped duplicate reference
  files, but no narrative IR claim is runtime-promoted yet.
- Hyundai has generated LLM Wiki seed pages under
  `wiki/groups/hyundai-motor/`, including company pages for Hyundai Motor,
  Kia, and Hyundai Mobis. Hyundai reference-slice evaluation is frozen in
  `evals/scenarios/hyundai-motor.reference-slice.json` and passed 3/3 paper
  baseline scenarios at 99/100 with 0 required failures in
  `evals/results/hyundai-motor-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`.
- LG has an OpenDART 2022-2024 annual financial table at
  `raw/manifests/lg.dart-financial-table.2022-2024.json` and
  `docs/60_lg_dart_financial_table.md`. The extraction passed 9/9 rows with
  explicit DART `매출액` and `영업이익` accounts for LG Electronics, LG Chem,
  and LG Energy Solution.
- LG has 6 source-backed financial seed claims in
  `raw/manifests/lg.source-backed-claims.json` and
  `docs/61_lg_source_backed_financial_seed.md`: 2024 baseline and 2023-2024
  trend claims for LG Electronics, LG Chem, and LG Energy Solution.
- The supplied `../lg_knowledge` package is now inventoried and extracted.
  `raw/manifests/lg.local-sources.json` records 98 entries, 93/93 valid PDFs,
  5 non-PDF files, and 0 unmatched ledger records. `raw/manifests/lg.extraction-report.json`
  records 87/87 successful PDF extractions, 5 low-text/OCR warnings, and
  2,595,254 extracted text characters.
- `raw/manifests/lg.narrative-claim-queue.json` and
  `docs/64_lg_narrative_claim_queue.md` record 92 LG narrative source rows:
  82 ready for human claim review, 10 blocked before claim review, and 6
  skipped duplicate reference files. These rows are review evidence, not
  runtime knowledge.
- LG has generated LLM Wiki seed pages under `wiki/groups/lg/`, including
  company pages for all nine verified affiliates. LG reference-slice evaluation
  is now defined in
  `evals/scenarios/lg.reference-slice.json` as a fourth-transfer financial
  seed checkpoint.
- LG reference-slice evaluation passed 3/3 scenarios at 100/100 with 0
  required failures. The result is stored at
  `evals/results/lg-reference-slice-v0.1.autoeval-baseline.2026-05-05.json`,
  and the Agent Dog static report is stored at
  `evals/dashboard/agent-dog.lg-reference-slice.2026-05-05.json`.
- Cross-file structure integrity is now validated by
  `npm run validate:structure`. The validator checks group/company IDs,
  source manifests, identifier manifests, local source inventories, extraction
  reports, source-backed claims, wiki links, frozen scenario claim references,
  and required package scripts. It is intentionally legacy-aware: Hanwha's
  `local-source-inventory.v0.1` is accepted as PoC extraction history, while
  runtime-promoted claims and newer group inventories remain `companyId` and
  evidence-gated.
- Company alias matching was tightened after SK exposed a real ambiguity:
  short Latin aliases such as `SK` are now strict-boundary matches, and
  named-affiliate questions no longer pull unrelated affiliate claims merely to
  fill the maximum claim count.
- Samsung source topology differs from Hanwha: DART should act as the common
  official filing backbone, while affiliate IR pages are company-specific
  source modules under the Samsung group namespace. This does not require a
  visible group-to-company selector in the current UI; company routing should
  be driven by aliases, materiality, and question intent.
- Agent Dog quality management is scoped as a paper-stage static quality report
  now, an SCI product-validation dashboard later, and an optional
  client-operation layer only when publishable client logs are approved. The
  current paper should export dashboard-ready JSON from frozen scenarios and
  trace metrics, but it should not claim weekly Ragas production monitoring
  until live RAG logs and client-operation data exist.
- Product completion now has a documented stage-gate record in
  `docs/65_product_completion_stage_gate.md`. On 2026-05-05, the static
  product gates passed: `lint:wiki`, `validate:structure`,
  `validate:template`, `validate:stage-gate`, `validate:evals`,
  `validate:prompt-control`, `check:replit`, `typecheck`, and `build`.
- Publication strategy is now explicit in
  `docs/59_publication_strategy_and_sci_path.md`: the product is developed
  toward SCI-level rigor, while arXiv is a narrower strategy/method milestone.
  The later SCI path should not depend on final client operation logs as a hard
  requirement; a rigorous multi-group product-evaluation dataset can support
  the paper if client logs are unavailable or not publishable.
- The Hanwha reference slice parity audit is recorded in
  `docs/35_hanwha_reference_slice_parity_audit.md`. Verdict: Hanwha is suitable
  as the source-backed expansion template for the next group, but it is not a
  full clone of the original Replit operational app.

## Architectural Decisions

- Deterministic behavior belongs in code, not prompt prose.
- DSPy may optimize the answer composer boundary later, but source routing,
  claim eligibility, trace creation, and user/developer UI separation remain
  code-owned controls.
- Instructor-style structured output validation is the immediate runtime guard
  pattern for live LLM answers. Do not add the framework dependency until live
  traces show the hand-rolled contract is insufficient.
- Code-owned output contracts should constrain safety and evidence, not erase
  advisor judgment. The evaluation loop must catch excessive template
  repetition as a product-quality risk.
- Prompts stay short and policy-oriented.
- The old RAG markdown is a claim map, not verified knowledge.
- The LLM Wiki is a maintained synthesis layer, not the raw source of truth.
- Raw manifests remain the source of truth.
- Runtime answers must distinguish live, fallback, fixture, local, and error
  states.
- User-facing process status must remain readable, while raw tool labels,
  source statuses, and trace envelopes stay available for development and paper
  evaluation.
- Answer-generation process narration must come from code-owned
  `answerAssembly` and `processTrace`, not from model-written debug prose.
- Product changes should be kept only when the advisor auto-eval score stays at
  or above the paper-baseline threshold and no required source/trace check
  fails.
- Customer-facing answer sections use neutral review language such as
  `브리핑 검토축`, not recommendation or advice language.
- The paper should explicitly compare the initial exploratory PoC and the
  current traceable research PoC, while stating that full commercial operation
  remains future hardening rather than an achieved claim.
- PoC features may be deleted from runtime only when the prompt-control audit
  records why they worked in the demo, why they are unsafe or unscalable for
  commercial operation, and what replaces them.
- Claims become runtime-eligible only after claim-level source linking.
- Licensed or third-party analyst reports remain metadata-only unless rights
  are separately cleared.
- Provider API keys are shared service-level credentials. Company-specific
  differences belong in identifiers, source manifests, wiki namespaces, and
  evaluation scenarios.

## Key Artifacts

- `README.md`: public project overview and demo instructions.
- `docs/README.md`: ordered reading map for research documentation.
- `docs/20_source_selection_policy.md`: reusable source-selection rules.
- `docs/22_client_source_request_protocol.md`: bounded client source request
  protocol.
- `docs/23_hanwha_source_backed_claims.md`: first source-backed Hanwha seed
  claim set.
- `docs/24_pre_api_stage_gate.md`: current template-first gate before live API
  integration.
- `docs/25_hanwha_frozen_evaluation.md`: first frozen Hanwha scenario result
  summary.
- `docs/26_frozen_scenarios_and_client_questions.md`: distinction between
  benchmark scenarios and real client operation.
- `docs/27_original_poc_enrichment_audit.md`: PoC question/answer enrichment
  elements reused without reintroducing long prompts or hidden RAG.
- `docs/28_advisor_autoresearch_loop.md`: bounded auto-evaluation loop for
  keep/discard improvement decisions.
- `docs/29_prompt_to_code_migration_audit.md`: strict prompt-to-code and
  delete/archive decision standard.
- `docs/30_poc_stage_distinction.md`: paper-safe distinction between the
  original demo PoC, the current research PoC, and future commercial product.
- `docs/31_llm_programming_framework_selection.md`: DSPy selection rationale
  and adoption boundary.
- `docs/32_answer_generation_process_trace.md`: code-owned answer assembly
  process trace and UI policy.
- `docs/33_live_llm_output_contract.md`: live LLM structured-output contract
  and Instructor-style runtime guard boundary.
- `docs/34_paper_draft.md`: first manuscript draft outline, abstract,
  contribution map, evaluation framing, figure/table plan, and claim boundary.
- `docs/36_samsung_coverage_universe_plan.md`: first Samsung expansion plan,
  source-request checklist, and seed-unverified listed-company universe.
- `docs/37_samsung_source_adequacy_audit.md`: Samsung 6-company source package
  sufficiency audit and next ingestion gate.
- `docs/38_agent_quality_management_strategy.md`: Agent Dog quality-management
  scope decision, Ragas evidence boundary, paper/static vs SCI/operations
  dashboard roadmap.
- `docs/41_samsung_source_backed_seed_claims.md`: Samsung source-backed seed
  layer combining DART financial claims and evidence-located official IR/DART
  narrative claims.
- `docs/42_samsung_url_and_narrative_claim_readiness.md`: Samsung document URL
  intake and second narrative seed readiness gate.
- `docs/44_sk_transfer_readiness_plan.md`: SK transfer status, common-schema
  boundary, source backlog, and reference-slice next gate.
- `docs/45_sk_dart_financial_table.md`: OpenDART 2022-2024 financial table for
  the four-company SK seed.
- `docs/47_sk_source_inventory_and_ingestion.md`: SK local source package
  inventory, document-URL matching, and extraction-status report.
- `docs/48_sk_narrative_claim_queue.md`: SK source-ready and blocked narrative
  review queue.
- `docs/49_sk_source_backed_narrative_claims.md`: SK narrative seed promotion
  evidence and runtime claim boundary.
- `docs/50_sk_reference_slice_evaluation.md`: SK second-transfer evaluation
  result, Agent Dog paper-stage quality summary, and latency follow-up.
- `docs/51_latency_hardening_and_measurement.md`: common-harness latency
  diagnosis, parallel source collection, cache policy, and before/after result.
- `docs/52_hyundai_motor_source_request.md`: bounded Hyundai Motor Group source
  request protocol for the next transfer slice.
- `docs/53_group_onboarding_standard.md`: common group onboarding standard
  from identifier verification through source-backed claims, wiki, and frozen
  scenarios.
- `docs/57_hyundai_second_wave_intake_preparation.md`: Hyundai Motor Group
  second-wave intake candidate list, DART/KRX identifiers, and runtime boundary.
- `docs/59_publication_strategy_and_sci_path.md`: arXiv-as-milestone and
  SCI-level product/evidence strategy, including the boundary for optional
  client operation logs.
- `evals/scenarios/hanwha.reference-slice.json`: frozen Hanwha paper/demo
  questions and expected source-backed claim IDs.
- `evals/rubrics/advisor.answer-quality.v0.2.json`: answer/trace/briefing
  scoring rubric adapted from original PoC regression and briefing-card guards.
- `evals/results/hanwha.reference-slice.2026-05-01.json`: paper-safe summary of
  the first five Hanwha frozen scenario runs.
- `evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json`:
  first automatic paper-baseline scoring result.
- `raw/manifests/prompt-control-plane-audit.json`: machine-readable
  prompt/code/wiki/delete classification.
- `raw/manifests/llm-framework-selection.json`: machine-readable DSPy
  framework decision.
- `raw/manifests/llm-output-contract.json`: machine-readable live LLM output
  contract for structured answer validation.
- `raw/manifests/hanwha.source-backed-claims.json`: machine-readable seed
  claims for runtime and paper trace.
- `raw/manifests/samsung.coverage-universe.seed.json`: Samsung coverage
  universe seed table and official-source backlog.
- `raw/manifests/samsung.identifier-verification.json`: Samsung DART/KRX
  identifier verification and official IR URL intake map.
- `raw/manifests/samsung.local-source-adequacy-audit.json`: Samsung local PDF
  and DART viewer URL adequacy audit.
- `raw/manifests/samsung.claim-candidate-plan.json`: Samsung source-to-claim
  drafting plan; not runtime-eligible source-backed knowledge.
- `raw/manifests/samsung.dart-financial-table.2022-2024.json`: OpenDART
  financial table extraction for 15 Samsung listed companies with account
  labels, status, and partial/error records preserved.
- `raw/manifests/samsung.dart-financial-account-audit.2022-2024.json`: OpenDART
  account availability audit for Samsung financial companies, used to avoid
  paper-scope expansion into custom finance revenue definitions.
- `raw/manifests/samsung.source-backed-claims.json`: Samsung source-backed
  seed claims, currently 31 records: 19 financial baseline/trend claims and 12
  narrative IR/DART claims.
- `raw/manifests/samsung.document-url-intake.json`: exact public URL intake
  ledger for Samsung local PDFs and DART viewer filings.
- `raw/manifests/samsung.dart-filing-extraction-report.json`: Samsung Life/Fire
  DART document extraction status.
- `raw/manifests/samsung.narrative-claim-queue.json`: non-runtime second seed
  claim review queue.
- `raw/manifests/sk.identifier-verification.json`: SK DART/KRX identifier
  verification for SK Hynix, SK Innovation, SK Inc., and SK Telecom.
- `raw/manifests/sk.dart-financial-table.2022-2024.json`: OpenDART financial
  table for the four-company SK seed.
- `raw/manifests/sk.local-sources.json`: SK local source package inventory.
- `raw/manifests/sk.extraction-report.json`: SK PDF extraction status and
  source-text availability report.
- `raw/manifests/sk.narrative-claim-queue.json`: SK narrative review queue for
  future source-backed claim expansion.
- `raw/manifests/sk.source-backed-claims.json`: SK source-backed seed claims,
  currently 16 records: 8 financial baseline/trend claims and 8 promoted
  official IR/DART narrative claims.
- `evals/scenarios/sk.reference-slice.json`: bounded SK reference-slice
  scenario file for the second transfer checkpoint.
- `evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`:
  SK second-transfer auto-evaluation result.
- `evals/dashboard/agent-dog.sk-reference-slice.2026-05-03.json`: SK
  paper-stage Agent Dog quality seed.
- `evals/dashboard/advisor-latency-baseline.2026-05-03.json`: baseline latency
  report across Hanwha, Samsung, and SK.
- `evals/dashboard/advisor-latency-optimized.2026-05-03.json`: optimized
  latency report after parallel collection and cache hardening.
- `raw/manifests/hyundai-motor.identifier-verification.json`: Hyundai Motor
  Group first-slice and optional second-wave DART/KRX identifier verification.
- `raw/manifests/hyundai-motor.source-intake-template.json`: Hyundai Motor
  Group source intake shell and acceptance checklist for the first slice and
  second-wave intake candidates.
- `raw/manifests/hyundai-motor.local-sources.json`: generated Hyundai Motor
  Group local source inventory from `../hyundai_knowledge`; currently 84 local
  official PDF entries, 2 duplicate-reference-only entries, and 9 unmatched
  Kia SPA/download ledger rows.
- `raw/manifests/hyundai-motor.extraction-report.json`: generated Hyundai
  Motor Group extraction report; currently 82/82 official extraction
  candidates extracted with 7 low-text/OCR warnings held back from narrative
  claim promotion.
- `raw/manifests/hyundai-motor.dart-financial-table.2022-2024.json`: OpenDART
  annual financial table for Hyundai Motor, Kia, and Hyundai Mobis.
- `docs/54_hyundai_motor_dart_financial_table.md`: paper-readable Hyundai
  Motor Group DART financial table summary.
- `raw/manifests/hyundai-motor.narrative-claim-queue.json`: Hyundai narrative
  review queue; currently 75 ready records, 7 blocked low-text/OCR records, and
  2 skipped duplicate reference files, none promoted.
- `docs/55_hyundai_motor_narrative_claim_queue.md`: Hyundai narrative queue
  summary and blocked-source rationale.
- `raw/manifests/hyundai-motor.source-backed-claims.json`: Hyundai Motor Group
  source-backed financial seed claims, currently 6 records.
- `docs/56_hyundai_motor_source_backed_financial_seed.md`: Hyundai financial
  seed claim promotion summary.
- `evals/scenarios/hyundai-motor.reference-slice.json`: bounded Hyundai third
  transfer financial reference-slice scenario file.
- `evals/results/hyundai-motor-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`:
  Hyundai third-transfer auto-evaluation result.
- `evals/dashboard/agent-dog.hyundai-motor-reference-slice.2026-05-03.json`:
  Hyundai paper-stage Agent Dog quality seed.
- `configs/group-onboarding-template.json`: reusable machine-readable
  onboarding artifact contract for future groups and clients.
- `evals/questions/samsung.investor-candidate-questions.json`: Samsung
  customer-facing candidate question set for future scenario design.
- `evals/dashboard/agent-dog.paper-seed.2026-05-02.json`: dashboard-ready
  paper-stage quality seed generated from advisor auto-evaluation results.
- `wiki/groups/hanwha/`: LLM Wiki reference namespace for the Hanwha slice.
- `wiki/groups/samsung/`: generated Samsung LLM Wiki namespace for source
  routing, review, and linked source-backed seed claims where promoted.

## Reproducibility Commands

Run these when the source layer changes:

```bash
npm run inventory:hanwha
npm run crawl:hanwha-official
npm run provenance:hanwha
npm run rationale:hanwha
npm run backfill:hanwha
npm run extract:hanwha
npm run claims:hanwha
npm run promote:hanwha
npm run validate:hanwha-ingestion
```

Run these when the Samsung expansion layer changes:

```bash
npm run inventory:samsung
SAMSUNG_EXTRACT_WRITE_TEXT=1 npm run extract:samsung
npm run claims:samsung
npm run wiki:samsung
npm run questions:samsung
npm run urls:samsung
npm run urls:samsung:import
npm run dartdocs:samsung
npm run claims:samsung:narrative
npm run financials:samsung:dart
npm run audit:samsung-financial-accounts
npm run promote:samsung
npm run validate:samsung-claims
npm run validate:samsung-narrative
npm run validate:samsung-ingestion
npm run validate:samsung-financials
```

Run these when the SK expansion layer changes:

```bash
npm run inventory:sk
npm run extract:sk
npm run claims:sk:narrative
npm run financials:sk:dart
npm run promote:sk
npm run wiki:sk
npm run eval:sk:financial
npm run eval:sk
npm run quality:sk
npm run latency:advisor
```

Run these when the Hyundai Motor Group source layer changes:

```bash
npm run inventory:hyundai
npm run validate:hyundai-intake
npm run extract:hyundai
npm run financials:hyundai:dart
npm run claims:hyundai:narrative
npm run promote:hyundai
npm run wiki:hyundai
npm run eval:hyundai
npm run quality:hyundai
npm run validate:structure
```

Run these before screenshots, demo sharing, or Replit upload:

```bash
npm run lint:wiki
npm run validate:structure
npm run validate:template
npm run validate:stage-gate
npm run validate:evals
npm run validate:prompt-control
npm run eval:advisor
npm run eval:lg
npm run quality:seed
npm run quality:lg
npm run check:replit
npm run typecheck
npm run build
```

## Current Next Step

Product readiness is the current priority. Keep `docs/34_paper_draft.md` as the
manuscript control document, but do not let paper-writing interrupt the product
template work. Samsung is the first completed transfer slice. SK is the second
bounded transfer slice with DART financial claims, promoted official IR/DART
narrative claims, generated wiki pages, and a reference-slice scenario; the
first-slice SK set now includes SK Square. Hyundai Motor Group is the third
transfer financial seed with DART financial claims, generated wiki pages, and a
reference-slice scenario; its expanded source package is inventoried and
extracted, but narrative IR claims remain queued until evidence locators are
reviewed and Kia URL/OCR gaps are resolved when needed. LG is the fourth
transfer financial seed: identifiers, DART financial table, source-backed
financial claims, wiki pages, and a frozen financial scenario are prepared. The
user-supplied `lg_knowledge` package has now entered the same inventory,
extraction, and narrative queue path, but LG narrative IR claims are not
runtime-promoted until evidence locators are reviewed.

Then continue in a controlled order while preserving the same trace schema and
fixture-compatible fallback path:

1. prewarm market snapshots for the visible groups so the first request also
   benefits from the KRX daily-row cache;
2. run `npm run validate:stage-gate`, `npm run validate:evals`, and
   group-specific evals after each promotion step;
3. collect or attach Kia document-level URLs and selection reasons, then
   promote a minimal Kia narrative subset if it is needed for Hyundai parity;
4. promote a small Hyundai narrative subset from already extracted sources
   after evidence-line review; keep OCR/text-bearing substitutes for the 7
   low-text Hyundai/Mobis/Rotem PDFs as optional later work;
5. promote a small LG narrative subset only after extracted markdown review:
   prioritize LG Electronics, LG Chem, LG Energy Solution, and optionally LG
   Corp. value-up progress; keep blocked OCR/XLSX rows out of runtime claims;
6. upgrade `/api/advisor` to the original-style turn status stream when live
   tool latency becomes material to the demo;
7. connect news search with source/date filters;
8. connect the LLM composer after deterministic validation remains stable;
9. connect TTS only as an optional presentation mode;
10. prepare the DSPy sidecar experiment after the deterministic Samsung/Hanwha
   baselines are stable;
11. repeat the same bounded sequence for future client groups.

## Paper Claims Allowed Now

It is currently fair to claim:

- the PoC was reconstructed into a traceable demo architecture;
- Hanwha is used as the first reference slice;
- official Hanwha source provenance and source-selection rules are recorded;
- a small set of official-source-backed claims can be promoted from old RAG
  prose into bounded runtime context;
- Samsung has a DART financial seed claim set and document-level URL intake for
  the six-company narrative source queue;
- Samsung Life and Samsung Fire DART filings have been extracted to local
  markdown for review;
- a small Samsung official IR/DART narrative subset has been runtime-promoted
  with evidence-line locators and source hashes;
- SK has advanced to a bounded second transfer slice with 20 source-backed seed
  claims, generated wiki pages, and a reference-slice scenario;
- Hyundai Motor Group has advanced to a bounded third transfer financial seed
  with 10 OpenDART source-backed financial claims, generated wiki pages, and a
  3-scenario reference-slice baseline;
- LG has advanced to a bounded fourth transfer financial seed with 10
  OpenDART source-backed financial claims, generated wiki pages, and a
  reference-slice scenario;
- Hanwha has been re-scoped from a single issuer reference into a 5-company
  first slice. Hanwha Corp. keeps the original source-backed seed set, and
  Hanwha Aerospace, Hanwha Solutions, Hanwha Systems, and Hanwha Ocean now each
  have at least one company-scoped source-backed seed claim promoted from
  official IR materials. A Hanwha OpenDART financial table is also generated
  for the listed Hanwha companies;
- the same process is designed to apply to Samsung, SK, Hyundai Motor, LG, and
  future groups.

It is not yet fair to claim:

- full five-group knowledge coverage;
- fully live DART/KRX/news/LLM operation;
- full Samsung narrative coverage across all listed affiliates;
- full SK group coverage outside the 20 promoted source-backed seed claims;
- full Hyundai narrative IR coverage outside the 10 promoted OpenDART financial
  seed claims, despite the expanded 82-record extraction queue;
- full Hanwha affiliate coverage beyond the 15 promoted source-backed seed
  claims;
- that every old RAG claim is verified;
- that the app is production-compliance ready;
- that third-party analyst report contents are redistributable.

## Maintenance Rule

Update this file whenever one of these changes:

- project purpose or positioning;
- target group order or default group;
- source-ingestion status;
- promoted source-backed claim count;
- API/runtime trace contract;
- deployment path;
- next milestone.

Keep this file short. Detailed evidence belongs in `docs/`, `raw/manifests/`,
and `wiki/`.

## Knowledge Base Folder Move

As of 2026-05-05, all local company source packages have been moved into the
sibling raw-source root `../Knowledge Base/`. The expected source roots are now
`../Knowledge Base/hanhwa_knowledge`, `../Knowledge Base/samsung_knowledge`,
`../Knowledge Base/sk_knowledge`, `../Knowledge Base/hyundai_knowledge`, and
`../Knowledge Base/lg_knowledge`.

The repository still stores runtime and paper artifacts: manifests, extracted
markdown, source-backed claims, wiki pages, evaluation traces, and UI/runtime
code. Local raw files remain outside the repository. Inventory scripts and
source manifests are aligned with the `Knowledge Base` root, and temporary
incoming packages should no longer remain as parallel raw-source folders after
hash reconciliation.

## arXiv 25-Company Baseline

The arXiv/product baseline is now fixed as five groups with five listed
companies each. The first-slice target is Samsung Electronics, Samsung SDI,
Samsung C&T, Samsung Biologics, Samsung Electro-Mechanics; SK Hynix, SK
Innovation, SK Inc., SK Telecom, SK Square; Hyundai Motor, Kia, Hyundai Mobis,
Hyundai Glovis, Hyundai Rotem; LG Electronics, LG Chem, LG Energy Solution, LG
Innotek, LG Uplus; and Hanwha Corp., Hanwha Aerospace, Hanwha Solutions, Hanwha
Systems, Hanwha Ocean.

Inventory scripts and source-intake templates now default to
`../Knowledge Base/<group>_knowledge`. The inventories were regenerated and
`validate:template`, `validate:stage-gate`, `validate:structure`, and
`lint:wiki` pass. The latest first-slice audit reports all 25 companies have
local sources, wiki pages, and at least one source-backed claim. All 25
first-slice companies are now `runtime-seed-ready` with zero open readiness
gaps. Hanwha's remaining work is no longer first-slice readiness; it is deeper
narrative promotion, additional annual-report/DART filing cross-checks, and
answer-quality tuning.

The next human-review surface is now generated by `npm run
claims:review-packet`. It creates a 25-company promotion packet with 25
priority source rows and 50 alternates. This packet is not runtime knowledge;
it is the controlled bridge from official sources to reviewer-approved atomic
claims.

Codex now also performs the first-pass reviewer judgment with `npm run
claims:review-proposals`. After the user's Hyundai Rotem DART package was
checked, the generated approval packet now proposes all 25 priority rows for
seed review approval with 0 holds. Hyundai Rotem's earlier hold is resolved by
using the 2025 DART business-report extraction as the primary evidence locator
instead of the low-label 4Q IR chart extraction. The proposal artifacts are
`docs/83_claim_review_proposals_for_approval.md` and
`raw/manifests/claim-review-proposals.json`. The user's approval is recorded by
`npm run claims:approve-review` in `docs/84_claim_review_approval_record.md`
and `raw/manifests/claim-review-approval-record.json`. The approved claim layer
is now runtime-promoted by `npm run promote:approved-review` and validated by
`npm run validate:approved-review-claims`; see
`docs/85_review_approved_runtime_claims.md` and
`raw/manifests/review-approved-runtime-promotion.json`.
