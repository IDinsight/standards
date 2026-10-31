# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `REVIEWING_FINAL` `CycleMode`: `DOCUMENTATION`
`PendingCycleMode`: `UNSET` `PendingCycleRequest`: `UNSET`
`PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: write a guide for the tally report command in docs/reports.md and link it from the README usage section.`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `DOCUMENTING` `FailureType`: `NONE` `Reason`:
`--account section added; final review reruns before synchronization resumes.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/reports.md omits the --account filter that AC-001 requires.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `REVIEWING_FINAL`

## Outstanding Obligations

`Active`: `false`
