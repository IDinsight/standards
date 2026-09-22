---
title: Cancelling or Starting a New Cycle
description: Understand terminal cycles and the greenfield bootstrap reset.
---

Cancellation ends the current workflow. Its effect depends on whether the
project is still in greenfield bootstrap mode.

## Cancel brownfield work

An explicit cancellation transitions an active brownfield cycle to `CANCELLED`.
The handoff records the interrupted state, preserves active work for
traceability, and clears recovery. The runtime and project artifacts remain.

Cancellation does not revert repository changes or undo commits. Changes left
behind are not automatically established project baseline.

## Cancel greenfield bootstrap

If Developer has not yet produced a material implementation change and mode is
still `GREENFIELD`, cancellation resets the framework installation rather than
retaining a terminal runtime.

The reset removes framework-owned runtime and injected skill files, and removes
bounded integration blocks while preserving project-owned content. Client
settings are reverted only when installation metadata owns the setting and its
current value still matches the recorded installed value.

Project files and role-owned artifacts outside the runtime remain. Reverting
those is a separate user decision. The exact preservation rules are in
[Greenfield Bootstrap Cancellation](../../reference/protocol/#greenfield-bootstrap-cancellation).

## Start the next cycle

From `SIGNED_OFF` or a retained `CANCELLED` state, select the new `CycleMode`.
`STANDARD` is the default; bounded brownfield work may select `EXPEDITED` under
[the cycle-selection rules](../../concepts/project-modes/#choose-the-cycle-mode),
subject to the cancellation restriction below.

After `CANCELLED`, expedited entry requires explicit user confirmation that no
project changes from the cancelled cycle remain, because none were produced or
they were reverted. If changes remain, the user wants to retain them, or that
confirmation is absent, start `STANDARD` at `AUDITING` for baseline
reconciliation. Before replacing the old active work, preserve its identifier
and a brief request summary in `Handoff.Reason`, and state that reconciliation
after cancellation is required. Auditor uses this provenance to establish
whether the old changes are accepted baseline, reverted, or unresolved; it must
block rather than silently adopt unresolved changes.

Initialize the new cycle explicitly:

- Set a new `Active Work.Id` and `Active Work.Request`.
- Reset `Scope`, `Architecture`, `PromotionReason`, `AuditTarget`, and
  `BlockedOn` to `NONE`, and clear recovery.
- Record `Handoff.Kind: NEW_CYCLE`, `From` as the prior terminal state, and
  `FailureType: NONE`. Give a concise reason, including cancellation provenance
  whenever reconciliation is required.
- For `STANDARD`, enter `SCOPING` in greenfield or `AUDITING` in brownfield. An
  allowed brownfield `EXPEDITED` cycle enters `DEVELOPING`.

The prior cycle is not reopened. Any old cycle's context exclusions are stale
and must be reconciled on the next audit, not copied into the new cycle as
current exclusions.

After a greenfield bootstrap reset, reinstall first and choose the mode again
from the project's actual state. Do not assume that the old mode still applies.

At the sign-off gate, a request for changes is rework of the active cycle, not a
new cycle. See [Human Decisions and Sign-off](../../concepts/human-decisions/).
