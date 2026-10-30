# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DEVELOPING` `CycleMode`: `EXPEDITED` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE`
`Id`: `expired-sessions-20260924T090000Z-3c9e51a7`
`Request`: `Reject expired session tokens on GET /accounts/:id with 401 and tell the client the session expired so it can refresh.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `.standards/docs/development/expired-sessions-20260924T090000Z-3c9e51a7.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_IMPLEMENTATION` `FailureType`:
`IMPLEMENTATION` `Reason`: `an error response leaks an internal exception`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_IMPLEMENTATION` `Owner`: `DEVELOPING` `FailureType`:
`IMPLEMENTATION` `Reason`: `an error response leaks an internal exception`
`ResumeAt`: `REVIEWING_IMPLEMENTATION` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
