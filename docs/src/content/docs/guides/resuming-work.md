---
title: Resuming Interrupted Work
description: Continue work in a new session using the saved workflow records.
---

Start with the project files saved in version control. Make sure the current
state and work are available in the checkout you or the next agent will use.

## Read the coordination record

Read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and `.standards/STATE.md`,
then the relevant project context and work files. Check:

- The current state, cycle mode, request, and file paths.
- `PromotionReason`, if the cycle moved from expedited to standard work.
- `BaselineReconciliation`, for cancelled changes Auditor still needs to check.
- `BlockedOn`, for a question awaiting an answer.
- `Recovery`, for unfinished corrections and where work should return.

The latest handoff describes only the last step. It does not replace these saved
records. [Runtime Files](../../reference/runtime-files/) explains each one.

## Resume the owning role

If the state is `ARCHITECTING`, run Architect:

```text
$architect Continue the active workflow from `.standards/STATE.md`.
```

Use `/architect` in Claude Code. During recovery, ask the role to read the
active recovery frame and continue from it. A file that looks finished does not
prove that the workflow has advanced.

## Resolve blockers without skipping gates

If `BlockedOn` contains an unanswered question, use the answer before clearing
it and completing the role.

At `AWAITING_USER_SIGNOFF`, the next action belongs to you. From `SIGNED_OFF` or
`CANCELLED`, follow the [new-cycle rules](../cancelling-and-new-cycles/).
Navigator can explain the current state, but does not advance it.
