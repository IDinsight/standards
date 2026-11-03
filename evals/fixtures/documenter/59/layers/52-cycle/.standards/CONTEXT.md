# Project Context

## Project Baseline

- `billing` is a small Node.js invoice API: read-only JSON endpoints and a CSV
  export over an in-memory invoice list.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/invoices.js`: invoice data and lookups (`listInvoices`,
  `findInvoice`); dates are `Date` objects and amounts are integer cents.
- `src/routes.js`: `handle(method, url)` returns `{ status, headers, body }`
  for each endpoint and maps invoices to JSON.
- `src/csv.js`: CSV export (`invoicesToCsv`).
- `docs/api/invoices.md`: invoice API guide. `docs/conventions.md`:
  conventions for JSON endpoints.

## Commands

- `npm test`: runs `node --test` on `test/routes.test.js` and
  `test/csv.test.js`.

## Conventions and Constraints

- JSON responses use snake_case fields, wrap lists in `{"invoices": [...]}`,
  and report errors as `{"error": "<message>"}` with a 4xx status.

## Testing and Verification Baseline

- node:test suites in `test/` cover listing, the status filter,
  single-invoice lookup and 404, and the CSV header and quoting.

## Relevant Existing Behavior

- `GET /invoices` and `GET /invoices/{id}` return `issued_at` via
  `toISOString()` and `amount_cents` as an integer.
- `GET /invoices/export.csv` returns all invoices with a header row.

## Evidence

- `src/routes.js`, `src/invoices.js`, `test/routes.test.js`; `npm test` from
  the repository root exited 0.
