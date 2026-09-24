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

Installation sets `CycleMode: UNSET`, `PendingCycleMode: UNSET`,
`PendingCycleRequest: UNSET`, and `PendingCycleBlockedOn: NONE`. The project
mode sets the initial `WorkflowState` to `SCOPING` or `AUDITING`, respectively,
but no role-owned work starts until a request initializes the cycle. An existing
README or planning document alone does not determine the project mode. See
[Project Modes](../../concepts/project-modes/).

The initial ID and request are `UNSET`; artifact paths are `NONE`, and recovery
and outstanding obligations are inactive. Installation creates an empty cycle-ID
registry. [Starting a Cycle](../../guides/starting-a-cycle/) explains how a real
request selects its mode and reserves an ID before work begins.

## Required installed files

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── PROTOCOL.md
│   ├── INSTALLATION.json
│   ├── CYCLE_IDS.md
│   ├── MODE.md
│   └── STATE.md
└── <client-specific skill installation>
```

`CONTEXT.md` is created by Auditor when an audit runs. Installation must not
create context, scope, design, or development-plan files that pretend those
roles have completed their work.

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

On upgrade, add newly required state fields only when absent and with neutral
defaults. Preserve existing workflow data. Preserve the cycle-ID registry even
during explicit workflow reinitialization. A verified upgrade from a protocol
without a registry must create and seed it before replacing the installed
protocol; a missing registry in a runtime that already requires one must not be
silently recreated. See
[registry lifecycle](../../reference/runtime-files/#cycle-identity).

The precise rules are in
[Installed Runtime Contract](../../reference/protocol/#installed-runtime-contract).
Check installation tools against those rules before using them.
