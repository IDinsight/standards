<!-- STANDARDS
Artifact: SCOPE
Cycle: let-staff-export-orders-as-csv-20260922T141000Z-5c81e2a4
-->

# Order CSV Export

## Goal

Staff reconcile orders in spreadsheets by copying JSON from the orders route.
Give them a CSV download of the same orders, optionally narrowed to one status.

## Constraints

- The existing JSON orders route keeps its current responses.
- Order statuses remain the existing set: pending, paid, shipped, cancelled.

## Non-goals

- Column selection, date-range filters, or streaming of large exports.
- Any change to how orders are stored.

## Work

### 1. CSV export of orders

**Intent:** Staff can open the export directly in a spreadsheet without
cleaning up the data.

**Done when:**

- `AC-001`: The export starts with the header row `id,customer,status,total,created_at`, followed by one row per order in ascending id order.
- `AC-002`: Values containing a comma, a double quote, or a line break are quoted, with embedded double quotes doubled, per RFC 4180.
- `AC-003`: Totals are written as decimal amounts with exactly two decimal places, for example `42.50`.

**Depends on:** None

### 2. Status filter

**Intent:** Staff can export only the orders they are reconciling.

**Done when:**

- `AC-004`: The export accepts an optional status; with a known status only matching orders are exported, and an unknown status is rejected with HTTP status 400 and no CSV rows.

**Depends on:** 1
