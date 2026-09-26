---
title: Revising Scope or Design
description: Request a change during an active cycle and follow its handoff.
---

If you want to change an active request, tell the current workflow agent what
you want to be different. You do not need to edit the scope, design, plan, or
`.standards/STATE.md` yourself. The agent records your request and routes it to
the role responsible for that decision.

## Describe the change you want

Describe the desired outcome or the problem with the current approach. For
example, “Include email addresses in the search results,” or “The proposed
design must keep the existing API response format.” If a choice affects what you
want, the agent asks you to decide rather than guessing.

The agent identifies who owns the affected work:

- **Scoper** handles changed outcomes or requirements.
- **Architect** handles technical design decisions.
- **Auditor** checks missing or incorrect facts about the existing project.

You can request the change even while a later role is active or when work is
waiting for your sign-off. You do not need to classify the problem or choose a
failure type.

## Changes during expedited work

For a bounded implementation change, the agent routes the request back to
Developer. If the change needs Scoper, Architect, Auditor, or another step that
expedited work skips, the agent
[promotes the cycle to standard work](../../concepts/states-and-handoffs/#promote-an-expedited-cycle)
and hands off to Auditor. Your request for that change authorizes the promotion;
you do not need to approve the same transition again.

## What the agent handles

The agent updates the saved request when needed, records the rework, and saves
where the interrupted work should resume. It keeps earlier unfinished
corrections and tells you which role to invoke next. If an agent discovered a
mistake rather than responding to your change, it records a failure and follows
the [recovery process](../../concepts/recovery/) instead.

After the responsible role makes the correction, it decides which later checks
need to run again. Scoper keeps valid requirements and acceptance IDs; Architect
keeps valid design decisions. If Developer needs to revisit the implementation,
it reopens only affected plan steps. It asks for your approval before coding
when the revised plan materially changes the approved implementation approach.
See [Working with Developer](../working-with-developer/).

You still invoke each role when its handoff asks you to. The agent manages the
state and return path; handoffs do not automatically start the next role. The
[recovery guide](../../concepts/recovery/#correct-then-decide-what-to-repeat)
explains how the workflow returns to the interrupted work.
