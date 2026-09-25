---
title: Installation and Setup
description:
  Prepare the workflow files and connect the skills to your coding agent.
---

The installer is a project-level setup command distributed as the
`@idinsight/standards` package. It does not add a dependency to your project.
Use a published version of the package.

```sh
pnpm dlx @idinsight/standards@0.1.0 install --project /absolute/path/to/project
```

The project directory must already exist. Without `--project`, the installer
targets the current directory. It installs both Codex and Claude Code skills by
default. Use `--client codex` or `--client claude` to install one client; a
later run can add the other client without removing the first. For an
unpublished checkout, use
`node bin/standards.js install --project /absolute/path/to/project` from the
repository root instead.

The command installs files but does not start a workflow cycle. It reports the
target, installed framework version, mode, clients, changed path count, and any
warnings. [pnpm dlx](https://pnpm.io/motivation) runs a package executable
without adding it as a project dependency.

## Choose the initial project mode

Use `GREENFIELD` when there is no substantial existing implementation to
preserve. Otherwise use `BROWNFIELD`. The installer infers a first-install mode
from the target directory: an empty or metadata-only directory is greenfield;
other content is treated as brownfield. If that conservative inference is wrong,
specify `--mode greenfield` or `--mode brownfield` on the first install. An
existing runtime keeps its saved mode; the installer does not change it.

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
│   ├── CYCLE_IDS.md
│   ├── INSTALLATION.json
│   ├── MODE.md
│   ├── PROTOCOL.md
│   ├── STATE.md
│   └── VERSION.json
├── .agents/skills/<role>/    # Codex, when selected
└── .claude/skills/<role>/    # Claude Code, when selected
```

`CONTEXT.md` is created by Auditor when an audit runs. Installation must not
create context, scope, design, or development-plan files that pretend those
roles have completed their work.

`VERSION.json` records the installed framework release. `INSTALLATION.json`
records only client-setting values that the installer itself added.

## Client integration

The managed block in `AGENTS.md` directs the agent to read the installed
protocol and state. The Claude Code integration imports `AGENTS.md`.

Users must explicitly run each role skill, including Navigator. Codex adapters
preserve `allow_implicit_invocation: false`; Claude Code settings use
`skillOverrides.<skill>: "user-invocable-only"`. Installation records only
client-setting changes it actually owns in `INSTALLATION.json`.

Use `$scoper` in Codex and `/scoper` in Claude Code. The same naming convention
applies to the other roles. The active state still determines whether the role
may perform its workflow work. Navigator is outside that state machine and can
explain available project evidence without an active cycle or complete runtime;
this does not initialize or repair an installation.

## Preserve the host project

Installation must verify framework ownership before updating an existing runtime
or skill package. It updates marked integration sections while preserving
project-owned text, settings, workflow state, and work files. Conflicting
instructions or settings require user resolution.

Reinstallation must not reset an active cycle, duplicate integration blocks, or
claim ownership of settings that already existed.

To reinstall or upgrade, run the same command with the desired published
version. A newer minor or patch version within the installed major line can
update the protocol and skills together while preserving mode, state, cycle IDs,
and Auditor context. The installer rejects downgrades and cross-major upgrades.
A major release needs a separately designed migration process for an existing
runtime; it can still be installed into a fresh project. Pin an exact version
when you need repeatable installation.

If the installer reports an unowned file collision, conflicting Claude setting,
missing runtime file, invalid workflow state, or interrupted transaction,
inspect that condition before retrying. It does not infer missing workflow
history or discard existing project files to complete an upgrade.

Preserve existing workflow data during upgrades. Missing required fields or
invalid formats must be corrected, not filled with inferred defaults. Preserve
the cycle-ID registry even during explicit workflow reinitialization. A missing
registry in an installed runtime must not be silently recreated. See
[registry lifecycle](../../reference/runtime-files/#cycle-identity).

The precise rules are in
[Installed Runtime Contract](../../reference/protocol/#installed-runtime-contract).
Check installation tools against those rules before using them.
