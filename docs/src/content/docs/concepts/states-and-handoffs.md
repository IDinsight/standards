---
title: Workflow States and Handoffs
description: Follow normal transitions and understand explicit invocation.
---

`STATE.md` records one `WorkflowState` and one `CycleMode`. The state determines
which role may do its work; cycle mode selects the required steps and checks.
You still need to run each role explicitly.

## Standard forward paths

A greenfield cycle begins:

```text
SCOPING → ARCHITECTING → AUDITING → DEVELOPING
```

A brownfield cycle begins:

```text
AUDITING → SCOPING → ARCHITECTING → DEVELOPING
```

Both then follow:

```text
DEVELOPING → TESTING → REVIEWING_IMPLEMENTATION → DOCUMENTING
→ REVIEWING_FINAL → SYNCHRONIZING → AWAITING_USER_SIGNOFF
```

Each role must pass its completion checks before handing off. In brownfield
work, Architect also needs valid project context for the current cycle before
handing off to Developer.

## Expedited forward path

A brownfield cycle with `CycleMode: EXPEDITED` follows:

```text
DEVELOPING → REVIEWING_IMPLEMENTATION → AWAITING_USER_SIGNOFF
```

`Active Work.Request` defines the change. Scope and architecture paths stay
`NONE` because those roles are skipped. Developer performs implementation
self-checks, which do not count as Tester-owned verification. Sign-off becomes
available after Developer and implementation Reviewer pass their required
checks, recovery is empty, and no unanswered question prevents completion.
Scoper's acceptance IDs and the checks from skipped steps are not required. See
[cycle selection](../project-modes/#choose-the-cycle-mode).

## Promote an expedited cycle

When the change needs a skipped role to define requirements, design it, check
project facts, verify behavior, or write documentation, promote the cycle
instead of assigning that work to Developer or Reviewer. Promotion is one-way
for the active cycle:

1. Set `CycleMode: STANDARD` and `WorkflowState: AUDITING`.
2. Record `Handoff.Kind: PROMOTE`, `From` as the interrupted state, and
   `FailureType: NONE`. Persist the reason in both `Handoff.Reason` and
   `Active Work.PromotionReason`; the latter survives later handoffs.
3. Preserve the cycle's identifier and request. Do not fabricate, rewrite, or
   delete role-owned artifacts; scope and architecture normally remain `NONE`
   until their owners run.
4. Clear recovery. Auditor starts the standard brownfield sequence, replacing
   any expedited resume path. All required standard gates must then pass.

An active workflow role may promote when expedited checks are not enough. At
sign-off, promotion requires user authorization; a rework request requiring a
skipped responsibility already supplies that authorization. Hand off to Auditor,
whose work still requires explicit invocation.

Changes made during expedited work are still tentative. They must not dictate
the design just because the code is already present.
[Auditor](../../roles/auditor/#promotion-and-cancellation-audits) must separate
those changes from what existed before the cycle, and ask the user if
uncertainty about that distinction would affect later work. See the
[full promotion contract](../../reference/protocol/#expedited-promotion).

## What a handoff records

The latest handoff records its kind, originating state, failure type when
applicable, and a concise reason. Update active work and recovery as required by
that transition.

A typical normal handoff to Architect includes an invocation such as:

```text
$architect Continue the active workflow from `.standards/STATE.md`.
```

For Claude Code, use `/architect`. A complete handoff directs the next role to
read the relevant active work, project context, role outputs, and recovery
record. Keep the detail in those files instead of repeating it in the message.

## Blocking questions and recovery

An unresolved blocking question is recorded in `Active Work.BlockedOn`. Asking
it does not advance the state. The question is cleared after its answer is
incorporated.

A failure handoff may move backward to the owner of a defect. A resume handoff
returns from recovery. Neither should be treated as an ordinary forward step.

## Terminal states

`SIGNED_OFF` and `CANCELLED` mean there is no active cycle. New work starts a
new cycle. Cancellation while still greenfield removes the framework
installation; see [cancellation rules](../../guides/cancelling-and-new-cycles/).

See [Human Decisions and Sign-off](../human-decisions/) and the
[canonical transition rules](../../reference/protocol/#forward-transitions).
