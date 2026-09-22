---
title: Your First Workflow
description:
  Walk through a small change and the artifacts that carry it forward.
---

This walkthrough explains the protocol using an example change: **add search by
name and email to an existing user directory** using `CycleMode: STANDARD`. It
assumes the framework has been installed according to the
[installation contract](../installation/). Role pages marked WIP have not yet
received their full implementation and usage documentation.

## 1. Establish the request

Before substantive work, the active cycle needs a stable identifier and request
in `STATE.md`. For this example, the identifier could be `add-user-search`.
Scope and architecture paths start as `NONE` until their owners create them.

Because this is standard brownfield work, the cycle starts in `AUDITING`. Invoke
the installed Auditor skill explicitly:

```text
Codex:       $auditor Add user search by name and email.
Claude Code: /auditor Add user search by name and email.
```

Use the line for your client. Auditor grounds the request in existing behavior,
conventions, and verified commands, then records `.standards/CONTEXT.md`.

## 2. Define the outcome

After Auditor hands off to `SCOPING`, invoke Scoper using the handoff message.
Scoper persists the scope and records its path in `Active Work.Scope`.

Illustrative acceptance conditions might be:

- `AC-001`: Users can find directory entries by name.
- `AC-002`: Users can find directory entries by email.
- `AC-003`: An empty result set displays a clear no-results message.

These examples assume those outcomes were agreed for the change. Scoper resolves
material ambiguities rather than silently choosing new product behavior.

## 3. Define the technical design

At `ARCHITECTING`, invoke Architect. The design accounts for every current
acceptance identifier, defines the material interfaces and behavior, and records
technical acceptance criteria where needed.

The design is persisted at `Active Work.Architecture`. Choosing a database,
search mechanism, or cross-component contract belongs here unless it was already
an established constraint.

## 4. Follow the remaining gates

The protocol continues through implementation, testing, implementation review,
documentation, final review, and synchronization. Invoke each role after its
legal handoff. Each role reads the persisted records and produces its own work;
a role that finds an upstream defect routes it to the owner.

At `AWAITING_USER_SIGNOFF`, review the deliverables and evidence. You can sign
off, request rework, or cancel. Completion is not inferred from a successful
test run alone.

## What to check at each handoff

Confirm that the role-owned artifact exists, its completion gate passed, and
`STATE.md` identifies the next state and any recovery obligations. If a blocking
question remains, the role stays in its current state.

For the complete sequence, see
[Workflow States and Handoffs](../../concepts/states-and-handoffs/).
