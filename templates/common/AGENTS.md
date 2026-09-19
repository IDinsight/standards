# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow.

Before performing workflow work:

1. Read `.standards/PROTOCOL.md` for the canonical roles, states, transitions, failure types, and shared terminology.
2. Read `.standards/MODE.md` for the project's `ProjectMode`.
3. Use the installed skill that owns the active workflow state.
4. Respect artifact ownership and route defects through protocol-defined failure handoffs.
5. Do not advance past a role until its completion gate succeeds.

Navigator is strictly non-mutating and may be used at any time without changing workflow state.

Project-specific agent instructions may be added below this line as long as they do not contradict `.standards/PROTOCOL.md`.
