# Paper Draft

## Working Title

Beyond Prompting: Harness Engineering for Enterprise LLM Agents

## Draft Abstract

This paper presents a reconstruction method for converting a fast, prompt-heavy
LLM proof-of-concept into a reproducible, traceable, and extensible
public-data investment briefing system. The motivating case is a Replit-built
Hanwha advisor PoC originally designed for a stage demonstration. The
reconstructed system repositions the application as a public-data strategic
investment advisor for external investors monitoring Korean business groups.

The reference implementation separates raw source provenance, compiled LLM Wiki
knowledge, source-backed claim promotion, deterministic runtime controls, and
investor-facing answer composition. Instead of relying on a large system prompt
and hidden RAG bundle, deterministic behavior such as group routing, source
eligibility, answer-process tracing, output safety, follow-up filtering, and
evaluation scoring is moved into code. Company-specific cases are treated as
application slices for validating the harness, not as the paper's main subject.
Hanwha is used as the first source-backed reference slice. Samsung is used as the first transfer test, with
OpenDART financial claims and a small official IR/DART narrative claim subset
promoted only after public URL, extraction hash, and evidence-line validation.
SK is used as the second bounded transfer slice. Hyundai Motor has entered an
identifier-verified source-intake stage, while LG remains a template expansion
target.

The system introduces a code-owned answer assembly trace, an
Instructor-style live LLM output contract, question-intent answer plans to
avoid rigid templating, and an autoresearch-style fixed-scenario evaluation
loop. The latest harness revision also separates process observability from
audience-facing prose: trace steps remain inspectable, but the visible answer
must begin with `핵심 인사이트` and treat evidence as support rather than as
the result itself. Across frozen reference scenarios, the implementation is
validated for source-backed claims, customer-facing briefing quality,
development-leakage guards, and insight-first answer structure. The paper does
not claim full commercial readiness. It frames the contribution as a traceable
research PoC and reusable pre-commercial architecture that can later be hardened
with live DART, KRX, news, LLM, compliance, monitoring, and client-operation
evidence.

## Research Claim

The paper's central claim is not that the product is already commercial-grade.
The claim is:

```text
A prompt-heavy financial advisor PoC can be reconstructed into a reproducible
agentic architecture by moving deterministic controls into code, treating raw
sources and source-backed claims as the truth layer, using an LLM Wiki as a
compiled knowledge layer, and evaluating outputs with frozen traceable
scenarios.
```

## Maturity Boundary

The manuscript must keep three maturity levels separate:

1. **Exploratory PoC**: the original Replit/vibe-coded demonstration.
2. **Traceable research PoC**: the current reference implementation used for
   the paper.
3. **Commercial product candidate**: the future system requiring live-data,
   security, compliance, monitoring, and client-operation hardening.

This distinction protects both the paper and the business roadmap. The paper
can be methodologically strong without overstating production readiness.
The customer-facing wording should also stay within a public-data briefing
scope. Recommendation-like terms such as buy/sell calls, target prices, and
`투자 판단` are treated as regulated-advice risk signals unless they appear as
quoted source terminology.

## Contributions

1. **PoC-to-architecture reconstruction method**  
   The work documents how a working but messy LLM PoC can be decomposed into
   source manifests, wiki namespaces, claim sets, runtime contracts, and
   evaluation scenarios.

2. **Source-backed public-data knowledge pipeline**  
   Raw sources are inventoried, linked to provenance, extracted, compiled into
   claim candidates, and promoted only when claim-level evidence is available.
   Hanwha's source corpus is rooted in the official IR route:
   `https://www.hanwhacorp.co.kr/hanwha/investment/ir_event.jsp`.
   Samsung extends the method with affiliate-specific IR routes, OpenDART
   financial API records, DART filing text extraction, and document-level URL
   intake before runtime promotion.

   The contribution is the source and claim harness, not a company-specific
   investment thesis. Each company slice is intentionally bounded by
   `companyId`, source eligibility, claim-promotion rules, and evaluation
   scenarios.

3. **LLM Wiki as maintainable knowledge layer**  
   The LLM Wiki is used as a compiled, maintained synthesis layer, not as the
   raw source of truth. The raw manifests and source-backed claims remain the
   authority.

4. **Prompt-to-code migration**  
   Deterministic behavior is moved out of the prompt: group routing,
   source-state handling, answer sections, follow-up filtering, output
   contracts, trace schema, and evaluation thresholds are code-owned.

5. **Traceable answer generation**  
   Each response includes `processTrace` for tool/source execution and
   `answerAssembly` for question routing, source collection, wiki checking,
   claim selection, answer planning, and guardrail validation.

6. **Insight-first output contract without rigid prose**  
   The live LLM boundary is guarded by `advisor-llm-output-contract.v0.1`.
   The contract validates admissible answer structure, requires a
   reader-facing `핵심 인사이트` opening section, and keeps collection or
   validation details inside trace/developer UI. `answerPlan` changes the
   domain-specific middle section by question intent, reducing the risk of
   overly mechanical answers.

7. **Autoresearch-style evaluation loop**  
   Frozen scenarios and `advisor-answer-quality-v0.2` evaluate source-backed
   claim coverage, trace contract, briefing quality, development leakage,
   customer-facing follow-ups, template variation, links, latency, and PoC
   regression risks.

## Related Work Positioning

The paper should position the work around four ideas:

- **LLM Wiki**: a maintainable knowledge substrate for frequently updated
  company information.
- **Programming, not prompting**: deterministic product behavior belongs in
  code rather than long natural-language prompts.
- **DSPy**: selected as the future offline LLM-program optimization layer for
  the answer composer, not yet installed into runtime.
- **Instructor-style structured output**: used as the immediate runtime guard
  pattern through a small hand-rolled contract, with full framework adoption
  deferred until live LLM traces justify it.

Guidance and OpenPipe are best framed as adjacent future paths:

- Guidance may be useful when token-level constrained generation becomes
  necessary.
- OpenPipe may be useful after production traces are available for cost and
  speed optimization.

## System Overview

```text
Raw official/public sources
  -> source inventory and provenance
  -> extracted text
  -> claim candidates
  -> source-backed claim manifest
  -> LLM Wiki namespace
  -> deterministic runtime context package
  -> answer composer
  -> output contract and guardrails
  -> investor UI + developer trace + evaluation JSON
```

The architecture deliberately separates customer-facing UI from
developer/research UI. The investor sees concise process status, briefing
sections, source links, and follow-up questions. The developer and paper
reviewer can inspect trace status, source-backed claims, answer assembly, and
exported JSON.

## Reference Slice

Hanwha is the first reference slice because it has the deepest original PoC
context and the most complete current source chain.

Current Hanwha status:

- 45 local source files after official backfill;
- 37/37 official PDF extraction candidates passing extraction;
- 106 old RAG-derived claims retained as `needs_source_link`;
- 11 official-source-backed seed claims promoted for bounded runtime use, all
  backfilled with `companyId=hanwha` and `companyScope=issuer_company`;
- 86 official-site downloads remain outside the local corpus, but are resolved
  as claim-driven or manifest-only backlog rather than current paper/runtime
  blockers;
- 5 frozen scenarios passing the current paper baseline.

The paper should not imply that Samsung, SK, Hyundai Motor, and LG already have
the same source-backed depth. They are staged template expansion targets.

The current onboarding rule is now explicit: each new group must pass
identifier verification, source intake ledger, local inventory, extraction
report, claim queue, source-backed claim promotion, wiki compilation, and
frozen scenario evaluation. This standard is documented in
`docs/53_group_onboarding_standard.md` and exists to keep the paper focused on
the reusable harness rather than company-specific business analysis.

Samsung has now entered the first expansion stage beyond scope metadata. The
current Samsung artifact includes:

- a 15-company listed affiliate universe with DART/KRX identifiers;
- a 53-entry source inventory with 40/40 valid local PDFs, 10 DART viewer
  filings, and 3 support notes;
- 40/40 local official PDF extraction success and generated private markdown
  review files;
- a six-company LLM Wiki seed under `wiki/groups/samsung/`;
- 12 customer-facing candidate investor questions for future scenario design;
- a DART API-backed 2022-2024 financial table covering 45 company-year slots.
- 19 OpenDART source-backed seed claims covering the 2024 financial baseline
  for the 15 registered listed affiliates and four 2023-2024 trend claims for
  the first reference-layer companies.
- a document-URL intake ledger and narrative-claim queue that keep all local
  PDF and DART filing narrative claims blocked until public URL, extraction
  hash, evidence locator, period/reporting basis, and forward-looking labels
  are complete.

This is still not an equally mature answer slice. The DART table currently has
35 complete company-year records, 6 partial financial-sector records, and 4
2022 financial-company no-data records from OpenDART. The paper can use this as
evidence that the Hanwha template is extensible and that gaps are traceable. It
should not define financial-company revenue. For Samsung Life, Fire, Card, and
Securities, the companion account audit records exactly what OpenDART provides;
finance-specific accounts such as interest income, fee income, and insurance
income are not reclassified into revenue in the paper-stage artifact. The
current Samsung seed layer is DART-financial and reproducible; narrative IR/PDF
claims and scenario evaluation should be described only within their bounded
first-transfer scope.

SK has now entered the next expansion stage after Samsung. The current SK
artifact includes:

- four-company DART/KRX identifier verification for SK Hynix, SK Innovation,
  SK Inc., and SK Telecom;
- a 12/12 OpenDART 2022-2024 financial table with explicit `매출액` and
  `영업이익` accounts;
- 8 financial source-backed seed claims;
- a local source inventory with 58 entries and 57 valid PDFs;
- 56/57 local PDFs matched to document-level public URLs;
- 52/57 PDF extraction successes and extraction-status records for the
  remaining files;
- a four-theme narrative claim queue with 26 ready sources and 31 blocked
  sources before source-backed runtime promotion;
- 8 promoted official IR/DART narrative source-backed claims covering bounded
  Hynix, Innovation, Inc., and Telecom themes;
- generated SK wiki pages under `wiki/groups/sk/`;
- a bounded reference-slice scenario at `evals/scenarios/sk.reference-slice.json`.

This is now a bounded runtime-promoted SK narrative slice, not full SK group
coverage. The paper can use SK as evidence that the same harness can move from
source intake to promoted claims, wiki synthesis, and reference-slice scenarios
without changing the common schema. It should not yet claim full SK HBM, AI,
energy, telecom, shareholder-return, or portfolio strategy coverage outside the
16 promoted source-backed seed claims.

## Evaluation Design

The current frozen Hanwha scenario set covers:

1. latest-news and investment-point briefing;
2. financial performance summary;
3. business pipeline and BNCP thesis;
4. value-up and shareholder-return plan;
5. governance and disclosure process.

The current auto-evaluation result:

```text
scenario count: 5
average score: 100/100
paper baseline: 5/5
required failures: 0
rubric: advisor-answer-quality-v0.2
```

The current SK second-transfer result:

```text
scenario count: 4
average score: 98.5/100
paper baseline: 4/4
required failures: 0
rubric: advisor-answer-quality-v0.2
```

The evaluation is not a proof of investment performance. It is a proof that
the reconstructed architecture can produce traceable, source-backed,
customer-facing answers within declared reference slices.

## Draft Paper Structure

1. **Introduction**
   - Problem: LLM financial PoCs can work in demos but fail reproducibility,
     traceability, and maintainability.
   - Research question: how to reconstruct such a PoC into a reproducible
     public-data advisor architecture.
   - Contribution summary.

2. **Motivating PoC and Product Repositioning**
   - Original Hanwha executive-strategy assistant.
   - Shift to public-data investor advisor.
   - Why PoC/commercial/product boundaries must be explicit.

3. **Architecture**
   - Source layer.
   - Claim layer.
   - LLM Wiki layer.
   - Deterministic runtime layer.
   - Answer composer and output contract.
   - Investor UI and developer trace UI.

4. **Prompt-to-Code Migration**
   - What stayed in prompts.
   - What moved to code.
   - What moved to source/wiki manifests.
   - What was archived from the PoC and why.

5. **Reference Slice: Hanwha**
   - Source-selection policy.
   - Official IR route provenance.
   - Claim promotion.
   - Frozen scenario design.

6. **Evaluation**
   - Rubric.
   - Frozen scenario results.
   - Trace examples.
   - Template-variation guard against rigid answer generation.

7. **Discussion**
   - Replit demo usefulness and limits.
   - Why live APIs should follow the template freeze.
   - How the same method extends to Samsung, SK, Hyundai Motor, and LG.
   - How future client pilots can support a later SCI empirical paper.

8. **Limitations**
   - Hanwha remains the primary source-backed reference slice; Samsung and SK
     are bounded transfer slices, not full group coverage.
   - Live DART/KRX/news/LLM integrations are not yet the paper baseline.
   - No personalized investment advice or suitability judgment.
   - Third-party analyst reports require rights review.
   - Real commercial deployment requires compliance and monitoring.

9. **Conclusion**
   - The contribution is a reproducible reconstruction method and reference
     architecture, not a claim of completed commercial operation.

## Candidate Figures And Tables

- Figure 1: mobile advisor UI in iPhone-style frame.
- Figure 2: source-to-claim-to-wiki-to-answer architecture.
- Figure 3: answer-generation process trace.
- Table 1: PoC feature reuse/refactor/rewrite/archive map.
- Table 2: source-selection rules.
- Table 3: Hanwha source-backed seed claims.
- Table 4: frozen scenario evaluation results.
- Table 5: Samsung expansion source gate, DART financial-table status, and
  DART-first source-backed seed claims.
- Table 6: prompt-to-code migration categories.
- Table 7: framework positioning: LLM Wiki, DSPy, Instructor-style output
  contract, autoresearch loop.

## Claims Allowed In The Current Paper

- The original PoC was reconstructed into a traceable research PoC.
- Hanwha is a source-backed reference slice.
- Deterministic controls reduce dependence on long prompts.
- LLM Wiki is useful as a maintained synthesis layer when raw source
  provenance remains separate.
- The architecture is designed for expansion to the top Korean business groups.
- SK has advanced to a bounded second transfer slice with DART financial
  claims, promoted official IR/DART narrative claims, generated wiki pages, and
  a reference-slice scenario.
- Frozen scenarios and trace JSON make evaluation reproducible.

## Claims Not Allowed Yet

- The system is a fully commercial investment-advisory product.
- All five groups are source-backed to the same level as Hanwha.
- Samsung narrative IR/PDF knowledge is fully promoted across all listed
  affiliates.
- SK group coverage is complete beyond the 16 promoted seed claims.
- Live DART/KRX/news/LLM integrations are fully validated.
- The answer quality proves investment alpha.
- The system provides personalized investment recommendations.
- Third-party analyst report contents can be redistributed.

## Immediate Writing Tasks

1. Select paper screenshots from the current mobile UI.
2. Convert the architecture into a clean diagram.
3. Summarize Hanwha source selection and claim promotion in tables.
4. Export and freeze representative trace JSON examples.
5. Draft the Methods section from `docs/20`, `docs/23`, `docs/28`,
   `docs/29`, `docs/32`, and `docs/33`.
6. Use `docs/41_samsung_source_backed_seed_claims.md` as the paper evidence
   for the first Samsung template-transfer step.
7. Use `docs/47_sk_source_inventory_and_ingestion.md`,
   `docs/48_sk_narrative_claim_queue.md`, and
   `docs/49_sk_source_backed_narrative_claims.md` as paper evidence that the
   same source gate can expose transfer readiness, source gaps, and bounded
   runtime claim promotion for a second expansion group.
8. Run and freeze the SK reference-slice evaluation before using SK as a paper
   transfer result.
