---
title: Scoper
description: Decide what must be achieved and what counts as done.
---

Scoper turns your request into a clear, bounded scope: the outcome you want,
what is included, what is excluded, and how to tell when the work is done. It
asks about choices that would change the result.

## When to use Scoper

Run Scoper in `SCOPING`: first in a new project's standard cycle, after Auditor
in an existing project, or when requirements need correction. It does not run in
expedited cycles. In
[documentation cycles](../../guides/updating-documentation/), Scoper defines
audiences, targets, editing boundaries, and observable documentation outcomes
from Auditor's baseline. It preserves your Documenter choices without adding
implementation tasks or formal-testing dependencies.

```text
Codex:       $scoper Continue from .standards/STATE.md.
Claude Code: /scoper Continue from .standards/STATE.md.
```

## Inputs and output

Scoper uses your saved request, constraints, any existing scope, and relevant
project context from Auditor. An existing project needs context checked for the
current cycle. Before a new project's first audit, Scoper can proceed if the
facts it needs are already known; otherwise it returns the question to Auditor.

The [scope document](../../reference/templates/scoper/) describes goals,
boundaries, required outcomes, and dependencies. Each outcome that must be
checked gets an **acceptance condition**, with an ID such as `AC-001`. Later
roles use that same ID to connect design and results to the requirement.

Scoper can update an appropriate existing project scope document or create a new
one at `.standards/docs/scope/<cycle-id>.md`. Its location is saved in
`Active Work.Scope`. Documents belonging to earlier cycles are preserved. If
Scoper reuses a shared scope document that already lists another cycle's
conditions, it moves them under a "Previous Cycles" heading at the end of the
document and continues numbering from the highest ID, so an ID never changes
meaning.

You can select a [user style](../../reference/runtime-files/#user-styles) you
keep at `.standards/user-styles/scoper/<name>.md`. Scoper has no record for it,
so the selection lasts for the current chat; name it again when you resume. A
style never changes the scope's required shape or the form of acceptance
conditions.

## Modes

### PLAN

Create the first scope for this cycle, including a new change to an existing
project.

### REPLAN

Revise the current scope while preserving unaffected requirements.

When a requirement keeps its meaning, it keeps its ID. Removed or replaced
conditions are retired, and new conditions get unused IDs. See
[acceptance traceability](../../concepts/acceptance-traceability/) for details.

## Completion and handoff

Scoper finishes when the scope is saved, every required outcome can be checked,
and no unanswered question prevents the next step. It normally hands off to
Architect; corrections follow the saved recovery route.

A completed scope does not require a separate approval unless your project adds
one. Scoper defines the requirements; technical design and implementation belong
to Architect and Developer.
