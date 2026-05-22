# Commercial Design Review

Review date: 2026-04-30

## Verdict

The current mobile UI is suitable for a paper screenshot and early sales demo
after the latest polish pass. It still preserves the original PoC experience,
but the visual system is now closer to a commercial investment research product.

## Adjustments Applied

- Replaced symbolic card/action glyphs with consistent inline vector icons.
- Reduced card radii to a more restrained product UI scale.
- Rebalanced the header so the target logo, brand text, and ticker read closer
  to the original mobile PoC.
- Removed the unreleased `KO` language control and reserved that space for
  group logo identity and group selection.
- Replaced hand-drawn logo stand-ins with source-linked SVG logo assets for
  Samsung, SK, Hyundai Motor Group, LG, and Hanwha under `public/logos`.
- Promoted logo metadata into `configs/groups.json` as `logoAsset`, so brand
  identity is part of the reusable target template rather than hard-coded UI.
- Matched the current reference screenshot news brief copy and source treatment.
- Made the first news card the dominant briefing surface while preserving the
  three-card stack.
- Increased card icon and text scale slightly so paper screenshots remain
  readable after resizing.
- Rebalanced briefing-card typography so the first message/headline is rendered
  as a single-line ellipsis whenever possible.
- Reduced the left card icons from primary visual blocks to secondary category
  markers. Their job is quick scanning, while the headline remains the reading
  priority.
- Kept the bottom input dock close to the original layout, with slightly larger
  touch targets for commercial usability.
- Replaced the always-visible `voice answer on` pill with a lighter
  `text/meeting` mode control. Text is the commercial default; meeting mode
  preserves the auditorium demo pattern.
- Lowered voice input visual priority by making the mic button secondary while
  keeping send as the primary action.
- Kept the Hanwha orange/green/blue brief accents but normalized them into CSS
  tokens.
- Added visible trace mode badges so fixture, fallback, mixed, and live runs are
  not confused in research or sales screenshots.
- Preserved dense mobile information hierarchy: header, briefing cards, answer,
  trace, sources, follow-up questions, and input dock.
- Reworked the first-screen briefing cards for paper/product screenshots: each
  card now carries compact source-backed metrics, avoids fake live-news timing,
  and labels official IR/DART seed status separately from future live news.
- Expanded the briefing-card evidence surface without exposing raw claim IDs:
  Samsung, SK, Hyundai Motor, LG, and Hanwha cards now show representative
  DART/IR metrics such as revenue, operating profit, OPM, ticker, and current
  monitoring theme.

## Current Design Position

The app should read as:

```text
quiet institutional mobile research tool
```

not:

```text
marketing landing page
consumer chatbot toy
generic AI assistant
```

## Remaining Commercial Polish

- Confirm trademark usage for the source-linked logo files before public
  commercial use. Keep the current filenames and `logoAsset` contract so the
  header layout does not shift.
- Add a neutral product name if the app becomes a multi-group investor advisor.
- Create dark-mode screenshots only if the product later supports dark mode
  natively.
- Add actual chart micro-components after market-data snapshots are persisted.
- Connect ElevenLabs only through a server-side TTS proxy after the meeting mode
  is validated with users.
- Add accessibility pass for Korean screen-reader labels before client pilots.
