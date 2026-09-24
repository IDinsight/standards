---
title: Documenter
description:
  Maintain accurate documentation and project guidance with resumable evidence.
---

Documenter makes the current change understandable and usable. It owns user- and
project-facing documentation, documentation-only comments and docstrings, and
project agent guidance outside managed framework blocks.

## When to use it

Invoke Documenter in `DOCUMENTING` during a `STANDARD` cycle, normally after
implementation review or when recovery returns for documentation corrections.
`EXPEDITED` omits it; a required documentation guarantee uses
[promotion](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).
Invoking the skill with a file does not bypass workflow ownership.

## Inputs and output

Documenter reads persisted state, scope, design, relevant project context,
development, verification and review evidence, existing documentation, and
actual behavior. It reconstructs committed and uncommitted work, including
moved/deleted files and affected unchanged content. A clean diff does not mean
there is no documentation assignment.

Its evidence and progress live at `docs/documentation/<Active Work.Id>.md`, with
matching `DOCUMENTATION` provenance and visible cycle ID. The path is derived
from the ID, without a new state field. Unrelated, incorrectly marked, or unsafe
content at that location blocks dependent work and is preserved. Ordinary guides
and docstrings remain reusable project files.

The [record template](../../reference/templates/documenter/) saves assessed
content identities, audience and purpose, current acceptance references, actual
checks and limits, remaining work, discrepancies and owners, and resume context.
Reviewer and Synchronizer use this evidence independently. It does not replace
Tester evidence or become another authority for acceptance requirements.

## Collaboration and target

Collaboration selects who applies documentation edits:

- **AUTONOMOUS** is the default. Documenter applies changes and runs appropriate
  checks without a routine plan-approval gate.
- **GUIDED** provides one copy/paste step at a time. You apply it, then
  Documenter inspects the actual saved file before continuing. A snippet or a
  report that you applied it is not evidence of a saved update. Documenter still
  saves its own progress record and required workflow state normally.

The target is selected separately:

| Target           | Documentation selected                                |
| ---------------- | ----------------------------------------------------- |
| `FILE`           | A specified file.                                     |
| `FOLDER`         | Relevant documentation in a specified directory.      |
| `VERTICAL_SLICE` | One capability across related documentation surfaces. |
| `ACTIVE_CHANGE`  | Documentation affected by the current cycle.          |

A supplied file defaults new work to FILE/AUTONOMOUS. Without an explicit
target, Documenter derives required documentation from the active cycle.
Continuing interrupted work preserves the saved choices unless you change them.

A target limits editing, not the cycle's completion requirements. If other
required documentation remains, Documenter saves that work and asks for the
specific direction needed to proceed. It does not silently edit outside your
boundary or claim the whole role complete after finishing one file.

## Styles

Universal guidance always applies: plain, natural language, necessary technical
terms explained for the audience, accurate instructions, useful examples,
consistent terminology, valid references, minimal duplication, and established
conventions. Only relevant Python, TypeScript, HTML, and CSS documentation
styles are loaded.

User style defaults to `NONE`. Explicitly select `tony` or `tony.md` to load the
Tony profile; Documenter never infers it from your identity, the file's
existence, or Developer's profile. The persisted value is `tony`. Identifiers
must name one direct child of the package's `user-styles/` directory; paths and
traversal are rejected.

Tony's profile uses NumPy-style Python docstrings. Function and method
docstrings created or materially updated include an `Examples` section with one
simple happy-path usage example grounded in actual behavior. Examples do not
invent outputs or claim unperformed execution.

For discretionary guidance, universal style takes precedence over the selected
user style, then applicable technology styles. Correctness, ownership,
authoritative project constraints, and protocol conflict handling still apply.
You can change or clear your selection during the cycle; there is no cycle-long
style lock or Developer plan-approval mechanism here.

## Invoke it

After the workflow has entered `DOCUMENTING`, use the command for your client:

```text
Codex: $documenter Continue the active workflow from .standards/STATE.md.
Claude Code: /documenter Continue the active workflow from .standards/STATE.md.
```

Examples for Codex in that same state:

```text
$documenter Update docs/usage.md.
$documenter Use GUIDED mode for docs/usage.md.
$documenter Document the export capability as a VERTICAL_SLICE.
$documenter Use user style tony for the active change's Python docstrings.
```

Use `/documenter` for Claude Code. Mode and target changes do not themselves
change the workflow contract or authorize another role's work.

## Completion and recovery

Both collaboration modes and all targets share one completion gate. Required
documentation across the active cycle must be assessed, saved, and supported by
appropriate actual checks or justified current evidence. A sufficiently assessed
no-change outcome is valid. Missing material evidence, required work beyond the
target, pending guided edits, or Documenter-owned obligations prevent
completion.

On resume, Documenter compares current inputs with recorded identities,
invalidates unsupported conclusions, and explains why retained evidence still
applies. It preserves all unresolved discrepancies before routing one to its
owner. Correcting one obligation is progress; it does not by itself pass the
full gate or finish the cycle.

An earlier role can need a small documentation correction before the feature is
ready to document fully. The protocol's
[Documenter Corrective Return](../../reference/protocol/#documenter-corrective-return)
allows a verified correction to return to that role while the documentation
record remains incomplete. Remaining work must genuinely depend on unfinished
work in the saved recovery route; missing proof of the fix, unrelated defects,
and actionable work outside the selected target cannot use this exception.
GUIDED edits still require inspection of the saved result. The record preserves
what remains, who must supply its prerequisites, and when to revisit it. Full
documentation completion is still required before normal forward handoff.

[Recovery](../../concepts/recovery/) takes priority over the normal next phase.
Otherwise, full completion proceeds to `REVIEWING_FINAL`, Reviewer kind
`FINAL_DELIVERABLE`. The handoff requests a fresh chat separate from authoring
conversations, with the protocol's advisory model recommendation. Documenter
persists enough evidence for that independent assessment and does not review its
own authored documentation in the same conversation.

## Boundaries and validation limits

Documenter verifies the behavior it describes and routes defects rather than
presenting defective behavior as fulfilling the contract. Code, tests, scope,
design, context, review findings, and synchronization records keep their owners.
Managed framework blocks, installed protocol, and installation metadata retain
installer/protocol ownership. User-authored instructions are preserved, and
material conflicts follow the protocol.

Generated documentation follows the project's existing source and build
workflow. Documentation checks establish only what they actually inspect or
execute; they do not manufacture Tester-owned formal evidence.

The package includes authored evaluation scenarios. Parsing them, checking
structure, and building this site do not execute model evaluations or establish
model behavior. Navigator and the installer remain unfinished.
