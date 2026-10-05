---
title: Architect
description: Resolve the technical design before implementation.
---

Architect turns the completed scope into a design Developer can build. It
decides important questions such as how components communicate, where data
lives, and how failures are handled. Local, easily reversible coding choices
remain with Developer.

## When to use Architect

Run Architect in `ARCHITECTING`, usually after Scoper or when the design needs
correction. Expedited cycles skip this role; needing a consequential design
decision is a reason to move to the standard workflow. In `DOCUMENTATION`,
Architect runs after Scoper to establish existing technical facts and
constraints for the documentation; it hands off to Documenter.

```text
Codex:       $architect Continue from .standards/STATE.md.
Claude Code: /architect Continue from .standards/STATE.md.
```

## Inputs and output

Architect reads the scope, established project constraints, existing design, and
relevant Auditor context. Existing projects need valid context for this cycle. A
new project's initial design can proceed before the first audit when the
necessary facts are known.

The [design document](../../reference/templates/architect/) explains the
decisions, interfaces, data flow, technical checks needed to satisfy the
requirements, and a rough build order. It covers every current acceptance ID
from the scope. Where a condition needs no technical design, such as completing
a user guide, the design explains which other work it depends on.

Architect may update an appropriate existing project design document or create
one at `.standards/docs/specs/<cycle-id>.md`. The path is saved in
`Active Work.Architecture`. If a reused design document still covers another
cycle's acceptance conditions, Architect moves that coverage under a "Previous
Cycles" heading at the end of the document, so an old ID is never read as
current. Developer later writes the detailed implementation plan.

You can select a [user style](../../reference/runtime-files/#user-styles) you
keep at `.standards/user-styles/architect/<name>.md`. Architect has no record
for it, so the selection lasts for the current chat; name it again when you
resume. A style never changes the design's required shape or a technical
decision.

## Modes

Architect chooses one mode based on the main design problem.

### FOUNDATION

Establish or substantially change the system's structure.

### FEATURE

Design a bounded capability within the existing structure.

### EVOLUTION

Change an existing design, with attention to migration and compatibility. For
example, moving from one authentication system to another is an evolution
problem when existing clients must keep working during the transition.

### CROSS-CUTTING

Define a shared technical rule across several components.

### DOCUMENTATION

Establish evidenced existing interfaces, commands, outputs, errors, and other
contracts needed for the scoped documentation. Account for every current
acceptance condition with technical facts or an explicit no-architectural-impact
disposition. Do not invent a build plan or new behavior. See the
[documentation workflow](../../guides/updating-documentation/).

## Completion and handoff

Architect finishes when the saved design covers the current requirements and
resolves the important technical decisions. Initial greenfield design normally
goes to Auditor; brownfield design with valid context goes to Developer.
Corrections follow the saved recovery route. Documentation architecture goes to
Documenter instead of Developer. If the documentation outcome requires
implementation, it blocks for a user decision rather than designing changes
inside this cycle.

Architect does not change what you asked for or write the implementation. If
requirements are unclear, it returns them to Scoper. If required project facts
are missing or wrong, it returns them to Auditor.
