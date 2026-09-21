# REPLAN Mode

Use REPLAN when `Active Work.Scope` identifies an existing persisted scope for
the active cycle and that scope must be corrected, revised, or reconciled with
changed inputs.

Typical triggers include a `SCOPING` recovery, user-requested rework, changed
upstream context, or an additional requirement introduced before the active
cycle is complete.

## Inputs

Use the Scoper skill's shared inputs and invariants. Also:

- read the full existing scope before editing it;
- read the active handoff and recovery frame, when present, to understand why
  replanning is required;
- read `.standards/CONTEXT.md` whenever it exists and is relevant, including
  during the initial `GREENFIELD` lifecycle after Auditor has already created
  it.

## Procedure

1. Identify the smallest set of scope statements, boundaries, work items,
   dependencies, or acceptance conditions invalidated by the new information.
2. Preserve valid existing intent and unaffected scope content. Do not rewrite
   the artifact merely for style or completeness.
3. Correct the owned scoping defect or incorporate the approved user-requested
   change without silently expanding, removing, or changing user intent.
4. Re-evaluate affected dependencies and observable completion conditions so the
   revised scope remains internally coherent.
5. If the revision exposes a blocking decision, persist it in
   `Active Work.BlockedOn` and stop until the user resolves it.
6. Persist the revised scope at the same `Active Work.Scope` path unless there
   is a substantive reason to relocate it; if relocated, update
   `Active Work.Scope`.
7. Apply the Scoper completion gate and the protocol's recovery/invalidation
   rules.

## Result

REPLAN succeeds when the existing active-cycle scope has been reconciled with
the new information while preserving unaffected intent.

After success, follow the shared Scoper completion, recovery, and handoff rules
in `SKILL.md` and the protocol. REPLAN does not independently choose the next
workflow state.
