---
title: Failure Recovery
description: Fix a problem and return to the work it interrupted.
---

A problem can require an earlier role to revisit its work. **Recovery** keeps
track of the correction, any steps that need repeating, and where to continue
afterward.

Recovery stays within the same cycle.

## Send the problem to its owner

The role that discovers a problem identifies which decision or file is wrong.
That determines who fixes it: requirements go to Scoper, design to Architect,
project facts to Auditor, and so on. See
[ownership](../ownership/#send-problems-to-their-owners).

In expedited work, corrections can go directly only to Developer or
implementation Reviewer. Needing a skipped role means
[promoting to standard work](../states-and-handoffs/#promote-an-expedited-cycle).

User-requested changes use the same recovery process, but are recorded as rework
rather than as an agent-discovered failure.

## Remember where to return

When a correction moves work to another state, the workflow saves a **recovery
frame**: one correction and its return instructions. A correction within the
current state needs no new frame.

The frame records:

| Field          | Meaning                                              |
| -------------- | ---------------------------------------------------- |
| `Owner`        | The state responsible for the correction.            |
| `Reason`       | What needs fixing.                                   |
| `ResumeAt`     | Where the interrupted work should continue.          |
| `RerunThrough` | The last step to repeat before returning, or `NONE`. |

If another problem needs a different state during recovery, it gets a new frame.
Finish the newest correction first, then return to the earlier one. This
preserves both pieces of unfinished work.

## Correct, then decide what to repeat

The role responsible for the active correction fixes it and passes its
completion checks. That role then decides which completed steps need to run
again.

If no steps need repeating, the frame is removed and work returns directly to
`ResumeAt`. Otherwise, the frame stays while the affected roles repeat their
checks. After the last required step, it is removed and work returns to the
interrupted role. Running during recovery does not give a role ownership of the
original correction.

For example, when a design defect is found during testing:

1. Tester sends the design question to Architect. Testing is saved as the return
   point.
2. Architect fixes the design and identifies Developer as the step to repeat.
3. Developer updates and checks the implementation.
4. The frame is removed and Tester resumes.

Each role still requires explicit invocation. Recovery does not automatically
dispatch the next role.

## When a correction must return before full completion

Documenter or Synchronizer may need to fix something for an earlier role that
has not finished its own work. Requiring that unfinished work before returning
the fix would prevent either role from continuing.

In narrowly defined cases, they can verify the specific correction, save the
remaining dependencies, and return while their own record stays incomplete. This
cannot defer an unrelated defect or work that can already be completed, and it
cannot make the cycle ready for sign-off.

The exact conditions are in the
[Documenter](../../reference/protocol/#documenter-corrective-return) and
[Synchronizer](../../reference/protocol/#synchronizer-corrective-return)
corrective-return rules.

## Outstanding obligations

Promoting expedited work changes the route through the workflow. Its old
recovery return points are cleared, but unfinished corrections must survive.
They are saved separately as **outstanding obligations**.

Only corrections that the owning role has not yet completed are carried over
this way. Frames kept solely to repeat later steps do not become new
obligations. Distinct problems stay separate even if the same role owns them.

When the standard workflow reaches the responsible role, it fixes and checks
each saved problem. The verified correction removes that obligation; it does not
by itself complete the role's other work. A role cannot hand off normally with
its own obligations unresolved, and no obligation may remain at sign-off.

Ordinary recovery already tracks its correction in a frame and does not need a
duplicate obligation. See the
[protocol](../../reference/protocol/#outstanding-obligations) for the saved
format and conversion rules.

Recovery finishes when no frames remain. Readiness for sign-off also requires
all applicable completion checks and outstanding corrections to be resolved; see
[workflow completion](../states-and-handoffs/#ready-for-your-decision).
