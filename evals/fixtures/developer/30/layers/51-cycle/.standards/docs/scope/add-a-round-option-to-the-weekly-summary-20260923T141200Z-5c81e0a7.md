<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-round-option-to-the-weekly-summary-20260923T141200Z-5c81e0a7
-->

# Weekly Summary Rounding

## Goal

Let people who bill in fixed increments get a weekly summary whose per-project
totals are already rounded, without changing the summary for anyone who does
not ask for rounding.

## Constraints

- The JSON shape of the weekly summary stays the same; only the `minutes`
  values change when rounding is requested.

## Non-goals

- Rounding individual entries before they are summed.
- Changing how entries are read from CSV or how weeks are determined.

## Work

### 1. Optional rounding of weekly totals

**Intent:** Users who invoice in fixed blocks of time can read billable totals
directly from the summary.

**Done when:**

- `AC-001`: Running `tally <csv> --round N` reports each project's weekly
  minutes rounded to the nearest multiple of N, with exact halves rounded up.
- `AC-002`: Running `tally <csv>` without `--round` produces the same output as
  before this change.
- `AC-003`: `--round` with zero, a negative number, or a non-integer value is
  rejected with a usage error and exit status 2, and no summary is printed.

**Depends on:** None
