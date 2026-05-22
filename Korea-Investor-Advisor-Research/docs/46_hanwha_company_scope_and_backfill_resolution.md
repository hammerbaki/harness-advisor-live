# Hanwha Company Scope and Backfill Resolution

Date: 2026-05-03

## Decision

Two Hanwha reference-slice gaps are now treated as harness-level design issues,
not as company-story issues:

1. runtime-promoted claims must be company-scoped;
2. missing official downloads must be resolved through a repeatable
   claim-driven backfill gate, not by collecting every archive file.

This keeps the paper focused on harness engineering. Hanwha, Samsung, and SK
are application slices used to test the method; the paper should not become a
company-specific investment report.

## Company-Scoped Claim Backfill

The current Hanwha source-backed claims were originally group-level. This was
acceptable for the first Hanwha PoC because the source corpus and UI route were
centered on ㈜한화. It becomes weak when the same template is transferred to
Samsung or SK, where affiliate-level routing is mandatory.

Resolution:

- all 11 runtime-promoted Hanwha claims now include `companyId=hanwha`;
- all 11 claims include `companyScope=issuer_company`;
- Hanwha affiliate IDs now use stable group-scoped IDs such as
  `hanwha-aerospace`, `hanwha-solutions`, `hanwha-systems`, `hanwha-ocean`,
  `hanwha-life`, and `hanwha-galleria`;
- `raw/manifests/hanwha.source-intake-template.json` defines the source
  package required before affiliate-specific claims can be promoted;
- `wiki/groups/hanwha/companies/` now contains company-scoped placeholder pages
  so the LLM Wiki namespace has the same shape as Samsung, SK, Hyundai Motor,
  and LG;
- `configs/source-selection-policy.json` now requires company-scoped claim
  routing through `SRC-12`;
- `npm run validate:stage-gate` now fails if a runtime-promoted
  source-backed claim lacks `companyId` or `companyScope`.

Interpretation:

The current Hanwha claim set is issuer-level, not full Hanwha affiliate
coverage. Future Hanwha Aerospace, Hanwha Solutions, Hanwha Systems, Hanwha
Ocean, Hanwha Life, or other affiliate claims must use their own company IDs
when promoted.

The updated product readiness audit is `docs/67_group_data_completion_audit.md`.
It records Hanwha's remaining gap as narrow promoted-claim coverage: the
structure is now prepared, but runtime evidence is still concentrated on ㈜한화.

## Official Download Backfill Resolution

The official Hanwha site scan still lists 86 downloads that are not present in
the local corpus. This is not treated as a requirement to download all files.

Resolution:

- `raw/manifests/hanwha.official-backfill-plan.json` records
  `remainingMissingDownloadsAreBlockers=false`;
- every remaining missing file is retained as manifest-level backlog with a
  decision, reason code, rule IDs, and rationale;
- 0 files are currently marked `download-now`;
- 83 files are `defer-claim-driven`;
- 3 files are `defer-manifest-only`.

The deferred files become required only if a claim, frozen evaluation scenario,
longitudinal comparison, or commercial client scope explicitly needs them.

## Methodological Point for the Paper

The paper should describe this as a general harness principle:

```text
Do not build the corpus by asking for all related documents.
Build it by declaring claim classes, routing scope, source eligibility,
extraction readiness, and evaluation scenarios.
```

This supports both research and commercialization:

- research: the reference slice is reproducible and auditable;
- product: client onboarding asks for precise source packages rather than
  unbounded document dumps;
- expansion: Samsung, SK, Hyundai Motor, LG, and future clients can reuse the
  same source gate even when their IR topology differs.

## Artifacts

- `raw/manifests/hanwha.source-backed-claims.json`
- `raw/manifests/hanwha.official-backfill-plan.json`
- `docs/21_hanwha_official_backfill_plan.md`
- `docs/23_hanwha_source_backed_claims.md`
- `configs/source-selection-policy.json`
- `scripts/validate-stage-gate.mjs`
