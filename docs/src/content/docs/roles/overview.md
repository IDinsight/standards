---
title: Role Overview
description: Find the right role and understand how to work with it.
---

STANDARDS divides work among nine roles. Each has a clear responsibility:

| Role                             | What it helps you do                                                |
| -------------------------------- | ------------------------------------------------------------------- |
| [Scoper](../scoper/)             | Decide what to build and what counts as done.                       |
| [Tester](../tester/)             | Test the change and record what the results prove.                  |
| [Architect](../architect/)       | Resolve the technical design before coding.                         |
| [Navigator](../navigator/)       | Understand the project or check your understanding.                 |
| [Developer](../developer/)       | Plan and implement the change with your approval.                   |
| [Auditor](../auditor/)           | Establish the project facts the change depends on.                  |
| [Reviewer](../reviewer/)         | Get an independent assessment of the work.                          |
| [Documenter](../documenter/)     | Keep documentation accurate and useful.                             |
| [Synchronizer](../synchronizer/) | Check that the work offered for sign-off matches what was assessed. |

Their initials spell S.T.A.N.D.A.R.D.S.; this is not their running order. The
[workflow](../../concepts/states-and-handoffs/) depends on whether the project
is new or existing and whether the cycle uses standard or expedited work. A
cycle is one request, ending in your sign-off or cancellation.

## Run a role

You choose when to run each role. Use `$scoper` in Codex or `/scoper` in Claude
Code, replacing `scoper` with the role's name. Each page below includes
examples.

The saved workflow state determines which role can work next. At a handoff, the
outgoing role saves its progress and gives you the next command; it does not
automatically run it. Tester and Reviewer require
[separate assessment conversations](../../reference/protocol/#independent-assessment-sessions).

Navigator is available at any point, even without an active cycle. It explains
existing work without changing files or workflow state.

## Know what completion means

Each workflow role saves its work and checks it before moving on. These checks
are its **completion gate**. If a problem belongs to another role, work returns
to that role for correction. The [recovery process](../../concepts/recovery/)
keeps track of what must be repeated and where to return.

A role's completion does not mean the whole change is accepted. You make the
final [sign-off decision](../../concepts/human-decisions/). Expedited cycles run
only Developer and implementation Reviewer; if they need a skipped role, the
cycle must move to the standard workflow.

## Files and setup

The role pages explain what each role produces. The
[templates](../../reference/artifact-templates/) define the required contents;
[ownership rules](../../concepts/ownership/#artifact-provenance) protect files
from other cycles. In the paths shown here, `<Active Work.Id>` means the current
cycle's saved identifier.

All nine role packages are present. The installer is unfinished; see
[installation requirements](../../getting-started/installation/). The packages'
evaluation scenarios describe intended behavior, not proof of successful model
runs.
