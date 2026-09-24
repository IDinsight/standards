---
title: Greenfield and Brownfield Projects
description:
  Choose the correct starting mode and understand the permanent transition.
---

Project mode describes whether the project has an existing implementation to
build on. Cycle mode selects the workflow for one change.

## Greenfield

`GREENFIELD` applies when there is no substantial existing implementation to
preserve. Standard work starts with Scoper, then Architect, then Auditor.

Before the first scheduled audit, Scoper and Architect can run or rerun during
recovery without `CONTEXT.md` when the needed facts are already established.
Missing context alone is not a failure. If the work needs project facts they
cannot safely establish without Auditor, route a `PROJECT_CONTEXT` failure. Once
relevant context exists, they must use it even while still greenfield.

## Brownfield

`BROWNFIELD` applies when substantial implementation already exists. A standard
cycle starts with Auditor; an eligible expedited cycle starts with Developer. A
new feature in an existing codebase is brownfield work.

## Choose the cycle mode

`ProjectMode` in `MODE.md` applies across cycles. `CycleMode` in `STATE.md`
describes the active cycle:

- **UNSET:** no active cycle. No role-owned work may begin yet.
- **STANDARD:** the full workflow; the default for a new request and the only
  execution mode available in greenfield projects.
- **EXPEDITED:** Developer and implementation Reviewer handle a small, clearly
  defined brownfield change before user sign-off. They do not take over skipped
  roles. Developer's plan and approval are still required.

Installation and terminal states use `UNSET`. A user can save an explicit
next-cycle preference in `PendingCycleMode` without activating a cycle. The
request must be checked against that preference before work begins. Without a
pending preference, explicitly invoking Developer for a suitable brownfield
request can select expedited work. A pending standard preference prevents that
inference.

[Starting a Cycle](../../guides/starting-a-cycle/) explains pending requests and
validation. After cancellation,
[additional restrictions apply](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

An active standard cycle cannot switch to expedited work. If an expedited cycle
needs a skipped role or its checks,
[promote it](../states-and-handoffs/#promote-an-expedited-cycle) to standard
work through Auditor. That change is one-way for the cycle.

## The project mode changes once

During the first greenfield cycle, Developer permanently changes `MODE.md` to
`BROWNFIELD` as soon as it verifies that the cycle has created or materially
changed project implementation. The trigger is the implementation, regardless of
whether Developer or the user wrote it. Planning, context, tests, reviews, and
documentation alone do not trigger the change.

Recovery may return to Scoper or Architect, but the project stays brownfield.
Cancellation must check for implementation even if `MODE.md` still says
`GREENFIELD`; existing active-cycle implementation requires the brownfield
transition and retained cancellation. See
[cancellation rules](../../guides/cancelling-and-new-cycles/).

## Do not confuse project mode with skill mode

A skill's internal mode selects how it works. Scoper uses `PLAN` or `REPLAN`;
Developer uses `AUTONOMOUS`, `STEPWISE`, or `CODE_WITH_ME`. These do not change
project mode, cycle mode, or the rules for ownership and handoffs.
