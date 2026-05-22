# Frozen Scenarios And Client Questions

Implementation date: 2026-05-01

## Clarification

Frozen scenarios do not limit the app to fixed questions. They are evaluation
anchors.

The advisor can receive real client questions, but real questions must still
pass through the same architecture:

```text
question -> group/profile routing -> source-backed claims -> wiki context ->
tool outputs -> answer -> trace JSON
```

If a client question asks for a claim that has no verified source-backed
support, the correct behavior is not to improvise. The answer should disclose
the evidence gap, cite what is available, and ask for or trigger the bounded
source package needed to answer the question.

## Why Frozen Scenarios Are Needed

Frozen scenarios provide:

- regression tests when prompts, source manifests, or APIs change;
- paper-ready examples with known expected claim IDs;
- a stable screenshot and trace set for arXiv-style demonstration;
- a baseline for comparing later live API and LLM behavior.

They are analogous to benchmark cases, not a product limitation.

## Real Client Operation

Real client questions should be logged separately from paper scenarios and
should include:

- anonymized question or question hash;
- client or workspace identifier;
- source permissions and confidentiality level;
- selected source-backed claims;
- answer trace and runtime mode;
- unresolved evidence gaps;
- user feedback or follow-up action.

This is the right path for the later SCI paper. The arXiv/demo paper can show
the reconstructed method and traceable template. The later SCI paper can add
evidence from real deployed usage across actual client organizations.

## Expansion To Four More Groups

Applying the Hanwha template to Samsung, SK, Hyundai Motor, and LG should make
the rules more robust. The expected pattern is:

1. copy the scenario structure;
2. add group-specific identifiers;
3. collect bounded official source packages;
4. promote source-backed claims;
5. generate wiki pages;
6. run the same frozen scenario validation;
7. only then connect live APIs and client-specific workflows.

The paper strength is not that Hanwha logic is duplicated. The strength is that
the same source-to-claim-to-trace template can be repeated across different
large Korean business groups without rebuilding the UI or hiding knowledge in a
long prompt.
