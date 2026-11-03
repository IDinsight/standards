# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SYNCHRONIZING` `CycleMode`: `DOCUMENTATION`
`PendingCycleMode`: `UNSET` `PendingCycleRequest`: `UNSET`
`PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: write a user guide at docs/guide.md for the tally CLI covering how to run it, the input file format, and every command-line option. Editing boundary: docs/guide.md only.`
`Scope`: `.standards/docs/scope/guide-20261004T120000Z-1a2b3c4d.md`
`Architecture`: `.standards/docs/specs/guide-20261004T120000Z-1a2b3c4d.md`
`Development`: `NONE` `PromotionReason`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE` `PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FAILURE` `From`: `REVIEWING_FINAL` `FailureType`: `SYNCHRONIZATION`
`Reason`: `Synchronization record cites the wrong guide section for AC-002.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `SYNCHRONIZING` `Owner`: `REVIEWING_FINAL` `FailureType`: `REVIEW`
`Reason`: `Final review evidence for AC-003 does not account for the --to option.`
`ResumeAt`: `SYNCHRONIZING` `RerunThrough`: `NONE`

### Frame 2

`From`: `REVIEWING_FINAL` `Owner`: `SYNCHRONIZING` `FailureType`:
`SYNCHRONIZATION` `Reason`:
`Synchronization record cites the wrong guide section for AC-002.` `ResumeAt`:
`REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
