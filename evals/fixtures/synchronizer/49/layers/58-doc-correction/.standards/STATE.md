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

`Kind`: `RESUME` `From`: `DOCUMENTING` `FailureType`: `NONE` `Reason`:
`Guide correction verified; synchronization reruns before final review resumes.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `REVIEWING_FINAL` `FailureType`: `REVIEW`
`Reason`: `Final review assessed an earlier usage guide; the guide changed after it.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `NONE`

### Frame 2

`From`: `REVIEWING_FINAL` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `Usage guide Limits section misstates how same-second exports are named.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `SYNCHRONIZING`

## Outstanding Obligations

`Active`: `false`
