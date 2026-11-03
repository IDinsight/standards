<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7
-->

# Development Plan

`Cycle`: `add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7.md`
- `Architecture`: `.standards/docs/specs/add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7.md`
- `Request`: `Add a --round option to the weekly summary for rounded per-project totals.`

## Build Steps

### DEV-001 — Rounding helper for minute totals

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide `round_minutes(minutes, step)` implementing the design's rounding rule.

**Affected Area**

New module `tally/durations.py`.

**Expected Outcome**

`round_minutes` returns the nearest multiple of `step`, choosing the larger
multiple at an exact half, and raises `ValueError` for a step that is not a
positive integer.

**Self-Check**

Planned: a `python3 -c` spot check of a few values (for example 52 and 53 with
step 15, 5 with step 10) and `python3 -m pytest -q` from the repository root.
Not yet run.

### DEV-002 — Optional rounding in the weekly summary

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Let `weekly_summary` round each project's total when asked, leaving the default
behavior unchanged.

**Affected Area**

`tally/summary.py`.

**Expected Outcome**

`weekly_summary(entries, week_of, round_to=None)` returns today's output when
`round_to` is `None`, and per-project totals rounded with `round_minutes` after
summing when it is set.

**Self-Check**

Planned: `python3 -m pytest -q` from the repository root (existing summary
tests must still pass) and a `python3 -c` call with `round_to=15` on the
example data. Not yet run.

### DEV-003 — `--round` option in the CLI

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-001, AC-003`

**Goal**

Expose rounding on the command line with input validation.

**Affected Area**

`tally/cli.py`.

**Expected Outcome**

`--round N` passes a positive integer through to `weekly_summary`; zero,
negative, or non-integer values produce an argparse usage error with exit
status 2 and no summary output.

**Self-Check**

Planned: `python3 -m tally.cli examples/week.csv --week 2026-09-24`, the same
with `--round 15`, and with `--round 0` and `--round abc` (expect exit 2).
Not yet run.

## Plan Notes

- Approved on 2026-09-24; implementation has not started. Work the steps in
  dependency order.
