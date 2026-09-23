---
title: Human Decisions and Sign-off
description: Understand explicit invocation, rework, cancellation, and approval.
---

You choose when to run each role and when to accept the finished work. The
framework saves those decisions so another session can continue from them.

## Explicit invocation

Run a skill with your client's command, such as `$scoper` in Codex or `/scoper`
in Claude Code. The role may do its work only in a state assigned to it.

## User-directed transitions

You can request a new cycle, expedited entry, promotion, rework, sign-off, or
cancellation under the protocol's rules. The agent receiving the request may
record that state change even if it does not own the current state.

This allows the agent to update the workflow record. To do the next role's work,
you must also have asked to run that skill, and it must own the resulting state.

## At the sign-off gate

At `AWAITING_USER_SIGNOFF`, you can:

- **Sign off:** accept the work and move to `SIGNED_OFF`.
- **Request rework:** describe what must change. The
  [rework guide](../../guides/revising-scope-or-design/) explains who handles it
  and when expedited work must become standard work.
- **Cancel:** end the cycle under the
  [cancellation rules](../../guides/cancelling-and-new-cycles/).
- **Promote an expedited cycle:** request the full standard workflow, starting
  with Auditor. See
  [promotion](../states-and-handoffs/#promote-an-expedited-cycle).

Sign-off accepts the checks required by the selected cycle mode. It does not
claim that skipped roles completed their work. See
[the completion rules](../states-and-handoffs/) for both modes.

A completed scope means Scoper passed its checks. It does not add a separate
approval step unless the project requires one.

## Blocking questions and commits

A role saves any question that prevents completion and waits for the answer
before moving on.

When a role produces changes worth committing, it suggests a Conventional Commit
message. It creates the commit only if you ask. Navigator does neither because
it never changes files.
