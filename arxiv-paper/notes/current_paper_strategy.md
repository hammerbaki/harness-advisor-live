# Current Paper Strategy

Generated: 2026-05-09

## Position

The paper should be framed as a method/demo paper, not as a completed
commercial investment-advice system.

The strongest framing is:

- several enterprise AI-agent PoCs were developed in a 10-week CEOAI AI
  leadership program;
- one investment-briefing PoC was selected for productization research;
- the contribution is the reconstruction from a prompt-heavy demonstration into
  a source-backed, traceable, reproducible LLM-agent harness;
- the original hosted demo is useful background: the paper should describe the
  transition from rapid cloud demonstration hosting to a version-controlled
  repository as motivation for reproducibility, without turning the paper into
  a platform comparison;
- the system is validated at the harness level, not at the customer-impact or
  investment-performance level.

## Safe Claims

- A prompt-heavy enterprise PoC can be reconstructed into a traceable
  source-backed agent architecture.
- The current implementation covers a controlled 25-company reference slice:
  Samsung, SK, Hyundai Motor, LG, and Hanwha, five listed companies per group.
  Group selection follows the 2026 Korean business-group asset ranking reported
  from Fair Trade Commission designation results; affiliate selection follows
  the first-slice policy in `Korea-Investor-Advisor-Research/configs/first-slice-selection-policy.json`.
- The runtime manifests currently contain 113 source-backed claims, with a
  compact 25-claim review-approved layer.
- Frozen scenario contract checks, referential-integrity checks, live API
  smoke tests, live answer-quality smoke tests, and an answer-inspection packet
  are available as system-level evidence.
- The prior Electronics paper is relevant as an earlier simultaneous deployment
  study of AI agents; this paper extends that trajectory toward enterprise
  hardening and traceable productization.
- The ElizaOS paper is citable as an arXiv/system reference for the agent
  operating-system framework used in the prior Electronics study, but not as a
  financial-domain baseline or peer-reviewed effectiveness benchmark.
- References reused from the Electronics paper should be limited to directly
  relevant agentic-AI and agent-orchestration work. Broad social-media,
  persona, Discord, chatbot, and Web3 references should not be imported unless a
  later section specifically needs them.
- Multi-agent and harness claims should be supported primarily by journal or
  peer-reviewed survey literature when possible: classical agent foundations,
  LLM-agent surveys, software engineering for AI-based systems, ML lifecycle
  assurance, and MLOps. Conference/arXiv/software citations are acceptable only
  when they refer to recent LLM-agent implementations or concrete tools used in
  the engineering discussion.

## Unsafe Claims

- The system is commercially ready.
- The system improves investment decisions.
- The system provides formal investment advice.
- The answer-inspection packet proves answer usefulness or expert acceptance.
- Live API smoke tests prove long-run production reliability.

## Next Paper Tasks

1. Replace the UI screenshot placeholders with actual product captures after
   the Korean UI is stabilized: mobile main screen, insight-first answer screen,
   and developer trace panel.
2. Decide whether to include a small architecture diagram.
3. Tighten the abstract if the paper needs to fit a shorter arXiv style.
4. Revisit references from Zotero before final submission and deduplicate
   software repository citations against formal papers when available.
   Karpathy's LLM Wiki gist and autoresearch repository are acceptable for
   arXiv v1 as engineering-pattern references, but a journal revision should
   either complement them with peer-reviewed work or state clearly that they are
   cited as software/pattern artifacts rather than empirical evidence.
5. For arXiv v1, keep component checks to referential integrity and routing
   evidence already present in the artifacts. Reserve larger runtime ablations
   for a journal version if deployment and review resources allow.
6. Keep SCI-level operational claims out of the arXiv draft.

## arXiv Submission Notes

- Target category recommendation: primary `cs.SE`, with `cs.AI` and `cs.CL`
  cross-listing if the submission interface allows it and the final abstract
  still emphasizes LLM agents and RAG. This matches the paper's main claim as a
  software-engineering pattern rather than a new model or benchmark.
- Placeholder figures and tables are the main arXiv blocker. Replace them
  before v1; larger ablations can wait for a later version.
- Check endorsement before submission. arXiv may require endorsement for a
  first submission or a new category. Check whether Moonsoo Kim has recent
  arXiv submissions in the relevant computer-science endorsement domain.
- License recommendation for the current strategy: use the arXiv non-exclusive
  license unless the target journal confirms that a Creative Commons license is
  compatible with later submission.
- Repository recommendation: create a private project repository before
  submission, remove credentials and copyrighted raw PDFs, then insert the
  public GitHub URL in the Reproducibility subsection before arXiv v1.

## Figure Capture Policy

The UI screenshots should be treated as implementation evidence, not as user
impact evidence. Customer-facing screenshots must show reader-facing insight,
source links, and follow-up questions, but must not expose claim identifiers,
trace JSON, API keys, fixture labels, or debugging status. Development
screenshots may show trace and validation panels only when the caption clearly
marks them as developer/research surfaces.
