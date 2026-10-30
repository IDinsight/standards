<!-- STANDARDS
Artifact: SCOPE
Cycle: export-orders-as-csv-so-warehouse-staff-20260924T083012Z-3c9e71a4
-->

# Orders CSV Export

## Goal

Warehouse staff copy the order list into spreadsheets by hand. The service
should offer the same orders as a CSV download that a spreadsheet opens
correctly, including customer names that contain commas or quotes.

## Constraints

- The existing `GET /orders` JSON response stays unchanged.
- No new dependencies.

## Non-goals

- Filtering, date ranges, or pagination of the export.
- Importing CSV files.

## Work

### 1. CSV export endpoint

**Intent:** Give staff a download they can open directly in a spreadsheet.

**Done when:**

- `AC-001`: `GET /orders.csv` responds with status 200, content type
  `text/csv`, a header row `id,customer,total,placed_at`, and one row per
  order, newest first.
- `AC-002`: Fields containing commas, double quotes, or line breaks are quoted
  per RFC 4180, with embedded double quotes doubled.

**Depends on:** None

### 2. Usage documentation

**Intent:** Staff and operators can find the export without reading code.

**Done when:**

- `AC-003`: The README lists the `GET /orders.csv` endpoint and its columns.

**Depends on:** 1
