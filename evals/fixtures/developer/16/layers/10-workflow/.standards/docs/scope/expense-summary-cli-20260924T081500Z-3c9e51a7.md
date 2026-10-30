<!-- STANDARDS
Artifact: SCOPE
Cycle: expense-summary-cli-20260924T081500Z-3c9e51a7
-->

# Expense Summary CLI

## Goal

Give a quick per-category view of a month's spending from the CSV export the
bank provides, without opening a spreadsheet.

## Constraints

- Input is the bank's CSV export: header row `date,category,amount`,
  comma-separated, UTF-8 (see `samples/2026-08.csv`).
- Runs with a stock Python 3 install; no third-party packages.

## Non-goals

- Budgets, charts, or filtering by date range.
- Writing or modifying CSV files.

## Work

### 1. Per-category totals

**Intent:** Show where the month's money went, one category at a time.

**Done when:**

- `AC-001`: Running the tool on a valid export prints one line per category
  with the category name and its total, ordered by category name.
- `AC-002`: Totals are exact to the cent, with no rounding drift from adding
  many amounts.

**Depends on:** None

### 2. Unreadable rows

**Intent:** A broken export must not produce misleading totals.

**Done when:**

- `AC-003`: When a row's amount is missing or not a number, the tool prints an
  error naming that row's line number in the file and exits with status 1
  without printing totals.

**Depends on:** 1
