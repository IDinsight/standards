---
title: Role Overview
description: Find the owner of each kind of work in the framework.
---

Each of the nine roles has a specific job. Their initials spell
S.T.A.N.D.A.R.D.S.; the actual [work order](../../concepts/states-and-handoffs/)
depends on the project and cycle mode.

- [Scoper](../scoper/) defines what to build and what counts as done.
- [Tester](../tester/) checks behavior and records results.
- [Architect](../architect/) makes the technical design decisions.
- [Navigator](../navigator/) explains the project without changing it.
- [Developer](../developer/) plans implementation, obtains plan approval, and
  implements the design or expedited request.
- [Auditor](../auditor/) records the facts about the existing project.
- [Reviewer](../reviewer/) checks the implementation and final work.
- [Documenter](../documenter/) writes and updates documentation.
- [Synchronizer](../synchronizer/) checks that finished code, docs, and records
  agree before sign-off.

## Choose a role by ownership

The role responsible for a decision also handles corrections to it. For example,
Scoper resolves unclear requirements; Architect resolves unclear interfaces. See
[ownership](../../concepts/ownership/) for examples.

Reviewer runs in two states: implementation review and final review. Navigator
can run at any time but never changes the workflow state. Other roles act only
in their assigned states.

## Invoke the next role explicitly

Use the command in the handoff to run the next role after the state change is
saved. The role reads the saved request, files, and recovery records.

WIP badges mark roles whose implementation and detailed usage docs are still
unfinished.
