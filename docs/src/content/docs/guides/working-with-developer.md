---
title: Working with Developer
description:
  Approve a plan, choose how to collaborate, and resume implementation.
---

Start when the workflow is in `DEVELOPING`, or use the
[cycle-entry rules](../starting-a-cycle/) for a new expedited request.

## Ask for a plan

For a cycle already in `DEVELOPING`, invoke Developer with your preferred mode:

```text
Codex:       $developer Continue from `.standards/STATE.md` in STEPWISE mode.
Claude Code: /developer Continue from `.standards/STATE.md` in STEPWISE mode.
```

Use the line for your client. Developer reads the current request and required
inputs, checks that the design is sufficient, and saves a proposed plan. Review
its `DEV-NNN` steps, dependencies, outcomes, and self-checks before approving
it. The [Developer page](../../roles/developer/#approval-before-implementation)
explains when approval is required.

## Choose how to work together

- Use **AUTONOMOUS** to delegate the approved implementation. Developer
  continues until it finishes, needs a decision, or must hand off.
- Use **STEPWISE** to review progress after each step. Developer records a
  continuation question in `Active Work.BlockedOn` and waits for your direction.
- Use **CODE_WITH_ME** to implement together. Developer explains the next step
  and inspects code you provide or apply. It writes code only when you ask it to
  handle specific approved work. If you have not directed the next action, it
  records a question and waits.

You can switch modes during implementation. The plan keeps the new choice;
changing collaboration style alone does not require another plan approval.

## Resume or correct implementation

Read the plan at `Active Work.Development`. Steps are `PENDING`, `IN_PROGRESS`,
or `DONE`. Continue from the first incomplete approved step after checking that
the plan still matches the current inputs and repository.

For a defect in previously approved work, reopen only the affected steps and
keep their IDs. A `COMPLETE` plan can return to `IN_PROGRESS`. If the correction
changes the approved implementation intent, Developer proposes the revised plan
and waits for approval before implementing it. Preserve unaffected work.

Self-checks provide implementation feedback. Standard work still goes through
Tester for formal verification and Reviewer for review.

## Continue after expedited promotion

When the standard workflow returns to Developer, the old expedited plan must be
checked against the new scope, design, and refreshed context before coding.
Update its Scope and Architecture paths and replace `EXPEDITED_REQUEST` with
current `AC-NNN` references. Keep valid step IDs and reopen steps whose outcomes
no longer meet the standard requirements.

Carry any Developer-owned outstanding obligations into the plan's corrective
work. Promotion does not resolve those defects. Fix and verify each one before
removing its obligation.

Path and acceptance-reference updates alone need no duplicate approval. Changes
to implementation intent do. The plan cannot remain `COMPLETE` until it meets
the standard requirements and Developer's completion checks.
