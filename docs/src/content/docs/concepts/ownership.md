---
title: Roles and Artifact Ownership
description: Understand which role may change each decision or file.
---

Each role is responsible for specific decisions and files. Finding a problem
does not give a role permission to fix another role's work.

## Separate records for separate decisions

- **Scope:** what to build and what counts as done. Scoper owns it.
- **Technical design:** the important design choices, interfaces, and contracts.
  Architect owns it.
- **Development plan:** concrete implementation steps, progress, and
  self-checks. Developer owns it and asks for approval before implementation.
- **Verification:** tests and formal evidence of behavior. Tester owns them. Its
  report records current evidence, gaps, and later-role dependencies.
- **Review:** independent assessment, findings, and conclusions. Reviewer owns
  reports and corrections to its findings, while defects go to their owners.
- **Project context:** what already exists and what the change must respect.
  Auditor owns it. These established facts are the project's **baseline**.

A proposed design is still a proposal, even if it appears in the context file.
Keep existing facts separate from planned changes.

## Coordination has its own rules

Roles may update `MODE.md`, `STATE.md`, and `CYCLE_IDS.md` only as the protocol
requires, such as to change state, save a file path, or record an unanswered
question. They cannot edit the installed `PROTOCOL.md` to change those rules.

## Artifact provenance

New STANDARDS Scope, Architecture, Development, Verification, and Review files
begin with a block identifying their type and owning cycle. For example:

```markdown
<!-- STANDARDS
Artifact: SCOPE
Cycle: add-user-search-20260924T150000Z-a7f3
-->
```

Use the actual active ID and exactly one type: `SCOPE`, `ARCHITECTURE`,
`DEVELOPMENT`, `VERIFICATION`, or `REVIEW`. Review blocks also require the
concrete `ReviewKind`. The marker keeps ownership visible even if the file is
renamed or moved. Another cycle may read it as permitted prior evidence, but
cannot overwrite, repurpose, or adopt it as its own artifact. Choose a different
path for new work.

Before editing any referenced artifact, inspect its marker. If it names another
cycle, correct the active reference without changing the other cycle's file.

An existing unmarked project-owned scope or architecture document can still be
updated as the project's canonical document. Merely referencing it in state does
not make it cycle-owned; do not add provenance just because it was selected.
Newly created workflow artifacts must have the marker.

Development plans always belong to one cycle. Their filename includes the active
ID, and both their marker and visible `Cycle` field must match it. See
[Developer](../../roles/developer/#inputs-and-output) for the required location.
Verification reports follow the same cycle-ownership rule at the fixed path
`docs/verification/<Active Work.Id>.md`; test suites remain reusable project
assets. See [Tester](../../roles/tester/#inputs-and-output).

Reviewer reports also belong to one cycle and kind, at the fixed paths under
`docs/reviews/<Active Work.Id>/`. Unlike new scope/design path selection, a
collision at a fixed verification or review path blocks dependent work until
resolved; do not silently choose an alternative or relabel the existing file.
See [Reviewer](../../roles/reviewer/#inputs-and-output).

## Architect and Developer

Architect decides technical intent and contracts, including important behavior
across system boundaries. Its Build Plan gives coarse ordering guidance.
Developer owns the detailed `DEV-NNN` plan, execution, and reversible local
choices. Approval of that plan does not authorize changing another role's work.

Compatible style guidance can be applied together, such as using the
repository's formatter before generic style preferences. A material
contradiction must go to the responsible workflow role, or to the user if no
role can resolve it without overriding another authority. A precedence list
alone cannot settle the conflict. See
[Instruction Layering and Conflicts](../../reference/protocol/#instruction-layering-and-conflicts).

## Finding a problem outside your role

Suppose Tester finds that the design never specified retry behavior. That is an
`ARCHITECTURE` failure: Architect must decide the behavior. Tester must not
choose it by writing a test.

If the design already specifies retries and the test checks the wrong behavior,
that is a `VERIFICATION` failure for Tester to fix.

[Failure Recovery](../recovery/) explains how to return work to the right role.
See the [role overview](../../roles/overview/) for all responsibilities.

## Navigator is different

Navigator explains and investigates at any point in the workflow. It never
changes project files or workflow state.
