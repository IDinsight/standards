# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SYNCHRONIZING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
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

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `USER_REWORK` `From`: `AWAITING_USER_SIGNOFF` `FailureType`: `SYNCHRONIZATION` `Reason`:
`The synchronization record cites the wrong review for AC-003 evidence; the user asked for the reference to be corrected.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `AWAITING_USER_SIGNOFF` `Owner`: `SYNCHRONIZING` `FailureType`: `SYNCHRONIZATION`
`Reason`: `The synchronization record cites the wrong review for AC-003 evidence; the user asked for the reference to be corrected.`
`ResumeAt`: `AWAITING_USER_SIGNOFF` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
