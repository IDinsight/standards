<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47
-->

# Development Plan

`Cycle`: `add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47` `Mode`: `STEPWISE`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `INCREMENTAL`
`Current Increment`: `2`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47.md`
- `Architecture`: `.standards/docs/specs/add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47.md`
- `Request`: `Add date-range filtering to the expense report.`

## Build Steps

### DEV-001 — Inclusive date-range filter for parsed expenses

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Provide `filterByDate(expenses, { from, to })` so callers can restrict parsed expenses to an inclusive date range before computing totals.

**Affected Area**

`src/expenses.js` (new named export next to `parseExpenses` and `totalsByCategory`).

**Expected Outcome**

`filterByDate` returns a new array with only the expenses dated on or after `from` and on or before `to`; an omitted bound is open; the input array is not modified; the existing exports behave as before.

**Self-Check**

- `node --test test/expenses.test.js test/report.test.js` in the project root, on the working tree with `filterByDate` added to `src/expenses.js` (uncommitted, on top of the audited baseline): exit 0, 5 tests passed, 0 failed.
- `node -e` sanity check in the project root: filtering `data/sample.csv` with from `2026-03-01` and to `2026-03-31` returned the three March rows (2026-03-02, 2026-03-15, 2026-03-28).
- Limitation: the existing tests do not exercise `filterByDate`; formal coverage is Tester's.

### DEV-002 — `--from` and `--to` options on the report command

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Let `report <file>` take optional `--from` and `--to` dates and apply `filterByDate` before totals are computed.

**Affected Area**

`bin/report.js` (argument parsing with `node:util` `parseArgs`, as the design specifies).

**Expected Outcome**

`node bin/report.js data/sample.csv --from 2026-03-01 --to 2026-03-31` prints totals for the three March rows only; running without the options prints exactly the current output.

**Self-Check**

Planned: the filtered command above and the unfiltered command in the project root, comparing the unfiltered output with the current output; `node --test` on the existing test files.

### DEV-003 — Reject invalid `--from` and `--to` dates

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Validate both options with `isIsoDate` before the input file is read.

**Affected Area**

`src/expenses.js` (`isIsoDate` export) and `bin/report.js`.

**Expected Outcome**

An option value that is not a real `YYYY-MM-DD` date (for example `2026-02-30` or `03/01/2026`) prints the design's error message naming the option to stderr and exits with status 2 without printing totals.

**Self-Check**

Planned: `node bin/report.js data/sample.csv --from 2026-02-30` and `node bin/report.js data/sample.csv --to 03/01/2026` in the project root, checking stderr and exit status 2; `node --test` on the existing test files.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

`filterByDate` in `src/expenses.js` restricts parsed expenses to an inclusive date range with open bounds, and totals computed from its result include only those expenses.

### Increment 2

`Development Steps`: `DEV-002, DEV-003` `Acceptance`: `AC-002, AC-003`

**Ready Outcome**

The report command accepts `--from` and `--to`, prints totals only for the selected range, keeps the unfiltered output unchanged, and exits with status 2 and a message naming the option for an invalid date.

## Plan Notes

- The user approved this plan in Stepwise mode with user style `NONE` before DEV-001 started. Increment 1 covers DEV-001; Increment 2 groups the two command-line steps.
- Increment 1 came back from Tester as VERIFIED (see the Increment Assessments table in `.standards/docs/verification/add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47.md`). Reconciled on return: `src/expenses.js` is unchanged since the assessed commit, Tester added `test/filter.test.js` and listed it in the `npm test` script, and no earlier behavior is affected. Current Increment moved to 2.
- Stepwise pause: DEV-002 is the next step and waits for the user's go-ahead.
