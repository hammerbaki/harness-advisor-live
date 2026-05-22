---
title: "Korea Investor Advisor Wiki Log"
group_id: "all"
company_id: ""
source_status: "draft"
last_checked: "2026-05-01"
confidence: "low"
---

# Wiki Log

## [2026-05-01] scaffold | LLM wiki runtime connection

- Added index/log pattern based on the LLM Wiki architecture.
- Runtime now loads bounded wiki context from `wiki/groups/<group>/`.
- Prompt policy was moved into short prompt files.
- Execution-mode labeling remains code-owned, not prompt-owned.

## [2026-05-01] inventory | Hanwha local IR source candidates

- Added a local-source inventory step for `../hanhwa_knowledge`.
- Classified official issuer material separately from analyst reports.
- Kept local PDFs outside the repository and recorded them through manifest
  metadata before extraction.

## [2026-05-01] extract | Hanwha official PDF extraction report

- Added an official-PDF extraction report that records page counts, text hashes,
  and extraction status without committing full extracted text.
- Full-text markdown extraction is available only as local review output under
  `raw/extracted/`.

## [2026-05-01] backlog | Hanwha RAG markdown claim candidates

- Converted the previous Hanwha RAG markdown summary into verification
  candidates.
- Old RAG prose now enters the wiki workflow as `needs_source_link` backlog
  items, not as source-backed runtime knowledge.
