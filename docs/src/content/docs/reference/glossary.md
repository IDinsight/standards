---
title: Glossary
description: Look up the shared language used throughout the framework.
---

These explanations summarize the protocol's vocabulary. The
[Canonical Terms](../protocol/#canonical-terms) section is authoritative.

## Active work

The persisted identity, request, artifact references, promotion reason when
applicable, transient audit target, and blocking question for one workflow
cycle. A terminal state retains this record until a new cycle replaces it.

## Completed scope

A persisted scope that has passed Scoper's completion gate. This does not imply
an additional user approval unless the project explicitly requires one.

## Scope-level acceptance condition

An observable outcome owned by Scoper and identified by a stable `AC-NNN`
reference within the active cycle.

## Acceptance identifier

The reference reused by downstream design and evidence artifacts for the same
scope-level condition. It is an identity, not an ordering guarantee.

## Retired acceptance identifier

An identifier whose condition was removed or materially replaced. It remains
recorded in scope and cannot be reused within the active cycle. Retired
identifiers are not current coverage obligations.

## Technical acceptance criterion

A technical condition Architect derives from a scope-level acceptance condition
and links to its existing acceptance identifier.

## Project context

Auditor's grounded baseline of relevant project facts and constraints, stored in
`.standards/CONTEXT.md`. Planned changes alone do not make the baseline stale.

## Completion gate

The conditions that a role must satisfy before a forward handoff.

## Forward handoff

A transition to the next legal state after the current completion gate passes.

## Failure handoff

Routing a defect to the owner of the affected artifact or decision.

## Resume handoff

The transition that completes a recovery frame by returning to `ResumeAt`, or
another recovery-directed transition that is not an ordinary forward handoff.

## Cycle mode

`CycleMode` selects `STANDARD` or `EXPEDITED` for one cycle. Standard follows
the full workflow for the project mode; expedited is a bounded brownfield path
through Developer, implementation Reviewer, and user sign-off.

## Promotion

The one-way `PROMOTE` transition from an active expedited cycle to `STANDARD` at
`AUDITING` when a skipped responsibility is required. It preserves the cycle
identity, persists `PromotionReason`, and clears expedited recovery.

## Recovery frame

One outstanding correction on the recovery stack. It preserves the owner,
reason, interrupted state, resume target, and any downstream rerun boundary.

## Project mode and workflow state

Project mode identifies the implementation baseline as greenfield or brownfield.
Workflow state identifies the active phase. Skill modes select procedures within
a role and do not replace either of these concepts.
