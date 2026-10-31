# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING` `CycleMode`: `DOCUMENTATION` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: write a guide for the tally report command in docs/reports.md and link it from the README usage section.`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `SCOPING` `FailureType`: `NONE` `Reason`:
`Scope rerun complete after the project-context correction.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/reports.md omits the --account filter that AC-001 requires.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `REVIEWING_FINAL`

### Frame 2

`From`: `REVIEWING_FINAL` `Owner`: `SYNCHRONIZING` `FailureType`:
`SYNCHRONIZATION` `Reason`:
`Synchronization record cites the guide content from before the --account correction.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

### Frame 3

`From`: `SYNCHRONIZING` `Owner`: `AUDITING` `FailureType`: `PROJECT_CONTEXT`
`Reason`:
`Project context describes tally report output as tab-separated with no header; the command writes CSV with a header row.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `SYNCHRONIZING`

## Outstanding Obligations

`Active`: `false`
