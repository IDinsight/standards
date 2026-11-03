<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4
-->

# Technical Design

## Context

Orders live in the in-memory store from `src/orders.js`, whose `list()` already
sorts by id and filters by status. Route handlers in `src/http.js` return
`{ status, headers, body }`; unknown statuses already produce a 400 JSON error.

## Decision

Add a serializer module `src/export.js` with `ordersToCsv(orders)` and a route
handler `handleExport(store, query)` in `src/http.js` beside `handleOrders`.
Lines end with CRLF, including the last line, as RFC 4180 describes. Totals
reuse `formatCents`.

## Acceptance Coverage

- `AC-001`: Fixed column list in `src/export.js`; rows come from `store.list()`, which sorts by id.
- `AC-002`: A per-value quoting function in `src/export.js`.
- `AC-003`: `formatCents` from `src/money.js` for the total column.
- `AC-004`: `handleExport` validates `query.status` against `STATUSES` before listing, reusing the existing 400 response.

## Interfaces and Contracts

- `ordersToCsv(orders)`: returns CSV text; columns `id`, `customer`, `status`,
  `total`, `created_at` (from `createdAt`).
- `handleExport(store, query)`: 200 with `content-type: text/csv; charset=utf-8`
  and `content-disposition: attachment; filename="orders.csv"`; 400 with
  `content-type: application/json` and body `{ "error": "unknown status: <value>" }`.

## Technical Acceptance Criteria

- `AC-002`: A value is quoted only when it contains a comma, double quote, CR, or LF.
- `AC-004`: Status validation happens before any CSV is produced.

## Build Plan

1. Serializer in `src/export.js`.
2. Route handler in `src/http.js`.
