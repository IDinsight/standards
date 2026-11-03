# Project Context

## Project Baseline

- `ledgerline` is a small in-process invoicing core: an in-memory invoice
  store, a read-through cache of invoice summaries, payment recording, and
  line-item edits. There is no HTTP layer and no persistence beyond process
  memory.

## Stack and Tooling

- Node.js 22, plain JavaScript ES modules (`"type": "module"`), no runtime or
  development dependencies.

## Structure and Boundaries

- `src/store.js` — `InvoiceStore`: rows keyed by invoice id; `get`, `put`, and
  `all` return copies; counts reads in `reads`.
- `src/cache.js` — `InvoiceCache`: time-based expiry only (`DEFAULT_TTL_MS`,
  five minutes; injectable `ttlMs` and `now`); `get`, `set`, `clear`.
- `src/invoices.js` — `InvoiceService.getInvoice` reads through the cache and
  caches the summary; `listInvoices` reads the store directly; `summarize`
  adds `totalCents` and `balanceCents`.
- `src/payments.js` — `recordPayment` validates and writes the store only.
- `src/lineItems.js` — `editLineItem` writes the store only.

## Commands

- `npm test` — runs `node --test` on `test/cache.test.js`,
  `test/invoices.test.js`, and `test/payments.test.js` (files are listed
  explicitly in `package.json`).

## Conventions and Constraints

- Money is integer cents. Invoice `status` is `open` or `void`; payments on void
  invoices are rejected.

## Testing and Verification Baseline

- `node:test` with `node:assert/strict`; tests inject a fixed clock into
  `InvoiceCache`. A new test file must be added to the `test` script to run.

## Relevant Existing Behavior

- Cached invoice summaries are never invalidated on writes: after
  `recordPayment` or `editLineItem`, `getInvoice` keeps returning the earlier
  summary until the entry expires (up to five minutes). `listInvoices` is not
  cached.

## Evidence

- `package.json`, `README.md`, `src/*.js`, `test/*.test.js`.
