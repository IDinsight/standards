# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `CANCELLED` `CycleMode`: `UNSET` `PendingCycleMode`: `EXPEDITED`
`PendingCycleRequest`: `Make the session lifetime configurable through the SESSION_TTL_MINUTES environment variable, keeping 30 minutes as the default.`
`PendingCycleBlockedOn`: `The pending EXPEDITED preference cannot start this request: cancelled cycle auth-v1-old-20260920T090000Z-9e8d7c6b may have left project changes that need baseline reconciliation, and EXPEDITED cannot carry unresolved reconciliation. Choose a supported mode, replace or clear the preference, revise the request, or abandon it.`

## Active Work

`CompletionPolicy`: `NONE`
`Id`: `auth-v1-old-20260920T090000Z-9e8d7c6b`
`Request`: `Auth v1: issue HMAC-signed session tokens at login instead of random session ids.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `.standards/docs/development/auth-v1-old-20260920T090000Z-9e8d7c6b.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `CANCEL` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`User cancelled the auth v1 token cycle before login was switched to tokens.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
