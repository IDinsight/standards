# S.T.A.N.D.A.R.D.S. — A Framework for Coding with Agents

- **S**coper
- **T**ester
- **A**rchitect
- **N**avigator
- **D**eveloper
- **A**uditor
- **R**eviewer
- **D**ocumenter
- **S**ynchronizer

S.T.A.N.D.A.R.D.S. is a project-agnostic, role-based workflow for coding agents. Each skill owns a specific class of decisions or artifacts, and work moves between roles through explicit completion gates and failure handoffs.

`PROTOCOL.md` is the canonical definition of workflow states, project modes, transitions, failure types, and shared terminology. Individual skills define role-specific behavior.

## Roles

- **Scoper** defines what must be built and what counts as done.
- **Tester** verifies implementation behavior and technical acceptance criteria.
- **Architect** defines consequential technical decisions and contracts.
- **Navigator** provides read-only explanation, tracing, diagnosis, and project understanding outside the workflow state machine.
- **Developer** implements the current technical design.
- **Auditor** establishes and refreshes project context for the active workflow cycle.
- **Reviewer** evaluates implementation and final deliverables at defined review gates.
- **Documenter** owns user- and project-facing documentation updates.
- **Synchronizer** reconciles completed work before user sign-off.

## Design Principles

1. The role that discovers a problem does not automatically own the fix. Route the problem to the role that owns the affected artifact or decision.
2. Advance only after the current role's completion gate succeeds.
3. Keep scope, architecture, implementation, verification, review, documentation, and synchronization as distinct responsibilities.
4. Keep the framework usable across applications, services, libraries, frameworks, CLIs, tooling, systems software, infrastructure, and similar projects.
5. Treat Navigator as strictly non-mutating and outside the workflow state machine.
6. Invoke workflow roles explicitly by the user. Persisted state validates which role may act; it does not auto-dispatch skills. Use `$skill-name` in Codex and `/skill-name` in Claude Code.
7. When a handoff moves work to a different role, give the user a concise copy/paste invocation for that role using the active client's syntax. The invocation points the next role back to persisted state rather than duplicating workflow context.

See [`PROTOCOL.md`](PROTOCOL.md) for the authoritative workflow contract.

## Installation Model

The repository is intended to be installable into either greenfield or brownfield projects. The authoritative installer and runtime requirements live in [`PROTOCOL.md`](PROTOCOL.md), especially **Installed Runtime Contract** and **Installer File Preservation**.

At a high level, installation selects the initial project mode, installs the protocol and workflow skills for the chosen coding agent, applies explicit-only invocation controls, merges the managed `AGENTS.md` / `CLAUDE.md` integration without overwriting project-owned instructions, and initializes runtime coordination files only when needed. Reinstallation preserves active workflow state and project-owned artifacts unless the user explicitly requests reinitialization.

A typical installed project will contain:

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── PROTOCOL.md
│   ├── INSTALLATION.json
│   ├── MODE.md
│   └── STATE.md
└── <agent-specific skill installation>
```

`STATE.md` is the persisted coordination record for the active cycle. Role ownership, forward transitions, recovery, user intervention, project-mode changes, cancellation/reset behavior, project context, installation ownership checks, and client-setting preservation are defined only in [`PROTOCOL.md`](PROTOCOL.md) and are intentionally not restated here.
