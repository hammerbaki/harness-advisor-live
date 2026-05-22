# PoC Reuse Map

Source snapshot:

```text
../HanWha-Advisor-main
```

This map identifies what should be reused, rewritten, or archived from the PoC.

## Reuse With Refactoring

| PoC Area | Proposed Destination | Notes |
| --- | --- | --- |
| `lib/corp-codes` | `src/groups`, `configs/groups.json` | Keep as deterministic registry logic, but generalize beyond Hanwha. |
| DART service code | `src/tools/dart` | Preserve API knowledge; remove product-specific fallback behavior. |
| finance adapters | `src/tools/market` | Keep interface ideas; normalize provider fallback policy. |
| news adapter/ranking | `src/tools/news` | Keep as optional live tool with fixture mode. |
| regression validators | `src/validators`, `evals` | High value for paper contribution. |
| OpenAPI/Zod patterns | `src/api`, `tests` | Keep schema-first discipline. |
| selected UI shell | `src/ui` | Rebuild around group selector and research demo needs. |

## Rewrite

| PoC Area | Reason |
| --- | --- |
| giant system prompt and inline RAG | Split into short prompts plus wiki/context retrieval. |
| in-memory chat turn store | Not reproducible or multi-instance safe; replace or isolate for local demo. |
| Replit-specific runtime assumptions | Keep only as optional demo deployment. |
| debug endpoints mixed with product paths | Separate research eval, ops, and user-facing APIs. |
| hardcoded active entity/group behavior | Replace with typed group-scoped request context. |

## Archive Only

| PoC Area | Reason |
| --- | --- |
| `attached_assets/Pasted-*` | Historical development traces, not clean artifact inputs. |
| screenshots | Useful for paper appendix/history, not source of truth. |
| exports zip/tar files | Avoid nested source archives in clean repo. |
| mockup sandbox duplicate UI kit | Archive unless a component is intentionally selected. |

## First Extraction Target

The first clean implementation should extract only:

1. group/company registry shape,
2. DART identifier validation idea,
3. one public-data tool interface,
4. response schema,
5. two or three validators,
6. minimal UI showing group selection and advisor output.

Avoid moving large folders wholesale. Every imported file should answer a
specific research or reproducibility need.

