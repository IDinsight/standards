---
title: Reviewer
description: Independently assess implementation and final deliverables.
---

Reviewer checks whether the work can move forward. It examines relevant claims
from all roles, including requirements, design, project context, implementation,
tests, results, and documentation. Completed artifacts guide the assessment but
do not prove their own correctness.

## Start in an independent session

When the workflow enters either review state, open a fresh chat separate from
the conversations that produced the artifacts under review. Ideally choose a
different model of equal or higher capability than the authoring model, where
known. This is advice, not a prerequisite or an automatic model switch.

Use the line for your client, with the kind matching the saved state:

```text
Codex:       $reviewer Continue IMPLEMENTATION review from `.standards/STATE.md`.
Claude Code: /reviewer Continue IMPLEMENTATION review from `.standards/STATE.md`.
```

For final review, replace `IMPLEMENTATION` with `FINAL_DELIVERABLE`. Read the
persisted active work, relevant context and owned artifacts, and recovery
context; for recovery, explicitly ask Reviewer to read the active frame.

The
[canonical session rules](../../reference/protocol/#independent-reviewer-session)
apply on normal and recovery handoffs. Known authoring history requires a fresh
session before formal review. Unavailable metadata is disclosed, without an
invented freshness claim or routine confirmation gate. Reviewer can resume its
own interrupted assessment.

## Inputs and output

Reviewer reconstructs the active change from the saved request, role artifacts,
repository history, and current files. That includes committed work, staged and
unstaged changes, untracked files, deletions, and affected unchanged callers or
dependencies. A clean working tree does not mean there is nothing to review.
Inspection stays relevant to the active contract and affected boundaries.

Two [review reports](../../reference/templates/reviewer/) belong to each cycle:

- `docs/reviews/<Active Work.Id>/implementation.md`
- `docs/reviews/<Active Work.Id>/final-deliverable.md`

Each report records `REVIEW` provenance with the exact cycle and review kind,
assessed content identities, checks and results, findings, limitations,
dependencies, and progress. No review-path state field is needed. A conflicting
file at a required path must be resolved without overwriting or adopting it.

## Modes and resumption

The persisted state selects the kind:

| State                      | Kind                | Assessment                                                                                              |
| -------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `REVIEWING_IMPLEMENTATION` | `IMPLEMENTATION`    | Implementation, upstream consistency, Developer claims, and standard-cycle Tester evidence.             |
| `REVIEWING_FINAL`          | `FINAL_DELIVERABLE` | Assembled work after documentation, current acceptance evidence, outstanding findings, and consistency. |

Both use one procedure and completion contract. Critical assessment always
applies. Re-review after corrections is part of either mode, not a third mode.

On resumption, Reviewer compares current content with the report's assessed
inputs, invalidates unsupported conclusions, and explains why retained evidence
still applies. Changes to acceptance conditions require reconciliation even when
code is unchanged. Reviewer checks fixes and affected boundaries independently;
an author's claim that a finding is resolved is not enough.

## Findings and role boundaries

Reviewer prioritizes correctness, security, failure handling, resource use,
compatibility, and material maintainability problems. Findings identify exact
evidence, a concrete failure case and impact, severity, owner, and the smallest
necessary correction. Cosmetic preferences, speculative improvements, and minor
repetition are excluded. **No material findings** is a valid result.

P0 means a critical defect with immediate severe consequences; P1 means a
serious failure; P2 means a bounded but material defect. All three block passing
review until corrected or withdrawn on evidence. Questions and assessment
limitations are recorded separately; a material evidence gap also blocks
completion.

Reviewer owns reports and corrections to its findings. It routes code problems
to Developer, test/evidence problems to Tester, scope problems to Scoper, design
problems to Architect, context problems to Auditor, and documentation problems
to Documenter. It does not edit their artifacts to resolve findings. See
[handling findings](../../guides/review-findings/).

Reviewer may run established diagnostic checks without a routine confirmation
question, subject to actual permissions. Those results support the review and do
not replace Tester-owned formal acceptance evidence. New tests are not required
for every change; evidence must fit the contract and project conventions.
Typechecking alone cannot prove runtime behavior. Unavailable checks are
recorded honestly, and required missing evidence prevents a pass.

## Completion and handoff

Reviewer completes only when the applicable
[review gate](../../reference/protocol/#review-gates) passes with no unresolved
material finding or assessment gap, blocking question, or obligation owned by
that review state. Passing the gate does not finish the entire cycle.

Standard implementation review may retain a condition explicitly dependent on a
later role with its owner, required evidence, and the same acceptance ID. It
then normally hands off to Documenter. Final review checks current evidence for
every condition, including resolved earlier dependencies, and normally hands off
to Synchronizer. Recovery follows its saved route instead of these normal steps.
Documenter, Navigator, and the installer remain unfinished. See
[Synchronizer](../synchronizer/) for reconciliation before sign-off.

Expedited review assesses the bounded request and Developer evidence without
demanding skipped artifacts. It can reach user sign-off after the expedited gate
passes; it never fabricates final review. If an omitted guarantee becomes
necessary, Reviewer promotes through the protocol.

## A plain-language result

The concise summary leads with whether work can move forward. It explains what
is wrong, what could happen, and who needs to fix it without hiding uncertainty
or severity. Technical terms are explained briefly; exact evidence stays in the
report. With no material findings, Reviewer says so and briefly describes what
was checked and what remains unvalidated.
