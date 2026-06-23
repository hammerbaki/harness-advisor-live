# Figure Capture Procedure and Caption Templates

For the arXiv (cs.AI) manuscript *Beyond Prompting: Harness Engineering for
Enterprise LLM Agents*. Replaces the current Replit screenshots
with Cloudflare-deployed, commit-pinned captures, and standardizes captions so
figures are not misread as live-LLM output.

## Locale reality check (read first)

Capturing in English is only **partially** supported by the current code:

- **Supported — home / selector / briefing screen.** `UI_LOCALE = detectUiLocale()`
  auto-detects from the browser, and the briefing snapshots are locale-keyed
  (`public/demo/briefing.<group>.<locale>.json`, `ko` and `en` both generated).
  UI chrome switches on `locale === "en"`. So an English-locale browser yields a
  genuinely English home screen.
- **Not supported — the answer body.** The advisor composer emits **Korean-only**
  section titles (`핵심 인사이트`, `근거 신호`, `반증 리스크`, `다음 관찰 포인트`
  in `server/index.mjs`), and the static-demo advisor snapshots are **not**
  locale-keyed (`advisor.<group>.json` is a single set). An English browser still
  shows a Korean answer.

**Language policy for the figures (decided):** both primary figures use the
**Korean UI** (`ui_mobile_main_ko.png`, `ui_mobile_answer_ko.png`), with an
English caption/gloss in the paper. Rationale: the answer composer emits
Korean-only section titles, so a fully-English figure set is impossible without
new bilingual-composer work; an English-chrome / Korean-body image is internally
inconsistent and reads as unfinished; the figure's evidential role (source links
present, no internal IDs, insight-first structure, no recommendation language) is
language-independent and is carried by the caption; and the slice is Korean public
data, so Korean content is the honest presentation. An English-chrome capture
(`ui_mobile_main_en.png`) is kept as a **supplementary** asset only (to show the
`en` locale works); it is *chrome-English, content-Korean* and is not a primary
figure. Do not translate financial figures into the card, as that would restate
source values. Fully-English figures would require bilingual section titles +
locale-keyed advisor snapshots (out of scope) — note it as a localization
boundary, not a defect.

**Data-integrity note:** the financial brief card headlines the *latest official
quarterly* claim when present (`selectBriefingFinancialClaim` was reverted to this
ranking in commit `962bfd2` per the maintainer's preference; the
preliminary/unaudited status is carried by `runtimeUsePolicy`). For Samsung this
surfaces the 2026Q1 seed figure (revenue KRW 133.9T / operating income KRW 57.2T /
~42.8% OPM). That operating-margin figure is implausibly high for Samsung
Electronics, but it is a **promoted, source-backed claim** and is shown faithfully
rather than vetoed on plausibility grounds — both the audited annual figure
(2024: KRW 300.9T / 32.7T / 10.9% OPM) and the preliminary quarterly figure appear,
labelled, in the full advisor answer. Do not silently substitute or "correct" these
source values in a capture. The news card in fixture mode is an honest "sample
preview" placeholder (paired with a "Sample data" status pill); it must not be
replaced with a fabricated headline.

## Capture procedure

Captures must be reproducible and pinned to a commit.

### Scripted capture (recommended)

`scripts/capture-figures.mjs` (`npm run figures:capture`) regenerates the figures
deterministically. It spawns the static server over the committed `dist/` bundle
on `127.0.0.1`, renders at a 900px viewport (wider than the 720px mobile
breakpoint, so the realistic device frame is preserved), and screenshots a region
= the `.device-shell` bounding box **expanded by 36px on every side** so the
box-shadow frame and the side buttons (at `left/right: -6px`, outside the shell
box) are fully included rather than clipped. In `paper-capture` mode the
background is white **and the soft outer drop-shadow is removed** (only the hard
bezel rings + inset highlights remain), so the margin around the phone is clean
white rather than a grey smudge. It writes:

- `docs/ui_mobile_main_ko.png` — primary Figure 1 (Korean briefing feed)
- `docs/ui_mobile_answer_ko.png` — primary Figure 2 (Korean answer, pinned to the
  top so it starts at "핵심 인사이트")
- `docs/ui_mobile_selector_ko.png` — group selector (open state, all five groups);
  pairs with the main figure as a side-by-side subpanel in the paper
- `docs/ui_mobile_source_links_ko.png` — Appendix A1(a): the source-links block,
  each link tagged with a reader-facing **source-state label** (DART/OpenDART,
  KRX, 공식 사이트, 시장 데이터, 뉴스). A focused detail crop (not the full phone),
  because source links and follow-ups render together in one sub-screen pack.
- `docs/ui_mobile_followups_ko.png` — Appendix A1(b): the follow-up questions
  block (focused detail crop).
- `docs/ui_mobile_main_en.png` — supplementary (English chrome; not a primary
  figure)

The dev trace panel is **hidden** in `paper-capture` mode (`DEV_UI_ENABLED` is
gated on `!detectPaperCaptureMode()`), so appendix figures show only the
reader-facing surface. The source-state label is derived from the link target
(href) by `sourceStateLabel()` and never exposes the internal `link.source` id
(e.g. `fixture:dart`, `samsung-local-…`, `group-profile`).

```bash
npm ci
npm run build:demo                 # produces dist/ (fixture-mode snapshots)
npx playwright install chromium    # one-time browser download
npm run figures:capture            # writes docs/ui_mobile_*.png
```

Playwright is a devDependency; `PLAYWRIGHT_PATH` overrides it for environments
without it. To capture from a deployed demo instead of a local build, set
`FIGURE_BASE_URL=https://…pages.dev`. Record the commit hash/tag for the caption.

### Manual capture (alternative)

1. Deploy the static demo to Cloudflare Pages (see `docs/deployment-cloudflare.md`)
   or serve the local bundle with `npx vite preview`; confirm the tagged commit.
2. Record the exact commit hash and tag; this goes in every caption.
3. Capture above the 720px breakpoint so the device frame renders, 2× DPR for print.
4. For the English home screen, load with `?paper=en` (or an `en` browser locale)
   so `detectUiLocale()` returns `en`.
5. Save to `docs/` with descriptive names.

The hosted demo runs in deterministic fixture mode
(`runtimeMode: degraded`, `mode: fixture` in the trace), free-text questions are
disabled, and only quick-action answers are snapshotted. Figures must not imply
live data or live LLM behavior.

## Caption templates

Use these verbatim, filling the bracketed fields. The goal is that the figure's
mode and provenance are unambiguous, so a reviewer cannot read a fixture-mode
demo as evidence of live performance.

**Figure 1 — selector / briefing (Korean UI):**
> Figure 1. Group selector and briefing feed of the Korea Corporate Briefing
> Agent (Korean UI; the slice is Korean public data). Captured from the
> deterministic fixture-mode static demo (commit `[hash]`, tag `[tag]`). Each card
> links to its public source and carries a "Sample data" (샘플 데이터) badge.
> Briefing content is assembled from promoted source-backed claims; no live
> DART/KRX/News/LLM calls
> are made in this build.

**Figure 2 — answer (Korean body, English caption):**
> Figure 2. A source-linked answer for `[company]` (Korean UI). Section structure
> (Key insight / Evidence / Counter-risks / Next monitoring points) and source
> links are produced by the deterministic composer in fixture mode (commit
> `[hash]`). Internal trace identifiers are filtered from the reader-facing view
> by the harness; the answer shown is not live-model output. English glosses of
> the section headers are added for the reader.

**Figure A1 — reader-facing evidence affordances (appendix):**
> Figure A1. Reader-facing evidence affordances of a source-linked answer (Korean
> UI), captured from the deterministic fixture-mode static demo (commit `[hash]`).
> (a) and (b) are **focused detail crops from the full mobile interface** — the two
> affordances render together in one answer-pack, so a crop per affordance is
> shown rather than two identical full-phone views. (a) Source links spanning the
> available source channels (DART filing, IR/disclosure cross-reference, KRX market
> data, and a news-search link), each tagged with a source-state label
> (DART/OpenDART, KRX, 공식 사이트, 시장 데이터, 뉴스) derived from the link
> target — internal source identifiers are never shown. In fixture mode the news
> entry is a public news-**search** link (no live headline is fabricated). (b)
> Suggested follow-up questions. The developer trace panel is hidden in this view;
> both panels are reader-facing only.

**General mode-disclosure sentence** (place in the figure section or methods):
> All UI figures are captured from the credential-free static demo
> (`VITE_STATIC_DEMO=1`), which serves deterministic snapshots and disables
> free-text questions. Live integration (DART, KRX, News, hosted LLM composition)
> is exercised only in the local credentialed workflow and is evaluated
> separately in Tables A2–A4, not in the figures.

## Evidence-role separation (important)

- **Figures** demonstrate the *product surface and the reader-facing contract*
  (source links present, no internal IDs, insight-first structure) under the
  deterministic composer.
- **Tables A2–A4** demonstrate the *live-LLM composition-boundary behavior* across
  models.

Keeping these roles separate prevents the common reviewer objection that a
screenshot is being used as evidence of live model quality.
