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

A role identifies who owns a decision or artifact. A role is not necessarily the same thing as a workflow state. Workflow role skills are invoked explicitly by the human; `WorkflowState` determines whether an invocation may act, but does not auto-dispatch a skill. Client-specific installation controls must prevent model-initiated invocation of workflow role skills where the client supports that distinction.

`NAVIGATOR` is strictly non-mutating and sits outside the workflow state machine. Invoking Navigator does not change the current workflow state.

## Project Modes

```text
ProjectMode
- GREENFIELD
- BROWNFIELD
```

- `GREENFIELD`: bootstrap mode for a project's initial workflow cycle when no existing implementation must first be audited.
- `BROWNFIELD`: normal operating mode once a project has an implementation; work modifies, extends, repairs, or depends on that implementation.

`GREENFIELD` is temporary. When the initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`, the project must transition permanently to `BROWNFIELD`. If a greenfield cycle is cancelled before `DEVELOPING` begins, treat the cancellation as abandonment of the bootstrap: remove the S.T.A.N.D.A.R.D.S. runtime and cycle artifacts as defined under **Greenfield Bootstrap Cancellation**, and require a fresh installation before future workflow work. If cancellation occurs from `DEVELOPING` or any later nonterminal state, transition permanently to `BROWNFIELD` before entering `CANCELLED`, because future work can no longer assume there is no implementation to audit. Future workflow cycles then begin as brownfield work.

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
- CANCELLED
```

`.standards/STATE.md` records exactly one `WorkflowState` value at a time. `SIGNED_OFF` and `CANCELLED` are terminal states and mean there is no active workflow cycle.

## Persisted Workflow State

`.standards/STATE.md` is the authoritative, branch-persisted record of the current `WorkflowState`, active work, latest handoff, blocking human question, and recovery context needed to resume work. It must be version-controlled so work can resume across sessions and, once state changes are shared through version control, by another agent or developer without relying on chat history.

Before performing workflow work, read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and `.standards/STATE.md`. Resume from the state, active work, handoff, and recovery context recorded in `STATE.md`; do not infer a different state from chat history or from which artifacts happen to exist.

`STATE.md` uses this shape:

```markdown
# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING`

## Active Work
`Id`: `add-user-search`
`Request`: `Add user search by name and email.`
`Scope`: `docs/scope/add-user-search.md`
`Architecture`: `docs/specs/add-user-search.md`
`BlockedOn`: `NONE`

## Handoff
`Kind`: `FAILURE`
`From`: `TESTING`
`FailureType`: `ARCHITECTURE`
`Reason`: `Retry behavior is not defined by the current technical design.`

## Recovery
`Active`: `true`

### Frame 1
`From`: `TESTING`
`Owner`: `ARCHITECTING`
`FailureType`: `ARCHITECTURE`
`Reason`: `Retry behavior is not defined by the current technical design.`
`ResumeAt`: `TESTING`
```

`Active Work` identifies the current cycle independently of chat history. `Id` is a stable, human-readable identifier for the cycle. `Request` records the requested change at enough fidelity for the initial role to understand the work. `Scope` and `Architecture` are repository-relative artifact paths. Use `NONE` before the owning role creates the artifact; Scoper and Architect must replace those values with persisted artifact paths before their normal completion gates pass. `BlockedOn` records an unresolved human question that prevents the active role from completing; otherwise use `NONE`.

Installation may initialize `Id` and `Request` as `UNSET` because the installer may not know the first request. Before the first workflow role performs substantive work, persist the human's request in `Active Work` and replace `UNSET` with a stable `Id` and request text. Every later new-cycle transition must initialize `Active Work` from the new human request as part of the transition.

`Handoff.Kind` is one of `INITIAL`, `FORWARD`, `FAILURE`, `RESUME`, `HUMAN_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL`. Use `NONE` for fields that do not apply. Keep `Reason` concise; it describes only the most recent transition and is not the authoritative record of outstanding recovery work. Use `RESUME` for a recovery-only transition to an earlier completed or interrupted state when that edge is not a normal forward transition.

`Recovery` is a stack. Frames are ordered oldest to newest; the last frame is the active frame. A frame preserves one outstanding corrective obligation even when another failure occurs during recovery. A workflow role owns the active recovery frame only when the current `WorkflowState` equals that frame's `Owner`. Recovery being active does not, by itself, make every role that runs during the recovery path responsible for resolving or resuming that frame.

State changes follow these rules:

1. Installation initializes `STATE.md` from the selected mode template: `SCOPING` for `GREENFIELD` or `AUDITING` for `BROWNFIELD`, with `Handoff.Kind` set to `INITIAL`, `Active Work` unset, and recovery inactive.
2. Before substantive work begins on an initialized cycle, record the human request in `Active Work`. Every legal forward handoff, failure handoff, recovery resume handoff, human rework handoff, new-cycle transition, cancellation, or sign-off transition updates `STATE.md` as part of the handoff.
3. `NAVIGATOR` never changes `STATE.md`.
4. A failure handoff records `Kind: FAILURE`, the state that encountered the failure in `From`, the applicable `FailureType`, and a concise `Reason`. If it moves to a different state, push a recovery frame containing `From`, the owning target state in `Owner`, `FailureType`, `Reason`, and `ResumeAt` equal to the state that encountered the failure. A same-state failure does not require a new recovery frame.
5. Nested failures push additional recovery frames instead of replacing existing ones. Never overwrite or discard older frames merely because a newer corrective handoff occurs.
6. While recovery is active, preserve all frames across subsequent state changes. Only the role whose current `WorkflowState` equals the active frame's `Owner` applies that frame's correction-and-resume logic. After that owner resolves its defect, resume at the earliest completed or interrupted state invalidated by the correction; if none was invalidated, return to that frame's `ResumeAt`. A different role encountered while the frame remains active is a downstream rerun: it performs its normal completion gate and normal legal forward handoff, preserves the recovery stack unchanged, and must not independently jump to the frame's `ResumeAt`. Use `Handoff.Kind: RESUME` when the owner must transition to an earlier completed or interrupted state and that edge is not a normal forward transition. When `WorkflowState` reaches the active frame's `ResumeAt`, pop that frame. Recovery becomes inactive only when the stack is empty.
7. A blocking human question does not change workflow state. Record it in `Active Work.BlockedOn` before asking, and clear `BlockedOn` when the answer is incorporated.
8. Human-requested changes to an active cycle use `Handoff.Kind: HUMAN_REWORK`. Update `Active Work.Request` when the request itself changed, classify the affected artifact or decision with a `FailureType`, route to the earliest owning state invalidated by the change, and if that route moves to a different state, push a recovery frame whose `ResumeAt` is the state interrupted by the human change. Existing recovery frames remain intact.
9. A human may cancel an active cycle from any nonterminal state. If `ProjectMode` is `GREENFIELD` and cancellation occurs before `DEVELOPING` begins, follow **Greenfield Bootstrap Cancellation** instead of retaining a terminal `CANCELLED` installation. Otherwise transition to `CANCELLED`, record `Handoff.Kind: CANCEL`, preserve `Active Work` for traceability, and clear the recovery stack. If `ProjectMode` is `GREENFIELD` and cancellation occurs from `DEVELOPING` or any later nonterminal state, first change `.standards/MODE.md` permanently to `BROWNFIELD`.
10. `AWAITING_HUMAN_SIGNOFF` means the current cycle is pending a human decision. Explicit sign-off transitions the state to `SIGNED_OFF`; do not leave a signed-off cycle recorded as awaiting action.
11. `SIGNED_OFF` and retained `CANCELLED` states are terminal for their cycles. A new human-requested workflow cycle from either retained terminal state resets `STATE.md` to the initial state for the current `ProjectMode`, records `Kind: NEW_CYCLE`, initializes `Active Work.Id` and `Active Work.Request` from the new request, resets `Scope` and `Architecture` to `NONE` and `BlockedOn` to `NONE`, and clears recovery. A greenfield bootstrap cancellation before `DEVELOPING` is not retained as a reusable terminal installation; future workflow work starts with a fresh installation instead.
12. During the initial greenfield cycle, the successful `SYNCHRONIZING -> AWAITING_HUMAN_SIGNOFF` handoff also changes `.standards/MODE.md` from `GREENFIELD` to `BROWNFIELD`. This mode transition is permanent. A greenfield cancellation before `DEVELOPING` removes the bootstrap installation under **Greenfield Bootstrap Cancellation**; cancellation from `DEVELOPING` or later follows rule 9 and permanently changes the project to `BROWNFIELD`.

`STATE.md` does not replace role-owned artifacts. Scope, architecture, project context, implementation, verification, review, and documentation remain authoritative in their own artifacts; the state file stores only enough transition context to resume the workflow safely.

`.standards/CONTEXT.md` is the canonical Auditor-owned project-context artifact. Auditor creates or refreshes it when `AUDITING` runs; installation does not fabricate it. Downstream roles should treat it as the active-cycle baseline when present, subject to the ownership and freshness rules below. `ProjectMode: GREENFIELD` means the project is still in its bootstrap lifecycle; it does not mean project context must be absent. Initial greenfield Scoping and Architecture may legitimately run before the first audit, but any later rerun of Scoping or Architecture must read and use an existing `CONTEXT.md` when relevant instead of ignoring it solely because the project is still `GREENFIELD`.

`.standards/MODE.md` and `.standards/STATE.md` are protocol-owned coordination artifacts, not role-owned workflow artifacts. A role or human may change them only as required by a legal protocol transition or by a protocol-required coordination update such as initializing `Active Work`, recording an artifact path, or setting or clearing `BlockedOn`. `.standards/PROTOCOL.md` is framework-owned and may be changed only by installing or upgrading the framework, not by a workflow role.

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
| `CANCELLED`                | Human (terminal) |

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

When the current state is the active recovery frame's `Owner`, the owning role resolves that failure and then uses the frame to resume at the earliest workflow state whose completed or interrupted work was invalidated by the correction. If no earlier completed state was invalidated, return to that frame's `ResumeAt`. Keep the frame on the stack while rerunning invalidated downstream states; pop it only when workflow state reaches its `ResumeAt`. Older frames remain intact beneath it. Roles encountered after the owner has handed off are downstream reruns, not owners of that frame: they follow their normal completion gates and legal forward transitions while preserving the frame. During recovery, use `Handoff.Kind: RESUME` for any owner transition to an earlier completed or interrupted state whose edge is not a normal forward transition.

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

Nested recovery:
TESTING -> ARCHITECTING                 # push architecture frame, ResumeAt TESTING
ARCHITECTING -> AUDITING                # push project-context frame, ResumeAt ARCHITECTING
AUDITING -> ARCHITECTING                # project-context frame reaches ResumeAt and is popped
ARCHITECTING -> DEVELOPING -> TESTING   # architecture frame reaches ResumeAt and is popped
```

## Commit Message Guidance

After completing role work, if the role produced a meaningful set of repository changes suitable for one atomic commit, provide the human with a suggested Git commit message. Do not create the commit unless the human explicitly requests it. Routine coordination-only changes such as advancing `.standards/STATE.md` do not, by themselves, justify a commit suggestion.

Suggested messages must follow Conventional Commits:

```text
<type>(<optional-scope>): <description>
```

Choose the type and optional scope from the actual repository changes, not from the workflow state or role name. Common types include `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, and `chore`. Keep the description concise, imperative, and specific. Use breaking-change syntax or footers only when the change is actually breaking.

Examples:

```text
docs(scope): define user search requirements
docs(architecture): define user search contracts
chore(context): capture authentication project baseline
feat(search): implement user search
test(search): cover user search behavior
docs(search): document user search
fix(search): address implementation review findings
```

`NAVIGATOR` never provides a commit suggestion because it is strictly non-mutating. Other roles provide one only when their work produced meaningful committable changes; a role that produced no such changes omits it. If both a commit suggestion and a next-role invocation are emitted, present the commit suggestion first.

## Handoff Rules

1. A forward handoff requires the current role's completion gate to pass.
2. A failure handoff does not require the current role to repair work it does not own.
3. A handoff must identify the target role or workflow state and, for failures, the `FailureType`. A `REVIEW` failure must target the Reviewer state corresponding to the affected `ReviewKind`.
4. A role must not silently change an artifact or decision owned by another role.
5. If resolving a failure invalidates previously completed downstream work, rerun the affected downstream states.
6. Human sign-off transitions `AWAITING_HUMAN_SIGNOFF -> SIGNED_OFF` and is terminal for the completed workflow cycle.
7. Human-requested changes while a cycle is active are `HUMAN_REWORK`, regardless of the current nonterminal state. Route them to the earliest owning state invalidated by the change and use the recovery-stack rules above.
8. A human may cancel an active cycle from any nonterminal state. A greenfield cancellation before `DEVELOPING` follows the bootstrap-reset exception below; all other cancellations transition to terminal `CANCELLED`.
9. A new cycle may begin from `SIGNED_OFF` or a retained `CANCELLED` state. It starts at the initial state for the current `ProjectMode` with new `Active Work` and an empty recovery stack. After a pre-`DEVELOPING` greenfield bootstrap cancellation, future work requires a fresh S.T.A.N.D.A.R.D.S. installation instead.
10. Every handoff that changes workflow state must update `.standards/STATE.md`, including its active-work, handoff, and recovery fields, according to the persisted-state rules above.
11. After a legal handoff changes workflow state to a state owned by a different workflow role, the role performing the handoff must provide the human with a concise copy/paste invocation for the next role. Persist the state change before presenting the message. The message is convenience only; `.standards/STATE.md` and role-owned artifacts remain authoritative.
12. A role handoff message should identify the next role and invoke its explicit skill using the active coding client's syntax, while directing it to resume from `.standards/STATE.md`. Do not duplicate scope, architecture, recovery reasons, or other authoritative workflow content into the message unless needed to disambiguate the invocation. Use `$<skill>` in Codex and `/<skill>` in Claude Code. Use the current state to choose one of these forms:

```text
Next role: <Role>

Codex:          $<skill> Continue the active workflow from `.standards/STATE.md`. Read the persisted Active Work, relevant project context and owned artifacts, and recovery context before proceeding.
Claude Code:    /<skill> Continue the active workflow from `.standards/STATE.md`. Read the persisted Active Work, relevant project context and owned artifacts, and recovery context before proceeding.
```

Emit only the line for the active client. When recovery is active, prefer:

```text
Next role: <Role>

Codex:          $<skill> Continue the active recovery from `.standards/STATE.md`. Read the active recovery frame, persisted Active Work, relevant project context, and owned artifacts before proceeding.
Claude Code:    /<skill> Continue the active recovery from `.standards/STATE.md`. Read the active recovery frame, persisted Active Work, relevant project context, and owned artifacts before proceeding.
```

Again, emit only the line for the active client.

13. Do not emit a next-role invocation when the workflow remains with the same role, a blocking human question is unresolved, the resulting state is `AWAITING_HUMAN_SIGNOFF`, `SIGNED_OFF`, or `CANCELLED`, or Navigator is used. At `AWAITING_HUMAN_SIGNOFF`, present the available human actions instead.
14. `NAVIGATOR` may be invoked from any state but must not mutate artifacts or change workflow state.

## Human Decisions and Intervention

A human may change the active request at any nonterminal workflow state. Treat the change as rework within the same cycle: update `Active Work.Request`, identify the earliest owned artifact or decision invalidated by the change, record `Handoff.Kind: HUMAN_REWORK` with the corresponding `FailureType`, route to that owning state, and apply the recovery-stack rules. Do not classify human-requested changes as agent-discovered failures.

A human may also cancel the active cycle from any nonterminal state. If the project is still `GREENFIELD` and `DEVELOPING` has not begun, follow **Greenfield Bootstrap Cancellation** below. Otherwise transition to `CANCELLED`, record `Handoff.Kind: CANCEL`, set `From` to the interrupted state, use `FailureType: NONE`, record a concise cancellation reason, preserve `Active Work`, and clear recovery. If the project is still `GREENFIELD` and cancellation occurs from `DEVELOPING` or later, change `.standards/MODE.md` permanently to `BROWNFIELD` before entering `CANCELLED`.

### Greenfield Bootstrap Cancellation

If a `GREENFIELD` cycle is cancelled before `DEVELOPING` begins, no implementation has been produced under the workflow and the bootstrap should not be retained as project state. Treat the cancellation as a S.T.A.N.D.A.R.D.S. reset rather than as a reusable terminal cycle.

The reset must:

- remove the `.standards/` runtime directory, including protocol, mode, state, project context, and other S.T.A.N.D.A.R.D.S.-owned runtime files;
- remove scope, architecture, and other role-owned workflow artifacts created solely for the cancelled bootstrap cycle;
- remove project-local S.T.A.N.D.A.R.D.S. skill installations or other framework files that were injected by the installer;
- if `AGENTS.md` or `CLAUDE.md` was created by S.T.A.N.D.A.R.D.S., remove that file; if either file existed before installation, preserve the user's content and remove only the S.T.A.N.D.A.R.D.S.-managed integration content that the installer added;
- preserve all pre-existing project files, user-authored instructions, and non-S.T.A.N.D.A.R.D.S. content; never delete or rewrite user-owned content merely to perform the reset.

Do not rely on a persisted `CANCELLED` state after this reset because the state file itself is removed. The next S.T.A.N.D.A.R.D.S. workflow attempt must begin with a fresh installation and a new `GREENFIELD` cycle.

This exception applies only before `DEVELOPING` begins. Once the workflow has entered `DEVELOPING`, cancellation must preserve the installed runtime and workflow history, permanently change `ProjectMode` to `BROWNFIELD`, and enter retained terminal `CANCELLED`.

When `STATE.md` is `AWAITING_HUMAN_SIGNOFF`, the workflow waits for an explicit human action:

- **Sign off:** transition `STATE.md` to `SIGNED_OFF`, record `Handoff.Kind: SIGNOFF`, set `From: AWAITING_HUMAN_SIGNOFF`, and clear recovery. The current workflow cycle is complete.
- **Request rework:** follow the same active-cycle human-rework rules above. The recovery frame resumes at `AWAITING_HUMAN_SIGNOFF`, and every invalidated downstream gate must rerun before sign-off is offered again.
- **Cancel:** transition to `CANCELLED` using the cancellation rules above.

When `STATE.md` is `SIGNED_OFF` or a retained `CANCELLED` state, there is no active workflow cycle. Further requested changes begin a new cycle at the initial state for the current `ProjectMode`, record `Handoff.Kind: NEW_CYCLE`, initialize `Active Work` from the new request, and clear recovery; they do not reopen the prior cycle. A pre-`DEVELOPING` greenfield bootstrap cancellation has no retained `STATE.md`; future workflow work begins by installing S.T.A.N.D.A.R.D.S. again.

## Installed Runtime Contract

An installed S.T.A.N.D.A.R.D.S. project should provide:

- `AGENTS.md`: the project-facing entrypoint that tells coding agents to follow the installed protocol and role skills;
- `CLAUDE.md`: a Claude Code compatibility entrypoint that imports `AGENTS.md`;
- `.standards/PROTOCOL.md`: the installed copy of this canonical protocol;
- `.standards/MODE.md`: the project's current `ProjectMode`;
- `.standards/STATE.md`: the branch-persisted active `WorkflowState`, active-work identity, and resumable handoff/recovery context;
- the S.T.A.N.D.A.R.D.S. skills installed in the location required by the selected coding agent;
- client-specific invocation controls that keep workflow role skills human-invoked only: Codex skill adapters with `allow_implicit_invocation: false`, and Claude Code project settings with each installed S.T.A.N.D.A.R.D.S. workflow skill set to `"user-invocable-only"` in `skillOverrides`.

`.standards/MODE.md` must identify exactly one canonical `ProjectMode`. A project installed as `GREENFIELD` must change this file permanently to `BROWNFIELD` when its initial greenfield cycle successfully reaches `AWAITING_HUMAN_SIGNOFF`.

`.standards/STATE.md` must identify exactly one canonical `WorkflowState` and follow the persisted active-work, handoff, and recovery shape defined above. Installation initializes it from `ProjectMode`, and every legal state transition updates it as defined above.


### Installer File Preservation

Installation must preserve existing project-level agent instructions while keeping framework-owned files current. Installer behavior must be idempotent:

- If `AGENTS.md` does not exist, create it from `templates/common/AGENTS.md`.
- If `AGENTS.md` already exists, preserve all existing content and add the S.T.A.N.D.A.R.D.S. integration block if absent. If the block already exists, update only the content between `<!-- standards:start -->` and `<!-- standards:end -->`.
- If `CLAUDE.md` does not exist, create it from `templates/common/CLAUDE.md`.
- If `CLAUDE.md` already exists, preserve all existing content and ensure it imports `AGENTS.md` with `@AGENTS.md` exactly once.
- Replace or update `.standards/PROTOCOL.md` from the installed S.T.A.N.D.A.R.D.S. version during normal installation or upgrade. It is framework-owned and must not drift from the installed skills.
- Install or update the S.T.A.N.D.A.R.D.S. skill definitions for the selected coding agent during normal installation or upgrade.
- For Codex, preserve the per-skill adapter policy `allow_implicit_invocation: false`. For Claude Code, create or safely merge `.claude/settings.json` so every installed S.T.A.N.D.A.R.D.S. workflow skill has `skillOverrides.<skill>: "user-invocable-only"`. Preserve unrelated Claude settings. If an existing override for a S.T.A.N.D.A.R.D.S. skill conflicts with this explicit-only policy, report it for human resolution rather than silently choosing precedence.
- If `.standards/MODE.md` or `.standards/STATE.md` already exists, preserve it during normal reinstallation. Initialize these files only when S.T.A.N.D.A.R.D.S. is first installed or when the human explicitly requests reinitialization.
- If `.standards/CONTEXT.md` exists, preserve it during installation or upgrade. It is an Auditor-owned workflow artifact, not framework-owned installation content.
- If existing project-level agent instructions conflict with the S.T.A.N.D.A.R.D.S. integration block or installed protocol, preserve both and report the conflict for human resolution. Do not silently overwrite project instructions, weaken the protocol, or choose precedence automatically. Workflow work must not proceed under unresolved contradictory instructions.
- Re-running installation must not duplicate the integration block, duplicate the Claude import, reset workflow mode/state, or erase project-specific instructions.

Workflow artifacts such as scopes, technical designs, project context, tests, reviews, and documentation are created or updated by their owning roles when those phases run. Installation should not fabricate completed workflow artifacts.

## Canonical Terms

Use these terms consistently across all skills:

- **completed scope**: a scope artifact that has passed Scoper's completion gate. This does not imply separate human approval unless a project explicitly adds such a gate.
- **scope-level acceptance conditions**: observable outcomes owned by Scoper.
- **technical acceptance criteria**: technical conditions derived by Architect from scope-level acceptance conditions.
- **project context**: the Auditor-owned baseline of relevant project state and constraints for the active workflow cycle, stored canonically at `.standards/CONTEXT.md`. Planned implementation changes within that cycle do not automatically make the baseline stale. A `PROJECT_CONTEXT` failure means project context is materially incomplete, incorrect, or unexpectedly invalidated and must be refreshed before dependent work continues.
- **completion gate**: the conditions that must be satisfied before a role may perform a forward handoff.
- **failure handoff**: routing a defect to the role that owns the affected artifact or decision.
- **forward handoff**: advancing to the next legal workflow state after the current completion gate succeeds.
- **resume handoff**: moving during active recovery to an earlier completed or interrupted state through an edge that is not a normal forward transition.
- **recovery frame**: one outstanding corrective obligation on the `Recovery` stack, preserving the defect owner, reason, and interrupted state until workflow returns to that frame's `ResumeAt`.
- **active work**: the persisted identity, request, artifact references, and blocking human question for the current workflow cycle.

Do not introduce alternate names for these concepts inside individual skills unless this protocol is updated first.
