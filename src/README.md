# Source Code

This folder contains the current research demo implementation.

The first screen intentionally prioritizes the original mobile PoC experience:
compact group header, market ticker, three briefing cards, voice/meeting
toolbar, quick topic buttons, question input, data-collection progress, source
links, and follow-up questions. The neutral default target is Samsung; Hanwha
remains the reference slice for reconstructing the PoC into a repeatable
template.

Current modules:

```text
src/main.tsx        React application and mobile advisor flow
src/briefingTemplate.ts Group-level reusable briefing card templates
src/styles.css      Mobile frame, advisor UI, and research appendix styles
src/researchData.ts Static research metadata and deterministic validation data
src/types.ts        Shared GroupProfile and advisor API response types
```

The implementation is still deliberately compact because this milestone is a
paper-facing reconstruction, not the final commercial architecture. The next
refactor should split `src/main.tsx` into `src/ui`, `src/orchestrator`,
`src/tools`, and `src/validators` once the mobile parity baseline is accepted.
