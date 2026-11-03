# Project Context

## Project Baseline

- Small Node.js service that lists analytics reports and serves downloads for
  them. Reports are held in memory in `src/reports.js`.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime
  dependencies.

## Structure and Boundaries

- `src/reports.js` — report data: `id`, `title`, `date` (`YYYY-MM-DD`),
  `columns`, `rows`.
- `src/routes.js` — `handle(method, path)` maps request paths to handlers that
  return `{ status, headers, body }`.
- `src/summary.js` — JSON summary of a report and its download response.
- `src/http/attachment.js` — `attachmentName(report, ext)` builds
  `<title-slug>-<date>.<ext>`; `contentDisposition(filename)` builds the header
  value.
- `docs/scope/` — project-owned planning notes for features.

## Commands

- `npm test` — runs `node --test` on the files listed in `package.json`.

## Conventions and Constraints

- Downloads set `Content-Disposition` through `src/http/attachment.js`.
- Unknown report ids return 404 with `{ "error": "not found" }`.

## Testing and Verification Baseline

- `node:test` suites in `test/`: `summary.test.js` (totals, JSON attachment,
  404) and `attachment.test.js` (filename format). No CSV coverage exists.

## Relevant Existing Behavior

- `GET /reports/<id>/summary` downloads `<title-slug>-<date>.json`; this must
  keep working unchanged.

## Evidence

- `src/http/attachment.js`, `src/summary.js`, `test/summary.test.js` — download
  naming and headers.
- `npm test` — passes on the audited revision (4 tests).
