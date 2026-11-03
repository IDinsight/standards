# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE` `Id`:
`deploy-migrations-20260924T090000Z-e6c4129b` `Request`:
`Ship database migrations safely with releases: no release should serve traffic before its migrations are applied, and nobody should have to remember to migrate after a deploy. CI should test the schema the migrations produce.`
`Scope`: `NONE` `Architecture`: `NONE` `Development`: `NONE`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FORWARD` `From`: `AUDITING` `FailureType`: `NONE` `Reason`:
`Project context recorded for deploys, migrations, and CI.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
