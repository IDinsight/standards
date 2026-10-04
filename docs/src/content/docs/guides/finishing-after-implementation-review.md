---
title: Finishing After Implementation Review
description: Choose when a standard cycle is ready for your sign-off decision.
---

A standard cycle normally continues through Documenter, final Reviewer, and
Synchronizer. You can ask to finish after implementation review instead. This
choice works for both new and existing projects, including projects that do not
need user-facing documentation.

You still decide whether to accept the work after the required checks pass.
Choosing the shorter path does not sign off the cycle.

## What changes

The agent saves your choice as the cycle's **completion policy**:

| Policy                    | Checks before your sign-off decision                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------ |
| `FULL_DELIVERABLE`        | The default: all standard steps, including documentation, final review, and synchronization.           |
| `IMPLEMENTATION_REVIEWED` | All standard steps through implementation review, plus Reviewer's check that no required work remains. |

Both choices keep Scoper, Architect, Auditor, Developer, full Tester
verification, and implementation Reviewer. Passing one test increment is not
enough to finish either path.

The shorter path leaves out the normal documentation phase, review of the
assembled final deliverable, and Synchronizer's independent check that the
current work matches its assessments. Reviewer explains these omissions when
presenting the work for your decision. It does not claim those phases passed.

This differs from
[expedited work](../../concepts/project-modes/#choose-the-cycle-mode), which
uses only Developer and implementation Reviewer for eligible changes to existing
projects. Expedited cycles keep their own rules; a completion-policy request
alone does not promote one to standard work.

## Make the choice

Include it in your request when starting a cycle. For example, in Codex:

```text
$scoper Build a small command-line tool to count words.
Finish this cycle after implementation review.

$auditor Add search by name to the existing directory.
Finish this cycle after implementation review.
```

Use the first example for a new project and the second for an existing one. In
Claude Code, use `/scoper` or `/auditor` instead.

For an active standard cycle, you can simply say:

```text
For this cycle, finish after implementation review.
```

Make this request outside Navigator, which can explain the choice but cannot
change workflow state. The agent saves the choice and any reason you give; you
do not edit `STATE.md`. The choice applies only to this cycle. There is no
separate preference to save before giving the next cycle's request.

You can change the policy while work is at Scoper, Architect, Auditor,
Developer, Tester, or implementation Reviewer. Recovery and outstanding
corrections must be finished, and no normal documentation, final-review, or
synchronization work may have begun. A change made at the same step preserves
that role's assignment, including any Developer/Tester checkpoint or blocker.

There is one later opportunity: after implementation Reviewer hands off to
Documenter, but before Documenter starts its normal work. If the implementation
review and full verification are still current and no question blocks the work,
the agent returns the cycle to implementation Reviewer to assess the shorter
path. Follow the handoff into an independent Reviewer chat. Selecting the policy
does not invoke Reviewer or skip this assessment.

If a change is not allowed yet, the agent explains why and keeps the current
policy. It does not save the rejected choice to apply automatically later.

## What Reviewer must check

A passing implementation review can still have work waiting for a later role.
For example, a required operations guide may not be written yet. Such a review
cannot make the shorter cycle ready for sign-off.

Reviewer separately records whether the cycle can finish under your choice.
Every current requirement needs enough evidence for the current files. Required
documentation must have evidence from Documenter. Unresolved fixes, missing
evidence, blocking questions, and recovery work must be resolved first.

The report records your choice, the inputs and evidence checked, any remaining
work, and the omitted checks. Its separate closure result is `NOT_ASSESSED`,
`INELIGIBLE`, or `ELIGIBLE`. Only a passing ordinary review and a current
`ELIGIBLE` result allow the cycle to reach `AWAITING_USER_SIGNOFF`.

Required fixes still go to their owners, including Documenter or Synchronizer
when needed. Those corrections do not start all the omitted normal phases.
Reviewer reassesses any affected conclusions before the work is ready again.
Having no documentation does not, by itself, make the cycle eligible.

## Return to the full workflow

Before normal downstream work begins, you can ask:

```text
Use the full workflow for this cycle instead.
```

At an earlier step, the current role keeps its assignment. If the shorter cycle
is already awaiting sign-off, the agent returns it to Documenter once it has
confirmed that implementation review and full verification still apply. Changed
work goes back to its owners first. Recovery and outstanding corrections must be
finished, and no question may block this return. Earlier corrective
documentation work does not count as starting the normal documentation phase.

The full workflow then requires Documenter, final Reviewer, and Synchronizer.
Choosing it does not repeat still-valid earlier work. If you choose the shorter
path again before Documenter starts, Reviewer must reassess it; the old eligible
result alone is not enough.

## Accept the finished work

Read Reviewer's summary and decide whether to sign off, request changes, or
cancel. You can also return to the full workflow as described above. Before
recording sign-off, the agent checks that the assessment still applies to the
current files. Changed inputs may require new evidence and review.

The report keeps the assessment and omitted checks after the cycle ends. A new
standard cycle defaults to `FULL_DELIVERABLE` unless you choose otherwise for
that request. See
[Human Decisions and Sign-off](../../concepts/human-decisions/) and the
[exact policy rules](../../reference/protocol/#completion-policies).
