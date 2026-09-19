<!-- standards:start -->
# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow.

Before performing workflow work:

1. Read `.standards/PROTOCOL.md` for the canonical roles, states, transitions, failure types, and shared terminology.
2. Read `.standards/MODE.md` for the project's current `ProjectMode`.
3. Read `.standards/STATE.md` for the branch's active `WorkflowState`.
4. If the active state is agent-owned, use the installed skill that owns that workflow state. If the state is `AWAITING_HUMAN_SIGNOFF`, do not advance until the human signs off, requests rework, or starts additional work.
5. Respect artifact ownership and route defects through protocol-defined failure handoffs.
6. Do not advance past a role until its completion gate succeeds. Update `.standards/STATE.md` on every legal handoff.

Navigator is strictly non-mutating and may be used at any time without changing workflow state.
<!-- standards:end -->

Project-specific agent instructions may be added outside the S.T.A.N.D.A.R.D.S. integration block as long as they do not contradict `.standards/PROTOCOL.md`.
