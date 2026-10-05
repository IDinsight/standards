---
title: Updating Documentation on Its Own
description:
  Document existing behavior through the Brownfield documentation workflow.
---

You can ask Documenter to update documentation without an implementation change.
When no cycle is active, an explicit standalone assignment starts a
`DOCUMENTATION` cycle for an existing, brownfield project. It can update a guide
or create missing documentation; no earlier cycle or guide is required.

## Start with Documenter

For example:

```text
Codex:       $documenter Update docs/usage.md to explain the existing export CLI.
Claude Code: /documenter Update docs/usage.md to explain the existing export CLI.
```

You can include an audience, editing boundary, collaboration mode, or user
style:

```text
$documenter Create docs/usage.md for analysts. Use GUIDED mode and user style
concise. Edit only that guide and describe the current CLI behavior.
```

The agent saves those choices and initializes the cycle in `AUDITING`. It gives
you the Auditor invocation before any documentation edits. Follow each handoff;
starting a cycle does not automatically run the roles. A bare invocation without
an assignment does not invent work.

## Follow the documentation route

| Step           | What the role establishes                                                             |
| -------------- | ------------------------------------------------------------------------------------- |
| Auditor        | Relevant existing behavior, project constraints, and documentation/check conventions. |
| Scoper         | Audiences, documentation targets, editing boundaries, and checkable outcomes.         |
| Architect      | Existing technical contracts and constraints for each acceptance condition.           |
| Documenter     | Saved documentation, actual checks, and evidence under the same acceptance IDs.       |
| Final Reviewer | Independent assessment of accuracy, coverage, and the permitted editing boundary.     |
| Synchronizer   | Whether the assessments and evidence still apply to the current documents.            |
| You            | Accept the work, request rework, or cancel.                                           |

Final Reviewer needs a
[fresh independent chat](../../roles/reviewer/#start-in-an-independent-session)
separate from the authoring conversations. Synchronizer must finish after review
before the cycle is ready for your decision. Even an assessed no-change result
goes through all six roles.

Development, Testing, and implementation review are omitted. Existing source,
tests, and prior assessments can support documentation accuracy; this route does
not certify formal implementation verification. Documenter records checks such
as relevant examples, links, rendering, or content inspection. Standard
completion-policy choices do not shorten this route.

## Keep the request within existing behavior

Documenter may edit prose, guides, project agent guidance outside managed
framework blocks, and ordinary comments/docstrings. Examples must describe
evidenced existing behavior. Use established documentation generation commands
and edit their owned source. Changing executable logic, tests, fixtures,
configuration, tooling, or comments that act as directives is outside the
documentation boundary.

If a required outcome needs one of those changes, the agent saves the evidence
and asks you to choose an achievable documentation-only scope or explicitly
cancel this cycle and start a separate implementation cycle. It preserves your
request and recovery until you decide. It cannot convert the active cycle in
place or invent a Developer/Tester report. Unrelated observations alone do not
block documentation completion.

## Handle conflicts and resume

This route is Brownfield only. A greenfield project cannot use it merely because
a README exists. A conflicting saved cycle preference or standard completion
policy blocks creation until you resolve it; the agent does not silently start
standard work. The saved standalone intent and choices survive resumption,
including when you invoke a different role. Explicitly revise or withdraw that
intent if you choose another workflow.

If a cycle is already active, follow its current owner. A separate documentation
assignment waits until that cycle finishes or you explicitly cancel it; invoking
Documenter does not replace active work.

[Recovery](../../concepts/recovery/) stays among the six included roles. A
qualified Documenter or Synchronizer correction can return to an interrupted
role with its record incomplete only when the remaining work depends on that
role or the preserved route. Every full gate and current evidence must still be
re-established before sign-off readiness. A local correction cannot return
directly to sign-off on an incomplete gate.

Sign-off checks evidence freshness before recording your acceptance.
Cancellation retains documentation edits; a later Auditor reconciles their
status as [baseline work](../cancelling-and-new-cycles/#start-the-next-cycle).
See the
[documentation contract](../../reference/protocol/#documentation-cycle-contract)
for the exact rules.
