# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SYNCHRONIZING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Document the export in the usage guide.`
`Scope`: `.standards/docs/scope/export-20260924T090000Z-a7f3c1d2.md`
`Architecture`: `.standards/docs/specs/export-20260924T090000Z-a7f3c1d2.md`
`Development`: `.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `Before sign-off, decide whether export files kept in exports/ may include owner usernames under the data retention policy, or whether exports must leave out the owner column.`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`:

- `SourceCycle`: `migrate-records-to-json-file-20260921T143000Z-5e9b2c71`
  `Request`: `Move record storage from the in-memory seed to a JSON file, with a one-time migration of the seed records.`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FORWARD` `From`: `REVIEWING_FINAL` `FailureType`: `NONE` `Reason`:
`Final-deliverable review passed with no open findings.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
