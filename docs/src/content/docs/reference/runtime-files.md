---
title: Runtime Files
description:
  Look up the files that store workflow rules, progress, and cycle IDs.
---

The **runtime** is the installed framework's files and settings in a project.
The files under `.standards/` hold rules and saved progress; plans, reports,
tests, and project documentation live separately.

This page describes the required layout installed by the CLI. See
[Installation and Setup](../../getting-started/installation/).

## Files at a glance

| File                           | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `.standards/CONTEXT.md`        | Auditor's record of the existing project, created when an audit runs. |
| `.standards/CYCLE_IDS.md`      | Reserved cycle IDs; entries cannot be reused.                         |
| `.standards/INSTALLATION.json` | Client-setting changes actually made by the installer.                |
| `.standards/MODE.md`           | The project's greenfield or brownfield mode.                          |
| `.standards/PROTOCOL.md`       | Shared workflow rules, aligned with the installed skills.             |
| `.standards/STATE.md`          | Current workflow step, request, handoff, and recovery.                |
| `.standards/VERSION.json`      | Installed framework version and upgrade compatibility check.          |

## Workflow state

`STATE.md` is version-controlled so another session can resume from the saved
work rather than infer progress from chat history.

| Field or section          | What it stores                                                          |
| ------------------------- | ----------------------------------------------------------------------- |
| `WorkflowState`           | The current step or an ended cycle's state.                             |
| `CycleMode`               | `STANDARD`, `EXPEDITED`, or `UNSET` when no cycle is active.            |
| `PendingCycleMode`        | An explicit preference for the next cycle, or `UNSET`.                  |
| `PendingCycleRequest`     | A next-cycle request blocked by a user decision, or `UNSET`.            |
| `PendingCycleBlockedOn`   | That unresolved decision, or `NONE`.                                    |
| `Active Work`             | The cycle ID, request, document paths, and unresolved questions.        |
| `Handoff`                 | The latest transition's kind, starting state, failure type, and reason. |
| `Recovery`                | Corrections and return instructions, with the newest frame active.      |
| `Outstanding Obligations` | Unfinished corrections preserved when promotion changes the route.      |

`Active Work` also stores the reason for promotion, any temporary audit target,
and changes left by cancelled cycles that Auditor must check.

The pending request and question are a pair: the request is `UNSET` exactly when
the question is `NONE`. A question about the next cycle belongs there, not in
the current or previous cycle's `Active Work.BlockedOn`.

Initial templates leave the ID and request `UNSET`. Workflow work begins only
after the request's mode is validated and a cycle ID is reserved. Document paths
use `NONE` until their owners create the files. Expedited scope and design paths
stay `NONE` unless promotion brings those roles in.

After sign-off or retained cancellation, cycle mode returns to `UNSET` and
`Active Work` keeps the last cycle's record. A new request starts a new cycle.
See the [full state format](../protocol/#persisted-workflow-state) and
[Starting a Cycle](../../guides/starting-a-cycle/).

## Cycle identity

`CYCLE_IDS.md` reserves every allocated cycle ID for as long as the runtime
remains installed. It is an append-only list, not a log of requests or workflow
history.

To allocate an ID:

1. Combine a request-based name with a fresh collision-resistant token, such as
   a UUID or timestamp plus random suffix.
2. Check the registry, existing output paths, and cycle markers for collisions.
3. Append the ID and save the registry.
4. Only then save that ID in `Active Work` and initialize the cycle.

If the registry write fails, the cycle cannot start. If a later initialization
step fails, the ID stays reserved. Never edit, remove, reorder, or reuse
entries.

Reinstall, upgrade, and explicit workflow reinitialization must preserve the
registry. If it is missing from an installed runtime, stop work that needs a new
ID and restore it; do not guess its history or recreate it empty. Intentional
runtime removal followed by fresh installation starts a new registry, but
existing files and cycle markers still need collision checks.

See the [registry rules](../protocol/#cycle-id-registry).

## Outstanding baseline reconciliation

`Active Work.BaselineReconciliation` tracks changes left by cancelled cycles
whose status Auditor still needs to establish. It is separate from
`Outstanding Obligations`, which tracks specific defects to fix.

Use `NONE` when no sources remain. Otherwise, each list entry records the
cancelled cycle's exact ID and request:

```markdown
`BaselineReconciliation`:

- `SourceCycle`: `invoice-cache-hotfix-20260923-a7f3` `Request`:
  `Change invoice-cache invalidation behavior.`
- `SourceCycle`: `admin-notes-20260924-b8e4` `Request`:
  `Add internal notes to admin records.`
```

Preserve the ordered list through handoffs, recovery, rework, and cancellation.
Append each new source once. Keep the full list until Auditor resolves every
source, then set it to `NONE`. A summary in the handoff cannot replace it.
Invalid entries block work that depends on the record.

See [when this check is needed](../../guides/cancelling-and-new-cycles/) and
[the exact format](../protocol/#baseline-reconciliation-format).

## Project context

Auditor writes `CONTEXT.md` with relevant existing behavior, tools, commands,
constraints, and evidence. Installation must preserve existing context and must
not invent audit results.

Expedited work can consult earlier context, but that does not make it current
for the new cycle. After promotion, Auditor distinguishes changes made during
the cycle from the project as it existed beforehand. See
[Auditor](../../roles/auditor/#promotion-and-cancellation-audits).

## Installation and client integration

`AGENTS.md` contains the framework's marked integration section alongside
project instructions. `CLAUDE.md` provides the Claude Code import. The installer
must preserve project-owned text and compatible existing settings.

`INSTALLATION.json` records only client-setting changes the installer actually
made. Reinstall, upgrade, and removal use it to avoid claiming or undoing your
own settings. A compatible setting that already existed remains yours. A missing
installation record must not be reconstructed by guessing.

Normal reinstall must preserve project mode, workflow state, and the cycle-ID
registry. Upgrades must keep the protocol and skills aligned without resetting
progress. The recorded framework version allows compatible minor and patch
upgrades within the same major line; downgrades and cross-major upgrades are
rejected. Missing required fields and conflicting settings require resolution,
not inferred defaults. See
[the installation contract](../protocol/#installed-runtime-contract).

## Plans, reports, and Navigator

The [template index](../artifact-templates/#output-locations) lists output paths
and file-preservation rules. Document contents stay in those files; state
records only the required references.

Navigator saves no report, quiz score, or workflow progress. It can explain
available project evidence without an active cycle or complete runtime. Missing
metadata limits what it can say about workflow status; it does not authorize
Navigator to initialize or repair anything. See
[Navigator's boundaries](../../roles/navigator/#what-stays-unchanged).
