<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-users-export-a-report-as-csv-with-20260924T081500Z-3f9a6c1e
-->

# Development Plan

`Cycle`: `let-users-export-a-report-as-csv-with-20260924T081500Z-3f9a6c1e` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `IN_PROGRESS` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `docs/scope/report-export.md`
- `Architecture`: `.standards/docs/specs/let-users-export-a-report-as-csv-with-20260924T081500Z-3f9a6c1e.md`
- `Request`: `Let users export a report as CSV, with the report date in the exported filename.`

## Build Steps

### DEV-001 — CSV serialization of a report

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Serialize a report's columns and rows to RFC 4180 CSV.

**Affected Area**

`src/export.js` (new).

**Expected Outcome**

`toCsv(report)` returns the header line and one CRLF-terminated line per row,
quoting values that contain a comma, double quote, CR, or LF and doubling
embedded quotes.

**Self-Check**

`npm test` in the project root on the working tree with `src/export.js` added
(before commit): exit 0, 4 passes, 0 failures. An inline sanity run of `toCsv`
on the `weekly-signups` report printed the header and three rows, with the
comma-containing region quoted and the quotes in the South note doubled.
Developer self-check only; no CSV test suite exists yet.

### DEV-002 — CSV download response and route

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-002`

**Goal**

Serve the CSV as a download at `GET /reports/<id>/export.csv`.

**Affected Area**

`src/export.js` (`csvDownload`), `src/routes.js`.

**Expected Outcome**

A known report id responds 200 with `text/csv; charset=utf-8`, the `toCsv`
body, and a `Content-Disposition` header built from
`attachmentName(report, 'csv')`; an unknown id responds 404 with the existing
JSON error body.

**Self-Check**

Planned: `npm test` plus a sanity call of `handle` for the export path of
`weekly-signups`.
