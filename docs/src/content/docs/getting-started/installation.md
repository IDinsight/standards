---
title: Installation and Setup
description: Install, update, or remove STANDARDS from a project.
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

## Uninstall from a project

Uninstall removes STANDARDS from a project even if a cycle is active. It does
not cancel the cycle or undo changes to your project. Stop active coding-agent
work first, and save anything you want to keep from `.standards/` or the
installed role directories.

Preview the changes:

```sh
npx @idinsight/standards@latest uninstall --project /absolute/path/to/project --dry-run
```

The preview lists each path it will remove or update without changing files. A
directory entry covers everything inside it; the preview does not list each
nested file. After checking the paths, run:

```sh
npx @idinsight/standards@latest uninstall --project /absolute/path/to/project
```

It removes:

- The entire `.standards/` directory, including saved workflow state, Auditor
  context, cycle-ID history, and any files you added there.
- Verified STANDARDS role directories for Codex and Claude Code, including local
  edits inside them. If both clients are installed, both are removed.
- The marked STANDARDS sections of `AGENTS.md` and `CLAUDE.md`. Your other text
  and existing Claude imports remain; an empty file is removed.
- Claude Code settings that the installer added, but only when their current
  values still match. Changed settings and compatible settings that were already
  there remain.

Your implementation, plans, reports, tests, documentation, and unrelated skills
outside the removed directories remain. The uninstaller removes a generated
Claude settings file when only its defaults remain, then removes client
directories it created if they are empty. It preserves files and directories it
cannot verify as installer-created. If a client directory remains, inspect its
contents before deleting anything manually. The global CLI is unaffected. You
can omit `--project` when you run the command inside the project; there is no
`--client` or `--force` option for uninstall.

The uninstaller stops before removal if it cannot establish ownership or safely
read an affected file. Missing workflow records do not prevent removal when
ownership is clear. If a removal fails, it attempts to restore the files. If it
reports an interrupted operation or incomplete recovery, keep the reported
backup directory and resolve it before retrying. See the
[uninstallation contract](../../reference/protocol/#project-uninstallation) for
the recovery rules. A later install starts a fresh runtime and cycle-ID
registry; it does not erase your remaining project work.
