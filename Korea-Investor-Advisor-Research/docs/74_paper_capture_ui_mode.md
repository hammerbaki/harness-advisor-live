# Paper Capture UI Mode

Date: 2026-05-05

## Purpose

The product UI remains Korean-first because the target demonstration and early
commercial users are Korean investors. Paper figures, however, should be
readable to international reviewers without requiring translated captions for
every visible UI label.

To keep the product and paper surfaces separate, the app supports a paper-only
English capture mode through URL parameters:

```text
http://localhost:5173/?paper=en
http://localhost:5173/?lang=en
```

The default URL remains Korean:

```text
http://localhost:5173/
```

Project working rule: until the final paper-submission stage, product review
and layout iteration should use the Korean default UI. English capture mode is
kept available but should be used only when preparing final paper figures.

## Implementation Rule

English capture mode must not change the underlying data, claim manifests,
source links, group order, runtime trace, or Korean production copy. It only
changes first-screen presentation labels and concise briefing copy used for
figures.

Current localized surfaces:

- top group label;
- first-screen card labels, metadata, headlines, body text, and source labels;
- bottom mode tabs;
- quick action buttons;
- input placeholder;
- group selector names, short sector notes, and source-readiness labels.

Unchanged surfaces:

- official source URLs;
- logo assets;
- market numbers and tickers;
- runtime API contracts;
- answer trace structure;
- Korean default product UI.

## Figure Policy

Use the English paper mode for the main arXiv/SCI product screenshot when the
figure is intended to communicate interface structure to non-Korean reviewers.
Use the Korean UI as an appendix or supplementary figure when showing the real
deployment context.

The recommended caption should state that the figure is an English paper
capture of a Korean-first product UI and that numerical values are tied to the
current reference slice, not investment advice.

## Remaining Data Needs For Balanced Paper Figures

The paper capture mode should be used after first-slice source gaps are closed
enough that all five groups show comparable evidence maturity. The current data
priority remains:

1. Hanwha affiliate source packages for Hanwha Aerospace, Hanwha Solutions,
   Hanwha Systems, and Hanwha Ocean.
2. Samsung Electro-Mechanics source package.
3. SK Square source package.
4. Kia source package.
5. One-line document selection reasons for existing Samsung and SK source
   ledgers.

Each package should include official IR/DART source files, document-level URLs
or DART receipt numbers when available, otherwise official IR source-page URLs
with exact document titles, local file names, access dates, and checksums. Each
document should also have one concise reason explaining why it is included in
the first-slice knowledge base.
