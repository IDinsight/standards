# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `DOCUMENTATION` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: write a guide for support staff on producing account balance reports with the existing acctreport command; documentation only. Revised by the user during final review: replace the CSV instructions with instructions for the existing JSON output (--format json).`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `USER_REWORK` `From`: `REVIEWING_FINAL` `FailureType`: `SCOPING`
`Reason`: `User replaced the guide's CSV instructions with JSON output instructions.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `REVIEWING_FINAL` `FailureType`: `REVIEW`
`Reason`: `Final review records no check that the guide's CSV example matches current command output.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `NONE`

### Frame 2

`From`: `REVIEWING_FINAL` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `User replaced the guide's CSV instructions with JSON output instructions.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
