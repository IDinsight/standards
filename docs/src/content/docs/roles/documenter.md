---
title: Documenter
description: Keep documentation accurate, useful, and easy to follow.
---

Documenter helps people understand and use the change. It updates user guides,
project documentation, comments, docstrings, and project-specific agent
instructions outside the framework's managed sections.

## When to use it

Run Documenter in `DOCUMENTING` during a standard cycle, normally after
implementation review or when documentation needs correction. Expedited cycles
skip this role; requiring its work means moving to the standard workflow.

```text
Codex:       $documenter Continue from .standards/STATE.md.
Claude Code: /documenter Continue from .standards/STATE.md.
```

## Inputs and output

Documenter reads the requirements, design, relevant project context, code,
verification and review results, and existing documentation. It checks what the
project actually does before describing it.

Alongside the updated documentation, it saves a
[documentation record](../../reference/templates/documenter/) at
`.standards/docs/documentation/<Active Work.Id>.md`. This records what was
inspected and changed, checks performed, limitations, remaining work, and your
collaboration choices. Reviewer and Synchronizer use it to assess the
documentation later.

## Modes

You can switch modes or resume later without losing those choices.

### AUTONOMOUS

The default. Documenter edits and checks the documentation without a separate
plan-approval step.

### GUIDED

Documenter gives you one edit to copy and paste at a time. After you apply it,
Documenter inspects the saved result before continuing. It still saves its own
progress and workflow records.

## Choose what to document

You can select a file, a folder, one feature across its related documents, or
all documentation affected by the current change. These are called `FILE`,
`FOLDER`, `VERTICAL_SLICE`, and `ACTIVE_CHANGE`; the last is the default.

For example, while the workflow is in `DOCUMENTING`:

```text
$documenter Update docs/usage.md.
$documenter Use GUIDED mode for docs/usage.md.
$documenter Document the export feature as a VERTICAL_SLICE.
```

Use `/documenter` in Claude Code. A file request defaults to autonomous editing
unless you choose guided work.

Documenter respects your editing boundary. If other required documentation
remains outside it, it records that work and asks how to proceed. Finishing one
selected file does not automatically complete the cycle's documentation.

## Writing styles

Documenter follows shared guidance for plain language, accurate examples, and
consistent terms, plus relevant language-specific documentation conventions. You
can explicitly select a [user style](../../reference/runtime-files/#user-styles)
you keep at `.standards/user-styles/documenter/<name>.md`; none is selected by
default.

For example, `Use user style tony` selects
`.standards/user-styles/documenter/tony.md`. If that file asks for NumPy-style
Python docstrings, Documenter applies it to the docstrings it writes or
substantially updates, not to unrelated guides. The record saves the selection,
and Documenter reloads it when it resumes.

You may change or clear Documenter's user style during the cycle. The choice is
separate from Developer's locked coding style and cannot override correctness or
project requirements.

## Completion and recovery

Documenter finishes when all required documentation for the change has been
assessed, saved where changes are needed, and checked with sufficient evidence.
It can also conclude that no changes are needed after checking the existing
documentation. Pending guided edits or missing important evidence prevent
completion.

Sometimes an earlier role needs a documentation fix before it can continue. The
protocol allows a
[limited corrective return](../../reference/protocol/#corrective-returns):
Documenter verifies that fix and returns while recording documentation that must
wait for the unfinished work. Its record stays incomplete. This cannot excuse
unrelated defects or work that is already possible.

Normal completion goes to final Reviewer in a fresh chat separate from the
authoring conversations. Corrections follow the saved recovery route.

Documenter sends code, test, design, and other problems to their owners. It
updates the source of generated documentation rather than patching generated
copies, and leaves managed framework instructions and installation files to
their owners.
