<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: share-invoice-links-20260915T130000Z-6a1d9e42
-->

# Development Plan

`Cycle`: `share-invoice-links-20260915T130000Z-6a1d9e42` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `COMPLETE`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/share-invoice-links-20260915T130000Z-6a1d9e42.md`
- `Architecture`: `.standards/docs/specs/share-invoice-links-20260915T130000Z-6a1d9e42.md`
- `Request`: `Share invoice links.`

## Build Steps

### DEV-001 — Share link creation and lookup

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `AC-001`

**Goal**

Issue an unguessable token for an existing invoice and resolve a token back to
that invoice.

**Affected Area**

`src/share-links.ts`.

**Expected Outcome**

`ShareLinks.create` returns a link with a random token and rejects unknown
invoices; `ShareLinks.resolve` returns the invoice or `undefined`.

**Self-Check**

Recorded during the expedited phase: existing suite exit 0, 8 passed; ad hoc
create and resolve for `INV-0001`. Rechecked under DEV-003.

### DEV-002 — Expiry and revocation

`Status`: `DONE` `Depends On`: `DEV-001` `Acceptance`: `AC-002, AC-003`

**Goal**

Links expire seven days after creation and can be revoked.

**Affected Area**

`src/share-links.ts`.

**Expected Outcome**

`create(invoiceId, now, ttlMs)` stores `expiresAt`; `resolve(token, now)`
returns nothing once `now >= expiresAt` or after `revoke(token)`.

**Self-Check**

Ad hoc script in the project root with an explicit clock: resolve succeeded at
creation time, failed at creation plus seven days, and failed after revoke.

### DEV-003 — Share routes and context wiring

`Status`: `DONE` `Depends On`: `DEV-002` `Acceptance`: `AC-001, AC-002, AC-003`

**Goal**

Expose share links through the handlers.

**Affected Area**

`src/handlers.ts`, `src/app.ts`.

**Expected Outcome**

`POST /invoices/:id/share`, `GET /shared/:token`, and `DELETE /shared/:token`
behave as the design specifies; `createContext()` provides `links` and `now`.

**Self-Check**

`node --experimental-strip-types --test test/invoices.test.ts test/handlers.test.ts`
in the project root on the working tree for this commit: exit 0, 8 passed. Ad
hoc round trip through `handle()` returned 201, 200, 204, then 404.

## Plan Notes

- Reconciled after promotion: DEV-001 mapped from `EXPEDITED_REQUEST` to
  AC-001; DEV-002 and DEV-003 added and approved by the user.
