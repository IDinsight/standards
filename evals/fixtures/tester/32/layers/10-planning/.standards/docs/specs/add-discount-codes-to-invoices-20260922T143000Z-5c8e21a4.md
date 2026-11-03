<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: add-discount-codes-to-invoices-20260922T143000Z-5c8e21a4
-->

# Technical Design

## Context

Invoices are frozen objects built by `createInvoice` in `src/invoice.js`;
`totals` computes subtotal, tax, and total in integer cents and rounds with
`roundCents` from `src/money.js`. There is no persistence layer.

## Decision

Add a `src/discounts.js` module that looks codes up in a caller-supplied catalog
and returns a new frozen invoice carrying one `discount`. `totals` subtracts the
discount from the subtotal before computing tax. Errors use a dedicated
`DiscountError` class with a machine-readable `code` so callers can tell the
reasons apart.

## Acceptance Coverage

- `AC-001`: `applyDiscount` computes the percentage amount from the subtotal;
  `totals` taxes the subtotal minus the discount.
- `AC-002`: `lookupCode` raises `DiscountError` with `UNKNOWN_CODE` or
  `EXPIRED_CODE`; `applyDiscount` never changes its input invoice.
- `AC-003`: `totals` treats an invoice without `discount` as a zero discount.
- `AC-004`: fixed-amount entries cap the discount at the subtotal.

## Components

- `src/discounts.js` — `DiscountError`, `lookupCode`, `applyDiscount`.
- `src/invoice.js` — `totals` gains discount handling; `createInvoice` is
  unchanged.

## Interfaces and Contracts

- Catalog: a `Map` whose keys are upper-case codes and whose values are
  `{ kind: 'percent', percent, expires }` (percent an integer from 1 to 100) or
  `{ kind: 'fixed', amountCents, expires }`. `expires` is an ISO date string or
  `null` for no expiry.
- `lookupCode(catalog, code, today)`: matches the code case-insensitively after
  trimming whitespace. `today` is an ISO date string; a code is valid through
  its expiry date inclusive. Throws `DiscountError` with `code`
  `UNKNOWN_CODE` or `EXPIRED_CODE`.
- `applyDiscount(invoice, code, catalog, today)`: returns a new frozen invoice
  with `discount: { code, kind, amountCents }`. Throws `DiscountError` with
  `ALREADY_DISCOUNTED` when the invoice already carries a discount. On any error
  no invoice is produced and the input is untouched.
- `totals(invoice)`: returns `{ subtotalCents, discountCents, taxCents,
  totalCents }`; `discountCents` is 0 without a discount.

## Technical Acceptance Criteria

- `AC-001`: `amountCents` equals `roundCents(subtotalCents * percent / 100)`;
  `taxCents` is computed on `subtotalCents - discountCents`, and `totalCents` is
  that taxable amount plus tax.
- `AC-002`: rejected codes throw before any new invoice is built; the error's
  `code` is `UNKNOWN_CODE` or `EXPIRED_CODE`; the input invoice still has no
  `discount` and the same totals.
- `AC-003`: for an invoice without `discount`, `subtotalCents`, `taxCents`, and
  `totalCents` equal the values computed before this change, with
  `discountCents` 0.
- `AC-004`: a fixed-amount discount's `amountCents` is the lesser of the code's
  `amountCents` and the subtotal.

## Build Plan

1. Code lookup, percentage codes, and the `totals` change.
2. Fixed-amount codes.

## Risks and Follow-up

- Percent values outside 1 to 100 are the catalog owner's responsibility and
  are not validated.
