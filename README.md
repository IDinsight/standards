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
6. Invoke workflow roles explicitly by the human. Persisted state validates which role may act; it does not auto-dispatch skills. Use `$skill-name` in Codex and `/skill-name` in Claude Code.
7. When a handoff moves work to a different role, give the human a concise copy/paste invocation for that role using the active client's syntax. The invocation points the next role back to persisted state rather than duplicating workflow context.

See [`PROTOCOL.md`](PROTOCOL.md) for the authoritative workflow contract.

## Installation Model

The repository is intended to be installable into either a greenfield or brownfield project.

An installer should:

1. select a `ProjectMode` of `GREENFIELD` or `BROWNFIELD`;
2. install the skills into the location expected by the selected coding agent and apply that client's explicit-only invocation controls;
3. install or update `PROTOCOL.md` at `.standards/PROTOCOL.md` in the target project;
4. install or safely merge the common `AGENTS.md` and `CLAUDE.md` integration without overwriting existing project instructions;
5. initialize the selected mode template, including `.standards/MODE.md` and the mode's initial `.standards/STATE.md`, when those files do not already exist;
6. let the owning skills create scope, technical design, project context, tests, reviews, documentation, and other workflow artifacts when those phases run.

The installer should not create fake scope or architecture documents merely to populate directories. Initial `STATE.md` may leave `Active Work.Id` and `Active Work.Request` as `UNSET`; the first real request must be persisted there before substantive workflow work begins.

The installer must be safe for existing brownfield repositories. If `AGENTS.md` or `CLAUDE.md` already exists, preserve its existing content. Add or update only the bounded S.T.A.N.D.A.R.D.S. integration block in `AGENTS.md`, and ensure `CLAUDE.md` imports `AGENTS.md` with `@AGENTS.md` exactly once. Update framework-owned `.standards/PROTOCOL.md` and installed skill definitions on reinstall, but preserve the existing runtime coordination files `.standards/MODE.md` and `.standards/STATE.md` unless the human explicitly requests reinitialization. For Claude Code, safely merge the S.T.A.N.D.A.R.D.S. `skillOverrides` entries into `.claude/settings.json` without overwriting unrelated settings; each installed workflow skill must be `"user-invocable-only"`. Codex keeps the equivalent explicit-only policy in each skill's `agents/openai.yaml`. If preserved project instructions or client settings conflict with the S.T.A.N.D.A.R.D.S. protocol or explicit-only invocation policy, report the conflict for human resolution instead of silently overwriting either side. Re-running installation should be idempotent.

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

`STATE.md` is version-controlled and records the current workflow state, active-work identity and artifact references, the latest handoff, blocking human questions, and a recovery stack. Each failure or human-rework transition can push its own recovery frame, so nested corrections do not erase earlier obligations. A frame remains until workflow state reaches that frame's `ResumeAt`. Every legal state-changing handoff updates the file.

`AWAITING_HUMAN_SIGNOFF` means a cycle is still waiting on a human decision. Human-requested rework may occur from any active state, and a human may cancel an active cycle. Explicit approval transitions to terminal SIGNED_OFF. Cancellation normally transitions to terminal CANCELLED; a greenfield cancellation before DEVELOPING instead removes the bootstrap installation as defined by the protocol. A later request begins a new cycle from a retained terminal state, while a bootstrap cancellation requires a fresh installation.

`GREENFIELD` is a bootstrap mode only. When the initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`, `MODE.md` transitions permanently to `BROWNFIELD`. A greenfield cycle cancelled from `DEVELOPING` or later also transitions to `BROWNFIELD`, so future work audits any partial implementation before scoping. Future brownfield cycles start in `AUDITING`.

When Auditor runs, it creates or refreshes `.standards/CONTEXT.md`, the canonical active-cycle baseline of relevant project state and constraints. The installer does not create this file because project context is a role-owned workflow artifact, not installation metadata.

Claude Code installations additionally merge `templates/claude/.claude/settings.json` semantics into the project's `.claude/settings.json` so S.T.A.N.D.A.R.D.S. workflow skills remain visible to the human but unavailable for model-initiated invocation.
