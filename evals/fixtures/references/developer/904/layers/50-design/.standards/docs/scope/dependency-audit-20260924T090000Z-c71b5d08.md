<!-- STANDARDS
Artifact: SCOPE
Cycle: dependency-audit-20260924T090000Z-c71b5d08
-->

# Dependency Audit and CI Failure Alerts

## Goal

Known vulnerabilities in billing-api's dependencies should be found routinely
rather than by chance, and the team should learn promptly when CI breaks on
main.

## Constraints

- CI stays on GitHub Actions in this repository.
- Slack messages go to the incoming webhook the team has already created as the
  repository secret `SLACK_WEBHOOK_URL`.

## Non-goals

- Upgrading or pinning dependencies to fix reported vulnerabilities.
- Notifications for branches other than main, or for runs that pass.
- Dependabot or other update automation.

## Work

### 1. Dependency vulnerability audit

**Intent:** Catch known vulnerabilities in the project's dependencies before
they ship and as new advisories are published.

**Done when:**

- `AC-001`: The project's dependencies are checked for known vulnerabilities on
  every pull request and every week.

**Depends on:** None

### 2. CI failure alert

**Intent:** Make a broken main branch visible to the team without anyone
watching the Actions page.

**Done when:**

- `AC-002`: The team gets a Slack message when CI fails on main.

**Depends on:** None
