<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-users-export-a-report-as-csv-with-20260924T081500Z-3f9a6c1e
-->

# Technical Design

## Context

Scope: `docs/scope/report-export.md`. The service already serves a JSON summary
download (`src/summary.js`) whose filename and `Content-Disposition` header come
from `src/http/attachment.js`. Reports carry `title`, `date` (`YYYY-MM-DD`),
`columns`, and `rows`. No CSV support exists.

## Decision

Add a CSV serializer and a download handler beside the summary download, reuse
the existing attachment helpers for the filename and header, and route
`GET /reports/<id>/export.csv` through `handle()`. No dependency is added;
quoting follows RFC 4180.

## Acceptance Coverage

- `AC-001`: `toCsv(report)` in `src/export.js` (RFC 4180 quoting, CRLF line
  endings, header row from `report.columns`) and the
  `GET /reports/<id>/export.csv` route returning it as a `text/csv` attachment.
- `AC-002`: The CSV attachment name comes from the existing
  `attachmentName(report, 'csv')` helper in `src/http/attachment.js`, which
  already produces `<title-slug>-<YYYY-MM-DD>.csv` from `report.date`; no new
  filename logic.

## Components

- `src/export.js` — `toCsv(report)` and `csvDownload(report)`.
- `src/routes.js` — new export path; existing paths unchanged.
- `src/http/attachment.js` — reused as is.

## Interfaces and Contracts

- `toCsv(report)`: header line from `report.columns`, then one line per entry
  in `report.rows` with values in column order; every line ends with CRLF. A
  value containing a comma, double quote, CR, or LF is wrapped in double quotes
  with embedded quotes doubled; `null` and `undefined` become empty fields.
- `csvDownload(report)`: status 200, `Content-Type: text/csv; charset=utf-8`,
  `Content-Disposition` from `contentDisposition(attachmentName(report, 'csv'))`,
  body `toCsv(report)`.
- `GET /reports/<id>/export.csv`: `csvDownload` for a known id; 404 with the
  existing JSON error body otherwise.

## Technical Acceptance Criteria

- `AC-001`: For a known report the route responds 200 with
  `Content-Type: text/csv; charset=utf-8` and a body whose first line is the
  column header followed by one CRLF-terminated line per row, quoted as above.
- `AC-001`: An unknown report id responds 404 with the existing JSON error body.
- `AC-002`: `Content-Disposition` is
  `attachment; filename="<attachmentName(report, 'csv')>"`.

## Build Plan

1. Implement `toCsv` in `src/export.js`.
2. Add `csvDownload` and the export path in `src/routes.js`.

## Risks and Follow-up

- Large reports are serialized in memory; acceptable for current report sizes.
