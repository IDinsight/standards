<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: invoice-cache-hotfix-20260922T160000Z-5a6b7c8d
-->

# Development Plan

`Cycle`: `invoice-cache-hotfix-20260922T160000Z-5a6b7c8d` `Mode`: `AUTONOMOUS`
`User Style`: `NONE` `User Style Locked`: `true` `Status`: `APPROVED`
`Verification Cadence`: `AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/invoice-cache-hotfix-20260922T160000Z-5a6b7c8d.md`
- `Architecture`: `.standards/docs/specs/invoice-cache-hotfix-20260922T160000Z-5a6b7c8d.md`
- `Request`: `Recorded payments and line-item edits show up on the next invoice read.`

## Build Steps

### DEV-001 — Invalidate the cached invoice when a payment is recorded

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-003`

**Goal**

A payment recorded through `recordPayment` is visible on the next
`getInvoice` call for that invoice.

**Affected Area**

`src/cache.js`, `src/payments.js`, `test/payments.test.js`.

**Expected Outcome**

`InvoiceCache.invalidate(id)` exists; `recordPayment` calls it after the store
write; other cached invoices are untouched.

**Self-Check**

Planned: `npm test` in the project root.

### DEV-002 — Invalidate the cached invoice when a line item is edited

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-002, AC-003`

**Goal**

A line-item edit through `editLineItem` is visible on the next `getInvoice`
call for that invoice.

**Affected Area**

`src/lineItems.js`.

**Expected Outcome**

`editLineItem` calls `invalidate(invoiceId)` after the store write.

**Self-Check**

Planned: `npm test` in the project root.
