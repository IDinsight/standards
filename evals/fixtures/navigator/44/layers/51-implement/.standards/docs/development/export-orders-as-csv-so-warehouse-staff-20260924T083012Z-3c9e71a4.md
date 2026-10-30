<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4
-->

# Development Plan

`Cycle`: `export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4`
`Mode`: `AUTONOMOUS` `User Style`: `NONE` `User Style Locked`: `true`
`Status`: `COMPLETE` `Verification Cadence`: `AFTER_IMPLEMENTATION`
`Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4.md`
- `Architecture`: `.standards/docs/specs/export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4.md`
- `Request`: `Export orders as CSV so warehouse staff can open them in a spreadsheet.`

## Build Steps

### DEV-001 — CSV serializer

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

A pure `ordersToCsv(orders)` that writes the header and one quoted row per
order.

**Affected Area**

`src/export.js` (new).

**Expected Outcome**

Columns `id,customer,total,placed_at` in the design's order; fields with a
comma, double quote, or line break are quoted and embedded quotes doubled.

**Self-Check**

In the project root on the uncommitted working tree: printed
`ordersToCsv(listOrders(createStore()))` with `node --input-type=module -e`;
output showed `"Lindqvist, Bros."` and `"North ""Pier"" Café"` quoted and
the other fields bare.

### DEV-002 — Route GET /orders.csv

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001`

**Goal**

Serve the CSV from the existing router.

**Affected Area**

`route` in `src/server.js`.

**Expected Outcome**

`GET /orders.csv` returns status 200, type `text/csv`, and the serialized
newest-first list; `GET /orders` is unchanged.

**Self-Check**

`node --test test/orders.test.js test/server.test.js` in the project root on
the uncommitted working tree: exit 0, 4 passed. Called
`route('GET', '/orders.csv', createStore())` from `node --input-type=module -e`:
status 200, type `text/csv`, 4 lines.

## Plan Notes

Approved by the user as proposed; implemented in step order.
