# Next Worker Handoff

This file is the first document a new worker should read. It compresses the current project state into operational rules so the next task can start cleanly without reconstructing the full chat history.

## One-Sentence Project

This repository reconstructs a Replit-built Korean conglomerate investor-advisor PoC into a reproducible, source-backed, traceable, and extensible LLM-agent product/research artifact.

## Start Here

Read these files in order:

1. `PROJECT_CONTEXT.md` for current status and decisions.
2. `docs/README.md` for the active documentation path.
3. `../Knowledge Base/README.md` for raw-source folder rules.
4. `../Knowledge Base/_index/company-source-index.md` for company readiness.
5. `../Knowledge Base/_index/folder-taxonomy.md` for source folder abstraction.

The historical numbered docs are intentionally preserved. Do not try to read all of them first.

## Workspace Map

```text
Value Investment AI Advisor/
  Korea-Investor-Advisor-Research/   active product/research repository
  Knowledge Base/                    raw source package root, outside repo
  HanWha-Advisor-main/               original Replit PoC archive
  arxiv-paper/                       paused paper draft workspace
```

The active app is `Korea-Investor-Advisor-Research`. Raw PDF/IR/source files belong in `../Knowledge Base`, not inside the app repository.

## Product Direction

- Product work has priority over paper writing for now.
- The UI stays Korean until final paper-submission screenshot work.
- Samsung is the neutral default UI group.
- Hanwha remains the deepest reference slice from the original PoC.
- The first product/paper slice is five groups with five listed companies each.
- The core method is harness engineering: move deterministic behavior out of prompts and into code, schemas, source manifests, validators, and traces.

## Non-Negotiable Rules

- Do not flatten raw source folders only for visual neatness.
- Do not point the LLM directly at arbitrary raw PDFs.
- Do not expose claim IDs, process traces, fixture status, or developer wording in the customer UI.
- Do not use recommendation language such as `매수`, `매도`, `목표가`, `투자의견`, or `투자 판단` unless quoted from a source.
- Do not treat generated wiki pages as the source of truth. Official source files, source manifests, and source-backed claims are authoritative.
- Do not delete numbered docs or generated manifests unless the scripts that write them are migrated at the same time.
- Do not reintroduce `ir_download` as a permanent folder. New packages may be staged temporarily, reconciled, indexed, then retired.

## Knowledge Base Rule

`../Knowledge Base` preserves collection context. The project reads it through:

- `raw/manifests/source-ledger.v0.1.json`
- `raw/manifests/company-source-index.json`
- `../Knowledge Base/_index/company-source-index.md`
- `../Knowledge Base/_index/group-source-summary.md`
- `../Knowledge Base/_index/folder-taxonomy.md`
- `configs/source-folder-taxonomy.json`

Physical folder names may vary by group or collector. The canonical fields are:

- `groupId`
- `companyId`
- `documentType` or normalized source category
- `sourceUrl` or source-page URL
- `selectionReason`
- `claimStatus`
- `sourceId`

## Current Data State

Current source ledger snapshot:

- 600 source records
- 38 company index rows
- 578 PDF sources
- 510 URL-backed sources
- 546 sources with selection reasons
- 210 former `ir_download` files reconciled by SHA-256

Current known gaps:

- Hanwha: blocked URL reconciliation has been completed at the narrative-queue level; 95/95 official rows are ready for human claim review, but they still require reviewer-approved atomic claim promotion before runtime use.
- Hyundai Motor Group: 122/148 official rows are ready for human claim review. Remaining blocked rows are mostly OCR/low-text, plus 5 Hyundai E&C source-provenance rows and 1 invalid Kia PDF extraction case.
- Samsung: some source document types still classify as `unknown`; improve inference before overclaiming.
- Hyundai/LG/SK optional expansion sources may need narrative claim promotion later, but the current first-slice runtime seed is bounded by promoted claims only.
- Claim-promotion review now has a reproducible cross-group packet:
  `docs/82_claim_promotion_review_packet.md` and
  `raw/manifests/claim-promotion-review-packet.json`. It gives 25 priority
  source rows and 50 alternates for human claim review without automatically
  changing runtime claims.
- Codex first-pass decisions now live in
  `docs/83_claim_review_proposals_for_approval.md` and
  `raw/manifests/claim-review-proposals.json`. Current status: 25 proposed
  approvals and 0 holds. Hyundai Rotem's earlier hold was resolved by using the
  2025 DART business-report extraction as the primary evidence locator instead
  of the low-label 4Q IR chart extraction. These proposal rows still require
  user approval and group-specific promotion validators before runtime use.
- User approval has now been recorded through `npm run claims:approve-review`.
  The approval basis is in `docs/84_claim_review_approval_record.md` and
  `raw/manifests/claim-review-approval-record.json`: 25 approved rows, 29
  evidence locators, 0 holds. This approval freezes wording and locators for
  seed-config preparation.
- The approved rows have now been promoted into runtime source-backed claim
  manifests through `npm run promote:approved-review` and verified with
  `npm run validate:approved-review-claims`. The promotion record is
  `docs/85_review_approved_runtime_claims.md` and
  `raw/manifests/review-approved-runtime-promotion.json`: 25 promoted claims,
  five per group, under `paperUseLevel=source-backed-review-approved-claim`.
  Existing financial and narrative seed claims were preserved.
- After promotion, runtime source selection was adjusted to return up to five
  source-backed claims per question and to prefer company-scoped context claims
  for portfolio, AI, battery, NAV, value-up, and shareholder-return questions.
  The eval scenarios were aligned with the current company-scoped routing rule.
  Current auto-eval status: Samsung 5/5, SK 5/5, Hyundai Motor 3/3, LG 3/3,
  and Hanwha 5/5 with zero required failures.
- Product/paper readiness now has an executable gate:
  `npm run audit:product-paper`. Current verdict:
  `stage-4-live-api-quality-smoke-passed-needs-expert-review`. This means the
  bounded 25-company research product beta is arXiv method/demo ready and live
  API answer-quality smoke checks pass, while expert-policy review, SCI
  validation, and commercial v1 deployment remain future hardening work.
  `npm run check:replit` and `npm run build` also pass after this audit.
- DART/KRX/Naver are connected. Run `npm run smoke:live-api` for the standard
  check, or `ADVISOR_SMOKE_NO_EXISTING_SERVER=1 npm run smoke:live-api` for a
  stricter cache-disabled smoke server. Latest result: all five groups returned
  `dart.disclosures`, `krx.market`, and `news.search` as `live`.
- Live answer-quality smoke is now executable with `npm run audit:live-answer`
  or, for a stricter cache-disabled spawned server,
  `ADVISOR_LIVE_QUALITY_NO_EXISTING_SERVER=1 npm run audit:live-answer`.
  Latest result: 15/15 samples passed across five groups and three question
  types, with 0 warnings, 0 blockers, 100/100 average score, and trace export
  present. The output is `docs/88_live_answer_quality_audit.md` and
  `raw/manifests/live-answer-quality-audit.json`.
- Human answer review is now prepared by `npm run review:answers`, or
  `ADVISOR_REVIEW_NO_EXISTING_SERVER=1 npm run review:answers` for a
  cache-disabled spawned server. Latest result: 15 actual customer-facing
  answer samples across five groups, 69 selected source-backed claims, 75
  source links, and 60 follow-up questions. The output is
  `docs/89_human_answer_review_packet.md` and
  `raw/manifests/human-answer-review-packet.json`. This packet is where human
  investment-research review should happen next.

## Routine Commands

Install and run:

```bash
npm install
npm run dev
```

Local app:

```text
http://localhost:5173/
```

Core validation:

```bash
npm run typecheck
npm run validate:structure
npm run validate:stage-gate
npm run validate:template
npm run lint:wiki
```

Knowledge Base refresh after source changes:

```bash
npm run audit:source-ledger
npm run organize:knowledge-base
npm run audit:first-slice
npm run audit:group-data
```

Documentation refresh:

```bash
npm run audit:docs
npm run audit:product-paper
npm run smoke:live-api
npm run audit:live-answer
npm run review:answers
```

## Source Intake Workflow

When a new source package arrives:

1. Put it in a temporary staging folder outside the app repository.
2. Reconcile by SHA-256 against `../Knowledge Base`.
3. Copy only unique source files into the right group/company folder.
4. Keep URL ledgers and selection reasons with the group package.
5. Run the group inventory script.
6. Run extraction if PDFs are eligible.
7. Rebuild the source ledger.
8. Rebuild the Knowledge Base `_index`.
9. Retire the staging folder only after the import manifest has no unsafe records.

Do not leave staging folders as parallel source roots.

## Claim Promotion Workflow

Raw source presence is not enough. Runtime use requires:

1. company-scoped source identity;
2. official URL or source-page evidence;
3. successful extraction or structured tool output;
4. atomic claim text;
5. evidence locator;
6. source hash;
7. validation pass;
8. customer-facing answer plan.

Until these are present, keep the source in the ledger but do not promote it into visible answers.

To generate the current cross-group reviewer packet:

```bash
npm run claims:review-packet
npm run claims:review-proposals
npm run claims:approve-review
npm run promote:approved-review
npm run validate:approved-review-claims
```

Start with `docs/82_claim_promotion_review_packet.md`. The packet is a review
surface, not a promotion manifest. Then read
`docs/83_claim_review_proposals_for_approval.md` for proposed wording,
`docs/84_claim_review_approval_record.md` for user approval, and
`docs/85_review_approved_runtime_claims.md` for the runtime promotion result.
The cross-group promotion script is idempotent. If older group-specific
`promote:*` scripts are rerun, rerun `npm run promote:approved-review`
afterward until those older scripts are updated to preserve the review-approved
layer themselves.

Recent completed example: SK Square now has four promoted source-backed claims
(`sk-sbc-017` through `sk-sbc-020`) covering value-up/NAV discount framing,
2025 portfolio-update financial metrics, shareholder return execution, and
portfolio NAV concentration. The evidence path is recorded in
`docs/49_sk_source_backed_narrative_claims.md`,
`raw/manifests/sk.source-backed-claims.json`, and
`wiki/groups/sk/companies/sk-square.md`. The SK reference-slice auto-eval now
has five scenarios, including SK Square, and passes 5/5 at 100/100 with 0
required failures.

## UI Workflow

Customer UI should show:

- concise first-screen briefing cards;
- source links by information type;
- sectioned, insight-first answers;
- customer-facing follow-up questions;
- process rail only as a user-friendly collection/analysis affordance.

Live news headlines should not be quoted directly in the answer body when a
neutral source-status note is enough. Headlines can contain trading-action
terms that would trip customer-safety and evaluation guards; keep the actual
news URL in the source-link package.

Developer UI should remain guarded by `VITE_ADVISOR_DEV_UI`.

For clean client or paper screenshots:

```bash
VITE_ADVISOR_DEV_UI=0 npm run build
```

## Replit Export

The current repository is the research/product source of truth. Replit demos should be exported from here, not edited back into this repo casually.

Current export script:

```bash
npm run export:replit:samsung
```

Demo-only features must stay out of the research product unless explicitly accepted as part of the paper/product architecture.

## Paper Boundary

Paper work is paused until product structure stabilizes. Later paper updates should use product development evidence, not speculative claims.

Safe current paper claim:

- a prompt-heavy PoC was reconstructed into a traceable, source-backed, multi-group harness architecture.

Unsafe current paper claim:

- complete commercial readiness;
- complete live-data reliability;
- real client operational performance;
- investment advice effectiveness.

## Before Ending Any Task

Run the smallest relevant validation set. For source or structure work, at minimum run:

```bash
npm run audit:source-ledger
npm run organize:knowledge-base
npm run validate:structure
npm run validate:stage-gate
npm run typecheck
```

Then update `PROJECT_CONTEXT.md` if the task changes source coverage, runtime behavior, validation status, deployment path, or next milestones.
