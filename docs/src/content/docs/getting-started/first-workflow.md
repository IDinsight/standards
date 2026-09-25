---
title: Your First Workflow
description: Follow a search feature from its request to your sign-off decision.
---

This example adds **search by name and email to an existing user directory** and
updates its user guide. It uses the standard workflow.

It assumes an existing project set up for STANDARDS, with no active cycle. The
[installation requirements](../installation/) are defined, but an installer
command is not yet provided.

Use each role's handoff to invoke the next one when it is ready. The examples
below use Codex's `$role` syntax; in Claude Code, use `/role` instead.

## 1. Start with Auditor

Give Auditor the request and choose standard work:

```text
$auditor Start a STANDARD cycle.
Add search by name and email to the existing user directory,
and update the user guide to explain how to use it.
```

The agent validates the mode, reserves a fresh cycle ID, and saves the request
before Auditor begins. Auditor then checks the relevant code, behavior,
conventions, and commands, saving its findings in `.standards/CONTEXT.md`.

This is the starting role for an existing project. For a new project, follow
[Starting a New Project](../../guides/new-project/).

## 2. Define the outcome with Scoper

After Auditor finishes, use its handoff to run Scoper. Explain what users should
be able to do and answer questions that would change the result.

The scope might include these acceptance conditions, if you agree to them:

- `AC-001`: Users can find directory entries by name.
- `AC-002`: Users can find directory entries by email.
- `AC-003`: An empty result displays a clear no-results message.
- `AC-004`: The user guide explains how to search the directory.

The IDs connect each outcome to its design and later evidence. Scoper saves the
scope and its location in the workflow record.

## 3. Design the change with Architect

Run Architect after Scoper's handoff. It decides how the search should fit the
existing application: which components handle the request, what they exchange,
and how errors are handled.

Architect accounts for each acceptance condition. The user-guide condition may
need no technical design; it still remains work for Documenter. Local coding
choices stay with Developer.

## 4. Approve the plan and work with Developer

Developer turns the design into implementation steps and presents a saved plan
for your approval. A step might add the agreed name filter and link it to
`AC-001`.

Read the plan, request changes if needed, and approve it before coding starts.
Choose how to work:

- **AUTONOMOUS:** the default; work through approved steps.
- **STEPWISE:** complete and check one step, then wait for you to continue.
- **CODE_WITH_ME:** explain the next step and help with code you write.

Developer saves progress and runs implementation checks. Important changes to
the plan require approval again. See
[Working with Developer](../../guides/working-with-developer/) for the details.

## 5. Test in a separate chat

When Developer hands off to Tester, open a fresh chat separate from the
implementation conversation and run:

```text
$tester Continue from .standards/STATE.md.
```

Tester reads the saved requirements, design, implementation, and existing tests.
It adds or updates coverage where needed, runs appropriate checks, and records
the actual results and any gaps.

For this example, Tester checks the search behavior. The guide can remain
pending until Documenter supplies its evidence. That does not excuse an untested
or failing search condition.

See [Tester](../../roles/tester/) for the test budget and what happens when a
check cannot run.

## 6. Review the implementation independently

After Tester's handoff, open a fresh chat separate from the conversations that
produced the requirements, design, project context, code, and tests. Run:

```text
$reviewer Continue IMPLEMENTATION review from .standards/STATE.md.
```

Reviewer checks the implementation against the requirements, design, and test
evidence. It records concrete problems and who must fix them. A different model
of equal or higher capability is recommended when known, but optional.

If a correction is needed, follow the saved return instructions before
continuing. Reviewer reassesses its findings after the responsible role fixes
the work.

## 7. Document the change

After implementation review passes, invoke Documenter from the handoff. It
checks how search actually works and updates the user guide and any other
required documentation.

Documenter saves what it checked, what changed, and the supporting evidence. The
guide's completion is linked to `AC-004`.

## 8. Check the finished work

Documenter hands off to final Reviewer. Use a fresh chat separate from the
conversations that authored the work, including documentation:

```text
$reviewer Continue FINAL_DELIVERABLE review from .standards/STATE.md.
```

Final review checks the assembled result, including the user guide and current
evidence for every acceptance condition. Earlier pending work must now be
resolved.

After it passes, invoke Synchronizer. Synchronizer checks that the current
files, completed assessments, and workflow records agree. If code changed after
testing or review, the affected results must still be shown to apply.

## 9. Decide whether to accept it

When the workflow reaches `AWAITING_USER_SIGNOFF`, read the summary and review
the work. You can:

- **Sign off** to accept it and finish the cycle.
- **Request changes** to return work to the responsible role.
- **Cancel** to end the cycle without accepting it.

Sign-off requires the checks to remain valid for the current files, with no
unfinished corrections or blocking questions. Cancellation does not undo project
changes. See [Human Decisions](../../concepts/human-decisions/).

## If work stops along the way

Answer a blocking question when a role needs your decision. If another role must
fix a problem, follow the recovery handoff; it records where to return after the
correction.

You can continue in another chat from the saved records. Follow the
[independent-chat requirements](../../concepts/states-and-handoffs/#independent-assessment-chats)
when returning to Tester or Reviewer. See
[Resuming Interrupted Work](../../guides/resuming-work/) for a walkthrough.
