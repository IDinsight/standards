---
title: Revising Scope or Design
description: Route an active change to the owner while preserving valid work.
---

A requested change uses `USER_REWORK`; a mistake found by an agent uses
`FAILURE`. In expedited work, either may require promotion first.

## Identify what changed

- A changed outcome or requirement belongs to Scoper.
- An unclear or incorrect design decision belongs to Architect.
- Missing or wrong facts about the existing project belong to Auditor.

For example, adding email search to a name-only search request changes scope.
Deciding how a search parameter is encoded may require a design change.

## Check for expedited promotion first

In `EXPEDITED`, a clearly defined implementation change goes back to Developer.
If it needs a skipped role, update `Active Work.Request` as needed and follow
[the promotion steps](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).
Do not enter a skipped state through `USER_REWORK` or `FAILURE`.

A rework request that needs a skipped role already authorizes promotion,
including at sign-off. The user does not need to confirm the same change again.

## Record and route a correction within the current workflow

For user-requested rework that does not need promotion, update
`Active Work.Request` if the request changed, record `USER_REWORK` with its
failure type, and return to the earliest role whose work must change. In
expedited work, that is Developer. If the state changes, add a recovery frame
with `ResumeAt` set to the interrupted state. Keep existing frames.

The next role's work still requires the user to run that skill in its assigned
state. For an agent-discovered mistake, follow
[Failure Recovery](../../concepts/recovery/).

## Recheck the development plan

When corrected requirements or design return to Developer, keep valid `DEV-NNN`
IDs and reopen only affected steps. An unchanged approved implementation intent
does not need duplicate approval. A material plan change returns to `PROPOSED`
and requires approval before coding. After promotion, reconcile the expedited
plan against the standard inputs first. See
[Working with Developer](../working-with-developer/).

## Preserve unaffected content

Scoper uses REPLAN to revise existing scope and follows the
[acceptance-ID rules](../../concepts/acceptance-traceability/#replanning-preserves-history).
Architect updates the design without changing the meaning of requirements.

The role responsible for the correction decides which later steps must repeat.
Follow the
[recovery procedure](../../concepts/recovery/#correct-then-decide-what-to-repeat)
to finish those steps and return to the interrupted work.
