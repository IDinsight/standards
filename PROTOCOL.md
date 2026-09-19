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

`.standards/STATE.md` is the authoritative, branch-persisted record of the current `WorkflowState` plus the minimum handoff and recovery context needed to resume work. It must be version-controlled so work can resume across sessions and, once state changes are shared through version control, by another agent or developer without relying on chat history.

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

`Handoff.Kind` is one of `INITIAL`, `FORWARD`, `FAILURE`, `RESUME`, `HUMAN_REWORK`, `NEW_CYCLE`, or `SIGNOFF`. Use `NONE` for fields that do not apply. Keep `Reason` concise; it exists to make the transition resumable, not to duplicate role-owned artifacts. Use `RESUME` for a recovery-only transition to an earlier completed or interrupted state when that edge is not a normal forward transition.

State changes follow these rules:

1. Installation initializes `STATE.md` from the selected mode template: `SCOPING` for `GREENFIELD` or `AUDITING` for `BROWNFIELD`, with `Handoff.Kind` set to `INITIAL` and recovery inactive.
2. Every legal forward handoff, failure handoff, recovery resume handoff, human rework handoff, new-cycle transition, or sign-off transition updates `STATE.md` as part of the handoff.
3. `NAVIGATOR` never changes `STATE.md`.
4. A failure handoff records `Kind: FAILURE`, the state that encountered the failure in `From`, the applicable `FailureType`, and a concise `Reason`.
5. When a failure handoff moves to a different state and no recovery is already active, set `Recovery.Active` to `true` and `Recovery.ResumeAt` to the state that encountered the failure. If recovery is already active, preserve its existing `ResumeAt` through nested failures and corrective handoffs.
6. While recovery is active, preserve the recovery block across subsequent state changes until the workflow returns to `ResumeAt`. If recovery requires moving to an earlier completed or interrupted state through an edge that is not a normal forward transition, record `Handoff.Kind: RESUME`. When `WorkflowState` becomes `ResumeAt` again, clear recovery to `Active: false` and `ResumeAt: NONE`.
7. Human-requested rework from `AWAITING_HUMAN_SIGNOFF` records `Kind: HUMAN_REWORK`, classifies the affected artifact with a `FailureType`, and starts recovery with `ResumeAt: AWAITING_HUMAN_SIGNOFF`.
8. `AWAITING_HUMAN_SIGNOFF` means the current cycle is pending a human decision. Explicit sign-off transitions the state to `SIGNED_OFF`; do not leave a signed-off cycle recorded as awaiting action.
9. `SIGNED_OFF` is terminal for the completed cycle. A new human-requested workflow cycle resets `STATE.md` to the initial state for the current `ProjectMode`, records `Kind: NEW_CYCLE`, and clears recovery.
10. During the initial greenfield cycle, the successful `SYNCHRONIZING -> AWAITING_HUMAN_SIGNOFF` handoff also changes `.standards/MODE.md` from `GREENFIELD` to `BROWNFIELD`. This mode transition is permanent.

`STATE.md` does not replace role-owned artifacts. Scope, architecture, project context, implementation, verification, review, and documentation remain authoritative in their own artifacts; the state file stores only enough transition context to resume the workflow safely.

`.standards/MODE.md` and `.standards/STATE.md` are protocol-owned coordination artifacts, not role-owned workflow artifacts. A role or human may change them only as required by a legal protocol transition. `.standards/PROTOCOL.md` is framework-owned and may be changed only by installing or upgrading the framework, not by a workflow role.

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
- REVIEW
- SYNCHRONIZATION
```

Failure types identify the owner of the defective artifact or decision:

| Failure type       | Owning role     |
|--------------------|-----------------|
| `SCOPING`          | `SCOPER`        |
| `ARCHITECTURE`     | `ARCHITECT`     |
| `PROJECT_CONTEXT`  | `AUDITOR`       |
| `IMPLEMENTATION`   | `DEVELOPER`     |
| `VERIFICATION`     | `TESTER`        |
| `DOCUMENTATION`    | `DOCUMENTER`    |
| `REVIEW`           | `REVIEWER`      |
| `SYNCHRONIZATION`  | `SYNCHRONIZER`  |

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

`ARCHITECTING -> DEVELOPING` in `BROWNFIELD` work requires valid project context for the active cycle. If required project context is missing, materially incomplete, incorrect, or unexpectedly invalidated, route to `AUDITING` instead. Planned implementation changes within the active cycle do not by themselves make project context stale.

## Failure Handoffs

A failure handoff changes workflow state to the owner of the defective artifact or decision.

```text
SCOPING failure         -> SCOPING
ARCHITECTURE failure    -> ARCHITECTING
PROJECT_CONTEXT failure -> AUDITING
IMPLEMENTATION failure  -> DEVELOPING
VERIFICATION failure    -> TESTING
DOCUMENTATION failure   -> DOCUMENTING
REVIEW failure          -> REVIEWING_IMPLEMENTATION or REVIEWING_FINAL, matching the affected review
SYNCHRONIZATION failure -> SYNCHRONIZING
```

After the owning role resolves the failure, resume at the earliest workflow state whose completed or interrupted work was invalidated by the correction. If no earlier completed state was invalidated, return to the state that originally encountered the failure. During recovery, use `Handoff.Kind: RESUME` for any transition to an earlier completed or interrupted state whose edge is not a normal forward transition. From that point, follow the legal forward transitions and rerun every required downstream completion gate.

Examples:

```text
Architecture defect discovered during testing:
TESTING -> ARCHITECTING -> DEVELOPING -> TESTING -> ...

Scoping defect discovered during implementation review:
REVIEWING_IMPLEMENTATION -> SCOPING -> ARCHITECTING -> DEVELOPING -> TESTING -> ...

Invalid project context discovered during architecture:
ARCHITECTING -> AUDITING
Then resume at SCOPING if the refreshed context invalidates scope,
or ARCHITECTING if scope remains valid.
```

## Handoff Rules

1. A forward handoff requires the current role's completion gate to pass.
2. A failure handoff does not require the current role to repair work it does not own.
3. A handoff must identify the target role or workflow state and, for failures, the `FailureType`. A `REVIEW` failure must target the Reviewer state corresponding to the affected `ReviewKind`.
4. A role must not silently change an artifact or decision owned by another role.
5. If resolving a failure invalidates previously completed downstream work, rerun the affected downstream states.
6. Human sign-off transitions `AWAITING_HUMAN_SIGNOFF -> SIGNED_OFF` and is terminal for the completed workflow cycle.
7. Human-requested rework from `AWAITING_HUMAN_SIGNOFF` remains part of the current cycle. Classify the requested rework by the affected artifact or decision, route to the corresponding owning state, and resume using the failure-recovery rules above.
8. A new cycle may begin only from `SIGNED_OFF`. Any further requested change after sign-off is additional work and begins at the initial state for the current `ProjectMode`. If the human wants the pending deliverable changed before sign-off, classify it as rework within the current cycle.
9. Every handoff that changes workflow state must update `.standards/STATE.md`, including its handoff and recovery fields, according to the persisted-state rules above.
10. `NAVIGATOR` may be invoked from any state but must not mutate artifacts or change workflow state.

## Human Decisions at Sign-off

When `STATE.md` is `AWAITING_HUMAN_SIGNOFF`, the workflow waits for an explicit human action:

- **Sign off:** transition `STATE.md` to `SIGNED_OFF`, record `Handoff.Kind: SIGNOFF`, set `From: AWAITING_HUMAN_SIGNOFF`, and clear recovery. The current workflow cycle is complete.
- **Request rework:** identify the affected artifact or decision, route to its owning workflow state, record `Handoff.Kind: HUMAN_REWORK` with the corresponding `FailureType`, and start recovery with `ResumeAt: AWAITING_HUMAN_SIGNOFF`. Rerun every downstream gate invalidated by the correction.

When `STATE.md` is `SIGNED_OFF`, there is no active workflow cycle. Further requested changes begin a new cycle at the initial state for the current `ProjectMode`, record `Handoff.Kind: NEW_CYCLE`, and clear recovery; they do not reopen the signed-off cycle.

While a cycle is still `AWAITING_HUMAN_SIGNOFF`, any requested change to the pending deliverable is rework. Additional work begins only after the current cycle is signed off.

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

Installation must preserve existing project-level agent instructions while keeping framework-owned files current. Installer behavior must be idempotent:

- If `AGENTS.md` does not exist, create it from `templates/common/AGENTS.md`.
- If `AGENTS.md` already exists, preserve all existing content and add the S.T.A.N.D.A.R.D.S. integration block if absent. If the block already exists, update only the content between `<!-- standards:start -->` and `<!-- standards:end -->`.
- If `CLAUDE.md` does not exist, create it from `templates/common/CLAUDE.md`.
- If `CLAUDE.md` already exists, preserve all existing content and ensure it imports `AGENTS.md` with `@AGENTS.md` exactly once.
- Replace or update `.standards/PROTOCOL.md` from the installed S.T.A.N.D.A.R.D.S. version during normal installation or upgrade. It is framework-owned and must not drift from the installed skills.
- Install or update the S.T.A.N.D.A.R.D.S. skill definitions for the selected coding agent during normal installation or upgrade.
- If `.standards/MODE.md` or `.standards/STATE.md` already exists, preserve it during normal reinstallation. Initialize these files only when S.T.A.N.D.A.R.D.S. is first installed or when the human explicitly requests reinitialization.
- If existing project-level agent instructions conflict with the S.T.A.N.D.A.R.D.S. integration block or installed protocol, preserve both and report the conflict for human resolution. Do not silently overwrite project instructions, weaken the protocol, or choose precedence automatically. Workflow work must not proceed under unresolved contradictory instructions.
- Re-running installation must not duplicate the integration block, duplicate the Claude import, reset workflow mode/state, or erase project-specific instructions.

Workflow artifacts such as scopes, technical designs, project context, tests, reviews, and documentation are created or updated by their owning roles when those phases run. Installation should not fabricate completed workflow artifacts.

## Canonical Terms

Use these terms consistently across all skills:

- **completed scope**: a scope artifact that has passed Scoper's completion gate. This does not imply separate human approval unless a project explicitly adds such a gate.
- **scope-level acceptance conditions**: observable outcomes owned by Scoper.
- **technical acceptance criteria**: technical conditions derived by Architect from scope-level acceptance conditions.
- **project context**: the Auditor-owned baseline of relevant project state and constraints for the active workflow cycle. Planned implementation changes within that cycle do not automatically make the baseline stale. A `PROJECT_CONTEXT` failure means project context is materially incomplete, incorrect, or unexpectedly invalidated and must be refreshed before dependent work continues.
- **completion gate**: the conditions that must be satisfied before a role may perform a forward handoff.
- **failure handoff**: routing a defect to the role that owns the affected artifact or decision.
- **forward handoff**: advancing to the next legal workflow state after the current completion gate succeeds.
- **resume handoff**: moving during active recovery to an earlier completed or interrupted state through an edge that is not a normal forward transition.

Do not introduce alternate names for these concepts inside individual skills unless this protocol is updated first.
