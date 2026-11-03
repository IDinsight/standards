<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: expense-summary-cli-20260924T081500Z-3c9e51a7
-->

# Development Plan

`Cycle`: `expense-summary-cli-20260924T081500Z-3c9e51a7` `Mode`: `CODE_WITH_ME`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/expense-summary-cli-20260924T081500Z-3c9e51a7.md`
- `Architecture`: `.standards/docs/specs/expense-summary-cli-20260924T081500Z-3c9e51a7.md`
- `Request`: `Command-line tool that totals the bank's expenses CSV export by category.`

## Build Steps

### DEV-001 — Read the expenses export

`Status`: `PENDING` `Depends On`: `NONE`
`Acceptance`: `AC-002, AC-003`

**Goal**

Read the bank's CSV export into `Expense` values with exact amounts, rejecting
rows whose amount is missing or not a number.

**Affected Area**

`expenses.py`, a new module at the repository root.

**Expected Outcome**

`read_expenses(path)` returns one `Expense` per data row in file order, with
`amount` as a `Decimal` and trimmed `date` and `category`. A missing, empty, or
non-numeric amount raises `ExpenseError` whose `line` is the row's physical
line number (header is line 1), as the design's Interfaces and Contracts
define.

**Self-Check**

Planned, from the repository root: read `samples/2026-08.csv` with
`python3 -c` and confirm 10 rows with `Decimal` amounts; then read a temporary
copy with a non-numeric amount and confirm `ExpenseError` reports its line.
Not yet run.

### DEV-002 — Category totals and report lines

`Status`: `PENDING` `Depends On`: `DEV-001`
`Acceptance`: `AC-001, AC-002`

**Goal**

Turn the expenses into per-category totals and the report lines.

**Affected Area**

`report.py`: `totals_by_category` and `format_report`.

**Expected Outcome**

Totals are summed as `Decimal`; `format_report` returns `<category>: <total>`
lines quantized to two places and sorted by category name.

**Self-Check**

Planned: call both functions on the sample export from `python3 -c` and compare
the totals with a hand sum. Not yet run.

### DEV-003 — Command-line entry point

`Status`: `PENDING` `Depends On`: `DEV-002`
`Acceptance`: `AC-001, AC-003`

**Goal**

Make `python3 report.py <file.csv>` print the report or fail cleanly.

**Affected Area**

`report.py`: `main(argv)` and the `__main__` guard.

**Expected Outcome**

Exit 0 with the report on a valid export; `error: line N: ...` on stderr and
exit 1 with no totals for an unreadable amount; usage on stderr and exit 2 for
wrong arguments.

**Self-Check**

Planned: run `python3 report.py samples/2026-08.csv` and a broken copy, and
check output and exit statuses. Not yet run.

---

## Plan Notes

- Approved by the user as proposed, in Code With Me with user style `NONE`.
  The user chose to write DEV-001 themselves; Developer reviews it against the
  step before marking it done.
