---
title: Glossary
description: Look up the shared language used throughout the framework.
---

These are the main terms used in the docs. The
[protocol](../protocol/#canonical-terms) defines their exact meaning.

## Active work

The `Active Work` record in `STATE.md`: the cycle's ID, request, file paths,
promotion reason, unresolved cancelled changes, audit target, and open question.
[Runtime Files](../runtime-files/) explains how each field is used.

## Baseline reconciliation

Auditor's check of changes left by cancelled cycles: which are accepted parts of
the project, which were reverted, and which still need a decision.
`Active Work.BaselineReconciliation` keeps the IDs and request summaries until
that check is complete.

## Completed scope

A saved scope that has passed Scoper's checks. A separate user approval is
needed only if the project requires it.

## Scope-level acceptance condition

An outcome that can be checked to decide whether a requirement is met. Scoper
writes it and gives it an `AC-NNN` ID.

## Acceptance identifier

The ID used for the same acceptance condition in scope, design, and evidence. It
identifies the condition, not its priority or execution order.

## Retired acceptance identifier

An ID for a removed or replaced condition. Keep it in the record, but do not
reuse it in that cycle or count it among the current requirements.

## Technical acceptance criterion

A technical check Architect derives from a scope acceptance condition. It uses
that condition's existing ID.

## Project context

Auditor's record of the existing project in `.standards/CONTEXT.md`. Its
established facts form the **baseline** that other roles use when planning a
change.

## Completion gate

The checks a role must pass before handing work to the next step.

## Forward handoff

Moving to the next workflow step after passing those checks.

## Failure handoff

Sending a problem to the role responsible for fixing it.

## Resume handoff

Returning to `ResumeAt` after a recovery frame is complete, or another recovery
step outside the normal forward sequence.

## Cycle mode

`STANDARD` selects the full workflow. `EXPEDITED` selects the shorter workflow
for a small, clearly defined change to an existing project.

## Promotion

Switching an active expedited cycle to standard work through Auditor because a
skipped role is needed. The cycle cannot switch back to expedited work. See
[promotion steps](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Recovery frame

A saved record of one correction: who must fix it, why, where to return, and
which steps need repeating. See [Recovery](../../concepts/recovery/).

## Project mode and workflow state

`ProjectMode` records whether the project has an established implementation.
`WorkflowState` records the current step. A role's internal mode selects how it
works within that step.
