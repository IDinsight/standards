---
title: Starting a New Project
description: Follow the greenfield path from request to implementation baseline.
---

Use this guide when there is no existing implementation to preserve. Complete
[installation](../../getting-started/installation/) before starting.

## Establish scope first

Invoke Scoper with your request. The agent handles
[cycle initialization](../starting-a-cycle/), including reserving an ID and
starting `STANDARD` work in `SCOPING`. Scoper then defines what to build and how
to check the result.

## Define the design

After Scoper passes its checks, run Architect. It can work from the request,
scope, and known constraints before the first audit. If it needs project facts
that are unavailable, it gives you a handoff to invoke Auditor to establish
them.

## Establish the first project context

When Architect hands off, invoke Auditor. Auditor records what already exists in
the repository and any established constraints, keeping those facts separate
from the proposed design.

## Begin implementation

When Auditor hands off, invoke Developer. Developer saves an implementation plan
and waits for your approval before coding. See
[Working with Developer](../working-with-developer/).

As soon as Developer verifies that the cycle has created or materially changed
implementation, including code written by the user, the project
[permanently becomes brownfield](../../concepts/project-modes/#the-project-mode-changes-once).

Continue through the
[remaining standard steps](../../concepts/states-and-handoffs/#standard-forward-paths).
For an example of scope and design, see
[Your First Workflow](../../getting-started/first-workflow/).
