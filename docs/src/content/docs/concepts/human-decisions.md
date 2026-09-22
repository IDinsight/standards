---
title: Human Decisions and Sign-off
description: Understand explicit invocation, rework, cancellation, and approval.
---

The user chooses when to invoke a workflow role and when to accept the completed
cycle. The framework records those decisions so subsequent sessions can resume
without guessing.

## Explicit invocation

Use the installed skill's client syntax, such as `$scoper` in Codex or `/scoper`
in Claude Code. The skill may perform role-owned work only when it owns the
active state. A chat request does not bypass that ownership rule.

## User-directed transitions

An explicit user instruction may authorize expedited entry, `PROMOTE`,
`USER_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL` under the protocol's
lifecycle rules, even when the agent receiving it does not own the current
state. That permission covers required coordination changes. Performing the
resulting role's work still requires explicit invocation of that skill and
ownership of the resulting state.

## At the sign-off gate

At `AWAITING_USER_SIGNOFF`, the user can:

- **Sign off:** accept the completed cycle and transition to `SIGNED_OFF`.
- **Request rework:** in `STANDARD`, route to the earliest invalidated owner.
  Bounded expedited implementation rework returns to Developer. If expedited
  rework needs a skipped responsibility, the request authorizes promotion
  instead. The applicable gates must pass before sign-off is offered again.
- **Cancel:** end the active cycle under the applicable cancellation rules.
- **Promote an expedited cycle:** explicitly request `STANDARD`; the cycle
  enters `AUDITING` under the
  [promotion rules](../states-and-handoffs/#promote-an-expedited-cycle).

Standard sign-off requires full acceptance traceability and all standard gates.
Expedited sign-off accepts the bounded request after the Developer and
implementation Reviewer gates, with no recovery or blocking question. It does
not certify that skipped standard phases ran.

A completed scope means Scoper passed its completion gate. It does not imply a
separate user-approval gate unless the project explicitly adds one.

## Blocking questions and commits

A role records a blocking question before asking it and stays in its current
state until the answer is incorporated.

When role work produces meaningful committable changes, the role suggests a
Conventional Commit message. It does not create the commit unless you ask.
Navigator never suggests commits because its work is non-mutating.

See [Revising Scope or Design](../../guides/revising-scope-or-design/) and
[Cancelling or Starting a New Cycle](../../guides/cancelling-and-new-cycles/).
