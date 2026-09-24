---
title: Starting a New Project
description: Follow the greenfield path from request to implementation baseline.
---

Use this guide when there is no existing implementation to preserve. Complete
[installation](../../getting-started/installation/) before starting.

## Establish scope first

Follow [cycle initialization](../starting-a-cycle/) to reserve an ID and start
`STANDARD` work in `SCOPING`. Then run Scoper to define what to build and how to
check the result.

## Define the design

After Scoper passes its checks, run Architect. It can work from the request,
scope, and known constraints before the first audit. If it needs project facts
that are unavailable, it must ask Auditor to establish them.

## Establish the first project context

Architect hands off to Auditor. Auditor records what already exists in the
repository and any established constraints, keeping those facts separate from
the proposed design.

## Begin implementation

Auditor hands off to Developer, which saves an implementation plan and waits for
your approval before coding. See
[Working with Developer](../working-with-developer/).

As soon as Developer verifies that the cycle has created or materially changed
implementation, including code written by the user, the project
[permanently becomes brownfield](../../concepts/project-modes/#the-project-mode-changes-once).

Continue through the
[remaining standard steps](../../concepts/states-and-handoffs/#standard-forward-paths).
For an example of scope and design, see
[Your First Workflow](../../getting-started/first-workflow/).
