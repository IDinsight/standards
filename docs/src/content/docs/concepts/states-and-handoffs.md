---
title: Workflow States and Handoffs
description:
  Follow the steps of a cycle and understand what happens between roles.
---

The workflow state tells you which role can work next. A **handoff** saves where
work should go and why, then tells you how to invoke the next role. Changing the
state does not run a role automatically.

The installed `.standards/STATE.md` records the current step, cycle mode,
completion policy, active request, and recovery information. When you give the
first role a request, the agent initializes the cycle before doing that role's
work; you do not edit the state file yourself.
[Navigator](../../roles/navigator/) can explain the project at any time without
changing that state.

## The paths at a glance

See the [standard-cycle map](../../guides/overview/#standard-cycle) for both
project entry paths and completion policies, or the
[expedited-cycle map](../../guides/overview/#expedited-cycle) for eligible
existing projects and promotion to standard work. Each map links to the relevant
guides. Corrections follow a [recovery route](../recovery/).

## Standard forward paths

A new, greenfield project starts with Scoper, Architect, and Auditor. An
existing, brownfield project starts with Auditor, Scoper, and Architect. Both
then continue through Developer, Tester, and implementation Reviewer. By
default, Documenter, final Reviewer, and Synchronizer follow. The shorter
completion policy leaves out those three normal phases and requires a separate
check by implementation Reviewer before your sign-off decision.

Each role must finish its required checks before a normal handoff. If a problem
needs an earlier role, [recovery](../recovery/) determines the route instead.
Brownfield design also needs valid project context for the current cycle before
implementation begins.

See the [state reference](../../reference/protocol/#workflow-states) for exact
saved names such as `DEVELOPING` and `REVIEWING_IMPLEMENTATION`.

## Expedited forward path

Eligible brownfield work follows Developer, implementation Reviewer, and your
sign-off decision.

The saved request defines the change. Developer still saves a plan and gets your
approval before coding. Reviewer checks the implementation against that request
and the evidence from Developer.

This path omits separate scoping, architecture, auditing, testing,
documentation, final review, and synchronization. It does not produce their
reports or claim their checks passed. Developer's self-checks are not Tester's
independent verification.

See [cycle modes](../project-modes/#choose-the-cycle-mode) for eligibility.

## Promote an expedited cycle

If expedited work needs a skipped role, it must become standard work. This
change is called **promotion**.

Promotion keeps the same cycle ID, request, and existing work, and starts the
standard brownfield sequence with Auditor. It records why the fuller workflow is
needed and preserves unfinished corrections as
[outstanding obligations](../recovery/#outstanding-obligations). The old
expedited recovery routes no longer apply.

An active workflow role can promote when the shorter path is no longer
sufficient. At the sign-off decision, promotion needs your authorization.
Requesting rework that requires a skipped role provides that authorization.
Auditor must still be explicitly invoked.

Code already written remains work under consideration. Auditor distinguishes it
from what existed before the cycle; its presence does not decide the new
requirements or design. When Developer is reached again, it
[updates its plan](../../guides/working-with-developer/#continue-after-expedited-promotion)
against the standard scope and design.

Promotion is one-way for the cycle and selects `FULL_DELIVERABLE`. Choosing the
shorter standard policy is a separate decision and cannot bypass unfinished
corrections. The [protocol](../../reference/protocol/#expedited-promotion)
specifies the exact state updates.

## What a handoff records

The agent saves the destination, the reason for the handoff, and any correction
or recovery details before presenting the next invocation. The saved records
carry the context so the next role does not depend on the previous chat.

For example, a normal handoff to Architect in Codex may say:

```text
$architect Continue from .standards/STATE.md. Read the active work, relevant
project context and role outputs, and any recovery record before proceeding.
```

Claude Code uses `/architect`. A recovery handoff also directs the role to read
the active recovery frame.

### Independent assessment chats

Handoffs to Tester and Reviewer require separate conversations:

- **Tester:** use an existing independent Tester chat or a fresh one separate
  from Developer's implementation chat.
- **Reviewer:** use a fresh chat separate from all conversations that authored
  the work being reviewed, including requirements, design, context, code, tests,
  and documentation.

This applies during recovery too. Either role can resume its own independent
assessment chat. Starting a different role in the authoring chat does not erase
its history. During a Developer/Tester exchange, use the same cycle and checkout
and work in only the role assigned by the saved state at a time.

A different model of equal or higher capability is recommended for Reviewer when
those details are known, but is optional. Unknown session or model details must
be disclosed rather than guessed. See the
[independent assessment rules](../../reference/protocol/#independent-assessment-sessions).

## Ready for your decision

`AWAITING_USER_SIGNOFF` means ready for your decision, not accepted.

Before presenting standard work for sign-off, the agent checks that all required
role results still apply to the current files. `FULL_DELIVERABLE` includes final
review and synchronization. `IMPLEMENTATION_REVIEWED` requires a passing
implementation review and a current eligible closure assessment. Every current
requirement needs sufficient evidence. Required project context must be valid,
including any checks of changes left by cancelled cycles.

Expedited work needs Developer and implementation Reviewer to complete its
narrower checks. In either mode, recovery must be finished, no outstanding
obligations may remain, and no unanswered question may block completion.

A report labelled “complete” is not enough on its own. If files or requirements
have changed, the relevant roles must establish whether their earlier
conclusions still apply.

## After a cycle ends

Sign-off ends the cycle in `SIGNED_OFF`. Retained cancellation ends it in
`CANCELLED`. Both leave the previous active-work record available and reset
cycle mode to `UNSET`. The previous completion policy stays with that record.
New work starts a new cycle, with a fresh policy choice, rather than reopening
the old one.

Greenfield cancellation can instead reset the workflow if no implementation has
been created. The agent previews `standards reset` and waits for your explicit
approval; the active cycle remains in place until the reset succeeds. The reset
keeps STANDARDS installed and leaves no `CANCELLED` state. See
[cancellation and new cycles](../../guides/cancelling-and-new-cycles/) for the
conditions, and [Human Decisions](../human-decisions/) for your choices.
