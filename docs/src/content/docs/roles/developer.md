---
title: Developer
description: Approve a plan and choose how to work on the implementation.
---

Developer writes the implementation and keeps a plan of its progress. You
approve the plan before coding begins and choose how closely to work together.

## When to use Developer

Run Developer in `DEVELOPING`, after the earlier roles finish or when an
implementation needs correction. You can also invoke it to start an eligible,
bounded expedited change in an existing project; the
[cycle-entry rules](../../guides/starting-a-cycle/) still apply.

```text
Codex:       $developer Continue from .standards/STATE.md in STEPWISE mode.
Claude Code: /developer Continue from .standards/STATE.md in STEPWISE mode.
```

## Inputs and output

In standard work, Developer uses the completed scope, design, and valid Auditor
context. In expedited work, the saved request defines the change. If safe
completion needs a skipped role, the cycle moves to the standard workflow.

Alongside code changes, Developer saves a
[development plan](../../reference/templates/developer/), normally at
`docs/development/<Active Work.Id>.md`. Your project's required plan directory
can differ; the filename must still identify this cycle. The path is recorded in
`Active Work.Development`.

Each step has an ID such as `DEV-001`, an expected outcome, dependencies,
progress, and a way to check the implementation. Standard steps refer to the
scope's acceptance IDs; expedited steps refer to the saved request.

## Approval before implementation

Developer presents a saved proposal and waits for your explicit approval. It
asks again if the plan changes the intended behavior, technical approach, or
other important implementation work.

Fixing a defect within an unchanged approved plan does not need another
approval. Developer reopens the affected steps and preserves completed work that
is still valid. Minor wording or bookkeeping changes also need no new approval.

## Modes

You can switch modes during implementation. Your choice is saved with the plan.
See [Working with Developer](../../guides/working-with-developer/) for resuming
work and updating a plan after expedited promotion.

### AUTONOMOUS

The default. Developer works through approved steps without routine pauses.

### STEPWISE

Developer completes and checks one step, reports the result, then waits for you
to continue.

### CODE_WITH_ME

Developer explains the next step and inspects code you write. It writes or takes
over specific approved work when you ask.

## Coding style and responsibilities

Developer follows project constraints and applicable coding guidance. You can
explicitly select a personal style, such as `tony`, before the first plan
approval. That approval locks the selection, including no personal style, for
the rest of the cycle. A different selection requires a new cycle. An
unavailable locked profile must be restored before implementation continues.

Developer makes local coding choices within the agreed design. Requirements,
consequential design decisions, and project context stay with their owners. It
may run existing tests for feedback; Tester writes formal tests and verifies the
change independently.

## Completion and handoff

Developer finishes when all approved steps are done, the implementation meets
the agreed requirements, its checks are satisfactory, and no unresolved
Developer correction or blocking question remains.

Standard work goes to Tester; expedited work goes to implementation Reviewer.
Both require the [separate assessment chat](../overview/#run-a-role) described
by the handoff. Recovery may direct a different return.

For a new project, Developer records the permanent change to brownfield as soon
as it verifies the first implementation was created or materially changed. This
includes code you wrote together; approving the plan alone is not enough.
