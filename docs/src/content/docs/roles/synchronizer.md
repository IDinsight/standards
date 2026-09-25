---
title: Synchronizer
description: Check that the work offered for sign-off matches what was assessed.
---

Synchronizer checks that the current files, completed assessments, and workflow
records agree. For example, if code changed after testing and review, it checks
whether those earlier results still support the work you are about to accept.

## When to use it

Run Synchronizer in `SYNCHRONIZING` during a standard cycle, normally after
final review or when its own assessment needs correction. Expedited cycles skip
this role.

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
at `docs/synchronization/<Active Work.Id>.md`. It links to the supporting
evidence, explains disagreements or missing information, and records whether
work is ready for your decision.

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

Synchronizer then moves the workflow to `AWAITING_USER_SIGNOFF` and explains
what was checked and any remaining limitations. You can accept the work, request
rework, or cancel. Synchronizer does not accept it for you.

During recovery, a verified correction to Synchronizer's own record can
sometimes return to an interrupted role before the full assessment is finished.
That [limited return](../../reference/protocol/#synchronizer-corrective-return)
keeps the record incomplete and cannot bypass the requirements for sign-off.

## Who fixes disagreements

Synchronizer corrects its own reasoning and record. It sends other problems to
their owners: stale documentation to Documenter, invalid test evidence to
Tester, and outdated review conclusions to the relevant Reviewer.

It does not supply another role's missing evidence or close that role's
findings. If a disagreement prevents a reliable conclusion, it remains a blocker
until resolved. See the
[complete synchronization requirements](../../reference/protocol/#synchronization-gate).
