---
title: Working on an Existing Project
description: Ground a change in the implementation that already exists.
---

Use the brownfield path when the project already has meaningful implementation.
Installation starts the workflow in `AUDITING` so scope and design can respect
existing behavior and constraints.

## Choose standard or expedited work

Installation defaults to `CycleMode: STANDARD`. Follow the audit, scope, and
design steps below for that workflow.

For a bounded hotfix, debugging change, or low-risk maintenance task needing no
skipped role, select `EXPEDITED` under the
[cycle-selection rules](../../concepts/project-modes/#choose-the-cycle-mode). An
eligible initialized cycle enters `DEVELOPING` with an `INITIAL` handoff; a new
cycle from a terminal state uses `NEW_CYCLE`. After cancellation, apply
[baseline reconciliation](../cancelling-and-new-cycles/#start-the-next-cycle)
before choosing expedited entry.

Persist a stable identifier and the bounded request. Developer implements that
request and performs its normal self-checks, then hands off to implementation
Reviewer and, once the applicable gates pass, user sign-off. Scope and
architecture remain `NONE`. If any skipped responsibility becomes necessary,
[promote through Auditor](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

## Give Auditor a concrete request

Record the requested outcome and stable cycle identifier. Explicitly invoke
Auditor in the active `AUDITING` state. Its inspection should be proportional to
the request, with enough project-wide context to avoid local contradictions.

Without a usable context baseline, use whole-repo mode. With one, gapfill or
subtree may be appropriate. Auditor selects the procedure from the evidence; a
narrow target does not justify skipping a missing project baseline.

## Scope the change against the baseline

After the audit, invoke Scoper. Define what changes, what must remain
compatible, and the observable acceptance conditions. Existing architecture may
impose a constraint; an unapproved proposed design does not become a scope
requirement.

## Design and implement

Architect defines material decisions and acceptance coverage. Valid active-cycle
context allows the normal handoff directly to Developer; a second audit is not
automatically required simply because implementation will change the codebase.

If the baseline is materially wrong or incomplete, route to Auditor before
continuing dependent work. Planned changes alone are not a context failure.

See [Auditor](../../roles/auditor/) for inspection modes and
[Acceptance Traceability](../../concepts/acceptance-traceability/) for evidence
rules.
