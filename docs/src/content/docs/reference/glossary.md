---
title: Glossary
description: Look up the shared language used throughout the framework.
---

These are the main terms used in the docs. The
[protocol](../protocol/#canonical-terms) defines their exact meaning.

## Active work

The `Active Work` record in `STATE.md`: the cycle's ID, request, file paths,
promotion reason, unresolved cancelled changes, audit target, and open question.
Paths include Scope, Architecture, and Development.
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

## Verification report

Tester's assessment at `docs/verification/<Active Work.Id>.md`: acceptance
coverage, scenario allocations, actual results, gaps, and later dependencies. It
is cycle-owned evidence, separate from reusable tests and workflow state. See
the [verification template](../templates/tester/).

## Review report

Reviewer's independent assessment for a cycle and review kind, including inputs,
checks, findings, limitations, and resumable progress. Reports live under
`docs/reviews/<Active Work.Id>/`; see the
[review template](../templates/reviewer/). Passing a review gate does not
complete the cycle.

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
for a small, clearly defined change to an existing project. `UNSET` means no
cycle is active and role-owned workflow work cannot begin yet. Navigator can
still explain available project evidence.

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
works. Navigator's EXPLAIN, INVESTIGATE, and GRILL_ME modes operate outside the
workflow state machine; they do not require a current step.

## Pending cycle fields

A mode preference or blocked request for the next cycle, stored separately from
active work. The agent reuses the saved request when the user resolves its
blocking decision. See [Starting a Cycle](../../guides/starting-a-cycle/).

## Cycle ID registry

The append-only `.standards/CYCLE_IDS.md` list of reserved IDs. IDs cannot be
reused while that runtime remains installed, even after a failed initialization.
See [allocation rules](../runtime-files/#cycle-identity).

## Artifact provenance

A block inside a STANDARDS-created Scope, Architecture, Development,
Verification, Review, Documentation, or Synchronization file that identifies its
type and owning cycle. Review blocks also identify the review kind. Renaming the
file does not change its ownership. See
[artifact provenance](../../concepts/ownership/#artifact-provenance).

## Development plan and step

Developer's saved implementation plan, approved before coding. Each `DEV-NNN`
identifies a build step with an outcome and self-check. These IDs do not replace
Scoper's `AC-NNN` requirements. See [Developer](../../roles/developer/).

## Outstanding obligation

An unfinished correction kept when promotion replaces its recovery route. It
records an owner, failure type, and reason. The owner removes it after verifying
the specific fix, then still has to pass its completion checks. See
[recovery obligations](../../concepts/recovery/#outstanding-obligations).

## Synchronization record

Synchronizer's cycle-specific reconciliation of completed assessments, current
files, and workflow records. It references evidence and records discrepancies,
limits, and readiness; it does not establish user acceptance. See
[Synchronizer](../../roles/synchronizer/).

## Documentation record

Documenter's cycle-specific evidence and progress at
`docs/documentation/<Active Work.Id>.md`. It identifies assessed documents,
actual checks, supported conditions, remaining work, and collaboration choices.
It does not make ordinary documentation cycle-owned or certify other roles'
work. See [Documenter](../../roles/documenter/).
