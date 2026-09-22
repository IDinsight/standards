---
title: Failure Recovery
description:
  Understand defect ownership, recovery frames, and downstream reruns.
---

Recovery preserves unfinished obligations when work must return to an earlier
owner. It records both **what needs correction** and **where work should
resume**.

## Follow the active cycle mode

Recovery stays within the active cycle's workflow. In `EXPEDITED`, direct
failure routing is limited to `IMPLEMENTATION` → `DEVELOPING` and implementation
`REVIEW` → `REVIEWING_IMPLEMENTATION`. If correction requires a skipped role or
guarantee,
[promote the cycle](../states-and-handoffs/#promote-an-expedited-cycle) to
`STANDARD` through Auditor. Promotion clears expedited recovery instead of
pushing a frame or preserving its resume path.

## Route by the defective artifact

Standard-cycle examples include a `SCOPING` failure for ambiguous acceptance
conditions, an `ARCHITECTURE` failure for an undefined contract, and a
`PROJECT_CONTEXT` failure for an incorrect baseline. Review failures must
identify the affected review kind.

A corrective transition to another state pushes a recovery frame. A same-state
failure records the handoff but does not add a frame.

## Read the active frame

Frames form a stack, ordered oldest to newest. The last frame is active. Its
fields include the owner, defect reason, interrupted state (`ResumeAt`), and any
downstream rerun boundary (`RerunThrough`).

A role owns that frame only when the current state equals its `Owner`. Running
during recovery does not automatically make a role the corrective owner.

## Correct, then establish what became stale

After passing its own completion gate, the owner identifies completed downstream
work invalidated by the correction. If no rerun is needed, it pops the frame and
resumes directly. Otherwise it records the last required rerun state and hands
off to the earliest required rerun.

Those roles use their normal gates while preserving the frame. At the boundary,
the frame is popped and the workflow explicitly returns to `ResumeAt`.

## Example: design defect found during testing

```text
TESTING → ARCHITECTING    Push frame; resume target is TESTING.
ARCHITECTING → DEVELOPING Set rerun boundary to DEVELOPING.
DEVELOPING → TESTING      Pass the gate, pop frame, resume testing.
```

This example assumes only implementation must be re-established before testing
resumes. The actual invalidation decision depends on the correction.

## Nested failures remain separate

If a new defect appears during recovery, push a new frame rather than replacing
the old one. Complete the newest obligation first. Recovery ends only when the
stack is empty.

The full algorithm and additional examples are in
[Recovery Mechanics](../../reference/protocol/#recovery-mechanics).
