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
- **Auditor** establishes and refreshes project context.
- **Reviewer** evaluates implementation and final deliverables at defined review gates.
- **Documenter** owns user- and project-facing documentation updates.
- **Synchronizer** reconciles completed work before human sign-off.

## Design Principles

1. The role that discovers a problem does not automatically own the fix. Route the problem to the role that owns the affected artifact or decision.
2. Advance only after the current role's completion gate succeeds.
3. Keep scope, architecture, implementation, verification, review, documentation, and synchronization as distinct responsibilities.
4. Keep the framework usable across applications, services, libraries, frameworks, CLIs, tooling, systems software, infrastructure, and similar projects.
5. Treat Navigator as strictly non-mutating and outside the workflow state machine.

See [`PROTOCOL.md`](PROTOCOL.md) for the authoritative workflow contract.

## Installation Model

The repository is intended to be installable into either a greenfield or brownfield project.

An installer should:

1. select a `ProjectMode` of `GREENFIELD` or `BROWNFIELD`;
2. install the skills into the location expected by the selected coding agent;
3. copy `PROTOCOL.md` to `.standards/PROTOCOL.md` in the target project;
4. install the common `AGENTS.md` and `CLAUDE.md` entry files;
5. install the selected mode template as `.standards/MODE.md`;
6. let the owning skills create scope, technical design, project context, tests, reviews, documentation, and other workflow artifacts when those phases run.

The installer should not create fake scope or architecture documents merely to populate directories.

A typical installed project will begin with:

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── PROTOCOL.md
│   └── MODE.md
└── <agent-specific skill installation>
```

The initial workflow state is derived from the selected project mode by `PROTOCOL.md`.
