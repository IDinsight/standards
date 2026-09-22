---
title: Introduction
description: Understand the purpose and boundaries of the framework.
---

S.T.A.N.D.A.R.D.S. is a workflow for collaborating with coding agents across
applications, libraries, services, infrastructure, and other software projects.
It separates decisions that are easy to blur together: what to build, how to
build it, what already exists, and whether the result meets the request.

## How work is organized

A **role** owns decisions and artifacts. A **workflow state** identifies the
work currently allowed. A **completion gate** determines when that work can move
on. For example, Scoper owns the scope artifact and acts in `SCOPING`. Architect
acts in `ARCHITECTING` and owns the technical design.

You invoke roles explicitly. A handoff records the next state and provides an
invocation for the next role; it does not silently start that skill.

## What persists

The installed `.standards/` directory contains the protocol, project mode,
workflow state and cycle mode, installation metadata, and project context once
Auditor creates it. Scope and architecture live in separate project artifacts,
referenced from `STATE.md`.

This separates the record of **where work stands** from the artifacts that
explain **what the work means**. Chat history can help, but it cannot substitute
for those records.

## What completion means

In a `STANDARD` cycle, each scope acceptance condition has a stable `AC-NNN`
identifier. Downstream roles preserve that identity when recording design
coverage and evidence. The workflow reaches `AWAITING_USER_SIGNOFF` only after
every current condition has sufficient evidence and no unresolved blocker.

A bounded brownfield `EXPEDITED` cycle instead uses the persisted request as its
contract and runs Developer followed by implementation Reviewer. It may reach
sign-off when those gates pass, recovery is empty, and no blocking question
remains. Skipped roles and their guarantees are absent; needing one requires
promotion to the standard workflow through Auditor.

User sign-off completes the cycle. It is separate from a role passing its own
completion gate.

## Choose your starting point

- [New project](../../guides/new-project/): establish scope and design before
  the first scheduled audit.
- [Existing project](../../guides/existing-project/): choose standard work or a
  bounded expedited cycle.
- [Role overview](../../roles/overview/): find who owns a particular decision.

See [Installation and Setup](../installation/) for the required runtime before
invoking workflow skills.
