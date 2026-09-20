# PLAN Mode

Use PLAN when the active workflow cycle does not yet have a persisted scope for `Active Work`.

PLAN creates the first completed scope for the current cycle. It does not mean the project itself is greenfield; a brownfield cycle normally reaches Scoper after Auditor and can still use PLAN when the new cycle has no current scope yet.

## Inputs

Use the Scoper skill's shared inputs and invariants. In particular:

- read `Active Work.Request` and explicit human constraints;
- read `.standards/CONTEXT.md` when it exists and is relevant;
- for brownfield work, require the active-cycle Auditor context;
- do not treat scopes from completed prior cycles as the current scope unless the active cycle explicitly adopts one as `Active Work.Scope`.

## Procedure

1. Establish the requested outcome, boundaries, constraints, non-goals, and non-blocking assumptions.
2. Resolve only ambiguities that materially change scope. Persist a blocking human question in `Active Work.BlockedOn` before asking it.
3. Break the work into coarse, outcome-oriented work items with observable completion conditions and meaningful dependencies.
4. Keep implementation choices out of the scope unless they are already established project constraints or requirements.
5. Persist the completed scope using the repository's existing scope location when appropriate; otherwise use a feature- or change-specific file under `docs/scope/`.
6. Record the repository-relative artifact path in `Active Work.Scope`.
7. Apply the Scoper completion gate and protocol-defined handoff behavior.

## Result

PLAN succeeds only when the active cycle now has one clear persisted scope that defines what must be built and what counts as done.

On normal success, hand off to Architect. If PLAN is executing while another recovery frame remains active, preserve that frame and still use Scoper's normal forward handoff unless Scoper discovers a new failure.
