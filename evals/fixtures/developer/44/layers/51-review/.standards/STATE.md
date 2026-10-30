# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DEVELOPING` `CycleMode`: `EXPEDITED` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE`
`Id`: `add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f`
`Request`: `Add percentage coupon codes to order totals; the discount is a percentage of the subtotal rounded to the nearest cent.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `.standards/docs/development/add-percentage-coupon-codes-to-order-20260924T081500Z-6c1e9a4f.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_IMPLEMENTATION` `FailureType`:
`IMPLEMENTATION` `Reason`:
`Coupon discount truncates instead of rounding to the nearest cent.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `DEVELOPING` `FailureType`:
`IMPLEMENTATION` `Reason`:
`Coupon discount truncates instead of rounding to the nearest cent.`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
