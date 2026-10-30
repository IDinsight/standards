<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: customer-totals-report-20260922T141500Z-3e8b1f5a
-->

# Technical Design

## Context

The `orders` CLI (`bin/orders.js`) parses an orders CSV with `loadOrders` in
`src/orders.js` into `{ id, customer, amountCents, date }` objects, keeps money
in integer cents, and formats amounts with `formatCents` in `src/format.js`.
This cycle started on the expedited path, so tentative implementation for it is
already in the repository; `.standards/CONTEXT.md` lists it under Active-Cycle
Non-Baseline Work. This design is the contract that implementation must meet.

## Decision

Add a pure aggregation function in its own module and a `totals` subcommand in
the existing CLI dispatcher. Aggregation and ordering stay in the module so the
CLI only formats and prints; totals are summed in integer cents to avoid
floating-point rounding.

## Acceptance Coverage

- `AC-001`: `totalsByCustomer` in `src/totals.js` sums `amountCents` per
  customer; the `totals` subcommand in `bin/orders.js` prints each entry with
  `formatCents`.
- `AC-002`: `totalsByCustomer` returns entries in the required order; the CLI
  prints them without reordering.

## Components

- `src/totals.js` — per-customer aggregation and ordering; no I/O.
- `bin/orders.js` — argument dispatch, output, and usage for `summary` and
  `totals`.

## Interfaces and Contracts

- `totalsByCustomer(orders)`: takes the array returned by `loadOrders`; returns
  an array of `{ customer, totalCents }`, one entry per distinct `customer`
  string (exact match), `totalCents` an integer. Does not mutate its input.
- `orders totals <file>`: writes one line per entry to stdout as
  `<customer>: <formatCents(totalCents)>`, with no header line; exit status 0.
  A file with only the header row prints nothing.
- An unknown command or a missing file argument prints a usage line to stderr
  and exits with status 2, as before.

## Technical Acceptance Criteria

- `AC-001`: For every distinct customer in the input there is exactly one
  entry, its `totalCents` equals the integer sum of that customer's
  `amountCents`, and the printed amount is `formatCents(totalCents)`.
- `AC-002`: Entries are sorted by `totalCents` descending; ties are broken by
  `customer` ascending using `String.prototype.localeCompare`.

## Build Plan

1. Aggregation module `src/totals.js`.
2. `totals` subcommand and usage text in `bin/orders.js`.

## Risks and Follow-up

- The CSV reader does not handle quoted fields, so a customer name containing a
  comma is split; this is existing behavior and out of scope.
