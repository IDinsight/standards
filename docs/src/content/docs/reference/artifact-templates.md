---
title: Artifact Templates
description:
  Use the authoritative shapes for scope, design, and project context.
---

Each implemented role has an authoritative template describing both the artifact
shape and its authoring rules. These reference pages are generated from the
repository's template files during docs development and builds.

- [Scope template](../templates/scoper/): outcomes, boundaries, acceptance
  conditions, dependencies, and retired identifiers.
- [Architecture template](../templates/architect/): decisions, acceptance
  coverage, contracts, technical criteria, and implementation sequence.
- [Project context template](../templates/auditor/): grounded baseline,
  commands, constraints, unknowns, and evidence.

## Use the contract, not every heading

Omit empty sections and add detail only when it resolves material ambiguity. The
template is not a requirement to produce a long document. A small change can
have a concise scope and design while still meeting all completion conditions.

## Keep artifact ownership clear

Scoper owns acceptance meaning and identifiers. Architect references those
identifiers when recording coverage. Auditor records established project facts
and does not turn proposed design into baseline requirements.

Workflow state stores artifact paths; it should not accumulate copies of their
content or acceptance evidence.
