# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING` `CycleMode`: `STANDARD` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`Id`: `add-user-search-20260901T120000Z-1a2b3c4d` `Request`:
`Add user search by name and email.` `Scope`:
`docs/scope/add-user-search-20260901T120000Z-1a2b3c4d.md` `Architecture`:
`docs/specs/add-user-search-20260901T120000Z-1a2b3c4d.md` `Development`:
`docs/development/add-user-search-20260901T120000Z-1a2b3c4d.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `TESTING` `FailureType`: `ARCHITECTURE` `Reason`:
`Retry behavior is not defined by the technical design.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `TESTING` `Owner`: `ARCHITECTING` `FailureType`: `ARCHITECTURE`
`Reason`: `Retry behavior is not defined by the technical design.` `ResumeAt`:
`TESTING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
