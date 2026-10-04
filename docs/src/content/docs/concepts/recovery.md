---
title: Failure Recovery
description: Fix a problem and return to the work it interrupted.
---

A problem can require an earlier role to revisit its work. **Recovery** keeps
track of the correction, any steps that need repeating, and where to continue
afterward.

Recovery stays within the same cycle.

## How the agent routes a problem

The role that discovers a problem identifies which decision or file is wrong,
records a handoff to its owner, and gives you the next role to invoke. You do
not need to choose the owner or update the workflow state yourself. Requirements
go to Scoper, design to Architect, project facts to Auditor, and so on. See
[ownership](../ownership/#send-problems-to-their-owners).

In expedited work, corrections can go directly only to Developer or
implementation Reviewer. Needing a skipped role means
[promoting to standard work](../states-and-handoffs/#promote-an-expedited-cycle).

User-requested changes use the same recovery process, but are recorded as rework
rather than as an agent-discovered failure.

## Remember where to return

When a correction moves work to another state, the agent saves a **recovery
frame**: one correction and its return instructions. A correction within the
current state needs no new frame.

The frame records:

| Field          | Meaning                                              |
| -------------- | ---------------------------------------------------- |
| `Owner`        | The state responsible for the correction.            |
| `Reason`       | What needs fixing.                                   |
| `ResumeAt`     | Where the interrupted work should continue.          |
| `RerunThrough` | The last step to repeat before returning, or `NONE`. |

If another problem needs a different state during recovery, the agent saves a
new frame. The agents address the newest correction first, then return to the
earlier one. This preserves both pieces of unfinished work.

## Correct, then decide what to repeat

The role responsible for the active correction fixes it and passes its
applicable checks. It then decides which already-produced work needs to run
again, including affected implementation or tested increments in unfinished
phases. Unimplemented future work alone does not require a rerun.

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

Developer and Tester can correct a specific defect or repeat affected checks
without completing unrelated future implementation. They save the interrupted
assignment in their existing plan or report before routing the correction, then
restore it and reconcile changed inputs on return. This applies with either
verification cadence; switching cadence does not change a recovery assignment or
its return route.

For example, Developer may need Tester to fix an assertion while later build
steps are still pending. Tester verifies the correction and returns so Developer
can continue those steps. The report remains incomplete. Nested corrections
preserve each interrupted assignment, and ordinary incremental checkpoints
resume only after recovery ends. Every return to Reviewer still requires full
Developer and Tester completion. See the
[implementation and verification recovery gates](../../reference/protocol/#implementation-and-verification-recovery-gates).

Documenter or Synchronizer may need to fix something for an earlier role that
has not finished its own work. Requiring that unfinished work before returning
the fix would prevent either role from continuing.

In narrowly defined cases, they can verify the specific correction, save the
remaining dependencies, and return while their own record stays incomplete. This
cannot defer an unrelated defect or work that can already be completed, and it
cannot make the cycle ready for sign-off.

**Documenter example:** During an early audit, Auditor finds that the project's
setup guide gives an obsolete command. Documenter corrects the command and
checks it against the actual tooling. The guide for the new feature cannot be
finished because the feature has not been built. Documenter records that
remaining dependency, returns to Auditor with its record still incomplete, and
finishes the feature guide when the workflow later reaches documentation.

**Synchronizer example:** Final Reviewer finds that the synchronization record
points to an outdated test result and cannot finish its review. Synchronizer
corrects the reference and checks it against the current result, then returns to
Reviewer with its own record still incomplete. Reviewer reassesses its finding;
Synchronizer later checks the completed review before the cycle can be offered
for sign-off.

The protocol defines these
[corrective returns](../../reference/protocol/#corrective-returns); the
Documenter and Synchronizer skills add each role's own conditions.

## Corrections when finishing after implementation review

The shorter standard policy omits normal documentation, final review, and
synchronization. Their owners can still receive required corrections through
recovery. The agent keeps the selected policy and repeats only work affected by
the correction, including any existing reports from omitted phases.

If a correction changes the evidence for early completion, implementation
Reviewer must reassess it before the cycle returns to sign-off readiness. An old
`ELIGIBLE` result is not enough for changed work.

For example, Synchronizer may correct an existing evidence reference even though
normal final review was omitted. If its full assessment cannot pass without that
omitted review, its record stays incomplete. When returning to sign-off, it
keeps the recovery frame and sends the work through implementation Reviewer
first. It cannot mark synchronization complete just to close the frame.

If a later upstream fix changes that same evidence, Synchronizer can recheck the
earlier correction under another role's saved recovery plan. The narrow
[corrective-rerun rule](../../reference/protocol/#synchronizer-corrective-reruns)
allows its record to remain incomplete, preserves older frames, and still
requires Reviewer reassessment before sign-off. Missing required implementation,
testing, or documentation cannot use this exception.

See
[Finishing After Implementation Review](../../guides/finishing-after-implementation-review/)
for the choice and the checks it retains.

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

**Unfinished correction example:** In expedited work, Reviewer finds that an
error response leaks an internal exception. While Developer is correcting it,
the agent discovers that safe completion also needs an authentication-error
design decision from Architect, a role the expedited path skips. The agent
promotes the cycle and saves the still-unfixed leak as a Developer obligation.
When standard work reaches Developer, it fixes and checks the leak before its
normal handoff.

**Correction already finished example:** Suppose Developer has fixed and checked
an expedited defect, and its recovery frame remains only to repeat a later
assessment. If the cycle is promoted for a separate reason, that frame does not
create a new obligation for the defect Developer already fixed. The standard
roles still assess the current work before sign-off.

Ordinary recovery already tracks its correction in a frame and does not need a
duplicate obligation. See the
[protocol](../../reference/protocol/#outstanding-obligations) for the saved
format and conversion rules.

Recovery finishes when no frames remain. Readiness for sign-off also requires
all applicable completion checks and outstanding corrections to be resolved; see
[workflow completion](../states-and-handoffs/#ready-for-your-decision).
