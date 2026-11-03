<!-- STANDARDS
Artifact: SCOPE
Cycle: build-a-small-command-line-tool-tally-20260924T083000Z-3c9e51a7
-->

# tally: monthly expense summary

## Goal

Give a user a quick month-by-month view of their spending from an exported
expense CSV file, without opening a spreadsheet.

## Constraints

- A command-line tool run locally against one CSV file at a time.
- Input rows carry `date`, `category`, and `amount` columns.

## Non-goals

- Editing, storing, or importing expenses anywhere.
- Currency conversion, budgets, or forecasts.
- Charts or any graphical output.

## Work

### 1. Monthly summary

**Intent:** Turn a raw expense export into a readable per-month breakdown of
spending by category.

**Done when:**

- `AC-001`: Running tally on a CSV file whose header row names the `date`,
  `category`, and `amount` columns prints a summary to standard output.
- `AC-002`: The summary has one line per calendar month that has at least one
  expense, in date order, showing the total for each category in that month;
  months with no expenses do not appear.
- `AC-004`: Every amount in the summary is rounded to two decimal places.

**Depends on:** None

### 2. Imperfect input

**Intent:** Real exports contain incomplete rows; the user still needs a
summary of the usable data.

**Done when:**

- `AC-003`: Invalid rows are handled gracefully.

**Depends on:** Work item 1

## Assumptions

- Input files are UTF-8 text with a single header row.
