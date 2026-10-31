<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: summary-month-filter-20260922T131500Z-6c1e9a40
-->

# Technical Design

## Context

Scope
`.standards/docs/scope/summary-month-filter-20260922T131500Z-6c1e9a40.md`;
project context `.standards/CONTEXT.md`. The CLI is a single `run()` function
in `src/cli.js`; totals come from `totalsByCategory` and `formatTotals` in
`src/summary.js`.

## Decision

- `src/cli.js` accepts an optional `--month <value>` after the file argument.
  A valid value is a four-digit year, a hyphen, and a two-digit month from 01
  to 12. Any other value writes
  `Invalid --month value "<value>"; expected YYYY-MM` to stderr, writes
  nothing to stdout, and returns 2. Other options are usage errors (exit 2).
- `src/summary.js` gains `inMonth(entries, month)`, keeping entries whose
  `date` starts with `<month>-`. The filter runs before `totalsByCategory`;
  formatting is unchanged.

## Acceptance Coverage

- `AC-001`: `inMonth` applied before `totalsByCategory`; output through the
  existing `formatTotals`.
- `AC-002`: month validation in `run()` (year and month 01 to 12) with the
  expected-format message and exit 2, before any totals are written.

## Interfaces and Contracts

- Command line: `ledger summary <file> [--month YYYY-MM]`.
- `inMonth(entries, month)`: `month` is an already validated `YYYY-MM`
  string; returns a new array.

## Technical Acceptance Criteria

- `AC-001`: Only entries whose date has the requested year and month
  contribute to the totals.
- `AC-002`: Values not matching `YYYY-MM`, or with a month outside 01 to 12,
  return 2 and write nothing to stdout.

## Build Plan

1. MODIFY `src/summary.js`: add `inMonth`.
2. MODIFY `src/cli.js`: option parsing, validation, and filtering.
