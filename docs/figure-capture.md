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

Implication for figures:
- **Figure 1 (selector / briefing):** the group selector, stock card, and UI
  chrome render in English under the `en` locale, but the **financial-card
  metrics and the news card stay Korean** — the underlying source-backed claim
  text and the news fixture are Korean (the slice is Korean public data). So an
  `en` capture is *chrome-English, content-Korean*. Recommended: capture in `en`
  (English chrome) and caption it as a Korean public-data slice; do not translate
  the financial figures into the card, as that would restate source values.
- **Figure 2 (answer):** either (a) keep Korean and add an English translation
  caption / annotated callouts, or (b) invest in English answer composition
  (new work: bilingual section titles + locale-keyed advisor snapshots) if fully
  English figures are required. Recommend (a) for now; note it as a localization
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

`scripts/capture-figures.mjs` (`npm run figures:capture`) regenerates the two
README/manuscript figures deterministically. It spawns the static server over the
committed `dist/` bundle on `127.0.0.1`, renders at a 900px viewport (wider than
the 720px mobile breakpoint, so the realistic device frame is preserved), clips
to `.device-shell`, and writes `docs/ui_mobile_main_en.png` and
`docs/ui_mobile_answer_ko.png`.

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

**Figure 1 — selector / briefing (English):**
> Figure 1. Group selector and briefing cards of the Korea Corporate Briefing
> Agent, rendered in English from the deterministic fixture-mode static demo
> deployed on Cloudflare Pages (commit `[hash]`, tag `[tag]`). Briefing content is
> assembled from promoted source-backed claims; no live DART/KRX/News/LLM calls
> are made in this build.

**Figure 2 — answer (Korean body, English caption):**
> Figure 2. A source-linked answer for `[company]` (Korean UI). Section structure
> (Key insight / Evidence / Counter-risks / Next monitoring points) and source
> links are produced by the deterministic composer in fixture mode (commit
> `[hash]`). Internal trace identifiers are filtered from the reader-facing view
> by the harness; the answer shown is not live-model output. English glosses of
> the section headers are added for the reader.

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
