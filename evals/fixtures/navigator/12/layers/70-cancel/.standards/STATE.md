# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `CANCELLED` `CycleMode`: `UNSET` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f`
`Request`: `Add discount codes to checkout totals.`
`Scope`: `.standards/docs/scope/add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f.md`
`Architecture`: `.standards/docs/specs/add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f.md`
`Development`: `.standards/docs/development/add-discount-codes-to-checkout-totals-20260924T083000Z-3c9e5a1f.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `CANCEL` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`User cancelled the cycle during development; discount codes are deferred.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
