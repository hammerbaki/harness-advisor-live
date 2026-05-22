# Reproducibility Requirements

## Minimum Standard

A reader should be able to:

1. clone the repository,
2. install dependencies,
3. run deterministic tests,
4. run sample offline evaluations,
5. inspect source manifests,
6. reproduce the paper tables/figures from saved outputs.

## Live Dependencies

Live API calls should be optional and clearly marked. Examples:

- DART OpenAPI
- KRX data
- news APIs
- hosted LLM providers

When credentials are absent, tests should use fixtures instead of failing
ungracefully.

## Artifact Rules

- Do not commit secrets.
- Do not commit large binary exports unless they are part of the paper artifact.
- Keep demo screenshots separate from source data.
- Every generated artifact should include the command that generated it.
- Use fixed random seeds where applicable.

## Deployment Guidance

Replit is acceptable for an interactive paper demo. It should not be the only
reproducibility path. The clean artifact should support local execution and a
containerized deployment path.

