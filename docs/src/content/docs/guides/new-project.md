---
title: Starting a New Project
description: Follow the greenfield path from request to implementation baseline.
---

Use this path when installation finds no meaningful implementation baseline. It
describes the protocol sequence; see
[Installation and Setup](../../getting-started/installation/) for runtime
prerequisites.

## Establish scope first

The initialized mode is `GREENFIELD` and state is `SCOPING`. Record the first
request in active work before substantive work begins, then explicitly invoke
Scoper. Capture outcomes and acceptance conditions before deciding new technical
mechanisms.

## Define the design

After Scoper's gate passes, invoke Architect. Initial greenfield design can
proceed without Auditor context when the request, completed scope, and known
constraints are sufficient. A real missing-context blocker still routes to
Auditor.

## Establish the first project context

Architect's normal handoff goes to Auditor. Auditor uses its greenfield mode to
capture the actual repository or scaffold and established constraints. It must
distinguish the current baseline from proposed design.

## Begin implementation

Auditor's normal handoff goes to Developer. Once Developer first successfully
creates or materially changes project implementation, `MODE.md` changes
permanently to `BROWNFIELD`.

Planning and coordination artifacts alone do not trigger that change. A later
failure that returns to Scoper does not change the mode back.

Continue through the
[remaining workflow gates](../../concepts/states-and-handoffs/). For a worked
planning example, see
[Your First Workflow](../../getting-started/first-workflow/).
