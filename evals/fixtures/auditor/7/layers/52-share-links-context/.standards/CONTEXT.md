# Project Context

## Project Baseline

- `invoicing` is a small TypeScript invoicing service: an in-memory invoice
  store and request handlers that return `{ status, body }` replies. There is
  no HTTP server binding in the repository; callers use `handle()` directly
  with a context from `createContext()`.

## Stack and Tooling

- TypeScript run directly by Node 22 with type stripping
  (`--experimental-strip-types`); no build step, no compiler, no runtime
  dependencies.
- ES modules (`type: module` in `package.json`); imports use explicit `.ts`
  specifiers.

## Structure and Boundaries

- `src/invoices.ts` — `Invoice` type and `InvoiceStore` (create, get, list,
  markSent, markPaid). Owns invoice numbering (`INV-0001`, ...).
- `src/handlers.ts` — `handle(ctx, method, path, body)` routing for
  `/invoices` and `/invoices/:id`.
- `src/app.ts` — `createContext()` builds the handler context around a new
  `InvoiceStore`.
- `test/` — `node:test` suites.

## Commands

- `npm test` — runs `node --experimental-strip-types --test` over the test
  files listed in `package.json`.

## Conventions and Constraints

- Type-stripping-compatible TypeScript only: no enums, no parameter
  properties, `import type` for type-only imports.
- Monetary amounts are integer cents (`amountCents`).
- Handlers do not throw for client errors; they return 400 or 404 with a body
  of the form `{ error }`.

## External Systems and Data

- None. Storage is in memory; nothing persists across process restarts.

## Testing and Verification Baseline

- `test/invoices.test.ts` covers store numbering and status transitions;
  `test/handlers.test.ts` covers creation, listing, 404s, and validation
  errors. Test files must be added to the `package.json` script explicitly.

## Relevant Existing Behavior

- Invoice ids are sequential per store instance and never reused.
- `POST /invoices` trims the customer name and rejects a missing customer or a
  non-positive integer `amountCents` with 400.
- Status moves only draft -> sent -> paid; other transitions throw.

## Active-Cycle Non-Baseline Work

- `Cycle: previous-share-links; src/share-links.ts` — share-link creation and
  token lookup written during the expedited share-links work, before
  promotion. Not established baseline; scope and design for share links are
  still to be decided, and no route uses the module.

## Evidence

- `package.json` — test script and module type.
- `src/invoices.ts`, `src/handlers.ts`, `src/app.ts` — store, routing, and
  context behavior.
- `test/invoices.test.ts`, `test/handlers.test.ts` — covered behavior.
- `git log -- src/share-links.ts` — added by the expedited share-links work.
