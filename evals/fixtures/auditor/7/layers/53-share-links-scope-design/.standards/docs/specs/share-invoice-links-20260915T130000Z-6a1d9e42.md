<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: share-invoice-links-20260915T130000Z-6a1d9e42
-->

# Technical Design

## Context

Expedited work added `src/share-links.ts` with token creation and lookup.
Handlers return `{ status, body }` replies and receive their dependencies
through a context object built in `src/app.ts`. Storage is in memory.

## Decision

Keep links in memory in the existing `ShareLinks` class beside `InvoiceStore`.
Tokens are 16 random bytes, hex encoded. Expiry is compared against a clock
passed in by the caller so it can be exercised without waiting; handlers read
the clock and the `ShareLinks` instance from the context.

## Acceptance Coverage

- `AC-001`: `ShareLinks.create` and `ShareLinks.resolve`;
  `POST /invoices/:id/share` returns 201 `{ token, expiresAt }` or 404 for an
  unknown invoice; `GET /shared/:token` returns the invoice or 404.
- `AC-002`: `expiresAt` is creation time plus seven days; `resolve` returns
  nothing once `now >= expiresAt`.
- `AC-003`: `ShareLinks.revoke`; `DELETE /shared/:token` returns 204, after
  which `GET /shared/:token` returns 404.
- `AC-004`: No architectural impact — Documenter owns the README.

## Interfaces and Contracts

- Context gains optional `links: ShareLinks` and `now: () => number`
  (milliseconds; defaults to `Date.now`). Existing invoice routes keep working
  with a context that has only `store`.
- `expiresAt` in the create reply is an ISO 8601 timestamp.

## Technical Acceptance Criteria

- `AC-002`: Expiry uses the context clock, never a hidden timer.

## Build Plan

1. Add expiry and revocation to `ShareLinks`.
2. Add the share routes and wire `ShareLinks` into `createContext()`.
