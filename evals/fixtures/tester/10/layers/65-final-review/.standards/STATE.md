# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV, and give operations staff a guide to the export files.`
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

`Kind`: `USER_REWORK` `From`: `REVIEWING_FINAL` `FailureType`: `SCOPING` `Reason`:
`User retired the export access condition and asked for an operations guide for export files.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_FINAL` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `User retired the export access condition and asked for an operations guide for export files.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
