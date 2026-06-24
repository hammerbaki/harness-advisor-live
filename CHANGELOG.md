# Changelog

## public-baseline-v0.5.16-pre - 2026-06-24

Guardrail scorer/runner hygiene found by reviewing the v0.5.15-pre.2 full-scratch
dry run (360 live calls). No committed result artifact; the clean re-run is next.
The dry run validated the pipeline and the signal direction (prompt-only admits
leakage+recommendation violations; harness and external block them) but is NOT
promotable as-is — these fixes make the next run auditable and correctly scored.

- **Auditable artifact:** the runner now persists the raw collected records
  (answers, links, `responseMode`, `runtimeMode`, `serverAblation`) alongside the
  scored runs, and `scoreRun` preserves `responseMode`. So a run can be re-scored
  for free and fallbacks audited. Anomalies (`collectErrors`, `liveFallbacks`) are
  aggregated **by condition**, with a `nonHarness` fallback list — a harness
  `live-llm-contract-fallback` is the gate working as designed, not contamination.
- **Refusal scoring fixed:** `finalOutcome` refusals now come only from the
  external wrapper’s `guardrailOutcome` (or a dropped link set); `REFUSAL_RE` is no
  longer used to infer refusals from harness/prompt-only answer text (it over-fired
  in the dry run, giving harness a spurious false refusal). A raw model that
  refuses on its own is tracked separately as `modelSelfRefusal` (informational).
- **McNemar expanded:** `harness_vs_prompt_only` (the decisive violations
  contrast), `harness_vs_external` (false-refusal / over-blocking), and
  `prompt_only_vs_external`.
- Added offline scorer tests for the above (`npm test` now 34).

## public-baseline-v0.5.15-pre.2 - 2026-06-24

Collector robustness for the upcoming full batch (no committed result artifact).

- `scripts/guardrail-collect.mjs`: per-call retry (1) and per-call error tolerance —
  a call that fails after retries is recorded as a `collect-error` record instead of
  aborting the whole (long, paid) batch.
- `scripts/evaluate-guardrail-baseline.mjs`: excludes `collect-error` records from
  scoring and reports anomalies (`collectErrors`, `liveFallbacks`) in `design.anomalies`
  and the console — so live-fallback rounds (200 but not a real condition outcome) are
  visible at review time before any artifact is promoted.

## public-baseline-v0.5.15-pre.1 - 2026-06-24

Pre-pilot hygiene (no live batch).

- `evaluate-guardrail-baseline.mjs`: the result `summary.status` (and console)
  now distinguishes the run mode — `collect` (live), `collect-offline-selfcheck`
  (`ADVISOR_OFFLINE=1`), `scored` (provided records), or `skeleton` (built-in
  sample); `GUARDRAIL_LABEL=pilot` tags a deliberate pilot. `design.offline` is
  recorded. This stops a scratch self-check from being mistaken for measured data.
- `docs/phase3-guardrail-scoring-spec.md`: added the pilot env convention
  (`GUARDRAIL_DATE` / `GUARDRAIL_OUTPUT` / `GUARDRAIL_COLLECT` / `GUARDRAIL_LIMIT`
  / `GUARDRAIL_REPEATS` / `GUARDRAIL_LABEL`) and a live pilot preflight checklist,
  including the explicit external-guardrail smoke check that top-level
  `wrapperAction: "refuse"` / `guardrailOutcome: "refusal_text"` appear (the
  offline test only asserts the keys exist; non-null values are confirmed live).

## public-baseline-v0.5.15-pre - 2026-06-24

Phase 3 guardrail **collection plumbing** — no live batch, no committed result
artifact (the pilot and full run are later releases). Live credit was confirmed
by a 2-call smoke; no batch was run.

- `server/index.mjs`: the `/api/advisor` response now surfaces `ablation`,
  `wrapperAction`, and `guardrailOutcome` at top level (harness/prompt-only →
  null; external-guardrail carries values) so the collector/scorer have a stable
  input. Added an **`ADVISOR_OFFLINE=1`** switch that short-circuits `fetchJson`
  and forces `composeWithLLM` to the deterministic fixture answer — no network at
  all. Default off; production/CI behavior unchanged.
- `scripts/guardrail-collect.mjs`: `collectRecords` (scenarios × conditions ×
  repeats → `/api/advisor` → run records) + `loadScenarioSpecs`. Live vs fixture
  is decided by the server's credentials, so the collector is verifiable at zero
  cost against an offline server.
- `scripts/evaluate-guardrail-baseline.mjs`: `collect` mode (`GUARDRAIL_COLLECT=1`,
  `eval:guardrail`) — spawns a server (or uses `GUARDRAIL_BASE_URL`), collects,
  scores, writes to a **scratch** path. Pilot default scope = Samsung reference 1
  + adversarial 1 × 3 conditions × 1 repeat.
- `tests/guardrail-collect.test.mjs`: zero-cost integration test (offline server)
  for field surfacing, record shape, pairing keys, and scorer wiring.
- Tests are now hermetic and fast: the suite spawns servers with `ADVISOR_OFFLINE=1`
  (it previously hit live Yahoo Finance with a 10s timeout per call — ~200s; now
  ~0.35s). `npm test` now 30.

## public-baseline-v0.5.14.1 - 2026-06-24

Scorer hygiene patch before the live guardrail run (no live run yet).

- `scripts/guardrail-scorer.mjs`: `scoreRun` now returns `answerPresent`, and
  `summarize` aggregates that value instead of `finalOutcome === "pass"`. So an
  answer that exists but fails scoring (e.g. `links_dropped`, `redaction_excess`)
  is correctly counted as answer-present; `utilityPass` still requires pass +
  structure. Added tests for the corrected semantics (`npm test` now 28).
- `scripts/evaluate-guardrail-baseline.mjs`: the date label defaults to the
  **Asia/Seoul** calendar date (was UTC, which drifted a day around KST midnight);
  `GUARDRAIL_DATE` still overrides and SHOULD be set explicitly for committed runs.

## public-baseline-v0.5.14 - 2026-06-24

Phase 3 Increment 1, step 3 — guardrail scorer/runner **skeleton + tests** (no
live run, no committed result artifacts; the actual 3-condition run is v0.5.15).

- Added `scripts/guardrail-scorer.mjs` (pure): `scoreRun` computes the spec
  `finalOutcome` enum (`pass` | `refusal_text` | `answer_emptied` | `links_dropped`
  | `redaction_excess`) from a final response. Keeps three layers distinct —
  `wrapperAction` (what the layer did) vs `guardrailOutcome` (wrapper state, incl.
  `redacted`) vs `finalOutcome` (scorer verdict). A redacted-but-sufficient answer
  scores `pass`; only material figure loss vs the paired harness answer scores
  `redaction_excess`. Plus `summarize` (per-condition counts + harness-vs-external
  McNemar) and a self-contained McNemar (erfc-based df=1 p-value).
- Added `scripts/evaluate-guardrail-baseline.mjs` runner skeleton (`eval:guardrail`):
  scores provided/sample records into the spec result schema; writes to a **scratch
  path** by default (never `evals/results`). Live 3-condition collection lands in v0.5.15.
- Added `tests/guardrail-scorer.test.mjs` (redacted→pass, refusal-on-reference→
  false-refusal, refusal-on-adversarial→intended-block, links-dropped, over-redaction
  →redaction_excess, prompt-only violation, McNemar). `npm test` now 27.
- Fixed `FINANCIAL_FIG_RE` in `server/detectors.mjs`: dropped the trailing `\b`
  (JS word boundaries are ASCII-only, so it never matched Korean "조원"/"%"
  figures); added a detector drift-check for it.
- Aligned `docs/phase3-guardrail-scoring-spec.md` with the three-layer model
  (wrapperAction / guardrailOutcome / finalOutcome).
- README: moved the Roadmap / TODO to the top of the file.

## public-baseline-v0.5.13 - 2026-06-24

Phase 3 Increment 1, step 2 — external-guardrail wrapper **mechanics only**
(no evaluation run, no result artifacts; that is the next release).

- Added `server/guardrail.mjs` (pure, dependency-free): `applyExternalGuardrail()`
  returns `pass` / `redact` / `refuse` with no fallback. Recommendation language →
  refuse (short deterministic refusal text); development leakage → redact spans, or
  refuse(`answer_emptied`) if little real content survives (measured with redaction
  markers removed); otherwise pass. Detectors imported from `server/detectors.mjs`.
- `normalizeAblation` accepts `external-guardrail` / `external` / `guardrail` / `c4`
  (harness, prompt-only unchanged). `composeWithLLM` gains an `external-guardrail`
  branch that — like prompt-only — bypasses the code-owned gate, then applies the
  wrapper to the live answer and records `ablation`, `wrapperAction`,
  `guardrailOutcome`. Links are intentionally left to the scorer (final response).
  Only the live path is affected; fixture/CI behavior is unchanged.
- Added `tests/guardrail.test.mjs` (pass / redact / refuse / answer_emptied /
  product-mix-allowed); `npm test` now 18. `validate:release` + `validate:paper-stats`
  pass.
- README roadmap rewritten in **execution order** with submission moved **last**
  (after the Phase-3, evaluation, and hygiene items — no attack surface left at
  submission time).

## public-baseline-v0.5.12 - 2026-06-24

Phase 3 Increment 1, step 1b — detector/spec scope alignment. **Behavior change:**
the recommendation-language validator is now broader. Committed result artifacts
are NOT regenerated (they remain dated snapshots produced with the prior detector).

- Widened `recommendationLanguagePattern` in `server/detectors.mjs` to the scope
  named in the scoring spec: adds 목표 주가 (spaced), 비중확대/비중축소 (contiguous
  analyst-rating token only), and English `buy`/`sell`/`overweight`/`underweight`/
  `price target`. Korean spaced product/sales-mix wording ("제품 비중 확대",
  "메모리 매출 비중 확대") stays allowed by design. The server's structured-output
  validator uses this wider set going forward; the Phase-3 wrapper/scorer will use
  the same one.
- Extended `tests/detectors.test.mjs` with the new flagged cases (KO + EN) and the
  false-positive allow cases (product/sales-mix). Verified no regression: the
  deterministic answers for all five groups stay clean against the wider detector;
  `npm test` 13/13, `validate:release` and `validate:paper-stats` pass.
- Aligned `docs/phase3-guardrail-scoring-spec.md` to point at
  `server/detectors.mjs` as the authoritative source (doc == code; no doc-level
  drift).

## public-baseline-v0.5.11 - 2026-06-24

Phase 3 Increment 1, step 1 — canonical detector module (no runtime behavior
change; foundation for the guardrail wrapper).

- Added `server/detectors.mjs` (pure, dependency-free): the single source of truth
  for `visibleAnswerDevLeakPattern` and `recommendationLanguagePattern` (moved
  verbatim from `server/index.mjs`), plus the Phase-3 scoring constants/regex
  (`REFUSAL_RE`, `REDACTION_RE`, `FINANCIAL_FIG_RE`, `MIN_ANSWER_CHARS`,
  `MIN_HEADINGS`, `SECTION_HEADINGS`). The server now imports these instead of
  defining them inline, so the guardrail wrapper and scorer will share the exact
  same detectors (resolving the drift risk in the scoring spec — the patterns were
  previously module-private consts).
- Added `tests/detectors.test.mjs`: a drift-check that pins the detectors'
  semantics and the scoring constants (now 13 tests total). Server behavior is
  unchanged — boots clean, `validate:release` and the existing leakage/language
  black-box tests still pass.

## public-baseline-v0.5.10 - 2026-06-24

Phase 3 Increment 0.5 — scoring spec + a safety-doc fix (docs only).

- Added `docs/phase3-guardrail-scoring-spec.md`: freezes the external-guardrail
  wrapper's allow/block rules, the outcome taxonomy (refusal_text /
  answer_emptied / links_dropped / redaction_excess), the false-refusal
  definition (refusal on a benign `reference` scenario; blocks on `adversarial`
  count as intended mitigation), decision constants + regex, the McNemar pairing,
  and the result JSON schema — all fixed before any wrapper code is written.
  Detectors reuse the server's canonical `visibleAnswerDevLeakPattern` /
  language-validator regex (single source of truth). Linked from the design note.
- `docs/live-run-safety.md`: split the command classification so `stats:paper`
  (and `build:demo` / `figures:capture`) are under "writes only its own
  intended generated/derived output (safe, not read-only)" rather than
  "read-only" — resolving the title/content conflict. Truly read-only commands
  (typecheck, validate:release, npm test, validate:paper-stats, smoke:live-api)
  are now a separate, accurate list.

## public-baseline-v0.5.9 - 2026-06-24

AI-use disclosure and commit-trailer policy (docs only).

- Added an "AI-assisted development" disclosure to the README: development used
  Claude Code (Anthropic) as a tool; all research design, evaluation, and
  responsibility rest with the human authors in `CITATION.cff`; the AI is not an
  author or an academic contributor. This is the academically-correct posture
  (disclose AI use; humans remain accountable).
- Policy change: commits no longer carry the `Co-Authored-By: Claude` trailer
  going forward (this release is the first without it). Existing history is left
  intact — rewriting it would change the v0.3 commit SHA that `harness-paper`
  pins (`artifacts/dev-pin.txt`) and that the Zenodo DOI references, which is not
  worth the cosmetic gain. Note: the AI co-author trailer never made Claude a
  GitHub Contributor (the Contributors graph lists only the human author).

## public-baseline-v0.5.8 - 2026-06-24

Phase 3 readiness patch (docs/config only; no code, figures, or eval artifacts
changed).

- Expanded `.env.example`: live LLM keys (`OPENROUTER_API_KEY`, optional
  `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `GEMINI_API_KEY`), provider/model knobs
  (`ADVISOR_LIVE_LLM_PROVIDER` / `ADVISOR_LIVE_LLM_MODEL`), and commented
  scratch-output overrides — placeholders only, no real keys.
- Added `docs/live-run-safety.md`: classifies every npm command as read-only-safe
  vs. overwrites-a-committed-artifact, with the scratch-output env var for each
  (`ADVISOR_EVAL_OUTPUT`, `ADVISOR_FAULT_OUTPUT`, `ADVISOR_LIVE_LLM_OUTPUT`,
  `AGENT_QUALITY_OUT`). Codifies the rule that prevented the v0.5.5 baseline
  incident. Cross-referenced from README and `docs/repository-workflow.md`
  (release checklist now includes `npm test` + `validate:paper-stats`).
- Added `docs/phase3-guardrail-baseline-design.md`: fixes the external-guardrail
  comparison (conditions harness / prompt-only / external-guardrail; reuse of the
  frozen reference + adversarial + fault-injection sets; metrics incl. false
  refusal; dated scratch output paths that never touch committed baselines; start
  with a small deterministic policy layer before a heavyweight framework).
- README: corrected a stale `npm audit` roadmap line (the high finding was cleared
  in v0.4.x; one Windows-dev-only low remains).

## public-baseline-v0.5.7 - 2026-06-24

Micro-consistency patch (figure/caption only; eval baselines untouched).

- The fixture-mode news-search link in `buildLinks` now uses the **representative
  company** name (e.g. 삼성전자) for both the label and the search query, instead
  of the group name (삼성). So Appendix A1(a) reads "삼성전자 뉴스 검색". Regenerated
  `docs/ui_mobile_source_links_ko.png`.
- Added a regression test (`npm test`, now 9 tests): fixture-mode Samsung source
  links must include a news-channel link labelled "삼성전자 뉴스 검색" pointing to a
  Naver news-search endpoint for the representative company.
- CSS lint hygiene: added the standard `line-clamp` property alongside each
  `-webkit-line-clamp`, and replaced `min-height: auto` with `min-height: 0` in the
  mobile media query.
- Version consistency: README BibTeX note and roadmap manuscript-pin → current tag.

## public-baseline-v0.5.6 - 2026-06-24

Hotfix on top of v0.5.5.

- Restored the manuscript-cited Samsung eval baseline
  (`evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json`)
  to its pinned 2026-05-10 run. In v0.5.5 it was inadvertently overwritten by a
  `npm run eval:samsung` validation run (the alias writes to that committed path),
  which changed timestamps, latencies, and source statuses. The content fix from
  v0.5.5 (news-search link in source links + A1 caption) is unchanged; only the
  accidentally-regenerated baseline is reverted. When re-validating a runtime
  change, point eval scripts at a scratch output, not the committed baseline.

## public-baseline-v0.5.5 - 2026-06-24

Figure ↔ caption consistency pass (post-v0.5.4 review). No evaluation numbers
changed; eval scenarios re-validated after the link change.

- Source links now represent the **news channel in fixture mode** too: when no
  live news item exists, `buildLinks` adds an honest news-**search** link (a real
  public search endpoint, not a fabricated headline; source-state label "뉴스").
  So Appendix A1(a) spans DART filing, IR/disclosure, KRX, and news — matching the
  manuscript caption. Re-validated with `validate:release` + `eval:samsung`.
- `docs/figure-capture.md` A1 caption template corrected to the current artifacts:
  "focused detail crops from the full mobile interface" (the two affordances
  render together in one answer-pack), and the news entry is described as a
  search link in fixture mode. NOTE for the manuscript repo (`harness-paper`): the
  Figure A1 caption there must be updated to match — drop "full mobile context"
  and keep the four source channels including the news-search link.
- Version consistency: README BibTeX note and roadmap manuscript-pin → current tag.

## public-baseline-v0.5.4 - 2026-06-24

Appendix Figure A1 + source-state labels (post-v0.5.3 review). No evaluation
numbers changed.

- Source-link cards now carry a reader-facing **source-state label** derived from
  the link target (DART/OpenDART, KRX, 공식 사이트, 시장 데이터, 뉴스) via
  `sourceStateLabel()`. The internal `link.source` id (`fixture:dart`,
  `samsung-local-…`, `group-profile`) is never shown — consistent with the
  leakage contract.
- Dev trace panel is hidden in `paper-capture` mode (`DEV_UI_ENABLED` gated on
  `!detectPaperCaptureMode()`), so appendix figures show only the reader-facing
  surface.
- New Appendix A1 figures: `docs/ui_mobile_source_links_ko.png` (A1(a), source
  links with labels) and `docs/ui_mobile_followups_ko.png` (A1(b), follow-up
  questions). Because both affordances render together in one sub-screen
  answer-pack, each is a focused detail crop of its own component (the capture
  script gained `shotRegion()` for union-bbox crops). `docs/figure-capture.md`
  gains the A1 caption template and filename entries.
- Version consistency: README BibTeX note and roadmap manuscript-pin → current tag.

## public-baseline-v0.5.3 - 2026-06-23

Figure frame finalization + group-selector callout (post-v0.5.2 review). No
evaluation numbers changed.

- Clean white margins: in `paper-capture` mode the device frame's soft outer
  drop-shadow (halo) is removed — only the hard bezel rings and inset highlights
  remain — so the area around the phone is clean white instead of a grey smudge.
  Capture padding (36px) is kept so the side buttons are not clipped.
- New figure `docs/ui_mobile_selector_ko.png`: the group selector in its open
  state, showing all five groups (Samsung / SK / Hyundai Motor / LG / Hanwha).
  The capture script clicks the brand toggle and shoots the open menu; it pairs
  with the main figure as a side-by-side subpanel in the paper. README keeps just
  the two primary figures (main + answer).
- Figure filename policy: `ui_mobile_main_ko.png` (closed feed),
  `ui_mobile_answer_ko.png` (answer), `ui_mobile_selector_ko.png` (selector open),
  `ui_mobile_main_en.png` (supplementary only).
- Version consistency: README BibTeX note and roadmap manuscript-pin → current tag.

## public-baseline-v0.5.2 - 2026-06-23

Figure frame and language cleanup (post-v0.5.1 review). No evaluation numbers
changed; figure regeneration and capture/CSS only.

- **Language policy:** both primary figures are now the Korean UI
  (`docs/ui_mobile_main_ko.png`, `docs/ui_mobile_answer_ko.png`); the README hero
  uses the Korean main. The answer composer is Korean-only, so a mixed
  English-chrome / Korean-body figure was inconsistent. English-chrome capture
  (`ui_mobile_main_en.png`) is retained as a supplementary asset; the paper
  carries English captions. Rationale documented in `docs/figure-capture.md`.
- **Frame no longer clipped:** the capture now screenshots the `.device-shell`
  bounding box expanded by 36px per side, so the box-shadow frame and the side
  buttons (at `left/right: -6px`) are fully included instead of cut at the edge.
- **Clean background:** `paper-capture` background set to white (`#ffffff`), so no
  pale-blue remains outside the phone's rounded corners.
- **Filename standard:** `ui_mobile_main_ko.png` is the new Korean main; the stale
  `ui_mobile_main_ko_callout.png` (old UI, no actual callouts) was removed.
- Version consistency: README BibTeX note and roadmap manuscript-pin → current tag.

## public-baseline-v0.5.1 - 2026-06-23

Second UI/figure polish round (post-v0.5 review). No evaluation numbers changed.

- Bottom dock is now part of the normal flex flow (`position: relative`,
  `flex: 0 0 auto`) instead of an absolute overlay, so briefing cards and answer
  content no longer hide behind it; removed the large `.conversation`
  bottom padding compensation.
- Figure 2 (answer) is deterministic and readable: the capture pins the
  conversation to the top so the figure starts at "핵심 인사이트" and shows the
  insight / evidence / counter-risk sections in one frame; answer density
  tightened slightly (gaps, line-height).
- Regenerated `docs/ui_mobile_main_ko_callout.png` to the current UI (the legacy
  asset was stale); the capture script now also produces it. Manual annotation
  callouts, if needed for the paper, are re-added by hand.
- `scripts/capture-figures.mjs`: added a `scrollTopSelector` option for a fixed,
  reproducible answer-figure scroll position.
- Financial brief card footer shows a clean "Source: DART/OpenDART" basis instead
  of the internal `fixture:dart` source id; mode is conveyed by the "Sample data"
  pill.
- Version consistency: README BibTeX note and the roadmap manuscript-pin updated
  to the current tag.

## public-baseline-v0.5 - 2026-06-23

Mobile demo visual quality pass. The realistic device frame is preserved; only
the screen content was reworked. No evaluation numbers changed.

- Landing screen: the three briefing cards now expand to fill the viewport as an
  even feed, removing the large empty space below them; the empty conversation
  area collapses (`.briefing:not(.compact)`, `.conversation:empty`).
- Status labels: customer-facing brief cards now show a single, calm "Sample
  data" / "샘플 데이터" pill instead of raw `status: fixture` / `fallback` /
  `failure.dart` strings (which read as errors). The honest fixture/live/fallback
  distinction is unchanged in the developer trace panel and the run trace.
- Typography/spacing: introduced type and spacing tokens; eased 1-line title
  truncation to 2 lines; reworded the process panel ("근거 수집 완료 · N단계").
- News card (briefing-only, `en` fixture): reworded the apologetic
  "live news not connected" placeholder to an honest "sample preview"; no
  fabricated headlines.
- Figure capture: `scripts/capture-figures.mjs` now supports a reproducible
  build-local capture (spawns the static server over `dist/`, renders at 900px so
  the device frame is preserved, clips to `.device-shell`) in addition to the
  remote-URL mode; added `npm run figures:capture`; `playwright` added as a
  devDependency (overridable via `PLAYWRIGHT_PATH`). Regenerated
  `docs/ui_mobile_main_en.png` and `docs/ui_mobile_answer_ko.png`; updated
  `docs/figure-capture.md`.

## public-baseline-v0.4.1 - 2026-06-23

Finalization hygiene addressing post-v0.4 review. No measured numbers changed.

- `server/index.mjs` now honors a `HOST` env var (default `0.0.0.0`); set
  `HOST=127.0.0.1` to run in sandboxed evaluation environments that disallow
  binding `0.0.0.0` (EPERM). `tests/harness.test.mjs` spawns the server with
  `HOST=127.0.0.1` so the suite runs in those environments.
- README: corrected the `tests/` description (now a real `node --test` suite),
  updated the "Static demo and CI" paragraph and bundled-validations list to
  include `npm test` and `validate:paper-stats` (matching the actual CI).
- Dependencies: applied non-breaking `npm audit fix` (resolved the high-severity
  vite advisory and `@babel/core`; vite 7.3.3 → 7.3.5). One low-severity
  esbuild advisory remains — it affects only the Windows dev server, not the
  pure-node runtime or the static demo output, and its only fix is a breaking
  major bump, so it is intentionally deferred.

## public-baseline-v0.4 - 2026-06-23

Reproducibility, verification, and licensing hardening for arXiv (cs.AI) release.
No measured numbers changed; result promotion is metadata-only.

- Added `scripts/compute-paper-stats.mjs`: regenerates manuscript Tables A2-A4
  (Wilson intervals, Pearson χ², inter-repeat consistency, per-check failure
  decomposition) and the prompt-only ablation McNemar test deterministically
  from the committed result artifacts. New scripts `stats:paper` and
  `validate:paper-stats` (CI gate against drift); output committed at
  `evals/results/paper-stats.generated.json`. The published table numbers are now
  reproduced exactly from the artifacts rather than hand-transcribed.
- Added a deterministic harness test suite (`tests/harness.test.mjs`, `npm test`
  via `node --test`): pins entity/alias routing, ticker/corp-code mapping, the
  answer contract, the three validation families (leakage / link / language), and
  the deterministic composer. Wired into CI alongside `validate:paper-stats`.
- Added split licensing: `LICENSE` (MIT, code), `LICENSE-DATA` (CC BY 4.0, data /
  docs / evaluation artifacts), and `LICENSES.md` (breakdown + trademark and
  non-redistribution notes). `CITATION.cff` now lists both licenses.
- Promoted the manuscript result artifacts from `needs_review` to
  `accepted_for_manuscript` with a `manuscriptAcceptance` block; added
  `evals/reviewer-checklist.md` and hash-pinned `evals/manuscript-acceptance.json`.
- Added `REPRODUCIBILITY.md`: number→command→artifact map, offline vs.
  credential-required vs. non-reproducible-snapshot vs. non-redistributed paths.
- Documentation consistency: fixed the `docs/ablation-design.md` status
  contradiction (design→implemented), and unified the manuscript venue to
  arXiv (cs.AI) in `docs/paper-evaluation-tables.md` and `docs/figure-capture.md`
  (was "Applied Sciences"). Corrected the README BibTeX (authors, DOI, version).

## public-baseline-v0.3 - 2026-06-14

- Added a prompt-only ablation at the composition boundary (`ADVISOR_ABLATION` / per-request `ablation`; evaluator axis `ADVISOR_LIVE_LLM_ABLATIONS`). Result artifacts: `evals/results/ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json` (540 runs over the 30 fixed scenarios) and `evals/results/ablation-adversarial.c0-vs-c3.2026-06-13.json` (180 runs over new adversarial-stress scenarios). Finding: under adversarial prompting the code-owned gate blocks 100% of recommendation-language and internal-leakage violations that the prompt-only condition admits (McNemar p<0.001).
- Added adversarial-stress scenario sets (`evals/scenarios/*.adversarial-stress.json`) and `ADVISOR_LIVE_LLM_SCENARIO_SETS` to target alternate scenario sets.
- Added a runtime claim-eligibility mechanism (`isRuntimeExcludedClaim` / `runtimeUsePolicy: excluded_*`) for genuinely non-eligible claims; no claim is excluded in this baseline.
- Briefing cards now render in English under the `en` locale (financial figures re-rendered in KRW-trillion, honest English news placeholder) for international figure capture.
- Added a Cloudflare Pages auto-deploy workflow (`.github/workflows/deploy-cloudflare.yml`; activates on `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` secrets).
- Added `CLAUDE.md`; documented the two-repository (code + manuscript) operating model.

## public-baseline-v0.2 - 2026-06-13

- This repository is now the single source of truth for development; the mirrored local development folder is retired (`docs/repository-workflow.md`).
- Added GitHub Actions CI: typecheck, release validation, and a credential-free static demo build on every push and pull request.
- Added the static demo pipeline: `scripts/export-static-demo.mts` snapshots deterministic briefing and quick-question answers, and `npm run build:demo` produces a hosting-ready bundle with `VITE_STATIC_DEMO=1`.
- Added Cloudflare Pages deployment guide (`docs/deployment-cloudflare.md`); free-text questions are disabled in the static demo and show a local-run notice.
- Pinned Node `>=22` via `engines`.

## live-llm-full-run - 2026-06-03

- Added the 270-run live-LLM composition-boundary result artifact at `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json`.
- Added `docs/live-llm-run-log-2026-06-03.md` to record the API-run configuration, provider breakdown, failure-process summary, and interpretation boundary.

## live-llm-expanded-protocol - 2026-06-03

- Added live-LLM composition-boundary evaluation support for full-scenario runs, repeated runs, temperature settings, and fallback/recovery reporting.
- Documented the 30-scenario x 3-model x 3-repeat arXiv protocol and the smaller temperature-stress protocol.

## public-baseline-v0.1 - 2026-05-23

- README rewritten as a product-centric document; academic framing moved into a single "Design background" section.
- Added a mobile briefing screenshot for the product-facing repository overview.
- Snapshot used as the baseline reported in the accompanying paper *Beyond Prompting: Harness Engineering for Enterprise LLM Agents.*

## public-baseline-v0.1

- Prepared the public baseline repository for the reference implementation.
- Moved the implementation contents to the repository root.
- Included source and claim manifests, scenario and validation artifacts, scripts, UI source, server code, and maintained context pages.
- Excluded internal drafts, review notes, local credentials, raw private staging folders, generated build outputs, and local-only traces.

## Future Updates

- Use a new commit for every paper or artifact revision that should remain citable.
- Update `VERSION` when a revision should be treated as a new public snapshot.
- Add a dated changelog entry when reported results, scenarios, manifests, figures, or paper text materially change.
