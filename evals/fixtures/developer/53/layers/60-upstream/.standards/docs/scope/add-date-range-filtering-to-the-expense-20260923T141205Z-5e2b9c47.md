<!-- STANDARDS
Artifact: SCOPE
Cycle: add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47
-->

# Expense Report Date Range

## Goal

Let people who run the expense report see totals for a chosen period instead of the whole file, so monthly and quarterly summaries no longer need hand-edited copies of the CSV.

## Constraints

- Input dates are ISO `YYYY-MM-DD` strings, as the existing parser already expects.
- Running the report without a date range keeps today's output.

## Non-goals

- Time zones, partial dates such as `2026-03`, and relative ranges.
- Changes to the CSV format or to the report layout.

## Work

### 1. Date-range report

**Intent:** Totals can be limited to an inclusive date range from the command line, with clear errors for bad dates.

**Done when:**

- `AC-001`: Given a start date, an end date, or both, only expenses dated on or between the given dates (inclusive) contribute to the category totals; an omitted date leaves that side of the range open.
- `AC-002`: `report <file> --from YYYY-MM-DD --to YYYY-MM-DD` prints totals for expenses in that range only, and `report <file>` without the options prints the same output as before.
- `AC-003`: When `--from` or `--to` is not a valid `YYYY-MM-DD` date, `report` prints an error naming the option to stderr and exits with status 2 without printing totals.

**Depends on:** None
