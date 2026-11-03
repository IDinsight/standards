<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-a-format-json-option-to-the-monthly-20260921T141500Z-6c1e9a04
-->

# Development Plan

`Cycle`: `add-a-format-json-option-to-the-monthly-20260921T141500Z-6c1e9a04` `Mode`: `STEPWISE`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Add a --format json option to the monthly expense report; JSON amounts are integer cents.`

## Build Steps

### DEV-001 — Monthly summary as a data object

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

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

`node --test test/money.test.js test/records.test.js test/report.test.js` in the
project root, on the working tree over
`${COMMIT:Plan JSON output for the monthly report}` with the DEV-001 changes
uncommitted: exit 0, 7 tests passed. `node bin/report.js data/sample.csv 2026-08`
printed the same report as the committed version.

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

Earlier run, before the review: `node -e` script in the project root that
rendered `summarizeMonth` of `data/sample.csv` for `2026-08` through
`renderJson` and parsed the result with `JSON.parse`: month, four categories,
and total present. Test command: exit 0, 7 tests passed. That run did not
examine amount types and is superseded by the reopened step.

**Implementation Notes**

Reopened for
`.standards/docs/reviews/add-a-format-json-option-to-the-monthly-20260921T141500Z-6c1e9a04/implementation.md#F-001`:
`renderJson` formats amounts with `formatCents` (strings such as `1,422.45`)
instead of emitting integer cents. The correction stays within the approved
intent of this step.

### DEV-003 — `--format` option for the report command

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Let callers choose the output format of `bin/report.js`.

**Affected Area**

`bin/report.js`.

**Expected Outcome**

`--format json` prints the JSON document; `--format text` or no flag prints the
text report; any other value prints the usage line and exits with status 2.

**Self-Check**

`node bin/report.js data/sample.csv 2026-08 --format json` printed a JSON
document; `--format text` and no flag printed the text report; `--format xml`
printed the usage line and exited 2. Test command: exit 0, 7 tests passed.

**Implementation Notes**

Unaffected by the reopened renderer step: the option only selects the renderer.

## Plan Notes

- Recovery frame 1 (implementation review, IMPLEMENTATION failure) returned the
  work to Developer. Only DEV-002 is reopened; DEV-001 and DEV-003 still meet
  their expected outcomes. Approved intent is unchanged, so no reapproval is
  needed.
- Next action: correct `renderJson` so category and month totals are integer
  cents, rerun the step self-check including amount types, then return to
  implementation review.
