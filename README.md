# S.T.A.N.D.A.R.D.S. — A Framework for Coding with Agents

[Check out our official documentation here!](https://idinsight.github.io/standards/)

- **S**coper
- **T**ester
- **A**rchitect
- **N**avigator
- **D**eveloper
- **A**uditor
- **R**eviewer
- **D**ocumenter
- **S**ynchronizer

S.T.A.N.D.A.R.D.S. is a project-agnostic, role-based workflow for coding agents.
Each skill owns a specific class of decisions or artifacts, and work moves
between roles through explicit completion gates and failure handoffs.

`PROTOCOL.md`, with its chapters in `protocol/`, is the canonical definition of
workflow states, project modes, cycle modes, transitions, failure types, and
shared terminology. Individual skills define role-specific behavior.

## Roles

- **Scoper** defines what must be achieved and what counts as done.
- **Tester** verifies implemented behavior and records traceability status for
  current scope acceptance conditions and technical acceptance criteria. It
  works in an independent chat reusable across increments and corrections,
  separate from Developer, and uses VERIFY or REVERIFY, preserving coverage and
  the active change's test budget.
- **Architect** defines consequential technical decisions and contracts.
- **Navigator** helps users understand the project through EXPLAIN (default),
  INVESTIGATE, and adaptive GRILL_ME questions. It uses repository evidence,
  stays strictly non-mutating, and works outside the workflow state machine
  without requiring an active cycle. Ask about Navigator's options before
  invoking it, or use `$navigator help` / `/navigator help` to discover current
  modes and user styles. See
  [Navigator](docs/src/content/docs/roles/navigator.md#discover-your-options).
- **Developer** turns the active contract into an approved atomic development
  plan, then implements it within established constraints using Autonomous,
  Stepwise, or Code With Me collaboration. In standard work, any of these modes
  can alternate with Tester through incremental verification or use the default
  verification after implementation; see
  [Working with Developer](docs/src/content/docs/guides/working-with-developer.md#choose-when-tester-runs).
- **Auditor** establishes and refreshes project context for the active workflow
  cycle.
- **Reviewer** independently assesses implementation and final deliverables in a
  fresh chat separate from their authors' conversations. It persists evidence,
  material findings, and limitations, then explains whether work can move
  forward in plain language.
- **Documenter** maintains user- and project-facing documentation and project
  agent guidance outside managed blocks. It works autonomously or guides one
  saved edit at a time, recording evidence and remaining work before final
  review. An explicit standalone assignment starts a Brownfield `DOCUMENTATION`
  cycle through Auditor, Scoper, Architect, Documenter, final Reviewer, and
  Synchronizer before user sign-off. It documents existing behavior and can
  create missing guides. See
  [Updating Documentation on Its Own](docs/src/content/docs/guides/updating-documentation.md).
- **Synchronizer** reconciles completed assessments, the current deliverable,
  and workflow records before user sign-off. It records evidence applicability
  and discrepancies, routing corrections to their owners.

Each role has eval cases in `skills/<role>/evals/evals.json`. See
[`SKILL_EVAL_REPORT.md`](SKILL_EVAL_REPORT.md) for an earlier evaluation and its
results.

## Choose when a standard cycle finishes

Standard work defaults to `FULL_DELIVERABLE`: documentation, final review, and
synchronization follow implementation review. For either a new or existing
project, you can instead ask to finish after implementation review. The agent
saves `IMPLEMENTATION_REVIEWED` for that cycle.

The shorter choice keeps all earlier standard steps, including full Tester
verification. Reviewer must separately confirm that every current requirement
has enough evidence and no required work remains. Required documentation and
fixes still go to their owners. Reviewer explains the omitted checks, then you
decide whether to sign off.

Make the choice with your initial request or before normal documentation work
begins. See
[Finishing After Implementation Review](docs/src/content/docs/guides/finishing-after-implementation-review.md)
for examples, restrictions, and how to return to the full workflow.

## Design Principles

1. The role that discovers a problem does not automatically own the fix. Route
   the problem to the role that owns the affected artifact or decision.
2. Hand off only after the applicable assignment or completion gate succeeds.
3. Keep scope, architecture, implementation, verification, review,
   documentation, and synchronization as distinct responsibilities.
4. Keep the framework usable across applications, services, libraries,
   frameworks, CLIs, tooling, systems software, infrastructure, and similar
   projects.
5. Treat Navigator as strictly non-mutating and outside the workflow state
   machine.
6. Invoke all roles, including Navigator, explicitly by the user. Persisted
   state validates which workflow role may act; it does not auto-dispatch
   skills. Use `$skill-name` in Codex and `/skill-name` in Claude Code.
7. When a handoff moves work to a different role, give the user a concise
   copy/paste invocation for that role using the active client's syntax. The
   invocation points the next role back to persisted state. Alongside it, show
   discovered user choices separately from state-selected or assessed behavior,
   preserving saved choices and locks. The agent performs discovery internally.
8. In `STANDARD` and `DOCUMENTATION` cycles, give scope acceptance conditions
   stable identifiers and carry them through downstream design and evidence
   until every current condition is evidenced before user sign-off.
9. Keep project baseline, active-cycle rigor, and next-cycle preference
   separate. `ProjectMode` describes whether the project is greenfield or
   brownfield; `CycleMode` is `UNSET` when no cycle is active and records the
   active cycle's `STANDARD`, `EXPEDITED`, or `DOCUMENTATION` topology.
   Pending-cycle fields store an explicit next-cycle preference and, only when
   cycle creation is blocked, the pending request plus the user decision
   required to resolve it.
10. Shorten the workflow by omitting roles, never by merging their ownership
    into another role. If an expedited change needs a skipped guarantee, promote
    the active cycle to `STANDARD` and run the owning roles.

See [`PROTOCOL.md`](PROTOCOL.md) for the authoritative workflow contract.

## Repository Development

The repository uses a root pnpm workspace. Use Node.js 22.12 or newer and pnpm
10.34.5:

```sh
pnpm install --frozen-lockfile
pnpm run docs:dev
```

Run `pnpm run docs:build` and `pnpm run docs:check-links` to validate the
documentation. See [the documentation README](docs/README.md) for preview and
reference-generation commands.

## Install, Reset, and Uninstall

For a shared installation, we recommend getting STANDARDS onto your main branch
before creating feature branches; see
[Choose a branch for the first installation](docs/src/content/docs/getting-started/installation.md#choose-a-branch-for-the-first-installation).
You can also
[use it only on a feature branch](docs/src/content/docs/faq.md#can-i-use-standards-only-on-a-feature-branch)
and uninstall it before merging into a main branch without STANDARDS.

Install the latest public release with Node.js 22.12 or newer:

```sh
npx @idinsight/standards@latest install
```

In a terminal, the installer asks for the project directory (default: the
current directory), project mode, coding agents, and whether to install the
STANDARDS stop hook, then previews its changes for confirmation. You can pass
`--project`, `--mode`, `--client`, and `--hooks` or `--no-hooks` to supply
answers; `--yes` skips all questions and uses the defaults for omitted options.
On a reinstall, the defaults keep the installed coding agents and hook choice.
Piped or automated runs also use those defaults without prompting. The installer
does not add a package dependency or start a workflow cycle.

The stop hook runs `node .standards/bin/check.mjs` when an agent finishes a turn
with uncommitted workflow changes. Codex runs it only after you trust it with
`/hooks` in the Codex CLI. Follow
[Finish local setup](docs/src/content/docs/getting-started/installation.md#finish-local-setup)
to trust the project and hook where required and verify Claude Code's skills and
hook. See
[Installation and Setup](docs/src/content/docs/getting-started/installation.md)
for options, upgrades, reset, and uninstall instructions.

To start the workflow over without reinstalling, run
`npx @idinsight/standards@<version> reset`, where `<version>` is the version
recorded in `.standards/VERSION.json`; a global `standards reset` works when it
has that version. Reset deletes the saved workflow state, Auditor context, and
every cycle record in `.standards/docs/`, writes a fresh `STATE.md` and
`MODE.md`, and chooses the project mode again from `--mode` or the project's
contents. The protocol, tools, skills, stop hook, client settings, and user
styles stay. In a terminal it asks for the mode, previews its changes, and asks
for confirmation; `--dry-run` previews without changes and `--yes` skips the
prompts.

Run `npx @idinsight/standards@latest uninstall` in a terminal to select a
project, preview everything it will remove, and confirm. To preview removal
without prompts or changes, run:

```sh
npx @idinsight/standards@latest uninstall --project /absolute/path/to/project --dry-run
```

Use `--yes` with `uninstall` to skip confirmation in scripts. Uninstall deletes
the installed skills and the entire `.standards/` directory, including saved
workflow history, context, every cycle record in `.standards/docs/`, user
styles, and any files you added there. The preview warns how many cycle records
and user styles it will delete. It also removes managed instruction blocks, the
STANDARDS stop hook, and matching installer-added settings. Project work outside
the removed directories is preserved. Installer-created client directories are
removed when empty. Existing files and directories stay. A globally installed
CLI stays installed.

The installer supports greenfield and brownfield projects. The authoritative
installer requirements live in [`INSTALLER.md`](INSTALLER.md), which stays in
this repository. The **Installed Runtime Contract** in the protocol chapter
[`protocol/installation.md`](protocol/installation.md) tells agents what an
installed project contains and how they may run reset and uninstall.

At a high level, installation selects the initial project mode, installs the
protocol and workflow skills for the chosen coding agent, applies explicit-only
invocation controls, merges the managed `AGENTS.md` / `CLAUDE.md` integration
without overwriting project-owned instructions, and initializes runtime
coordination files only when needed. Reinstallation preserves active workflow
state, user styles, and project-owned artifacts. STANDARDS has no migration
between major versions: moving a project to a new major version means
uninstalling and installing again, which deletes `.standards/`.

A typical installed project will contain:

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── bin/              # tools the agent runs, including check.mjs
│   ├── docs/             # cycle records, created as roles work
│   ├── protocol/         # protocol chapters, read when a situation needs them
│   ├── user-styles/      # optional personal styles you add, per role
│   ├── INSTALLATION.json
│   ├── MODE.md
│   ├── PROTOCOL.md
│   ├── STATE.md
│   └── VERSION.json
├── <agent-specific skill installation>
└── <stop hook settings>  # .claude/settings.json, .codex/hooks.json
```

`STATE.md` is the persisted coordination record for the active cycle, including
its `WorkflowState`, `CycleMode`, and pending-cycle coordination fields. Commit
`.standards/` with the project, so anyone who checks out a branch continues its
workflow; each branch carries at most one active cycle. If the main branch has
STANDARDS installed, run `standards reset` on a branch before merging so main
keeps a fresh installation. If main has no installation, uninstall STANDARDS on
the feature branch before merging. If you merge branches whose `.standards/`
files both changed without a reset, resolve the merge conflict by keeping
exactly one cycle in `STATE.md`. A role applies a user style from
`.standards/user-styles/<role>/` only when you select it by name. Role
ownership, standard, expedited, and documentation forward transitions,
promotion, recovery, user intervention, project-mode changes, cancellation/reset
behavior, project context, and user styles are defined only in
[`PROTOCOL.md`](PROTOCOL.md) and its chapters in [`protocol/`](protocol/), and
installation ownership checks and client-setting preservation only in
[`INSTALLER.md`](INSTALLER.md); they are intentionally not restated here.
