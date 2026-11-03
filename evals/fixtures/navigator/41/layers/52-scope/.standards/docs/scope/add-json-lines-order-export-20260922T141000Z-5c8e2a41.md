<!-- STANDARDS
Artifact: SCOPE
Cycle: add-json-lines-order-export-20260922T141000Z-5c8e2a41
-->

# JSON Lines Order Export

## Goal

Let operations staff export orders as JSON Lines so the finance import job can
read exact totals and order times without understanding the internal order
format.

## Constraints

- Amounts stay exact: cents are never rounded through floating point.
- No new runtime dependencies.

## Non-goals

- Importing JSON Lines back into order files.
- Filtering, sorting, or paging orders during export.

## Work

### 1. Order serialization

**Intent:** The finance import job needs each order in a stable, self-describing
shape with money and time in unambiguous formats.

**Done when:**

- `AC-001`: Each exported order is a JSON object whose `total` and line `price`
  values are decimal strings with exactly two fractional digits, and whose
  `placedAt` is an ISO 8601 timestamp in UTC.

**Depends on:** None

### 2. Export output

**Intent:** The import job reads the file line by line.

**Done when:**

- `AC-002`: The export contains exactly one line per order, in input order, and
  every line ends with a newline.
- `AC-003`: Exporting an empty list of orders produces empty output.

**Depends on:** 1
