# Prompts

This folder contains the small policy prompts used at the replaceable language
model composition boundary. Prompts guide tone and evidence policy, but they do
not own company facts, source eligibility, routing, or validation.

Prompts in this project should be concise policy blocks.

Do not place long RAG content, company knowledge, or brittle formatting logic in
system prompts. Use the wiki and deterministic validators instead.

Implemented prompt blocks:

- advisor-role.md
- evidence-policy.md
- output-style.md

These files are loaded by `server/index.mjs` at startup and hashed into the
trace envelope as `promptPolicyHash`.

Runtime-owned responsibilities:

- group/company resolution;
- fixture/fallback/live labeling;
- wiki namespace loading;
- trace envelope construction;
- answer normalization and evidence-status suffixing.

Expansion rule:

- do not add company facts to prompts;
- put target facts in `configs/`, `raw/`, and `wiki/`;
- put deterministic behavior in code validators;
- keep prompts stable across Samsung, SK, Hyundai Motor, LG, and Hanwha unless
  the paper explicitly studies prompt variants.
