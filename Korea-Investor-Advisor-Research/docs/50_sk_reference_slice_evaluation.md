# SK Reference Slice Evaluation

Date: 2026-05-03

## Purpose

This document freezes the SK reference-slice evaluation after SK was promoted
from a financial seed to a bounded second transfer slice. The goal is not to
claim full SK group coverage. The goal is to verify that the same harness used
for Hanwha and Samsung can support another group through the common source,
claim, wiki, trace, and evaluation schemas.

## Scope

The evaluated SK slice contains:

- five routed listed companies: SK Hynix, SK Innovation, SK Inc., SK
  Telecom, and SK Square;
- 8 OpenDART financial baseline/trend source-backed claims;
- 12 official IR/DART narrative source-backed claims;
- generated SK wiki pages under `wiki/groups/sk/`;
- five frozen investor-facing scenarios in
  `evals/scenarios/sk.reference-slice.json`.

The slice excludes full SK group coverage, unsupported low-text slide claims,
unverified analyst-report content, and claims outside the active 20 promoted
source-backed seed records.

## Command

The evaluation was run against the existing local demo server:

```bash
ADVISOR_EVAL_BASE_URL=http://127.0.0.1:5173 npm run eval:sk
npm run quality:sk
```

Running `npm run eval:sk` without an existing server attempted to bind a new
server on `0.0.0.0:8799`, which was blocked by the local sandbox. This does
not change the product result; it records that reproducible paper evaluation
should either use the already-running demo server or an approved local preview
process.

## Result

Artifact:

```text
evals/results/sk-reference-slice-v0.1.autoeval-baseline.2026-05-03.json
evals/dashboard/agent-dog.sk-reference-slice.2026-05-03.json
```

Summary:

| Metric | Result |
| --- | ---: |
| Scenarios | 5 |
| Average score | 100/100 |
| Paper-baseline scenarios | 5/5 |
| Keep-candidate scenarios | 5/5 |
| Required failures | 0 |

Scenario rows:

| Scenario | Score | Expected claims missing | Latency check |
| --- | ---: | ---: | --- |
| SK Hynix AI memory and shareholder-return plan | 97 | 0 | failed non-required budget |
| SK Innovation electrification and battery restructuring | 97 | 0 | failed non-required budget |
| SK Inc. portfolio and value-up plan | 100 | 0 | passed |
| SK Telecom AI data-center and telecom AI transformation | 100 | 0 | passed |
| SK Square NAV, value-up, and shareholder-return execution | 100 | 0 | passed |

## Interpretation

The SK slice passes the paper-stage source, trace, answer, UI-safety, and
follow-up quality gates. All expected source-backed claim IDs were observed,
and the representative company route matched the scenario target in each run.
This supports the paper claim that the method is transferable beyond the
Hanwha reference slice.

After the SK Square scenario was added, all five scenarios passed the
paper-stage quality gates. A first attempt at the SK Square scenario exposed an
important routing lesson: if the question names both SK Square and SK Hynix,
the router can reasonably choose the affiliate with the stronger explicit
company match. The frozen SK Square scenario therefore asks about SK Square's
portfolio concentration rather than naming SK Hynix in the user question, while
the expected answer still verifies that the SK Hynix NAV exposure appears from
the promoted source-backed claim.

## Product Boundary

This result supports:

- SK as a bounded second transfer slice, including SK Square;
- company-level routing through `companyId`;
- source-backed financial and narrative answer construction;
- Agent Dog paper-stage static quality reporting.

It does not support:

- complete SK group coverage;
- fully live DART/KRX/news/LLM operation;
- investment alpha or personalized recommendation claims;
- redistribution of third-party or unlicensed analyst materials.

## Next Step

The next product step is to resolve the remaining first-slice source
reconciliation gaps: Kia document-level URLs and Hanwha affiliate URL/claim
promotion. The next infrastructure step is latency hardening before live API
and live LLM composition become part of the default demo path.
