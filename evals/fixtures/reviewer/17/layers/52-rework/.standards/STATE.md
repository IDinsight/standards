# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV and explain the export in the user guide; who may export is being settled in a separate permissions review.`
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

`Kind`: `USER_REWORK` `From`: `REVIEWING_IMPLEMENTATION` `FailureType`: `SCOPING` `Reason`:
`User changed the request: export access leaves this cycle and the user guide must explain the export.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `User changed the request: export access leaves this cycle and the user guide must explain the export.`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
