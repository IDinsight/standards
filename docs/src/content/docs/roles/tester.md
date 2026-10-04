---
title: Tester
description: Independently test the change and explain what the results prove.
---

Tester checks whether the implementation does what the requirements and design
say it should. It owns tests and the record of verification results. It examines
Developer's claims rather than treating completed work as proof.

Tester runs in `TESTING` during a standard cycle. Expedited work skips this
role; needing its independent verification requires the standard workflow.

## Use an independent chat

After the handoff enters `TESTING`, use the existing independent Tester chat or
open a fresh one separate from Developer's implementation conversation:

```text
Codex:       $tester Continue from .standards/STATE.md.
Claude Code: /tester Continue from .standards/STATE.md.
```

During recovery, also ask Tester to read the active recovery frame. Tester can
reuse its own separate assessment conversation across increments and
corrections. The chats share a cycle and checkout; only the role assigned by the
saved state works at a time. If Tester cannot determine the session's history,
it states that limit and works from saved evidence; it does not pretend to erase
history. See the
[session rules](../../reference/protocol/#independent-tester-session).

## Inputs and output

Tester reads the scope, design, Auditor context, development plan, relevant
code, and existing tests. It reconstructs its assigned outcome and affected
earlier behavior, including committed work and affected code that did not
change.

Tests stay in the project's established test locations. The
[verification report](../../reference/templates/tester/) is saved at
`.standards/docs/verification/<Active Work.Id>.md`. It records what was checked,
actual results, remaining gaps, and the next action. Each current acceptance
condition and relevant technical criterion is linked to supporting evidence or
an explanation of what is still missing.

The report records the assessment's purpose and target:

| Purpose      | What Tester assesses                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| `FULL`       | The complete current implementation; target `NONE`.                                |
| `INCREMENT`  | The selected testable outcome and affected earlier behavior; target `Increment N`. |
| `CORRECTION` | A specific correction or affected rerun in recovery.                               |

Tester reconstructs the assignment from the saved handoff and records. You do
not need to choose these fields. For incremental work, see the
[two-chat workflow](../../guides/working-with-developer/#alternate-between-two-chats).

You can select a [user style](../../reference/runtime-files/#user-styles) you
keep at `.standards/user-styles/tester/<name>.md`, such as how you like tests
named. The report saves the selection, Tester reloads it when it resumes, and
you can change it during the cycle. It never overrides the requirements,
repository tooling, or established test conventions.

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

The count carries across increments, cadence switches, corrections, and
sessions. Replacing an invalidated test for the same scenario keeps its existing
allocation; a materially new scenario uses another. If required verification
needs more coverage, Tester explains the gap and asks for a targeted increase.
It cannot skip a requirement just to stay within the limit. The
[report template](../../reference/templates/tester/#scenario-budget) shows where
the coverage choices and any approved increase are recorded.

## Completion and handoff

Tester completes an assignment when its required checks have satisfactory
results and current evidence, with no unresolved problem blocking it. Unrun
tests, missing services, or unexplained flaky results are not passes. If
execution is unavailable, the report identifies the limitation and remaining
checks.

For a passing increment, Tester saves the assessment and returns to Developer
with the report still `IN_PROGRESS`. Future implementation can remain recorded
as `AWAITING_IMPLEMENTATION`. Changed inputs require reconciling earlier tests
and results; a historical pass alone is not current evidence.

Full verification covers every current acceptance condition and relevant
technical criterion against the final implementation. Only this gate permits a
`COMPLETE` report and normal handoff to [implementation Reviewer](../reviewer/)
in a separate chat.

A condition that genuinely depends on a later role, such as a user guide, can
remain pending with its owner and required evidence recorded. It must still be
satisfied before sign-off.

This full verification gate applies to both standard completion policies.
Choosing to finish after implementation review does not excuse a pending
documentation requirement or replace full verification with an increment pass.
Reviewer separately checks whether the shorter cycle is ready to finish.

Tester corrects tests and test-only setup. Implementation and design defects
return to their owners. Recovery follows its
[saved assignment and return route](../../concepts/recovery/#when-a-correction-must-return-before-full-completion);
any return to Reviewer still requires full Developer and Tester completion.
