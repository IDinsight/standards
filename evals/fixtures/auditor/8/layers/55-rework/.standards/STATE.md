# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `list-overdue-invoices-for-reminders-20260924T083000Z-c4e81f29`
`Request`: `List overdue invoices for the reminders screen with each invoice's current balance and the number of days it is overdue; exclude paid and voided invoices.`
`Scope`: `NONE` `Architecture`: `NONE` `Development`: `NONE`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`:

- `SourceCycle`: `invoice-cache-hotfix-20260922T160000Z-5a6b7c8d`
  `Request`: `Change invoice-cache invalidation behavior.`

## Handoff

`Kind`: `USER_REWORK` `From`: `AUDITING` `FailureType`: `PROJECT_CONTEXT`
`Reason`: `User clarified the request: show current balance and days overdue; exclude paid and voided invoices.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
