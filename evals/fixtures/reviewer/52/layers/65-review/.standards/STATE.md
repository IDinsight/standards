# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `IMPLEMENTATION_REVIEWED`
`Id`: `add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91`
`Request`: `Add late fees to overdue invoices and show them on monthly statements. Completion policy: the user chose IMPLEMENTATION_REVIEWED (finish after implementation review) because the billing module is internal and this change needs no user-facing documentation.`
`Scope`: `.standards/docs/scope/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91.md`
`Architecture`: `.standards/docs/specs/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91.md`
`Development`: `.standards/docs/development/add-late-fees-to-overdue-invoices-20260921T141200Z-5c8e2a91.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_IMPLEMENTATION` `FailureType`: `ARCHITECTURE` `Reason`:
`The design does not define which date late fees are evaluated against.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `ARCHITECTING` `FailureType`: `ARCHITECTURE`
`Reason`: `The design does not define which date late fees are evaluated against.`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
