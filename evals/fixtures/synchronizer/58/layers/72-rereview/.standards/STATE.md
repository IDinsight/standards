# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SYNCHRONIZING` `CycleMode`: `DOCUMENTATION`
`PendingCycleMode`: `UNSET` `PendingCycleRequest`: `UNSET`
`PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d`
`Request`:
`Standalone Documenter request: write a user guide for the ledgerline import and summary commands, including exit codes, in docs/guide.md.`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_FINAL` `FailureType`: `SYNCHRONIZATION`
`Reason`: `Synchronization record cites the import check as AC-002 evidence.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `REVIEWING_FINAL` `FailureType`: `REVIEW`
`Reason`: `Final review's AC-003 conclusion is not supported by assessed evidence.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `NONE`

### Frame 2

`From`: `REVIEWING_FINAL` `Owner`: `SYNCHRONIZING` `FailureType`:
`SYNCHRONIZATION` `Reason`:
`Synchronization record cites the import check as AC-002 evidence.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
