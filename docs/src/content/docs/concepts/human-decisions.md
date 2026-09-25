---
title: Human Decisions and Sign-off
description: Know when to invoke a role, approve a plan, or accept the work.
---

You decide which roles to run and whether to accept the finished work.
Completing a role's checks can make the next step available; it does not
automatically run that step or accept the result for you.

## Run each role explicitly

Use your client's command, such as `$scoper` in Codex or `/scoper` in Claude
Code. Workflow roles can do their work only when the saved state assigns it to
them. A handoff gives you the next invocation.

[Navigator](../../roles/navigator/) is the exception: you can use it at any time
to understand the project. It never changes files or workflow state, even when
asked to sign off, cancel, or start a cycle. Those actions require leaving
Navigator.

## Choose or change the work

Before starting, you can choose standard or eligible expedited work. If the
request cannot use your chosen mode, the agent saves the request and asks you to
resolve the choice. It does not silently switch modes or start the cycle. See
[Starting a Cycle](../../guides/starting-a-cycle/).

During an active cycle, you can request changes, promotion to standard work, or
cancellation. An explicit request can authorize the receiving agent to update
the workflow record, even when another role owns the current step. Doing the
next role's work still requires invoking that role.

[Rework](../../guides/revising-scope-or-design/) stays within the current cycle.
After sign-off or retained cancellation, a new request starts a
[new cycle](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

## Approve implementation before coding

Developer presents a saved plan and waits for your approval in both standard and
expedited work. Changes to the intended behavior, technical approach, or other
important implementation work require approval again. Fixing a defect within an
unchanged approved plan does not.

[Developer's modes](../../roles/developer/#modes) let you choose whether it
works through approved steps, pauses after each step, or codes with you.
Choosing a mode does not replace plan approval.

Scoper's completion does not add a separate approval step unless your project
requires one.

## Decide at sign-off

`AWAITING_USER_SIGNOFF` means the required checks are complete and the work is
ready for your decision. You can:

- **Accept it:** sign off and finish the cycle.
- **Request changes:** describe what needs to change and return work to the
  responsible role.
- **Cancel:** end the cycle without accepting it.
- **Promote expedited work:** request the full standard workflow, starting with
  Auditor.

Before recording sign-off, the agent checks that the completion requirements
still hold for the current files. No unresolved correction or blocking question
can remain. Accepting expedited work covers its narrower set of checks; it does
not mean the skipped standard roles completed their work.

Cancellation does not undo project changes. What happens to the framework
installation depends on whether implementation exists; see
[cancellation rules](../../guides/cancelling-and-new-cycles/).

## Answer questions and choose when to commit

A role saves a question when it cannot safely continue without your answer. It
incorporates the answer before moving forward.

When a role produces changes worth committing, it suggests a Conventional Commit
message. It creates the commit only if you ask. Navigator does neither.
