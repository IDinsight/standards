# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DOCUMENTING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Document the export in the usage guide.`
`Scope`: `NONE` `Architecture`: `NONE` `Development`: `NONE`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FAILURE` `From`: `AUDITING` `FailureType`: `DOCUMENTATION` `Reason`:
`The setup guide docs/setup.md tells developers to run pnpm db:seed, a script that does not exist; sample records load in memory, so the audit cannot take setup steps from it.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `AUDITING` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `The setup guide docs/setup.md tells developers to run pnpm db:seed, a script that does not exist; sample records load in memory, so the audit cannot take setup steps from it.`
`ResumeAt`: `AUDITING` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
