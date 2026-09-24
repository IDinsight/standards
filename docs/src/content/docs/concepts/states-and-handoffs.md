---
title: Workflow States and Handoffs
description: Follow normal transitions and understand explicit invocation.
---

`STATE.md` records one `WorkflowState` and one `CycleMode`. The state determines
which workflow role may act; cycle mode selects the required steps and checks.
`CycleMode: UNSET` permits no role-owned workflow work.
[Initialize the cycle](../../guides/starting-a-cycle/) first, then run each role
explicitly. [Navigator](../../roles/navigator/) is outside these rules: it may
explain, investigate, or check understanding at any state or without a cycle,
without changing files or workflow records.

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
Developer's plan and approval are required even in expedited work. Scoper's
acceptance IDs and the checks from skipped steps are not required. See
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
4. Preserve unfinished recovery corrections as
   [outstanding obligations](../recovery/#outstanding-obligations), then clear
   the old recovery stack. Auditor starts the standard brownfield sequence. All
   required standard checks must then pass.

An active workflow role may promote when expedited checks are not enough. At
sign-off, promotion requires user authorization; a rework request requiring a
skipped responsibility already supplies that authorization. Hand off to Auditor,
whose work still requires explicit invocation. When Developer is reached again,
it must
[reconcile its earlier plan](../../guides/working-with-developer/#continue-after-expedited-promotion)
with the standard scope and design before resuming implementation.

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

When entering `TESTING`, the handoff explicitly directs you to open a fresh chat
separate from Developer's implementation conversation and invoke Tester there.
The files must carry the context; a skill cannot erase history or certify
freshness without client support. This applies to recovery handoffs too. See
[Tester](../../roles/tester/) and the
[canonical session rule](../../reference/protocol/#independent-tester-session).

Handoffs into either review state request a fresh Reviewer chat separate from
all artifact-authoring conversations, identify the review kind, and recommend a
different model of equal or higher capability where known. The model advice is
optional; the client must not guess identities, switch automatically, or require
routine confirmation. See the
[Reviewer session rule](../../reference/protocol/#independent-reviewer-session).

## Blocking questions and recovery

An unresolved blocking question is recorded in `Active Work.BlockedOn`. Asking
it does not advance the state. The question is cleared after its answer is
incorporated. Before a cycle exists, use `PendingCycleRequest` and
`PendingCycleBlockedOn` instead.

A failure handoff may move backward to the owner of a defect. A resume handoff
returns from recovery. Neither is an ordinary forward step. Sign-off also
requires no outstanding obligations.

## Terminal states

`SIGNED_OFF` and retained `CANCELLED` have `CycleMode: UNSET`. `Active Work`
keeps the previous cycle's record; pending fields can describe the next request
separately. New work starts a new cycle. Greenfield cancellation may remove the
installation, but must first check for active-cycle implementation; see
[cancellation rules](../../guides/cancelling-and-new-cycles/).

See [Human Decisions and Sign-off](../human-decisions/) and the
[canonical transition rules](../../reference/protocol/#forward-transitions).
