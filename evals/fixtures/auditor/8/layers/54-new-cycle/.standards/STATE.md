# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `list-overdue-invoices-for-reminders-20260924T083000Z-c4e81f29`
`Request`: `List overdue invoices for reminders.`
`Scope`: `NONE` `Architecture`: `NONE` `Development`: `NONE`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`:

- `SourceCycle`: `invoice-cache-hotfix-20260922T160000Z-5a6b7c8d`
  `Request`: `Change invoice-cache invalidation behavior.`

## Handoff

`Kind`: `NEW_CYCLE` `From`: `CANCELLED` `FailureType`: `NONE` `Reason`:
`New cycle after cancellation; the user did not confirm that the cancelled cycle left no project changes, so baseline reconciliation is pending.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
