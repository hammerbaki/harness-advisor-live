# UI Parity Check

Inspection date: 2026-04-30

## User Requirement

The research demo must preserve the product process that mattered in the
original Replit PoC:

- mobile-first layout,
- advisor-style chat interaction,
- dynamic data-collection/analysis progress,
- answer with source links,
- answer with follow-up questions,
- five-group selection path,
- Samsung as the neutral default target,
- Hanwha as the PoC-derived reference slice.

## Current Implementation

Implemented in:

```text
src/main.tsx
src/styles.css
src/researchData.ts
configs/groups.json
```

### Implemented

- iPhone-style mobile preview frame.
- Status bar, dynamic island, and bottom home indicator for paper screenshots.
- iPhone 17-style outer mockup:
  - contoured aluminum-like frame,
  - screen bezel,
  - antenna bands,
  - action/volume/power/camera-control side buttons,
  - Dynamic Island shape based on the official iPhone 17 display family.
- Group logo header with ticker, price movement, and group selector.
- Target selector includes logo, short Korean label, and one-line data-readiness
  summary from `configs/groups.json`.
- Three original briefing surfaces:
  - news brief,
  - stock brief,
  - financial brief.
- Bottom dock matching the original interaction model:
  - text/meeting mode control,
  - market/international/group/competitor/disclosure quick buttons,
  - mic button,
  - investor question input,
  - send button.
- Group selector ordered as Samsung, SK, Hyundai Motor Group, LG, and Hanwha.
- Hanwha reference slice with company identifiers from the PoC.
- Chat input and quick prompt chips.
- Advisor response connected to `/api/advisor`.
- Dynamic process panel:
  - fixture/live DART disclosure retrieval,
  - fixture/live KRX or Yahoo fallback market retrieval,
  - fixture/live Naver News retrieval,
  - fixture/live LLM composition.
- Source links returned from the API:
  - DART,
  - KRX,
  - news,
  - group profile.
- Follow-up question chips.
- Auto-scroll behavior for the mobile chat surface.

### Not Yet Implemented

These remain future stages and should not be claimed as complete in the paper:

- real streaming token display,
- speech recognition,
- speech synthesis,
- chart rendering,
- persisted conversation history,
- authenticated operator/debug routes,
- downloadable evaluation trace.

## Interpretation

The current demo is not a full clone of every hidden route in the original
Replit app. It is a research-grade reconstruction of the important visible
mobile process:

```text
question -> data collection -> analysis -> validation -> answer -> links -> follow-ups
```

This is suitable for early paper screenshots if captioned as a public-data
advisor research demo. The final paper artifact should include screenshots with
the exact credential mode labeled: fixture, fallback, or live.

The device frame is a CSS mockup for research presentation. It should not be
described as an Apple-provided asset or an exact CAD reproduction.
