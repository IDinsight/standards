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
Promotion clears expedited recovery and starts standard work through Auditor.

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
Recovery ends when no frames remain.

See [Recovery Mechanics](../../reference/protocol/#recovery-mechanics) for the
complete rules and more examples.
