# Group Company Balance Plan

Date: 2026-05-05

## Decision Context

The product should not imply that one group is deeply covered while another is
only represented by a thin shell. For the next product hardening stage, each of
the five target groups should have a comparable first-slice company universe.

The recommended product rule is:

```text
Use five listed companies per group as the balanced first slice.
Keep broader affiliates as second-wave coverage.
Do not expose affiliate selection in the main UI until the source-backed claim
coverage is balanced enough to support it.
```

## Samsung Status

Samsung is not configured as a four-company group.

- Configured company universe: 15 listed companies
- Source-backed claims: 31 claims across 15 companies
- Local source package: concentrated in Samsung Electronics, Samsung SDI,
  Samsung C&T, Samsung Biologics, Samsung Life, and Samsung Fire & Marine
- Strongest business-narrative first slice today: Samsung Electronics,
  Samsung SDI, Samsung C&T, and Samsung Biologics

Therefore, the user's concern is directionally correct if the question is about
source-rich product coverage rather than configured identifiers. Samsung needs
one or two additional non-financial operating companies to make the first slice
feel balanced.

## Recommended Balanced First Slice

| Group | Balanced first-slice companies | Rationale |
| --- | --- | --- |
| Samsung | Samsung Electronics, Samsung SDI, Samsung Biologics, Samsung C&T, Samsung Electro-Mechanics | Semiconductors/electronics, batteries, bio, holding/construction/trading, electronic components |
| SK | SK Hynix, SK Innovation, SK Inc., SK Telecom, SK Square | Semiconductors, energy/battery, holding company, telecom/AI, investment/platform exposure |
| Hyundai Motor | Hyundai Motor, Kia, Hyundai Mobis, Hyundai Glovis, Hyundai Rotem | OEM, second OEM, core parts, logistics/value chain, defense/rail/export growth |
| LG | LG Electronics, LG Chem, LG Energy Solution, LG Innotek, LG Uplus | Electronics/vehicle components, chemicals/materials, batteries, components, stable telecom cash flow |
| Hanwha | Hanwha Corp., Hanwha Aerospace, Hanwha Solutions, Hanwha Systems, Hanwha Ocean | Holding/industrial, defense/aerospace, energy/solar/chemicals, defense IT/satellite, shipbuilding/defense vessels |

## Samsung Additions

Priority additions for Samsung:

1. Samsung Electro-Mechanics
   - Add first because it gives Samsung a component/MLCC/camera-module layer
     between Samsung Electronics and the broader electronics supply chain.
   - It is operationally easier than financial-company interpretation and
     improves comparability with LG Innotek and Hyundai Mobis.

2. Samsung SDS
   - Add next if the product wants AI, cloud, logistics IT, and enterprise
     digital-transformation themes.
   - It is useful for the agent thesis, but should be second after Samsung
     Electro-Mechanics if only one company is added immediately.

3. Samsung Heavy Industries or Samsung E&A
   - Add only if the paper/product needs shipbuilding, offshore, EPC, or global
     construction-cycle comparison.
   - These are useful for comparison with Hanwha Ocean and Hyundai E&C, but
     they broaden the sector scope.

4. Samsung Life and Samsung Fire & Marine
   - Keep as financial second-wave unless the product explicitly needs financial
     subsidiaries.
   - Use only explicit DART account labels; do not redefine financial-company
     revenue in the paper or runtime.

## Product Rule

For the mobile product, keep the visible selector at group level. The internal
harness can route to company-level claims, but the UI should not expose
affiliate-level selection until each group has a comparable first slice.

## Data Request Implication

For Samsung, the next source request should prioritize:

- Samsung Electro-Mechanics: latest annual report, latest four earnings
  materials, investor presentation or value-up/shareholder-return material if
  available, document-level URLs.
- Samsung SDS: latest annual report, latest four earnings materials, cloud/AI
  or enterprise IT strategy presentation if available, document-level URLs.

These additions would bring Samsung closer to the same first-slice balance as
the other groups without turning the product into an exhaustive affiliate
database.
