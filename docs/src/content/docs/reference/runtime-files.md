---
title: Runtime Files
description: Find saved state, cycle IDs, pending requests, and work files.
---

The files in `.standards/` save workflow rules and progress. Scope, design,
development plans, implementation, and test results stay in their own files.

## Protocol and installation

**`.standards/PROTOCOL.md`** defines the shared rules. Installation or upgrade
updates it together with the skills. A workflow role cannot edit it to change
those rules.

**`.standards/INSTALLATION.json`** records client settings changed by the
installer. Upgrades and bootstrap resets use it to preserve your settings. A
compatible setting that already existed does not become framework-owned.

## Project mode

**`.standards/MODE.md`** contains one `ProjectMode`: `GREENFIELD` or
`BROWNFIELD`. See [project modes](../../concepts/project-modes/) for when it
changes.

## Workflow state

**`.standards/STATE.md`** is version-controlled. Its main fields and sections
are:

| Record                    | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `WorkflowState`           | Current step or terminal state.             |
| `CycleMode`               | `UNSET`, `STANDARD`, or `EXPEDITED`.        |
| `PendingCycleMode`        | Next-cycle preference, or `UNSET`.          |
| `PendingCycleRequest`     | Blocked next request, or `UNSET`.           |
| `PendingCycleBlockedOn`   | Pending decision, or `NONE`.                |
| `Active Work`             | Request, ID, file paths, and cycle context. |
| `Handoff`                 | The latest transition.                      |
| `Recovery`                | Nested corrections and return routes.       |
| `Outstanding Obligations` | Corrections kept after routes change.       |

`Active Work` includes the Scope, Architecture, and Development paths,
`PromotionReason`, `BaselineReconciliation`, `AuditTarget`, and `BlockedOn`.
`Handoff` records kind, starting state, failure type, and reason. Recovery
frames are ordered oldest first; the last frame is active.

`PendingCycleRequest` and `PendingCycleBlockedOn` are paired: the request is
`UNSET` exactly when the blocker is `NONE`. A pre-cycle decision must not change
`Active Work.BlockedOn`, which belongs to the active or retained previous cycle.
See [starting a cycle](../../guides/starting-a-cycle/) for selection and
validation.

Installation leaves the ID and request `UNSET`. No role-owned workflow work can
begin until a mode is validated and an ID reserved. Use `NONE` for artifact
paths until their owners create the files. Expedited Scope and Architecture
paths stay `NONE` unless promotion brings those roles into the cycle. Developer
still creates a plan in expedited work.

`PromotionReason` survives later handoffs. After sign-off or retained
cancellation, `CycleMode` becomes `UNSET`, while `Active Work` keeps the last
cycle's record. A later pending preference or blocked request is stored
separately until
[new-cycle initialization](../../guides/cancelling-and-new-cycles/#start-the-next-cycle).

The [saved-state rules](../protocol/#persisted-workflow-state) define the exact
format. [Recovery](../../concepts/recovery/) explains frames and obligations.

### Cycle identity

**`.standards/CYCLE_IDS.md`** is an append-only list of allocated IDs, with one
ID per Markdown list entry. It reserves names; it does not store requests,
states, or workflow history.

For each new cycle:

1. Generate a request name plus a fresh collision-resistant token, such as a
   UUID or timestamp with a random suffix. A bare request name is not enough.
2. Check the registry, existing cycle-owned file paths, and provenance markers
   for collisions, including `docs/development/<candidate>.md`.
3. Append the ID to the registry and save that change.
4. Only then assign it to `Active Work.Id` and initialize the cycle.

Never reuse, remove, or rewrite an allocated entry while the runtime remains
installed. If initialization fails after reservation, leave the ID reserved. If
the append fails, the new cycle must not start.

Installation creates an empty registry. Reinstall, upgrade, and explicit
workflow reinitialization preserve it.

If the registry is missing from an installed runtime, stop new-ID allocation and
work that depends on it. Restore the registry or intentionally remove the
runtime and install afresh; never silently recreate an empty registry or guess
its history. Runtime removal ends the registry's lifetime guarantee, but a fresh
installation still checks existing artifact paths and provenance for collisions.
See the [exact registry rules](../protocol/#cycle-id-registry).

### Outstanding baseline reconciliation

`Active Work.BaselineReconciliation` is `NONE` or a nonempty Markdown list:

```markdown
`BaselineReconciliation`:

- `SourceCycle`: `invoice-cache-hotfix-20260923-a7f3` `Request`:
  `Change invoice-cache invalidation behavior.`
- `SourceCycle`: `admin-notes-20260924-b8e4` `Request`:
  `Add internal notes to admin records.`
```

Each source cycle ID appears once, with its own request summary. Append new
sources while preserving existing entries through handoffs, recovery, rework,
and cancellation. Keep the whole list until Auditor resolves every source, then
set it to `NONE`. `Handoff.Reason` cannot replace it. A value outside the
required format is invalid workflow state and blocks dependent work until
corrected. See the
[canonical format](../protocol/#baseline-reconciliation-format).

This is separate from `Outstanding Obligations`, which tracks defects to fix.
See [cancellation and new cycles](../../guides/cancelling-and-new-cycles/) for
when baseline reconciliation is required.

## Project context

**`.standards/CONTEXT.md`** is Auditor's record of relevant existing behavior,
commands, boundaries, constraints, and evidence. Installation preserves an
existing file but does not create audit findings.

Expedited work may consult earlier context without treating it as refreshed for
that cycle. After promotion, Auditor separates tentative changes from
established baseline. See
[Auditor's procedure](../../roles/auditor/#promotion-and-cancellation-audits).

## Agent integration and work files

**`AGENTS.md`** contains a marked framework section alongside project
instructions. **`CLAUDE.md`** imports it for Claude Code. Installation preserves
text outside managed sections and requires resolution of material instruction
conflicts.

Scope, Architecture, and Development paths are recorded in active work. Default
directories are `docs/scope/`, `docs/specs/`, and `docs/development/` in the
project using STANDARDS, separate from this website's source files. Follow
[artifact provenance](../../concepts/ownership/#artifact-provenance) before
creating or editing these files.

Tester's report is always `docs/verification/<Active Work.Id>.md` with matching
`VERIFICATION` provenance. Its location is derived from the active cycle ID,
without a separate state field. Tests stay in established repository locations.
See the [verification template](../templates/tester/).

Reviewer reports use `docs/reviews/<Active Work.Id>/implementation.md` and
`docs/reviews/<Active Work.Id>/final-deliverable.md`. Their `REVIEW` provenance
includes cycle and kind, matching the visible fields and required path. No
review-path state field is added. Preserve other cycles and block dependent work
on provenance/path collisions. See the
[review template](../templates/reviewer/).

Synchronizer records use `docs/synchronization/<Active Work.Id>.md` with
matching `SYNCHRONIZATION` provenance and visible cycle ID. No
synchronization-path field is added to state. Fixed-path collisions block
dependent work while preserving existing content. See the
[synchronization template](../templates/synchronizer/).

Documenter's evidence and progress use `docs/documentation/<Active Work.Id>.md`
with matching `DOCUMENTATION` provenance and visible cycle ID. No
documentation-path state field is added. It records collaboration mode, target,
explicit user style (default `NONE`), inspected documentation identities, actual
checks, unresolved work, and resume context. Fixed-path collisions block
dependent work. Ordinary documentation and project agent guidance outside
managed blocks remain project assets. See the
[documentation template](../templates/documenter/).

## Navigator needs no record

[Navigator](../../roles/navigator/) can explain project evidence without an
active cycle or complete installed metadata. It reads relevant state when
available, but never repairs it, allocates IDs, persists questions, or saves
quiz results. Missing metadata limits workflow-status claims, not independent
project explanation. See [Navigator Boundary](../protocol/#navigator-boundary).
