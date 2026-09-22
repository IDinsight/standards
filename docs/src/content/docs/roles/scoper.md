---
title: Scoper
description: Define what must be built and what counts as done.
---

Scoper turns a request into a bounded scope with observable acceptance
conditions. It owns the outcome and acceptance meaning; material technical
choices belong to Architect unless already established as constraints.

## When to use Scoper

Scoper acts in `SCOPING`: at the start of a greenfield cycle, after a brownfield
audit, or when recovery or user rework requires a scope correction.

## Inputs and output

Read the persisted request, explicit constraints, current scope when present,
and relevant project context. Brownfield scoping requires active-cycle Auditor
context. Initial greenfield scoping may precede the first context artifact.

Persist the scope in the project's established location, or a change-specific
file under `docs/scope/` when none exists. Record its repository-relative path
in `Active Work.Scope`.

The [scope template](../../reference/templates/scoper/) defines the artifact:
goal, constraints, non-goals, work with acceptance conditions and dependencies,
retired acceptance identifiers when applicable, and non-blocking assumptions.

## Modes

**PLAN** creates the active cycle's first scope. A brownfield feature can use
PLAN; this mode does not mean the whole project is greenfield.

**REPLAN** reconciles an existing active-cycle scope with corrected context,
recovery, or requested changes. Preserve valid intent and identifiers. Add new
identifiers for new or materially replaced conditions, and retain retired ones.

## Example invocation

After the workflow enters `SCOPING`, use the line for your client:

```text
Codex:       $scoper Continue from `.standards/STATE.md`.
Claude Code: /scoper Continue from `.standards/STATE.md`.
```

The recorded scope and request determine the mode. You do not need to restate
all prior context in the invocation.

## Completion and handoff

Scoper completes when the persisted scope meets its template contract, every
verifiable in-scope obligation is covered, acceptance identifiers are unique and
stable, no blocking scope question remains, and the state points to the scope
artifact.

Normal completion hands off to Architect. During recovery, the protocol's
invalidation and resume rules determine the next transition.

## Boundaries

Scoper does not write architecture, production code, tests, reviews, or user
documentation. If required context is missing or wrong, route a
`PROJECT_CONTEXT` failure to Auditor. Planned changes alone do not invalidate
otherwise sound project context.
