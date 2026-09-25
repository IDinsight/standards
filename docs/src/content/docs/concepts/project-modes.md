---
title: Project and Cycle Modes
description:
  Understand the project starting point and the workflow for a change.
---

STANDARDS uses three kinds of mode:

| Mode         | What it describes                      | Examples                  |
| ------------ | -------------------------------------- | ------------------------- |
| Project mode | Whether implementation already exists. | Greenfield, brownfield    |
| Cycle mode   | Which workflow one change follows.     | Standard, expedited       |
| Role mode    | How an individual role works.          | Developer's STEPWISE mode |

A **cycle** is one piece of work, from its saved request to sign-off or
cancellation. Project mode can span many cycles; choosing a role mode does not
change the workflow.

## Greenfield

A greenfield project has no meaningful existing implementation to preserve. Its
standard workflow starts with Scoper, then Architect, then Auditor: decide what
to build, design it, and check the project context before coding.

Before that first audit, Scoper and Architect can work from known constraints
and completed earlier documents. The absence of Auditor's context file alone
does not block them. If they need facts they cannot safely establish, the work
returns to Auditor. Once relevant context exists, they must use it.

Greenfield projects use standard work only.

## Brownfield

A brownfield project already has meaningful implementation to understand,
preserve, extend, or fix. Adding a new feature to an existing codebase is
brownfield work.

Standard work starts with Auditor so the requirements and design can build on
reliable project facts. A sufficiently bounded implementation change may use the
expedited workflow instead.

## Choose the cycle mode

**STANDARD** is the default. It uses the full workflow, including separate
testing, documentation, final review, and synchronization.

**EXPEDITED** uses Developer and implementation Reviewer before your sign-off
decision. Developer still needs an approved plan. Use it only for a bounded
brownfield change that can be completed safely without the skipped roles;
skipping them does not transfer their responsibilities to Developer.

**UNSET** means no cycle is active. It is the saved value before work starts and
after a retained cycle ends, not a way to run work without checks.

You can save a next-cycle preference before making a request. The agent checks
that preference when the request arrives. Without a saved preference, explicitly
invoking Developer for an eligible brownfield change can select expedited work.
A saved standard preference prevents that inference.

See [Starting a Cycle](../../guides/starting-a-cycle/) for choosing a mode and
resolving an incompatible request. Leftover changes from a cancelled cycle may
require Auditor and standard work; see
[starting the next cycle](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

If expedited work comes to need a skipped role, it
[moves to standard work](../states-and-handoffs/#promote-an-expedited-cycle).
That change is one-way: an active standard cycle cannot become expedited.

## The project mode changes once

During the first greenfield cycle, Developer changes the project permanently to
brownfield as soon as it verifies that implementation has been created or
materially changed. Code written by you during collaboration counts too.
Approving a plan or creating tests, reviews, or documentation alone does not.

Returning to an earlier role does not make the project greenfield again.
Cancellation must also check for implementation, even if the saved mode has not
yet been updated. If implementation exists, cancellation retains the framework
and the cycle record. See
[the cancellation rules](../../guides/cancelling-and-new-cycles/).

The installed `.standards/MODE.md` saves project mode; `.standards/STATE.md`
saves cycle mode and any next-cycle preference.
