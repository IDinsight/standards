---
title: Human Decisions and Sign-off
description: Know when to invoke a role, approve a plan, or accept the work.
---

You invoke the role named by each handoff and decide whether to accept the
finished work. Completing a role's checks can make the next step available; it
does not automatically run that step or accept the result for you.

## Run each role explicitly

Use your client's command, such as `$scoper` in Codex or `/scoper` in Claude
Code. Workflow roles can do their work only when the saved state assigns it to
them. A handoff gives you the next invocation.

[Navigator](../../roles/navigator/) is the exception: you can use it at any time
to understand the project. It never changes files or workflow state, even when
asked to change completion policy, sign off, cancel, or start a cycle. Those
actions require leaving Navigator.

## Choose or change the work

Before starting, you can choose standard or eligible expedited work. If the
request cannot use your chosen mode, the agent saves the request and asks you to
resolve the choice. It does not silently switch modes or start the cycle. See
[Starting a Cycle](../../guides/starting-a-cycle/).

For standard work, you can also choose to
[finish after implementation review](../../guides/finishing-after-implementation-review/).
The agent checks that the choice is allowed and saves it for this cycle. You
still need to accept the work after Reviewer confirms it is ready.

During an active cycle, you can request changes, a completion-policy change,
promotion to standard work, or cancellation. An explicit request can authorize
the receiving agent to update the workflow record, even when another role owns
the current step. A greenfield bootstrap reset also requires your explicit
approval of the `standards reset` command after the agent shows its preview.
Until you approve and the reset succeeds, that cancellation is not complete.
Doing the next role's work still requires invoking that role.

[Rework](../../guides/revising-scope-or-design/) stays within the current cycle.
After sign-off or retained cancellation, a new request starts a
[new cycle](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

## Approve implementation before coding

Developer presents a saved plan and waits for your approval in both standard and
expedited work. Changes to the intended behavior, technical approach, or other
important implementation work require approval again. Fixing a defect within an
unchanged approved plan does not.

[Developer's modes](../../roles/developer/#modes) let you choose whether it
works through approved steps, pauses after each step, or codes with you. You can
also choose or switch
[verification cadence](../../guides/working-with-developer/#switch-cadence-during-a-cycle)
to control when Tester receives work. Neither choice replaces plan approval.

Scoper's completion does not add a separate approval step unless your project
requires one.

## Decide at sign-off

`AWAITING_USER_SIGNOFF` means the required checks are complete and the work is
ready for your decision. Tell the agent what you want to do; it handles the
workflow update and any handoff. You can:

- **Accept it:** ask the agent to sign off and finish the cycle.
- **Request changes:** describe what needs to change. The agent records the
  rework and names the responsible role for you to invoke.
- **Cancel:** ask the agent to end the cycle without accepting it.
- **Promote expedited work:** request the full standard workflow. The agent
  records the promotion and hands off to Auditor, which you invoke.
- **Return to full completion:** if you chose the shorter standard policy,
  withdraw it to continue with Documenter, final Reviewer, and Synchronizer. The
  agent first checks that the existing implementation review and full
  verification still apply. See
  [the withdrawal rules](../../guides/finishing-after-implementation-review/#return-to-the-full-workflow).

Before recording sign-off, the agent checks that the completion requirements
still hold for the current files. No unresolved correction or blocking question
can remain. Accepting shorter standard or expedited work covers the checks
required by that choice; it does not mean the omitted roles completed their
normal phases. Accepting a documentation cycle requires all six included gates
and current evidence. Standard completion-policy changes cannot shorten its
route. Required implementation work needs an achievable documentation-only scope
or explicit cancellation and a separate cycle; see
[Updating Documentation on Its Own](../../guides/updating-documentation/).

Cancellation does not undo project changes. What happens to the framework
installation depends on whether implementation exists; see
[cancellation rules](../../guides/cancelling-and-new-cycles/).

## Answer questions and choose when to commit

A role saves a question when it cannot safely continue without your answer. It
incorporates the answer before moving forward.

When a role produces changes worth committing, it suggests a Conventional Commit
message. It creates the commit only if you ask. Navigator does neither.
