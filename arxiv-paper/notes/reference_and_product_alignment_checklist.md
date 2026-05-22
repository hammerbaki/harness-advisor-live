# Reference and Product Alignment Checklist

Generated: 2026-05-09

This checklist keeps the paper aligned with the implemented product before
arXiv submission.

## Reference Checks

- Confirm that every cited key in the paper exists in `bib/references.bib`.
- For journal and conference papers, prefer DOI or publisher/ACL/OpenReview URL
  when available.
- For software repositories and gists, keep them in the bibliography only when
  they are directly discussed as engineering artifacts.
- Do not overstate software repositories as peer-reviewed evidence.
- Keep the prior Electronics paper as the link to the earlier simultaneous
  deployment study, not as a benchmark for this financial-domain system.
- Cite ElizaOS only as an agent runtime/background artifact from the earlier
  deployment line, not as a financial or RAG baseline.

## Product-Claim Alignment

The paper may claim:

- prompt-heavy PoC reconstruction into a traceable harness;
- source manifest, extraction, source-backed claim, and LLM Wiki layering;
- company-level routing through structured metadata;
- insight-first answer contract and developer-trace separation;
- frozen scenario validation and live API smoke checks;
- bounded transfer across a 25-company reference slice.

The paper should not claim:

- production readiness;
- improved investment decisions;
- formal investment advice;
- customer satisfaction or commercial conversion;
- long-run reliability of live APIs;
- complete coverage of all listed affiliates or all documents.

## Final Alignment Pass

Before submission, check one actual example end to end:

1. source manifest entry;
2. extraction record or evidence locator;
3. promoted source-backed claim;
4. LLM Wiki context if used;
5. runtime trace;
6. visible answer sentence;
7. source link shown in UI.

The example should match the final screenshots and the table placeholders in the
paper.

## Current Local Audit

- Citation-key audit: all cited keys exist in `bib/references.bib`.
- Unused bibliography entry removed: `zhuge2024gptswarm`.
- Remaining software/gist citations should be kept only if the final text still
  explicitly discusses DSPy, Guidance, Instructor, LLM Wiki, or Autoresearch.
- DOI/URL verification against Zotero or publisher pages is still required
  before submission.
