# Next Data Requirements

Purpose: define the additional data needed after the current arXiv-stage harness paper. The current paper only needs bounded, source-backed, insight-first system validation. The later SCI paper should use real deployment evidence, but its core evaluation should remain dashboard-based and system-oriented rather than subjective user-usefulness scoring.

## For The Current arXiv Paper

Add only data that strengthens reproducibility and transferability.

- Source package for LG:
  - group profile and representative listed companies;
  - DART corp codes and market tickers;
  - company-level IR source pages;
  - document-level URLs;
  - downloaded PDF/PPT files when allowed;
  - one-line selection rationale per document.

- Hyundai Motor narrative promotion:
  - exact source URLs for Hyundai Motor, Kia, Hyundai Mobis, and any added affiliate;
  - source document titles, periods, and issuer names;
  - extracted text hashes;
  - evidence page or line references;
  - claim candidates for EV, software-defined vehicle, battery, mobility, governance, and shareholder-return themes.

- Insight-first validation examples:
  - representative frozen questions per group;
  - answer trace JSON;
  - visible answer sections;
  - source-backed claim IDs in trace only;
  - pass/fail record for structural insight-first answer checks.

Do not collect formal user or expert usefulness ratings for the current arXiv paper. The arXiv-stage check is whether the first section is present, source-backed, non-debug, appropriately cautious, and structurally insight-oriented. In an investment setting, subjective usefulness ratings can become market-opinion ratings, so they should not be the core SCI evaluation either unless a separate behavioral study is explicitly designed.

## For The Later SCI Deployment Study

Add real operation data for a quality-monitoring dashboard. This should not be claimed in the arXiv paper before deployment.

- Anonymized user questions:
  - timestamp;
  - selected group/company;
  - query intent;
  - whether it was a first question or follow-up.

- Answer and trace logs:
  - visible answer text;
  - source links shown;
  - process trace;
  - answer assembly trace;
  - selected source-backed claims;
  - runtime mode;
  - latency;
  - API fallback/error state.

- RAG/grounding evaluation:
  - faithfulness;
  - answer relevance;
  - context precision;
  - context recall;
  - unsupported-claim count;
  - stale-source count.

- Harness and finance-specific evaluation:
  - source-backed claim coverage;
  - company-routing accuracy;
  - numeric consistency for revenue, operating profit, dates, prices, and percentages;
  - source freshness;
  - live/fallback/fixture/local source-state ratio;
  - prohibited recommendation wording absence;
  - developer-trace leakage absence;
  - customer-facing follow-up quality;
  - average and p90 latency;
  - error and fallback rates.

- Optional factual audit labels:
  - evidence support pass/fail;
  - risk/caution adequacy pass/fail;
  - correction category;
  - reviewer notes limited to factual or compliance defects.

## Client Source Request Template

For each company or client domain, request:

- official source page URL;
- direct document URL or DART receipt number;
- document title;
- issuer;
- period or event date;
- file type;
- redistribution/use policy;
- why the document is needed;
- intended claim class;
- whether it should support runtime answers now or remain a manifest backlog item.

Avoid broad requests such as "send all related documents." Ask for bounded source packages tied to claim classes and runtime capabilities.
