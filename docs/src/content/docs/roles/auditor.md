---
title: Auditor
description: Record the existing project facts needed for the current change.
---

Auditor records what already exists in the project and the constraints other
roles must respect. It owns `.standards/CONTEXT.md`. Important claims need
support from repository evidence or other established constraints.

## When to use Auditor

Auditor acts in `AUDITING`: at the start of standard brownfield work, after
expedited promotion, after initial greenfield Scope and Architecture, or during
corrections to project context and any required repeat audits. Expedited cycles
skip Auditor until promotion; their existing context may be out of date.

## Inputs and output

Read the installed protocol, mode, state, and existing context first. Inspect
the request, relevant outputs from earlier roles, project instructions, and
repository areas needed for this cycle.

The [context template](../../reference/templates/auditor/) records the baseline,
stack, boundaries, commands, conventions, external systems, verification setup,
relevant behavior, unknowns, and supporting evidence. Omit empty sections and
avoid exhaustive inventories or an audit diary.

## Promotion and cancellation audits

After expedited promotion, read `Active Work.PromotionReason` even if the latest
handoff has changed. Establish the pre-cycle baseline using context,
version-control evidence, the active request, and other reliable evidence. Do
not treat tentative implementation as an established constraint simply because
it is already present. If uncertainty about that distinction would affect later
work, record a blocking question and ask the user.

Record significant tentative changes under **Active-Cycle Non-Baseline Work**,
with each entry identifying the current `Active Work.Id`. Treat an entry as
tentative only while its ID matches the active cycle. After `SIGNED_OFF` or
`CANCELLED`, that label no longer applies, even if the ID has not changed. On
later audits, use current evidence to decide whether to remove the entry, treat
it as baseline, or keep it separate. Ask the user if its status is unclear; do
not carry the old label into a new cycle unchecked.

Whenever `Active Work.BaselineReconciliation` is not `NONE`, read every source
cycle's identifier and request summary from that field, even after intervening
handoffs or recovery. Use version-control evidence and explicit user input to
determine whether each source's leftover changes are accepted baseline,
reverted, or unresolved. Record accepted facts as baseline, omit reverted
material, and block for unresolved status. Do not avoid this check by
relabelling cancelled changes as tentative work from the new cycle.

Keep every source cycle's ID and request until all listed changes have been
checked and later roles can rely on the resulting baseline. Then set
`BaselineReconciliation` to `NONE`. The latest `Handoff.Reason` cannot replace
that list.

## Modes

- **Greenfield:** the scheduled first audit after greenfield scope and design.
- **Whole-repo:** no usable project-level baseline exists, or the baseline is
  too unreliable to repair safely.
- **Gapfill:** verify or refresh a usable baseline without a narrower target.
- **Subtree:** inspect an explicit area more deeply while a usable project-level
  baseline already exists.

Choose the smallest audit that can answer the question. A subtree audit cannot
substitute for a missing baseline. Escalate from subtree to gapfill when focus
broadens, or to whole-repo when the baseline proves unusable. Gapfill can
likewise escalate to whole-repo.

When a subtree target exists only in direct user instruction, record it in
`Active Work.AuditTarget` before relying on it. Clear it when completed,
abandoned, or no longer describes the work being done.

## Example invocation

After the workflow enters `AUDITING`:

```text
Codex:       $auditor Continue from `.standards/STATE.md`.
Claude Code: /auditor Continue from `.standards/STATE.md`.
```

## Completion and handoff

Context must describe the relevant existing project, support important claims,
and state what is unknown. Resolve questions that prevent later work and
complete any promotion or cancellation checks described above. Later roles
should be able to find the important boundaries and commands without repeating
the audit.

Without active recovery, a standard brownfield audit hands off to Scoper; the
initial greenfield audit hands off to Developer. If corrected context reveals a
problem in earlier work, follow the [recovery rules](../../concepts/recovery/).

## Boundaries

Auditor does not make scope, architecture, or implementation decisions. Planned
design stays in the design document. Planned implementation changes do not
automatically make the baseline stale.

Inspect the project without changing it. Record configuration names when useful,
but never secret values, credentials, or sensitive local-machine data.
