<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e
-->

# Development Plan

`Cycle`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
- `Architecture`: `.standards/docs/specs/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
- `Request`: `Add per-project hour totals to the weekly report.`

## Build Steps

### DEV-001 — Week range helper

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-003`

**Goal**

Expose the Monday and Sunday of the week that contains a date.

**Affected Area**

`src/report.js` (`weekRange`), reusing `weekStart` and `addDays` from
`src/week.js`.

**Expected Outcome**

`weekRange('2026-09-17')` returns `{ start: '2026-09-14', end: '2026-09-20' }`.

**Self-Check**

In the project root:
`node -e 'import("./src/report.js").then((m) => console.log(m.weekRange("2026-09-17")))'`
printed `{ start: '2026-09-14', end: '2026-09-20' }`.

### DEV-002 — Per-project totals for a week

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Group the selected week's entries by project and total their hours.

**Affected Area**

`src/report.js` (`projectTotals`).

**Expected Outcome**

`projectTotals(entries, date)` returns `{ project, hours }` rows rounded to two
decimals, largest first and ties by name; entries outside the week are skipped.

**Self-Check**

In the project root, `projectTotals` called through `node -e` with entries on
2026-09-14 (atlas 2.5), 2026-09-16 (beacon 4), and 2026-09-21 (atlas 1) for
2026-09-16 printed `[ { project: 'beacon', hours: 4 }, { project: 'atlas', hours: 2.5 } ]`.

### DEV-003 — `--by-project` option

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `AC-001`

**Goal**

Let `report` print the per-project lines when asked.

**Affected Area**

`src/cli.js` (`run`, usage text).

**Expected Outcome**

`report <file> <date> --by-project` prints the existing total line, then one
indented line per project. Without the flag the output is unchanged; any other
extra argument prints usage with exit code 2.

**Self-Check**

`npm test` in the project root on the working tree over
`${COMMIT:Record project context, scope, and design for per-project totals}`:
exit 0, 6 tests passed (existing output unchanged). `run` called by hand with an
inline CSV and `--by-project` printed the total, then `  beacon: 4 h` and
`  atlas: 2.5 h`.
