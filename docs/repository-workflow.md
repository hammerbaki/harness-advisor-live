# Repository Workflow (Single Source of Truth)

As of public-baseline-v0.2, this Git repository is the single source of truth
for the project. The earlier split between a local development folder and a
mirrored "artifact repository" is retired; development, validation artifacts,
and paper-cited results all live here.

## Rules

- All changes land as Git commits in this repository. No out-of-band file
  copies into or out of the repository.
- CI (`.github/workflows/ci.yml`) runs typecheck, release validation, and the
  static demo build on every push and pull request.
- Paper-cited numbers must reference a tag (for example `public-baseline-v0.2`)
  or a commit hash, plus the artifact path under `evals/`.
- When reported numbers, scenarios, manifests, or figures change: rerun the
  relevant checks, update `CHANGELOG.md`, bump `VERSION`, and tag.
- Never let a validation run overwrite a committed, cited result artifact as a
  side effect. Redirect `eval:*` / `quality:*` output to a scratch path, or use
  read-only checks. See [`live-run-safety.md`](live-run-safety.md).

## Release checklist

1. `npm ci && npm run typecheck && npm run validate:release && npm test && npm run validate:paper-stats`
2. Update `CHANGELOG.md` and `VERSION`.
3. Commit, tag (`git tag public-baseline-vX.Y`), push with `--tags`.
4. Create a GitHub Release from the tag.
5. Archive the release on Zenodo (GitHub-Zenodo integration) to mint a DOI,
   and cite tag + DOI in the paper.

## Historical environments

- The original Replit PoC (`HanWha-Advisor` era) and the private development
  folder are historical and read-only. They are not inputs to this repository.
