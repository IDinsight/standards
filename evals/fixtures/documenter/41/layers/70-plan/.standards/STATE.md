# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `TESTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Document the export in the usage guide, with migration instructions for admin-tool code that builds CSV from GET /records.`
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

`Kind`: `FORWARD` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`Plan reconciled with the revised scope; no implementation change.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `DOCUMENTING` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `User asked for migration instructions in the usage guide.`
`ResumeAt`: `DOCUMENTING` `RerunThrough`: `REVIEWING_IMPLEMENTATION`

## Outstanding Obligations

`Active`: `false`
