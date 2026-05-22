# Figure Placeholders

This folder is reserved for paper-ready figures and product screenshots.

Before arXiv submission, every placeholder in the PDF should be replaced by
either a real screenshot or a clean diagram. A placeholder-free v1 matters more
than adding SCI-level ablation evidence at this stage.

## Planned UI screenshots

- `ui_mobile_main_ko.pdf`: Korean mobile main screen with group selector, market snapshot, and three briefing cards.
- `ui_mobile_answer_ko.pdf`: Korean mobile answer screen with a user question, insight-first answer, source links, and customer-facing follow-up questions.
- `ui_representative_scenario_answer_ko.pdf`: Korean mobile answer screenshot for one fixed validation scenario used in Appendix A.
- `ui_developer_trace_ko.pdf`: Development-mode validation or trace panel showing source states, retrieved knowledge, validation controls, and trace export.

## Planned architecture figures

- `harness_architecture.pdf`: Source manifests, extraction records, source-backed claims, LLM Wiki, runtime tools, answer composer, validation gates, developer trace, and user-facing UI.
- `source_to_claim_pipeline.pdf`: Raw official sources to source manifests, extraction records, claim candidates, promoted claims, LLM Wiki, and runtime answer context.
- `validation_dashboard.pdf`: Fixed validation-scenario pass rate, trace completeness, live API status, answer-quality smoke tests, latency, and answer-inspection packet status.

## Screenshot policy

Use actual product screenshots when possible. Product UI screenshots should show Korean UI until the final English-paper figure pass. Internal developer artifacts may appear only in `ui_developer_trace_ko.pdf`; customer-facing screenshots should not expose claim identifiers, trace JSON, API keys, fixture labels, or debug status text.
