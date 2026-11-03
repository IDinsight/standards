# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DOCUMENTING` `CycleMode`: `DOCUMENTATION` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: bring docs/usage.md in line with the current csvsum CLI. Documenter target: FILE docs/usage.md. Collaboration: GUIDED. User style: NONE.`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_FINAL` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/usage.md documents --sep; csvsum accepts only --delimiter.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_FINAL` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/usage.md documents --sep; csvsum accepts only --delimiter.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
