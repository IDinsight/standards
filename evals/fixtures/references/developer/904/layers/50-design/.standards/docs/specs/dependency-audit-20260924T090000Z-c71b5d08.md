<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: dependency-audit-20260924T090000Z-c71b5d08
-->

# Technical Design

## Context

The scope asks for a recurring dependency vulnerability check (AC-001) and a
Slack alert when CI fails on main (AC-002). Per `.standards/CONTEXT.md`, the
project is uv-managed with a committed `uv.lock`, and CI is a single workflow,
`.github/workflows/ci.yml`, with the jobs lint, type-check, test, and build on
pushes and pull requests to main. The team has created the repository secret
`SLACK_WEBHOOK_URL`.

## Decision

- Dependency audit: run pip-audit against the project's dependencies on every
  pull request to main and once a week. The audit fails when pip-audit reports a
  known vulnerability. How pip-audit is installed and which version runs are left
  to Developer.
- CI failure notification: when CI fails on main, post a short message to the
  team's Slack channel through the incoming webhook stored in the repository
  secret `SLACK_WEBHOOK_URL`. Audit failures are not sent to Slack.
- Keep workflow permissions read-only; grant nothing beyond what a job needs.

## Acceptance Coverage

- `AC-001`: pip-audit dependency audit on pull requests and weekly (Decision,
  dependency audit).
- `AC-002`: Slack notification through `SLACK_WEBHOOK_URL` when CI fails on main
  (Decision, CI failure notification).

## Interfaces and Contracts

- `SLACK_WEBHOOK_URL`: a Slack incoming-webhook URL, read only through the
  Actions secrets context; never printed, logged, or committed.
- Slack message: plain text naming the repository and linking to the failed run.

## Technical Acceptance Criteria

- `AC-001`: A pull request to main runs the audit; a weekly run audits the
  default branch; a reported known vulnerability fails the audit.
- `AC-002`: A failed CI run on main produces one Slack message; runs that pass
  produce none; audit failures produce none.

## Build Plan

1. `.github/workflows/` — CANDIDATE: add the dependency audit and the CI failure
   notification.
2. `pyproject.toml`, `uv.lock` — CANDIDATE: only if the audit needs a
   development dependency.

## Risks and Follow-up

- `uv.lock` cannot be regenerated where uv and the package index are
  unavailable.
- The weekly trigger, the secret, and Slack delivery can be observed only in
  GitHub Actions after merge.
