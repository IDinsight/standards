---
title: Artifact Templates
description: Use the required templates for scope, design, and project context.
---

Each implemented role has a template defining the file it produces. The site
copies these templates from the repository during development and builds.

- [Scope](../templates/scoper/): requirements, acceptance conditions,
  dependencies, and retired IDs.
- [Architecture](../templates/architect/): design decisions, interfaces, how the
  design meets each requirement, and build order.
- [Project context](../templates/auditor/): existing behavior, tools, commands,
  constraints, unknowns, and supporting evidence.

Omit empty sections. Add enough detail to meet the template's requirements and
resolve important questions; a small change can have a short document.

Save file paths in `STATE.md`. Keep the documents themselves at those paths,
without copying their contents into the state record. See
[ownership](../../concepts/ownership/) for who may change each document.
