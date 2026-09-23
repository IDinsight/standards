---
title: Greenfield and Brownfield Projects
description:
  Choose the correct starting mode and understand the permanent transition.
---

Project mode describes whether the project has an existing implementation to
build on. Cycle mode selects the workflow for one change.

## Greenfield

`GREENFIELD` applies when there is no substantial existing implementation to
preserve. The first cycle starts with Scoper, then Architect, then Auditor.

Before that first audit, `CONTEXT.md` may not exist. Scoper and Architect can
use the request, completed work from earlier roles, and known constraints. If
they need missing project facts, they send that question to Auditor.

## Brownfield

`BROWNFIELD` applies when substantial implementation already exists. A
`STANDARD` cycle starts with Auditor to check what is already in place. An
`EXPEDITED` cycle starts with Developer.

A new feature in an existing codebase is brownfield work.

## Choose the cycle mode

`ProjectMode` in `MODE.md` applies across cycles. `CycleMode` in `STATE.md`
selects the workflow for one cycle:

- **STANDARD:** the full workflow. This is the default at installation and for
  new cycles, and the only option for greenfield work.
- **EXPEDITED:** Developer and implementation Reviewer handle a small, clearly
  defined brownfield change before user sign-off. They do not take on the jobs
  of skipped roles.

You can select expedited mode explicitly. Running Developer as the first role
for a new, clearly defined implementation request also selects it, unless you
have explicitly chosen `STANDARD`.

You can make this choice only before work begins, while the initialized ID and
request are both `UNSET`, or when starting a new cycle after sign-off or
cancellation. You cannot switch an active standard cycle to expedited work.
After cancellation,
[additional restrictions apply](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

If the change needs a skipped role or its checks,
[promote the cycle](../states-and-handoffs/#promote-an-expedited-cycle) to
standard work through Auditor.

## The project mode changes once

During the first greenfield cycle, Developer permanently changes `MODE.md` to
`BROWNFIELD` after first creating or making a significant change to project
implementation. Planning, context, tests, reviews, and documentation alone do
not trigger this change.

Recovery may return to Scoper or Architect, but the project stays `BROWNFIELD`.
If `CONTEXT.md` exists, roles must read the relevant context even while the
project is still greenfield.

## Do not confuse project mode with skill mode

A skill's internal mode selects how that role works. For example, Scoper uses
`PLAN` to create scope and `REPLAN` to revise it. These modes do not change
project mode, cycle mode, or the rules for role ownership and handoffs.

See [cancellation rules](../../guides/cancelling-and-new-cycles/) for what
happens before and after the change to brownfield.
