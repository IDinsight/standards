---
title: Developer
description: Plan and implement approved work in resumable steps.
---

Developer owns implementation and the development plan in `DEVELOPING`.
Architect defines the important design decisions and contracts; Developer turns
them into concrete build steps and chooses local implementation details.

## When to use Developer

Run Developer after the standard workflow hands off to it, for an eligible
expedited brownfield request, or when recovery returns to implementation. It
cannot start coding in another role's state. See
[starting a cycle](../../guides/starting-a-cycle/) for entry rules.

## Inputs and output

In `STANDARD`, Developer needs the completed scope, technical design, and valid
Auditor context for the current cycle. In `EXPEDITED`, `Active Work.Request`
defines the change; older context is only prior evidence. If a skipped role is
needed,
[promote the cycle](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).

Developer saves a [development plan](../../reference/templates/developer/) at
`docs/development/<Active Work.Id>.md`, or the project's required
development-plan directory with the same cycle-specific filename. Record the
path in `Active Work.Development`. The file's `DEVELOPMENT` provenance and
visible `Cycle` field must match the active ID. A shared plan or a prior cycle's
plan cannot be reused. See
[artifact ownership](../../concepts/ownership/#artifact-provenance).

Each `DEV-NNN` step has a goal, affected area, expected outcome, dependencies,
status, and self-check. Standard steps reference current `AC-NNN` IDs; expedited
steps use `EXPEDITED_REQUEST`. `DEV-NNN` identifies implementation work, not a
new requirement.

## Approval before implementation

A new or materially revised plan has `Status: PROPOSED`. Developer records the
approval question in `Active Work.BlockedOn`, presents the plan, and stops
before changing implementation. Explicit approval changes the plan to `APPROVED`
and clears that blocker. Starting implementation changes it to `IN_PROGRESS`.

Changes to build steps, dependencies, behavior, or technical approach that alter
the approved implementation intent require a new proposal and approval. Wording,
file hints, and other bookkeeping changes do not. A correction within unchanged
approved intent can reopen an affected step without duplicate approval.

## Collaboration modes

| Mode           | After plan approval                           |
| -------------- | --------------------------------------------- |
| `AUTONOMOUS`   | Finish approved steps without routine pauses. |
| `STEPWISE`     | Complete one step, then wait for the user.    |
| `CODE_WITH_ME` | Help; write approved work only when asked.    |

`AUTONOMOUS` is the default. It still stops for blockers, material plan changes,
or required handoffs. In `STEPWISE`, each completed step includes a self-check
and progress report before waiting.

Switching modes changes how you collaborate. It does not change `CycleMode` or
require rework when the implementation intent stays the same. Developer saves
the selected mode in the plan. See
[Working with Developer](../../guides/working-with-developer/) for examples and
resuming work.

## Style and role boundaries

Developer always uses `styles/universal.md`, any explicitly selected personal
style, and the relevant Python, TypeScript, React, Next.js, HTML, CSS, or SQL
guidance. Universal guidance takes precedence over personal styles, which take
precedence over discretionary technology preferences.

The plan records `User Style` as a profile's filename stem or `NONE`. You may
select, change, or clear it before first approval. That approval sets
`User Style Locked: true` for the rest of the cycle, including recovery,
revisions, and promotion. A different style requires a new cycle and plan.
Resuming reloads the saved selection; a missing locked profile blocks work until
restored. A revised `PROPOSED` plan does not unlock it.

Repository tooling and project constraints guide implementation; style guidance
does not justify unrelated refactors. Material conflicts follow the
[protocol's conflict rules](../../reference/protocol/#instruction-layering-and-conflicts).

Developer can research how to use an already chosen API or technology. Choosing
important architecture, access policies, or data contracts belongs to Architect.
It routes missing requirements or project facts to their owners.

Developer may run existing tests and checks for feedback. It does not create or
rewrite Tester-owned tests, claim formal acceptance verification, or take over
review or documentation.

## Completion and handoff

Before marking the plan `COMPLETE`, every current approved step must be `DONE`,
self-checks must be satisfactory, and the implementation must meet its contract.
Resolve blockers, unapproved deviations, and Developer-owned
[outstanding obligations](../../concepts/recovery/#outstanding-obligations).
Remove each obligation after verifying its correction, then finish the remaining
completion checks and mark the plan complete.

Normal standard completion hands off to Tester in a fresh chat separate from
Developer's implementation conversation. The persisted plan must include actual
self-check results and enough context to assess implementation claims without
that conversation. Expedited completion hands off to Reviewer for implementation
review in a fresh chat separate from authoring conversations, with the
protocol's advisory model recommendation. Active recovery follows its saved
frame and the applicable independent-session rule when it enters `TESTING` or
either review state. See [Reviewer](../reviewer/).

While still greenfield, Developer records the permanent change to `BROWNFIELD`
as soon as it verifies that active-cycle implementation has been created or
materially changed. This includes implementation written by the user during
collaboration; creating or approving the plan alone does not trigger it.
