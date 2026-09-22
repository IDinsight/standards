# S.T.A.N.D.A.R.D.S. Protocol

<!-- standards:framework-owned -->

This file defines the canonical workflow vocabulary and state transitions for
S.T.A.N.D.A.R.D.S.

`README.md` explains the framework at a high level. Individual skills define
role behavior. This protocol defines the shared states, handoffs, and terms
those skills must use consistently.

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

A role identifies who owns a decision or artifact. A role is not necessarily the
same thing as a workflow state. Workflow role skills are invoked explicitly by
the user; `WorkflowState` determines whether an invocation may perform
role-owned workflow work, but does not auto-dispatch a skill. Client-specific
installation controls must prevent model-initiated invocation of workflow role
skills where the client supports that distinction.

`NAVIGATOR` is strictly non-mutating and sits outside the workflow state
machine. Invoking Navigator does not change the current workflow state.

Workflow-state ownership governs role-owned workflow work, not protocol
coordination. An explicit user instruction may authorize a control-plane
transition even when the current state is owned by another role or by the user.
The agent receiving that instruction may make only the coordination changes
required by the applicable cycle-selection, user-authorized `PROMOTE`,
`USER_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL` rule. It must not perform
the target role's work unless that workflow skill was explicitly invoked by the
user and owns the resulting state. An active workflow role may also perform the
protocol-defined `PROMOTE` transition without a separate user instruction when
an `EXPEDITED` cycle can no longer safely remain expedited.

## Project Modes

```text
ProjectMode
- GREENFIELD
- BROWNFIELD
```

- `GREENFIELD`: bootstrap mode when S.T.A.N.D.A.R.D.S. is initialized without a
  meaningful pre-existing project implementation that the workflow must treat as
  an established baseline.
- `BROWNFIELD`: operating mode when meaningful project implementation already
  exists and workflow work must understand, preserve, extend, repair, or
  otherwise depend on that implementation.

Choose the initial `ProjectMode` from the project state at installation: use
`GREENFIELD` only when no meaningful pre-existing implementation must be treated
as a baseline; otherwise use `BROWNFIELD`. `GREENFIELD` is temporary. During the
initial greenfield cycle, Developer must change `.standards/MODE.md` permanently
to `BROWNFIELD` as soon as Developer first successfully creates or materially
modifies a project implementation artifact. Workflow metadata and role-owned
planning, context, test, review, or documentation artifacts do not count as
project implementation. The mode transition is permanent and does not depend on
the current `WorkflowState`; later recovery may move the workflow back to
`SCOPING`, `ARCHITECTING`, or `AUDITING` while `ProjectMode` remains
`BROWNFIELD`. If a cycle is cancelled while `ProjectMode` is still `GREENFIELD`,
treat the cancellation as abandonment of the bootstrap under **Greenfield
Bootstrap Cancellation**. If it is cancelled after the mode has become
`BROWNFIELD`, retain the installed runtime and enter terminal `CANCELLED`.
Future workflow cycles then begin as brownfield work.

For a `STANDARD` cycle, the initial workflow state is determined by project
mode:

- `GREENFIELD` starts in `SCOPING`.
- `BROWNFIELD` starts in `AUDITING`.

For `GREENFIELD` work before `AUDITING`, the absence of Auditor-produced project
context is intentional. Do not classify that absence as a `PROJECT_CONTEXT`
failure unless the active role actually requires context that cannot be
established from the completed upstream artifacts and known project constraints.

## Cycle Modes

```text
CycleMode
- STANDARD
- EXPEDITED
```

- `STANDARD`: the full workflow topology for the current `ProjectMode`.
- `EXPEDITED`: a bounded brownfield change path that intentionally omits formal
  Scoping, Architecture, Auditing, Testing, Documentation, Final Review, and
  Synchronization unless the cycle is promoted to `STANDARD`.

`ProjectMode` and `CycleMode` answer different questions. `ProjectMode`
describes the project's implementation baseline and persists across cycles.
`CycleMode` describes the assurance topology selected for one active cycle and
is persisted in `.standards/STATE.md`.

Cycle-mode rules:

1. Installation initializes `CycleMode: STANDARD`.
2. `GREENFIELD` supports `STANDARD` only.
3. `BROWNFIELD` supports `STANDARD` and `EXPEDITED`.
4. A new brownfield cycle defaults to `STANDARD` unless the user explicitly
   requests an expedited cycle or, when the user has not explicitly selected
   `STANDARD`, explicitly invokes Developer as the entry role for a new bounded
   implementation change. A direct Developer invocation is sufficient user
   intent to select `EXPEDITED` only when the initialized cycle still has
   `Active Work.Id: UNSET` and `Active Work.Request: UNSET`, or when there is no
   active cycle and the invocation starts a new cycle, subject to the
   post-`CANCELLED` baseline-reconciliation restrictions under **User Decisions
   and Intervention**. An explicit `STANDARD` selection takes precedence over
   this entry-role inference; Developer then does not own the initial standard
   state and must hand off to the role that does.
5. `EXPEDITED` is appropriate only while the active request is a sufficiently
   bounded implementation contract and no omitted workflow role is required to
   establish a consequential decision, authoritative project context, formal
   verification, documentation, final-deliverable review, or synchronization.
6. Skipping a role in `EXPEDITED` does not transfer that role's ownership to
   Developer or Reviewer. The role simply does not run, and its artifacts and
   completion guarantees are absent for that cycle.
7. An `EXPEDITED` cycle may be promoted to `STANDARD` under **Expedited
   Promotion**. Promotion is one-way for the active cycle.

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

`.standards/STATE.md` records exactly one `WorkflowState` value and one
`CycleMode` value at a time. `SIGNED_OFF` and `CANCELLED` are terminal states
and mean there is no active workflow cycle. In a terminal state, the persisted
`CycleMode` and `Active Work` describe the just-completed or cancelled cycle for
traceability until a `NEW_CYCLE` transition replaces them; they do not denote an
active cycle.

## Persisted Workflow State

`.standards/STATE.md` is the authoritative, branch-persisted record of the
current `WorkflowState`, `CycleMode`, active work, latest handoff, blocking user
question, and recovery context needed to resume work. It must be
version-controlled so work can resume across sessions and, once state changes
are shared through version control, by another agent or developer without
relying on chat history.

Before performing workflow work, read `.standards/PROTOCOL.md`,
`.standards/MODE.md`, and `.standards/STATE.md`. Resume from the state, active
work, handoff, and recovery context recorded in `STATE.md`; do not infer a
different state from chat history or from which artifacts happen to exist.

`STATE.md` uses this shape:

```markdown
# S.T.A.N.D.A.R.D.S. Workflow State

`WorkflowState`: `ARCHITECTING`
`CycleMode`: `STANDARD`

## Active Work

`Id`: `add-user-search` `Request`: `Add user search by name and email.` `Scope`:
`docs/scope/add-user-search.md` `Architecture`: `docs/specs/add-user-search.md`
`PromotionReason`: `NONE` `AuditTarget`: `NONE` `BlockedOn`: `NONE`

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

`Active Work` identifies the current cycle independently of chat history. `Id`
is a stable, user-readable identifier for the cycle. `Request` records the
requested change at enough fidelity for the initial role to understand the work.
`Scope` and `Architecture` are repository-relative artifact paths. Use `NONE`
before the owning role creates the artifact; Scoper and Architect must replace
those values with persisted artifact paths before their normal completion gates
pass. `PromotionReason` is `NONE` unless an `EXPEDITED` cycle has been promoted
to `STANDARD`; promotion sets it to the concise persisted reason the shorter
topology became insufficient. Preserve it for the remainder of that active cycle
so downstream roles do not depend on the latest handoff or chat history to know
that promotion occurred. It is workflow context, not a new user requirement,
scope decision, architecture decision, or project-baseline fact. `AuditTarget`
records a transient repository-relative path or area label
for an in-progress targeted audit only when that focus is not already
recoverable from persisted active work, scope, architecture, or recovery
context; otherwise use `NONE`. Auditor must persist an ad-hoc user-directed
audit target before relying on it, and clear `AuditTarget` when the targeted
audit completes, is abandoned, or no longer needs separate persistence.
`BlockedOn` records an unresolved user question that prevents the active role
from completing; otherwise use `NONE`.

`CycleMode` records the assurance topology for the active cycle. `STANDARD`
uses the full topology for the current `ProjectMode`. `EXPEDITED` uses the
bounded brownfield topology defined below. In an expedited cycle, `Scope` and
`Architecture` normally remain `NONE`; their absence is intentional and must
not be treated as a missing-artifact failure unless the cycle has been promoted
to `STANDARD`.

Installation may initialize `Id` and `Request` as `UNSET` because the installer
may not know the first request. Before the first workflow role performs
substantive work, persist the user's request in `Active Work` and replace
`UNSET` with a stable `Id` and request text. Every later new-cycle transition
must initialize `Active Work` from the new user request as part of the
transition.

`Handoff.Kind` is one of `INITIAL`, `FORWARD`, `FAILURE`, `RESUME`, `PROMOTE`,
`USER_REWORK`, `NEW_CYCLE`, `SIGNOFF`, or `CANCEL`. Use `NONE` for fields that
do not apply. Keep `Reason` concise; it describes only the most recent
transition and is not the authoritative record of outstanding recovery work. Use
`RESUME` for every recovery-frame completion that returns to `ResumeAt`, and for
any other recovery-directed transition that is not the normal forward handoff.

`Recovery` is a stack. Frames are ordered oldest to newest; the last frame is
the active frame. A frame preserves one outstanding corrective obligation even
when another failure occurs during recovery. A workflow role owns the active
recovery frame only when the current `WorkflowState` equals that frame's
`Owner`. `RerunThrough` is `NONE` until the owner resolves the defect; if
completed downstream work must be re-established before the interrupted state
can resume, the owner sets `RerunThrough` to the last state in that required
rerun sequence. Recovery being active does not, by itself, make every role that
runs during the recovery path responsible for resolving or resuming that frame.

State changes follow these rules:

1. Installation initializes `STATE.md` from the selected mode template:
   `SCOPING` for `GREENFIELD` or `AUDITING` for `BROWNFIELD`, with
   `CycleMode: STANDARD`, `Handoff.Kind` set to `INITIAL`, `Active Work` unset,
   and recovery inactive.
2. Before substantive work begins on an initialized brownfield cycle, an
   explicit user request may select `EXPEDITED` under **Cycle Modes**. Persist
   `CycleMode: EXPEDITED`, change `WorkflowState` to `DEVELOPING`, initialize
   `Active Work` with `PromotionReason: NONE`, keep `Handoff.Kind: INITIAL`, and
   record a concise reason for
   the expedited entry. Otherwise the initialized cycle remains `STANDARD`.
3. Before substantive work begins on an initialized cycle, record the user
   request in `Active Work`. Every legal state-changing handoff updates the
   applicable `CycleMode`, `Active Work`, `Handoff`, and `Recovery` fields as
   part of the transition.
4. `NAVIGATOR` never changes `STATE.md`.
5. Blocking user questions do not change workflow state. Record the question in
   `Active Work.BlockedOn` before asking, and clear it when the answer is
   incorporated.
6. Failure and recovery transitions follow **Failure Handoffs** and **Recovery
   Mechanics** below.
7. Expedited-to-standard transitions follow **Expedited Promotion** below.
8. User-requested rework, cancellation, sign-off, and new-cycle transitions
   follow **User Decisions and Intervention** below.
9. During the initial greenfield cycle, Developer changes `.standards/MODE.md`
   permanently from `GREENFIELD` to `BROWNFIELD` when the first material project
   implementation change succeeds. After that transition, recovery and
   cancellation use brownfield semantics regardless of the current
   `WorkflowState`.

`STATE.md` does not replace role-owned artifacts. Scope, architecture, project
context, implementation, verification, review, and documentation remain
authoritative in their own artifacts; the state file stores only enough
transition context to resume the workflow safely.

`.standards/CONTEXT.md` is the canonical Auditor-owned project-context artifact.
Auditor creates or refreshes it when `AUDITING` runs; installation does not
fabricate it. When Auditor has established or refreshed it for the active
`STANDARD` cycle, downstream standard roles should treat it as that cycle's
project baseline, subject to the ownership and freshness rules below. In an
`EXPEDITED` cycle, an existing `CONTEXT.md` may be consulted as prior
project-context evidence but is not presumed to have been refreshed for the
active cycle. Any **Active-Cycle Non-Baseline Work** recorded there is scoped to
the `Active Work.Id` that produced it; it is not a permanent exclusion from
project baseline. An entry is applicable only while the workflow is in a nonterminal
state and its recorded cycle matches the current `Active Work.Id`. `SIGNED_OFF` and
`CANCELLED` have no active cycle, so matching entries are stale cycle-scoped
context there as well. On a later audit, Auditor must reconcile each prior-cycle
exclusion against current repository and version-control evidence, remove or
reclassify it rather than copying it forward as current-cycle state, and block
for user clarification when its baseline status cannot be established safely.
`ProjectMode: GREENFIELD` means the project entered S.T.A.N.D.A.R.D.S. without a
meaningful pre-existing implementation baseline and Developer has not yet
created or materially modified project implementation; it does not mean project
context must be absent. Initial greenfield Scoping and Architecture may
legitimately run before the first audit, but any later rerun of Scoping or
Architecture must read and use an existing `CONTEXT.md` when relevant instead of
ignoring it solely because the project is still `GREENFIELD`. Once Developer
first creates or materially modifies project implementation, `ProjectMode` is
permanently `BROWNFIELD` even if recovery later returns to an earlier workflow
state.

`.standards/MODE.md` and `.standards/STATE.md` are protocol-owned coordination
artifacts, not role-owned workflow artifacts. A role or user may change them
only as required by a legal protocol transition or by a protocol-required
coordination update such as initializing `Active Work`, recording an artifact
path, selecting or promoting `CycleMode`, setting or clearing
`PromotionReason`, setting or clearing `AuditTarget`, or setting or clearing
`BlockedOn`.
`.standards/PROTOCOL.md` is framework-owned and may be changed only by
installing or upgrading the framework, not by a workflow role.

## Acceptance Traceability

Traceability follows Scoper-owned scope acceptance conditions through downstream
role-owned artifacts. It does not create a shared traceability artifact or add
acceptance data to `STATE.md`.

These traceability obligations apply to `STANDARD` cycles. `EXPEDITED` cycles
do not fabricate Scoper-owned acceptance conditions or substitute identifiers.
If an expedited cycle is promoted, Scoper establishes the acceptance conditions
when the resulting standard workflow reaches `SCOPING`.

1. Scoper represents every verifiable in-scope obligation that must be proven at
   completion as one or more scope-level acceptance conditions and assigns each
   a stable, unique `AC-NNN` identifier within the active cycle. Do not combine
   separable obligations under one identifier when their satisfaction or
   verification evidence is established in different workflow phases. The
   identifier is a reference, not an ordering guarantee.
2. During REPLAN, preserve the identifier when the acceptance condition keeps
   the same meaning. Assign a new, previously unused identifier to a new or
   materially replaced condition. When a condition is removed or materially
   replaced, retain its identifier in the scope's retired-identifier record. Do
   not renumber surviving identifiers or reuse retired identifiers within the
   active cycle.
3. Scoper owns the wording and meaning of scope-level acceptance conditions.
   Downstream roles reference their identifiers but must not redefine their
   intent. Route a material acceptance-condition defect to Scoper.
4. Architect accounts for every current acceptance identifier in the technical
   design. For each identifier, record either the relevant technical design
   coverage or an explicit no-architectural-impact disposition when satisfaction
   depends entirely on established nontechnical behavior or work owned by
   another workflow phase. Architect may group identifiers only when the same
   disposition applies. Do not invent architecture or claim the technical design
   satisfies a condition it does not own.
5. When a downstream role records coverage, work, or evidence for a scope
   acceptance condition, it references the same current acceptance identifier.
   Downstream roles do not create substitute requirement identifiers for the
   same condition.
6. Tester accounts for every current acceptance identifier. For a condition
   whose satisfaction should be established by `TESTING`, record a verification
   result with supporting evidence or an explicit blocker. If a condition
   explicitly depends on work owned by a later workflow phase, record that
   dependency as pending rather than treating the not-yet-run phase as a Tester
   blocker; pending status is not verification evidence and must be resolved
   downstream under the same acceptance identifier.
7. The workflow must not transition to `AWAITING_USER_SIGNOFF` while any current
   acceptance identifier lacks sufficient verification evidence or has an
   unresolved blocker. Missing or failed evidence must be routed to the role
   that owns the defective artifact or decision under the normal failure and
   recovery rules; do not treat an unevidenced condition as satisfied by
   assumption.
8. When Scoper adds, replaces, or retires acceptance identifiers during recovery
   or user rework, any completed downstream artifact whose completion contract
   requires accounting for every current acceptance identifier becomes stale
   until reconciled. Include those states in downstream invalidation under
   **Recovery Mechanics** even when the underlying technical decision or
   behavior otherwise remains valid.

## Expedited Cycle Contract

An `EXPEDITED` cycle intentionally provides a narrower completion contract than
a `STANDARD` cycle.

1. `EXPEDITED` is valid only when `ProjectMode` is `BROWNFIELD`.
2. `Active Work.Request` is the persisted change contract. `Scope` and
   `Architecture` remain `NONE` unless the cycle is later promoted and those
   roles create their owned artifacts.
3. Existing `.standards/CONTEXT.md` may be consulted when useful, but an
   expedited cycle does not require Auditor to refresh project context before
   Developer acts. An **Active-Cycle Non-Baseline Work** entry applies only when
   its recorded cycle matches the current `Active Work.Id`; a prior-cycle entry
   is stale workflow context and must not be treated as a current exclusion. If
   the baseline status of such work matters to the expedited change and cannot
   be established safely without Auditor-owned context, promote the cycle rather
   than assigning Auditor ownership to Developer.
4. Implementation produced during the active expedited cycle remains tentative
   active-cycle work. If the cycle is promoted, persist the promotion reason in
   `Active Work.PromotionReason`. Auditor must not convert those
   changes into established project-context facts merely because they are now
   present in the repository. Auditor must distinguish pre-cycle baseline from
   active-cycle changes using existing context, version-control evidence, the
   active request, and other authoritative evidence. If that distinction is
   materially ambiguous, Auditor must block and ask the user rather than
   laundering the tentative implementation into `.standards/CONTEXT.md`.
5. Developer owns implementation and its normal implementation-level
   self-checks. Those checks do not become Tester-owned formal verification and
   must not be represented as such.
6. Reviewer still owns `REVIEWING_IMPLEMENTATION`. An expedited implementation
   review evaluates the bounded change and may route implementation defects
   through normal recovery.
7. Scoper, Architect, Auditor, Tester, Documenter, `REVIEWING_FINAL`, and
   Synchronizer are intentionally absent from the expedited forward topology.
   Their missing artifacts or gates are not failures merely because they did
   not run.
8. An expedited cycle may reach `AWAITING_USER_SIGNOFF` after Developer and
   implementation Reviewer complete their applicable gates, recovery is empty,
   and no blocking user question remains. Scope-level acceptance traceability is
   not required because no Scoper-owned acceptance identifiers exist.
9. If completing the request safely requires any omitted role or guarantee,
   promote the cycle to `STANDARD` instead of weakening role ownership or
   fabricating skipped artifacts.

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

The role that discovers a failure does not automatically own the fix. Route the
failure to its owning role.

## Forward Transitions

A forward transition occurs only after the current state's completion gate
succeeds.

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

`ARCHITECTING -> DEVELOPING` in `BROWNFIELD` work requires valid project context
for the active `STANDARD` cycle. If required project context is missing,
materially incomplete, incorrect, or unexpectedly invalidated, route to
`AUDITING` instead. Planned implementation changes within the active cycle do
not by themselves make project context stale.

### Expedited Brownfield

```text
DEVELOPING
-> REVIEWING_IMPLEMENTATION
-> AWAITING_USER_SIGNOFF
```

This topology is valid only while `ProjectMode: BROWNFIELD` and
`CycleMode: EXPEDITED`. The absence of skipped standard states is intentional;
do not synthesize their work inside Developer or Reviewer.

## Expedited Promotion

Promotion changes an active `EXPEDITED` cycle into a `STANDARD` brownfield
cycle when the bounded path is no longer sufficient. Promotion is a topology
change, not a failure handoff.

Promote when the active role determines that safe completion requires formal
Scoping, consequential Architecture, authoritative Auditor-owned project
context, Tester-owned verification, Documentation, Final Review,
Synchronization, or another guarantee intentionally omitted by the expedited
contract.

Promotion rules:

1. Promotion is valid only from a nonterminal `EXPEDITED` brownfield cycle.
2. The active role may promote without first fabricating work owned by a skipped
   role. At `AWAITING_USER_SIGNOFF`, promotion requires user authorization
   because the state is user-owned. An explicit request to promote qualifies,
   and an explicit rework request whose changed contract requires a skipped
   standard role or guarantee also qualifies; do not require a second
   confirmation merely to name the topology change that the requested rework
   makes necessary.
3. Set `CycleMode: STANDARD`, set `WorkflowState: AUDITING`, record
   `Handoff.Kind: PROMOTE`, set `From` to the interrupted state, use
   `FailureType: NONE`, and record a concise reason explaining which standard
   guarantee is now required. Persist that same reason in
   `Active Work.PromotionReason`; unlike `Handoff.Reason`, it remains available
   after later forward handoffs overwrite the latest handoff.
4. Preserve the active cycle's `Id` and `Request`. Do not fabricate, rewrite, or
   delete role-owned artifacts during promotion. `Scope` and `Architecture`
   normally remain `NONE` until their owning roles run. Implementation already
   produced by the expedited cycle remains tentative active-cycle work; the
   promotion does not make it part of the established project baseline.
5. Auditor must establish or refresh context without treating tentative
   active-cycle implementation as a pre-existing constraint. If the pre-cycle
   baseline cannot be distinguished from expedited changes with sufficient
   confidence, Auditor blocks for user clarification instead of guessing.
6. Clear the recovery stack. The standard brownfield topology restarts at
   `AUDITING` and supersedes any outstanding expedited-only resume path; all
   required standard gates are re-established from that point forward.
7. Promotion is one-way for the active cycle. Do not return it to `EXPEDITED`.
8. After promotion, all standard forward, failure, recovery, traceability, and
   sign-off rules apply.

## Failure Handoffs

A failure handoff changes workflow state to the owner of the defective artifact
or decision.

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

In a `STANDARD` cycle, route failures according to the table above. In an
`EXPEDITED` cycle, a failure may route directly only to a state that exists in
the expedited topology: `DEVELOPING` for an `IMPLEMENTATION` failure or
`REVIEWING_IMPLEMENTATION` for an implementation `REVIEW` failure. If the
defect or newly required guarantee belongs to Scoper, Architect, Auditor,
Tester, Documenter, final Reviewer, or Synchronizer, do not enter that skipped
state through a `FAILURE` handoff. Promote the cycle under **Expedited
Promotion** and let the resulting `STANDARD` topology establish or correct the
owned artifact.

If a legal failure handoff moves to a different state, recovery proceeds
according to **Recovery Mechanics**. A same-state failure records the failure
handoff but does not create a new recovery frame.

## Recovery Mechanics

This section is the canonical recovery algorithm for all workflow roles.
Individual skills define only how their role corrects its owned artifact or
decision, how its completion gate works, and which previously completed
downstream states its correction invalidates.

Recovery follows the active `CycleMode` topology. An expedited recovery reruns
only states that exist in the expedited topology. If the work instead requires
a skipped standard role or guarantee, use **Expedited Promotion**. Promotion is
the explicit exception to preserving the expedited recovery stack: because it
restarts the active cycle under the complete standard brownfield topology, its
outstanding expedited-only resume paths are superseded and cleared as defined
there.

1. **Create a frame when corrective routing changes state.** For a `FAILURE` or
   `USER_REWORK` transition that moves to a different state, push a frame with
   `From` equal to the interrupted state, `Owner` equal to the corrective target
   state, the applicable `FailureType` and `Reason`, `ResumeAt` equal to the
   interrupted state, and `RerunThrough: NONE`. A same-state corrective
   transition does not create a new frame.
2. **Preserve nested obligations.** A new failure or user rework during recovery
   pushes another frame. Never overwrite or discard older frames merely because
   a newer corrective obligation exists. The last frame is always the active
   frame.
3. **Only the frame owner plans its resume.** A role owns the active frame only
   when the current `WorkflowState` equals that frame's `Owner`. After
   correcting the defect and passing its normal completion gate, the owner
   determines which previously completed downstream states, if any, must be
   re-established before `ResumeAt` can safely resume.
4. **Resume directly when no rerun is required.** If no completed downstream
   state must be re-established, pop the active frame and transition directly to
   its `ResumeAt` with `Handoff.Kind: RESUME`.
5. **Persist a rerun boundary when downstream work was invalidated.** If reruns
   are required, set `RerunThrough` to the last state that must complete and
   transition to the earliest required rerun state. The active frame remains on
   the stack.
6. **Downstream reruns use normal role gates.** Roles encountered during the
   rerun are not owners of that frame. They perform their normal completion
   gates and normal legal forward handoffs while preserving the full recovery
   stack, unless they discover a new defect that creates a nested frame.
7. **The boundary returns explicitly to the interrupted state.** After the role
   at `RerunThrough` passes its completion gate, it pops the active frame and
   transitions to that frame's `ResumeAt` with `Handoff.Kind: RESUME` instead of
   taking its normal forward handoff. This explicit return is valid even when
   `ResumeAt` is outside the current project's normal forward topology.
8. **Recovery ends only when the stack is empty.** Use `Handoff.Kind: RESUME`
   for any recovery-directed transition that is not a normal forward handoff.
   Older frames remain intact until each is completed in turn.

Examples:

```text
Architecture defect discovered during testing:
TESTING -> ARCHITECTING                 # push frame, ResumeAt TESTING
ARCHITECTING -> DEVELOPING              # set RerunThrough DEVELOPING
DEVELOPING -> TESTING                   # complete DEVELOPING, pop frame, resume TESTING

Scoping defect discovered during implementation review:
REVIEWING_IMPLEMENTATION -> SCOPING     # push frame, ResumeAt REVIEWING_IMPLEMENTATION
SCOPING -> ARCHITECTING                 # set RerunThrough TESTING
ARCHITECTING -> DEVELOPING -> TESTING
TESTING -> REVIEWING_IMPLEMENTATION     # complete TESTING, pop frame, resume review

Invalid project context discovered during architecture:
ARCHITECTING -> AUDITING                # push frame, ResumeAt ARCHITECTING
AUDITING -> ARCHITECTING                # no pre-resume rerun required; pop and resume

Nested recovery whose resume target is outside the rerun topology:
TESTING -> AUDITING                     # outer frame, ResumeAt TESTING
AUDITING -> SCOPING                     # nested user-rework frame, ResumeAt AUDITING
SCOPING -> ARCHITECTING                 # nested frame sets RerunThrough DEVELOPING
ARCHITECTING -> DEVELOPING
DEVELOPING -> AUDITING                  # complete boundary, pop nested frame, explicit resume
```

## Commit Message Guidance

After completing role work, if the role produced a meaningful set of repository
changes suitable for one atomic commit, provide the user with a suggested Git
commit message. Do not create the commit unless the user explicitly requests it.
Routine coordination-only changes such as advancing `.standards/STATE.md` do
not, by themselves, justify a commit suggestion.

Suggested messages must follow Conventional Commits:

```text
<type>(<optional-scope>): <description>
```

Choose the type and optional scope from the actual repository changes, not from
the workflow state or role name. Common types include `feat`, `fix`, `docs`,
`test`, `refactor`, `perf`, `build`, `ci`, and `chore`. Keep the description
concise, imperative, and specific. Use breaking-change syntax or footers only
when the change is actually breaking.

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

`NAVIGATOR` never provides a commit suggestion because it is strictly
non-mutating. Other roles provide one only when their work produced meaningful
committable changes; a role that produced no such changes omits it. If both a
commit suggestion and a next-role invocation are emitted, present the commit
suggestion first.

## Handoff Rules

1. A forward handoff requires the current role's completion gate to pass.
2. A failure handoff does not require the current role to repair work it does
   not own.
3. A handoff must identify the target role or workflow state and, for failures,
   the `FailureType`. A `REVIEW` failure must target the Reviewer state
   corresponding to the affected `ReviewKind`.
4. A role must not silently change an artifact or decision owned by another
   role.
5. Corrective handoffs and downstream reruns follow **Recovery Mechanics**;
   role-specific skills must not redefine that algorithm.
6. User sign-off follows **User Decisions and Intervention**.
7. User-requested changes while a cycle is active follow **User Decisions and
   Intervention**.
8. User cancellation follows **User Decisions and Intervention**, including the
   greenfield bootstrap-reset exception.
9. New-cycle transitions follow **User Decisions and Intervention**.
10. Expedited promotion follows **Expedited Promotion** and must not be encoded
    as a `FAILURE` merely because the shorter topology proved insufficient.
11. Every handoff that changes workflow state must update `.standards/STATE.md`,
    including its active-work, handoff, and recovery fields, according to the
    persisted-state rules above.
12. After a legal handoff changes workflow state to a state owned by a different
    workflow role, the agent performing the handoff must provide the user with a
    concise copy/paste invocation for the next role, unless the user explicitly
    invoked that target workflow skill in the same instruction and it will
    continue immediately in the resulting state. Persist the state change before
    presenting any invocation. The message is convenience only;
    `.standards/STATE.md` and role-owned artifacts remain authoritative.
13. A next-role handoff message should identify the next role and invoke its
    explicit skill using the active coding client's syntax, while directing it
    to resume from `.standards/STATE.md`. Do not duplicate scope, architecture,
    recovery reasons, or other authoritative workflow content into the message
    unless needed to disambiguate the invocation. Use `$<skill>` in Codex and
    `/<skill>` in Claude Code. Use the current state to choose one of these
    forms:

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

14. Do not emit a next-role invocation when the workflow remains with the same
    role, a blocking user question is unresolved, the resulting state is
    `AWAITING_USER_SIGNOFF`, `SIGNED_OFF`, or `CANCELLED`, or Navigator is used.
    At `AWAITING_USER_SIGNOFF`, present the available user actions instead.
15. `NAVIGATOR` may be invoked from any state but must not mutate artifacts or
    change workflow state.

## User Decisions and Intervention

These transitions are user-authorized control-plane actions. The agent receiving
an explicit, unambiguous user instruction may persist the required coordination
change even when it does not own the current `WorkflowState`. That exception
authorizes only the protocol transition itself. Afterward, role-owned work may
proceed only when the user explicitly invoked that workflow skill and it owns
the resulting state; otherwise stop after persisting the transition and provide
the next-role invocation when the handoff rules require one.

- **Select expedited mode for the initialized cycle:** before substantive work
  begins and while `Active Work.Id` and `Active Work.Request` are still `UNSET`,
  a brownfield user may explicitly request `EXPEDITED` or, when they have not
  explicitly selected `STANDARD`, invoke Developer with the new bounded
  implementation request. Set `CycleMode: EXPEDITED`, set
  `WorkflowState: DEVELOPING`, initialize `Active Work` with
  `PromotionReason: NONE`, keep `Handoff.Kind: INITIAL`, use `From: NONE` and
  `FailureType: NONE`, record a concise expedited-entry reason, and keep recovery
  inactive. This selection is not available in `GREENFIELD`.

- **Promote an expedited cycle:** from any nonterminal `EXPEDITED` brownfield
  cycle, an explicit user instruction may authorize the `PROMOTE` transition
  defined by **Expedited Promotion**, including from `AWAITING_USER_SIGNOFF`.
  This user authorization is a control-plane action only; after promotion, stop
  and hand off to Auditor unless Auditor was explicitly invoked in the same
  instruction. An active workflow role may also promote without a separate user
  instruction when the expedited contract becomes insufficient.
- **Rework an active cycle:** from any nonterminal state, update
  `Active Work.Request` when the request changed, identify the earliest owned
  artifact or decision invalidated by the change, record
  `Handoff.Kind: USER_REWORK` with the corresponding `FailureType`, and route to
  that owning state. If routing changes state, create the recovery frame defined
  by **Recovery Mechanics** with `ResumeAt` equal to the interrupted state.
  Existing recovery frames remain intact. Do not classify user-requested changes
  as agent-discovered failures. In `EXPEDITED`, bounded implementation rework
  routes to `DEVELOPING`; if the changed request now requires a skipped standard
  role or guarantee, promote under **Expedited Promotion** instead of inventing
  that role's work.
- **Cancel an active cycle:** from any nonterminal state, if `ProjectMode` is
  `GREENFIELD`, follow **Greenfield Bootstrap Cancellation** below. If
  `ProjectMode` is `BROWNFIELD`, transition to `CANCELLED`, record
  `Handoff.Kind: CANCEL`, set `From` to the interrupted state, use
  `FailureType: NONE`, preserve `Active Work` for traceability, and clear
  recovery. Cancellation does not revert project artifacts. Project changes
  produced during the cancelled cycle may remain physically present, but
  cancellation does not by itself make them established project baseline.
- **Sign off:** from `AWAITING_USER_SIGNOFF`, transition to `SIGNED_OFF`, record
  `Handoff.Kind: SIGNOFF`, set `From: AWAITING_USER_SIGNOFF`, use
  `FailureType: NONE`, and clear recovery. The cycle is complete.
- **Start a new cycle:** from `SIGNED_OFF` or a retained `CANCELLED` state,
  select the new `CycleMode`, record `Handoff.Kind: NEW_CYCLE`, set `Handoff.From`
  to the prior terminal state, use `FailureType: NONE`, record a concise reason
  for starting the new cycle, initialize `Active Work.Id` and
  `Active Work.Request` from the new request, reset `Scope`, `Architecture`,
  `PromotionReason`, `AuditTarget`, and `BlockedOn` to `NONE`, and clear
  recovery. Before replacing `Active Work` from retained `CANCELLED`, preserve
  the cancelled cycle's `Active Work.Id` and a brief summary of its `Request` in
  `Handoff.Reason` whenever post-cancellation baseline reconciliation is
  required. This handoff metadata is the durable provenance Auditor uses until
  the reconciliation audit completes; do not rely on chat history to recover the
  cancelled request. `STANDARD` is the default. A brownfield user may select `EXPEDITED`
  explicitly or, when they have not explicitly selected `STANDARD`, by invoking
  Developer as the entry role for a new bounded implementation request. However,
  when the prior terminal state is retained `CANCELLED`, do not enter
  `EXPEDITED` unless the user explicitly confirms that no project changes from
  the cancelled cycle remain because no such changes were produced or they were
  reverted. If the user wants to retain or adopt project changes from the
  cancelled cycle, require `CycleMode: STANDARD` so Auditor can reconcile those
  changes into the project baseline before later roles rely on them. Without the
  required no-residue confirmation, require `CycleMode: STANDARD`, set
  `WorkflowState: AUDITING`, and make `Handoff.Reason` identify the cancelled
  cycle by its prior `Active Work.Id`, briefly summarize that cycle's request,
  and state that baseline reconciliation after cancellation is required. For
  other `STANDARD` starts, set the initial `WorkflowState` from `ProjectMode`; for
  allowed `EXPEDITED` starts, require `ProjectMode: BROWNFIELD` and set
  `WorkflowState: DEVELOPING`. The prior cycle is not reopened. A greenfield bootstrap
  cancellation has no retained runtime and therefore requires a fresh installation
  before future workflow work; that installation must select `ProjectMode` again from
  the project's then-current state using the normal installation rules.

At `AWAITING_USER_SIGNOFF`, the available user actions are sign off, request
rework, or cancel. For an `EXPEDITED` cycle, the user may also explicitly
promote the active cycle to `STANDARD`; apply **Expedited Promotion** and hand
off to Auditor. Rework uses the active-cycle rule above. Bounded expedited
rework creates the normal recovery path back to `AWAITING_USER_SIGNOFF`; if the
requested rework requires a skipped standard role or guarantee, the rework
request itself authorizes the required promotion and the standard brownfield
topology restarts at `AUDITING` instead. For `STANDARD`, sign-off remains
subject to full acceptance traceability and all standard gates. For
`EXPEDITED`, sign-off covers the narrower **Expedited Cycle Contract**; do not
represent skipped standard phases as having completed.

### Greenfield Bootstrap Cancellation

If a cycle is cancelled while `ProjectMode` is still `GREENFIELD`, no project
implementation has yet been produced by the workflow and the bootstrap should
not be retained as project state. Treat the cancellation as a S.T.A.N.D.A.R.D.S.
reset rather than as a reusable terminal cycle.

The reset must:

- before removing the runtime, read `.standards/INSTALLATION.json` and revert
  only client-setting mutations recorded there as created by S.T.A.N.D.A.R.D.S.;
  remove a recorded setting only when its current value still exactly matches
  the recorded installed value, and otherwise preserve it unchanged; settings
  absent from the manifest are never claimed or removed by the reset;
- remove the `.standards/` runtime directory, including protocol, installation
  manifest, mode, state, project context, and other S.T.A.N.D.A.R.D.S.-owned
  runtime files;
- remove project-local S.T.A.N.D.A.R.D.S. skill installations or other framework
  files that were injected by the installer;
- remove the bounded S.T.A.N.D.A.R.D.S.-managed integration block from
  `AGENTS.md` and `CLAUDE.md`; after removing the block, delete the file only
  when no non-whitespace content remains, otherwise preserve the remaining
  content exactly;
- leave project files and role-owned workflow artifacts outside the
  S.T.A.N.D.A.R.D.S. runtime untouched, including scope, architecture,
  implementation, tests, reviews, and documentation produced or modified during
  the cancelled cycle.

S.T.A.N.D.A.R.D.S. does not attempt to restore the project working tree to its
pre-cycle state. Reverting or removing project changes from a cancelled
bootstrap cycle is the user's responsibility, typically through version control
or another project-specific recovery mechanism.

Do not decide whether to delete `AGENTS.md` or `CLAUDE.md` based on whether
S.T.A.N.D.A.R.D.S. originally created the file. Managed block boundaries define
framework ownership; content outside those boundaries is user-owned for reset
purposes. An existing unbounded `@AGENTS.md` import in `CLAUDE.md` is therefore
preserved.

Do not rely on a persisted `CANCELLED` state after this reset because the state
file itself is removed. The next S.T.A.N.D.A.R.D.S. workflow attempt must begin
with a fresh installation. That installation must re-evaluate the project's
then-current state and select `GREENFIELD` or `BROWNFIELD` using the normal
Project Mode rules; do not preserve the cancelled bootstrap's former
`GREENFIELD` classification across reinstall.

This exception applies only while `ProjectMode` remains `GREENFIELD`. Once
Developer has produced the first material project implementation change,
`ProjectMode` is permanently `BROWNFIELD`; cancellation must then preserve the
installed runtime and workflow history and enter retained terminal `CANCELLED`,
even if recovery has moved `WorkflowState` back to an earlier phase.

## Installed Runtime Contract

An installed S.T.A.N.D.A.R.D.S. project should provide:

- `AGENTS.md`: the project-facing entrypoint that tells coding agents to follow
  the installed protocol and role skills;
- `CLAUDE.md`: a Claude Code compatibility entrypoint that imports `AGENTS.md`;
- `.standards/PROTOCOL.md`: the installed copy of this canonical protocol;
- `.standards/INSTALLATION.json`: installer-owned metadata recording only
  client-setting mutations that S.T.A.N.D.A.R.D.S. actually created and may
  later remove safely;
- `.standards/MODE.md`: the project's current `ProjectMode`;
- `.standards/STATE.md`: the branch-persisted active `WorkflowState`, active
  `CycleMode`, active-work identity, and resumable handoff/recovery context;
- the S.T.A.N.D.A.R.D.S. skills installed in the location required by the
  selected coding agent;
- client-specific invocation controls that keep workflow role skills
  user-invoked only: Codex skill adapters with
  `allow_implicit_invocation: false`, and Claude Code project settings with each
  installed S.T.A.N.D.A.R.D.S. workflow skill set to `"user-invocable-only"` in
  `skillOverrides`.

`.standards/MODE.md` must identify exactly one canonical `ProjectMode`. A
project installed as `GREENFIELD` must change this file permanently to
`BROWNFIELD` when Developer first successfully creates or materially modifies a
project implementation artifact. The mode must not revert during recovery or
later cycles.

`.standards/STATE.md` must identify exactly one canonical `WorkflowState` and
one canonical `CycleMode`, and follow the persisted active-work, handoff, and
recovery shape defined above. Installation initializes `CycleMode: STANDARD`
and initializes `WorkflowState` from `ProjectMode`; every legal state transition
or cycle-mode change updates it as defined above.

`.standards/INSTALLATION.json` is installer-owned metadata, not workflow state.
Initialize it on first installation and preserve/update it across normal
reinstalls and upgrades. It must record only configuration mutations that
S.T.A.N.D.A.R.D.S. itself created; compatible settings that already existed
before installation are not framework-owned and must not be added retroactively.

### Installer File Preservation

Installation must preserve existing project-level agent instructions while
keeping framework-owned files current. Installer behavior must be idempotent.
Before creating, replacing, updating, or removing a framework-controlled runtime
path or skill package, verify ownership deterministically:

- Treat the `.standards/` runtime as S.T.A.N.D.A.R.D.S.-owned only when
  `.standards/PROTOCOL.md` contains the `<!-- standards:framework-owned -->`
  marker. If `.standards/` already exists without that ownership marker, stop
  and report a path collision for user resolution; do not adopt, overwrite, or
  remove that runtime.
- Treat an existing installed skill package as S.T.A.N.D.A.R.D.S.-owned only
  when its root `SKILL.md` contains the `<!-- standards:framework-owned -->`
  marker. If a destination skill name already exists without that ownership
  marker, stop and report a skill collision for user resolution; do not
  overwrite, merge into, or remove that skill package.
- Framework-owned source `PROTOCOL.md` and root workflow `SKILL.md` files must
  carry the ownership marker so future installs, upgrades, and bootstrap resets
  can identify them deterministically. Do not infer ownership from a generic
  filename, skill name, directory name, or similar-looking content.

After ownership checks pass:

- If `AGENTS.md` does not exist, create it from `templates/common/AGENTS.md`.
- If `AGENTS.md` already exists, preserve all existing content and add the
  S.T.A.N.D.A.R.D.S. integration block if absent. If the block already exists,
  update only the content between `<!-- standards:start -->` and
  `<!-- standards:end -->`.
- If `CLAUDE.md` does not exist, create it from `templates/common/CLAUDE.md`.
- If `CLAUDE.md` already exists and already contains an unbounded `@AGENTS.md`
  import outside a S.T.A.N.D.A.R.D.S. integration block, preserve that import
  and do not add a framework-owned duplicate. Otherwise add or update a bounded
  S.T.A.N.D.A.R.D.S. integration block containing `@AGENTS.md`. If multiple
  unbounded imports already exist, preserve them and report the conflict for
  user resolution rather than deleting user-owned content.
- Replace or update `.standards/PROTOCOL.md` from the installed
  S.T.A.N.D.A.R.D.S. version during normal installation or upgrade only after
  runtime ownership has been verified as above. It is framework-owned and must
  not drift from the installed skills.
- Install or update the S.T.A.N.D.A.R.D.S. skill definitions for the selected
  coding agent during normal installation or upgrade only after each destination
  skill package has passed the ownership check above.
- For Codex, preserve the per-skill adapter policy
  `allow_implicit_invocation: false`. For Claude Code, create or safely merge
  `.claude/settings.json` so every installed S.T.A.N.D.A.R.D.S. workflow skill
  has `skillOverrides.<skill>: "user-invocable-only"`, while preserving
  unrelated Claude settings. For each required override: if the key is absent,
  add it and record that exact key/value in `.standards/INSTALLATION.json`; if
  the same value already exists and the manifest does not already own it,
  preserve it without recording ownership; if the current value conflicts with
  the explicit-only policy, report it for user resolution rather than silently
  choosing precedence. A manifest entry from an earlier installation remains
  valid only for the exact setting path and installed value it records.
- If `.standards/INSTALLATION.json` already exists in a verified
  S.T.A.N.D.A.R.D.S. runtime, preserve it during normal reinstallation and
  update only installer-owned metadata. If the manifest is unexpectedly missing
  from an otherwise verified runtime, stop and report the incomplete runtime;
  do not reconstruct configuration ownership by inference.
- If `.standards/MODE.md` or `.standards/STATE.md` already exists, preserve it
  during normal reinstallation. Initialize these files only when
  S.T.A.N.D.A.R.D.S. is first installed or when the user explicitly requests
  reinitialization.
- If `.standards/CONTEXT.md` exists, preserve it during installation or upgrade.
  It is an Auditor-owned workflow artifact, not framework-owned installation
  content.
- If existing project-level agent instructions conflict with the
  S.T.A.N.D.A.R.D.S. integration block or installed protocol, preserve both and
  report the conflict for user resolution. Do not silently overwrite project
  instructions, weaken the protocol, or choose precedence automatically.
  Workflow work must not proceed under unresolved contradictory instructions.
- Re-running installation must not duplicate either managed integration block,
  duplicate the Claude import, reset workflow mode/state, or erase
  project-specific instructions.

Workflow artifacts such as scopes, technical designs, project context, tests,
reviews, and documentation are created or updated by their owning roles when
those phases run. Installation should not fabricate completed workflow
artifacts.

## Canonical Terms

Use these terms consistently across all skills:

- **completed scope**: a scope artifact that has passed Scoper's completion
  gate. This does not imply separate user approval unless a project explicitly
  adds such a gate.
- **scope-level acceptance conditions**: observable outcomes owned by Scoper,
  each identified by a stable `AC-NNN` acceptance identifier for the active
  cycle.
- **acceptance identifier**: the stable `AC-NNN` reference assigned by Scoper to
  one scope-level acceptance condition and reused by downstream artifacts for
  traceability.
- **retired acceptance identifier**: an acceptance identifier whose condition
  was removed or materially replaced during the active cycle. Scoper preserves
  it in the scope so it cannot be reused; it is not a current coverage or
  verification obligation.
- **technical acceptance criteria**: technical conditions derived by Architect
  from scope-level acceptance conditions and linked to their acceptance
  identifiers.
- **project context**: the Auditor-owned baseline of relevant project state and
  constraints, stored canonically at `.standards/CONTEXT.md` and refreshed for
  the active workflow cycle when Auditor runs. The artifact may persist across
  cycles as evidence, but cycle-scoped non-baseline entries apply only under the
  lifecycle rules defined above. Planned implementation changes within a cycle
  do not automatically make the baseline stale. A `PROJECT_CONTEXT` failure
  means project context is materially incomplete, incorrect, or unexpectedly
  invalidated and must be refreshed before dependent work continues.
- **completion gate**: the conditions that must be satisfied before a role may
  perform a forward handoff.
- **failure handoff**: routing a defect to the role that owns the affected
  artifact or decision.
- **forward handoff**: advancing to the next legal workflow state after the
  current completion gate succeeds.
- **resume handoff**: the transition that completes a recovery frame by
  returning to its `ResumeAt`, or another recovery-directed transition that is
  not the normal forward handoff.
- **cycle mode**: the active cycle's assurance topology, persisted as
  `STANDARD` or `EXPEDITED` in `.standards/STATE.md`; it does not replace or
  redefine `ProjectMode`.
- **expedited cycle**: a bounded brownfield cycle that runs Developer followed
  by implementation Reviewer and may reach user sign-off without fabricating
  the standard roles or artifacts it intentionally skipped.
- **promotion handoff**: the one-way `PROMOTE` transition that changes an active
  expedited cycle to `STANDARD` and restarts the brownfield topology at
  `AUDITING` because a skipped standard guarantee is required.
- **recovery frame**: one outstanding corrective obligation on the `Recovery`
  stack, preserving the defect owner, reason, interrupted `ResumeAt` state, and
  any `RerunThrough` boundary that must complete before execution returns there.
- **active work**: the persisted identity, request, artifact references,
  promotion reason when applicable, transient audit target when needed, and
  blocking user question for the current active cycle; in a terminal state, the
  retained block describes the just-completed or cancelled cycle for
  traceability until `NEW_CYCLE` replaces it.

Do not introduce alternate names for these concepts inside individual skills
unless this protocol is updated first.
