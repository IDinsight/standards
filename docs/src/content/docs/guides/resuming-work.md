---
title: Resuming Interrupted Work
description: Continue an interrupted cycle from its saved work and handoff.
---

To continue after a pause or in a new chat, use the project checkout that
contains the saved STANDARDS files and the work done so far. If you changed
branches or computers, make sure those changes are available first. You do not
need to reconstruct the workflow from chat history or edit its state files.

## Invoke the role named by the handoff

Use the most recent handoff to invoke the role assigned to the current step. For
example, if Architect is next, in Codex run:

```text
$architect Continue the active workflow from .standards/STATE.md.
```

Use `/architect` in Claude Code. Replace the role name with the one in your
handoff. If you are unsure which role owns the next step, ask the agent to
explain the current state before invoking a role. The handoff is a prompt to
continue; it does not start the next role automatically.

The invoked role reads `.standards/PROTOCOL.md`, `.standards/MODE.md`, and
`.standards/STATE.md`, plus any protocol chapter the situation needs, then the
relevant project files and role reports. It checks the saved request, plan
approval, unfinished work, blockers, and any correction or promotion history
before proceeding. The agent handles a saved pending request or new-cycle setup
when applicable. You do not need to inspect these fields or repeat a request
already saved in the state. See [Runtime Files](../../reference/runtime-files/)
for what the files contain.

## What each role does when it resumes

The role decides how to continue from its own saved work:

- **Developer** checks the saved plan, assigned increment or correction, and
  current code, then selects the next dependency-ready approved step with the
  user style saved in the plan. If the plan needs a material revision, it asks
  for your approval before coding. See
  [Working with Developer](../working-with-developer/#resume-or-correct-implementation).
- **Tester** checks its earlier verification report and current files. It
  decides whether it can continue an interrupted check or needs to reassess
  changes. See [Tester modes](../../roles/tester/#modes).
- **Reviewer** checks earlier findings, current inputs, and whether prior
  conclusions still apply. It independently rechecks fixes before resolving
  findings. See [Reviewer resumption](../../roles/reviewer/#modes).
- **Synchronizer** compares the current work with the versions that were
  assessed and updates its record when needed. See
  [Synchronizer resumption](../../roles/synchronizer/#modes).

Other roles likewise read their saved work and any active recovery instructions.
You do not choose a verification mode, reopen plan steps, or decide which
evidence remains valid for them. Tester, Reviewer, Documenter, and Synchronizer
also reload the [user style](../../reference/runtime-files/#user-styles) saved
in their record. Scoper, Architect, Auditor, and Navigator do not save one, so
name your style again when you resume them.

## Keep independent assessments separate

Tester must run in a chat separate from Developer’s implementation chat.
Reviewer must run in a chat separate from the conversations that authored the
work it assesses. Each may resume its own eligible assessment chat. If you are
starting a different chat for either role, follow the handoff’s independent-chat
instructions. The agent checks the saved report and prior evidence; you only
need to start the appropriate chat and invoke the role. See
[independent assessment chats](../../concepts/states-and-handoffs/#independent-assessment-chats).

## Work on more than one branch

Commit `.standards/` with your other changes. Each branch can carry one active
cycle, and whoever checks out the branch continues that cycle from its saved
state. To start over on a branch instead, including one created from a branch
with an active cycle, cancel the cycle or run
[`standards reset`](../../getting-started/installation/#reset-the-workflow). If
your main branch has STANDARDS installed, run `standards reset` in the feature
branch before merging so main keeps a fresh installation. If main has no
installation,
[uninstall STANDARDS](../../getting-started/installation/#uninstall-from-a-project)
on the feature branch before merging.

If you merge two branches that both changed `.standards/` without a reset, you
resolve the merge conflict yourself by keeping exactly one cycle in `STATE.md`.
An agent that finds unresolved conflict markers stops and asks you to resolve
them. See
[Branches and merges](../../reference/runtime-files/#branches-and-merges).

## Answer decisions that are waiting on you

If the role paused for a question, answer it in that role’s chat. The agent
saves your answer and clears the blocker when it can continue. A proposed
Developer plan still needs your explicit approval before implementation. At
`AWAITING_USER_SIGNOFF`, review the finished work and decide whether to accept
it, request changes, or cancel.

After sign-off or a retained cancellation, a new request starts a
[new cycle](../cancelling-and-new-cycles/#start-the-next-cycle). After a
bootstrap reset or `standards reset`, a new request starts the first cycle from
the fresh state. Navigator can explain available project evidence at any time,
but cannot advance the workflow.
