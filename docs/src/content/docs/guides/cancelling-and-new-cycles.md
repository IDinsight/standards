---
title: Cancelling or Starting a New Cycle
description:
  End the current cycle or start another without losing track of earlier work.
---

To stop an active cycle, tell the current workflow agent to cancel it. The agent
checks the project mode and follows the appropriate cancellation path. A
bootstrap reset requires your approval before STANDARDS is removed. You do not
need to edit `.standards/STATE.md` or remove workflow files yourself.
Cancellation ends the cycle; it does not undo project changes.

## What happens when you cancel

For an existing project, or a new project that has already gained
implementation, the agent records the cycle as `CANCELLED`. The STANDARDS
installation, saved cycle record, and project files remain. Unfinished
corrections end with the cancelled cycle, but project changes left behind are
not automatically accepted as the baseline for future work.

If the project was still **greenfield**, the agent first checks whether this
cycle created or materially changed any implementation, including code you
wrote. If it did, the project becomes brownfield and uses the retained
`CANCELLED` path above.

If there is no implementation, cancellation requires a **bootstrap reset**. The
agent previews removal with `standards uninstall` if a suitable CLI is installed
globally, or `npx @idinsight/standards@latest uninstall` otherwise. It shows you
the project path, what will be removed or updated, and the exact command, then
asks for your explicit approval. Saying "cancel this cycle" alone does not
approve uninstalling STANDARDS.

Once you approve, the agent runs the command with `--yes` to avoid a second
terminal prompt. The uninstaller removes the entire `.standards/` runtime, the
STANDARDS hooks, and verified STANDARDS role directories for both clients,
including local additions inside them. This deletes saved workflow state,
context, cycle-ID history, and every cycle record in `.standards/docs/`; the
agent warns you about the records before asking for approval. It also removes
marked integration sections and unchanged settings that the installer added.
Project work outside the removed directories remains. See
[Uninstall from a project](../../getting-started/installation/#uninstall-from-a-project)
for the removal boundaries.

While approval is pending, the agent pauses and keeps the installation and
active cycle in place. If you decline, cancellation is not completed; tell the
agent when you want to continue working. If the command is unavailable or fails,
the agent reports the problem and follows the uninstaller's recovery
instructions. It does not finish the reset by deleting files manually. If the
preview changes before execution, the agent asks you to approve the updated
removal. See the
[bootstrap reset rules](../../reference/protocol/#greenfield-bootstrap-cancellation)
for the full procedure.

Reverting project changes is a separate decision. Ask the agent to help with
that work if you want it; cancellation itself does not restore the working tree.

## Start the next cycle

After sign-off or a retained cancellation, give the next request to the
appropriate entry role. For standard work, that is Scoper for a new project or
Auditor for an existing project. An eligible bounded change in an existing
project may start with Developer for expedited work. See
[Starting a Cycle](../starting-a-cycle/) for examples. The agent initializes a
new cycle; you do not reserve an ID or reset fields yourself. The earlier cycle
is not reopened.

After cancellation, the agent checks whether any project changes from that cycle
remain. It may ask you to confirm that no changes were made or that they were
reverted. If changes remain or their status is unresolved, the next cycle uses
standard work and starts with Auditor so it can establish the baseline. An
earlier cancelled cycle's unresolved changes still need checking even if the
most recent cancellation changed nothing. Auditor uses the saved cycle records,
repository evidence, and your answers to decide what is established baseline,
what was reverted, and what remains uncertain.

The agent handles cycle mode validation, pending requests, ID reservation, and
state updates. If a saved mode preference cannot support the new request or
unresolved cancelled work, it asks you to choose another mode, revise the
request, or abandon it. You do not need to repeat a request it already saved.
See the [pending-request rules](../starting-a-cycle/#resolve-a-blocked-request)
and
[Auditor's procedure](../../roles/auditor/#promotion-and-cancellation-audits)
for details.

After a bootstrap reset, STANDARDS must be
[installed again](../../getting-started/installation/) before another cycle. The
installer checks the project's current contents and asks you to choose its mode,
then creates a new runtime and cycle-ID registry. Existing project files and
role outputs remain, including cycle-owned files that cannot be reused as new
work.

At sign-off, requesting changes is rework of the active cycle. It is not a new
cycle. See [Human Decisions and Sign-off](../../concepts/human-decisions/).

## Before merging a branch

Sign off or cancel a cycle before merging its branch into a branch with its own
cycle. Otherwise the merge produces a conflict in `.standards/` that you must
resolve yourself. See
[Branches and merges](../../reference/runtime-files/#branches-and-merges).
