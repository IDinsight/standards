---
title: Runtime Files
description:
  Look up the files that store workflow rules, progress, and cycle records.
---

The installed STANDARDS files and settings are its **runtime**. Files under
`.standards/` hold the workflow rules, saved progress, and the cycle records in
`.standards/docs/`, such as plans and reports. Tests and project documentation
live elsewhere. The agent updates workflow records as it works; you do not need
to maintain them by hand. Editing them by hand is not supported, except to
resolve a merge conflict (see [Branches and merges](#branches-and-merges)). If
you edit them anyway, you are responsible for the result.

This page describes the required layout installed by the CLI. See
[Installation and Setup](../../getting-started/installation/).

## Files at a glance

| File                           | Purpose                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `.standards/bin/`              | Tools the agent runs; see [Runtime tools](#runtime-tools).                                         |
| `.standards/CONTEXT.md`        | Auditor's record of the existing project, created when an audit runs.                              |
| `.standards/docs/`             | Cycle records the roles create; see [Plans, reports, and Navigator](#plans-reports-and-navigator). |
| `.standards/INSTALLATION.json` | Client settings and paths created by the installer.                                                |
| `.standards/MODE.md`           | The project's greenfield or brownfield mode.                                                       |
| `.standards/PROTOCOL.md`       | Shared workflow rules, aligned with the installed skills.                                          |
| `.standards/STATE.md`          | Current workflow step, request, handoff, and recovery.                                             |
| `.standards/user-styles/`      | Optional personal styles you add for a role; see [User styles](#user-styles).                      |
| `.standards/VERSION.json`      | Installed framework version and upgrade compatibility check.                                       |

## Runtime tools

`.standards/bin/` contains small Node.js tools. Agents use them instead of doing
these steps by hand, and you can run them too:

| Command                                                   | What it does                                                                  |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `node .standards/bin/cycle.mjs new --request "<request>"` | Prints a new, unused cycle ID. It changes nothing.                            |
| `node .standards/bin/artifact.mjs init <TYPE>`            | Creates one of the active cycle's records at the right path, with its marker. |
| `node .standards/bin/id.mjs next <prefix> <file>`         | Prints the next free number in a record, such as `AC-004` or `F-002`.         |
| `node .standards/bin/check.mjs`                           | Checks the workflow files and the active cycle's records. It changes nothing. |

Each role runs `check` before it starts and before it hands off. It fixes
problems in its own work and passes others to the responsible role; if no role
can fix a problem, it stops and tells you. With the
[stop hook](../../getting-started/installation/#hooks) installed, the check also
runs when the agent finishes a turn. `check` finds mechanical problems, such as
a cycle ID not in the form `cycle.mjs` generates, a broken marker, or a
requirement that no finished report accounts for. It does not judge the quality
of the work. See the [tool rules](../protocol/#runtime-tools-and-hooks).

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
the agent checks the cycle mode and generates an ID. Document paths use `NONE`
until the responsible roles create the files. In expedited work, scope and
design paths stay `NONE` unless the cycle moves to the standard workflow.

After sign-off or retained cancellation, cycle mode returns to `UNSET` and
`Active Work` keeps the last cycle's record. A new request starts a new cycle.
See the [full state format](../protocol/#persisted-workflow-state) and
[Starting a Cycle](../../guides/starting-a-cycle/).

## Cycle identity

Every cycle gets a new ID. When a cycle starts, the agent runs
`node .standards/bin/cycle.mjs new --request "<request>"`. The tool builds an ID
from the request, the UTC time, and eight random hex digits, such as
`add-user-search-20260927T190146Z-7bef0f04`. It checks that no existing document
path or cycle marker uses the ID and prints it without changing any file. Only
then does the agent save the ID in `Active Work` and start the cycle. The tool
refuses while another cycle is active, or when `STATE.md` is invalid or has a
merge conflict. If a later setup step fails, the agent runs the tool again for
the next attempt; an unused ID needs no cleanup.

No one writes a cycle ID by hand or reuses one. `check` reports an
`Active Work.Id` that is not in the generated form, a `BaselineReconciliation`
source that is not a cycle ID, and an active cycle that uses the ID of a cycle
the last commit ended in `SIGNED_OFF` or `CANCELLED`. A finished cycle is never
reopened; new work gets a new ID. See the [ID rules](../protocol/#cycle-ids).

## Branches and merges

Commit `.standards/` like your other project files. `STATE.md` belongs to the
branch it is committed on, and each branch can carry one active cycle, so anyone
who checks out a branch continues its workflow where it was left.

- To start over on a branch, including one created from a branch with an active
  cycle, cancel the cycle or run
  [`standards reset`](../../getting-started/installation/#reset-the-workflow).
- Before merging a branch into your main branch, run `standards reset` on it.
  The main branch then keeps a fresh installation instead of one branch's
  workflow state, Auditor context, and cycle records, and every branch created
  from it starts with no cycle. The reset also chooses the project mode from the
  project's contents, so `MODE.md` stays accurate.

If you merge two branches that both changed `.standards/` without a reset, git
usually reports a merge conflict in `STATE.md`. Resolving it is your job, and it
is the one time you edit that file by hand: keep exactly one cycle. STANDARDS
stops tracking the other cycle. Its records under `.standards/docs/` stay, and
what to do with them is up to you.

If an agent finds unresolved conflict markers in `.standards/`, it stops and
asks you to resolve them; it never picks a side. See the
[merge rules](../protocol/#branches-and-merges).

## Outstanding baseline reconciliation

`Active Work.BaselineReconciliation` tracks changes left by cancelled cycles
whose status Auditor still needs to establish. It is separate from
`Outstanding Obligations`, which tracks specific defects to fix.

The agent records `NONE` when no cancelled cycles need checking. Otherwise, each
entry records a cancelled cycle's exact ID and request:

```markdown
`BaselineReconciliation`:

- `SourceCycle`: `change-invoice-cache-invalidation-20260923T141500Z-5d2e8b17`
  `Request`: `Change invoice-cache invalidation behavior.`
- `SourceCycle`: `add-internal-notes-to-admin-records-20260924T093000Z-c81f4a06`
  `Request`: `Add internal notes to admin records.`
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

## User styles

A user style is a Markdown file of your personal preferences for one role, such
as how you like docstrings or test names written. Add it at
`.standards/user-styles/<role>/<name>.md`, where `<role>` is the role's skill
name, such as `developer` or `tester`. STANDARDS ships none.

A role uses a style only when you name it, for example
`$documenter Use user style tony.` Both `tony` and `tony.md` select
`.standards/user-styles/documenter/tony.md`, and `NONE` selects no style. Only a
file directly inside the role's folder can be selected. The role never picks a
style because of who you are, which files exist, or what another role uses. If
your choice matches no file, it asks you to choose again.

A style covers discretionary choices only. The role's universal style guidance
comes first when it has one, then your style, then the role's other style files.
A style never overrides the protocol, role ownership, the agreed requirements
and design, the required shape of a record, project instructions,
repository-enforced tooling, or correctness.

Developer, Tester, Reviewer, Documenter, and Synchronizer save your choice as
`User Style` in their record and reload it when they resume. Scoper, Architect,
Auditor, and Navigator have no record for it, so the choice lasts for the
current chat; name it again when you resume. You can change or clear a choice at
any time, except that Developer locks its choice when you first approve its
plan.

Install and reset keep your styles. Uninstall deletes them with `.standards/`,
and its preview warns how many it will delete. See the
[style rules](../protocol/#user-styles).

## Installation and client integration

`AGENTS.md` contains the framework's marked section alongside project
instructions. `CLAUDE.md` lets Claude Code use those instructions. The installer
preserves project-owned text and compatible existing settings.

`INSTALLATION.json` records only client-setting changes and client paths the
installer actually created, and which files have the STANDARDS hook. Reinstall,
upgrade, and removal use it to avoid claiming or undoing your own settings or
paths. A compatible setting that already existed remains yours. If the record is
missing, the installer does not guess what it once changed.

With the hook on, the Claude Code stop hook is in `.claude/settings.json` and
the Codex stop hook in `.codex/hooks.json`. The installer recognizes its hook by
the script it runs, `.standards/bin/hook.mjs`, and never changes other hooks.

The installer keeps project mode, workflow state, cycle records, and user styles
during a reinstall. On upgrade, it updates the protocol, skills, and tools
together without resetting progress. It keeps files you added inside installed
skill folders, and it puts back settings and the hook it added if they were
changed or removed. It accepts newer minor and patch versions within the same
major version and rejects downgrades. There is no migration between major
versions: moving to one means uninstalling and installing again, which deletes
`.standards/`. If required information is missing or a setting it never added
conflicts, it reports the problem instead of guessing. See
[the installation contract](../protocol/#installed-runtime-contract).

`standards reset` deletes `CONTEXT.md` and `.standards/docs/`, writes a fresh
`STATE.md` and `MODE.md`, and keeps everything else installed. See
[Reset the workflow](../../getting-started/installation/#reset-the-workflow).

Uninstalling STANDARDS from a project deletes all of `.standards/`, including
context, every cycle record, and user styles; the preview warns how many records
and styles it will delete. It preserves project work outside the runtime and
installed skills, removes only managed instruction blocks and the STANDARDS
hook, and reverses only matching recorded settings. It removes recorded client
directories when they become empty and a recorded Claude settings file when only
its generated defaults remain. Unverified files or directories remain. See
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
