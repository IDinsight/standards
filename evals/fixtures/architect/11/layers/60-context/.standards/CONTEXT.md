# Project Context

## Project Baseline

- `invoicer` is a small Node.js invoice service: staff create draft invoices,
  issue them, record payments, and void them through an HTTP-style router.
- Context refreshed for the active invoice copy request
  (`billing-copy-20260923T101500Z-4d7e9a13`). The working tree is clean and no
  implementation for that request exists yet.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`), no runtime or development
  dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/invoices.js` — invoice creation, lookup, and lifecycle transitions
  (`createDraft`, `getInvoice`, `issueInvoice`, `voidInvoice`) and derived
  values (`totalCents`, `dueDate`).
- `src/numbering.js` — `nextInvoiceNumber(store, year)`, the only source of
  invoice numbers.
- `src/payments.js` — payment ledger (`recordPayment`, `paymentsFor`,
  `balanceCents`); payments live in `store.payments`, not on the invoice.
- `src/store.js` — in-memory store (`invoices` Map keyed by number,
  `payments` array, `lastNumber` counter).
- `src/api.js` — `handle(store, clock, method, path, body)` router; shapes
  responses with `view()` and maps domain errors to statuses.
- `src/errors.js` — `NotFoundError`, `ValidationError`, `StateError`.
- `docs/architecture.md` — the project's canonical architecture document.

## Commands

- `npm test` — runs `node --test test/invoices.test.js test/payments.test.js
  test/api.test.js` from the project root; passes at HEAD.

## Conventions and Constraints

- `AGENTS.md`: design decisions and design changes are recorded in
  `docs/architecture.md`, in the section for the affected area, not in
  separate design documents.
- Money is integer cents; no floating-point amounts.
- No runtime dependencies.
- Test files are listed explicitly in the `test` script.
- Domain functions take `today` as a `YYYY-MM-DD` string; only `src/api.js`
  reads the clock (UTC).

## Relevant Existing Behavior

- Invoice numbers are `INV-<year>-<NNNNN>` from one per-store counter; the
  year comes from the creation date; numbers are never reused.
- `createDraft` validates customer, terms, and line items, assigns a number,
  and sets status `draft` and `issueDate` to the creation day.
- Lifecycle: `draft` -> `issued` -> `paid` (automatic at zero balance);
  `draft` or `issued` -> `void`. Issuing replaces `issueDate` and requires at
  least one line. Only `issued` invoices accept payments.
- Invoice responses include `totalCents`, `dueDate`, and `balanceCents`.
  Errors map NotFound to 404, Validation to 400, State to 409; unknown routes
  return 404.

## Testing and Verification Baseline

- `test/invoices.test.js`, `test/payments.test.js`, and `test/api.test.js`
  cover numbering, totals and due dates, issuing rules, partial and full
  payment, overpayment, and API create/issue/read and not-found.

## Evidence

- `AGENTS.md`, `docs/architecture.md`, `src/`, `test/`, `package.json` at HEAD.
- `npm test` — all tests pass.
