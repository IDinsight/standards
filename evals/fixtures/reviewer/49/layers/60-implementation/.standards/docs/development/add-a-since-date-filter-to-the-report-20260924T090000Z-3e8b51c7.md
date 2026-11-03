<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7
-->

# Development Plan

`Cycle`: `add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7.md`
- `Architecture`:
  `.standards/docs/specs/add-a-since-date-filter-to-the-report-20260924T090000Z-3e8b51c7.md`
- `Request`: `Add a --since date filter to the report command.`

## Build Steps

### DEV-001 — Optional since filter in summarize

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

`summarize` accepts an optional `since` date and leaves out earlier entries.

**Affected Area**

`src/report.js`.

**Expected Outcome**

`summarize(entries, { since })` counts only entries dated on or after `since`;
`summarize(entries)` returns the same totals as before.

**Self-Check**

`node --test test/report.test.js` in the project root on the working tree
before commit: exit 0, 4 tests passed.

### DEV-002 — --since argument parsing and validation in the CLI

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

The report command accepts `--since YYYY-MM-DD` and rejects invalid values as
a usage error.

**Affected Area**

`src/args.js` (new), `bin/report.js`.

**Expected Outcome**

`parseArgs` returns `{ file, since }` or `{ error }`; the CLI exits 2 with the
error on standard error and no report for an invalid or missing value, and
passes `since` to `summarize` otherwise.

**Self-Check**

`npm test` in the project root on the working tree before commit: exit 0,
8 tests passed. Manual run of `node bin/report.js --since 2026-02-30
test/data/entries.csv`: exit 2, `report: invalid --since date: 2026-02-30`.

## Plan Notes

- Project references loaded: `NONE`.
