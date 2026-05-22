# Agent Quality Management Strategy

Date: 2026-05-03
Updated: 2026-05-05

## Decision

Build a quality-management foundation now, but do not build the full interactive
Agent Dog dashboard for the current arXiv-style paper stage.

For the current paper, the right artifact is:

```text
evaluation scenarios -> trace JSON -> rubric score -> static dashboard-ready JSON
```

For the later SCI/product-validation stage, the right artifact is:

```text
multi-group traces -> Ragas/trace/finance metrics -> quality dashboard -> improvement loop
```

This keeps the current manuscript focused on the PoC-to-traceable-architecture
contribution, while preserving a clean path toward operational quality
monitoring.

Client operation logs are a valuable optional layer, not a hard prerequisite
for the SCI path. If logs can be collected under contract, privacy, retention,
redaction, and publication-rights constraints, they should be added as a
stronger external-validity layer. If they cannot be used, the SCI paper can
still be built from repeated multi-group scenario runs, live/fallback source
state, source-backed claim coverage, numeric consistency, source freshness,
latency, and failure taxonomy.

The SCI-stage evaluation should not depend on whether investors subjectively
rate an answer as "useful." In an investment context, usefulness can collapse
into personal market opinion, risk preference, or hindsight bias. The safer
research claim is that the agent's answers remain faithful, relevant,
context-supported, numerically consistent, source-fresh, trace-complete, and
operationally stable over repeated runs.

## Evidence Base

Ragas official documentation lists RAG metrics including Context Precision,
Context Recall, Response Relevancy, and Faithfulness. It also lists agent and
tool-use metrics such as Tool Call Accuracy, Tool Call F1, and Agent Goal
Accuracy.

Source:

```text
https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/
```

This supports using the user's proposed four Ragas-style metrics as a future
RAG quality layer. It does not by itself prove that the current project should
show live Ragas scores now. Ragas scoring requires stored questions, answers,
retrieved contexts, and references/evidence fields. The current paper baseline
already has trace JSON and source-backed claims, but it does not yet have a
full live-RAG dataset across groups and time periods.

## Why The Full Dashboard Is Not Necessary Yet

The current paper claim is methodological:

- a vibe-coded Replit PoC was reconstructed into a traceable research PoC;
- deterministic behavior was moved from prompts into code;
- source-backed claims and trace envelopes became the basis for answer
  generation;
- fixed scenarios and rubrics provide a keep/discard loop.

An interactive dashboard would shift the paper toward a production
observability product. That is useful later, but it would widen the current
paper scope before the five-group knowledge layer and repeated product traces
are ready.

## What Is Required Now

Current paper-stage quality control should include:

1. frozen scenario set;
2. answer-quality rubric;
3. source-backed claim coverage;
4. trace-contract validation;
5. investor-facing answer quality checks;
6. development/debug leakage checks;
7. customer-facing follow-up quality;
8. latency budget;
9. dashboard-ready JSON export.

The project already implements most of this through:

```text
evals/scenarios/hanwha.reference-slice.json
evals/scenarios/samsung.reference-slice.json
evals/rubrics/advisor.answer-quality.v0.2.json
scripts/evaluate-advisor-scenarios.mjs
evals/results/hanwha-reference-slice-v0.1.autoeval-baseline.2026-05-02.json
evals/results/samsung-reference-slice-v0.1.autoeval-baseline.2026-05-03.json
```

This document adds a dashboard seed builder:

```bash
npm run quality:seed
```

Output:

```text
evals/dashboard/agent-dog.paper-seed.2026-05-02.json
evals/dashboard/agent-dog.samsung-paper-seed.2026-05-03.json
```

The Samsung first-transfer slice now passes 5/5 frozen scenarios at 97/100
with 0 required failures. Its evaluation also checks affiliate-level routing
through `expectedRepresentativeCompanyId`, so the group-level Samsung UI can
remain simple while the runtime routes evidence to Samsung Electronics,
Samsung SDI, Samsung C&T, Samsung Biologics, Samsung Life, or Samsung Fire.

## Metric Layers

### Layer 1: Current Paper-Stage Metrics

These are computed now from the existing advisor auto-evaluation result.

| Metric | Purpose |
| --- | --- |
| Source-backed claim coverage | Checks whether expected official-source-backed claims appear in the answer package |
| Trace contract integrity | Checks tool order, trace fields, and answerAssembly order |
| Investor-facing answer quality | Checks sectioned Korean investor briefing quality without recommendation wording |
| Customer UI safety | Checks that raw claim IDs, fixture labels, prompt/debug prose, and developer questions do not leak |
| Latency budget | Checks whether paper/demo responses stay within the current latency threshold |

These metrics are narrower than Ragas, but they fit the current architecture
because they are tied to the source-to-claim-to-answer trace.

### Layer 2: Future Ragas Metrics

These should be added when live RAG contexts are consistently stored. The
dashboard mockup provided by the researcher is directionally appropriate for
this layer: KPI cards, radar balance, weekly trends, pass/warning/fail
distribution, faithfulness-versus-relevance scatter, and a filterable detailed
log table. The current project should generate the underlying JSON first and
only then build the full interactive dashboard.

| Metric | Use |
| --- | --- |
| Faithfulness | Detect answer claims unsupported by retrieved/source context |
| Response Relevancy | Check whether the answer addresses the user question |
| Context Precision | Check whether useful contexts are ranked high |
| Context Recall | Check whether retrieved contexts contain needed evidence |

These should not be faked in the paper-stage dashboard. A null/planned value is
more rigorous than a decorative score.

### Layer 3: Finance/IR-Specific Metrics

For this product, generic RAG metrics are insufficient. A strategic investment
advisor also needs:

- numeric consistency for revenue, operating profit, dates, share price, and
  percentages;
- source freshness/staleness;
- live/fallback/fixture/local source-state ratio;
- prohibited investment-recommendation phrase absence;
- company/group coverage maturity;
- source-backed claim promotion status;
- customer-facing follow-up quality;
- latency and cost.

These are the metrics that make the SCI product-validation paper more valuable
than a generic RAG dashboard paper. Client-operation logs can strengthen this
paper later, but they are not the only valid evidence layer.

## Agent Dog Roadmap

### Stage A: Paper Static Report

Scope:

- no separate dashboard UI;
- JSON output and tables for paper;
- generated from frozen scenarios;
- Hanwha first, Samsung after seed claims exist.

Command:

```bash
npm run eval:advisor
npm run quality:seed
npm run eval:samsung
npm run quality:samsung
```

### Stage B: Internal Development Dashboard

Scope:

- local-only React or static dashboard;
- reads `evals/dashboard/*.json`;
- shows KPI cards and scenario table;
- used by the researcher/developer, not client-facing.

Trigger:

- now eligible for local build, because Samsung has source-backed seed claims
  and one passing Samsung scenario set. Keep it developer-only until repeated
  group baselines exist.

### Stage C: SCI Product-Validation Dashboard

Scope:

- repeated-run or weekly metric history;
- Ragas metrics;
- group/company/domain filters;
- product trace ingestion;
- pass/warning/fail distribution;
- outlier detection;
- issue owner/status workflow.
- finance-specific checks for numeric consistency, source freshness, routing,
  prohibited recommendation wording, source-state ratio, latency, and fallback
  rates.

Trigger:

- after repeated question-answer traces exist for multiple groups and the
  source/trace retention policy is approved. Real client-operation traces can
  be added only when contractual and publication rights are cleared.

## Data Required From The User Later

For Stage A, no additional dashboard-specific data is needed.

For Samsung quality expansion, the user should provide:

- replacement for the invalid Samsung C&T `2026_1Q_실적발표_보고서.pdf`;
- official source URLs or DART/API basis for any 2022-2024 Samsung financial
  table claims used in the paper;
- Samsung-specific evaluation questions that reflect real investor workflows.
- document-level URLs and exact official PDFs for any additional Samsung
  affiliates beyond the current six-theme first-transfer slice.

For Stage C, the user/client should provide:

- allowed retention period for question-answer logs;
- whether operational questions may be stored raw, hashed, or redacted;
- production domains/categories for filtering;
- acceptable thresholds for pass/warning/fail by use case;
- escalation workflow for failed answers.

## Paper Claim Boundary

Allowed now:

- "The project implements a trace-backed auto-evaluation loop and exports a
  dashboard-ready quality seed."

Not allowed yet:

- "The product has a production quality monitoring dashboard."
- "Ragas metrics are measured over live customer traffic."
- "Weekly quality trend improvement has been demonstrated."
- "Investor usefulness, trust, or decision improvement has been demonstrated."

Production monitoring claims belong only to a later client-operation layer.
They are not required for the first SCI-quality product-validation paper. The
subjective usefulness or decision-improvement claim should remain outside the
main evaluation unless a separate behavioral study is explicitly designed.

Even at the SCI stage, subjective usefulness should remain optional and
separate from the main quantitative evaluation. The main SCI claim should be
based on dashboarded evidence: faithfulness, response relevance, context
precision, context recall, trace completeness, numeric consistency, source
freshness, source-state ratio, latency, and failure rates.
