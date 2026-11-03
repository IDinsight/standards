# Architecture

How `invoicer` is built and why. This is the reference for design decisions:
when the design of an area changes, update its section here.

## Overview

`invoicer` keeps invoices for billing staff: drafts are created, issued to the
customer, paid (possibly in parts), or voided. It is a Node.js package with no
runtime dependencies. Domain logic is plain functions over a store object, and
a small router in `src/api.js` exposes it as an HTTP-style API. Storage is in
memory; the store object is the seam where a database would plug in later.

## Modules

- `src/store.js` — creates the store: `invoices` (Map keyed by invoice
  number), `payments` (array), `lastNumber` (numbering counter).
- `src/numbering.js` — the only place invoice numbers are produced.
- `src/invoices.js` — invoice creation, lookup, lifecycle transitions, and
  derived values (total, due date).
- `src/payments.js` — the payment ledger and balances.
- `src/api.js` — routing, request-to-domain mapping, response shaping, and
  error-to-status mapping.
- `src/errors.js` — domain error types shared by the modules above.

Dependency direction: `api` -> `payments` -> `invoices` -> `numbering`. Every
domain module receives the store as its first argument and never reads the
clock; callers pass `today` as a `YYYY-MM-DD` string.

## Data Model

Invoice:

- `number` — `INV-<year>-<NNNNN>`, unique, immutable.
- `customerId` — opaque customer reference supplied by the caller.
- `status` — `draft`, `issued`, `paid`, or `void`.
- `issueDate` — `YYYY-MM-DD`.
- `termsDays` — payment terms in days (default 30); the due date is derived.
- `lines` — `{ description, quantity, unitPriceCents }`; quantity is a
  positive integer, unit price a non-negative integer.

Payment: `{ invoiceNumber, amountCents, date }`, stored in `store.payments`
rather than on the invoice, so the invoice record stays a plain document and
balances are always derived from the ledger.

All money is integer cents.

## Invoice Lifecycle

- `createDraft` validates input and creates a `draft` with `issueDate` set to
  the creation day.
- `issueInvoice`: `draft` -> `issued`; requires at least one line and replaces
  `issueDate` with the issue day.
- `recordPayment` is accepted only for `issued` invoices, rejects amounts above
  the balance, and moves the invoice to `paid` when the balance reaches zero.
- `voidInvoice`: `draft` or `issued` -> `void`. Paid and void invoices are
  final.

## Numbering

`nextInvoiceNumber(store, year)` increments the store's single counter and
formats `INV-<year>-<NNNNN>`. The year comes from the creation date; the
counter is not reset per year. A number is assigned when the draft is created
and is never reused, including for voided invoices.

## HTTP API

`handle(store, clock, method, path, body)` matches routes in order and returns
`{ status, body }`. It derives `today` from `clock()` in UTC and passes it to
the domain functions.

- `POST /invoices` — create a draft from `{ customerId, termsDays?, lines? }`;
  201.
- `GET /invoices/:number` — read an invoice; 200.
- `POST /invoices/:number/issue` — issue a draft; 200.
- `POST /invoices/:number/void` — void a draft or issued invoice; 200.
- `POST /invoices/:number/payments` — record `{ amountCents }`; 201.

Invoice responses are built by `view()`: the stored fields plus `totalCents`,
`dueDate`, and `balanceCents`. Errors map `NotFoundError` to 404,
`ValidationError` to 400, and `StateError` to 409; an unknown route is 404.

## Testing

Tests use `node:test`; the test files are listed in the `test` script of
`package.json`.
