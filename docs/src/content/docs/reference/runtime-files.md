---
title: Runtime Files
description:
  Look up the files that store workflow rules, progress, and cycle IDs.
---

The installed STANDARDS files and settings are its **runtime**. Files under
`.standards/` hold the workflow rules and saved progress. Plans, reports, tests,
and project documentation live elsewhere. The agent updates workflow records as
it works; you do not need to maintain them by hand.

This page describes the required layout installed by the CLI. See
[Installation and Setup](../../getting-started/installation/).

## Files at a glance

| File                           | Purpose                                                               |
| ------------------------------ | --------------------------------------------------------------------- |
| `.standards/CONTEXT.md`        | Auditor's record of the existing project, created when an audit runs. |
| `.standards/CYCLE_IDS.md`      | Reserved cycle IDs; entries cannot be reused.                         |
| `.standards/INSTALLATION.json` | Client settings and paths created by the installer.                   |
| `.standards/MODE.md`           | The project's greenfield or brownfield mode.                          |
| `.standards/PROTOCOL.md`       | Shared workflow rules, aligned with the installed skills.             |
| `.standards/STATE.md`          | Current workflow step, request, handoff, and recovery.                |
| `.standards/VERSION.json`      | Installed framework version and upgrade compatibility check.          |

## Workflow state

`STATE.md` is saved with the project so another chat can resume from the
recorded work instead of relying on chat history.

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

On installation, the ID and request are `UNSET`. Before workflow work begins,
the agent checks the cycle mode and reserves an ID. Document paths use `NONE`
until the responsible roles create the files. In expedited work, scope and
design paths stay `NONE` unless the cycle moves to the standard workflow.

After sign-off or retained cancellation, cycle mode returns to `UNSET` and
`Active Work` keeps the last cycle's record. A new request starts a new cycle.
See the [full state format](../protocol/#persisted-workflow-state) and
[Starting a Cycle](../../guides/starting-a-cycle/).

## Cycle identity

`CYCLE_IDS.md` reserves every cycle ID for as long as STANDARDS remains
installed. It is a list of IDs, not a history of requests or completed work.

When a cycle starts, the agent:

1. Combines a name based on the request with a fresh, hard-to-duplicate suffix,
   such as a UUID or timestamp plus random characters.
2. Checks the ID list, existing document paths, and cycle markers to make sure
   the ID is unused.
3. Adds the ID to the list and saves it.
4. Only then saves that ID in `Active Work` and starts the cycle.

If saving the ID fails, the agent cannot start the cycle. If a later setup step
fails, the ID stays reserved. The agent must not edit, remove, reorder, or reuse
an existing entry.

The installer preserves this list during reinstall or upgrade. A workflow reset
within the same installation also keeps it. If the list is missing, the agent
stops work that needs a new ID and reports the problem; it cannot safely guess
the missing IDs or start an empty list. Removing STANDARDS and installing it
again starts a new list, but the agent still checks existing files for ID
collisions.

See the [registry rules](../protocol/#cycle-id-registry).

## Outstanding baseline reconciliation

`Active Work.BaselineReconciliation` tracks changes left by cancelled cycles
whose status Auditor still needs to establish. It is separate from
`Outstanding Obligations`, which tracks specific defects to fix.

The agent records `NONE` when no cancelled cycles need checking. Otherwise, each
entry records a cancelled cycle's exact ID and request:

```markdown
`BaselineReconciliation`:

- `SourceCycle`: `invoice-cache-hotfix-20260923-a7f3` `Request`:
  `Change invoice-cache invalidation behavior.`
- `SourceCycle`: `admin-notes-20260924-b8e4` `Request`:
  `Add internal notes to admin records.`
```

The agent keeps the list through handoffs, corrections, rework, and
cancellation, adding each new cycle once. Auditor sets it to `NONE` after
checking every listed cycle. A handoff summary cannot replace the list. Invalid
entries block work that depends on it.

See [when this check is needed](../../guides/cancelling-and-new-cycles/) and
[the exact format](../protocol/#baseline-reconciliation-format).

## Project context

Auditor writes `CONTEXT.md` with relevant existing behavior, tools, commands,
constraints, and evidence. The installer preserves existing context and does not
invent audit results.

Expedited work can consult earlier context, but that does not make it current
for the new cycle. After promotion, Auditor distinguishes changes made during
the cycle from the project as it existed beforehand. See
[Auditor](../../roles/auditor/#promotion-and-cancellation-audits).

## Installation and client integration

`AGENTS.md` contains the framework's marked section alongside project
instructions. `CLAUDE.md` lets Claude Code use those instructions. The installer
preserves project-owned text and compatible existing settings.

`INSTALLATION.json` records only client-setting changes and client paths the
installer actually created. Reinstall, upgrade, and removal use it to avoid
claiming or undoing your own settings or paths. A compatible setting that
already existed remains yours. If the record is missing, the installer does not
guess what it once changed.

The installer keeps project mode, workflow state, and the cycle-ID list during a
reinstall. On upgrade, it updates the protocol and skills together without
resetting progress. It accepts newer minor and patch versions within the same
major version, but rejects downgrades and major-version changes. If required
information is missing or settings conflict, it reports the problem instead of
guessing. See
[the installation contract](../protocol/#installed-runtime-contract).

Uninstalling STANDARDS from a project deletes all of `.standards/`, including
context and cycle-ID history. It preserves project work outside the runtime and
installed skills, removes only managed instruction blocks, and reverses only
matching recorded settings. It removes recorded client directories when they
become empty and a recorded Claude settings file when only its generated
defaults remain. Unverified files or directories remain. See
[Uninstall from a project](../../getting-started/installation/#uninstall-from-a-project)
for the preview and approval steps.

## Plans, reports, and Navigator

The [template index](../artifact-templates/#output-locations) lists output paths
and file-preservation rules. Document contents stay in those files; state
records only the required references.

Navigator saves no report, quiz score, or workflow progress. It can explain
available project evidence without an active cycle or complete runtime. Missing
metadata limits what it can say about workflow status; it does not authorize
Navigator to initialize or repair anything. See
[Navigator's boundaries](../../roles/navigator/#what-stays-unchanged).
