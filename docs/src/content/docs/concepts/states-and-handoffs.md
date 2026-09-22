---
title: Workflow States and Handoffs
description: Follow normal transitions and understand explicit invocation.
---

`STATE.md` records one `WorkflowState` and one `CycleMode`. The state determines
which role may perform role-owned work; the cycle mode determines its required
workflow and gates. Neither invokes a role automatically.

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

Each forward transition requires the current completion gate to pass. Brownfield
Architecture also requires valid active-cycle project context before handing off
to Developer.

## Expedited forward path

A brownfield cycle with `CycleMode: EXPEDITED` follows:

```text
DEVELOPING → REVIEWING_IMPLEMENTATION → AWAITING_USER_SIGNOFF
```

`Active Work.Request` is the bounded change contract. Scope and architecture
paths remain `NONE`; their missing artifacts are intentional. Developer performs
implementation self-checks, which do not count as Tester-owned verification.
Sign-off becomes available after Developer and implementation Reviewer pass
their applicable gates, recovery is empty, and no blocking user question
remains. No Scoper-owned acceptance identifiers or skipped standard gates are
required. See [cycle selection](../project-modes/#choose-the-cycle-mode).

## Promote an expedited cycle

When safe completion requires any skipped responsibility, such as scope,
architecture, authoritative context, formal verification, or documentation,
promote the cycle instead of assigning that work to Developer or Reviewer.
Promotion is one-way for the active cycle:

1. Set `CycleMode: STANDARD` and `WorkflowState: AUDITING`.
2. Record `Handoff.Kind: PROMOTE`, `From` as the interrupted state, and
   `FailureType: NONE`. Persist the reason in both `Handoff.Reason` and
   `Active Work.PromotionReason`; the latter survives later handoffs.
3. Preserve the cycle's identifier and request. Do not fabricate, rewrite, or
   delete role-owned artifacts; scope and architecture normally remain `NONE`
   until their owners run.
4. Clear recovery. Auditor starts the standard brownfield sequence, replacing
   any expedited resume path. All required standard gates must then pass.

An active workflow role may promote when the expedited contract is insufficient.
At the user-owned sign-off gate, promotion requires user authorization; a rework
request requiring a skipped responsibility already supplies that authorization.
Hand off to Auditor, whose work still requires explicit invocation.

Existing expedited implementation remains tentative, not an established design
constraint. [Auditor](../../roles/auditor/#promotion-and-cancellation-audits)
must distinguish it from the pre-cycle baseline and block if that distinction is
materially ambiguous. See the
[full promotion contract](../../reference/protocol/#expedited-promotion).

## What a handoff records

The latest handoff records its kind, originating state, failure type when
applicable, and a concise reason. The active-work and recovery records are
updated as required by the transition.

A typical normal handoff to Architect includes an invocation such as:

```text
$architect Continue the active workflow from `.standards/STATE.md`.
```

For Claude Code, use `/architect`. A complete handoff directs the next role to
read the relevant active work, project context, owned artifacts, and recovery
record. Persisted artifacts carry the detail; the message need not duplicate it.

## Blocking questions and recovery

An unresolved blocking question is recorded in `Active Work.BlockedOn`. Asking
it does not advance the state. The question is cleared after its answer is
incorporated.

A failure handoff may move backward to the owner of a defect. A resume handoff
returns from recovery. Neither should be treated as an ordinary forward step.

## Terminal states

`SIGNED_OFF` and `CANCELLED` mean there is no active cycle. New work starts a
new cycle rather than reopening the previous one. Greenfield bootstrap
cancellation instead removes the installed runtime under the protocol's reset
rules.

See [Human Decisions and Sign-off](../human-decisions/) and the
[canonical transition rules](../../reference/protocol/#forward-transitions).
