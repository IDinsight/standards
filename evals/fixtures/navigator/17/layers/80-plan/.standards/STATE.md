# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `TESTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0`
`Request`: `Retry failed webhook deliveries with backoff.`
`Scope`: `.standards/docs/scope/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0.md`
`Architecture`: `.standards/docs/specs/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0.md`
`Development`: `.standards/docs/development/retry-failed-webhook-deliveries-with-20260922T103015Z-6c1e94b0.md`
`PromotionReason`: `The delivery identifier contract for receivers needs an architecture decision and Tester-owned verification.`
`AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FAILURE` `From`: `DEVELOPING` `FailureType`: `VERIFICATION` `Reason`:
`test/deliver.test.js asserts the exact request header set, so DEV-002 cannot add the delivery identifier header without a Tester-owned test change.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `DEVELOPING` `Owner`: `TESTING` `FailureType`: `VERIFICATION`
`Reason`: `test/deliver.test.js asserts the exact request header set, so DEV-002 cannot add the delivery identifier header without a Tester-owned test change.`
`ResumeAt`: `DEVELOPING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `true`

### Obligation 1

`Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION`
`Reason`: `Retried attempts carry no stable delivery identifier, so a receiver can process one event twice.`
