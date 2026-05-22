# First-Slice Selection Criteria

Date: 2026-05-05

This note defines why a company is promoted into the first paper/product
reference slice. The first slice is not an exhaustive affiliate database. It is
a balanced, fixed-size reference design for testing whether the same
source-to-claim harness can be transferred across Korean business groups.

The fixed design is:

```text
5 groups x 5 listed companies = 25-company first slice
```

## Selection Objective

The first slice should maximize four properties under a controlled scope:

- representativeness of each business group;
- comparability across groups;
- public-source verifiability through KRX, OpenDART, issuer IR, and official
  document URLs;
- feasibility of claim-level promotion into a traceable runtime agent.

This means a company can be important but still remain second-wave coverage if
its accounting treatment, source package, or claim-promotion path would widen
the first paper scope too much.

## Promotion Criteria

To enter the first slice, a company should satisfy most of the following
criteria.

| ID | Criterion | Rule |
| --- | --- | --- |
| FSC-01 | Listed and identifier-ready | Prefer listed companies with KRX code, OpenDART corp code, aliases, and stable companyId. |
| FSC-02 | Group-representative | The company should represent a material part of the group's public investment narrative. |
| FSC-03 | Sector-diversifying | The company should add a distinct business axis rather than duplicate an already covered exposure. |
| FSC-04 | Cross-group comparable | The company should help compare similar roles across groups, such as semiconductors, batteries, mobility, telecom, components, logistics, defense, or holding-company capital allocation. |
| FSC-05 | Public-source available | Annual report, DART filing URL, recent earnings material, investor presentation, value-up plan, or shareholder-return material should be obtainable. |
| FSC-06 | Runtime-claim feasible | Claims should be promotable with companyId, companyScope, period/date, source URL or filing ID, evidence locator, and verification state. |
| FSC-07 | Investor-facing relevance | The company should naturally support investor questions about earnings, capital allocation, risk, business pipeline, valuation context, or market signal. |
| FSC-08 | Scope control | Avoid selecting companies that would require a new accounting framework, a new regulated-product domain, or broad subjective investment advice in the first slice. |

## Deferral Criteria

A company should usually remain second-wave coverage when one of the following
conditions applies:

- public source packages are incomplete or only partially reconciled;
- the company is useful but mostly duplicates an exposure already represented in
  the same group;
- the company is a financial subsidiary and the first-slice claim set would
  require defining non-standard revenue concepts beyond explicit DART account
  labels;
- the company is unlisted or difficult to route through the common KRX/DART
  identifier harness;
- the collected material is third-party commentary without primary official
  source support;
- runtime claims cannot yet be linked to document-level URLs or DART receipts.

Deferred status is not deletion. It means the material remains available for
SCI/product expansion once source packages and account-policy gates are ready.

## Fixed First-Slice Rationale

### Samsung

| Company | Reason for inclusion |
| --- | --- |
| Samsung Electronics | Core semiconductor and electronics anchor; primary market signal for Samsung exposure. |
| Samsung SDI | Battery and energy-storage axis; comparable to LG Energy Solution and SK Innovation battery exposure. |
| Samsung C&T | Holding, construction, trading, and capital-allocation axis; useful for portfolio-level interpretation. |
| Samsung Biologics | Bio/CDMO growth axis; adds a non-electronics high-growth vertical. |
| Samsung Electro-Mechanics | Component layer such as MLCC and camera modules; improves comparability with LG Innotek and Hyundai Mobis. |

Samsung SDS, Samsung Heavy Industries, Samsung E&A, and financial subsidiaries
remain useful second-wave companies. Samsung Life and Samsung Fire & Marine are
kept outside the first slice because financial-company metrics must use only
explicit DART account labels and should not expand the first paper into a
financial-accounting normalization study.

### SK

| Company | Reason for inclusion |
| --- | --- |
| SK Hynix | Semiconductor and HBM anchor; core market narrative for SK. |
| SK Innovation | Energy, battery, and transition exposure; captures restructuring and energy-cycle issues. |
| SK Inc. | Holding-company and portfolio capital-allocation axis. |
| SK Telecom | Telecom, AI, data-center, and stable cash-flow axis. |
| SK Square | ICT investment and platform portfolio axis; connects portfolio structure with SK Hynix exposure. |

Other SK affiliates can be added in product expansion after the first-slice
URL reconciliation and source-backed claim promotion are complete.

### Hyundai Motor Group

| Company | Reason for inclusion |
| --- | --- |
| Hyundai Motor | Primary OEM anchor and main market signal. |
| Kia | Second OEM, product-mix, profitability, and global sales comparison axis. |
| Hyundai Mobis | Core parts, electrification, software, and module supply-chain axis. |
| Hyundai Glovis | Logistics, finished-vehicle shipping, and value-chain resilience axis. |
| Hyundai Rotem | Defense, rail, and export-growth axis; broadens beyond passenger vehicles. |

Hyundai AutoEver, Hyundai Wia, Hyundai Engineering & Construction, Hyundai
Steel, Innocean, and Hyundai BNG Steel remain useful second-wave companies.
Hyundai E&C is a Hyundai Motor Group affiliate for collection purposes, but it
is not needed in the first slice unless the paper/product explicitly broadens
into construction-cycle comparison.

### LG

| Company | Reason for inclusion |
| --- | --- |
| LG Electronics | Electronics, appliances, and vehicle-components anchor. |
| LG Chem | Chemicals and advanced-materials axis. |
| LG Energy Solution | Battery and energy-storage axis. |
| LG Innotek | Components, camera modules, and vehicle electronics; comparable to Samsung Electro-Mechanics. |
| LG Uplus | Telecom, data, and stable cash-flow axis. |

LG Corp, LG Display, LG H&H, and LG CNS are second-wave candidates. They are
important, but the first slice already covers electronics, chemicals, battery,
components, and telecom. LG CNS can become first-wave only if the product scope
prioritizes enterprise AI/cloud implementation narratives over sector balance.

### Hanwha

| Company | Reason for inclusion |
| --- | --- |
| Hanwha Corp. | Reference issuer and original PoC anchor; connects DART/KRX with group-level briefing. |
| Hanwha Aerospace | Defense and aerospace anchor; central to recent Hanwha investment narrative. |
| Hanwha Solutions | Energy, solar, and chemicals axis. |
| Hanwha Systems | Defense IT, radar, satellite, and systems-integration axis. |
| Hanwha Ocean | Shipbuilding, naval, and defense-vessel axis. |

Hanwha Life, Hanwha Investment & Securities, and other financial subsidiaries
remain second-wave coverage unless the product deliberately adds a
financial-company account-policy layer. Existing group-level Hanwha claims are
retained as the reference issuer slice until affiliate-specific claims are
promoted with companyId and companyScope.

## Document Package Required Per First-Slice Company

Each first-slice company should have, or be explicitly marked as needing:

- KRX code, OpenDART corp code, aliases, and companyId;
- latest annual report or DART receipt URL;
- latest four quarterly or earnings materials where available;
- investor presentation, value-up plan, shareholder-return plan, or equivalent
  capital-allocation material where available;
- source provenance ledger with one-line selection reason;
- extraction status and source inventory record;
- source-backed claim queue and promotion boundary.

## Paper Wording

The paper should describe this as a balanced reference slice:

> We use a fixed 25-company reference slice consisting of five listed companies
> from each of five Korean business groups. The slice is selected to maximize
> group representativeness, sector diversity, public-source availability, and
> cross-group comparability while keeping the source-to-claim harness auditable.
> The slice is not intended to be exhaustive; additional affiliates are retained
> as second-wave product and SCI-study expansion material.

## Product Boundary

The mobile product should continue to expose group-level selection first. The
harness may route internally to company-scoped claims, but affiliate-level UI
selection should not become the default until first-slice source-backed claim
coverage is balanced across all five groups.
