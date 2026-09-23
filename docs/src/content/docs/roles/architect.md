---
title: Architect
description: Turn completed scope into a buildable technical design.
---

Architect makes the important technical decisions needed to build the completed
scope. The design should tell Developer what is decided and which local
implementation choices remain open.

## When to use Architect

Architect acts in `ARCHITECTING`, normally after Scoper or when recovery
requires an architecture correction. It does not reopen settled scope decisions.

## Inputs and output

Read the scope at `Active Work.Scope`, established constraints, current design
when present, and relevant project context. In brownfield work, Auditor must
have checked the context for the current cycle. Initial greenfield design can
happen before the first scheduled audit.

Save the technical design in the project's established location, or a
change-specific file under `docs/specs/`. Record its path in
`Active Work.Architecture`.

The [architecture template](../../reference/templates/architect/) covers
decisions, acceptance coverage, components, contracts, data and control flow,
technical acceptance criteria, build order, and important risks or alternatives.

## Modes

- **Foundation:** make or substantially change the system's basic design choices
  and boundaries.
- **Feature:** design a specific new feature whose own behavior is the main
  risk.
- **Evolution:** change an existing design where migration or compatibility is
  the main concern.
- **Cross-cutting:** define shared behavior or rules across multiple components.

Choose one mode by the primary design risk. If evidence changes that assessment,
replace the mode rather than combining procedures. Modes do not alter ownership
or completion requirements.

## Example invocation

After the workflow enters `ARCHITECTING`:

```text
Codex:       $architect Continue from `.standards/STATE.md`.
Claude Code: /architect Continue from `.standards/STATE.md`.
```

## Completion and handoff

Every current scope acceptance identifier must have design coverage or an
explicit **No architectural impact** entry with a reason. Technical acceptance
criteria reference those same identifiers without changing their meaning.

Meet the design template's requirements, resolve questions preventing
completion, and save the design path in state. Normal initial greenfield
completion hands off to Auditor; brownfield completion with valid context hands
off to Developer. During recovery, follow the saved recovery frame.

## Boundaries

Do not write implementation, tests, audit findings, or reviews. Route changes to
scope intent or defective acceptance identifiers to Scoper. Send missing or
incorrect project facts that affect the design to Auditor. For important values
passed between systems, specify their source or the rules that define them so
Developer can implement the agreed design.
