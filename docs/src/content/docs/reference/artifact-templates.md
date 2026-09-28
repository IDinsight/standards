---
title: Artifact Templates
description: Find each role's document format and where its output belongs.
---

These templates show what each workflow role records. The agent uses the
appropriate template when it creates or updates a document; you do not need to
choose a template or fill one out yourself. Each template page comes from
`skills/<role>/template.md`, the file that guides that role.

## Templates by role

| Role         | Document                                             | What it records                                                |
| ------------ | ---------------------------------------------------- | -------------------------------------------------------------- |
| Scoper       | [Scope](../templates/scoper/)                        | Goals, boundaries, and checkable outcomes.                     |
| Architect    | [Technical design](../templates/architect/)          | Design decisions and how they support the requirements.        |
| Developer    | [Development plan](../templates/developer/)          | Implementation steps, approval, progress, and checks.          |
| Auditor      | [Project context](../templates/auditor/)             | Relevant facts about the existing project.                     |
| Tester       | [Verification report](../templates/tester/)          | Test coverage, results, and remaining gaps.                    |
| Reviewer     | [Review report](../templates/reviewer/)              | Independent assessment, findings, and conclusions.             |
| Documenter   | [Documentation record](../templates/documenter/)     | Documentation checked or changed, results, and remaining work. |
| Synchronizer | [Synchronization record](../templates/synchronizer/) | Whether current files and completed assessments still agree.   |

Navigator has no template or saved report. Its explanations and quiz feedback
stay in the conversation.

## How roles use the templates

The agent keeps each document as short as the work allows while retaining its
required sections. The templates differ:

- Scope, technical design, and project context allow empty sections to be
  omitted.
- Verification requires its main sections; only an empty **Open Findings and
  Dependencies** section may be omitted.
- Review, documentation, and synchronization records keep their required
  sections. Use `NONE` or explain what has not yet been assessed, as directed by
  the template.
- Development plans keep the required plan and step fields. Optional
  implementation notes can be omitted.

An empty finding list does not prove completion. The responsible role records
the checks it performed, what the results show, and what remains unresolved.

## Output locations

Paths below are relative to the project using STANDARDS. The agent creates or
updates each document at the listed location. `<cycle-id>` is the ID saved in
`Active Work.Id`.

| Document               | Location                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Scope                  | An appropriate existing project document, or `.standards/docs/scope/<cycle-id>.md`. |
| Technical design       | An appropriate existing project document, or `.standards/docs/specs/<cycle-id>.md`. |
| Development plan       | `.standards/docs/development/<cycle-id>.md`                                         |
| Project context        | `.standards/CONTEXT.md`                                                             |
| Verification report    | `.standards/docs/verification/<cycle-id>.md`                                        |
| Implementation review  | `.standards/docs/reviews/<cycle-id>/implementation.md`                              |
| Final review           | `.standards/docs/reviews/<cycle-id>/final-deliverable.md`                           |
| Documentation record   | `.standards/docs/documentation/<cycle-id>.md`                                       |
| Synchronization record | `.standards/docs/synchronization/<cycle-id>.md`                                     |

Only the Scope, Architecture, and Development paths are saved in `STATE.md`. The
development plan, verification report, reviews, and documentation and
synchronization records always use the fixed paths above, derived from the cycle
ID. Uninstalling STANDARDS deletes everything under `.standards/docs/`.

## Preserve files from earlier cycles

New scope and design documents, and every development plan and assessment
record, carry a marker identifying their cycle. Review reports also identify the
review kind. Moving or renaming a file does not change which cycle owns it.

An existing unmarked project scope or design document can remain shared across
cycles. Tests, guides, and docstrings also remain reusable project files; their
assessment records belong to a cycle.

New scope and design files are named after the cycle ID, so they never collide
with another cycle's files. If a required report path contains an unrelated or
incorrectly marked file, the agent keeps it and stops work that depends on the
report until the conflict is resolved. It does not overwrite or relabel that
file or silently choose another report path.

See [file ownership](../../concepts/ownership/#artifact-provenance) and the
[exact path and marker rules](../protocol/#workflow-artifact-provenance).

## Entry numbers and references

Records number their entries: development steps as `DEV-001`, review findings as
`F-001`, synchronization discrepancies as `D-001`, and documentation
discrepancies as `DOC-001`. The agent gets each new number from
`node .standards/bin/id.mjs next`, so a number is never reused. When one record
mentions an entry in another, it includes that record's path, for example
`.standards/docs/reviews/<cycle-id>/implementation.md#F-003`.
