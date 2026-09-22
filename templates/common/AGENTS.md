<!-- standards:start -->

# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow.

Before performing workflow work:

1. Read `.standards/PROTOCOL.md` for the canonical roles, states, transitions,
   failure types, and shared terminology.
2. Read `.standards/MODE.md` for the project's current `ProjectMode`.
3. Read `.standards/STATE.md` for the branch's active `WorkflowState`,
   `CycleMode`, `Active Work` (including any persisted `PromotionReason`), and
   handoff/recovery context. If this is the first real request and `Active Work`
   is `UNSET`, persist the request and any legal initial cycle-mode selection
   before substantive workflow work.
4. Read `.standards/CONTEXT.md` when it exists and the active role depends on
   project context. Initial greenfield Scoping/Architecture may run before it
   exists, but later reruns must not ignore an existing context file merely
   because the project is still `GREENFIELD`. Auditor owns this file; other
   roles must not silently rewrite it.
5. Workflow role skills are invoked explicitly by the user; do not auto-dispatch
   or model-invoke a role solely from `WorkflowState`. Use `$skill-name` in
   Codex and `/skill-name` in Claude Code. A workflow role may perform
   role-owned work only when it owns the active state. Explicit user
   instructions may authorize the protocol's narrow control-plane transitions
   (initial cycle-mode selection, user-authorized `PROMOTE`, `USER_REWORK`,
   `NEW_CYCLE`, `SIGNOFF`, or `CANCEL`) even from another role's or a user-owned
   state; after recording that transition, perform role work only if the invoked
   skill owns the resulting state. An active role may also perform the
   protocol-defined `PROMOTE` transition without a separate user instruction
   when an expedited cycle requires a skipped standard guarantee. Navigator is
   the exception and may be invoked from any state without mutation.
6. If the state is `AWAITING_USER_SIGNOFF`, do not advance until the user signs
   off, requests rework, cancels the cycle, or explicitly promotes an
   `EXPEDITED` cycle to `STANDARD`. If the state is `SIGNED_OFF` or `CANCELLED`,
   there is no active cycle; further requested work starts a new cycle.
7. Respect artifact ownership. Route defects and corrective reruns through
   `.standards/PROTOCOL.md` **Failure Handoffs** and **Recovery Mechanics**; do
   not redefine those mechanics in role-specific behavior. In `EXPEDITED`, a
   skipped role remains skipped rather than transferring its ownership; use
   **Expedited Promotion** if that role becomes necessary.
8. Persist blocking user questions in `Active Work.BlockedOn`. Do not advance
   past a role until its completion gate succeeds. Update all required
   `.standards/STATE.md` fields on every legal state-changing handoff.
9. Follow `.standards/PROTOCOL.md` for role-completion output rules, including
   commit suggestions and next-role invocations.

Navigator is strictly non-mutating and may be used at any time without changing
workflow state.

Project-specific agent instructions may be added outside the S.T.A.N.D.A.R.D.S.
integration block. If they conflict with `.standards/PROTOCOL.md` or the
integration block, stop workflow work and require user resolution rather than
silently choosing precedence.
<!-- standards:end -->
