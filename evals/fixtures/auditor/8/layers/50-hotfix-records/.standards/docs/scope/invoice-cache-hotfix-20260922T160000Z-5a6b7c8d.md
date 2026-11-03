<!-- STANDARDS
Artifact: SCOPE
Cycle: invoice-cache-hotfix-20260922T160000Z-5a6b7c8d
-->

# Invoice Cache Invalidation

## Goal

Recorded payments and line-item edits must show up on the next read of the
affected invoice instead of after its cache entry expires, so balances shown to
staff are current.

## Non-goals

- Changing how invoices are stored.

## Work

### 1. Immediate visibility of invoice changes

**Intent:** Staff read an invoice right after taking a payment or correcting a
line item and currently see the old balance.

**Done when:**

- `AC-001`: After a payment is recorded, the next read of that invoice shows
  the new paid amount and balance.
- `AC-002`: After a line item is edited, the next read of that invoice shows the
  updated line items and total.
- `AC-003`: Reads of invoices that did not change are still served from the
  cache until their entries expire.

**Depends on:** None.
