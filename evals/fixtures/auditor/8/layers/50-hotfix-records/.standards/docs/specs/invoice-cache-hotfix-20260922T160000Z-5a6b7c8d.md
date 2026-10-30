<!-- STANDARDS
Artifact: ARCHITECTURE
Cycle: invoice-cache-hotfix-20260922T160000Z-5a6b7c8d
-->

# Technical Design

## Context

`InvoiceService.getInvoice` caches invoice summaries in `InvoiceCache`, which
expires entries by time only. `recordPayment` and `editLineItem` write the store
without touching the cache (`.standards/CONTEXT.md`).

## Decision

Add `invalidate(id)` to `InvoiceCache` and call it from each write path after
the store write succeeds. Keep time-based expiry unchanged as the fallback for
writes made outside these functions.

## Acceptance Coverage

- `AC-001`: `InvoiceCache.invalidate(id)`; `recordPayment` calls it after
  `store.put`.
- `AC-002`: `editLineItem` calls `invalidate(id)` after `store.put`.
- `AC-003`: `invalidate` removes only the written invoice's entry; other entries
  keep their expiry.

## Technical Acceptance Criteria

- `AC-001`, `AC-002`: No cache entry for the written invoice survives a
  successful write through these functions; a failed write leaves the cache
  unchanged.

## Build Plan

1. Cache method and payment write path.
2. Line-item write path.
