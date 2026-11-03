# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `household-expense-settlement-cli-20260924T081500Z-5c1e7a93`
`Request`: `Build a command-line tool, runnable with Node.js 22 and no third-party packages, that reads a CSV file of shared household expenses and prints the payments that settle everyone's balances.`
`Scope`: `.standards/docs/scope/household-expense-settlement-cli-20260924T081500Z-5c1e7a93.md`
`Architecture`: `NONE` `Development`: `NONE` `PromotionReason`: `NONE`
`AuditTarget`: `NONE` `BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `ARCHITECTING` `FailureType`: `SCOPING` `Reason`:
`AC-002 does not define how leftover cents are assigned when an amount does not divide evenly.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `ARCHITECTING` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `AC-002 does not define how leftover cents are assigned when an amount does not divide evenly.`
`ResumeAt`: `ARCHITECTING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
