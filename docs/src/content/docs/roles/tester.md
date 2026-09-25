---
title: Tester
description: Independently test the change and explain what the results prove.
---

Tester checks whether the implementation does what the requirements and design
say it should. It owns tests and the record of verification results. It examines
Developer's claims rather than treating completed work as proof.

Tester runs in `TESTING` during a standard cycle. Expedited work skips this
role; needing its independent verification requires the standard workflow.

## Start in a fresh chat

After the handoff enters `TESTING`, open a fresh chat separate from Developer's
implementation conversation:

```text
Codex:       $tester Continue from .standards/STATE.md.
Claude Code: /tester Continue from .standards/STATE.md.
```

During recovery, also ask Tester to read the active recovery frame. Tester can
resume its own separate assessment conversation. If it cannot determine the
session's history, it states that limit and works from saved evidence; it does
not pretend to erase history. See the
[session rules](../../reference/protocol/#independent-tester-session).

## Inputs and output

Tester reads the scope, design, Auditor context, development plan, relevant
code, and existing tests. It checks the whole relevant change, including
committed work and affected code that did not change.

Tests stay in the project's established test locations. The
[verification report](../../reference/templates/tester/) is saved at
`docs/verification/<Active Work.Id>.md`. It records what was checked, actual
results, remaining gaps, and the next action. Each current acceptance condition
and relevant technical criterion is linked to supporting evidence or an
explanation of what is still missing.

## Modes

Starting a new chat does not reset the work. A change to requirements can
require rechecking coverage even when the code is unchanged.

### VERIFY

Establish the initial assessment. This mode also resumes an interrupted first
pass when the inputs are unchanged.

### REVERIFY

Revisit an assessment after its inputs change or a verification mistake is
found. Keep valid tests and results, replacing unsupported evidence.

## How much testing to add

Tester reuses existing coverage first. The default limit is five added or
substantially expanded scenarios per source file for the active change. Existing
unchanged tests do not use that allowance, and running existing suites is not
limited.

A scenario is a distinct input or setup and an observable outcome. Three
independent cases still count as three if they share one test function. A test
covering changed behavior in two source files uses an allowance in each.

The count carries across corrections and sessions. If required verification
needs more coverage, Tester explains the gap and asks for a targeted increase.
It cannot skip a requirement just to stay within the limit. The
[report template](../../reference/templates/tester/#scenario-budget) shows where
the coverage choices and any approved increase are recorded.

## Completion and handoff

Tester finishes when required checks have satisfactory results, the report is
current, and no present testing or verification problem remains. Unrun tests,
missing services, or unexplained flaky results are not passes. If execution is
unavailable, the report identifies the limitation and remaining checks.

A condition that genuinely depends on a later role, such as a user guide, can
remain pending with its owner and required evidence recorded. It must still be
satisfied before sign-off.

Tester corrects tests and test-only setup. Implementation and design defects
return to their owners. Normal completion goes to
[implementation Reviewer](../reviewer/) in a separate chat; recovery follows its
saved route.
