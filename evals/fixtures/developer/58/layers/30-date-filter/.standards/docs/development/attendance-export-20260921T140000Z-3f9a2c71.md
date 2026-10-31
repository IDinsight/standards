<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: attendance-export-20260921T140000Z-3f9a2c71
-->

# Development Plan

`Cycle`: `attendance-export-20260921T140000Z-3f9a2c71` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `INCREMENTAL` `Current Increment`: `2`

## Implementation Contract

- `Scope`: `.standards/docs/scope/attendance-export-20260921T140000Z-3f9a2c71.md`
- `Architecture`: `.standards/docs/specs/attendance-export-20260921T140000Z-3f9a2c71.md`
- `Request`: `CSV export of attendance records with date-range and site filters.`

## Build Steps

### DEV-001 — Unfiltered attendance CSV export

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Export every record as CSV with the fixed header.

**Affected Area**

`src/export.js` (new), using `csvLine` from `src/csv.js`.

**Expected Outcome**

`exportAttendance(records)` returns the header line
`date,site,participant,present,notes` followed by one CRLF-terminated line per
record, with `present` written as `yes` or `no`.

**Self-Check**

`node --test test/csv.test.js` from the project root at
`${COMMIT:Add attendance CSV export}`: exit 0, 4 passed. A sanity run with
`node --input-type=module -e` importing `./src/export.js` and exporting two
sample records printed the header and two rows, with the comma-containing note
quoted.

### DEV-002 — Inclusive date-range filter

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002`

**Goal**

Limit the export to an inclusive `from`/`to` date range.

**Affected Area**

`src/export.js`.

**Expected Outcome**

`exportAttendance(records, { from, to })` keeps records dated on or after
`from` and on or before `to`; an omitted bound does not filter, and calls
without options behave as before.

**Self-Check**

`node --test test/csv.test.js test/export.test.js` from the project root on the
saved working tree with this step applied (only `src/export.js` modified since
`${COMMIT:Add attendance export tests}`): exit 0, 6 passed. A sanity run
exporting three records dated 2026-09-01, 2026-09-02, and 2026-09-03 with both
bounds set to 2026-09-02 printed the header and only the 2026-09-02 row; with
only the lower bound 2026-09-02 it printed the last two rows.

### DEV-003 — Site filter

`Status`: `PENDING` `Depends On`: `DEV-002` `Acceptance`: `AC-003`

**Goal**

Limit the export to one site when a site name is given.

**Affected Area**

`src/export.js`.

**Expected Outcome**

`exportAttendance(records, { site })` keeps only records whose `site` equals
the trimmed requested name; the site filter combines with the date range.

**Self-Check**

Planned: `node --test test/csv.test.js test/export.test.js` plus a sanity run
filtering sample records by site, alone and with a date range.

## Verification Increments

### Increment 1

`Development Steps`: `DEV-001` `Acceptance`: `AC-001`

**Ready Outcome**

The unfiltered export produces the header and one quoted row per record.

### Increment 2

`Development Steps`: `DEV-002` `Acceptance`: `AC-002`

**Ready Outcome**

The export can be limited to an inclusive date range, with either bound
optional, while unfiltered calls keep their earlier output.

### Increment 3

`Development Steps`: `DEV-003` `Acceptance`: `AC-003`

**Ready Outcome**

The export can be limited to one site, alone or together with a date range.

## Plan Notes

- Project references loaded: NONE.
- Tester returned the first increment as VERIFIED; the date-range increment is
  handed to Tester. The site filter follows once that assessment returns.
