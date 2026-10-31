<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: records-csv-export-20260923T141200Z-5c81e0a4
-->

# Technical Design

## Context

Brownfield `records-api` (see `.standards/CONTEXT.md`). Handlers live in
`src/routes.js` and authorize through `can()` against `config/access.json`. No
project references apply.

## Decision

- Serve the export from a new route, `GET /admin/records/export`, handled by
  `exportRecordsHandler` in `src/routes.js` beside the existing handlers.
- Authorize it with a new permission, `records:export`, granted to `admin` only
  in `config/access.json`, following the convention that features are gated by
  a named permission.
- Serialize with a small `toCsv(columns, rows)` in a new `src/csv.js`; no
  dependency is added.

## Acceptance Coverage

- `AC-001`: `exportRecordsHandler` behind `GET /admin/records/export`; fixed
  column list; header row, then one line per record from `listRecords()`.
- `AC-002`: quoting rules of `toCsv` in `src/csv.js`.
- `AC-003`: `records:export` held only by `admin`; the handler returns 403
  before reading records.

## Interfaces and Contracts

- `GET /admin/records/export` returns 200 with
  `content-type: text/csv; charset=utf-8` and
  `content-disposition: attachment; filename="records.csv"`; columns
  `id,title,owner,notes,updated_at`; CRLF line endings with a trailing CRLF.
- Without `records:export`: 403 with JSON `{"error":"forbidden"}` and no record
  data.

## Technical Acceptance Criteria

- `AC-001`: The route key `GET /admin/records/export` maps to
  `exportRecordsHandler`; the body is the header line followed by exactly one
  line per stored record.
- `AC-002`: A value containing a comma, double quote, CR, or LF is wrapped in
  double quotes with each inner quote doubled; other values are written
  unchanged; missing values are empty.
- `AC-003`: `config/access.json` lists only `admin` under `records:export`; any
  other role, or no user, gets 403.

## Build Plan

1. MODIFY `config/access.json`: add `records:export` for `admin`.
2. CREATE `src/csv.js`: `toCsv(columns, rows)`.
3. MODIFY `src/routes.js`: add `exportRecordsHandler` and register the route.

## Risks and Follow-up

- The export loads every record in memory; acceptable for the current store.
