# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DOCUMENTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Add a JSON export endpoint that returns invoices issued in a date range, and document it in a new API guide.`
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

`Kind`: `FAILURE` `From`: `ARCHITECTING` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/conventions.md describes timestamps and amounts in formats the existing invoice API does not use.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `DEVELOPING` `Owner`: `ARCHITECTING` `FailureType`: `ARCHITECTURE`
`Reason`: `The design does not define whether the to date is inclusive or which time zone the from and to dates use.`
`ResumeAt`: `DEVELOPING` `RerunThrough`: `NONE`

### Frame 2

`From`: `ARCHITECTING` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `docs/conventions.md describes timestamps and amounts in formats the existing invoice API does not use.`
`ResumeAt`: `ARCHITECTING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
