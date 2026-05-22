# Configs

This folder stores group-level configuration that should remain separate from
prompt text and UI code.

`groups.json` is the current research schema for five Korean business groups.
Samsung is the neutral default UI target. Hanwha is the reference slice because
the original PoC was Hanwha-focused. Samsung, SK, Hyundai Motor Group, and LG
are seed profiles for expansion and must be source-verified before being used
as paper evidence.

`source-selection-policy.json` defines the reusable document-selection rules
for Hanwha, Samsung, SK, Hyundai Motor Group, LG, and future groups. Selection
rationale manifests should reference these rule IDs instead of using ad hoc
human explanations.

`client-source-request-template.json` defines how to ask clients for source
packages without using unbounded requests such as "all related documents".

`group-onboarding-template.json` defines the reusable artifact contract for
adding a new group from identifier verification through source-backed claims,
wiki generation, frozen scenarios, and paper-stage quality artifacts.

`document-url-intake-schema.json` defines the exact fields and status values
for public source provenance before local PDFs can become source-backed
narrative evidence. Stable document-level URLs are preferred, but official
source pages plus title, period, checksum, and access metadata are acceptable
for dynamic issuer downloads.

Config rules:

- group-specific behavior belongs here or in `wiki/`, not in hard-coded
  prompt instructions;
- `displayOrder` controls investor-facing target order and should follow the
  selected-target ranking policy documented in `docs/13_group_company_template.md`;
- public identifiers such as DART corp codes, KRX tickers, and Yahoo tickers
  must be traceable;
- every profile should declare whether it is a reference slice or
  seed-unverified;
- every profile should include `selectorNote` and `logoAsset` so the mobile
  selector remains reproducible without UI-specific branching;
- `selectorNote` should describe data/template readiness, not a partial
  business-portfolio summary;
- adding a sixth group should not require UI or server logic changes.
- source-selection rules should be versioned and reused across groups before
  any source is promoted to runtime wiki context.
- client source requests should map every requested source to a package,
  intended use case, rights label, and confidentiality label.
- live API credentials are provider-level settings, not company-level settings;
  company differences belong in identifiers, manifests, and wiki namespaces.

Before treating a config change as paper-ready, run:

```bash
npm run validate:template
npm run validate:stage-gate
```
