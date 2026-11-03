<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: expense-summary-cli-20260924T081500Z-3c9e51a7
-->

# Technical Design

## Context

Greenfield project with no existing code. Python 3 standard library only. The
input is the bank's CSV export described in `.standards/CONTEXT.md`.

## Decision

Two flat modules at the repository root: `expenses.py` reads the export and
`report.py` computes totals, formats them, and is the command-line entry point.
Amounts are `decimal.Decimal` end to end so totals are exact; a flat layout
keeps `python3 report.py <file>` working without packaging.

## Acceptance Coverage

- `AC-001`: `report.totals_by_category` groups amounts by category;
  `report.format_report` emits one line per category sorted by name;
  `report.main` prints them.
- `AC-002`: amounts are parsed as `Decimal` in `expenses.py` and summed as
  `Decimal`; output is quantized to two places.
- `AC-003`: `expenses.read_expenses` raises `ExpenseError` with the file line
  number; `report.main` prints the error to stderr and returns 1 before any
  output.

## Components

- `expenses.py` — reading the export: `Expense`, `ExpenseError`,
  `read_expenses`.
- `report.py` — totals, formatting, and the command-line entry point.

## Interfaces and Contracts

- `Expense(date: str, category: str, amount: Decimal)`: one data row; `date`
  and `category` are whitespace-trimmed strings.
- `read_expenses(path) -> list[Expense]`: opens the file as UTF-8 with
  `newline=''` and reads it with `csv.DictReader`; returns rows in file order.
- `ExpenseError(line, message)`: raised for a missing, empty, or non-numeric
  amount; `line` is the physical line number in the file, counting the header
  as line 1; `str()` is `line <line>: <message>`.
- `totals_by_category(expenses) -> dict[str, Decimal]`.
- `format_report(totals) -> list[str]`: lines `<category>: <total>` with the
  total quantized to `0.01`, sorted by category.
- Command line: `python3 report.py <file.csv>`; exit 0 on success; on
  `ExpenseError`, print `error: <ExpenseError>` to stderr and exit 1; on wrong
  arguments, print usage to stderr and exit 2.

## Technical Acceptance Criteria

- `AC-002`: no conversion to `float` anywhere on the amount path.
- `AC-003`: the reported line number is the physical file line of the
  offending row.

## Build Plan

1. `expenses.py` reader and error type.
2. Totals and formatting in `report.py`.
3. Command-line entry point and exit statuses in `report.py`.
