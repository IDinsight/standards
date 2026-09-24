---
title: Artifact Templates
description: Find the scope, design, development-plan, and context templates.
---

Each implemented role has a template defining the file it produces. The site
copies these templates from the repository during development and builds.

- [Scope](../templates/scoper/): requirements, acceptance conditions,
  dependencies, and retired IDs.
- [Architecture](../templates/architect/): design decisions, interfaces, how the
  design meets each requirement, and build order.
- [Development plan](../templates/developer/): cycle ownership, collaboration
  mode, approval status, `DEV-NNN` steps, acceptance mapping, and self-checks.
- [Project context](../templates/auditor/): existing behavior, tools, commands,
  constraints, unknowns, and supporting evidence.

Omit empty sections. Add enough detail to meet the template's requirements and
resolve important questions; a small change can have a short document.

Record Scope, Architecture, and Development paths in `STATE.md`; Auditor context
has the fixed path `.standards/CONTEXT.md`. Keep document contents out of state.
New Scope, Architecture, and Development files require cycle provenance, and
development plans always use cycle-specific filenames. See
[artifact ownership](../../concepts/ownership/#artifact-provenance).
