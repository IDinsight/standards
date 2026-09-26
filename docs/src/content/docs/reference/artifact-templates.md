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

| Document               | Location                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Scope                  | An appropriate existing project document, or a new file under `docs/scope/`.                                            |
| Technical design       | An appropriate existing project document, or a new file under `docs/specs/`.                                            |
| Development plan       | `docs/development/<cycle-id>.md`; a project-required plan directory may differ, but the filename stays `<cycle-id>.md`. |
| Project context        | `.standards/CONTEXT.md`                                                                                                 |
| Verification report    | `docs/verification/<cycle-id>.md`                                                                                       |
| Implementation review  | `docs/reviews/<cycle-id>/implementation.md`                                                                             |
| Final review           | `docs/reviews/<cycle-id>/final-deliverable.md`                                                                          |
| Documentation record   | `docs/documentation/<cycle-id>.md`                                                                                      |
| Synchronization record | `docs/synchronization/<cycle-id>.md`                                                                                    |

Only the Scope, Architecture, and Development paths are saved in `STATE.md`. The
other locations are fixed or derived from the cycle ID.

## Preserve files from earlier cycles

New scope and design documents, and every development plan and assessment
record, carry a marker identifying their cycle. Review reports also identify the
review kind. Moving or renaming a file does not change which cycle owns it.

An existing unmarked project scope or design document can remain shared across
cycles. Tests, guides, and docstrings also remain reusable project files; their
assessment records belong to a cycle.

If a new scope or design would overwrite another cycle's file, the agent chooses
a different path. If a required report path contains an unrelated or incorrectly
marked file, the agent keeps it and stops work that depends on the report until
the conflict is resolved. It does not overwrite or relabel that file or silently
choose another report path.

See [file ownership](../../concepts/ownership/#artifact-provenance) and the
[exact path and marker rules](../protocol/#workflow-artifact-provenance).
