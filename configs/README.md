# Configs

This folder is the agent control map. It defines which corporate groups,
companies, identifiers, source namespaces, and onboarding rules the harness can
recognize before any answer is assembled.

Configuration should remain separate from prompt text and UI code. The point is
to make entity scope and source policy explicit rather than hiding them inside a
long system prompt.

`groups.json` is the current research schema for five Korean business groups.
Samsung is the neutral default UI target. Hanwha is the deepest reference slice,
while Samsung, SK, Hyundai Motor Group, and LG are maintained as additional
public-data profiles that must remain source-verified before runtime use.

`source-selection-policy.json` defines the reusable document-selection rules
for Hanwha, Samsung, SK, Hyundai Motor Group, LG, and future groups. Selection
rationale manifests should reference these rule IDs instead of using ad hoc
human explanations.

`client-source-request-template.json` defines how to ask clients for source
packages without using unbounded requests such as "all related documents".

`group-onboarding-template.json` defines the reusable artifact contract for
adding a new group from identifier verification through source-backed claims,
wiki generation, fixed scenarios, and quality artifacts.

`document-url-intake-schema.json` defines the exact fields and status values
for public source provenance before local PDFs can become source-backed
narrative evidence. Stable document-level URLs are preferred, but official
source pages plus title, period, checksum, and access metadata are acceptable
for dynamic issuer downloads.

Config rules:

- group-specific behavior belongs here or in `wiki/`, not in hard-coded
  prompt instructions;
- `displayOrder` controls investor-facing target order and should follow the
  selected-target ranking policy documented in
  `configs/first-slice-selection-policy.json`;
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

Before treating a config change as release-ready, run:

```bash
npm run validate:template
npm run validate:structure
npm run validate:evals
```
