---
title: Failure Recovery
description:
  Fix a problem, repeat affected steps, and return to interrupted work.
---

Recovery records what needs fixing and where work should return afterward. It
lets an earlier role correct a problem without losing track of unfinished work.

## Follow the active cycle mode

In `EXPEDITED`, a failure can go directly only to Developer for `IMPLEMENTATION`
or to implementation Reviewer for `REVIEW`. If a skipped role is needed,
[promote the cycle](../states-and-handoffs/#promote-an-expedited-cycle).
Promotion saves unfinished corrections as outstanding obligations before
clearing expedited recovery routes and starting standard work through Auditor.

## Route by the defective artifact

In standard work, send unclear requirements to Scoper (`SCOPING`), missing
design decisions to Architect (`ARCHITECTURE`), and wrong project facts to
Auditor (`PROJECT_CONTEXT`). A review failure must name which review is
affected.

A `FAILURE` or `USER_REWORK` handoff to a different state adds a **recovery
frame**: a record of one correction. A correction within the same state records
the handoff without adding a frame.

## Read the active frame

Frames form a stack. Work on the newest frame first, keeping older ones until
their corrections are complete. The active frame records:

- `Owner`: the state responsible for the fix.
- `Reason`: what needs fixing.
- `ResumeAt`: where work was interrupted and must return.
- `RerunThrough`: the last step to repeat before returning, or `NONE`.

Only the role in the frame's `Owner` state decides which completed work needs to
be repeated. Other roles may run during recovery without owning the frame.

## Correct, then decide what to repeat

The owner fixes the problem and passes its completion checks. If no later work
needs repeating, remove the frame and return to `ResumeAt`. Otherwise, set
`RerunThrough` and start the first step that needs repeating.

There are two narrow exceptions to requiring the full gate before planning a
return:
[Documenter Corrective Return](../../reference/protocol/#documenter-corrective-return)
and
[Synchronizer Corrective Return](../../reference/protocol/#synchronizer-corrective-return).
They let an owner return a verified correction when unfinished work in the
preserved recovery route prevents full completion. The owner's record stays
incomplete with its dependencies saved. These exceptions do not bypass an
independent defect or authorize normal forward completion; routing still follows
the same recovery algorithm.

Those roles keep the frame while passing their usual checks. When `RerunThrough`
finishes, remove the frame and return to `ResumeAt`. Use `RESUME` for that
return and for other recovery steps that are not normal forward steps.

## Example: design defect found during testing

```text
TESTING → ARCHITECTING    Record the fix; ResumeAt is TESTING.
ARCHITECTING → DEVELOPING Repeat implementation; RerunThrough is DEVELOPING.
DEVELOPING → TESTING      Remove the frame and resume testing.
```

Here, only implementation needs repeating before testing resumes. Other fixes
may require more steps.

## Nested failures remain separate

If another failure or user-requested change needs a different state during
recovery, add a new frame. Finish it before returning to the older correction.
Recovery routing ends when no frames remain. Outstanding obligations may still
need correction before sign-off.

## Outstanding obligations

Promotion replaces expedited recovery routes, but must not lose unfinished
corrections. Before clearing the stack:

- Convert each frame with `RerunThrough: NONE` into an obligation, preserving
  its `Owner`, `FailureType`, and `Reason` in stack order. Its owner has not yet
  completed the correction.
- Do not convert frames with a non-`NONE` `RerunThrough`. Their owners already
  passed the corrective gate; only the old rerun and return route remains.
- Keep distinct defects separate, even when they share an owner. Obligations
  have no `From`, `ResumeAt`, or `RerunThrough`.

An obligation stays saved until its owning state is reached and that role fixes
and verifies the specific defect. Remove it as soon as that correction is
verified, then finish the role's remaining completion checks. Removing it does
not by itself complete the role. The role cannot hand off normally while an
unresolved obligation owned by its state remains.

Set the section's `Active` field to `false` and remove numbered entries when the
last obligation is removed. Sign-off is blocked while any obligation remains.
Ordinary recovery uses its frame to track the defect; it does not also create a
duplicate obligation.

For example, if Developer promotes while fixing a review finding, the unfinished
implementation correction remains an obligation. When the standard workflow
returns to Developer, that defect must be fixed and checked before its
obligation is removed. The old expedited return route is no longer used.

## Recovery before the first greenfield audit

Scoper and Architect can rerun before Auditor has created `CONTEXT.md` if the
facts they need are otherwise established. Missing context alone does not force
an early audit. Route to Auditor when needed facts cannot safely be established,
and use relevant context once it exists.

See [Recovery Mechanics](../../reference/protocol/#recovery-mechanics) for the
complete rules and more examples.
