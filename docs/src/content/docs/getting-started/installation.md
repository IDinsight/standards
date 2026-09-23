---
title: Installation and Setup
description:
  Prepare the workflow files and connect the skills to your coding agent.
---

This page describes what installation must set up. The repository does not yet
provide an installer command. Copying one skill file is not enough: the workflow
files, client settings, and record of installer changes must work together.

## Choose the initial project mode

Use `GREENFIELD` when there is no substantial existing implementation to
preserve. Otherwise use `BROWNFIELD`.

Installation sets `CycleMode: STANDARD`. The selected project mode initializes
`WorkflowState` at `SCOPING` or `AUDITING`, respectively. An existing README or
planning document alone does not determine the project mode. See
[Project Modes](../../concepts/project-modes/).

Before work begins, an initialized brownfield cycle whose ID and request are
both `UNSET` may select `EXPEDITED` and enter `DEVELOPING`. Keep an `INITIAL`
handoff with `From: NONE`, `FailureType: NONE`, and an expedited-entry reason;
initialize active work with `PromotionReason: NONE`,
`BaselineReconciliation: NONE`, and empty recovery. See
[cycle selection](../../concepts/project-modes/#choose-the-cycle-mode) for
explicit selection and Developer-entry rules. Greenfield supports standard only.

## Required installed files

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── PROTOCOL.md
│   ├── INSTALLATION.json
│   ├── MODE.md
│   └── STATE.md
└── <client-specific skill installation>
```

`CONTEXT.md` is created by Auditor when an audit runs. Installation must not
create context, scope, or design files that pretend those roles have completed
their work.

## Client integration

The managed block in `AGENTS.md` directs the agent to read the installed
protocol and state. The Claude Code integration imports `AGENTS.md`.

Users must explicitly run each workflow skill. Codex adapters preserve
`allow_implicit_invocation: false`; Claude Code settings use
`skillOverrides.<skill>: "user-invocable-only"`. Installation records only
client-setting changes it actually owns in `INSTALLATION.json`.

Use `$scoper` in Codex and `/scoper` in Claude Code. The same naming convention
applies to the other roles. The active state still determines whether the role
may perform its work.

## Preserve the host project

Installation must verify framework ownership before updating an existing runtime
or skill package. It updates marked integration sections while preserving
project-owned text, settings, workflow state, and work files. Conflicting
instructions or settings require user resolution.

Reinstallation must not reset an active cycle, duplicate integration blocks, or
claim ownership of settings that already existed.

The precise rules are in
[Installed Runtime Contract](../../reference/protocol/#installed-runtime-contract).
Check installation tools against those rules before using them.
