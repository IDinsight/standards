<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4
-->

# Development Plan

`Cycle`: `let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4.md`
- `Architecture`: `.standards/docs/specs/let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4.md`
- `Request`: `Let staff export orders as CSV, optionally filtered by status.`

## Build Steps

### DEV-001 — Serialize orders as CSV

`Status`: `DONE` `Depends On`: `NONE`
`Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Turn a list of orders into RFC 4180 CSV text with the agreed columns.

**Affected Area**

New `src/export.js`; reuses `formatCents` from `src/money.js`.

**Expected Outcome**

`ordersToCsv(orders)` returns the header row `id,customer,status,total,created_at`
and one CRLF-terminated row per order in input order, quoting values that
contain a comma, double quote, or line break and doubling embedded quotes, with
totals from `formatCents`.

**Self-Check**

- `node --test test/*.test.js` in the project root at `${COMMIT:Add CSV export for orders}`:
  5 passed, 0 failed, exit 0 (existing suites only).
- Ad-hoc `node --input-type=module -e` call of `ordersToCsv` on two sample
  orders, one customer containing a comma and quotes: printed the quoted cell
  with doubled quotes and a `42.50` total. Inspection only.

### DEV-002 — Export route with optional status filter

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-001, AC-004`

**Goal**

Serve the CSV from a route handler beside the JSON orders route.

**Affected Area**

`src/http.js` (`handleExport`); `handleOrders` is unchanged.

**Expected Outcome**

`handleExport(store, query)` returns 200 with `text/csv; charset=utf-8` and
`ordersToCsv(store.list({ status }))`; an unknown status returns the same 400
JSON error as `handleOrders` without building CSV.

**Self-Check**

- Same `node --test test/*.test.js` run at `${COMMIT:Add CSV export for orders}`:
  5 passed, exit 0.
- Ad-hoc calls: `{ status: 'paid' }` returned one data row; `{ status: 'lost' }`
  returned status 400. Inspection only.

## Plan Notes

Approved by the user as proposed; implemented without deviations.
