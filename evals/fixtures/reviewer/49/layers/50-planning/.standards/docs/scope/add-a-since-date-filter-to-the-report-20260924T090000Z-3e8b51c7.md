<!-- STANDARDS
Artifact: SCOPE
Cycle: add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7
-->

# Report Date Filter

## Goal

Let users limit the time report to recent entries by giving a start date, so
they can total hours for the current week or month without editing the input
file.

## Constraints

- Existing invocations without the new option must keep producing the same
  output.
- Dates use the ISO `YYYY-MM-DD` form already used in entry files.

## Non-goals

- An end date or date range.
- Filtering by project.
- Changes to the entry file format.

## Work

### 1. Start-date filter for the report command

**Intent:** Users can total hours from a given day onward.

**Done when:**

- `AC-001`: `report --since YYYY-MM-DD <file>` counts only entries dated on or
  after the given date.
- `AC-002`: An invalid or missing `--since` value makes the command exit with
  status 2, print an error to standard error, and print no report.
- `AC-003`: Without `--since`, the report output is unchanged.

**Depends on:** None
