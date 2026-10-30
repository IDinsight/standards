<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: share-invoice-links-20260915T130000Z-6a1d9e42
-->

# Development Plan

`Cycle`: `share-invoice-links-20260915T130000Z-6a1d9e42` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `IN_PROGRESS`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `NONE`
- `Architecture`: `NONE`
- `Request`: `Share invoice links.`

## Build Steps

### DEV-001 — Share link creation and lookup

`Status`: `DONE` `Depends On`: `NONE` `Acceptance`: `EXPEDITED_REQUEST`

**Goal**

Issue an unguessable token for an existing invoice and resolve a token back to
that invoice.

**Affected Area**

New module `src/share-links.ts` beside `src/invoices.ts`.

**Expected Outcome**

`ShareLinks.create(invoiceId)` returns a link with a random token and rejects
unknown invoices; `ShareLinks.resolve(token)` returns the invoice or
`undefined`.

**Self-Check**

`node --experimental-strip-types --test test/invoices.test.ts test/handlers.test.ts`
in the project root on the working tree with the new module: exit 0, 8 passed
(existing behavior unchanged). An ad hoc script created a link for `INV-0001`
and resolved it; an unknown token returned `undefined`. No route exposes the
module yet.

## Plan Notes

- Expiry and revocation came up after DEV-001. They need scoped acceptance
  conditions and Tester-owned verification, so the cycle was promoted to
  STANDARD before further implementation.
