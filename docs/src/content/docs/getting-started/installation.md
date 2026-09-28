---
title: Installation and Setup
description: Install, update, reset, or remove STANDARDS in a project.
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

In a terminal, the command asks for an existing project directory (default: the
current directory), project mode, coding agents, and whether to install the
STANDARDS stop hook. It previews the exact paths it plans to change and asks for
confirmation before writing. The command installs framework files into the
project; it does not add a package dependency or start a workflow cycle. It
prints the installed version, project mode, coding agents, whether the hook is
on, the number of changed paths, and any warnings.

## Choose a project mode and coding agent

On a first install, the installer suggests **greenfield** for an empty or
metadata-only directory and **brownfield** for a directory with other content.
Metadata includes version control and editor files, coding-agent settings such
as `.claude/`, `.agents/`, and `.codex/`, and common top-level files such as
`README.md`, `LICENSE`, and `package.json`. Greenfield means there is no
meaningful implementation to preserve; brownfield means there is. Choose the
other mode in the prompt if needed, or set it with a flag:

```sh
npx @idinsight/standards@latest install --mode brownfield
```

You can use `--mode greenfield` instead. An existing installation keeps its
saved project mode; rerunning the installer cannot change it, but
[a reset](#reset-the-workflow) chooses it again. See
[Project and Cycle Modes](../../concepts/project-modes/) for how project mode
affects the workflow.

On a first install, the coding-agent prompt selects both Codex and Claude Code.
Use `--client codex` or `--client claude` to select one without that prompt. On
a reinstall, the prompt selects the agents already installed. You can add the
other one on a later run; removing one requires uninstalling. Invoke roles
explicitly with `$scoper` in Codex or `/scoper` in Claude Code; the same pattern
applies to the other roles.

For scripts, pass `--yes` to skip prompts and confirmation. On a first install,
omitted options then use the current directory, the inferred mode, both coding
agents, and the hook. On a reinstall, they keep the installed agents and hook
choice. Runs without an interactive terminal also use these defaults
automatically. A cancelled prompt or declined confirmation changes no project
files.

## Hooks

The STANDARDS stop hook lets the coding agent run STANDARDS checks
automatically. The installer adds it unless you decline in the prompt or pass
`--no-hooks`. When the agent finishes a turn and workflow files have uncommitted
changes, the hook runs `node .standards/bin/check.mjs`. If the check finds
problems, the agent is sent back once to fix them, pass them to the responsible
role, or report them to you.

The Claude Code hook goes in `.claude/settings.json` and the Codex hook in
`.codex/hooks.json`. The installer adds, updates, and removes only its own hook;
hooks you set up yourself stay as they are. A reinstall keeps your current
choice. Pass `--hooks` or `--no-hooks` to turn it on or off later.

Codex runs new or changed project hooks only after you trust them. After
installing or upgrading, open Codex in the project and run `/hooks` to review
and trust the STANDARDS hook. An organization can instead manage hooks centrally
through Codex's `requirements.toml`, which Codex trusts by policy. See
[Codex hooks](https://learn.chatgpt.com/docs/hooks).

The hook needs Node.js on the path your coding agent uses. The Codex hook looks
for `.standards/` in the folder where Codex started and then in each folder
above it, so STANDARDS can live in a subfolder of a larger git repository. Start
Codex in the project folder. Inside a git repository you can also start it in a
subfolder of the project, because Codex then loads the project's skills and
hooks from the folders above. Outside git, Codex may not find them unless it
starts in the project folder itself. Claude Code must start in the project
folder, because it reads `.claude/settings.json`, which holds the STANDARDS hook
and the settings that keep role skills user-invoked, only from the folder where
it starts.

## What the installer adds

The installed project has these framework files:

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── bin/                  # Tools the agent runs
│   ├── docs/                 # Cycle records, created as roles work
│   ├── INSTALLATION.json
│   ├── MODE.md
│   ├── PROTOCOL.md
│   ├── STATE.md
│   └── VERSION.json
├── .agents/skills/<role>/    # When Codex is selected
├── .claude/skills/<role>/    # When Claude Code is selected
└── .codex/hooks.json         # When Codex is selected and the hook is on
```

For Claude Code, it also sets the installed roles to user-invocable-only in
`.claude/settings.json` and adds the Claude Code hook there. Codex skill
adapters disable implicit invocation. `.standards/bin/` holds the tools the
agent uses to generate cycle IDs, create records, number entries, and check the
workflow files. The roles keep their cycle records in `.standards/docs/`. The
installer maintains a marked section in `AGENTS.md` and connects `CLAUDE.md` to
it, keeping project-owned text and an existing `@AGENTS.md` import. The
[runtime file reference](../../reference/runtime-files/) explains what each file
does.

Installation saves the project mode and an empty workflow state. There is no
request or active cycle yet, and the installer does not create an Auditor
context file or pretend that any role has finished. Follow
[Starting a Cycle](../../guides/starting-a-cycle/) when you are ready to give
the first request. [Your First Workflow](../first-workflow/) shows a complete
example.

## Reinstall or upgrade

Run the `@latest` command again to reinstall or upgrade to the newest release.
If you need a repeatable install or want to reinstall the exact same version,
replace `@latest` with a specific version. The installer accepts the same
version or a newer minor or patch release within the installed major version. It
rejects downgrades.

STANDARDS has no migration between major versions. To move an existing project
to a new major version, sign off or cancel the active cycle,
[uninstall](#uninstall-from-a-project), and install again. Uninstalling deletes
`.standards/`, including workflow state, Auditor context, every cycle record,
and your user styles. Your project files stay.

The installer checks that existing framework files belong to STANDARDS before
replacing them. It preserves project-owned instructions, the saved project mode,
active workflow state, cycle records, Auditor context, and your
[user styles](../../reference/runtime-files/#user-styles). It also keeps files
you added inside installed skill folders. It does not take ownership of
compatible Claude Code settings that were already present.

If a setting or hook that the installer added was changed or removed, a
reinstall puts it back and lists it under "Restores" in the preview. If the
installer reports a file collision, a conflicting setting it never added, an
incomplete runtime, or an interrupted install, resolve the reported condition
before retrying. It will not fill in missing workflow history by guessing.

The exact preservation and upgrade rules are in the
[Installer Contract](../../reference/installer/).

## Reset the workflow

`standards reset` starts the workflow over and keeps STANDARDS installed. Use it
to drop the cycles on a branch and start again, to give a branch a fresh
installation before you merge it into your main branch (see
[Branches and merges](../../reference/runtime-files/#branches-and-merges)), or
to choose the project mode again.

The CLI must be the version recorded in `.standards/VERSION.json`, because the
fresh files come from its templates. Replace `<version>` below with that
version, or use `standards reset` if your global CLI has it. To move to a newer
release instead, run `install` first. To preview without prompts or changes:

```sh
npx @idinsight/standards@<version> reset --project /absolute/path/to/project --dry-run
```

In a terminal, reset asks for the project and the mode, suggesting the one the
project's contents indicate, then shows a preview and asks you to confirm; the
default answer is no. Pass `--mode greenfield` or `--mode brownfield` to set the
mode, and `--yes` to skip the prompts. Runs without an interactive terminal skip
them too and use the suggested mode.

Reset deletes the saved workflow state, the Auditor's `.standards/CONTEXT.md`,
and every cycle record in `.standards/docs/`; the preview warns how many records
it will delete. It then writes a fresh `.standards/STATE.md` and
`.standards/MODE.md`, as a first install would. Everything else stays: the
protocol, the tools in `.standards/bin/`, the version and installation records,
your user styles, the installed skills, the stop hook, client settings, and the
managed sections of `AGENTS.md` and `CLAUDE.md`. Reset does not undo changes to
your project files.

Reset is yours to run. An agent runs it only when you ask, or to
[cancel a greenfield cycle](../../guides/cancelling-and-new-cycles/) that has no
implementation, after showing you the preview and getting your approval.

## Uninstall from a project

Uninstall removes STANDARDS from a project even if a cycle is active. The
command itself does not record a cancellation or undo changes to your project.
To start the workflow over and keep STANDARDS installed,
[reset](#reset-the-workflow) instead.

Stop active coding-agent work before removal, and save anything you want to keep
from `.standards/` or the installed role directories, such as your user styles.

Run `npx @idinsight/standards@latest uninstall` in a terminal to choose a
project, see the removal preview, and confirm. It always removes the complete
STANDARDS installation, including every installed client. If you installed the
CLI globally, you can use `standards uninstall` with the same options. To
preview without prompts or changes, run:

```sh
npx @idinsight/standards@latest uninstall --project /absolute/path/to/project --dry-run
```

The preview lists each path it will remove or update without changing files. A
directory entry covers everything inside it; the preview does not list each
nested file. For a non-interactive removal after checking the paths, run:

```sh
npx @idinsight/standards@latest uninstall --project /absolute/path/to/project --yes
```

It removes:

- The entire `.standards/` directory, including saved workflow state, Auditor
  context, every cycle record in `.standards/docs/`, your user styles in
  `.standards/user-styles/`, and any files you added there. The preview warns
  how many cycle records and user styles it will delete.
- Verified STANDARDS role directories for Codex and Claude Code, including local
  edits inside them. If both clients are installed, both are removed.
- The marked STANDARDS sections of `AGENTS.md` and `CLAUDE.md`, with the blank
  line the installer added before them. Your other text and existing Claude
  imports remain; an empty file is removed.
- The STANDARDS stop hook in `.claude/settings.json` and `.codex/hooks.json`.
  Your own hooks remain. `.codex/hooks.json` and `.codex/` are removed when the
  installer created them and nothing else is left in them.
- Claude Code settings that the installer added, but only when their current
  values still match. Changed settings and compatible settings that were already
  there remain.

Your implementation, tests, documentation, and unrelated skills outside the
removed directories remain. The uninstaller removes a generated Claude settings
file when only its defaults remain, then removes client directories it created
if they are empty. It preserves files and directories it cannot verify as
installer-created. If a client directory remains, inspect its contents before
deleting anything manually. The global CLI is unaffected. You can omit
`--project` when you run the command inside the project; there is no `--client`
or `--force` option for uninstall.

The uninstaller stops before removal if it cannot establish ownership or safely
read an affected file. Missing workflow records do not prevent removal when
ownership is clear. If a removal fails, it attempts to restore the files. If it
reports an interrupted operation or incomplete recovery, keep the reported
backup directory and resolve it before retrying. See the
[uninstallation contract](../../reference/installer/#project-uninstallation) for
the recovery rules. A later install starts a fresh runtime; it does not erase
your remaining project work.
