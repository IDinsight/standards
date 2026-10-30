<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-administrators-export-records-as-csv-20260921T141200Z-5b8e2f17
-->

# Technical Design

## Context

All routes live in `handle` in `src/routes.js` and return
`{ status, headers, body }`. Records come from the in-memory store, whose
`list({ status })` already filters by status. `isAdmin` in `src/auth.js` is the
existing authorization rule for writes.

## Decision

Add `GET /records/export` to `handle` and put CSV serialization in a new
`src/export.js` module exporting `toCsv(rows, columns)`. The route reuses
`store.list({ status })` so the filter behaves exactly like the listing. No
new dependency: CSV writing is small and its quoting rules are fixed.

## Acceptance Coverage

- `AC-001`: `GET /records/export` with an optional `status` query parameter
  passed to `store.list`; the response sets
  `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="records.csv"`.
- `AC-002`: `toCsv` writes a header row from the column list, then one line
  per record, applying the quoting contract below.
- `AC-003`: the route checks `isAdmin(user)` before reading the store and
  returns 403 with the usual `{ error }` JSON body.
- `AC-004`: No architectural impact — Documenter updates
  `docs/admin-guide.md`.

## Interfaces and Contracts

- Route: `GET /records/export`, query `status` optional. Must be matched
  before the `GET /records/<id>` prefix route.
- Columns, fixed order: `id`, `name`, `email`, `status`, `createdAt`.
- CSV: lines end with CRLF, including the last line. A field containing a
  comma, double quote, CR, or LF is wrapped in double quotes and each inner
  double quote is doubled. `null` or missing values are empty cells.

## Technical Acceptance Criteria

- `AC-001`: The export returns every record matching the optional `status`
  filter, in store order, with the two headers above.
- `AC-002`: The first line is the header row; quoting follows the CSV contract
  above for every field, header included.
- `AC-003`: Non-administrators get 403 and the store is not read.

## Build Plan

1. Add `src/export.js` with `toCsv`.
2. Add the export route to `src/routes.js` ahead of the single-record route.

## Risks and Follow-up

- The whole file is built in memory; acceptable at current record counts.
