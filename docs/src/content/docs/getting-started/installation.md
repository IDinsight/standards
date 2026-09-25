---
title: Installation and Setup
description:
  Install STANDARDS in a project and connect its roles to your coding agent.
---

STANDARDS is available as a public npm package. You need Node.js 22.12 or newer
and an existing project directory. Run the latest installer from that directory:

```sh
cd /path/to/project
npx @idinsight/standards@latest install
```

Or point it at a project from somewhere else:

```sh
npx @idinsight/standards@latest install --project /absolute/path/to/project
```

The command installs framework files into the project; it does not add a package
dependency or start a workflow cycle. It prints the installed version, project
mode, selected coding agents, number of changed paths, and any warnings.

## Choose a project mode and coding agent

On a first install, the installer treats an empty or metadata-only directory as
**greenfield** and a directory with other content as **brownfield**. Greenfield
means there is no meaningful implementation to preserve; brownfield means there
is. If the inferred mode is wrong, set it explicitly on the first run:

```sh
npx @idinsight/standards@latest install --mode brownfield
```

You can use `--mode greenfield` instead. An existing installation keeps its
saved project mode; rerunning the installer cannot change it. See
[Project and Cycle Modes](../../concepts/project-modes/) for how project mode
affects the workflow.

By default, the installer sets up skills for both Codex and Claude Code. Use
`--client codex` or `--client claude` to install one. You can add the other on a
later run. Invoke roles explicitly with `$scoper` in Codex or `/scoper` in
Claude Code; the same pattern applies to the other roles.

## What the installer adds

The installed project has these framework files:

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
├── .agents/skills/<role>/    # When Codex is selected
└── .claude/skills/<role>/    # When Claude Code is selected
```

For Claude Code, it also sets the installed roles to user-invocable-only in
`.claude/settings.json`. Codex skill adapters disable implicit invocation. The
installer maintains a marked section in `AGENTS.md` and connects `CLAUDE.md` to
it, keeping project-owned text and an existing `@AGENTS.md` import. The
[runtime file reference](../../reference/runtime-files/) explains what each file
does.

Installation saves the project mode and prepares an empty cycle-ID registry.
There is no request or active cycle yet, and the installer does not create an
Auditor context file or pretend that any role has finished. Follow
[Starting a Cycle](../../guides/starting-a-cycle/) when you are ready to give
the first request. [Your First Workflow](../first-workflow/) shows a complete
example.

## Reinstall or upgrade

Run the `@latest` command again to reinstall or upgrade to the newest release.
If you need a repeatable install or want to reinstall the exact same version,
replace `@latest` with a specific version. The installer accepts the same
version or a newer minor or patch release within the installed major version. It
rejects downgrades and cross-major upgrades. A major upgrade of an existing
project needs a separate migration process.

The installer checks that existing framework files belong to STANDARDS before
replacing them. It preserves project-owned instructions, the saved project mode,
active workflow state, cycle IDs, and Auditor context. It does not take
ownership of compatible Claude Code settings that were already present. If it
reports a file collision, conflicting setting, incomplete runtime, or
interrupted install, resolve the reported condition before retrying. It will not
fill in missing workflow history by guessing.

The exact preservation and upgrade rules are in the
[Installed Runtime Contract](../../reference/protocol/#installed-runtime-contract).
