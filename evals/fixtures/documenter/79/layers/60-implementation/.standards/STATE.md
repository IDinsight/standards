# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `TESTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b`
`Request`: `Add a --since date filter to the export command.`
`Scope`: `.standards/docs/scope/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
`Architecture`: `.standards/docs/specs/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
`Development`: `.standards/docs/development/add-a-since-date-filter-to-the-export-20260922T141500Z-5c1e9a3b.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `Correcting the --since test needs 2 scenarios beyond the 2 allocated to src/export.js (an item at 23:59Z the day before and one at 00:00Z on the day); approve raising that allocation to 4?`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `DEVELOPING` `FailureType`: `VERIFICATION` `Reason`:
`The --since test expects rows that follow local time, not the UTC day in AC-001.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `TESTING` `Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION`
`Reason`: `The --since filter drops items updated earlier on the given UTC day.`
`ResumeAt`: `TESTING` `RerunThrough`: `NONE`

### Frame 2

`From`: `DEVELOPING` `Owner`: `TESTING` `FailureType`: `VERIFICATION`
`Reason`: `The --since test builds fixture timestamps from local-time Date parts, so its expected rows do not follow the UTC day in AC-001.`
`ResumeAt`: `DEVELOPING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
