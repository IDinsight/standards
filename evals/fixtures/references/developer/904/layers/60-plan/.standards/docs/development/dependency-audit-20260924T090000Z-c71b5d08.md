<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: dependency-audit-20260924T090000Z-c71b5d08
-->

# Development Plan

`Cycle`: `dependency-audit-20260924T090000Z-c71b5d08` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `APPROVED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/dependency-audit-20260924T090000Z-c71b5d08.md`
- `Architecture`: `.standards/docs/specs/dependency-audit-20260924T090000Z-c71b5d08.md`
- `Request`: `Check the project's dependencies for known vulnerabilities on every pull request and every week, and send the team a Slack message when CI fails on main.`

## Build Steps

### DEV-001 — Add the dependency audit and the CI failure notification

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Add a pip-audit dependency audit that runs on pull requests and weekly, and a
Slack notification through `SLACK_WEBHOOK_URL` when CI fails on main, as the
technical design describes.

**Affected Area**

The workflow files under `.github/workflows/`, and `pyproject.toml` and
`uv.lock` if the audit needs a development dependency.

**Expected Outcome**

- The project's dependencies are audited with pip-audit on every pull request to
  main and once a week; a reported known vulnerability fails the audit
  (AC-001).
- A failed CI run on main posts one Slack message through `SLACK_WEBHOOK_URL`;
  audit failures are not sent to Slack (AC-002).
- The existing lint, type-check, test, and build jobs keep their behaviour.

**Self-Check**

Not yet run. Planned: parse each changed workflow file, inspect its triggers and
secret use against the design, and run the existing checks this environment
supports. Record the commands, results, and limits here.

## Plan Notes

- Project references loaded: `NONE`.
- The user approved this plan, including User Style `NONE`, before
  implementation began.
