# Case Study Bot

Drop this into any GitHub repository and it automatically keeps a
running, plain-language changelog — `CASE_STUDY.md` — updated on every
push. One paragraph summary plus a short list of guideline notes per
commit. Anything that looks like a secret is redacted before it's ever
written to that file.

This does exactly one job. It does not lint, test, deploy, or comment
on pull requests — just this.

## Install (2 files, no configuration)

Copy these two files into your repository, preserving the folder path:

```
your-repo/
├── case_study_bot.py
└── .github/
    └── workflows/
        └── case-study.yml
```

Commit and push. That's it — no secrets to add, no dependencies to
install, nothing to configure. The next push (and every push after)
will create or update `CASE_STUDY.md` at your repo's root automatically.

## What it actually does, per push

1. Reads the commit(s) in that push from GitHub's own event data.
2. For each commit, computes what changed (files touched, lines added/
   removed) using plain `git diff` — no external service, no API key.
3. **Scans the commit message and the diff for anything secret-shaped**
   — API keys (OpenAI, Google, AWS, Stripe, GitHub, Slack), JWTs,
   private key blocks, and a generic "keyword: long-random-value"
   pattern that catches most other cases — and redacts every match
   before anything is written to disk.
4. Writes one dated entry to `CASE_STUDY.md`: a summary paragraph, plus
   guideline notes (flags things like "this touched a config-looking
   file" or "this commit message is very short").
5. **Checks first whether that exact commit already has an entry** —
   if a workflow run is retried or manually re-run, already-recorded
   commits are skipped rather than duplicated. Each entry carries a
   hidden marker with the full commit SHA specifically so this check
   is exact, not a fuzzy text match.
6. Commits that file back to the repo using the token GitHub Actions
   already provides — no secret you need to create for this to work.

## Why no AI API call for the paragraph

On purpose. Calling an LLM would produce nicer prose, but it also
means: an API key to configure, a network call that can fail or rate-
limit, and a per-run cost. This tool's whole premise is "drop it into
any repo and it just works" — a zero-dependency, template-based
summary is what makes that actually true. If you want to extend it
with an AI-written paragraph later, `build_paragraph()` in
`case_study_bot.py` is the one function to replace.

## Verified before shipping

This wasn't just written — it was run against a real local git repo
with multiple test commits, including two that deliberately contained
fake secrets (an OpenAI-style key hidden in a file, and a Stripe-style
key written directly in a commit message). Both were confirmed absent
from the generated output before this was packaged up. A first-commit
edge case (nothing to diff against) and a multi-commit single push
were also both exercised and confirmed correct.

**Duplicate protection was tested explicitly**, not just assumed: the
same push event was fed through the script twice in a row (simulating
a manual workflow re-run), and a third run mixed already-recorded
commits with one genuinely new one. In every case, exactly the right
number of entries existed afterward — no duplicates, no missed commits.

## Customizing

- **Redaction patterns** — `SECRET_PATTERNS` near the top of
  `case_study_bot.py`. Add a pattern if your team uses a secret format
  not already covered.
- **Guideline rules** — `build_guidelines()`. Add your own heuristics
  (e.g. flag changes to a specific critical file).
- **Trigger branches** — `case-study.yml`'s `branches: ["**"]` currently
  matches every branch; narrow it to `["main"]` if you only want this
  running on your default branch.
- **`paths-ignore: ["CASE_STUDY.md"]` in the workflow is load-bearing —
  don't remove it.** Without it, the bot's own commit updating that
  file would re-trigger the workflow, forever.
