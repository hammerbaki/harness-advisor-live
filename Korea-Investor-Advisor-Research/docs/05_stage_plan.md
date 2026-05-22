# Stage Plan

## Stage A: Research Scaffold

Status: started.

Deliverables:

- clean repository skeleton
- research plan
- architecture note
- reproducibility requirements
- PoC reuse map
- group profile seed config

## Stage B: Inventory and De-Hanwha Mapping

Deliverables:

- file-level inventory of PoC modules
- list of Hanwha-specific constants and assumptions
- proposed `GroupProfile` TypeScript schema
- public-source policy for five groups

Exit criteria:

- no hidden group-specific behavior remains unidentified
- every reusable PoC module has a destination or archive decision

## Stage C: Clean Hanwha Reference Slice

Deliverables:

- deterministic group resolver
- Hanwha public company registry
- wiki namespace seed
- one DART/market/news tool path with fixture mode
- response schema and validators
- minimal web/API demo

Exit criteria:

- offline tests pass without credentials
- live tests are optional and clearly gated
- answer outputs include source trace metadata

## Stage D: Multi-Group Generalization

Deliverables:

- Samsung, SK, Hyundai Motor Group, LG configs
- source manifests for each group
- wiki namespaces for each group
- group selector in UI
- eval scenarios across all groups

Exit criteria:

- adding a group requires config/wiki/source changes, not orchestration edits

## Stage E: Paper Artifact Freeze

Deliverables:

- fixed code tag
- frozen prompts/wiki schema
- evaluation output archive
- paper figures/tables generated from reproducible scripts
- optional Replit demo URL
- local/container reproduction path

