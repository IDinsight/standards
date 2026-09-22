# S.T.A.N.D.A.R.D.S. Protocol

<!-- standards:framework-owned -->

This file is the canonical contract for shared workflow vocabulary, state,
transitions, recovery, and installation behavior in S.T.A.N.D.A.R.D.S.

`README.md` explains the framework at a high level. Individual skills define
role-specific behavior. This protocol defines the rules those skills must share.

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

A role owns decisions or artifacts; it is not necessarily a workflow state.
Workflow role skills are invoked explicitly by the user. `WorkflowState`
determines whether an invoked role may perform role-owned workflow work; it does
not dispatch a skill automatically. Where supported, client installation must
prevent implicit model invocation of workflow role skills.

`NAVIGATOR` is strictly non-mutating and outside the workflow state machine. It
may be invoked from any state and never changes `.standards/STATE.md`.

State ownership governs role-owned work, not protocol coordination. An explicit
user instruction may authorize a control-plane transition even when another role
or the user owns the current state. The receiving agent may make only the
coordination changes required by the applicable cycle-selection, `PROMOTE`,
`USER_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL` rule. It must not perform the
target role's work unless that skill was also explicitly invoked and owns the
resulting state. An active workflow role may also `PROMOTE` without separate
user authorization when an expedited cycle can no longer safely remain
expedited.

## Project Modes

```text
ProjectMode
- GREENFIELD
- BROWNFIELD
```

- `GREENFIELD`: no meaningful pre-existing project implementation must be
  treated as established baseline.
- `BROWNFIELD`: meaningful implementation already exists and workflow work must
  understand, preserve, extend, repair, or otherwise depend on it.

Choose the initial mode from project state at installation. `GREENFIELD` is
temporary: during the initial greenfield cycle, Developer must permanently
change `.standards/MODE.md` to `BROWNFIELD` immediately after the first
successful creation or material modification of a project implementation
artifact. Workflow metadata and role-owned planning, context, test, review, or
documentation artifacts do not count as project implementation. The mode never
reverts, including during recovery.

For a `STANDARD` cycle:

- `GREENFIELD` starts in `SCOPING`.
- `BROWNFIELD` starts in `AUDITING`.

Before the first greenfield audit, missing Auditor-produced project context is
intentional. Treat it as a `PROJECT_CONTEXT` failure only when the active role
actually requires context that cannot be established from completed upstream
artifacts and known project constraints.

Cancellation while still `GREENFIELD` follows **Greenfield Bootstrap
Cancellation**. Cancellation after the permanent transition to `BROWNFIELD`
retains the runtime and enters terminal `CANCELLED`.

## Cycle Modes

```text
CycleMode
- STANDARD
- EXPEDITED
```

`ProjectMode` describes the persistent implementation baseline. `CycleMode`
describes the assurance topology for one cycle and is persisted in
`.standards/STATE.md`.

- `STANDARD`: the full topology for the current `ProjectMode`.
- `EXPEDITED`: a bounded brownfield path that intentionally omits Scoping,
  Architecture, Auditing, Testing, Documentation, Final Review, and
  Synchronization unless promoted.

Cycle-mode rules:

1. Installation initializes `CycleMode: STANDARD`.
2. `GREENFIELD` supports only `STANDARD`.
3. `BROWNFIELD` supports both modes.
4. A new brownfield cycle defaults to `STANDARD`. `EXPEDITED` is selected only
   when the user explicitly requests it or, absent an explicit `STANDARD`
   selection, explicitly invokes Developer as the entry role for a new bounded
   implementation change. For the initialized cycle, Developer entry implies
   `EXPEDITED` only while `Active Work.Id` and `Active Work.Request` are both
   `UNSET`. If `STANDARD` was explicitly selected, Developer does not own the
   entry state and must hand off to its owner. Post-`CANCELLED` restrictions in
   **User Decisions and Intervention** still apply.
5. `EXPEDITED` remains valid only while the request is a sufficiently bounded
   implementation contract and no omitted role or guarantee is required.
6. Skipping a role does not transfer its ownership, artifacts, or completion
   guarantees to Developer or Reviewer.
7. Promotion to `STANDARD` follows **Expedited Promotion** and is one-way for
   the active cycle.

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
- AWAITING_USER_SIGNOFF
- SIGNED_OFF
- CANCELLED
```

`.standards/STATE.md` records exactly one `WorkflowState` and one `CycleMode`.
`SIGNED_OFF` and `CANCELLED` are terminal and mean there is no active cycle. In
a terminal state, persisted cycle and active-work data describe the most recent
cycle for traceability until `NEW_CYCLE` replaces them.

The owning role for each state is:

| Workflow state             | Owning role     |
|----------------------------|-----------------|
| `SCOPING`                  | `SCOPER`        |
| `ARCHITECTING`             | `ARCHITECT`     |
| `AUDITING`                 | `AUDITOR`       |
| `DEVELOPING`               | `DEVELOPER`     |
| `TESTING`                  | `TESTER`        |
| `REVIEWING_IMPLEMENTATION` | `REVIEWER`      |
| `DOCUMENTING`              | `DOCUMENTER`    |
| `REVIEWING_FINAL`          | `REVIEWER`      |
| `SYNCHRONIZING`            | `SYNCHRONIZER`  |
| `AWAITING_USER_SIGNOFF`    | User            |
| `SIGNED_OFF`               | User (terminal) |
| `CANCELLED`                | User (terminal) |

## Persisted Workflow State

`.standards/STATE.md` is the authoritative, branch-persisted, version-controlled
record needed to resume workflow work across sessions or agents. Before workflow
work, read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and
`.standards/STATE.md`. Resume
from persisted state, active work, handoff, and recovery context; do not infer a
different state from chat history or artifact presence.

`STATE.md` uses this shape:

```markdown
# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING`
`CycleMode`: `STANDARD`

## Active Work

`Id`: `add-user-search` `Request`: `Add user search by name and email.` `Scope`:
`docs/scope/add-user-search.md` `Architecture`: `docs/specs/add-user-search.md`
`PromotionReason`: `NONE` `BaselineReconciliation`: `NONE` `AuditTarget`: `NONE`
`BlockedOn`: `NONE`

## Handoff

`Kind`: `FAILURE` `From`: `TESTING` `FailureType`: `ARCHITECTURE` `Reason`:
`Retry behavior is not defined by the current technical design.`

## Recovery

`Active`: `true`

### Frame 1

`From`: `TESTING` `Owner`: `ARCHITECTING` `FailureType`: `ARCHITECTURE`
`Reason`: `Retry behavior is not defined by the current technical design.`
`ResumeAt`: `TESTING` `RerunThrough`: `NONE`
```

### Active Work

- `Id`: stable, user-readable identifier for the cycle. Assign a fresh ID for
  every new cycle. It must not match any prior cycle ID still referenced by
  persisted workflow state or Auditor-owned cycle-scoped context, including
  `BaselineReconciliation` and **Active-Cycle Non-Baseline Work**. Prefer a
  concise request-derived slug plus a uniqueness suffix when needed.
- `Request`: persisted user request at enough fidelity for the entry role to
  understand the work.
- `Scope` and `Architecture`: repository-relative paths to the owning artifacts,
  or `NONE` until created. Scoper and Architect must persist their artifact path
  before their normal completion gate passes. In expedited work these fields
  normally remain `NONE` unless the cycle is promoted.
- `PromotionReason`: durable reason an expedited cycle was promoted, otherwise
  `NONE`. Preserve it for the remainder of the cycle; it is workflow context,
  not a user requirement, scope decision, architecture decision, or baseline
  fact.
- `BaselineReconciliation`: durable provenance for unresolved project changes
  retained from cancelled cycles, otherwise `NONE`. It must be resolved before
  the current cycle may rely on the affected repository state as established
  baseline. Preserve each source cycle distinctly by unique `Id` plus brief
  request summary. Carry it across handoffs, failures, rework, recovery, and
  cancellation until Auditor resolves the baseline and clears it.
  `Handoff.Reason` is not a substitute.
- `AuditTarget`: transient repository-relative path or area label for an
  in-progress targeted audit when that focus cannot otherwise be recovered from
  persisted active work, owned artifacts, or recovery context; otherwise
  `NONE`. Auditor must persist an ad-hoc user-directed target before relying on
  it and clear it when that targeted audit completes, is abandoned, or no longer
  needs separate persistence.
- `BlockedOn`: unresolved user question preventing completion, otherwise
  `NONE`.

Installation may initialize `Id` and `Request` as `UNSET`. Before the first
workflow role performs substantive work, persist the request and assign the
cycle ID. Every later `NEW_CYCLE` does this as part of the transition.

### Handoff

`Handoff.Kind` is one of `INITIAL`, `FORWARD`, `FAILURE`, `RESUME`, `PROMOTE`,
`USER_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL`. Use `NONE` for inapplicable
fields. `Reason` describes only the latest transition and must remain concise;
it is not durable storage for outstanding recovery or baseline obligations.

Use `RESUME` whenever a recovery frame returns to `ResumeAt`, and for any other
recovery-directed transition that is not the normal forward handoff.

### Recovery

`Recovery` is a stack ordered oldest to newest; the last frame is active. A
frame preserves one outstanding corrective obligation. A role owns the active
frame only when the current `WorkflowState` equals its `Owner`.

`RerunThrough` is `NONE` until the frame owner resolves the defect. If previously
completed downstream work must be re-established before `ResumeAt`, the owner
sets it to the last state in that rerun sequence. Merely running during recovery
does not make a role responsible for the frame.

### State-update rules

1. Installation initializes from the selected mode template: `SCOPING` for
   `GREENFIELD`, `AUDITING` for `BROWNFIELD`, `CycleMode: STANDARD`,
   `Handoff.Kind: INITIAL`, unset active work, and inactive recovery.
2. Before substantive work on an initialized brownfield cycle, expedited
   selection follows **Cycle Modes** and **User Decisions and Intervention**.
3. Every legal state-changing transition updates all applicable `CycleMode`,
   `Active Work`, `Handoff`, and `Recovery` fields as part of the transition.
4. Blocking questions do not change workflow state. Set `BlockedOn` before
   asking and clear it after incorporating the answer.
5. Failure/recovery, promotion, and user-control transitions follow their
   canonical sections below rather than redefining their mechanics here.
6. During the initial greenfield cycle, Developer performs the permanent
   `GREENFIELD` -> `BROWNFIELD` mode change when Developer first successfully
   creates or materially modifies a project implementation artifact.

`STATE.md` coordinates the workflow; it does not replace role-owned artifacts.
Role-owned artifacts remain authoritative for their own content.

### Project context lifecycle

`.standards/CONTEXT.md` is the canonical Auditor-owned project-context artifact.
Installation does not fabricate it. Auditor creates or refreshes it when
`AUDITING` runs.

For a `STANDARD` cycle, refreshed context is the project baseline for downstream
roles, subject to ownership and freshness rules. In an `EXPEDITED` cycle,
existing context is prior evidence only; it is not presumed refreshed.

Any **Active-Cycle Non-Baseline Work** entry is scoped to the `Active Work.Id`
that produced it and applies only while that same cycle is nonterminal. It is
stale in `SIGNED_OFF`, `CANCELLED`, and later cycles. A later audit must
reconcile each prior-cycle exclusion against current repository and
version-control evidence, removing or reclassifying it rather than copying it
forward. If baseline status cannot be established safely, Auditor blocks for
user clarification.

Greenfield status does not require context to be absent. Initial greenfield
Scoping and Architecture may run before the first audit, but later reruns must
use an existing relevant `CONTEXT.md`. After Developer first successfully
creates or materially modifies a project implementation artifact, `ProjectMode`
remains `BROWNFIELD` permanently.

`.standards/MODE.md` and `.standards/STATE.md` are protocol-owned coordination
artifacts. A role or user may change them only as required by a legal protocol
transition or a protocol-required coordination update defined here, including
initializing `Active Work`, recording artifact paths, selecting or promoting
`CycleMode`, and setting or clearing `PromotionReason`,
`BaselineReconciliation`, `AuditTarget`, or `BlockedOn`.
`.standards/PROTOCOL.md` is framework-owned and may be changed only by framework
installation or upgrade.

## Acceptance Traceability

These obligations apply only to `STANDARD` cycles and do not create a shared
traceability artifact or add acceptance data to `STATE.md`. `EXPEDITED` cycles
do not fabricate Scoper-owned acceptance conditions or substitute identifiers.
If an expedited cycle is promoted, Scoper establishes them when the standard
topology reaches `SCOPING`.

1. Scoper represents every verifiable in-scope completion obligation as one or
   more acceptance conditions with stable, unique `AC-NNN` identifiers for the
   active cycle. Do not combine separable obligations under one identifier when
   their satisfaction or verification evidence is established in different
   workflow phases. The identifier is a reference, not an ordering guarantee.
2. During REPLAN, preserve an identifier when meaning is unchanged. New or
   materially replaced conditions receive previously unused identifiers.
   Removed or replaced identifiers remain in the scope's retired-identifier
   record. Never renumber surviving identifiers or reuse retired ones within
   the cycle.
3. Scoper owns acceptance wording and meaning. Downstream roles reference IDs
   but do not redefine intent; material defects route to Scoper.
4. Architect accounts for every current ID with technical design coverage or an
   explicit no-architectural-impact disposition when satisfaction depends
   entirely on established nontechnical behavior or work owned by another
   workflow phase. Group IDs only when the same disposition applies; do not
   invent architecture or claim ownership of satisfaction that belongs to
   another workflow phase.
5. All downstream coverage, work, and evidence references the same current IDs;
   downstream roles do not invent substitute requirement IDs.
6. Tester accounts for every current ID with verification evidence, a blocker,
   or—when satisfaction explicitly depends on a later role—a pending dependency.
   Pending is not verification evidence and must be resolved downstream under
   the same ID.
7. `AWAITING_USER_SIGNOFF` is forbidden while any current ID lacks sufficient
   evidence or has an unresolved blocker. Route defects to their owning roles
   through normal failure and recovery rules; never treat an unevidenced
   condition as satisfied by assumption.
8. Acceptance changes during recovery or rework invalidate any completed
   downstream artifact whose completion contract requires accounting for every
   current ID. Include those states when computing downstream invalidation even
   if underlying behavior or technical decisions remain otherwise valid.

## Expedited Cycle Contract

An `EXPEDITED` cycle provides a deliberately narrower completion contract:

1. It is valid only in `BROWNFIELD`.
2. `Active Work.Request` is the change contract. `Scope` and `Architecture`
   remain `NONE` unless promotion later causes their owners to create them.
3. Existing project context may be consulted as prior evidence but is not
   refreshed by default. Prior-cycle non-baseline entries are stale for the
   current cycle. If safe completion depends on baseline status that requires
   Auditor-owned context, promote instead of assigning that work to Developer.
4. Active-cycle implementation remains tentative. Promotion does not make it
   established baseline. Auditor must distinguish pre-cycle baseline from
   active-cycle changes using authoritative evidence and block rather than guess
   when materially ambiguous.
5. Developer owns implementation and normal implementation-level self-checks;
   these are not Tester-owned formal verification.
6. Reviewer still owns `REVIEWING_IMPLEMENTATION` and may route implementation
   defects through normal recovery.
7. Scoper, Architect, Auditor, Tester, Documenter, `REVIEWING_FINAL`, and
   Synchronizer are absent from the expedited forward topology. Their missing
   artifacts or gates are not failures.
8. The cycle may reach `AWAITING_USER_SIGNOFF` after Developer and implementation
   Reviewer pass their gates, recovery is empty, and no blocking user question
   remains. Scope-level acceptance traceability does not apply.
9. If safe completion requires an omitted role or guarantee, use **Expedited
   Promotion** instead of weakening ownership or fabricating skipped work.

## Review Kinds

```text
ReviewKind
- IMPLEMENTATION
- FINAL_DELIVERABLE
```

`IMPLEMENTATION` corresponds to `REVIEWING_IMPLEMENTATION`.
`FINAL_DELIVERABLE` corresponds to `REVIEWING_FINAL`. A review handoff must
identify the requested kind.

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

| Failure type      | Owning role    |
|-------------------|----------------|
| `SCOPING`         | `SCOPER`       |
| `ARCHITECTURE`    | `ARCHITECT`    |
| `PROJECT_CONTEXT` | `AUDITOR`      |
| `IMPLEMENTATION`  | `DEVELOPER`    |
| `VERIFICATION`    | `TESTER`       |
| `DOCUMENTATION`   | `DOCUMENTER`   |
| `REVIEW`          | `REVIEWER`     |
| `SYNCHRONIZATION` | `SYNCHRONIZER` |

The discoverer of a failure does not automatically own the fix. Route it to the
owner of the defective artifact or decision.

## Forward Transitions

A forward transition occurs only after the current state's completion gate
passes.

### Standard Greenfield

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
-> AWAITING_USER_SIGNOFF
```

### Standard Brownfield

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
-> AWAITING_USER_SIGNOFF
```

For brownfield standard work, `ARCHITECTING -> DEVELOPING` requires valid
project context for the active cycle. Missing, materially incomplete, incorrect,
or unexpectedly invalidated context routes to `AUDITING`. Planned active-cycle
implementation changes do not alone make context stale.

### Expedited Brownfield

```text
DEVELOPING
-> REVIEWING_IMPLEMENTATION
-> AWAITING_USER_SIGNOFF
```

This topology is valid only for `ProjectMode: BROWNFIELD` and
`CycleMode: EXPEDITED`. Skipped standard work must not be synthesized inside
Developer or Reviewer.

## Expedited Promotion

Promotion changes a nonterminal `EXPEDITED` brownfield cycle to `STANDARD` when
the bounded contract is no longer sufficient. It is a topology change, not a
failure handoff.

Promote when safe completion requires formal Scoping, consequential
Architecture, authoritative Auditor-owned context, Tester-owned verification,
Documentation, Final Review, Synchronization, or another intentionally omitted
guarantee.

1. Promotion is valid only from a nonterminal expedited brownfield cycle.
2. An active workflow role may promote when required. At
   `AWAITING_USER_SIGNOFF`, user authorization is required. An explicit promote
   request qualifies; so does an explicit rework request whose changed contract
   necessarily requires an omitted standard role or guarantee.
3. Set `CycleMode: STANDARD`, `WorkflowState: AUDITING`, and
   `Handoff.Kind: PROMOTE`; set `From` to the interrupted state,
   `FailureType: NONE`, and record a concise reason identifying which omitted
   standard guarantee is now required. Persist the same reason in
   `Active Work.PromotionReason`.
4. Preserve cycle `Id`, `Request`, and role-owned artifacts. Do not fabricate
   `Scope` or `Architecture`. Existing expedited implementation remains
   tentative active-cycle work, not baseline.
5. Auditor establishes or refreshes context without laundering tentative work
   into pre-existing baseline. Material ambiguity requires a user question.
6. Clear recovery. The standard brownfield topology restarts at `AUDITING`,
   superseding expedited-only resume paths.
7. Promotion is one-way for the active cycle.
8. All standard forward, failure, recovery, traceability, and sign-off rules
   apply afterward.

## Failure Handoffs

A failure handoff routes a defect to its owning state:

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

In `STANDARD`, use this routing directly. In `EXPEDITED`, only
`IMPLEMENTATION -> DEVELOPING` and implementation `REVIEW ->
REVIEWING_IMPLEMENTATION` are valid failure routes because only those states
exist in the expedited topology. A defect or guarantee owned by a skipped role
requires **Expedited Promotion**, not a failure transition into a skipped state.

If routing changes state, apply **Recovery Mechanics**. A same-state failure
records the handoff but does not create a recovery frame.

## Recovery Mechanics

This is the canonical recovery algorithm. Skills define only how their role
corrects its owned work, evaluates its completion gate, and identifies which
previously completed downstream states its correction invalidates.

Recovery follows the active `CycleMode` topology. Expedited recovery reruns only
expedited states; a newly required skipped role or guarantee triggers
**Expedited Promotion**, which intentionally clears the expedited recovery stack.

1. **Push only when corrective routing changes state.** For `FAILURE` or
   `USER_REWORK` moving to a different state, push a frame with `From` =
   interrupted state, `Owner` = corrective target, applicable `FailureType` and
   `Reason`, `ResumeAt` = interrupted state, and `RerunThrough: NONE`.
   Same-state correction creates no frame.
2. **Preserve nesting.** New failure or rework during recovery pushes another
   frame. Never overwrite older frames. The last frame is active.
3. **Only the active frame owner plans resumption.** After correcting the defect
   and passing its normal gate, that owner decides whether previously completed
   downstream states must be re-established before `ResumeAt`.
4. **No rerun:** pop the frame and transition directly to `ResumeAt` with
   `Handoff.Kind: RESUME`.
5. **Rerun required:** set `RerunThrough` to the last required state and
   transition to the earliest required rerun state. Keep the frame on the
   stack.
6. **Rerun states use normal gates and legal forward handoffs** while preserving
   the stack. They do not own the frame unless a nested defect creates a new one.
7. **At the rerun boundary**, after `RerunThrough` passes its gate, pop the frame
   and transition to `ResumeAt` with `Handoff.Kind: RESUME` instead of taking
   the normal forward handoff. This explicit return is valid even when
   `ResumeAt` lies outside the project's normal forward topology.
8. Recovery ends only when the stack is empty.

Examples:

```text
Architecture defect discovered during testing:
TESTING -> ARCHITECTING                 # push frame, ResumeAt TESTING
ARCHITECTING -> DEVELOPING              # set RerunThrough DEVELOPING
DEVELOPING -> TESTING                   # boundary completes, pop, resume TESTING

Scoping defect discovered during implementation review:
REVIEWING_IMPLEMENTATION -> SCOPING     # push frame
SCOPING -> ARCHITECTING                 # set RerunThrough TESTING
ARCHITECTING -> DEVELOPING -> TESTING
TESTING -> REVIEWING_IMPLEMENTATION     # pop, explicit resume

Invalid project context discovered during architecture:
ARCHITECTING -> AUDITING                # push frame
AUDITING -> ARCHITECTING                # no rerun; pop and resume

Nested recovery:
TESTING -> AUDITING                     # outer frame, ResumeAt TESTING
AUDITING -> SCOPING                     # nested rework frame, ResumeAt AUDITING
SCOPING -> ARCHITECTING                 # set nested RerunThrough DEVELOPING
ARCHITECTING -> DEVELOPING
DEVELOPING -> AUDITING                  # pop nested frame, explicit resume
```

## Commit Message Guidance

After role work, if the role produced a meaningful atomic set of repository
changes, provide a suggested Git commit message. Do not create the commit unless
the user explicitly requests it. Coordination-only changes such as advancing
`STATE.md` do not justify a suggestion by themselves.

Use Conventional Commits:

```text
<type>(<optional-scope>): <description>
```

Choose type and scope from the actual changes, not the role or workflow state.
Common types include `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`,
`ci`, and `chore`. Keep the description concise, imperative, and specific. Use
breaking-change syntax or footers only for genuinely breaking changes.

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

`NAVIGATOR` never suggests a commit. Other roles omit the suggestion when they
produced no meaningful committable changes. When both a commit suggestion and a
next-role invocation are emitted, present the commit suggestion first.

## Handoff Rules

1. Forward handoff requires the current completion gate to pass.
2. A role does not repair work it does not own; failures route under **Failure
   Handoffs**.
3. A handoff identifies its target role or workflow state. A failure handoff
   also identifies `FailureType`; `REVIEW` targets the Reviewer state matching
   the affected `ReviewKind`.
4. No role silently changes another role's artifact or decision.
5. Corrective routing and reruns follow **Recovery Mechanics**; skills must not
   redefine that algorithm.
6. User sign-off, rework, cancellation, and new-cycle transitions follow **User
   Decisions and Intervention**.
7. Promotion follows **Expedited Promotion** and is not encoded as `FAILURE`.
8. Every state-changing handoff persists the applicable state, active-work,
   handoff, and recovery changes before further role work. Persist the state
   change before presenting any next-role invocation.
9. After a legal transition to a different workflow role, provide a concise
   copy/paste invocation for that role unless the same user instruction already
   explicitly invoked it and it will continue immediately. Do not emit one when
   the workflow remains with the same role, a blocking question is unresolved,
   the result is `AWAITING_USER_SIGNOFF`, `SIGNED_OFF`, or `CANCELLED`, or
   Navigator is used.
10. The invocation is convenience only; `STATE.md` and role-owned artifacts
    remain authoritative. Use the active client's syntax and avoid duplicating
    authoritative workflow content unless needed for disambiguation:

```text
Next role: <Role>

Codex:       $<skill> Continue the active workflow from `.standards/STATE.md`. Read the persisted Active Work, relevant project context and owned artifacts, and recovery context before proceeding.
Claude Code: /<skill> Continue the active workflow from `.standards/STATE.md`. Read the persisted Active Work, relevant project context and owned artifacts, and recovery context before proceeding.
```

Emit only the active-client line. When recovery is active, replace “active
workflow” with “active recovery” and explicitly direct the role to read the
active recovery frame.

At `AWAITING_USER_SIGNOFF`, present the applicable user actions rather than a
next-role invocation.

## User Decisions and Intervention

These are user-authorized control-plane transitions. An explicit, unambiguous
user instruction may authorize the receiving agent to persist the coordination
change regardless of current state ownership. That exception authorizes only
the protocol transition itself. Resulting role-owned work may proceed only when
that role was explicitly invoked and owns the resulting state; otherwise stop
after persisting the transition and provide the next-role invocation when the
handoff rules require one.

### Select expedited mode for the initialized cycle

Before substantive work, while `Active Work.Id` and `Active Work.Request` are
both `UNSET`, a brownfield user may explicitly request `EXPEDITED` or select it
by invoking
Developer with a new bounded implementation request unless `STANDARD` was
explicitly selected.

Set `CycleMode: EXPEDITED`, `WorkflowState: DEVELOPING`, initialize `Active Work`
with the new ID/request plus `PromotionReason: NONE` and
`BaselineReconciliation: NONE`, keep `Handoff.Kind: INITIAL`, set `From: NONE`
and `FailureType: NONE`, record a concise expedited-entry reason, and keep
recovery inactive. This is unavailable in `GREENFIELD`.

### Promote an expedited cycle

An explicit user instruction may authorize **Expedited Promotion** from any
nonterminal expedited brownfield state, including `AWAITING_USER_SIGNOFF`.
After persisting promotion, stop and hand off to Auditor unless Auditor was also
explicitly invoked. Active workflow roles may promote without separate user
instruction when the expedited contract becomes insufficient.

### Rework an active cycle

From any nonterminal state, update `Active Work.Request` when the request
changed, identify the earliest owned artifact or decision invalidated, record
`Handoff.Kind: USER_REWORK` with its `FailureType`, and route to that owner. If
state changes, push the recovery frame defined by **Recovery Mechanics** with
`ResumeAt` equal to the interrupted state; preserve older frames. User-requested
changes are not agent-discovered failures.

In `EXPEDITED`, bounded implementation rework routes to `DEVELOPING`. If the new
contract requires a skipped standard role or guarantee, the rework request
itself authorizes **Expedited Promotion** instead.

### Cancel an active cycle

- If `ProjectMode: GREENFIELD`, follow **Greenfield Bootstrap Cancellation**.
- If `ProjectMode: BROWNFIELD`, transition to `CANCELLED`, record
  `Handoff.Kind: CANCEL`, set `From` to the interrupted state,
  `FailureType: NONE`, preserve `Active Work`, and clear recovery.

Cancellation never reverts project artifacts and does not by itself establish
cancelled-cycle project changes as baseline.

### Sign off

From `AWAITING_USER_SIGNOFF`, transition to `SIGNED_OFF`, record
`Handoff.Kind: SIGNOFF`, `From: AWAITING_USER_SIGNOFF`, `FailureType: NONE`, and
clear recovery. The cycle is complete.

For `STANDARD`, all standard gates and acceptance-traceability obligations must
be satisfied. For `EXPEDITED`, sign-off covers only the narrower **Expedited
Cycle Contract**; skipped standard phases must not be represented as completed.

### Start a new cycle

From `SIGNED_OFF` or retained `CANCELLED`:

1. Record `Handoff.Kind: NEW_CYCLE`, `Handoff.From` = prior terminal state,
   `FailureType: NONE`, and a concise reason.
2. Create a fresh non-colliding `Active Work.Id` and persist the new `Request`.
   Reset `Scope`, `Architecture`, `PromotionReason`, `AuditTarget`, and
   `BlockedOn` to `NONE`; clear recovery.
3. From `SIGNED_OFF`, set `BaselineReconciliation: NONE`.
4. From retained `CANCELLED`, carry any existing reconciliation obligation. If
   the user does not explicitly confirm that the just-cancelled cycle left no
   project changes because none were produced or they were reverted, append
   that cycle's unique `Id` and request summary to `BaselineReconciliation`.
5. `STANDARD` is the default. Brownfield `EXPEDITED` may be explicitly selected
   or inferred from Developer entry as defined in **Cycle Modes**, but after
   retained `CANCELLED` it is allowed only when `BaselineReconciliation: NONE`.
6. Any unresolved reconciliation, or cancelled-cycle changes the user wants to
   retain or adopt, requires `STANDARD` and `WorkflowState: AUDITING` so Auditor
   can establish baseline status first. Mention the obligation concisely in
   `Handoff.Reason` without duplicating its source-cycle provenance there.
7. Otherwise initialize a standard cycle from `ProjectMode`, or an allowed
   expedited brownfield cycle at `DEVELOPING`. The prior cycle is not reopened.

A greenfield bootstrap cancellation removes the runtime, so future workflow work
requires fresh installation and a fresh project-mode decision.

At `AWAITING_USER_SIGNOFF`, available actions are sign off, rework, or cancel;
for expedited work, explicit promotion is also available. Bounded expedited
rework follows normal recovery back to sign-off. Rework requiring a skipped
standard guarantee promotes and restarts the standard brownfield topology at
`AUDITING`.

### Greenfield Bootstrap Cancellation

If cancellation occurs while `ProjectMode` is still `GREENFIELD`, no project
implementation has yet been produced by the workflow. Treat cancellation as a
S.T.A.N.D.A.R.D.S. reset rather than a reusable terminal cycle.

The reset must:

- read `.standards/INSTALLATION.json` before removal and revert only
  client-setting mutations recorded there as framework-created; remove a setting
  only when its current value still exactly matches the recorded installed
  value; preserve all others;
- remove the `.standards/` runtime and project-local S.T.A.N.D.A.R.D.S. skill or
  framework files injected by the installer;
- remove only the bounded S.T.A.N.D.A.R.D.S. integration block from `AGENTS.md`
  and `CLAUDE.md`; delete either file only if no non-whitespace content remains;
- leave all project files and role-owned workflow artifacts outside the runtime
  untouched.

S.T.A.N.D.A.R.D.S. does not restore the project working tree. Reverting project
changes is the user's responsibility.

Managed block boundaries define framework ownership; do not decide whether to
delete `AGENTS.md` or `CLAUDE.md` based on who originally created the file. An
existing unbounded `@AGENTS.md` import is user-owned and preserved.

The reset removes `STATE.md`, so no persisted `CANCELLED` state remains. The next
workflow attempt requires fresh installation, which re-evaluates project mode
from then-current state. Do not carry the cancelled bootstrap's former
`GREENFIELD` classification across reinstall.

This exception ends permanently after Developer first successfully creates or
materially modifies a project implementation artifact; cancellation after that
point uses retained brownfield `CANCELLED` semantics even if recovery has moved
to an earlier workflow state.

## Installed Runtime Contract

An installed project should provide:

- `AGENTS.md`: project-facing entrypoint to the protocol and role skills;
- `CLAUDE.md`: Claude Code compatibility entrypoint importing `AGENTS.md`;
- `.standards/PROTOCOL.md`: installed canonical protocol;
- `.standards/INSTALLATION.json`: installer-owned metadata for only the
  client-setting mutations S.T.A.N.D.A.R.D.S. actually created;
- `.standards/MODE.md`: current `ProjectMode`;
- `.standards/STATE.md`: current workflow/cycle state and resumable coordination
  context;
- the S.T.A.N.D.A.R.D.S. workflow skills installed in the location required by
  the selected coding agent;
- explicit-invocation controls: Codex adapters use
  `allow_implicit_invocation: false`; Claude Code project settings use
  `skillOverrides.<skill>: "user-invocable-only"` for installed workflow skills.

`.standards/MODE.md` contains exactly one canonical `ProjectMode`; its
greenfield-to-brownfield transition follows **Project Modes**.
`.standards/STATE.md` contains exactly one canonical `WorkflowState` and
`CycleMode` and follows **Persisted Workflow State**.
`.standards/INSTALLATION.json` is installer metadata, not workflow state: create
it on first installation, preserve/update it across normal reinstall or upgrade,
and record only mutations the installer actually created. Never retroactively
claim compatible pre-existing settings.

### Installer File Preservation

Installation must be idempotent and preserve project-owned instructions.
Before creating, replacing, updating, or removing a framework-controlled runtime
path or installed skill package, verify ownership deterministically.

Ownership rules:

- `.standards/` is framework-owned only when `.standards/PROTOCOL.md` contains
  `<!-- standards:framework-owned -->`. Otherwise report a path collision and
  do not adopt, overwrite, or remove it.
- An installed skill package is framework-owned only when its root `SKILL.md`
  carries the same marker. Otherwise report a skill collision and do not
  overwrite, merge, or remove it.
- Framework source `PROTOCOL.md` and root workflow `SKILL.md` files must retain
  the marker. Never infer ownership from names, paths, or similar content.

After ownership checks:

- Create `AGENTS.md` from `templates/common/AGENTS.md` if absent. Otherwise
  preserve existing content and add or update only the bounded block between
  `<!-- standards:start -->` and `<!-- standards:end -->`.
- Create `CLAUDE.md` from `templates/common/CLAUDE.md` if absent. If an existing
  user-owned unbounded `@AGENTS.md` import exists, preserve it and do not add a
  framework duplicate. Otherwise add or update a bounded integration block. If
  multiple unbounded imports exist, preserve them and report the conflict.
- Update `.standards/PROTOCOL.md` from the installed framework version only
  after runtime ownership verification. Install or update each skill definition
  only after that destination skill package passes its ownership check. Keep the
  installed protocol aligned with the installed skills.
- Preserve Codex `allow_implicit_invocation: false`.
- For Claude Code, safely merge `.claude/settings.json` while preserving
  unrelated settings: add each missing required
  `skillOverrides.<skill>: "user-invocable-only"` and record that exact created
  key/value in `.standards/INSTALLATION.json`; preserve an already-compatible
  unowned value without claiming it; report conflicting values rather than
  overriding them. Existing manifest ownership remains valid only for the exact
  path and installed value recorded.
- Preserve an existing verified `.standards/INSTALLATION.json` and update only
  installer-owned metadata. If it is unexpectedly missing from an otherwise
  verified runtime, stop and report the incomplete runtime; never reconstruct
  ownership by inference.
- Preserve existing `.standards/MODE.md` and `.standards/STATE.md` on normal
  reinstall; initialize
  them only on first install or explicit reinitialization.
- Preserve `.standards/CONTEXT.md`; it is Auditor-owned, not installer-owned.
- Preserve conflicting project-level instructions and report the conflict for
  user resolution. Do not silently choose precedence, weaken the protocol, or
  proceed with workflow work under unresolved contradictory instructions.
- Reinstallation must not duplicate managed blocks/imports, reset workflow
  mode/state, or erase project instructions.

Installation does not fabricate completed workflow artifacts such as scope,
technical design, project context, tests, reviews, or documentation.

## Canonical Terms

Use these terms consistently across all skills:

- **completed scope**: scope artifact that passed Scoper's completion gate; it
  does not imply separate user approval unless the project adds such a gate.
- **scope-level acceptance conditions**: observable outcomes owned by Scoper,
  each identified by a stable `AC-NNN` for the active cycle.
- **acceptance identifier**: Scoper's stable `AC-NNN` reference reused by
  downstream artifacts.
- **retired acceptance identifier**: an ID whose condition was removed or
  materially replaced; retained so it cannot be reused and no longer a current
  coverage or verification obligation.
- **technical acceptance criteria**: Architect-derived technical conditions
  linked to scope-level acceptance identifiers.
- **project context**: Auditor-owned baseline stored at `.standards/CONTEXT.md`.
  It may persist as evidence across cycles, but cycle-scoped non-baseline entries
  follow the lifecycle in **Persisted Workflow State**. Planned implementation
  does not automatically stale the baseline. `PROJECT_CONTEXT` failure means
  context is materially incomplete, incorrect, or unexpectedly invalidated.
- **completion gate**: conditions required before a role may make a forward
  handoff.
- **failure handoff**: routing a defect to the owner of the affected artifact or
  decision.
- **forward handoff**: advancing after the current completion gate succeeds.
- **resume handoff**: completing a recovery frame by returning to `ResumeAt`, or
  another recovery-directed non-forward transition.
- **cycle mode**: active cycle's assurance topology, `STANDARD` or `EXPEDITED`,
  distinct from `ProjectMode`.
- **expedited cycle**: bounded brownfield cycle consisting of Developer then
  implementation Reviewer, with possible sign-off without fabricated skipped
  standard roles or artifacts.
- **promotion handoff**: one-way `PROMOTE` transition from expedited to standard
  that restarts brownfield workflow at `AUDITING` because an omitted guarantee
  is required.
- **recovery frame**: one corrective obligation preserving owner, reason,
  interrupted `ResumeAt`, and any `RerunThrough` boundary.
- **active work**: persisted cycle identity, request, artifact references,
  promotion reason, baseline-reconciliation provenance, transient audit target,
  and blocking question; in terminal states it describes the latest cycle until
  `NEW_CYCLE` replaces it.

Do not introduce alternate names for these concepts inside individual skills
unless this protocol is updated first.
