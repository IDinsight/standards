---
title: Your First Workflow
description: Follow an example change from request to sign-off.
---

This walkthrough explains the protocol using an example change: **add search by
name and email to an existing user directory** using `CycleMode: STANDARD`. It
assumes the framework has been installed according to the
[installation requirements](../installation/). Roles marked WIP are still being
implemented and do not yet have full usage instructions.

## 1. Establish the request

Start with [cycle initialization](../../guides/starting-a-cycle/): select
`STANDARD`, reserve a new ID in `CYCLE_IDS.md`, then save that ID and request in
`STATE.md`. An example ID is `add-user-search-20260924T150000Z-a7f3`; generate a
fresh token rather than reuse this example. Scope, Architecture, and Development
paths start as `NONE`.

Because this is standard brownfield work, the cycle starts in `AUDITING`. Invoke
the installed Auditor skill explicitly:

```text
Codex:       $auditor Add user search by name and email.
Claude Code: /auditor Add user search by name and email.
```

Use the line for your client. Auditor checks existing behavior, conventions, and
commands, then records the findings in `.standards/CONTEXT.md`.

## 2. Define the outcome

After Auditor hands off to `SCOPING`, invoke Scoper using the handoff message.
Scoper saves the scope and records its path in `Active Work.Scope`.

Illustrative acceptance conditions might be:

- `AC-001`: Users can find directory entries by name.
- `AC-002`: Users can find directory entries by email.
- `AC-003`: An empty result set displays a clear no-results message.

These examples assume those outcomes were agreed for the change. Scoper asks
about unclear requirements that would affect the result.

## 3. Define the technical design

At `ARCHITECTING`, invoke Architect. The design accounts for every current
acceptance ID, defines the important interfaces and behavior, and records
technical acceptance criteria where needed.

Save the design path in `Active Work.Architecture`. Choosing a database, search
method, or how components communicate belongs here unless existing constraints
already settle those choices.

## 4. Approve and carry out the development plan

At `DEVELOPING`, invoke Developer. It turns the design into `DEV-NNN` steps,
saves the plan at `Active Work.Development`, and asks for approval before
coding. For example, a step might implement the agreed name filter and map it to
`AC-001`. Its self-check should use the project's established commands.

Review the proposed plan and approve it or request changes. Choose autonomous,
stepwise, or Code With Me collaboration. Developer saves progress and performs
implementation self-checks; these do not replace Tester verification. See
[Working with Developer](../../guides/working-with-developer/).

## 5. Follow the remaining gates

The protocol continues through testing, implementation review, documentation,
final review, and synchronization. Invoke each role after its handoff. Each role
reads the saved records and produces its own work. If it finds a problem in an
earlier role's work, it sends the problem back to that role.

At `AWAITING_USER_SIGNOFF`, review the deliverables and evidence. You can sign
off, request rework, or cancel. Completion is not inferred from a successful
test run alone.

## What to check at each handoff

Check that the role saved its work, passed its completion checks, and updated
`STATE.md` with the next state and any unfinished corrections. If a blocking
question remains, the role stays in its current state.

For the complete sequence, see
[Workflow States and Handoffs](../../concepts/states-and-handoffs/).
