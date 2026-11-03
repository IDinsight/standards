# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41`
`Request`: `Send patients an email reminder 24 hours before each booked appointment.`
`Scope`: `.standards/docs/scope/send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41.md`
`Architecture`: `.standards/docs/specs/send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41.md`
`Development`: `.standards/docs/development/send-patients-an-email-reminder-24-hours-20260921T141205Z-5c8e2a41.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `DEVELOPING` `FailureType`: `PROJECT_CONTEXT`
`Reason`: `Project context records a single production instance, but deploy/production.yaml may say otherwise; deployment topology in context may be stale.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `DEVELOPING` `Owner`: `AUDITING` `FailureType`: `PROJECT_CONTEXT`
`Reason`: `Project context records a single production instance, but deploy/production.yaml may say otherwise; deployment topology in context may be stale.`
`ResumeAt`: `DEVELOPING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
