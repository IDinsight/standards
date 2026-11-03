<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21
-->

# Technical Design

## Context

Aggregation lives in `src/summary.js` and argument handling in `src/cli.js`
(see `.standards/CONTEXT.md`). Entries carry zero-padded `YYYY-MM-DD` dates.

## Decision

Add an optional `since` to `summarize` and a `--since <date>` option to the
`summary` command. Dates are compared as strings, which orders zero-padded
`YYYY-MM-DD` values correctly and avoids time-zone handling.

## Acceptance Coverage

- `AC-001`: `summarize(entries, { since } = {})` in `src/summary.js` skips
  entries whose `date` sorts before `since`; with `since` undefined every entry
  is counted as before.
- `AC-002`: `run` in `src/cli.js` parses `--since <date>` after `summary`,
  validates it, and passes it to `summarize`.

## Interfaces and Contracts

- `summarize(entries, options)`: `options.since` is an optional `YYYY-MM-DD`
  string. Return shape is unchanged.
- `run(argv, entries, write)`: `summary [--since YYYY-MM-DD]`. A value is valid
  when it matches `^\d{4}-\d{2}-\d{2}$` and `Date.parse` accepts it. An invalid
  or missing value writes `invalid --since date: <value>` and returns 2 before
  any totals. Other arguments keep printing usage and returning 1.

## Technical Acceptance Criteria

- `AC-001`: an entry dated exactly `since` is counted.
- `AC-002`: on an invalid or missing value, `run` returns 2 and writes only the
  error line.

## Build Plan

1. MODIFY `src/summary.js`: optional `since` filter.
2. MODIFY `src/cli.js`: parse and validate `--since`; update the usage line.
