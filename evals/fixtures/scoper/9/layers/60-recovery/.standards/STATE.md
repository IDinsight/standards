# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `build-a-small-command-line-tool-tally-20260924T083000Z-3c9e51a7`
`Request`: `Build a small command-line tool, tally, that reads an expense CSV with date, category, and amount columns and prints a monthly summary to standard output: one line per calendar month in date order, with the total for each category, amounts rounded to two decimals, and months with no expenses left out. A row whose date or amount is missing or unreadable is reported on standard error with its line number and left out of the totals; the rest of the file is still summarized and the run still succeeds.`
`Scope`: `.standards/docs/scope/build-a-small-command-line-tool-tally-20260924T083000Z-3c9e51a7.md`
`Architecture`: `NONE` `Development`: `NONE` `PromotionReason`: `NONE`
`AuditTarget`: `NONE` `BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `ARCHITECTING` `FailureType`: `SCOPING` `Reason`:
`AC-003 does not say which rows are invalid or what the tool does with them (stop, skip silently, or report), so the error behavior cannot be designed.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `ARCHITECTING` `Owner`: `SCOPING` `FailureType`: `SCOPING`
`Reason`: `AC-003 does not say which rows are invalid or what the tool does with them (stop, skip silently, or report), so the error behavior cannot be designed.`
`ResumeAt`: `ARCHITECTING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
