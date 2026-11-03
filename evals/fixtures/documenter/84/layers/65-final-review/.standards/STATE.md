# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `DOCUMENTING` `CycleMode`: `DOCUMENTATION` `PendingCycleMode`:
`UNSET` `PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `NONE` `Id`: `guide-20261004T120000Z-1a2b3c4d` `Request`:
`Standalone Documenter request: bring docs/operator-guide.md in line with current reportkit behaviour, including JSON Lines export and pruning.`
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

`Kind`: `FAILURE` `From`: `REVIEWING_FINAL` `FailureType`: `DOCUMENTATION`
`Reason`: `Operator guide states a 30-day default retention; reportkit/config.py uses 14.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `REVIEWING_FINAL` `Owner`: `DOCUMENTING` `FailureType`: `DOCUMENTATION`
`Reason`: `Operator guide states a 30-day default retention; reportkit/config.py uses 14.`
`ResumeAt`: `REVIEWING_FINAL` `RerunThrough`: `NONE`

## Outstanding Obligations

`Active`: `false`
