# Report Export

## Goal

Let users download a report's data as a CSV file so they can work with it in
spreadsheet tools instead of copying it from the dashboard.

## Constraints

- The existing JSON summary download keeps its current behavior.

## Non-goals

- Spreadsheet formats other than CSV, such as `.xlsx`.
- Scheduled, emailed, or bulk exports of several reports at once.

## Work

### 1. CSV report export

**Intent:** Users who analyze report data in spreadsheet tools can get it in a
form those tools open directly.

**Done when:**

- `AC-001`: A user can export a report as a CSV file with a header row and one
  row per report entry.
- `AC-002`: The exported filename includes the report date.

**Depends on:** None

## Assumptions

- Every report has a single report date.
