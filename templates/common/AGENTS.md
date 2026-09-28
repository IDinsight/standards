<!-- standards:start -->

# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. agent workflow. Workflow roles run only
when the user invokes their skill (`$<role>` in Codex, `/<role>` in Claude
Code); do not start or dispatch workflow work otherwise.

When a workflow role is invoked:

1. Read `.standards/PROTOCOL.md`, `.standards/MODE.md`, and
   `.standards/STATE.md` first, then follow the protocol and the invoked skill.
   The protocol is authoritative for cycle start, states, transitions, recovery,
   sign-off, and cancellation.
2. Use the tools in `.standards/bin/` as the protocol's **Runtime Tools and
   Hooks** describes. Get every cycle ID from `cycle.mjs new`; never write one
   yourself.
3. If `.standards/` has a merge conflict, stop and ask the user to resolve it.

Navigator never changes files or workflow state; its skill defines its boundary.

Project instructions may be added outside this block. When they conflict with
the protocol, follow its **Instruction Layering and Conflicts**.
<!-- standards:end -->
