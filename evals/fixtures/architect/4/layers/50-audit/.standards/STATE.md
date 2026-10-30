# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `propagate-correlation-ids-across-the-api-20260923T141200Z-5b7e2c19`
`Request`: `Propagate correlation IDs across the API, bus, worker, logs, and callbacks.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FORWARD` `From`: `AUDITING` `FailureType`: `NONE` `Reason`:
`Project context refreshed for the correlation ID request.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
