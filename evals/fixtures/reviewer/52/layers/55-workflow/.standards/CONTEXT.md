# Project Context

## Project Baseline

- Internal billing helpers for invoices and customer statements under
  `src/billing/`. No UI or HTTP layer; the finance jobs import these modules.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no
  dependencies.

## Structure and Boundaries

- `src/billing/invoices.js` — date and balance helpers: `parseDate`,
  `daysOverdue`, `outstandingCents`, `isPaid`.
- `src/billing/reminders.js` — selects unpaid invoices that are due a reminder.
- `src/billing/statement.js` — `buildStatement(customer, invoices,
  statementDate)`, the statement data used by the statement job.

## Nearest Analogues

- `src/billing/reminders.js` — a date rule over invoices; takes an explicit
  `asOf` date and uses `daysOverdue`; tested in `test/reminders.test.js`. A late
  fee is a similar rule with a money result.

## Commands

- `npm test` — runs `node --test` over the test files listed in `package.json`.

## Conventions and Constraints

- Money is integer cents (`totalCents`, `amountCents`); no floating-point
  currency.
- Dates are `YYYY-MM-DD` strings read as UTC days.
- `daysOverdue(invoice, asOf)` returns whole days after the due date and 0 on or
  before it; `test/invoices.test.js` pins 2026-08-15 as 14 days after
  2026-08-01.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`; test files live in `test/` and are
  listed explicitly in the `test` script. Six tests pass at the baseline.

## Evidence

- `package.json`, `src/billing/*.js`, `test/*.test.js` at the commit
  `Initial billing module`.
