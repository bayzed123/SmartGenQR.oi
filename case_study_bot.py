#!/usr/bin/env python3
"""
case_study_bot.py

Reads the GitHub "push" event for the current workflow run, builds a
plain-language, secret-redacted summary of what changed, and appends
it to CASE_STUDY.md at the repository root. Creates that file with a
header the first time it runs.

Designed to be dropped into ANY repository with zero configuration:
- No external dependencies — Python standard library only, so there is
  nothing to install and nothing that can go out of date.
- No API key required — everything here is template-based text
  generation from commit metadata, not a call to an external AI
  service. That is a deliberate choice: this tool has exactly one job
  (see below), and a network call to a third-party API is one more
  way a run in someone else's repo could fail.
- Defensive by default — missing fields, a repo's very first commit,
  merge commits, and empty diffs are all handled explicitly rather
  than allowed to crash the run.

This script does ONE job: turn "something changed in this repo" into
a readable paragraph plus a short list of guideline notes, with any
secret-shaped text redacted first. It does not lint, does not test,
does not deploy, does not comment on pull requests. Just this.
"""

import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone

CASE_STUDY_FILE = "CASE_STUDY.md"
EMPTY_TREE_SHA = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"  # git's well-known empty-tree hash
ALL_ZERO_SHA = "0000000000000000000000000000000000000000"

# ---------------------------------------------------------------------
# Secret redaction. Checked BEFORE any commit message or diff content
# is written to the case study file — never after. Deliberately broad:
# a false positive (redacting something harmless) costs nothing; a
# false negative (leaking a real secret into a committed markdown
# file) is the exact failure this exists to prevent.
# ---------------------------------------------------------------------
SECRET_PATTERNS = [
    re.compile(r"AKIA[0-9A-Z]{16}"),                                    # AWS access key id
    re.compile(r"AIza[0-9A-Za-z\-_]{35}"),                              # Google API key
    re.compile(r"sk-[a-zA-Z0-9]{20,}"),                                 # OpenAI-style secret key
    re.compile(r"(sk|pk|rk)_(live|test)_[A-Za-z0-9]{16,}"),            # Stripe-style keys
    re.compile(r"gh[pousr]_[A-Za-z0-9]{36,}"),                         # GitHub personal/app tokens
    re.compile(r"xox[baprs]-[0-9a-zA-Z-]{10,}"),                       # Slack tokens
    re.compile(r"eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+"),  # JWTs
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----"),
    # Generic "name = long-random-value" pattern for anything that
    # LOOKS like a secret assignment, regardless of provider. The
    # [A-Za-z_]* after the keyword is deliberate — it's what lets this
    # match compound names like "secret_key", "api_key_prod", or
    # "client_secret_id", not just the bare keyword itself.
    re.compile(
        r"(?i)(secret|token|password|passwd|pwd|api[_-]?key|access[_-]?key|client[_-]?secret)"
        r"[A-Za-z_]*"
        r"\s*[:=]\s*['\"]?[A-Za-z0-9+/_\-\.]{12,}['\"]?"
    ),
]


def redact(text):
    """Replaces every secret-shaped substring with [REDACTED]. Safe to
    call on already-clean text — it's a no-op if nothing matches."""
    if not text:
        return text
    for pattern in SECRET_PATTERNS:
        text = pattern.sub("[REDACTED]", text)
    return text


# ---------------------------------------------------------------------
# Git plumbing — all output is redacted before use, never printed or
# written raw.
# ---------------------------------------------------------------------

def run_git(args):
    """Runs a git command and returns stdout. Never raises — a git
    command failing (e.g. a SHA that isn't reachable yet in a shallow
    checkout) degrades gracefully to an empty result rather than
    crashing the whole run."""
    try:
        result = subprocess.run(
            ["git"] + args, capture_output=True, text=True, check=False, timeout=30
        )
        return result.stdout or ""
    except Exception:
        return ""


def resolve_sha(sha):
    """The 'before' SHA on a brand-new branch/repo is all zeros — git
    has nothing to diff against, so fall back to the empty-tree hash,
    which every git repo already has and diffs cleanly against."""
    if not sha or sha == ALL_ZERO_SHA:
        return EMPTY_TREE_SHA
    return sha


def get_diff_shortstat(before_sha, after_sha):
    output = run_git(["diff", "--shortstat", resolve_sha(before_sha), after_sha])
    return output.strip()


def get_changed_file_paths(before_sha, after_sha):
    output = run_git(["diff", "--name-only", resolve_sha(before_sha), after_sha])
    return [line for line in output.strip().splitlines() if line]


def get_full_diff_text(before_sha, after_sha):
    # Limited to a reasonable size — this is scanned for secrets and
    # summarized, not stored in full, so there's no need to pull an
    # unbounded diff into memory for a huge commit.
    output = run_git(["diff", resolve_sha(before_sha), after_sha])
    return output[:200_000]


# ---------------------------------------------------------------------
# Guideline heuristics — short, plain-language flags about the change.
# ---------------------------------------------------------------------

SENSITIVE_PATH_HINTS = ["env", "secret", "credential", "config", ".pem", "password", "keyfile"]


def build_guidelines(changed_files, message_first_line):
    notes = []
    lower_paths = [f.lower() for f in changed_files]

    if any(hint in path for path in lower_paths for hint in SENSITIVE_PATH_HINTS):
        notes.append(
            "This update touched one or more files whose names suggest configuration or "
            "secrets — worth a manual check that nothing sensitive was committed in plain text."
        )

    if len(changed_files) > 20:
        notes.append(
            f"Large change ({len(changed_files)} files touched) — a closer review before "
            "deploying is a reasonable precaution."
        )

    if len(message_first_line.strip()) < 10:
        notes.append(
            "The commit message is quite brief — a more descriptive message on future commits "
            "would make this case study more useful to a future reader."
        )

    if not notes:
        notes.append("No specific flags for this update — reads as a routine, well-scoped change.")

    return notes


# ---------------------------------------------------------------------
# Paragraph generation — template-based, not an external AI call, by
# design (see the module docstring for why).
# ---------------------------------------------------------------------

def build_paragraph(author_name, message_first_line, changed_files, shortstat):
    file_count = len(changed_files)
    preview = ", ".join(f"`{f}`" for f in changed_files[:5])
    remainder = f", and {file_count - 5} more file(s)" if file_count > 5 else ""
    stat_text = shortstat if shortstat else "no line-level stats were available for this change"

    if file_count == 0:
        return (
            f"{author_name} pushed a commit — \"{message_first_line}\" — that git reports as "
            f"having no file-level changes against its parent (this can happen with an empty "
            f"commit, a merge with no conflicts, or a metadata-only change)."
        )

    return (
        f"{author_name} pushed a commit described as \"{message_first_line}\". "
        f"It touched {file_count} file(s) ({stat_text}), including {preview}{remainder}."
    )


# ---------------------------------------------------------------------
# Case study file I/O
# ---------------------------------------------------------------------

def ensure_case_study_header():
    if os.path.exists(CASE_STUDY_FILE):
        return
    with open(CASE_STUDY_FILE, "w", encoding="utf-8") as f:
        f.write(
            "# Case Study\n\n"
            "Automatically maintained by `case_study_bot.py` — one entry is appended "
            "per commit, on every push to this repository. Anything that looked like "
            "a secret (API key, token, password, private key) has been redacted before "
            "being written here; see the workflow that runs this script for details.\n"
        )


def append_entry(entry_markdown):
    ensure_case_study_header()
    with open(CASE_STUDY_FILE, "a", encoding="utf-8") as f:
        f.write("\n---\n\n")
        f.write(entry_markdown)
        f.write("\n")


def format_entry(commit_sha, author_name, timestamp_iso, repo_full_name, paragraph, guidelines):
    short_sha = commit_sha[:7] if commit_sha else "unknown"
    lines = [
        # Hidden marker, not rendered by markdown viewers — this is the
        # exact-match key idempotency checks against, so it must stay
        # on its own line, unmodified, in every entry this script writes.
        f"<!-- case-study-bot:sha:{commit_sha} -->",
        f"## Update — {timestamp_iso} (commit `{short_sha}`)",
        "",
        f"**Repository:** {repo_full_name}  ",
        f"**Author:** {author_name}",
        "",
        f"**Summary:** {paragraph}",
        "",
        "**Guidelines / notes:**",
    ]
    for note in guidelines:
        lines.append(f"- {note}")
    return "\n".join(lines)


def load_already_recorded_shas():
    """Returns the set of full commit SHAs already present in
    CASE_STUDY.md, so main() can skip them — this is what makes
    reprocessing the same push (a manual workflow re-run, a retried
    job) a no-op instead of a duplicate entry."""
    if not os.path.exists(CASE_STUDY_FILE):
        return set()
    with open(CASE_STUDY_FILE, "r", encoding="utf-8") as f:
        content = f.read()
    return set(re.findall(r"<!-- case-study-bot:sha:([0-9a-fA-F]+) -->", content))


# ---------------------------------------------------------------------
# Main — reads the GitHub push event and processes each commit in it.
# A single push can contain several commits; this appends one entry
# per commit so the case study stays granular.
# ---------------------------------------------------------------------

def load_push_event():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path or not os.path.exists(event_path):
        return None
    with open(event_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    event = load_push_event()
    repo_full_name = os.environ.get("GITHUB_REPOSITORY", "unknown/repository")

    if not event:
        print("No GITHUB_EVENT_PATH found — nothing to do (this script is meant to run inside a GitHub Actions push event).")
        return 0

    before_sha = event.get("before")
    commits = event.get("commits", [])

    if not commits:
        print("Push event contained no commits (e.g. a branch delete or tag push) — nothing to record.")
        return 0

    already_recorded = load_already_recorded_shas()
    new_entry_count = 0
    skipped_count = 0
    running_before = before_sha

    for commit in commits:
        sha = commit.get("id", "")

        # Idempotency: if this exact commit has already been recorded
        # (e.g. this workflow run is a manual re-run or retry of a push
        # already processed), skip writing it again — but still advance
        # running_before so the NEXT commit in this loop diffs against
        # the correct actual parent, not a stale one.
        if sha in already_recorded:
            skipped_count += 1
            running_before = sha
            continue

        author_name = redact(commit.get("author", {}).get("name") or "unknown author")
        raw_message = commit.get("message", "") or ""
        message_first_line = redact(raw_message.strip().splitlines()[0] if raw_message.strip() else "(no commit message)")
        timestamp = commit.get("timestamp") or datetime.now(timezone.utc).isoformat()

        changed_files = get_changed_file_paths(running_before, sha)
        shortstat = redact(get_diff_shortstat(running_before, sha))

        # Guideline checks run against the original message — a
        # secret-warning suffix appended below must not accidentally
        # mask the "this message is too brief" check by lengthening it.
        guidelines = build_guidelines(changed_files, message_first_line)

        # Full diff text is only used to double check for secrets that
        # file-path/message scanning alone wouldn't catch — it is never
        # itself written into the case study.
        full_diff = get_full_diff_text(running_before, sha)
        display_message = message_first_line
        if full_diff != redact(full_diff):
            display_message += " \u26a0\ufe0f (this commit's diff also contained content matching a secret pattern, redacted from this summary)"

        paragraph = build_paragraph(author_name, display_message, changed_files, shortstat)
        entry = format_entry(sha, author_name, timestamp, repo_full_name, paragraph, guidelines)

        append_entry(entry)
        already_recorded.add(sha)  # so a duplicate SHA later in the same push (rare, but possible) is also caught
        new_entry_count += 1
        running_before = sha  # next commit in this push diffs against this one

    if new_entry_count:
        print(f"Case study updated with {new_entry_count} new entr{'y' if new_entry_count == 1 else 'ies'}.")
    if skipped_count:
        print(f"Skipped {skipped_count} commit(s) already recorded in {CASE_STUDY_FILE} — no duplicates written.")
    if not new_entry_count and not skipped_count:
        print("Nothing new to record.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
