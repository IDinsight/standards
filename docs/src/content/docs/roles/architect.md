---
title: Architect
description: Turn completed scope into a buildable technical design.
---

Architect fixes the consequential technical decisions needed to satisfy the
completed scope. The design should tell Developer what is decided and which
local implementation choices remain open.

## When to use Architect

Architect acts in `ARCHITECTING`, normally after Scoper or when recovery
requires an architecture correction. It does not reopen settled scope decisions.

## Inputs and output

Read the scope at `Active Work.Scope`, established constraints, current design
when present, and relevant project context. Brownfield Architecture requires a
valid active-cycle context baseline. Initial greenfield Architecture may precede
the first scheduled audit.

Persist the technical design in the project's established location, or a
change-specific file under `docs/specs/`. Record its path in
`Active Work.Architecture`.

The [architecture template](../../reference/templates/architect/) covers
decisions, acceptance coverage, components, contracts, data and control flow,
technical acceptance criteria, build order, and material risks or alternatives.

## Modes

- **Foundation:** establish or materially redefine major system boundaries or
  foundational technical choices.
- **Feature:** design a bounded capability whose main risk is the capability
  itself.
- **Evolution:** change existing design where migration or compatibility is the
  main concern.
- **Cross-cutting:** define one mechanism or contract across multiple
  boundaries.

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
explicit no-architectural-impact disposition. Technical acceptance criteria
reference those same identifiers without changing their meaning.

Complete the design contract, resolve blocking architecture questions, and
record the persisted artifact path. Normal initial greenfield completion hands
off to Auditor; brownfield completion with valid context hands off to Developer.
Recovery may require a different legal resume path.

## Boundaries

Do not write implementation, tests, audit findings, or reviews. Route changes to
scope intent or defective acceptance identifiers to Scoper. Route materially
missing or incorrect project context to Auditor. Define a source or governing
contract for consequential values crossing system boundaries rather than leaving
Developer to invent architecture while coding.
