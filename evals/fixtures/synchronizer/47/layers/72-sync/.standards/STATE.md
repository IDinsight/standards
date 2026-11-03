# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `REVIEWING_FINAL` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Document the export in the usage guide.`
`Scope`: `.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md`
`Architecture`: `.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md`
`Development`: `.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `SYNCHRONIZING` `FailureType`: `REVIEW` `Reason`:
`Final-deliverable review cites verification evidence E3, which does not exist.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `REVIEWING_FINAL` `FailureType`: `REVIEW`
`Reason`: `Final-deliverable review cites verification evidence E3, which does not exist.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
