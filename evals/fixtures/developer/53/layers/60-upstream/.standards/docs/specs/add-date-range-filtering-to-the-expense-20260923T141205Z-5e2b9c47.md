<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-date-range-filtering-to-the-expense-20260923T141205Z-5e2b9c47
-->

# Technical Design

## Context

`expenses` is a dependency-free Node.js 22 ES-module command (see `.standards/CONTEXT.md`). `parseExpenses` keeps dates as ISO `YYYY-MM-DD` strings, `totalsByCategory` aggregates, and `bin/report.js` wires them to `formatReport`. The scope adds an optional inclusive date range.

## Decision

- Filter parsed expenses with a new pure function in `src/expenses.js`, applied in `bin/report.js` between parsing and aggregation. ISO date strings compare correctly as strings, so filtering needs no `Date` objects.
- Parse command-line options with the built-in `node:util` `parseArgs`; no new dependency.
- Validate option values before reading the input file so an invalid range never prints partial output.

## Acceptance Coverage

- `AC-001`: `filterByDate(expenses, { from, to })` in `src/expenses.js`; inclusive bounds, either bound optional.
- `AC-002`: `--from` and `--to` string options in `bin/report.js`, passed to `filterByDate` before `totalsByCategory`; no options means no filtering.
- `AC-003`: `isIsoDate(value)` in `src/expenses.js`, checked in `bin/report.js` for each supplied option; error to stderr and exit status 2.

## Interfaces and Contracts

- `filterByDate(expenses, { from, to } = {})` returns a new array and keeps an expense when `from` is undefined or `date >= from`, and `to` is undefined or `date <= to`. It does not mutate its input.
- `isIsoDate(value)` is true only for `YYYY-MM-DD` strings that name a real calendar date; `2026-02-30` is false.
- `report <file> [--from YYYY-MM-DD] [--to YYYY-MM-DD]` prints `Invalid --from date: <value>` or `Invalid --to date: <value>` to stderr and exits 2 on an invalid value; the existing usage error and output layout are unchanged.

## Technical Acceptance Criteria

- `AC-001`: Bounds are inclusive and compared as ISO strings; an omitted bound does not filter.
- `AC-002`: Output without options is identical to the current output.
- `AC-003`: Validation happens before the input file is read; nothing is printed to stdout for an invalid value.

## Build Plan

1. Add `filterByDate`.
2. Add the `--from` and `--to` options to the report command.
3. Add `isIsoDate` and the option validation.

## Alternatives

- Filtering inside `parseExpenses`: rejected; it would mix parsing with selection and change an existing export's signature.
