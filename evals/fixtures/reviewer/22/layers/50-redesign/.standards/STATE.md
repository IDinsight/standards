# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DEVELOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Write export files through a stream with a time limit so a stalled export volume cannot hold a request open.`
`Scope`: `.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md`
`Architecture`: `.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md`
`Development`: `.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `ARCHITECTING` `FailureType`: `NONE` `Reason`:
`Design revised for streamed export writes with a time limit; rerun through TESTING.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `ARCHITECTING` `FailureType`:
`ARCHITECTURE` `Reason`:
`User rework: export files must be written through a stream with a time limit.`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `TESTING`

## Outstanding Obligations

`Active`: `false`
