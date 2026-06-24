# Reviewer checklist — manuscript result artifacts

This checklist records the acceptance state of the result artifacts cited by the
manuscript *Beyond Prompting: Harness Engineering for Enterprise LLM Agents*.
Artifacts whose `summary.status` is `accepted_for_manuscript` (with a
`manuscriptAcceptance` block) have passed every item below. Promotion is
**metadata only** — no measured number was changed.

## Acceptance criteria

For each accepted artifact:

- [x] **Provenance** — produced by a committed evaluator script with the run
      configuration recorded in `design`/`purpose`, at a dated, citable snapshot.
- [x] **Reproducible statistics** — every derived table number (Wilson CI, χ²,
      McNemar, inter-repeat consistency, per-check failure counts) is regenerated
      from the raw `providers[].runs` records by
      `node scripts/compute-paper-stats.mjs` and guarded against drift by
      `npm run validate:paper-stats`.
- [x] **Internal consistency** — `summary` counts (`plannedRuns`,
      `liveValidatedRuns`, `contractPassLiveRuns`, `fallbackRuns`, `byCheck`)
      agree with the per-run records they aggregate.
- [x] **Scope honesty** — claims are stated as composition-boundary / harness
      behavior, not as a general model benchmark and not as investment efficacy.
- [x] **Non-reproducibility disclosed** — the live-LLM snapshot is dated and not
      bit-for-bit reproducible (hosted model aliases may drift); this is stated in
      `docs/paper-evaluation-tables.md` and `REPRODUCIBILITY.md`.
- [x] **Hygiene** — no credentials, raw issuer documents, or internal claim text
      beyond the promoted, source-pointer-bearing records are present.

## Accepted artifacts

| Artifact | Used for | Status |
|---|---|---|
| `evals/results/live-llm-composition-boundary.full-30x3.2026-06-03.json` | Tables A2–A4 (per-model contract outcomes, inter-repeat consistency, per-check failure decomposition) | accepted |
| `evals/results/ablation-prompt-only.c0-vs-c3.30x3.2026-06-13.json` | Prompt-only ablation, 30×3 reference scenarios | accepted |
| `evals/results/ablation-adversarial.c0-vs-c3.2026-06-13.json` | Prompt-only ablation, adversarial-stress scenarios (McNemar) | accepted |
| `evals/results/guardrail-baseline.harness-vs-promptonly-vs-external.2026-06-24.json` | Table A5 — guardrail baseline (harness vs prompt-only vs external; 360 live runs). Re-scored from raw records by `compute-paper-stats.mjs`. | accepted (new measured run, v0.5.16) |

Per-artifact hashes and acceptance metadata are recorded in
[`manuscript-acceptance.json`](manuscript-acceptance.json).

## Re-running the acceptance gate

```bash
npm run validate:paper-stats   # statistics match recomputation from artifacts
npm test                       # deterministic harness invariants hold
npm run validate:release       # structure + template + scenario contracts
```
