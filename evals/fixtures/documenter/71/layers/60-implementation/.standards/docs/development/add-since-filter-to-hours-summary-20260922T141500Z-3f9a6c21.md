<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21
-->

# Development Plan

`Cycle`: `add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21` `Mode`:
`AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true` `Status`:
`COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`:
`NONE`

## Implementation Contract

- `Scope`:
  `.standards/docs/scope/add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21.md`
- `Architecture`:
  `.standards/docs/specs/add-since-filter-to-hours-summary-20260922T141500Z-3f9a6c21.md`
- `Request`: `Add a --since option to the hours summary.`

## Build Steps

### DEV-001 — Start-date filter in summarize

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

`summarize` accepts an optional `since` and counts only entries dated on or
after it.

**Affected Area**

`src/summary.js`.

**Expected Outcome**

`summarize(entries, { since: '2026-09-15' })` omits entries dated before
2026-09-15; `summarize(entries)` returns the same totals as before.

**Self-Check**

`npm test` in the project root on the working tree with the DEV-001 change:
exit 0, 4 passing (existing tests). Ad-hoc `node -e` call with the three
entries from `test/summary.test.js` and `since` 2026-09-15 returned atlas 2
and billing 1.5.

### DEV-002 — --since option on the summary command

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

`hours summary --since YYYY-MM-DD` passes the date to `summarize`; a missing
or malformed value is rejected with status 2.

**Affected Area**

`src/cli.js` (usage line and argument loop).

**Expected Outcome**

`run(['summary', '--since', '2026-09-15'], ...)` prints only matching totals
and returns 0; `run(['summary', '--since'], ...)` writes
`invalid --since date: ` and returns 2 with no totals.

**Self-Check**

`npm test` in the project root on the working tree with DEV-001 and DEV-002:
exit 0, 4 passing. Ran `HOURS_FILE=/tmp/h.json node bin/hours.js summary --since 2026-9-1`;
printed the error line, exit status 2.

## Plan Notes

- Plan approved by the user before implementation; no deviations.
- Project references loaded: NONE.
