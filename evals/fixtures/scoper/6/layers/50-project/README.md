# reports

Report listing and downloads for the analytics dashboard. Handlers return
`{ status, headers, body }` objects; `src/routes.js` maps request paths to them.

Run the tests with `npm test`.

## Downloads

- `GET /reports` lists available reports.
- `GET /reports/<id>/summary` downloads a JSON summary named
  `<title-slug>-<report-date>.json`.
