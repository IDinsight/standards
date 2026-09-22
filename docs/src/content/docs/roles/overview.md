---
title: Role Overview
description: Find the owner of each kind of work in the framework.
---

The nine roles give S.T.A.N.D.A.R.D.S. its name. The acronym is not the
execution order: the starting sequence depends on project mode and cycle mode.

- [Scoper](../scoper/) defines outcomes, boundaries, and acceptance conditions.
- [Tester](../tester/) verifies behavior and records acceptance evidence.
- [Architect](../architect/) defines material technical decisions and contracts.
- [Navigator](../navigator/) explains and investigates without mutation.
- [Developer](../developer/) implements the technical design in standard work or
  the bounded request in expedited work.
- [Auditor](../auditor/) establishes the relevant project baseline.
- [Reviewer](../reviewer/) evaluates implementation and final deliverables.
- [Documenter](../documenter/) owns user- and project-facing documentation.
- [Synchronizer](../synchronizer/) reconciles completed work before sign-off.

Expedited cycles run only Developer and implementation Reviewer before user
sign-off. Skipped roles retain their ownership; if needed, the cycle
[promotes through Auditor](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Choose a role by ownership

An unclear outcome belongs to Scoper. An undefined interface belongs to
Architect. Incorrect knowledge about the existing repository belongs to Auditor.
Finding one of those issues while testing does not transfer ownership to Tester.

Roles normally act only in their owning state. Reviewer owns two states, one for
implementation review and another for final-deliverable review. Navigator sits
outside the state machine and never changes it.

## Invoke the next role explicitly

A handoff tells you which role should act next and provides an invocation for
your client. Use it after the state change has been persisted. The role must
read the active work and artifacts rather than reconstructing the cycle from
chat history.

See [Workflow States and Handoffs](../../concepts/states-and-handoffs/) for the
actual execution paths. WIP badges identify role pages awaiting their full
implementation and usage documentation.
