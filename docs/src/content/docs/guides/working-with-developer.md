---
title: Working with Developer
description:
  Review Developer's plan, choose how to collaborate, and continue
  implementation.
---

Use this guide when a handoff tells you to invoke Developer, or when you want to
start an eligible expedited change in an existing project. Developer manages the
plan and its progress; you review decisions and give direction when needed. See
[Starting a Cycle](../starting-a-cycle/) for expedited entry.

## Ask for a plan

Invoke Developer when the workflow reaches `DEVELOPING`. You can name a
collaboration mode in the request, for example:

```text
Codex:       $developer Continue from `.standards/STATE.md` in STEPWISE mode.
Claude Code: /developer Continue from `.standards/STATE.md` in STEPWISE mode.
```

Use the line for your client. If you do not specify a mode, Developer uses
`AUTONOMOUS`. It reads the saved request and relevant inputs, checks that it can
proceed, and writes a proposed plan. Review the proposed steps, expected
outcomes, and checks. Ask for changes or explicitly approve the plan before
implementation begins. Developer saves your decision and tracks step progress.
The [Developer page](../../roles/developer/#approval-before-implementation)
explains when another approval is required.

## Choose a personal coding style

You may choose an available personal coding style, such as `tony`, before
approving the first plan. If you do not choose one, Developer records no
personal style; you do not need to edit a field or select `NONE` yourself. Check
the style shown in the proposed plan before approving it. First approval locks
that choice for the cycle, even if the plan is revised later. To use a different
style, you would need to finish or cancel this cycle and start another.
Developer handles the saved selection and lock.

## Choose how to work together

- Use **AUTONOMOUS** to delegate the approved implementation. Developer
  continues until it finishes, needs a decision, or must hand off.
- Use **STEPWISE** to review progress after each step. Developer pauses after
  each completed step and waits for you to continue or request a change.
- Use **CODE_WITH_ME** to implement together. Developer explains the next step
  and inspects code you write. It writes code only when you ask it to handle
  specific approved work, then waits for your next direction.

Tell Developer if you want to switch modes during implementation. It saves the
new choice in the plan. Changing the collaboration mode alone does not require
another plan approval or change the locked coding style.

## Resume or correct implementation

To resume, invoke Developer with the latest handoff or ask it to continue from
`.standards/STATE.md`. It reads the saved plan, checks it against the current
work, and continues from the first incomplete approved step. You do not need to
update step statuses or choose a step yourself.

If you report a defect in previously approved work, Developer reopens the
affected steps and keeps valid completed work. It can move a completed plan back
into progress. If the fix changes the approved implementation approach,
Developer presents a revised plan and waits for your approval before coding.

Self-checks provide implementation feedback. Standard work still goes through
Tester for formal verification and Reviewer for review.

## Continue after expedited promotion

When a promoted cycle returns to Developer, invoke it from the handoff. It
checks the earlier expedited plan against the new scope, design, project
context, and current code. Developer updates the plan's references, reopens any
steps that no longer meet the requirements, and carries forward unresolved
implementation defects. You do not need to edit the plan or workflow records.

Reference updates alone do not need another approval. If the new requirements
change the implementation approach, Developer presents a revised plan for your
approval before continuing. It fixes and checks its outstanding defects before
marking the plan complete.
