<!-- standards:start -->
# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow.

Before performing workflow work:

1. Read `.standards/PROTOCOL.md` for the canonical roles, states, transitions, failure types, and shared terminology.
2. Read `.standards/MODE.md` for the project's current `ProjectMode`.
3. Read `.standards/STATE.md` for the branch's active `WorkflowState`, `Active Work`, and persisted handoff/recovery context. If this is the first real request and `Active Work` is `UNSET`, persist the request before substantive workflow work.
4. Read `.standards/CONTEXT.md` when it exists and the active role depends on project context. Initial greenfield Scoping/Architecture may run before it exists, but later reruns must not ignore an existing context file merely because the project is still `GREENFIELD`. Auditor owns this file; other roles must not silently rewrite it.
5. Workflow role skills are invoked explicitly by the human; do not auto-dispatch or model-invoke a role solely from `WorkflowState`. Use `$skill-name` in Codex and `/skill-name` in Claude Code. When a workflow role is invoked, proceed only if it owns the active state. If it does not, do not perform another role's responsibilities; report the expected role. Navigator is the exception and may be invoked from any state without mutation.
6. If the state is `AWAITING_HUMAN_SIGNOFF`, do not advance until the human signs off, requests rework, or cancels the cycle. If the state is `SIGNED_OFF` or `CANCELLED`, there is no active cycle; further requested work starts a new cycle.
7. Respect artifact ownership and route defects through protocol-defined failure handoffs. Preserve the full recovery stack across nested corrective handoffs and pop a frame only when workflow state reaches that frame's `ResumeAt`. A role applies the active frame's correction/resume logic only when the current `WorkflowState` equals that frame's `Owner`; other roles encountered during recovery perform their normal gates and forward handoffs while preserving the frame.
8. Persist blocking human questions in `Active Work.BlockedOn`. Do not advance past a role until its completion gate succeeds. Update all required `.standards/STATE.md` fields on every legal state-changing handoff.
9. After a legal transition to a state owned by a different workflow role, provide the protocol-defined copy/paste invocation for that next role using the active client's syntax. Treat that message only as user convenience; the persisted state and role-owned artifacts remain authoritative. Do not invoke the next workflow role yourself. Do not emit a next-role invocation for same-role continuation, unresolved blocking questions, human sign-off, terminal states, or Navigator.

Navigator is strictly non-mutating and may be used at any time without changing workflow state.
<!-- standards:end -->

Project-specific agent instructions may be added outside the S.T.A.N.D.A.R.D.S. integration block. If they conflict with `.standards/PROTOCOL.md` or the integration block, stop workflow work and require human resolution rather than silently choosing precedence.
