# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `AUDITING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-the-client-list-as-csv-20260922T141000Z-5c8e2a91`
`Request`: `Export the client list as CSV.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `.standards/docs/development/export-the-client-list-as-csv-20260922T141000Z-5c8e2a91.md`
`PromotionReason`: `Who may download client contact data needs scoped acceptance and Tester-owned verification.`
`AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `PROMOTE` `From`: `DEVELOPING` `FailureType`: `NONE` `Reason`:
`Who may download client contact data needs scoped acceptance and Tester-owned verification.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `true`

### Obligation 1

`Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION`
`Reason`: `authorization is missing on the new endpoint`
