<!-- standards:start -->
# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow.

Before performing workflow work:

1. Read `.standards/PROTOCOL.md` for the canonical roles, states, transitions, failure types, and shared terminology.
2. Read `.standards/MODE.md` for the project's current `ProjectMode`.
3. Read `.standards/STATE.md` for the branch's active `WorkflowState` and any persisted handoff/recovery context.
4. If the active state is agent-owned, use the installed skill that owns that workflow state. If the state is `AWAITING_HUMAN_SIGNOFF`, do not advance until the human signs off or requests rework. If the state is `SIGNED_OFF`, there is no active cycle; further requested work starts a new cycle.
5. Respect artifact ownership and route defects through protocol-defined failure handoffs. Preserve active recovery context across nested corrective handoffs until the workflow returns to `Recovery.ResumeAt`.
6. Do not advance past a role until its completion gate succeeds. Update all required `.standards/STATE.md` fields on every legal state-changing handoff.

Navigator is strictly non-mutating and may be used at any time without changing workflow state.
<!-- standards:end -->

Project-specific agent instructions may be added outside the S.T.A.N.D.A.R.D.S. integration block. If they conflict with `.standards/PROTOCOL.md` or the integration block, stop workflow work and require human resolution rather than silently choosing precedence.
