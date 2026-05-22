# Publication Strategy and SCI Path

Date: 2026-05-05

## Decision

The project should be developed toward an SCI-level product and evidence
package. The arXiv submission should be treated as a pre-publication milestone,
not as the final research endpoint.

The arXiv paper should present the core strategy:

- reconstruction of a prompt-heavy Replit PoC into a traceable LLM agent;
- source-backed claim promotion;
- LLM Wiki as a maintainable synthesis layer;
- prompt-to-code migration for deterministic behavior;
- structured output and guardrail validation;
- fixed scenario evaluation and dashboard-ready trace artifacts.

The SCI paper should be built from the more complete product path:

- multiple Korean business groups processed through the same onboarding
  standard;
- DART/KRX/news/IR source integration;
- company-level routing under a group-level UI;
- answer-quality evaluation over repeated scenario sets;
- numeric consistency and source-freshness checks;
- failure analysis and improvement loops.

## Why This Strategy Is Appropriate

The current product is already collecting real official sources. That makes it
stronger than a purely synthetic demo, but it is not yet a full production
deployment. Publishing the arXiv paper now as a method paper protects the scope:
it can explain the harness design without overclaiming investor usefulness,
commercial readiness, or long-term operational performance.

The SCI work can then use the same product as the empirical system. This is
more coherent than writing two unrelated papers. The arXiv paper becomes the
methodological foundation, while the SCI paper becomes the multi-group,
evidence-driven validation paper.

## Operating Logs Are Optional, Not Mandatory

Client operation logs would strengthen the SCI paper, but the SCI path should
not depend on them as a hard requirement.

Using real client logs requires:

- signed client contracts;
- permission to retain and analyze user questions;
- privacy and confidentiality review;
- redaction or hashing policy;
- approval to publish aggregate findings;
- separation between investment-sensitive content and research artifacts.

If client logs are unavailable or cannot be published, the SCI paper can still
be constructed from a rigorous product-evaluation dataset:

- frozen scenario sets by group and company;
- repeated runs over the same questions;
- live/fallback/fixture/local source-state ratios;
- source-backed claim coverage;
- trace completeness;
- numeric consistency for financial figures;
- source freshness and staleness checks;
- latency and failure-rate trends;
- qualitative failure taxonomy reviewed by the researcher.

This avoids making subjective investor usefulness the primary outcome. In an
investment setting, usefulness may depend on risk preference, market timing,
and hindsight. The stronger research claim is that the agent can produce
traceable, source-grounded, numerically consistent, and reproducible briefings
across companies and source conditions.

## Paper Claim Boundary

### arXiv-appropriate claims

- A prompt-heavy enterprise LLM PoC can be reconstructed into a traceable
  harness.
- Deterministic behavior can be moved from prompts into code, manifests, and
  validation gates.
- Public-data investor briefings can be generated from source-backed claims
  while keeping trace metadata separate from the customer UI.
- The same harness can be transferred from a reference group to additional
  groups through explicit source-intake and claim-promotion rules.

### SCI-appropriate claims

- The harness scales across multiple corporate groups and affiliate-level
  source structures.
- The quality layer can measure faithfulness, relevance, source coverage,
  numeric consistency, latency, and source freshness over repeated runs.
- Failure modes can be identified and reduced through a documented improvement
  loop.
- Optional client or pilot logs can be analyzed only when governance and
  publication rights are cleared.

### Claims to avoid until evidence exists

- The system improves investment decisions.
- Investors trust the system more than alternatives.
- Production Ragas metrics improved over real client traffic.
- Weekly operational monitoring has been demonstrated in a deployed client
  environment.

## Product Implication

The product should continue to prioritize:

1. answer accuracy;
2. source traceability;
3. numeric consistency;
4. company routing correctness;
5. reproducibility;
6. extension to new groups;
7. speed.

UI polish and insight quality matter, but they must be governed by the harness.
The answer should present investor-facing insight, while the development UI and
trace exports carry source status, selected claims, validation results, and
failure reasons.

## Next Research/Production Gate

Before returning to paper writing, the product should complete the current
five-group reference path:

1. keep Hanwha, Samsung, SK, and Hyundai Motor scenarios passing;
2. keep the LG financial seed passing after identifier verification and DART
   source-backed claim promotion;
3. finish LG local IR source intake when the user supplies `lg_knowledge`;
4. promote a bounded LG narrative claim slice only after exact source URLs and
   evidence locators are available;
5. run the same evaluation harness across all ready groups;
6. export dashboard-ready quality JSON;
7. only then update the arXiv draft with the final product state.
