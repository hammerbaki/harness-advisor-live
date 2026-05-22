# Hanwha Reference Slice Parity Audit

Audit date: 2026-05-02

## Verdict

The current Hanwha slice matches the project's intended direction as a
traceable research PoC and pre-commercial template. It does not fully clone the
original Replit product. That is intentional.

The original PoC was a persuasive, voice-first, Hanwha-executive demo. The
current Hanwha slice is a public-data investor-advisor reference slice. Its
purpose is to prove that the messy PoC can be rebuilt into a reproducible,
source-backed, multi-group architecture.

The current Hanwha slice is ready to serve as the first expansion template for
Samsung, SK, Hyundai Motor, and LG if the expansion copies the source pipeline,
claim-promotion rules, wiki namespace, answer contract, and evaluation scenario
structure. It is not ready to be described as full commercial parity with the
original operational app.

## Evidence Checked

Commands run:

```bash
npm run validate:template
npm run validate:stage-gate
npm run validate:prompt-control
npm run validate:hanwha-ingestion
ADVISOR_EVAL_NO_EXISTING_SERVER=1 npm run eval:advisor
```

Observed results:

- template validation passed for five group profiles;
- stage-gate validation passed with expected warnings for the four planned
  non-Hanwha profiles;
- runtime prompt control passed with a 103-word prompt bundle;
- Hanwha ingestion validation passed with 45 local files, 37/37 PDF
  extractions, and 106 claim candidates;
- Hanwha ingestion still warns that 86 official downloads from the site scan
  are absent locally, so paper/source scope must be declared;
- advisor auto-eval passed 5/5 frozen Hanwha scenarios at 100/100.

Browser/UI smoke check:

- iPhone-style mobile frame renders at `http://localhost:5173/`;
- group selector, quick buttons, brief cards, mode toolbar, mic/send controls,
  and placeholder render;
- switching from Samsung to Hanwha works;
- a Hanwha financial question shows process status, sectioned answer, source
  links, follow-up questions, and a developer-only `DEV` trace toggle;
- forbidden development prose such as "근거 패키지 구성 완료" and "이번 답변의
  공식 근거" is not visible in the customer answer.

## Original PoC Capability Mapping

| Original PoC capability | Current Hanwha status | Expansion relevance |
| --- | --- | --- |
| Mobile-first iPhone demo frame | Implemented as CSS device frame | Useful for paper screenshots and Replit demos |
| Header with brand, ticker, price | Implemented and group-config driven | Reusable by group/company config |
| Brief cards for news, stock, financials | Implemented and compact after conversation starts | Reusable, but each group needs verified seed facts |
| Quick buttons / chips | Implemented as deterministic question templates | Reusable and safer than prompt-owned intent |
| Chat answer with follow-up questions | Implemented; follow-ups are customer-facing only | Reusable |
| Source links | Implemented through API link package | Reusable |
| Dynamic collection/analysis process | Partially implemented: pending planned steps plus final process trace | Needs polling/streaming restoration when live latency matters |
| Developer/debug inspection | Implemented as removable `DEV` panel and trace JSON | Stronger research fit than original mixed debug UI |
| Long system prompt + inline RAG | Replaced by short prompts, wiki, manifests, and claims | Core paper contribution |
| DART/KRX/news/LLM tool interface | Implemented as fixture/fallback/live-compatible interfaces | Needs live credentials and corp-code completion |
| Voice-first TTS/STT | UI affordance retained; production voice pipeline deferred | Not required for text-first commercial workflow |
| Filings/settings/ops pages | Not ported as product pages | Can be reintroduced later as admin/research surfaces |
| Chart rendering and TTS chart guards | Archived as original regression ideas | Not a blocker for current investor text baseline |
| Persisted conversations/auth/operator routes | Not implemented | Required only for commercial hardening |

## Direction Fit

The Hanwha slice fits the roadmap because it now separates:

- raw official/public sources;
- extracted text;
- source-backed claims;
- LLM Wiki pages;
- runtime tool traces;
- customer-facing answer;
- developer/paper trace;
- frozen evaluation scenarios.

This directly supports the two goals:

1. **Paper**: the slice can demonstrate PoC-to-architecture reconstruction,
   prompt-to-code migration, source-backed claim promotion, and traceable
   evaluation.
2. **Commercialization**: the same source-selection and claim-promotion
   protocol can be requested from future clients without asking for "all
   related documents."

## Remaining Gaps Before Paper Freeze

These are not blockers for starting Samsung expansion, but they must be named
before the paper or client demo is framed as mature:

- 86 official Hanwha downloads from the scan are not local; decide whether they
  are outside scope or need backfill.
- only 11 source-backed Hanwha claims are runtime-eligible; 106 old RAG-derived
  claims remain candidates.
- DART and news are currently fixture without credentials; market uses a Yahoo
  fallback when KRX is unavailable.
- the process rail is not full original-style polling/streaming yet.
- voice is no longer the commercial default and is not a production ElevenLabs
  integration.
- filings/settings/ops/admin pages are not reconstructed in the clean app.
- no authentication, client workspace separation, retention policy, or
  compliance workflow exists yet.

## Go / No-Go

Go for Samsung expansion:

- source-template replication;
- manifest and wiki namespace creation;
- source-backed claim generation;
- frozen scenario creation;
- evaluation comparison against the Hanwha baseline.

No-go for claims of complete original-product parity:

- full live multi-tool operation;
- full voice/meeting experience;
- full ops dashboard;
- production compliance readiness.

## Expansion Rule

When copying Hanwha to a new group, copy the method, not the facts:

```text
official source scope
  -> local/source inventory
  -> provenance and selection rationale
  -> extraction report
  -> claim candidates
  -> source-backed claims
  -> wiki namespace
  -> group config
  -> frozen scenarios
  -> advisor eval trace
```

Only after this pipeline passes should live API credentials be treated as
product evidence.
