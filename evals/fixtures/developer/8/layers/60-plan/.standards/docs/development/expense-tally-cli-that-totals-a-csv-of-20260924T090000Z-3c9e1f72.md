<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72
-->

# Development Plan

`Cycle`: `expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72` `Mode`: `STEPWISE`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72.md`
- `Architecture`: `.standards/docs/specs/expense-tally-cli-that-totals-a-csv-of-20260924T090000Z-3c9e1f72.md`
- `Request`: `Expense tally CLI that totals a CSV of expenses by category.`

## Build Steps

### DEV-001 — Ledger parsing module

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Parse an expense CSV stream into entries, keeping the line numbers of rows
whose amount is not a number.

**Affected Area**

New package `tally/`: `tally/__init__.py` (empty) and `tally/ledger.py` with
`Entry` and `read_entries` as defined in the design's Interfaces and Contracts.

**Expected Outcome**

`read_entries` returns `(entries, skipped_lines)`: one `Entry` per row with a
valid `Decimal` amount, in file order, and the CSV line numbers of skipped rows
(the header is line 1).

**Self-Check**

From the project root:
`python3 -c "import io; from tally.ledger import read_entries; print(read_entries(io.StringIO('date,category,amount\n2026-09-01,food,12.50\n2026-09-02,food,abc\n')))"`.
Expect one `Entry` for `food` with amount `Decimal('12.50')` and skipped lines
`[3]`. Not yet run.

### DEV-002 — Category totals and report formatting

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Sum amounts per category and format the report text.

**Affected Area**

`tally/report.py` with `totals` and `format_report`.

**Expected Outcome**

`format_report(totals(entries))` returns one `<category>: <total>` line per
category, sorted by name, with two-decimal totals, each line ending with a
newline.

**Self-Check**

From the project root:
`python3 -c "from decimal import Decimal; from tally.report import format_report; print(format_report({'travel': Decimal('3.005'), 'food': Decimal('12.5')}), end='')"`.
Expect `food: 12.50` followed by `travel: 3.01`. Not yet run.

### DEV-003 — Command-line entry point

`Status`: `PENDING` `Depends On`: `DEV-001, DEV-002` `Acceptance`: `AC-002, AC-004, AC-005`

**Goal**

Wire parsing and reporting into `python3 -m tally <file>` with the stderr
messages and exit codes from the design.

**Affected Area**

`tally/__main__.py`.

**Expected Outcome**

The command prints the report on stdout and exits 0; each skipped row is
reported on stderr; a missing file prints `tally: cannot open <file>` on stderr
and exits 2 with nothing on stdout.

**Self-Check**

Write a sample CSV with one invalid amount to `/tmp/expenses.csv`, then from the
project root run `python3 -m tally /tmp/expenses.csv; echo $?` (expect the
report, one `skipped line` message on stderr, and `0`) and
`python3 -m tally /tmp/missing.csv; echo $?` (expect
`tally: cannot open /tmp/missing.csv` and `2`). Not yet run.
