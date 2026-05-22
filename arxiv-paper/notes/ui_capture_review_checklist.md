# UI Capture and Answer Review Checklist

Generated: 2026-05-09

This checklist defines what must be true before a product screenshot is used in
the arXiv paper.

## Screenshots to Capture

1. Mobile main briefing screen
   - Shows Korean UI until the final English figure pass.
   - Shows group selector, logo, market snapshot, and three briefing cards.
   - Cards should contain enough information to look like a real product screen,
     but should not be overloaded with duplicate source labels.

2. Mobile answer screen
   - Shows one realistic user question.
   - Answer starts with reader-facing insight, not a process trace.
   - Includes source links and customer-facing follow-up questions.
   - Does not expose claim IDs, trace JSON, API keys, fixture labels, or internal
     validation labels.

3. Developer trace or validation screen
   - Clearly appears as a developer/research surface.
   - May show retrieved knowledge count, source states, trace export, validation
     controls, and source-link packages.
   - Must not include API keys or private local file paths.

4. Optional validation dashboard
   - Shows system-level metrics only.
   - Must not imply investment performance, customer satisfaction, or commercial
     effectiveness.

## Answer Quality Checks

- The first section should give a useful interpretation, not explain how data
  was collected.
- Tone should be professional and consistent; avoid mixing formal and casual
  styles.
- Avoid recommendation language such as buy, sell, target price, guaranteed
  upside, or investment decision.
- Follow-up questions must be customer-facing, not research-log or paper-writing
  prompts.
- Source links should be visible where they help trust, but technical source
  state should stay in the developer view.

## Screenshot Rejection Rules

Reject or retake the screenshot if it shows:

- API keys, secrets, local absolute paths, or private identifiers.
- Raw trace JSON as the main customer-facing answer.
- Claim IDs or fixture/fallback labels in the customer answer.
- Placeholder text that makes the product look unfinished.
- Duplicated labels that crowd the UI without adding meaning.
- Inconsistent terminology between cards, answers, and source links.
