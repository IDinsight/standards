---
title: Revising Scope or Design
description: Route an active change to the owner while preserving valid work.
---

A new requirement during an active cycle is user-directed rework. A discovered
defect normally uses a failure handoff. In an expedited cycle, either may
instead require promotion when a skipped role or guarantee becomes necessary.

## Identify what changed

A changed outcome or acceptance meaning belongs to Scoper. An undefined or
incorrect technical contract belongs to Architect. New evidence that invalidates
the project baseline belongs to Auditor.

For example, adding email search to a name-only search request changes scope.
Correcting the encoding of an already-scoped search parameter may be an
architecture issue.

## Check for expedited promotion first

In `EXPEDITED`, bounded implementation rework routes to `DEVELOPING`. If the
changed request needs Scoper, Architect, Auditor, or another skipped
responsibility, update `Active Work.Request` when needed and
[promote to STANDARD](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).
Do not route directly to the skipped role through `USER_REWORK` or `FAILURE`.

Promotion enters `AUDITING`, persists the promotion reason, and clears recovery.
The explicit rework request authorizes a necessary promotion even at user
sign-off; a second confirmation is not needed. Existing expedited implementation
remains tentative; Auditor must distinguish it from the pre-cycle baseline. The
standard sequence then establishes scope and design through their owners.

## Record and route a correction within the current workflow

When promotion is not required, update `Active Work.Request` if needed and
record `USER_REWORK` with the corresponding failure type. In `STANDARD`, route
to the earliest invalidated owner; bounded expedited implementation rework goes
to `DEVELOPING`. If state changes, push a recovery frame with the interrupted
state as `ResumeAt`, preserving existing frames.

The receiving agent can record that authorized transition, but the target role's
work still requires explicit skill invocation and ownership of the new state.

## Preserve unaffected content

Scoper uses REPLAN for an existing active-cycle scope. Keep acceptance
identifiers whose meaning remains unchanged. Retire removed or replaced
identifiers and assign new ones where appropriate.

Architect revises affected design decisions without rewriting scope intent. A
change to the current acceptance-identifier set requires reconciliation of
completed downstream artifacts that must account for that full set.

## Re-establish invalidated work

The active frame owner determines which completed downstream gates must rerun.
The workflow returns to the interrupted state only after those obligations have
been satisfied. A small wording change and a changed system contract need not
invalidate the same work.

For exact stack behavior, see [Failure Recovery](../../concepts/recovery/).
