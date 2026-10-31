<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7
-->

# Technical Design

## Context

The report command (`bin/report.js`) reads one CSV file, parses it with
`parseEntries` (`src/entries.js`), totals minutes per project with `summarize`
(`src/report.js`), and prints `formatReport` output. Entry dates are ISO
`YYYY-MM-DD` strings (see `.standards/CONTEXT.md`).

## Decision

Add an optional `since` filter to `summarize` and a small argument parser in a
new `src/args.js` that the CLI uses. Date validation lives in the parser;
`summarize` trusts its input. ISO dates compare correctly as strings, so no
Date conversion is needed for filtering.

## Acceptance Coverage

- `AC-001`: `summarize(entries, { since })` skips entries whose date is before
  `since`; the CLI passes the parsed `--since` value.
- `AC-002`: `parseArgs` returns `{ error }` for a missing value or one that is
  not a real calendar date in `YYYY-MM-DD` form; the CLI writes the error to
  standard error and exits 2 before reading the file.
- `AC-003`: `since` is undefined when the option is absent, so `summarize` and
  `formatReport` behave as before.

## Interfaces and Contracts

- `parseArgs(argv)` returns `{ file, since }` or `{ error }`; `since` is
  undefined when the option is absent. Exactly one file argument is accepted.
- `summarize(entries, { since } = {})` keeps its existing return shape.
- Exit status 2 for usage errors, matching the existing missing-file usage
  error.

## Technical Acceptance Criteria

- `AC-001`: an entry dated exactly on `since` is counted.
- `AC-002`: impossible calendar dates such as `2026-13-01` are rejected, not
  rolled over to a different day.
- `AC-003`: the output for a file without `--since` is byte-identical to the
  previous release.

## Build Plan

1. MODIFY `src/report.js`: optional `since` filter in `summarize`.
2. CREATE `src/args.js`; MODIFY `bin/report.js` to use it.
