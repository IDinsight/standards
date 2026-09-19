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
3. install or update `PROTOCOL.md` at `.standards/PROTOCOL.md` in the target project;
4. install or safely merge the common `AGENTS.md` and `CLAUDE.md` integration without overwriting existing project instructions;
5. initialize the selected mode template, including `.standards/MODE.md` and the mode's initial `.standards/STATE.md`, when those files do not already exist;
6. let the owning skills create scope, technical design, project context, tests, reviews, documentation, and other workflow artifacts when those phases run.

The installer should not create fake scope or architecture documents merely to populate directories.

The installer must be safe for existing brownfield repositories. If `AGENTS.md` or `CLAUDE.md` already exists, preserve its existing content. Add or update only the bounded S.T.A.N.D.A.R.D.S. integration block in `AGENTS.md`, and ensure `CLAUDE.md` imports `AGENTS.md` with `@AGENTS.md` exactly once. Update framework-owned `.standards/PROTOCOL.md` and installed skill definitions on reinstall, but preserve the existing runtime coordination files `.standards/MODE.md` and `.standards/STATE.md` unless the human explicitly requests reinitialization. If preserved project instructions conflict with the S.T.A.N.D.A.R.D.S. protocol or integration block, report the conflict for human resolution instead of silently overwriting either side. Re-running installation should be idempotent.

A typical installed project will begin with:

```text
project/
├── AGENTS.md
├── CLAUDE.md
├── .standards/
│   ├── PROTOCOL.md
│   ├── MODE.md
│   └── STATE.md
└── <agent-specific skill installation>
```

`STATE.md` is version-controlled and records the current workflow state plus minimal handoff/recovery context so work can resume after a disconnected session and, once state changes are shared through version control, by another agent or developer. Failure and human-rework handoffs preserve the interrupted state as `Recovery.ResumeAt` until the workflow returns there. Every legal state-changing handoff updates the file.

`AWAITING_HUMAN_SIGNOFF` means a cycle is still waiting on a human decision. The human may sign off or request rework. Explicit approval transitions it to terminal `SIGNED_OFF`; only then can subsequent requested changes begin a new cycle.

`GREENFIELD` is a bootstrap mode only. When the initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`, `MODE.md` transitions permanently to `BROWNFIELD`; future cycles therefore start in `AUDITING`.
