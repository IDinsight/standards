---
title: Working on an Existing Project
description: Plan a change around the code and behavior already in place.
---

Use this guide when the project already has code the change must work with. For
documentation of existing behavior without an implementation change, see
[Updating Documentation on Its Own](../updating-documentation/).

## Choose standard or expedited work

The default is `STANDARD`, starting with Auditor. Follow the steps below for
that workflow.

For a small, clearly defined fix that needs no skipped role, use the
[expedited path](../../concepts/states-and-handoffs/#expedited-forward-path).
Check
[when expedited entry is allowed](../../concepts/project-modes/#choose-the-cycle-mode),
especially after cancellation. Expedited work follows its own shorter sequence.

## Give Auditor a concrete request

Invoke Auditor with your request. The agent handles
[cycle initialization](../starting-a-cycle/), including validating the request
and generating its ID. Auditor then checks the existing code, behavior, and
project rules needed to understand the change.

Auditor chooses an [inspection mode](../../roles/auditor/#modes) based on how
much reliable project context already exists.

## Scope the change against the baseline

After the audit, invoke Scoper from the handoff. Scoper defines what changes,
what must keep working, and how to check the result, asking you when it needs a
decision. Existing design decisions can constrain the work; a proposed design
does not become a requirement just because someone has written it down.

## Design and implement

Invoke Architect when Scoper hands off. Architect makes the design decisions
needed to meet the requirements. With valid context for this cycle, it hands off
directly to Developer. Planning code changes does not by itself require a second
audit. Invoke Developer from that handoff; it prepares its own implementation
plan for your approval. Follow
[Working with Developer](../working-with-developer/).

If important project facts are missing or wrong, the agent pauses work that
depends on them and gives you a handoff to invoke Auditor. Follow the handoffs
through any corrections and the
[remaining standard steps](../../concepts/states-and-handoffs/#standard-forward-paths).
