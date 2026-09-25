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
decision is a reason to move to the standard workflow.

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
one under `docs/specs/`. The path is saved in `Active Work.Architecture`.
Developer later writes the detailed implementation plan.

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

## Completion and handoff

Architect finishes when the saved design covers the current requirements and
resolves the important technical decisions. Initial greenfield design normally
goes to Auditor; brownfield design with valid context goes to Developer.
Corrections follow the saved recovery route.

Architect does not change what you asked for or write the implementation. If
requirements are unclear, it returns them to Scoper. If required project facts
are missing or wrong, it returns them to Auditor.
