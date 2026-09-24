---
title: Artifact Templates
description:
  Find the scope, design, development, verification, review, synchronization,
  and context templates.
---

Each implemented role has a template defining the file it produces. The site
copies these templates from the repository during development and builds.

- [Scope](../templates/scoper/): requirements, acceptance conditions,
  dependencies, and retired IDs.
- [Architecture](../templates/architect/): design decisions, interfaces, how the
  design meets each requirement, and build order.
- [Development plan](../templates/developer/): cycle ownership, collaboration
  mode, approval status, `DEV-NNN` steps, acceptance mapping, and self-checks.
- [Verification report](../templates/tester/): assessed inputs, acceptance
  evidence, scenario budget, actual execution, gaps, and resume or handoff.
- [Review report](../templates/reviewer/): cycle and kind, independent
  assessment, findings, limitations, later dependencies, and resumable
  conclusions.
- [Synchronization record](../templates/synchronizer/): assessed identities,
  completion/evidence references, discrepancies and owners, limits, and resume
  conclusion.
- [Project context](../templates/auditor/): existing behavior, tools, commands,
  constraints, unknowns, and supporting evidence.

Omit empty sections. Add enough detail to meet the template's requirements and
resolve important questions; a small change can have a short document.

Record Scope, Architecture, and Development paths in `STATE.md`; Auditor context
has the fixed path `.standards/CONTEXT.md`. Tester's fixed report path is
`docs/verification/<Active Work.Id>.md`, with no extra state field. Keep
document contents out of state. Review reports use the fixed
`docs/reviews/<Active Work.Id>/implementation.md` and `final-deliverable.md`
paths in that directory, also without a state field. New Scope, Architecture,
Development, Verification, Review, and Synchronization files require cycle
provenance. Development plans, verification reports, and review reports always
belong to one cycle; review provenance also identifies its kind. See
[artifact ownership](../../concepts/ownership/#artifact-provenance).

Synchronization records always belong to one cycle at the fixed path
`docs/synchronization/<Active Work.Id>.md`, with no state field. They reference
existing evidence rather than duplicate an acceptance ledger.
