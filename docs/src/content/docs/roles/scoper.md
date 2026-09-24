---
title: Scoper
description: Define what must be built and what counts as done.
---

Scoper turns a request into a clear description of what to build and how to
check that it is done. It decides what the requirements mean. Architect makes
the important technical choices unless existing constraints already settle them.

## When to use Scoper

Scoper acts in `SCOPING`: at the start of a greenfield cycle, after a brownfield
audit, or when recovery or user rework requires a scope correction.

## Inputs and output

Read the saved request, constraints, existing scope, and relevant project
context. In brownfield work, Auditor must have checked that context for the
current cycle. Greenfield scoping, including recovery reruns before the first
scheduled audit, can proceed without context if the needed facts are otherwise
established.

An appropriate unmarked project-owned scope document can remain the canonical
location. New scope files under `docs/scope/` must carry current-cycle `SCOPE`
provenance. Never overwrite or adopt another cycle's STANDARDS artifact. Inspect
ownership before editing and record the selected path in `Active Work.Scope`.
See [artifact provenance](../../concepts/ownership/#artifact-provenance).

The [scope template](../../reference/templates/scoper/) covers: goal,
constraints, non-goals, work with acceptance conditions and dependencies,
retired acceptance identifiers when applicable, and non-blocking assumptions.

## Modes

**PLAN** creates the active cycle's first scope. A brownfield feature can use
PLAN; this mode does not mean the whole project is greenfield.

**REPLAN** updates the cycle's existing scope after a correction or changed
request. Follow the
[acceptance-ID rules](../../concepts/acceptance-traceability/#replanning-preserves-history)
to keep valid requirements and their history.

## Example invocation

After the workflow enters `SCOPING`, use the line for your client:

```text
Codex:       $scoper Continue from `.standards/STATE.md`.
Claude Code: /scoper Continue from `.standards/STATE.md`.
```

The recorded scope and request determine the mode. You do not need to restate
all prior context in the invocation.

## Completion and handoff

Scoper finishes when the saved scope meets its template requirements, covers
every outcome that needs checking, and uses unique, stable acceptance IDs.
Resolve any question preventing completion and record the scope path in state.

Normal completion hands off to Architect. During recovery, the protocol's
recovery rules determine what must repeat before work returns to the interrupted
state.

## Boundaries

Scoper does not write architecture, production code, tests, reviews, or user
documentation. If required context is missing or wrong, route a
`PROJECT_CONTEXT` failure to Auditor. Planned changes alone do not invalidate
otherwise sound project context.
