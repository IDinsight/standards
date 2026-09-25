---
title: Glossary
description: An alphabetical guide to the framework's terms.
---

These definitions explain the terms used throughout the documentation. The
[protocol](../protocol/) and role instructions provide the full rules.

## Acceptance identifier

Scoper's stable `AC-NNN` label for a checkable outcome, reused in the design,
implementation plan, and evidence. It identifies the condition, not its priority
or execution order. See
[acceptance traceability](../../concepts/acceptance-traceability/).

## Active work

The `Active Work` section in `STATE.md`: the cycle's ID, request, document
paths, promotion reason, audit target, unresolved cancelled changes, and
blocking question. After retained cancellation or sign-off, it describes the
last cycle until a new one replaces it.

## Artifact provenance

A marker in a workflow document that identifies its type and owning cycle.
Review reports also name the review kind. Moving or renaming the file does not
change its ownership. See
[file ownership](../../concepts/ownership/#artifact-provenance).

## Baseline

Established facts about the existing project that later work must understand and
respect. Auditor records them in project context. A planned design or tentative
implementation does not become established merely because it is mentioned there.

## Baseline reconciliation

Auditor's check of changes left by cancelled cycles: which are accepted parts of
the project, which were reverted, and which still need a decision.
`Active Work.BaselineReconciliation` keeps each source cycle's ID and request
until all sources are resolved.

## Completed scope

A saved scope that has passed Scoper's completion checks. Separate user approval
is needed only if the project requires it.

## Completion gate

The checks a role must pass before a normal forward handoff. A verified
correction can sometimes return to interrupted work before full completion,
under the
[Documenter and Synchronizer exceptions](../../concepts/recovery/#when-a-correction-must-return-before-full-completion).

## Cycle

One piece of work, from its saved request to sign-off or cancellation. Rework,
recovery, and promotion stay within that cycle. Work after a cycle ends needs a
new ID and cycle.

## Cycle ID registry

The append-only `.standards/CYCLE_IDS.md` list of reserved IDs. An ID cannot be
reused while that runtime remains installed, even if initialization failed after
it was reserved. See [cycle identity](../runtime-files/#cycle-identity).

## Cycle mode

The workflow chosen for one cycle: `STANDARD` or `EXPEDITED`. `UNSET` means no
cycle is active, so workflow work cannot begin. Navigator can still explain
available project evidence.

## Development plan

Developer's saved implementation steps, approval status, collaboration choices,
and progress. The initial plan and material revisions need approval before
implementation. See [Developer](../../roles/developer/).

## Development step

One implementation outcome in the plan, identified by `DEV-NNN`, with
dependencies, progress, and a way to check the result. Step IDs are distinct
from Scoper's `AC-NNN` requirement IDs.

## Documentation record

Documenter's account of documentation inspected or changed, checks performed,
limitations, remaining work, and collaboration choices. The record belongs to
one cycle; the guides and docstrings it describes remain reusable project files.
See the [template](../templates/documenter/).

## Expedited cycle

A bounded brownfield change handled by Developer and implementation Reviewer
before user sign-off. It provides fewer checks than standard work and must be
promoted if a skipped role becomes necessary.

## Failure handoff

Sending a defect to the role responsible for the affected decision or file.
Discovering the problem does not give a role ownership of the fix.

## Forward handoff

Moving to the next normal workflow step after the current role passes its
completion checks.

## Outstanding obligation

An unfinished correction saved separately when promotion replaces its recovery
route. The responsible role removes it after verifying the fix; its other
completion checks still apply. See
[recovery obligations](../../concepts/recovery/#outstanding-obligations).

## Pending cycle fields

A saved preference or blocked request for the next cycle, kept separately from
active work. The agent reuses the saved request when its blocking decision is
resolved. See [Starting a Cycle](../../guides/starting-a-cycle/).

## Project context

Auditor's record of relevant existing behavior, tools, commands, constraints,
and evidence in `.standards/CONTEXT.md`. Earlier context must be checked before
it is relied on as current. See [Auditor](../../roles/auditor/).

## Project mode

Whether the project starts without meaningful implementation to preserve
(`GREENFIELD`) or already has it (`BROWNFIELD`). Developer permanently changes
greenfield to brownfield when it verifies implementation has been created or
materially changed. See [project modes](../../concepts/project-modes/).

## Promotion

The one-way change from expedited to standard work. It keeps the cycle and
starts the standard brownfield sequence with Auditor. Also called a promotion
handoff. See
[promotion](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Recovery frame

A saved correction and its return instructions: who fixes it, why, where
interrupted work resumes, and which completed steps need repeating. Nested
corrections are handled newest first. See [Recovery](../../concepts/recovery/).

## Resume handoff

Returning to `ResumeAt` after a recovery frame is complete, or taking another
recovery-directed transition outside the normal forward sequence.

## Retired acceptance identifier

An ID for a removed or replaced acceptance condition. It stays in the history
but cannot be reused within that cycle or counted as a current requirement.

## Review report

Reviewer's independent assessment for one cycle and review kind, including the
evidence checked, findings, limitations, and conclusion. Passing review does not
complete the cycle or provide user sign-off. See the
[template](../templates/reviewer/).

## Role mode

A choice of how one role works, such as Developer's `STEPWISE` or Navigator's
`EXPLAIN`. It does not change project mode, cycle mode, or workflow state.

## Scope-level acceptance condition

An observable outcome used to decide whether a requirement is met. Scoper
defines it and gives it an `AC-NNN` ID. Separate outcomes checked by different
roles need separate conditions.

## Sign-off

Your acceptance of the finished work from `AWAITING_USER_SIGNOFF`, after the
applicable completion requirements have been checked against current files. It
ends the cycle in `SIGNED_OFF`. Readiness for sign-off is not acceptance.

## Standard cycle

The full workflow for a change, including separate verification, documentation,
final review, and synchronization before your sign-off decision. The starting
role depends on project mode. See
[workflow paths](../../concepts/states-and-handoffs/#standard-forward-paths).

## Synchronization record

Synchronizer's record of whether completed assessments and their evidence still
apply to the current files. It records disagreements, limitations, and what must
happen next. It does not replace another role's evidence or your sign-off. See
the [template](../templates/synchronizer/).

## Technical acceptance criterion

A technical condition Architect derives from a scope acceptance condition. It
references the existing acceptance ID rather than creating a new requirement
identity.

## Verification report

Tester's record of acceptance coverage, test-scenario allocations, actual
results, gaps, and permitted later-role dependencies. It belongs to a cycle and
is separate from reusable test files. See the [template](../templates/tester/).

## Workflow state

The current step or ended cycle's state, saved as `WorkflowState` in `STATE.md`.
It determines which workflow role may act; it does not invoke that role.
Navigator operates outside the workflow state machine.
