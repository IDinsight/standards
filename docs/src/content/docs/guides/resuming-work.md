---
title: Resuming Interrupted Work
description: Continue from persisted state across sessions and handoffs.
---

Resume from version-controlled artifacts, not from a recollection of the last
chat message. A different agent or developer needs the same state changes shared
through version control before it can see the same active cycle.

## Read the coordination record

Read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and `.standards/STATE.md`.
Identify the current state, `CycleMode`, request, scope and architecture paths,
`PromotionReason`, blocking question, and recovery stack. Read relevant context
and the owned artifacts. Missing scope and architecture are intentional in an
expedited cycle. A retained promotion reason explains why standard work became
necessary even after the latest handoff changes.

The latest handoff explains the last transition. The recovery stack records
outstanding corrective obligations; it must not be replaced by that summary.

## Resume the owning role

If the state is `ARCHITECTING`, explicitly invoke Architect, for example:

```text
$architect Continue the active workflow from `.standards/STATE.md`.
```

Use `/architect` in Claude Code. When recovery is active, direct the role to
read the active frame and continue the active recovery. Do not infer a new state
from the existence of an apparently finished file.

## Resolve blockers without skipping gates

If `BlockedOn` contains an unresolved question, incorporate the user's answer
before clearing it and completing the role. A question alone does not advance
the state.

If the state is `AWAITING_USER_SIGNOFF`, the next action belongs to the user. If
it is `SIGNED_OFF` or `CANCELLED`, new work requires a new cycle rather than a
resumption of role work.

Navigator may explain the current records without changing them. Its involvement
does not itself count as progress through a completion gate.
