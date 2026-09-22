---
title: Installation and Setup
description:
  Understand the installed runtime and client integration requirements.
---

This page describes the installation contract. A packaged installer command is
not yet provided in this repository. Do not treat copying a single skill file as
a complete installation: state, protocol, client controls, and ownership
metadata must agree.

## Choose the initial project mode

Use `GREENFIELD` when no meaningful project implementation exists that must be
treated as an established baseline. Otherwise use `BROWNFIELD`.

Installation sets `CycleMode: STANDARD`. The selected project mode initializes
`WorkflowState` at `SCOPING` or `AUDITING`, respectively. An existing README or
planning artifact alone does not determine the project mode. See
[Project Modes](../../concepts/project-modes/).

Before substantive work, an initialized brownfield cycle whose identifier and
request are both `UNSET` may select `EXPEDITED` and enter `DEVELOPING`. Keep an
`INITIAL` handoff with `From: NONE`, `FailureType: NONE`, and an expedited-entry
reason; initialize active work with `PromotionReason: NONE` and empty recovery.
See [cycle selection](../../concepts/project-modes/#choose-the-cycle-mode) for
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
fabricate completed context, scope, or architecture artifacts.

## Client integration

The managed block in `AGENTS.md` directs the agent to read the installed
protocol and state. The Claude Code integration imports `AGENTS.md`.

Workflow skills must remain explicitly invoked by the user. Codex adapters
preserve `allow_implicit_invocation: false`; Claude Code settings use
`skillOverrides.<skill>: "user-invocable-only"`. Installation records only
client-setting changes it actually owns in `INSTALLATION.json`.

Use `$scoper` in Codex and `/scoper` in Claude Code. The same naming convention
applies to the other roles. The active state still determines whether the role
may perform its work.

## Preserve the host project

Installation must verify framework ownership before updating an existing runtime
or skill package. It merges bounded integration blocks while preserving
project-owned text, settings, workflow state, and artifacts. Conflicting
instructions or settings require user resolution.

Reinstallation must not reset an active cycle, duplicate integration blocks, or
claim ownership of settings that already existed.

The precise rules are in
[Installed Runtime Contract](../../reference/protocol/#installed-runtime-contract).
Use that contract to review any installation tooling before relying on it.
