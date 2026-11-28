Follow [AGENTS.md](AGENTS.md) for app setup, checks, and stack decisions.

## Workspace

This repo is self-contained: its code, docs, and glossary are the whole picture. Work from what is here; reach outside the repo only when the user points you there or the task cannot be done without it.

Worktrees live in one place: `.claude/worktrees/<name>` under the main checkout (gitignored), the same spot Claude Code's own worktree tools use. Manual ones: `git worktree add .claude/worktrees/<name> -b <branch>`.

## Agent skills

### Issue tracker

GitHub Issues on SiddharthMuramkar/valueit, via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default labels: needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.
