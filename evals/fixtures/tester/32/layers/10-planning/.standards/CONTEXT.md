# Project Context

## Project Baseline

- `invoicing` is a small JavaScript library that builds immutable invoices from
  line items and computes subtotal, tax, and total in integer cents. There is no
  CLI or server; callers import from `src/`.

## Stack and Tooling

- Node.js 22, ES modules (`"type": "module"`), no runtime or development
  dependencies.
- Tests use `node:test` and `node:assert/strict`.

## Structure and Boundaries

- `src/money.js` — parses decimal strings to cents (`toCents`), formats cents,
  and rounds fractional cents halves away from zero (`roundCents`).
- `src/invoice.js` — `createInvoice`, `subtotalCents`, `totals`; invoices and
  their lines are frozen objects.
- `test/` — one test file per source module.

## Commands

- `npm test` — runs `node --test test/invoice.test.js test/money.test.js` from
  the project root. Test files are listed explicitly in the script, so a new
  test file must be added to it or run directly with `node --test <file>`.

## Conventions and Constraints

- Money is integer cents everywhere; decimal strings are parsed only at the
  `createInvoice` boundary.
- Invoices are immutable; operations return new frozen objects instead of
  changing their input.
- Fractional cents are rounded with `roundCents`.

## Testing and Verification Baseline

- 7 tests across `test/invoice.test.js` and `test/money.test.js`, all passing at
  audit time.
- No coverage tooling, linter, or type checker is configured.

## Evidence

- `package.json`, `src/`, `test/` — stack, structure, and conventions.
- `node --test test/invoice.test.js test/money.test.js` in the project root —
  exit 0, 7 passed.
