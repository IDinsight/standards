<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4
-->

# Technical Design

## Context

Requests are dispatched through `route(method, pathname, store)` in
`src/server.js`, which returns `{ status, type, body }`; `listOrders(store)` in
`src/orders.js` already gives the newest-first order used by `GET /orders`.

## Decision

Add a serializer module `src/export.js` exporting `ordersToCsv(orders)`, and a
`GET /orders.csv` branch in `route` that serializes `listOrders(store)`. No
streaming: the order list is small and held in memory.

## Acceptance Coverage

- `AC-001`: `route` branch for `GET /orders.csv` returning status 200, type
  `text/csv`, and `ordersToCsv(listOrders(store))`; fixed column order in
  `ordersToCsv`.
- `AC-002`: field quoting rule in `src/export.js` (see Interfaces and
  Contracts).
- `AC-003`: No architectural impact — README documentation is Documenter work.

## Interfaces and Contracts

- `ordersToCsv(orders) -> string`: header `id,customer,total,placed_at`, then
  one row per order from `id`, `customer`, `total`, `placedAt`, in the given
  order. Rows are joined with `\n`; no trailing newline.
- Quoting: a field is wrapped in double quotes when it contains a comma, a
  double quote, or a line break (CR or LF); embedded double quotes are doubled.

## Technical Acceptance Criteria

- `AC-001`: The JSON route and its response stay byte-for-byte unchanged.
- `AC-002`: Quoting applies to every field, including the header.

## Build Plan

1. Serializer in `src/export.js`.
2. Route branch in `src/server.js`.
