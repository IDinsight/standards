# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `UNSET` `PendingCycleMode`: `EXPEDITED`
`PendingCycleRequest`: `Change the shared authentication token contract so tokens carry a tenant claim that the API and the background worker both validate.`
`PendingCycleBlockedOn`: `This request is not eligible for EXPEDITED: it changes the token contract shared by the API and the worker, which needs formal scope and architecture. Choose STANDARD, revise the request, or abandon it.`

## Active Work

`CompletionPolicy`: `NONE`
`Id`: `UNSET` `Request`: `UNSET` `Scope`: `NONE` `Architecture`: `NONE`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `INITIAL` `From`: `NONE` `FailureType`: `NONE` `Reason`:
`Initial brownfield workflow state; cycle mode not yet selected.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
