---
title: Cancelling or Starting a New Cycle
description: Understand terminal cycles and the greenfield bootstrap reset.
---

Cancellation ends the current cycle. It does not revert project changes or make
leftover implementation part of the accepted project baseline.

## Cancel brownfield work

Set `WorkflowState: CANCELLED` and `CycleMode: UNSET`. Leave all pending-cycle
fields clear, retain `Active Work`, and clear recovery and outstanding
obligations. Record `Handoff.Kind: CANCEL`, the interrupted state in `From`, and
`FailureType: NONE`. The workflow files and project work remain.

Unfinished corrections end with the cycle. Changes left behind still need to be
checked before another cycle can rely on them.

## Cancel greenfield bootstrap

First check for implementation created or materially changed during the active
cycle, including code the user wrote. If it exists, record the permanent change
to `BROWNFIELD` and use the retained cancellation above, even if the mode file
had not yet been updated.

Only when no such implementation exists does greenfield cancellation remove the
framework installation. This is a **bootstrap reset**.

The reset removes framework-owned runtime and installed skills, including the
cycle-ID registry, and removes marked integration sections. Preserve
project-owned content. Revert a client setting only when the installer owns the
change and the current value exactly matches its recorded installed value.

Project files and role outputs outside `.standards/` remain. Reverting those is
a separate user decision. See the exact
[bootstrap reset rules](../../reference/protocol/#greenfield-bootstrap-cancellation).

## Start the next cycle

From `SIGNED_OFF` or retained `CANCELLED`, validate the next request before
replacing the previous cycle's records:

1. Determine baseline reconciliation. After sign-off it is `NONE`. After
   cancellation, keep older unresolved source cycles and include the
   just-cancelled cycle's ID and request unless the user confirms it produced no
   project changes or those changes were reverted.
2. Validate the next mode against the request, project mode, and reconciliation
   needs. Reuse `PendingCycleRequest` if one is saved. Any unresolved
   reconciliation requires `STANDARD`; retained or adopted cancelled changes
   must go through Auditor.
3. If a pending preference is invalid, keep the terminal state and active-work
   record unchanged. Save the request and decision in the pending fields and ask
   the user to resolve them. Follow
   [pending-request rules](../starting-a-cycle/#resolve-a-blocked-request).
4. Once validation succeeds,
   [reserve a new cycle ID](../../reference/runtime-files/#cycle-identity). If
   the registry append fails, do not start the cycle. If a later state write
   fails, keep the ID reserved.
5. Save the new ID and request; reset `Scope`, `Architecture`, `Development`,
   `PromotionReason`, `AuditTarget`, and `BlockedOn` to `NONE`. Clear recovery
   and outstanding obligations, and save the reconciliation list from step 1.
6. Record `Handoff.Kind: NEW_CYCLE`, `From` as the prior terminal state,
   `FailureType: NONE`, and a brief reason. Save the validated `CycleMode` and
   clear all pending fields.
7. Enter `AUDITING` when reconciliation is required. Otherwise use the standard
   entry state for the project, or `DEVELOPING` for eligible expedited work. The
   new cycle must have a mode other than `UNSET`.

Confirmation that the latest cancelled cycle left no changes cannot clear older
unresolved sources. For example, if A left changes and B was cancelled before
checking them, C must still carry A's ID and request even if B changed nothing.

Auditor checks each source against version-control evidence and user input:
accepted baseline, reverted changes, or unresolved work. It blocks on
uncertainty that prevents safe use of the baseline and clears
`BaselineReconciliation` only after resolving all listed sources. Old
**Active-Cycle Non-Baseline Work** entries also need checking; they do not
automatically become exclusions for the new cycle. See
[Auditor's procedure](../../roles/auditor/#promotion-and-cancellation-audits).

After a bootstrap reset, reinstall and choose project mode from the current
project. The new runtime has a new ID registry, but existing cycle-owned files
and provenance still protect old artifacts from reuse.

At sign-off, requesting changes is rework of the active cycle. It is not a new
cycle. See [Human Decisions and Sign-off](../../concepts/human-decisions/).
