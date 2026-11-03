# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `export-20260924T090000Z-a7f3c1d2`
`Request`: `Let administrators export the filtered records list as CSV; non-admins must not be able to export. Document the export in the usage guide.`
`Scope`: `NONE` `Architecture`: `NONE`
`Development`: `.standards/docs/development/export-20260924T090000Z-a7f3c1d2.md`
`PromotionReason`: `Documenting the export in the usage guide requires Documenter and final review.`
`AuditTarget`: `NONE` `BlockedOn`: `NONE`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `FORWARD` `From`: `AUDITING` `FailureType`: `NONE` `Reason`:
`Project context refreshed after promotion; the expedited export code is recorded as non-baseline work.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `true`

### Obligation 1

`Owner`: `DEVELOPING` `FailureType`: `IMPLEMENTATION` `Reason`:
`Cells starting with =, +, -, or @ are exported unescaped, so spreadsheets run them as formulas.`
