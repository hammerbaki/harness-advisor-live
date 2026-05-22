# Scripts

This folder is the harness operations layer. Scripts turn public sources into
manifests, extraction reports, source-backed claims, validation results, and
release checks so that the agent can be replayed instead of manually recreated.

This directory contains source-processing, validation, evaluation, and local runtime scripts for the reference implementation.

Common commands:

```bash
npm run validate:structure
npm run validate:template
npm run validate:evals
npm run validate:release
npm run eval:advisor
npm run eval:fault-injection
npm run build
```

Live-source scripts may require local credentials in `.env`. Generated local documents and raw extracted text are intentionally excluded from the public repository.
