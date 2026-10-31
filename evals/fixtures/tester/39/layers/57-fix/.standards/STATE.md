# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `TESTING` `CycleMode`: `STANDARD` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE` `Id`:
`add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2` `Request`:
`Add percentage discount codes to order totals.` `Scope`:
`.standards/docs/scope/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2.md`
`Architecture`:
`.standards/docs/specs/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2.md`
`Development`:
`.standards/docs/development/add-percentage-discount-codes-to-order-20260924T081500Z-6c1e94b2.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`Expiry-date correction done; verification and implementation review rerun next.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_FINAL` `Owner`: `DEVELOPING` `FailureType`:
`IMPLEMENTATION` `Reason`:
`Final review found discount codes rejected on their expiry date.` `ResumeAt`:
`REVIEWING_FINAL` `RerunThrough`: `REVIEWING_IMPLEMENTATION`

## Outstanding Obligations

`Active`: `false`
