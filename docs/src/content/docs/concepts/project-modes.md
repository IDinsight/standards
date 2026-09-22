---
title: Greenfield and Brownfield Projects
description:
  Choose the correct starting mode and understand the permanent transition.
---

Project mode describes whether an established implementation baseline exists. It
is independent of the current workflow state and of a skill's internal mode.

## Greenfield

`GREENFIELD` applies when there is no meaningful pre-existing implementation to
preserve. The first cycle starts with Scoper, then Architect, then Auditor.

Before that initial audit, `CONTEXT.md` may legitimately be absent. Scoper and
Architect can work from the request, completed upstream artifacts, and known
constraints. If they actually need unavailable project context, they route that
specific problem to Auditor.

## Brownfield

`BROWNFIELD` applies when meaningful implementation already exists. A `STANDARD`
cycle starts with Auditor so scope and design can depend on a grounded baseline.
A bounded `EXPEDITED` cycle starts with Developer.

A small feature in a large codebase is brownfield work. A new feature does not
make the whole project greenfield.

## Choose the cycle mode

`ProjectMode` describes the project and persists across cycles. `CycleMode` in
`STATE.md` selects the workflow for one cycle:

- **STANDARD:** the full workflow for the project mode. This is the default at
  installation and for new cycles, and the only option for greenfield work.
- **EXPEDITED:** a bounded brownfield change that needs only Developer and
  implementation Reviewer before user sign-off. Skipped roles retain their
  ownership; Developer and Reviewer do not take on their responsibilities.

Select expedited mode explicitly, or invoke Developer as the entry role for a
new bounded implementation request when you have not explicitly selected
`STANDARD`. This entry choice is allowed only before substantive work while the
initialized identifier and request are both `UNSET`, or when starting a new
cycle from a terminal state. It cannot switch an active standard cycle to
expedited. After cancellation, the
[baseline reconciliation rules](../../guides/cancelling-and-new-cycles/#start-the-next-cycle)
restrict expedited entry.

Use expedited mode only while the request is sufficiently bounded and no skipped
role or guarantee is needed. If that changes, use
[one-way promotion](../states-and-handoffs/#promote-an-expedited-cycle) into the
standard brownfield workflow through Auditor.

## The project mode changes once

During the first greenfield cycle, Developer changes `MODE.md` permanently to
`BROWNFIELD` when the first material implementation creation or modification
succeeds. Planning, context, tests, reviews, and documentation alone do not
trigger this transition.

Recovery can subsequently return to `SCOPING` or `ARCHITECTING`, but the project
mode stays `BROWNFIELD`. If `CONTEXT.md` exists, relevant context must be read
even before that permanent mode transition.

## Do not confuse project mode with skill mode

Scoper's `PLAN` and `REPLAN`, Architect's design modes, and Auditor's inspection
modes select a procedure within a role. They do not change project mode, cycle
mode, artifact ownership, or legal transitions.

Cancellation differs before and after the permanent mode change. See
[Cancelling or Starting a New Cycle](../../guides/cancelling-and-new-cycles/).
