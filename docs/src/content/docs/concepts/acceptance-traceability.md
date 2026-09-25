---
title: Acceptance Criteria and Traceability
description: Connect each requirement to the evidence that shows it is met.
---

How do you know the finished work meets the request? In a standard cycle, Scoper
gives each checkable outcome an ID, such as `AC-001`. Later roles use that same
ID in the design, implementation plan, and assessment reports. This connection
between requirements and evidence is called **acceptance traceability**.

Expedited work is checked against the saved request instead. If it
[becomes standard work](../states-and-handoffs/#promote-an-expedited-cycle),
Scoper creates the acceptance conditions when the workflow reaches Scoping.

## Give each outcome an ID

Scoper writes the acceptance conditions: statements of what must be true for the
work to count as done. Each gets an ID that is unique within the cycle.

Outcomes checked at different steps need separate conditions. For example:

| ID       | Acceptance condition                                  |
| -------- | ----------------------------------------------------- |
| `AC-001` | A user can export the selected records as a CSV file. |
| `AC-002` | The user guide explains how to export records.        |

Tester can check the export behavior before Documenter finishes the guide.
Combining both outcomes under one ID would make their progress harder to judge.

Scoper owns what each condition means. Other roles refer to it; they send
unclear or incorrect requirements back to Scoper.

## Connect the design and implementation

Architect accounts for every current acceptance ID, explaining how the design or
existing technical behavior supports it. Developer uses the same IDs to connect
implementation steps to the requirements.

Some conditions need no technical design. For `AC-002` above, Architect can
record **No architectural impact** and identify the documentation work it
depends on. That label cannot excuse missing design for a technical requirement.

## Follow the evidence

Tester accounts for every current condition with results, a reason it cannot yet
be verified, or a dependency on a later role. Tests that were not run and
Developer's own checks do not replace Tester's independent verification.

A later dependency may remain open during implementation review only when the
condition actually depends on that later work. For example, `AC-002` can wait
for Documenter. A failing export test cannot be deferred that way.

After documentation, final Reviewer checks that every current condition has
sufficient evidence. Synchronizer checks that those assessments still apply to
the files being offered for sign-off. Neither role invents missing evidence or
closes another role's findings.

The evidence stays in the responsible roles' records, linked by the same IDs.
There is no separate master checklist to maintain. A condition marked pending is
still unfinished; all current conditions need sufficient evidence before the
cycle can be ready for your decision.

## Replanning preserves history

When a condition keeps its meaning, it keeps its ID. A new condition or a
changed meaning gets a previously unused ID. Removed and replaced IDs are
retired, never reused or renumbered within the cycle.

For example, changing “export as CSV” to “export as JSON” replaces the
condition; correcting a typo does not.

When requirements change, later roles must revisit any completed work that needs
to cover the full set of conditions, even if the code is unchanged.

See the [scope template](../../reference/templates/scoper/) for the record
format and the [protocol](../../reference/protocol/#acceptance-traceability) for
the full rules.
