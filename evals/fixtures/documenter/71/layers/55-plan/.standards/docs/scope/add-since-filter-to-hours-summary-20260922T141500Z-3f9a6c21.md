<!-- STANDARDS
Artifact: SCOPE
Cycle: add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21
-->

# Hours Summary Start Date

## Goal

Let users limit the hours summary to recent work, so weekly reporting no longer
requires trimming the log file by hand.

## Constraints

- Existing `hours summary` output and exit codes stay unchanged when no start
  date is given.
- Dates use the `YYYY-MM-DD` form already used by log entries.

## Non-goals

- An end date or other filters.
- Changes to the log file format.

## Work

### 1. Limit the summary to entries from a start date

**Intent:** Weekly reporting needs totals for recent work only.

**Done when:**

- `AC-001`: With a start date, the summary totals only entries dated on or
  after that date; without one, the totals are unchanged.
- `AC-002`: `hours summary --since YYYY-MM-DD` applies the start date; a
  missing or malformed date prints an error, prints no totals, and exits with
  status 2.

**Depends on:** None
