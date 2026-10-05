---
title: Synchronizer
description: Check that the work offered for sign-off matches what was assessed.
---

Synchronizer checks that the current files, completed assessments, and workflow
records agree. For example, if code changed after testing and review, it checks
whether those earlier results still support the work you are about to accept.

## When to use it

Run Synchronizer in `SYNCHRONIZING` during a standard cycle. With the default
`FULL_DELIVERABLE` policy, it follows final review. With
`IMPLEMENTATION_REVIEWED`, it runs only through recovery to correct or recheck
affected reconciliation work. Expedited cycles skip this role. In
[documentation cycles](../../guides/updating-documentation/), it always follows
independent final review and reconciles the six included roles. It requires
current documentation evidence rather than omitted implementation or
formal-testing reports.

```text
Codex:       $synchronizer Continue from .standards/STATE.md.
Claude Code: /synchronizer Continue from .standards/STATE.md.
```

## Inputs and output

Synchronizer reads the scope, design, Auditor context, development plan,
verification and review reports, Documenter's record, and the relevant project
files. It compares the versions assessed with the current work and checks that
every required outcome has sufficient evidence.

Its [synchronization record](../../reference/templates/synchronizer/) is saved
at `.standards/docs/synchronization/<Active Work.Id>.md`. It links to the
supporting evidence, explains disagreements or missing information, and records
whether work is ready for your decision.

You can select a [user style](../../reference/runtime-files/#user-styles) you
keep at `.standards/user-styles/synchronizer/<name>.md`. The record saves the
selection, and Synchronizer reloads it when it resumes. A style shapes how the
record and summary are written, never what counts as a disagreement or whether
work is ready.

## Modes

Synchronizer has no separate modes. When you resume it, it checks what changed
before reusing earlier conclusions. If requirements changed, it checks the full
current set, even where the code stayed the same.

A result of “everything is already consistent” is valid after sufficient
inspection. There is no need to manufacture edits or duplicate earlier notes.

## Completion and handoff

Work is ready for sign-off only when the required assessments still apply,
records agree, all current requirements have sufficient evidence, and required
corrections and recovery are finished. A file's existence or a `COMPLETE` label
does not establish this by itself.

On normal full completion, Synchronizer moves the workflow to
`AWAITING_USER_SIGNOFF` and explains what was checked and any remaining
limitations. You can accept the work, request rework, or cancel. Synchronizer
does not accept it for you.

During recovery, a verified correction to Synchronizer's own record can
sometimes return to an interrupted role before the full assessment is finished.
That [limited return](../../reference/protocol/#corrective-returns) keeps the
record incomplete and cannot bypass the requirements for sign-off.

Under `IMPLEMENTATION_REVIEWED`, Synchronizer follows the saved recovery route.
An incomplete corrective return cannot go directly to sign-off: implementation
Reviewer must reassess ordinary review and early completion first. If an
upstream change later invalidates an earlier verified correction, a
[limited rerun](../../concepts/recovery/#corrections-when-finishing-after-implementation-review)
can recheck that evidence while the synchronization record stays incomplete.
Neither route claims that the omitted normal phase passed.

Documentation recovery stays among included roles. An owned correction can
return to another interrupted role with its record incomplete only under the
qualified corrective-return rules. The shorter-standard rerun exception does not
apply. All six full gates and current evidence must hold before readiness;
implementation requirements block for your decision rather than promotion.

## Who fixes disagreements

Synchronizer corrects its own reasoning and record. It sends other problems to
their owners: stale documentation to Documenter, invalid test evidence to
Tester, and outdated review conclusions to the relevant Reviewer.

It does not supply another role's missing evidence or close that role's
findings. If a disagreement prevents a reliable conclusion, it remains a blocker
until resolved. The Synchronizer skill defines the complete requirements; see
the protocol's
[synchronization gate](../../reference/protocol/#synchronization-gate).
