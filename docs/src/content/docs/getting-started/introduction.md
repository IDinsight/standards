---
title: Introduction
description: Understand the purpose and boundaries of the framework.
---

S.T.A.N.D.A.R.D.S. separates the main jobs in a software change: deciding what
to build, designing it, writing code, and checking the result.

## How work is organized

A **role** is responsible for a kind of work. Scoper defines the requirements;
Architect decides how to meet them. A **workflow state**, such as `SCOPING`,
records which role may work now.

Each role has checks it must pass before moving on. The protocol calls these a
**completion gate**. A **handoff** records the next state and gives you a
command to run the next role. You run that command yourself.

A **cycle** is one request, from its start to your sign-off or cancellation.
[Cycle mode](../../concepts/project-modes/#choose-the-cycle-mode) selects the
full `STANDARD` workflow or the shorter `EXPEDITED` workflow for that request.

## What the project saves

The `.standards/` directory stores the protocol, current mode and state,
installation records, and Auditor's notes on the existing project. Other files
hold the scope, design, and results. The protocol calls these saved outputs
**artifacts**.

`STATE.md` records the scope and design paths and what should happen next. To
continue in a new session, [read those records](../../guides/resuming-work/)
rather than relying on chat history.

## What completion means

Standard work must pass all required role checks and provide evidence that each
requirement is met. Expedited work has fewer steps and checks. It moves to the
full workflow if it needs a skipped role.

[Workflow States and Handoffs](../../concepts/states-and-handoffs/) lists both
paths and their completion rules. Passing a role's checks does not finish the
cycle: you make the final [sign-off decision](../../concepts/human-decisions/).

## Choose your starting point

- [Installation and setup](../installation/): prepare the project files and
  skills.
- [New project](../../guides/new-project/): plan and design before writing code.
- [Existing project](../../guides/existing-project/): choose standard or
  expedited work.
- [Role overview](../../roles/overview/): find who handles each kind of work.
