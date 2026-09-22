---
title: Auditor
description: Establish an evidence-based baseline for the active workflow cycle.
---

Auditor records what is already true about the project and what downstream roles
must respect. It owns `.standards/CONTEXT.md` and grounds material statements in
repository evidence or independently established constraints.

## When to use Auditor

Auditor acts in `AUDITING`: at the start of standard brownfield work, after
expedited promotion, after initial greenfield Scope and Architecture, or during
project-context recovery and required downstream reruns. Expedited cycles omit
Auditor until promotion; existing context is not presumed refreshed for them.

## Inputs and output

Read the installed protocol, mode, state, and existing context first. Inspect
the request, relevant upstream artifacts, project instructions, and repository
areas needed for this cycle.

The [context template](../../reference/templates/auditor/) records the baseline,
stack, boundaries, commands, conventions, external systems, verification setup,
relevant behavior, unknowns, and supporting evidence. Omit empty sections and
avoid exhaustive inventories or an audit diary.

## Promotion and cancellation audits

After expedited promotion, read `Active Work.PromotionReason` even if the latest
handoff has changed. Establish the pre-cycle baseline using context,
version-control evidence, the active request, and other authoritative evidence.
Do not treat tentative implementation as an established constraint simply
because it is already present. If that distinction is materially ambiguous,
record a blocking question and ask the user.

Record material tentative implementation under **Active-Cycle Non-Baseline
Work**, with each entry identifying the current `Active Work.Id`. An exclusion
applies only while that cycle is nonterminal and its identifier matches.
`SIGNED_OFF` and `CANCELLED` make those exclusions stale, even before the
identifier changes. On later audits, reconcile old exclusions against current
evidence: remove or reclassify them, and block if baseline status is uncertain.
Do not copy them forward as exclusions for a new cycle without current evidence.

When a new cycle follows cancellation and requires reconciliation, read the
cancelled cycle's identifier and request summary from `Handoff.Reason` before
replacing that handoff. Determine whether leftover changes are accepted
baseline, reverted, or unresolved. Record accepted facts as baseline, omit
reverted material, and block for unresolved status. Do not relabel cancelled
residue as the new cycle's tentative work to avoid reconciliation.

## Modes

- **Greenfield:** the scheduled first audit after greenfield scope and design.
- **Whole-repo:** no usable project-level baseline exists, or the baseline is
  too unreliable to repair safely.
- **Gapfill:** verify or refresh a usable baseline without a narrower target.
- **Subtree:** inspect an explicit area more deeply while a usable project-level
  baseline already exists.

Prefer the narrowest valid mode. A subtree audit cannot substitute for a missing
baseline. Escalate from subtree to gapfill when focus broadens, or to whole-repo
when the baseline proves unusable. Gapfill can likewise escalate to whole-repo.

When a subtree target exists only in direct user instruction, record it in
`Active Work.AuditTarget` before relying on it. Clear it when completed,
abandoned, or no longer representative of the active focus.

## Example invocation

After the workflow enters `AUDITING`:

```text
Codex:       $auditor Continue from `.standards/STATE.md`.
Claude Code: /auditor Continue from `.standards/STATE.md`.
```

## Completion and handoff

The context must reflect the relevant baseline, ground its material claims,
identify unknowns honestly, and leave no blocking context question unresolved.
Promotion audits must distinguish tentative implementation from baseline;
cancellation audits must resolve the status of material leftover changes.
Downstream roles should be able to locate the important boundaries and commands
without rediscovering the repository.

Without active recovery, a standard brownfield audit hands off to Scoper; the
initial greenfield audit hands off to Developer. Corrected context that exposes
an upstream defect must be routed according to the protocol's recovery rules.

## Boundaries

Auditor does not make scope, architecture, or implementation decisions. Planned
design stays in the architecture artifact. Planned implementation changes do not
automatically make the baseline stale.

Use non-mutating inspection to establish facts. Record configuration names when
useful, but never secret values, credentials, or sensitive local-machine data.
