---
title: Cancelling or Starting a New Cycle
description:
  End the current cycle or start another without losing track of earlier work.
---

To stop an active cycle, tell the current workflow agent to cancel it. The agent
checks the project mode and follows the appropriate cancellation path. A
bootstrap reset requires your approval before it runs. You do not need to edit
`.standards/STATE.md` or remove workflow files yourself. Cancellation ends the
cycle; it does not undo project changes.

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

If there is no implementation, cancellation is a **bootstrap reset**, done with
[`standards reset`](../../getting-started/installation/#reset-the-workflow). The
agent first previews it for the project with `--dry-run`. It uses
`standards reset --mode greenfield` if your global CLI has the version recorded
in `.standards/VERSION.json`, or
`npx @idinsight/standards@<that version> reset --mode greenfield` otherwise. It
shows you the project path, the planned changes, any warnings, and the exact
command, then asks for your explicit approval. Saying "cancel this cycle" alone
does not approve the reset.

Once you approve, the agent runs the command with `--yes` to avoid a second
terminal prompt. The reset deletes the saved workflow state, Auditor context,
and every cycle record in `.standards/docs/`; the agent warns you about the
records before asking for approval. It writes a fresh workflow state and keeps
the project greenfield, so no `CANCELLED` state remains. The skills, stop hook,
client settings, and your user styles stay installed, and project work outside
`.standards/` remains.

While approval is pending, the agent saves the question, pauses, and keeps the
active cycle in place. If you decline, cancellation is not completed; tell the
agent when you want to continue working. If a matching CLI is unavailable or the
reset fails, the agent reports the problem and any backups the CLI keeps. It
does not finish the reset by deleting or rewriting files itself. If the preview
changes before execution, the agent asks you to approve the updated reset. See
the
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
new cycle; you do not create an ID or clear fields yourself. The earlier cycle
is not reopened.

After cancellation, the agent checks whether any project changes from that cycle
remain. It may ask you to confirm that no changes were made or that they were
reverted. If changes remain or their status is unresolved, the next cycle uses
standard work and starts with Auditor so it can establish the baseline. An
earlier cancelled cycle's unresolved changes still need checking even if the
most recent cancellation changed nothing. Auditor uses the saved cycle records,
repository evidence, and your answers to decide what is established baseline,
what was reverted, and what remains uncertain.

The agent handles cycle mode validation, pending requests, ID generation, and
state updates. If a saved mode preference cannot support the new request or
unresolved cancelled work, it asks you to choose another mode, revise the
request, or abandon it. You do not need to repeat a request it already saved.
See the [pending-request rules](../starting-a-cycle/#resolve-a-blocked-request)
and
[Auditor's procedure](../../roles/auditor/#promotion-and-cancellation-audits)
for details.

After a bootstrap reset, STANDARDS stays installed and your next request starts
a first greenfield cycle from the fresh state. Your implementation, tests, and
documentation outside `.standards/` remain, including a project scope or design
document the cancelled cycle reused there. The reset deleted the cycle's records
in `.standards/docs/`, such as its plan and reports, and its Auditor context, so
the new cycle starts without them.

At sign-off, requesting changes is rework of the active cycle. It is not a new
cycle. See [Human Decisions and Sign-off](../../concepts/human-decisions/).

## Before merging a branch

If your main branch has STANDARDS installed, run
[`standards reset`](../../getting-started/installation/#reset-the-workflow) on
the feature branch before merging. The main branch then keeps a fresh
installation, and branches created from it start with no cycle. If your main
branch has no installation, you can instead
[uninstall STANDARDS](../../getting-started/installation/#uninstall-from-a-project)
on the feature branch before merging. To start over on a branch that carries a
cycle, including one created from a branch with an active cycle, cancel the
cycle or reset. If you merge two branches that both changed `.standards/`
without a reset, you resolve the conflict yourself by keeping exactly one cycle
in `STATE.md`. See
[Branches and merges](../../reference/runtime-files/#branches-and-merges).
