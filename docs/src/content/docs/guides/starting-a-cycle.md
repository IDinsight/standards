---
title: Starting a Cycle
description:
  Select a mode, resolve pending decisions, and reserve a new cycle ID.
---

Installation prepares the workflow files; it does not start a request.
`CycleMode: UNSET` means no cycle is active. Before a workflow role does its
work, the agent must validate the mode, reserve an ID, and save the request.

## Choose a mode and give the request

You can choose a mode before describing the work, for example:

```text
Use STANDARD for my next cycle.
```

The agent saves this as `PendingCycleMode`. It leaves the previous active-work
record unchanged. You can replace or clear this preference before the next cycle
starts.

When the request arrives, the saved preference takes priority. Without one,
`STANDARD` is the default. Explicitly invoking Developer for a small, clearly
defined brownfield change can select `EXPEDITED`. A pending `STANDARD`
preference prevents that inference. See
[project and cycle modes](../../concepts/project-modes/).

For example, in an installed brownfield project with no active cycle or pending
preference, a request might be:

```text
$developer Fix the typo in the CLI's existing error message.
```

Use `/developer` in Claude Code. The agent must still check that the request
needs no skipped role and that cancelled work does not require an audit.
Developer then prepares a plan for approval; invocation does not approve a plan
that has not been written yet.

## Resolve a blocked request

If the selected mode cannot handle the request, the agent must not silently
switch it to standard work. It saves the request in `PendingCycleRequest` and
the required decision in `PendingCycleBlockedOn`. No new cycle starts, and
`Active Work.BlockedOn` remains untouched.

Choose a supported mode, revise the request, or abandon it. Replacing or
clearing the pending mode rechecks the saved request, so you do not need to
repeat it. Abandoning the request clears its request and blocker fields; a mode
preference can remain for later work. Greenfield projects cannot save an
expedited preference.

## Reserve the ID before starting work

After mode validation, the agent follows the
[cycle ID allocation rules](../../reference/runtime-files/#cycle-identity):
create an ID with a request name and a fresh token, check for collisions, and
save it in `.standards/CYCLE_IDS.md` before assigning it to `Active Work.Id`. A
failed initialization never makes a reserved ID reusable.

For the first cycle, save the request and validated `CycleMode`, clear all
pending fields, and keep the `INITIAL` handoff. Scope, Architecture, and
Development start at `NONE`; recovery and outstanding obligations are inactive.
Standard work enters `SCOPING` in greenfield or `AUDITING` in brownfield.
Eligible expedited work enters `DEVELOPING`.

From `SIGNED_OFF` or retained `CANCELLED`, use the
[new-cycle procedure](../cancelling-and-new-cycles/#start-the-next-cycle)
instead. It preserves any required checks of cancelled changes and records
`NEW_CYCLE`. Resolving a pending request must still follow that procedure.

The selected entry role must be explicitly invoked before doing its work. Saving
a mode or a request alone does not run a skill.
