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

`PROTOCOL.md` is the canonical definition of workflow states, project modes,
cycle modes, transitions, failure types, and shared terminology. Individual
skills define role-specific behavior.

## Roles

- **Scoper** defines what must be built and what counts as done.
- **Tester** verifies implemented behavior and records traceability status for
  current scope acceptance conditions and technical acceptance criteria. It
  starts in a fresh chat separate from Developer and uses VERIFY or REVERIFY,
  preserving coverage and the active change's test budget.
- **Architect** defines consequential technical decisions and contracts.
- **Navigator** helps users understand the project through EXPLAIN (default),
  INVESTIGATE, and adaptive GRILL_ME questions. It uses repository evidence,
  stays strictly non-mutating, and works outside the workflow state machine
  without requiring an active cycle.
- **Developer** turns the active contract into an approved atomic development
  plan, then implements it within established constraints using Autonomous,
  Stepwise, or Code With Me collaboration.
- **Auditor** establishes and refreshes project context for the active workflow
  cycle.
- **Reviewer** independently assesses implementation and final deliverables in a
  fresh chat separate from their authors' conversations. It persists evidence,
  material findings, and limitations, then explains whether work can move
  forward in plain language.
- **Documenter** maintains user- and project-facing documentation and project
  agent guidance outside managed blocks. It works autonomously or guides one
  saved edit at a time, recording evidence and remaining work before final
  review.
- **Synchronizer** reconciles completed assessments, the current deliverable,
  and workflow records before user sign-off. It records evidence applicability
  and discrepancies, routing corrections to their owners.

## Design Principles

1. The role that discovers a problem does not automatically own the fix. Route
   the problem to the role that owns the affected artifact or decision.
2. Advance only after the current role's completion gate succeeds.
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
   invocation points the next role back to persisted state rather than
   duplicating workflow context.
8. In `STANDARD` cycles, give scope acceptance conditions stable identifiers and
   carry those identifiers through downstream design and verification evidence
   until every current condition is evidenced before user sign-off.
9. Keep project baseline, active-cycle rigor, and next-cycle preference
   separate. `ProjectMode` describes whether the project is greenfield or
   brownfield; `CycleMode` is `UNSET` when no cycle is active and records the
   active cycle's `STANDARD` or `EXPEDITED` topology; pending-cycle fields store
   an explicit next-cycle preference and, only when cycle creation is blocked,
   the pending request plus the user decision required to resolve it.
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

## Installation Model

Use a published version of the project-level installer with pnpm:

```sh
pnpm dlx @idinsight/standards@0.1.0 install --project /absolute/path/to/project
```

The installer supports greenfield and brownfield projects. The authoritative
installer and runtime requirements live in [`PROTOCOL.md`](PROTOCOL.md),
especially **Installed Runtime Contract** and **Installer File Preservation**.

At a high level, installation selects the initial project mode, installs the
protocol and workflow skills for the chosen coding agent, applies explicit-only
invocation controls, merges the managed `AGENTS.md` / `CLAUDE.md` integration
without overwriting project-owned instructions, and initializes runtime
coordination files only when needed. Reinstallation preserves active workflow
state and project-owned artifacts unless the user explicitly requests
reinitialization.

A typical installed project will contain:

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
└── <agent-specific skill installation>
```

`STATE.md` is the persisted coordination record for the active cycle, including
its `WorkflowState`, `CycleMode`, and pending-cycle coordination fields.
`CYCLE_IDS.md` is the append-only reservation registry that prevents cycle-ID
reuse for as long as the S.T.A.N.D.A.R.D.S. runtime remains installed. Role
ownership, standard and expedited forward transitions, promotion, recovery, user
intervention, project-mode changes, cancellation/reset behavior, project
context, installation ownership checks, and client-setting preservation are
defined only in [`PROTOCOL.md`](PROTOCOL.md) and are intentionally not restated
here.
