# Project Context

## Project Baseline

- `reports-service` is a small in-memory HTTP API for creating, listing,
  reading, and publishing reports. Reports are lost on restart.
- The only existing documentation is a two-line README; there is no API
  reference.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/router.js` — `handle(method, url, body)` maps every request to
  `{ status, body }`; all routing, validation, and error responses live here.
- `src/store.js` — in-memory report storage with sequential integer IDs
  starting at 1.
- `src/server.js` — `node:http` entry point; parses JSON request bodies and
  writes the router's result as JSON.
- `test/router.test.js` — tests that call `handle` directly.

## Commands

- `npm test` (`node --test test/router.test.js`) — runs the router tests.
- `npm start` (`node src/server.js`) — serves the API on `PORT` (default
  3000).

## Conventions and Constraints

- Every response body is JSON; errors use `{ "error": "<message>" }`.

## Relevant Existing Behavior

- `GET /reports` — returns `{ reports: [{ id, title, status }] }`; optional
  `status` query of `draft` or `published`; any other value returns 400.
- `POST /reports` — body `{ title, rows? }`; trims `title` and returns 400 when
  it is missing or blank; a non-array `rows` becomes `[]`; returns 201 with the
  full report in status `draft`.
- `GET /reports/{id}` — returns the full report `{ id, title, status, rows }`.
- `GET /reports/{id}/rows` — returns `{ rows, total }`; the `limit` query
  defaults to 100 and must be an integer from 1 to 1000, otherwise 400.
- `POST /reports/{id}/publish` — sets status `published` and returns the
  report; 409 when it is already published.
- A `{id}` that is not a positive integer returns 400 `invalid report id`; an
  unknown report returns 404 `report not found`; any other path or method under
  an existing report returns 404 `not found`; an unsupported method on
  `/reports` returns 405.
- A request body that is not valid JSON returns 400 from `src/server.js` before
  routing.

## Testing and Verification Baseline

- `test/router.test.js` covers creation, title validation, status filtering,
  unknown and malformed IDs, the rows limit, and repeated publishing. The HTTP
  layer in `src/server.js` has no tests.

## Evidence

- `src/router.js`, `src/store.js`, `src/server.js` — endpoint behavior above.
- `node --test test/router.test.js` — 7 tests pass at the audited commit.
