---
title: S.T.A.N.D.A.R.D.S.
description:
  A framework for coding with agents through explicit roles and verifiable
  handoffs.
---

S.T.A.N.D.A.R.D.S. organizes coding-agent work into explicit roles. Each role
owns a class of decisions or artifacts, and each handoff requires evidence that
its work is complete. The workflow applies to new projects and changes to
existing systems.

## Start here

- [Understand the framework](./getting-started/introduction/).
- [Follow your first workflow](./getting-started/first-workflow/).
- [Explore the nine roles](./roles/overview/).
- [Look up the protocol](./reference/protocol/).

## What the framework gives you

**Clear ownership.** Scoper defines the outcome, Architect defines the technical
design, and Auditor establishes the project baseline. Other roles implement,
verify, review, document, and reconcile the work.

**Continuity between sessions.** The active request, artifact paths, workflow
state, and recovery context live in version-controlled files. A new session can
resume from those records.

**Completion appropriate to the change.** Standard cycles carry acceptance
identifiers through design and verification. Bounded brownfield changes may use
an expedited Developer/Reviewer cycle with a narrower completion contract. See
[cycle modes](./concepts/project-modes/#choose-the-cycle-mode) and
[their required gates](./concepts/states-and-handoffs/).

## You control the handoffs

A saved workflow state identifies which role may act. It does not automatically
invoke that role. You explicitly invoke each skill and decide when to sign off,
request rework, or cancel.

These docs explain how to use the framework. The
[protocol](./reference/protocol/) and individual skill definitions remain the
authoritative contracts.
