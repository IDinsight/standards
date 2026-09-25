---
title: Roles and Ownership
description: Know who makes each decision and who fixes a problem.
---

Each role is responsible for particular decisions and files. Finding a problem
does not give it permission to change another role's work.

## Who owns what

| Role         | Responsibility                                                        |
| ------------ | --------------------------------------------------------------------- |
| Scoper       | Requirements and what counts as done.                                 |
| Architect    | Technical design and important decisions across components.           |
| Developer    | The implementation, its plan, and implementation self-checks.         |
| Auditor      | Verified facts about the existing project, called its baseline.       |
| Tester       | Tests and independent verification results.                           |
| Reviewer     | Independent assessments, review findings, and review conclusions.     |
| Documenter   | Project documentation, comments, docstrings, and its work record.     |
| Synchronizer | Checking that current files, assessments, and workflow records agree. |

Project instructions outside managed framework sections are part of Documenter's
work. Executable code, tooling directives, and managed framework files retain
their own owners.

Reviewer owns its findings, but the role responsible for a defect makes the fix.
Only Reviewer can resolve or withdraw its finding. Likewise, Synchronizer can
correct its own assessment but cannot supply another role's missing evidence.

See the [role pages](../../roles/overview/) for each role's inputs, outputs, and
completion rules.

## Design and implementation are separate

Architect decides how the important parts of the system should work together.
Developer turns that design into detailed implementation steps and makes local,
easily reversible coding choices. Approving Developer's plan does not authorize
it to change Scoper's requirements or Architect's design.

Auditor records what already exists. A proposed design remains a proposal, even
if it is mentioned in the context document.

## Send problems to their owners

Suppose Tester needs to check retries, but the design never decided when a
request should be retried. Architect must resolve that decision. Tester cannot
decide the behavior by writing a test.

If the design already specifies the behavior and the test expects something
else, Tester fixes the test. If the code violates the design, Developer fixes
the implementation.

[Recovery](../recovery/) records the correction and the route back to the
interrupted work.

## Artifact provenance

A workflow document created for one cycle carries a marker identifying its type
and cycle. The protocol calls this **artifact provenance**. For example, a new
scope document begins with a block like this:

```markdown
<!-- STANDARDS
Artifact: SCOPE
Cycle: add-user-search-20260924T150000Z-a7f3
-->
```

The marker protects the file even if it is moved or renamed. Another cycle may
read it as permitted prior evidence, but cannot overwrite it or claim it as its
own.

There are two important distinctions:

- An existing, unmarked project scope or design document can be updated as the
  project's shared document. Referencing it in workflow state does not turn it
  into a cycle-owned file.
- Tests, guides, and docstrings remain reusable project files. The reports
  describing their verification or documentation work belong to a cycle.

Development plans always belong to one cycle and include its ID in the filename.
Verification, review, documentation, and synchronization records have fixed
paths derived from that ID. If a required path contains an unrelated or
incorrectly marked file, dependent work stops until the conflict is resolved.
The role cannot overwrite the file or quietly choose another path.

See [output paths](../../reference/artifact-templates/) and the
[exact marker and preservation rules](../../reference/protocol/#workflow-artifact-provenance).

## Shared workflow records

Workflow roles can update the installed state, mode, and cycle-ID records when
the protocol requires it, such as when saving a handoff or unanswered question.
They cannot rewrite the installed protocol to change the rules.

Compatible guidance can be applied together, such as a project formatter and
general coding style. If instructions materially conflict, the responsible role
must resolve the problem, or ask you when no role has authority to settle it. A
priority list does not authorize silently ignoring the conflict. See
[instruction conflicts](../../reference/protocol/#instruction-layering-and-conflicts).

## Navigator explains without changing anything

Navigator has no workflow state or saved report. It can explain a problem and
its likely owner, but cannot fix it, change workflow records, run another role,
or approve work. Quiz feedback is about your understanding of the chosen topic.
It is not a test result or review verdict.

See [Navigator](../../roles/navigator/) for its modes and boundaries.
