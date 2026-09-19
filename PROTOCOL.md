# S.T.A.N.D.A.R.D.S. Protocol

This file defines the canonical workflow vocabulary and state transitions for S.T.A.N.D.A.R.D.S.

`README.md` explains the framework at a high level. Individual skills define role behavior. This protocol defines the shared states, handoffs, and terms those skills must use consistently.

## Roles

```text
Role
- SCOPER
- TESTER
- ARCHITECT
- NAVIGATOR
- DEVELOPER
- AUDITOR
- REVIEWER
- DOCUMENTER
- SYNCHRONIZER
```

A role identifies who owns a decision or artifact. A role is not necessarily the same thing as a workflow state.

`NAVIGATOR` is strictly non-mutating and sits outside the workflow state machine. Invoking Navigator does not change the current workflow state.

## Project Modes

```text
ProjectMode
- GREENFIELD
- BROWNFIELD
```

- `GREENFIELD`: bootstrap mode for a project's initial workflow cycle when no existing implementation must first be audited.
- `BROWNFIELD`: normal operating mode once a project has an implementation; work modifies, extends, repairs, or depends on that implementation.

`GREENFIELD` is temporary. When the initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`, the project must transition permanently to `BROWNFIELD`. Future workflow cycles begin as brownfield work.

The initial workflow state for a new cycle is determined by project mode:

- `GREENFIELD` starts in `SCOPING`.
- `BROWNFIELD` starts in `AUDITING`.

For `GREENFIELD` work before `AUDITING`, the absence of Auditor-produced project context is intentional. Do not classify that absence as a `PROJECT_CONTEXT` failure unless the active role actually requires context that cannot be established from the completed upstream artifacts and known project constraints.

## Workflow States

```text
WorkflowState
- SCOPING
- ARCHITECTING
- AUDITING
- DEVELOPING
- TESTING
- REVIEWING_IMPLEMENTATION
- DOCUMENTING
- REVIEWING_FINAL
- SYNCHRONIZING
- AWAITING_HUMAN_SIGNOFF
- SIGNED_OFF
```

`.standards/STATE.md` records exactly one `WorkflowState` value at a time. `SIGNED_OFF` is a terminal state and means there is no active workflow cycle.

## Persisted Workflow State

`.standards/STATE.md` is the authoritative, branch-persisted record of the current `WorkflowState` plus the minimum handoff and recovery context needed to resume work. It must be version-controlled so another session, agent, or developer can pull the branch and continue without relying on chat history.

Before performing workflow work, read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and `.standards/STATE.md`. Resume from the state and handoff context recorded in `STATE.md`; do not infer a different state from chat history or from which artifacts happen to exist.

`STATE.md` uses this shape:

```markdown
# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING`

## Handoff
`Kind`: `FAILURE`
`From`: `TESTING`
`FailureType`: `ARCHITECTURE`
`Reason`: `Retry behavior is not defined by the current technical design.`

## Recovery
`Active`: `true`
`ResumeAt`: `TESTING`
```

`Handoff.Kind` is one of `INITIAL`, `FORWARD`, `FAILURE`, `HUMAN_REWORK`, `NEW_CYCLE`, or `SIGNOFF`. Use `NONE` for fields that do not apply. Keep `Reason` concise; it exists to make the transition resumable, not to duplicate role-owned artifacts.

State changes follow these rules:

1. Installation initializes `STATE.md` from the selected mode template: `SCOPING` for `GREENFIELD` or `AUDITING` for `BROWNFIELD`, with `Handoff.Kind` set to `INITIAL` and recovery inactive.
2. Every legal forward handoff, failure handoff, human rework handoff, new-cycle transition, or sign-off transition updates `STATE.md` as part of the handoff.
3. `NAVIGATOR` never changes `STATE.md`.
4. A failure handoff records `Kind: FAILURE`, the state that encountered the failure in `From`, the applicable `FailureType`, and a concise `Reason`.
5. When a failure handoff moves to a different state and no recovery is already active, set `Recovery.Active` to `true` and `Recovery.ResumeAt` to the state that encountered the failure. If recovery is already active, preserve its existing `ResumeAt` through nested failures and corrective handoffs.
6. While recovery is active, preserve the recovery block across subsequent state changes until the workflow returns to `ResumeAt`. When `WorkflowState` becomes `ResumeAt` again, clear recovery to `Active: false` and `ResumeAt: NONE`.
7. Human-requested rework from `AWAITING_HUMAN_SIGNOFF` records `Kind: HUMAN_REWORK`, classifies the affected artifact with a `FailureType`, and starts recovery with `ResumeAt: AWAITING_HUMAN_SIGNOFF`.
8. `AWAITING_HUMAN_SIGNOFF` means the current cycle is pending a human decision. Explicit sign-off transitions the state to `SIGNED_OFF`; do not leave a signed-off cycle recorded as awaiting action.
9. `SIGNED_OFF` is terminal for the completed cycle. A new human-requested workflow cycle resets `STATE.md` to the initial state for the current `ProjectMode`, records `Kind: NEW_CYCLE`, and clears recovery.
10. During the initial greenfield cycle, the successful `SYNCHRONIZING -> AWAITING_HUMAN_SIGNOFF` handoff also changes `.standards/MODE.md` from `GREENFIELD` to `BROWNFIELD`. This mode transition is permanent.

`STATE.md` does not replace role-owned artifacts. Scope, architecture, project context, implementation, verification, review, and documentation remain authoritative in their own artifacts; the state file stores only enough transition context to resume the workflow safely.

The owning role for each state is:

| Workflow state             | Owning role      |
|----------------------------|------------------|
| `SCOPING`                  | `SCOPER`         |
| `ARCHITECTING`             | `ARCHITECT`      |
| `AUDITING`                 | `AUDITOR`        |
| `DEVELOPING`               | `DEVELOPER`      |
| `TESTING`                  | `TESTER`         |
| `REVIEWING_IMPLEMENTATION` | `REVIEWER`       |
| `DOCUMENTING`              | `DOCUMENTER`     |
| `REVIEWING_FINAL`          | `REVIEWER`       |
| `SYNCHRONIZING`            | `SYNCHRONIZER`   |
| `AWAITING_HUMAN_SIGNOFF`   | Human            |
| `SIGNED_OFF`               | Human (terminal) |

## Review Kinds

```text
ReviewKind
- IMPLEMENTATION
- FINAL_DELIVERABLE
```

`REVIEWER` owns two distinct workflow states:

- `IMPLEMENTATION` corresponds to `REVIEWING_IMPLEMENTATION`.
- `FINAL_DELIVERABLE` corresponds to `REVIEWING_FINAL`.

A review handoff must identify which review kind is being requested.

## Failure Types

```text
FailureType
- SCOPING
- ARCHITECTURE
- PROJECT_CONTEXT
- IMPLEMENTATION
- VERIFICATION
- DOCUMENTATION
```

Failure types identify the owner of the defective artifact or decision:

| Failure type      | Owning role  |
|-------------------|--------------|
| `SCOPING`         | `SCOPER`     |
| `ARCHITECTURE`    | `ARCHITECT`  |
| `PROJECT_CONTEXT` | `AUDITOR`    |
| `IMPLEMENTATION`  | `DEVELOPER`  |
| `VERIFICATION`    | `TESTER`     |
| `DOCUMENTATION`   | `DOCUMENTER` |

The role that discovers a failure does not automatically own the fix. Route the failure to its owning role.

## Forward Transitions

A forward transition occurs only after the current state's completion gate succeeds.

### Greenfield

```text
SCOPING
-> ARCHITECTING
-> AUDITING
-> DEVELOPING
-> TESTING
-> REVIEWING_IMPLEMENTATION
-> DOCUMENTING
-> REVIEWING_FINAL
-> SYNCHRONIZING
-> AWAITING_HUMAN_SIGNOFF
```

### Brownfield

```text
AUDITING
-> SCOPING
-> ARCHITECTING
-> DEVELOPING
-> TESTING
-> REVIEWING_IMPLEMENTATION
-> DOCUMENTING
-> REVIEWING_FINAL
-> SYNCHRONIZING
-> AWAITING_HUMAN_SIGNOFF
```

`ARCHITECTING -> DEVELOPING` in `BROWNFIELD` work requires current project context. If required project context is missing or stale, route to `AUDITING` instead.

## Failure Handoffs

A failure handoff changes workflow state to the owner of the defective artifact or decision.

```text
SCOPING failure         -> SCOPING
ARCHITECTURE failure    -> ARCHITECTING
PROJECT_CONTEXT failure -> AUDITING
IMPLEMENTATION failure  -> DEVELOPING
VERIFICATION failure    -> TESTING
DOCUMENTATION failure   -> DOCUMENTING
```

After the owning role resolves the failure, resume at the earliest workflow state whose completed or interrupted work was invalidated by the correction. If no earlier completed state was invalidated, return to the state that originally encountered the failure. From that point, follow the legal forward transitions and rerun every required downstream completion gate.

Examples:

```text
Architecture defect discovered during testing:
TESTING -> ARCHITECTING -> DEVELOPING -> TESTING -> ...

Scoping defect discovered during implementation review:
REVIEWING_IMPLEMENTATION -> SCOPING -> ARCHITECTING -> DEVELOPING -> TESTING -> ...

Stale project context discovered during architecture:
ARCHITECTING -> AUDITING
Then resume at SCOPING if the refreshed context invalidates scope,
or ARCHITECTING if scope remains valid.
```

## Handoff Rules

1. A forward handoff requires the current role's completion gate to pass.
2. A failure handoff does not require the current role to repair work it does not own.
3. A handoff must identify the target role or workflow state and, for failures, the `FailureType`.
4. A role must not silently change an artifact or decision owned by another role.
5. If resolving a failure invalidates previously completed downstream work, rerun the affected downstream states.
6. Human sign-off transitions `AWAITING_HUMAN_SIGNOFF -> SIGNED_OFF` and is terminal for the completed workflow cycle.
7. Human-requested rework from `AWAITING_HUMAN_SIGNOFF` remains part of the current cycle. Classify the requested rework by the affected artifact or decision, route to the corresponding owning state, and resume using the failure-recovery rules above.
8. Human-requested additional work begins a new cycle at the initial state for the current `ProjectMode`. After `SIGNED_OFF`, any further requested change is additional work and therefore begins a new cycle.
9. Every handoff that changes workflow state must update `.standards/STATE.md`, including its handoff and recovery fields, according to the persisted-state rules above.
10. `NAVIGATOR` may be invoked from any state but must not mutate artifacts or change workflow state.

## Human Decisions at Sign-off

When `STATE.md` is `AWAITING_HUMAN_SIGNOFF`, the workflow waits for an explicit human action:

- **Sign off:** transition `STATE.md` to `SIGNED_OFF`, record `Handoff.Kind: SIGNOFF`, set `From: AWAITING_HUMAN_SIGNOFF`, and clear recovery. The current workflow cycle is complete.
- **Request rework:** identify the affected artifact or decision, route to its owning workflow state, record `Handoff.Kind: HUMAN_REWORK` with the corresponding `FailureType`, and start recovery with `ResumeAt: AWAITING_HUMAN_SIGNOFF`. Rerun every downstream gate invalidated by the correction.
- **Start additional work:** begin a new workflow cycle, reset `STATE.md` to the initial state for the current `ProjectMode`, record `Handoff.Kind: NEW_CYCLE`, and clear recovery.

When `STATE.md` is `SIGNED_OFF`, there is no active workflow cycle. Further requested changes begin a new cycle; they do not reopen the signed-off cycle.

Do not treat additional work as rework merely because it is requested at sign-off. Rework corrects or revises the current cycle's pending deliverable; additional work starts a new cycle.

## Installed Runtime Contract

An installed S.T.A.N.D.A.R.D.S. project should provide:

- `AGENTS.md`: the project-facing entrypoint that tells coding agents to follow the installed protocol and role skills;
- `CLAUDE.md`: a Claude Code compatibility entrypoint that imports `AGENTS.md`;
- `.standards/PROTOCOL.md`: the installed copy of this canonical protocol;
- `.standards/MODE.md`: the project's current `ProjectMode`;
- `.standards/STATE.md`: the branch-persisted active `WorkflowState` plus resumable handoff/recovery context;
- the S.T.A.N.D.A.R.D.S. skills installed in the location required by the selected coding agent.

`.standards/MODE.md` must identify exactly one canonical `ProjectMode`. A project installed as `GREENFIELD` must change this file permanently to `BROWNFIELD` when its initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`.

`.standards/STATE.md` must identify exactly one canonical `WorkflowState` and follow the persisted handoff/recovery shape defined above. Installation initializes it from `ProjectMode`, and every legal state transition updates it as defined above.


### Installer File Preservation

Installation must preserve existing project-level agent instructions. Installer behavior must be idempotent:

- If `AGENTS.md` does not exist, create it from `templates/common/AGENTS.md`.
- If `AGENTS.md` already exists, preserve all existing content and add the S.T.A.N.D.A.R.D.S. integration block if absent. If the block already exists, update only the content between `<!-- standards:start -->` and `<!-- standards:end -->`.
- If `CLAUDE.md` does not exist, create it from `templates/common/CLAUDE.md`.
- If `CLAUDE.md` already exists, preserve all existing content and ensure it imports `AGENTS.md` with `@AGENTS.md` exactly once.
- If `.standards/MODE.md` or `.standards/STATE.md` already exists, preserve it during normal reinstallation. Initialize these files only when S.T.A.N.D.A.R.D.S. is first installed or when the human explicitly requests reinitialization.
- Re-running installation must not duplicate the integration block, duplicate the Claude import, reset workflow mode/state, or erase project-specific instructions.

Workflow artifacts such as scopes, technical designs, project context, tests, reviews, and documentation are created or updated by their owning roles when those phases run. Installation should not fabricate completed workflow artifacts.

## Canonical Terms

Use these terms consistently across all skills:

- **completed scope**: a scope artifact that has passed Scoper's completion gate. This does not imply separate human approval unless a project explicitly adds such a gate.
- **scope-level acceptance conditions**: observable outcomes owned by Scoper.
- **technical acceptance criteria**: technical conditions derived by Architect from scope-level acceptance conditions.
- **project context**: the Auditor-owned representation of the project's current relevant state.
- **completion gate**: the conditions that must be satisfied before a role may perform a forward handoff.
- **failure handoff**: routing a defect to the role that owns the affected artifact or decision.
- **forward handoff**: advancing to the next legal workflow state after the current completion gate succeeds.

Do not introduce alternate names for these concepts inside individual skills unless this protocol is updated first.
