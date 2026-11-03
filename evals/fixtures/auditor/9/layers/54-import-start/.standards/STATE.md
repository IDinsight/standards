# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `import-b-20260922T100000Z-4e5f6a7b`
`Request`: `Adjust product imports for the new supplier file format.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`:

- `SourceCycle`: `cache-a-20260921T100000Z-0a1b2c3d`
  `Request`: `Fix cache invalidation.`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `NEW_CYCLE` `From`: `CANCELLED` `FailureType`: `NONE` `Reason`:
`New cycle after cancellation; baseline reconciliation is unresolved.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
