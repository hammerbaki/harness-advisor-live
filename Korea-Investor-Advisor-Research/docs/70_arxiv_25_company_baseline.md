# arXiv 25-Company Baseline

Date: 2026-05-05

This note fixes the first paper/product baseline as five Korean business groups
with five listed companies each. The purpose is not full conglomerate coverage.
The purpose is to show that the same source-to-claim harness can be transferred
across groups with different industry structures.

The selection rule and per-company rationale are fixed in
`docs/71_first_slice_selection_criteria.md` and mirrored in
`configs/first-slice-selection-policy.json`.

## Baseline Rule

Use:

```text
5 groups x 5 listed companies = 25-company baseline
```

The baseline is selected to maximize group representativeness, sector
diversity, public-source availability, and cross-group comparability while
keeping the first paper scope auditable.

For each company, the target source package is:

- official identifiers: KRX code, OpenDART corp code, company aliases;
- latest annual report or DART receipt URL;
- latest four quarterly earnings materials when available;
- investor presentation, value-up plan, shareholder-return plan, or equivalent
  capital-allocation material when available;
- source provenance ledger with one-line selection reason;
- source manifest, extraction status, and claim-promotion boundary.

## Fixed First Slice

| Group | First-slice companies | Current source status |
| --- | --- | --- |
| Samsung | Samsung Electronics, Samsung SDI, Samsung C&T, Samsung Biologics, Samsung Electro-Mechanics | Samsung Electro-Mechanics source package needed |
| SK | SK Hynix, SK Innovation, SK Inc., SK Telecom, SK Square | SK Square source package needed; OpenDART corp code verified as `01596425` |
| Hyundai Motor | Hyundai Motor, Kia, Hyundai Mobis, Hyundai Glovis, Hyundai Rotem | Kia folder exists but local files are currently missing |
| LG | LG Electronics, LG Chem, LG Energy Solution, LG Innotek, LG Uplus | Source package present; narrative claim promotion remains bounded |
| Hanwha | Hanwha Corp., Hanwha Aerospace, Hanwha Solutions, Hanwha Systems, Hanwha Ocean | Affiliate-level source folders and claim promotion needed |

## Work Completed While Collection Continues

- Inventory scripts now default to `../Knowledge Base/<group>_knowledge`.
- Source intake templates now point to `../Knowledge Base/<group>_knowledge`.
- Group onboarding template now uses the same `Knowledge Base` convention.
- Five local inventories were regenerated from the moved folders.
- First-slice readiness is now audited company-by-company in
  `docs/72_first_slice_readiness_audit.md`.
- SK Square was added to the group config and identifier manifest after
  OpenDART corp-code verification.
- Hyundai Glovis and Hyundai Rotem were promoted into the Hyundai Motor
  first-slice target.
- LG Innotek and LG Uplus were promoted into the LG first-slice target.
- Samsung Electro-Mechanics was promoted into the Samsung first-slice target;
  Samsung Life and Samsung Fire & Marine remain second-wave financial coverage.

## Validation Snapshot

After the folder move and first-slice update:

- `npm run inventory:samsung`: passed, 54 entries
- `npm run inventory:sk`: passed, 58 entries
- `npm run inventory:hyundai`: passed, 133 entries
- `npm run inventory:lg`: passed, 98 entries
- `npm run inventory:hanwha`: passed, 46 entries
- `npm run validate:template`: passed
- `npm run validate:stage-gate`: passed
- `npm run validate:structure`: passed
- `npm run lint:wiki`: passed
- `npm run audit:group-data`: passed with five tracked open gaps
- `npm run audit:first-slice`: passed, 25 first-slice companies checked,
  9 runtime-seed-ready companies, 27 open readiness gaps

## Remaining Collection Requests

Priority additions for completing the 25-company baseline:

1. Samsung Electro-Mechanics
   - annual report or DART receipt URL;
   - latest four quarterly earnings materials;
   - investor presentation or value-up/shareholder-return material;
   - source provenance ledger.

2. SK Square
   - annual report or DART receipt URL;
   - latest four quarterly earnings materials;
   - portfolio, shareholder return, or investment strategy material;
   - source provenance ledger.

3. Kia
   - fill the existing `kia` folder with annual reports, earnings materials,
     investor presentations, and value-up/shareholder-return sources.

4. Hanwha Aerospace, Hanwha Solutions, Hanwha Systems, Hanwha Ocean
   - create company-level folders under `hanhwa_knowledge`;
   - add annual reports or DART receipt URLs;
   - add latest four quarterly earnings materials where available;
   - add investor presentation, value-up, shareholder-return, or capital-action
     material where available;
   - add source provenance ledger and selection reasons.

## Paper Boundary

The arXiv paper should describe this as a balanced transfer baseline, not as
complete coverage of all affiliates. Additional companies collected beyond the
25-company baseline should be kept as SCI/product expansion material unless
they are needed to explain the harness method.
