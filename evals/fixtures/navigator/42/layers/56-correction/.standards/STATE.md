# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `TESTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e`
`Request`: `Add per-project hour totals to the weekly report.`
`Scope`: `.standards/docs/scope/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
`Architecture`: `.standards/docs/specs/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
`Development`: `.standards/docs/development/add-per-project-hour-totals-to-the-20260921T101200Z-6d1f0b3e.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`Closing-Sunday correction implemented; reverify through TESTING.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_FINAL` `Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION`
`Reason`: `Per-project totals drop entries dated on the closing Sunday (final review F-003).`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `TESTING`

## Outstanding Obligations

`Active`: `false`
