<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-format-json-option-to-the-monthly-20260921T141500Z-6c1e9a04
-->

# Development Plan

`Cycle`: `add-a-format-json-option-to-the-monthly-20260921T141500Z-6c1e9a04` `Mode`: `STEPWISE`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a --format json option to the monthly expense report; JSON amounts are integer cents.`

## Build Steps

### DEV-001 — Monthly summary as a data object

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Separate computing a month's totals from formatting them, so the same summary
can be rendered as text or JSON.

**Affected Area**

`src/report.js`; new `src/summary.js` and `src/render.js`.

**Expected Outcome**

`summarizeMonth(records, month)` returns the month, its categories sorted by
name with integer-cent totals, and the month total in cents. `renderText(summary)`
produces exactly the existing text report, and `monthlyReport` keeps its
signature and output.

**Self-Check**

Planned: `node --test test/money.test.js test/records.test.js test/report.test.js`
in the project root, and a text run of `bin/report.js` on `data/sample.csv`
compared with the current output.

### DEV-002 — JSON renderer

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Render a monthly summary as a JSON document that other tools can consume.

**Affected Area**

`src/render.js`.

**Expected Outcome**

`renderJson(summary)` returns a JSON document with the month, each category's
name and total, and the month total; every amount is an integer number of cents.

**Self-Check**

Planned: render the sample month through `renderJson` and parse it with
`JSON.parse`; rerun the test command.

### DEV-003 — `--format` option for the report command

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let callers choose the output format of `bin/report.js`.

**Affected Area**

`bin/report.js`.

**Expected Outcome**

`--format json` prints the JSON document; `--format text` or no flag prints the
text report; any other value prints the usage line and exits with status 2.

**Self-Check**

Planned: run `bin/report.js` on `data/sample.csv` with each format and with an
unknown one; rerun the test command.

## Plan Notes

None.
