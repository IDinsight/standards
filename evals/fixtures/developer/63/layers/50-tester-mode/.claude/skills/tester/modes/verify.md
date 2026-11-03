# Verify Mode

<!-- standards:invocation -->

```json
{
  "schemaVersion": 1,
  "kind": "mode",
  "group": "assessment",
  "id": "VERIFY",
  "label": "Verify",
  "description": "First full assessment of the active change: check every acceptance condition against the implementation and add scenarios within the budget.",
  "selection": "state",
}
```

Use for the first assessment of the active cycle's implementation, when no
earlier verification report exists for it.

## Procedure

1. Reconstruct the assignment from `.standards/STATE.md`, the scope, the
   design, project context, and the development plan.
2. Map every current acceptance condition and relevant technical criterion to
   existing coverage or a new scenario within the budget.
3. Add or update tests in the project's established locations and run them.
4. Record inputs, allocations, actual results, and gaps in the verification
   report.
