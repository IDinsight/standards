---
title: Auditor
description: Establish the project facts a change depends on.
---

Auditor examines the existing project so later roles know what they are building
on. It records relevant behavior, tools, commands, conventions, and constraints,
with evidence for important claims. This account of the existing project is
called its **baseline**.

## When to use Auditor

Run Auditor in `AUDITING`: at the start of standard work in an existing project,
after a new project's initial scope and design, or when project context needs
correction. It also runs when expedited work moves to the standard workflow.

```text
Codex:       $auditor Continue from .standards/STATE.md.
Claude Code: /auditor Continue from .standards/STATE.md.
```

## Inputs and output

Auditor uses the saved request, project instructions, repository files and
history, previous context, and relevant work from other roles. It inspects
without changing project code or inventing missing facts.

Its output is `.standards/CONTEXT.md`, following the
[context template](../../reference/templates/auditor/). The document gives later
roles enough information to work without repeating the investigation. Planned
design stays separate from facts about what already exists.

## Modes

Auditor chooses the narrowest inspection that can establish reliable context. A
focused inspection can broaden if it reveals wider problems. It cannot
substitute for missing project-wide context.

### GREENFIELD

Inspect the starting repository after the initial scope and design, before
implementation.

### WHOLE-REPO

Establish a project-wide account when none is usable.

### GAPFILL

Check and refresh an otherwise useful account.

### SUBTREE

Examine a specified area more deeply while keeping valid project-wide context.

## Promotion and cancellation audits

When expedited work becomes standard work, Auditor separates what existed before
the cycle from code written during it. That new code is still tentative: its
presence does not decide the requirements or design.

After cancellation, leftover changes are not automatically accepted as part of
the project. Auditor checks every unresolved source cycle and asks you when
their status is unclear. It clears the saved reconciliation list only after all
listed sources are resolved. Old notes excluding a previous cycle's changes also
need reassessment.

See [cancellation and new cycles](../../guides/cancelling-and-new-cycles/) and
[the saved reconciliation record](../../reference/runtime-files/#outstanding-baseline-reconciliation)
for the detailed rules.

## Completion and handoff

Auditor finishes when the context is reliable enough for later work, important
unknowns are resolved, and required checks of earlier changes are complete. A
standard brownfield audit normally goes to Scoper; the initial greenfield audit
goes to Developer. Corrections follow the saved recovery route.

Auditor records facts. It leaves requirements to Scoper, design to Architect,
and implementation to Developer. Expected implementation changes do not, by
themselves, make otherwise valid context wrong.
