---
title: Starting a Cycle
description:
  Give the first role a request; the agent handles cycle setup and saves its
  state.
---

Installation prepares the workflow files, but it does not start a cycle. To
start one, give your request to the first role for your project. There is no
separate setup command, and you do not need to create a cycle ID or edit
`.standards/STATE.md` yourself.

## Give the first role your request

For a **new project** with no implementation to preserve, start standard work
with Scoper. In Codex, for example:

```text
$scoper Build a website where volunteers can sign up for local events.
```

For an **existing project**, start standard work with Auditor:

```text
$auditor Add search by name and email to the existing user directory.
```

In Claude Code, use `/scoper` or `/auditor` instead. The agent initializes the
cycle before doing that role's work. Follow
[Starting a New Project](../new-project/) or
[Working on an Existing Project](../existing-project/) for the rest of each
path.

## Choose a cycle mode only when needed

`STANDARD` is the default. You do not need to select it or set any state fields
before giving the first role a request.

For a small, clearly defined change in an existing project, you can invoke
Developer directly to request the shorter `EXPEDITED` path:

```text
$developer Fix the typo in the CLI's existing error message.
```

Use `/developer` in Claude Code. The agent checks whether the request is
eligible before starting expedited work. See
[project and cycle modes](../../concepts/project-modes/#choose-the-cycle-mode)
for the conditions.

You can also state a preference in advance, such as “Use STANDARD for my next
cycle.” The agent saves that preference, but it does not start a cycle until you
give a request.

## Resolve a blocked request

If your chosen mode cannot handle the request, the agent keeps the request and
asks you to choose a supported mode, revise it, or abandon it. You do not need
to repeat a saved request after making that decision.

## What the agent does automatically

Before the first role begins its work, the agent:

1. Checks the installed project mode, any saved preference, and whether the
   request can use the selected cycle mode.
2. Reserves a unique cycle ID in `.standards/CYCLE_IDS.md`.
3. Saves the request, mode, ID, and initial workflow state in
   `.standards/STATE.md`.

Those are agent responsibilities, not manual steps for you. The agent asks when
it needs a decision it cannot make from your request. Once a role finishes, you
still invoke the next role from its handoff; changing the saved state does not
run another role automatically.

If you are starting work after sign-off or cancellation, the agent also follows
the [new-cycle procedure](../cancelling-and-new-cycles/#start-the-next-cycle) to
preserve the previous cycle and check any work left by cancellation. The
[protocol](../../reference/protocol/#cycle-modes) has the exact state and ID
rules.
