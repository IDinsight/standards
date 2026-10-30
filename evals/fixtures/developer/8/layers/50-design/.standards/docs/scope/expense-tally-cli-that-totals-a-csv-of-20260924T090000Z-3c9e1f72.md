<!-- STANDARDS
Artifact: SCOPE
Cycle: expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72
-->

# Expense Tally CLI

## Goal

Give people a quick way to see how much they spent per category from a CSV
export of their expenses, without opening a spreadsheet.

## Constraints

- Runs on a standard Python 3 installation with no third-party packages.
- Input is a UTF-8 CSV file with a header row containing `date`, `category`,
  and `amount` columns.

## Non-goals

- Currency conversion, budgets, or filtering by date.
- Creating or editing expense files.

## Work

### 1. Read expense files

**Intent:** Turn an exported expense file into usable records while tolerating
the occasional malformed row that exports contain.

**Done when:**

- `AC-001`: Every data row with a numeric amount is counted.
- `AC-002`: A row whose amount is not a number is skipped and reported on
  standard error with its line number; the remaining rows are still counted.

**Depends on:** None

### 2. Category totals report

**Intent:** Show the spending breakdown the user is after.

**Done when:**

- `AC-003`: The output has one line per category, `<category>: <total>`,
  sorted by category name, with totals shown to two decimal places.

**Depends on:** 1

### 3. Command-line entry point

**Intent:** Make the tool usable from a terminal and from scripts.

**Done when:**

- `AC-004`: `python3 -m tally <file>` prints the report and exits with status 0.
- `AC-005`: When the file does not exist, the command prints an error to
  standard error and exits with status 2.

**Depends on:** 1, 2

## Assumptions

- Amounts use a period as the decimal separator and carry no currency symbol.
