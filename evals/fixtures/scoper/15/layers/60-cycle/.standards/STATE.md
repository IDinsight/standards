# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `SCOPING` `CycleMode`: `STANDARD` `PendingCycleMode`: `UNSET`
`PendingCycleRequest`: `UNSET` `PendingCycleBlockedOn`: `NONE`

## Active Work

`CompletionPolicy`: `FULL_DELIVERABLE`
`Id`: `standup-notes-20260924T084512Z-3e7a91c4`
`Request`: `Build a small web app where team members post a daily standup update and read the team's updates for a given day.`
`Scope`: `.standards/docs/scope/standup-notes-20260924T084512Z-3e7a91c4.md`
`Architecture`: `NONE` `Development`: `NONE` `PromotionReason`: `NONE`
`AuditTarget`: `NONE`
`BlockedOn`: `Product question: should a posted standup entry stay editable after the team's daily cutoff time, or lock once the cutoff passes? Also pending: the user asked to cancel this cycle; ProjectMode is GREENFIELD and no implementation exists, so cancellation is a bootstrap reset. Approval needed to run standards reset --project /work --mode greenfield --yes (target /work; dry-run preview shown: deletes .standards/docs/ with 1 cycle record and writes fresh STATE.md and MODE.md in GREENFIELD; skills, hooks, client settings, and user styles stay installed).`
`PendingVerificationCadence`: `NONE`

`BaselineReconciliation`: `NONE`

<!-- When non-NONE, use one Markdown list entry per source cycle:
- `SourceCycle`: `<cancelled-cycle-id>`
  `Request`: `<source-cycle request summary>`
Preserve existing entries; see PROTOCOL.md, Baseline Reconciliation Format.
-->

## Handoff

`Kind`: `INITIAL` `From`: `NONE` `FailureType`: `NONE` `Reason`:
`First greenfield cycle started in SCOPING.`

## Recovery

`Active`: `false`

## Outstanding Obligations

`Active`: `false`
