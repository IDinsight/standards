<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-json-lines-order-export-20260922T141000Z-5c8e2a41
-->

# Technical Design

## Context

Orders are loaded by `loadOrders` in `src/orders.js` and hold money as integer
cents. `formatCents` in `src/money.js` already produces exact two-digit decimal
strings. There is no export path yet.

## Decision

Add three modules:

- `src/serialize.js`: `serializeOrder(order)` returns one JSON string for one
  order.
- `src/export.js`: `exportOrders(orders, { serialize })` serializes each order
  and joins the results into JSON Lines. `serialize` defaults to
  `serializeOrder`; keeping it a parameter lets a later encoder reuse the line
  handling.
- `src/cli.js`: `node src/cli.js <orders.json>` loads the file and writes the
  export to standard output.

## Acceptance Coverage

- `AC-001`: `serializeOrder` formats `total` and each line `price` with
  `formatCents` and converts `placedAt` with `Date#toISOString`.
- `AC-002`: `exportOrders` maps orders in input order, joins with `\n`, and
  appends a final `\n`.
- `AC-003`: `exportOrders` returns `''` for an empty array.

## Interfaces and Contracts

- Serialized order: `{ id, customer, total, placedAt, lines: [{ sku, quantity,
  price }] }`; `total` and `price` are strings from `formatCents`; `placedAt`
  is the UTC string from `toISOString`.
- `formatCents` errors (non-integer cents) propagate; the export does not catch
  them.

## Technical Acceptance Criteria

- `AC-001`: For an order with `totalCents: 1999` and `placedAt:
  2026-09-01T10:15:00+02:00`, `serializeOrder` yields `total` `19.99` and
  `placedAt` `2026-09-01T08:15:00.000Z`.
- `AC-002`: Output for N orders has N newline-terminated lines.
- `AC-003`: Output for no orders is the empty string.

## Build Plan

1. Serializer on top of `formatCents`.
2. `exportOrders` and the CLI wrapper.
