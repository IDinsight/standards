---
title: Working with Developer
description:
  Approve Developer's plan, choose how to collaborate, and alternate with
  Tester.
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

Use the line for your client. For a new plan, Developer defaults to `AUTONOMOUS`
unless you choose another mode. When resuming, it uses the mode saved in the
plan unless you ask to switch. It reads the saved request and relevant inputs,
checks that it can proceed, and creates or resumes the plan. For a proposed
plan, review the steps, expected outcomes, and checks. Ask for changes or
explicitly approve it before implementation begins. Developer saves your
decision and tracks step progress. Resuming an unchanged approved plan does not
require another approval. The
[Developer page](../../roles/developer/#approval-before-implementation) explains
when another approval is required.

## Choose a user style

You may choose a [user style](../../reference/runtime-files/#user-styles) you
keep at `.standards/user-styles/developer/<name>.md`, such as `tony`, before
approving the first plan. If you do not choose one, Developer records no user
style; you do not need to edit a field or select `NONE` yourself. Check the
style shown in the proposed plan before approving it. First approval locks that
choice for the cycle, even if the plan is revised later. To use a different
style, you would need to finish or cancel this cycle and start another.
Developer handles the saved selection and lock.

## Choose how to work together

- Use **AUTONOMOUS** to delegate the approved implementation. Developer
  continues until it finishes, needs a decision, or must hand off.
- Use **STEPWISE** to review progress after each step. Developer pauses after
  each completed step unless it is ready to hand off the assigned outcome.
- Use **CODE_WITH_ME** to implement together. Developer explains the next step
  and inspects code you write. It writes code only when you ask it to handle
  specific approved work, then hands off a ready outcome or waits for your next
  direction.

Tell Developer if you want to switch modes during implementation. It saves the
new choice in the plan. Changing the collaboration mode alone does not require
another plan approval or change the locked coding style.

## Choose when Tester runs

In standard work, **verification cadence** controls when Developer hands work to
Tester. It works with all three collaboration modes:

| Cadence                          | When testing happens                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `AFTER_IMPLEMENTATION` (default) | Finish all approved implementation, then run full verification.                                                 |
| `INCREMENTAL`                    | Alternate implementation and verification of testable outcomes, then establish full completion before Reviewer. |

For example, tell Developer: “Use INCREMENTAL verification for this cycle.”
Developer groups approved steps into **increments**: observable outcomes that
Tester can assess independently. An increment may cover one acceptance condition
or a small group of dependent conditions, and may need several development
steps. Later increments can revisit an earlier condition or step; Tester
reconciles any tests and evidence affected by the new work.

### Alternate between two chats

Keep one Developer chat and one independent Tester chat open for the same cycle
and project checkout. The Tester chat must have no Developer implementation
history. Reuse it for later increments, working in only the chat assigned by the
saved workflow state at each point:

1. Developer implements and self-checks the selected outcome, saves its
   evidence, and gives you a Tester invocation when the increment is ready.
2. Run that invocation in the Tester chat. Tester checks the outcome and
   affected earlier behavior, updates coverage, and saves the results.
3. After a passing checkpoint, run the return invocation in the Developer chat.
   Developer reloads the plan and report, reconciles the result, and continues
   under your collaboration mode. Follow any corrective handoff first if a
   problem was found.

`STEPWISE` still pauses between development steps within an unfinished
increment. After a Tester return, you control whether it implements the next
step. `CODE_WITH_ME` still needs your direction for specific coding work. A
passing assessment does not grant additional coding permission.

Once all approved implementation and Developer checks are complete, Developer
hands off to Tester for full verification. Tester reconciles the final work
against every current acceptance condition and relevant technical criterion
before handing off to Reviewer. Passing individual increments does not replace
that final gate.

### Switch cadence during a cycle

Tell the current workflow role “Switch to AFTER_IMPLEMENTATION” or “Switch to
INCREMENTAL.” You can request this before a plan exists or while testing or
recovery is in progress. The agent saves the latest choice. A request matching
the effective cadence cancels an opposite pending choice.

Developer applies the request at its next normal development boundary, before
more implementation or a new checkpoint. Already assigned Tester work and its
required return finish first; recovery follows its saved route before the switch
takes effect. The agent tells you whether the change was applied or is still
pending.

Switching to `INCREMENTAL` groups the remaining work into testable outcomes;
already implemented work can be the next assessment. Switching to
`AFTER_IMPLEMENTATION` clears the current increment selection and schedules
remaining implementation before full verification. Previous increment
definitions and evidence stay available. Regrouping unchanged approved steps
needs no new approval; material plan changes still do.

The choice applies only to the active cycle. If no implementation or increment
scheduling remains, the agent clears the request and explains that it has no
remaining effect. Requesting `INCREMENTAL` during expedited work authorizes
[promotion to standard work](../../concepts/states-and-handoffs/#promote-an-expedited-cycle),
starting with the required Auditor handoff.

## Resume or correct implementation

To resume, invoke Developer with the latest handoff or ask it to continue from
`.standards/STATE.md`. It reads the saved plan, checks it against the current
work, and selects the next dependency-ready approved step for the current
assignment. You do not need to update step statuses or choose a step yourself.

If you report a defect in previously approved work, Developer reopens the
affected steps and keeps valid completed work. It can move a completed plan back
into progress. If the fix materially changes approved build steps, dependencies,
behavior, or the technical approach, Developer presents a revised plan and waits
for your approval before coding.

Self-checks provide implementation feedback. Standard work still goes through
Tester for formal verification and Reviewer for review.

## Continue after expedited promotion

When a promoted cycle returns to Developer, invoke it from the handoff. It
checks the earlier expedited plan against the new scope, design, project
context, and current code. Developer updates the plan's references, reopens any
steps that no longer meet the requirements, and carries forward unresolved
implementation defects. You do not need to edit the plan or workflow records.

Reference updates alone do not need another approval. If the new requirements
materially change approved build steps, dependencies, behavior, or the technical
approach, Developer presents a revised plan for your approval before continuing.
It fixes and checks its outstanding defects before marking the plan complete.
