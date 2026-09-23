---
title: Cancelling or Starting a New Cycle
description: Understand terminal cycles and the greenfield bootstrap reset.
---

Cancellation ends the current workflow. What happens next depends on whether the
project is still greenfield.

## Cancel brownfield work

Cancelling an active brownfield cycle sets its state to `CANCELLED`. Record the
interrupted state in the handoff, keep active work, and clear recovery. The
workflow files and project work remain.

Cancellation does not revert repository changes or undo commits. Changes left
behind still need to be checked before treating them as part of the project.

## Cancel greenfield bootstrap

While project mode is still `GREENFIELD`, cancellation removes the framework
installation. This is a **bootstrap reset**.

The reset removes workflow files, installed skills, and marked integration
sections that belong to the framework. It preserves project-owned content. A
client setting is reverted only if the installer changed it and its current
value still matches the value the installer recorded.

Project files and role outputs outside `.standards/` remain. Reverting those is
a separate user decision. The exact preservation rules are in
[Greenfield Bootstrap Cancellation](../../reference/protocol/#greenfield-bootstrap-cancellation).

## Start the next cycle

From `SIGNED_OFF` or a saved `CANCELLED` state, select the new `CycleMode`.
`STANDARD` is the default; small brownfield changes may select `EXPEDITED` under
[the cycle-selection rules](../../concepts/project-modes/#choose-the-cycle-mode),
subject to the cancellation restriction below.

Before replacing active work after `CANCELLED`, carry forward any existing
`Active Work.BaselineReconciliation`. Unless the user explicitly confirms that
the just-cancelled cycle left no project changes because none were produced or
they were reverted, append that cycle's unique identifier and brief request
summary. Preserve each unresolved source separately, including older cancelled
cycles; confirmation about the latest cycle does not clear older obligations.

Expedited entry is allowed only when `BaselineReconciliation` is `NONE` after
these steps. Any unresolved reconciliation, or cancelled changes the user wants
to retain or adopt, requires `STANDARD` at `AUDITING`. Auditor determines
whether each source's changes are accepted baseline, reverted, or unresolved,
and blocks rather than silently adopting unresolved changes. Only Auditor clears
the field after all listed sources are reconciled.

For example, if cycle A leaves changes and cycle B is cancelled before
reconciling them, cycle C must keep A's ID and request in the list even if B
produced no changes.

Initialize the new cycle explicitly:

- Set a fresh `Active Work.Id` and the new `Active Work.Request`. Follow the
  [cycle ID rules](../../reference/runtime-files/#cycle-identity).
- Reset `Scope`, `Architecture`, `PromotionReason`, `AuditTarget`, and
  `BlockedOn` to `NONE`, and clear recovery.
- From `SIGNED_OFF`, initialize `BaselineReconciliation: NONE`. From
  `CANCELLED`, preserve and extend it under the rules above instead of resetting
  it with the other cycle fields.
- Record `Handoff.Kind: NEW_CYCLE`, `From` as the prior terminal state, and
  `FailureType: NONE`. Mention required reconciliation concisely in the reason;
  keep the cancelled cycles' IDs and requests in `BaselineReconciliation`.
- For `STANDARD`, enter `SCOPING` in greenfield or `AUDITING` in brownfield. An
  allowed brownfield `EXPEDITED` cycle enters `DEVELOPING`.

The prior cycle stays closed. Auditor must recheck any old **Active-Cycle
Non-Baseline Work** entries against current evidence before using them in the
new cycle. See
[Auditor's procedure](../../roles/auditor/#promotion-and-cancellation-audits).

After a greenfield bootstrap reset, reinstall first and choose the mode again
from the project's actual state. Do not assume that the old mode still applies.

At the sign-off gate, a request for changes is rework of the active cycle, not a
new cycle. See [Human Decisions and Sign-off](../../concepts/human-decisions/).
