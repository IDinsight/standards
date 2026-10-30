# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `prorate-charges-when-a-customer-changes-20260923T161500Z-8d41b0e2`
`Request`: `Prorate charges when a customer changes plan partway through a billing period.`
`Scope`: `NONE` `Architecture`: `NONE` `Development`: `NONE`
`PromotionReason`: `NONE` `AuditTarget`: `services/billing` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `NEW_CYCLE` `From`: `SIGNED_OFF` `FailureType`: `NONE` `Reason`:
`Started a standard brownfield cycle for plan-change proration.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
