# Release Checklist

Use this checklist before pushing the repository to GitHub or citing it in the paper.

## Repository

- [ ] Create a GitHub repository named `enterprise-llm-agent-harness`.
- [ ] Confirm `.env`, API keys, raw source archives, and old PoC snapshots are absent.
- [ ] Run a secret scan over the release folder.
- [ ] Run `npm run validate:release` from `Korea-Investor-Advisor-Research/`.
- [ ] Rebuild `arxiv-paper/main.pdf`.
- [ ] Commit the release with a stable version tag or commit hash.

## Paper

- [ ] Replace `https://github.com/REPLACE-WITH-PUBLIC-REPOSITORY` in `arxiv-paper/bib/references.bib`.
- [ ] Add the final commit hash to the repository citation note if desired.
- [ ] Rebuild the PDF after replacing the repository placeholder.
- [ ] Verify every figure/table reference resolves.
- [ ] Verify Korean UI screenshots are intentionally described as implementation examples.

## Suggested Git Commands

```bash
git init
git add .
git commit -m "Initial release: traceable enterprise LLM agent harness"
git branch -M main
git remote add origin https://github.com/<user-or-org>/enterprise-llm-agent-harness.git
git push -u origin main
```
