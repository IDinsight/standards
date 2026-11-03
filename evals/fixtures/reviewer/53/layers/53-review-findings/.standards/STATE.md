# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DEVELOPING` `CycleMode`: `STANDARD` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `IMPLEMENTATION_REVIEWED` `Id`:
`retry-webhook-deliveries-20260924T081500Z-6c1e9a42` `Request`:
`Retry failed webhook deliveries with exponential backoff capped at a maximum delay. Workflow instruction: the user chose IMPLEMENTATION_REVIEWED completion (finish after implementation review) because the change is internal to the delivery helper.`
`Scope`:
`.standards/docs/scope/retry-webhook-deliveries-20260924T081500Z-6c1e9a42.md`
`Architecture`:
`.standards/docs/specs/retry-webhook-deliveries-20260924T081500Z-6c1e9a42.md`
`Development`:
`.standards/docs/development/retry-webhook-deliveries-20260924T081500Z-6c1e9a42.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_IMPLEMENTATION` `FailureType`:
`IMPLEMENTATION` `Reason`: `Backoff wait runs after the final failed attempt.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `DEVELOPING` `FailureType`:
`IMPLEMENTATION` `Reason`: `Backoff wait runs after the final failed attempt.`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
