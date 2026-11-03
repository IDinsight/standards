<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17
-->

# Development Plan

`Cycle`: `let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17.md`
- `Architecture`: `.standards/docs/specs/let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17.md`
- `Request`: `Let administrators export records as CSV.`

## Build Steps

### DEV-001 — CSV serialization in src/export.js

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-002`

**Goal**

Add `toCsv(rows, columns)` implementing the design's CSV contract.

**Affected Area**

New module `src/export.js`.

**Expected Outcome**

`toCsv` returns a header row followed by one CRLF-terminated line per row.
Fields containing a comma, double quote, CR, or LF are wrapped in double
quotes with inner quotes doubled; missing values are empty cells.

**Self-Check**

Ran a two-row sample through `toCsv` with `node --input-type=module` in the
project root against the uncommitted `src/export.js`: comma, quote, and
line-break fields came back quoted with inner quotes doubled, lines ended with
CRLF, exit 0. Developer inspection only, not formal verification.

### DEV-002 — Admin-only export route

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-003`

**Goal**

Serve `GET /records/export` from `handle`, limited to administrators.

**Affected Area**

`src/routes.js`.

**Expected Outcome**

Administrators get status 200, a CSV body from `toCsv` over
`store.list({ status })`, and the `text/csv` and `records.csv` attachment
headers. Other signed-in users get 403 before the store is read. Existing
routes behave as before; the export route is matched ahead of the
single-record route.

**Self-Check**

`npm test` in the project root on the working tree that became commit
`Add CSV export endpoint`: exit 0, 4 tests passed (listing, single record,
admin-only creation, 401 unchanged). Calling `handle` by hand with an admin and
a member user returned 200 with the `records.csv` headers and 403
respectively.
