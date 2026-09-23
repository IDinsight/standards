---
title: Runtime Files
description:
  Find the files that save workflow rules, progress, and project context.
---

The files in `.standards/` save the workflow's rules and progress. Scope,
design, implementation, and test results stay in their own files.

## Protocol and installation

**`.standards/PROTOCOL.md`** defines the workflow rules. Installation or upgrade
updates it together with the skills. A workflow role cannot edit it to change
those rules.

**`.standards/INSTALLATION.json`** records client settings changed by the
installer. Upgrades and bootstrap resets use this record to preserve your
settings. A setting that already existed does not become framework-owned just
because it is compatible.

## Project mode

**`.standards/MODE.md`** contains one `ProjectMode`: `GREENFIELD` or
`BROWNFIELD`. See [project modes](../../concepts/project-modes/) for when it
changes.

## Workflow state

**`.standards/STATE.md`** is version-controlled. It contains one `WorkflowState`
and one `CycleMode` (`STANDARD` or `EXPEDITED`), plus:

- **Active Work:** the cycle's ID and request, scope and design paths, promotion
  reason, unresolved cancelled changes, current audit target, and any question
  preventing completion.
- **Handoff:** the latest transition's kind, starting state, failure type, and
  reason.
- **Recovery:** a stack of unfinished corrections, oldest first. Work on the
  last frame first. See [recovery](../../concepts/recovery/).

Installation uses `UNSET` for the first ID and request. Replace it before work
begins. Use `NONE` for fields that do not apply. Expedited scope and design
paths stay `NONE` unless the cycle is promoted and those roles create their
files.

`PromotionReason` keeps the reason for promotion until the cycle ends, even when
later handoffs replace `Handoff.Reason`. After sign-off or cancellation, the
saved cycle mode and active work still describe that finished cycle. The
[new-cycle procedure](../../guides/cancelling-and-new-cycles/#start-the-next-cycle)
explains what to reset for the next request.

The [saved-state rules](../protocol/#persisted-workflow-state) define every
field and when to update it.

### Cycle identity

Assign a new, stable `Active Work.Id` for each cycle. Do not reuse an ID still
referenced in workflow state or Auditor's cycle-specific context, including
`BaselineReconciliation` and **Active-Cycle Non-Baseline Work**. Use a short
name based on the request, with a suffix if needed to make it unique. Repeating
a request starts a new cycle with a new ID.

### Outstanding baseline reconciliation

`Active Work.BaselineReconciliation` lists cancelled cycles whose leftover
changes Auditor still needs to check. Each entry keeps the cycle's ID and a
brief request summary. Use `NONE` when there are no unresolved entries.

Keep this list through handoffs, failures, rework, recovery, and cancellation.
Only Auditor clears it after checking every listed source. `Handoff.Reason`
describes the latest transition; it cannot replace this list.

See
[new-cycle rules](../../guides/cancelling-and-new-cycles/#start-the-next-cycle)
for when to add a cancelled cycle and how this affects expedited entry.

## Project context

**`.standards/CONTEXT.md`** is Auditor's record of the existing project:
relevant behavior, commands, boundaries, constraints, and supporting evidence.
Auditor creates it. Installation preserves an existing file but does not invent
one.

An expedited cycle may read earlier context, but that context has not
necessarily been checked for the current change. After promotion, Auditor
separates the existing project from tentative changes made during the cycle. See
[promotion and cancellation audits](../../roles/auditor/#promotion-and-cancellation-audits)
for how those records are maintained.

## Agent integration

**`AGENTS.md`** contains a marked framework section alongside project
instructions. **`CLAUDE.md`** imports it for Claude Code. Installation preserves
text outside the marked sections and asks the user to resolve conflicting
instructions.

Scope and design live at the paths recorded in active work. Their default
locations, `docs/scope/` and `docs/specs/`, are in the project using STANDARDS;
they are separate from this documentation website's source files.
