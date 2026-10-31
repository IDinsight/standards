<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: records-csv-export-20260923T141200Z-5c81e0a4
-->

# Development Plan

`Cycle`: `records-csv-export-20260923T141200Z-5c81e0a4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/records-csv-export-20260923T141200Z-5c81e0a4.md`
- `Architecture`: `.standards/docs/specs/records-csv-export-20260923T141200Z-5c81e0a4.md`
- `Request`: `CSV export of all records for administrators; the cycle finishes after implementation review.`

## Build Steps

### DEV-001 — Export permission in the access config

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-003`

**Goal**

Add a `records:export` permission held only by `admin`, so the export can be
checked with the existing `can()` helper.

**Affected Area**

`config/access.json` (MODIFY).

**Expected Outcome**

`can()` returns true for `admin` on `records:export` and false for `manager`,
`member`, and no user.

**Self-Check**

`npm test` in the repository root on the working tree over
`${COMMIT:Record audit, scope, and design for records export}` with this step
applied: exit 0, 6 tests passed. Spot check in `node`: `can()` on
`records:export` returned true only for `admin`.

### DEV-002 — RFC 4180 CSV serializer

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-002`

**Goal**

Provide `toCsv(columns, rows)` for the export.

**Affected Area**

`src/csv.js` (CREATE).

**Expected Outcome**

`toCsv` writes a header line and one CRLF-terminated line per row. Values
containing a comma, double quote, CR, or LF are wrapped in double quotes with
inner quotes doubled; missing values are written empty.

**Self-Check**

Spot check in `node` with a comma value, a value with embedded quotes, and a
two-line value: output quoted as expected. `npm test` in the repository root:
exit 0, 6 tests passed.

### DEV-003 — Export route and handler

`Status`: `DONE` `Depends On`: `DEV-001, DEV-002` `Acceptance`: `AC-001, AC-003`

**Goal**

Serve every record as a CSV attachment to holders of `records:export`.

**Affected Area**

`src/routes.js` (MODIFY).

**Expected Outcome**

`GET /admin/records/export` is registered and served by `exportRecordsHandler`.
An admin gets 200, `text/csv`, attachment `records.csv`, columns
`id,title,owner,notes,updated_at`. Users without `records:export` get 403 with
JSON `{"error":"forbidden"}`.

**Self-Check**

`npm test` in the repository root on the content committed with this plan: exit
0, 6 tests passed (existing tests only; export tests belong to Tester). In
`node`, `dispatch` for `GET /admin/records/export` returned 200 with a header
and 3 record lines for `admin`, and 403 for `member`.

## Plan Notes

Project references loaded: NONE. Steps were implemented in order DEV-001,
DEV-002, DEV-003, with no deviation from the technical design.
