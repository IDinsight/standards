---
title: Working on an Existing Project
description: Plan a change around the code and behavior already in place.
---

Use this guide when the project already has code the change must work with.

## Choose standard or expedited work

The default is `STANDARD`, starting with Auditor. Follow the steps below for
that workflow.

For a small, clearly defined fix that needs no skipped role, use the
[expedited path](../../concepts/states-and-handoffs/#expedited-forward-path).
Check
[when expedited entry is allowed](../../concepts/project-modes/#choose-the-cycle-mode),
especially after cancellation. Expedited work follows its own shorter sequence.

## Give Auditor a concrete request

Save the requested change and a
[new cycle ID](../../reference/runtime-files/#cycle-identity). Run Auditor in
`AUDITING`. It checks the existing code, behavior, and project rules needed to
understand the change.

Auditor chooses an [inspection mode](../../roles/auditor/#modes) based on how
much reliable project context already exists.

## Scope the change against the baseline

After the audit, run Scoper. Define what changes, what must keep working, and
how to check the result. Existing design decisions can constrain the work; a
proposed design does not become a requirement just because someone has written
it down.

## Design and implement

Architect makes the design decisions needed to meet the requirements. With valid
context for this cycle, it hands off directly to Developer. Planning code
changes does not by itself require a second audit.

If important project facts are missing or wrong, return to Auditor before using
those facts in further work. Then follow the
[remaining standard steps](../../concepts/states-and-handoffs/#standard-forward-paths).
