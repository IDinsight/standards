# Subtree Audit

Use when a usable project-level `.standards/CONTEXT.md` already exists and the audit has an explicitly identified target area whose local facts require deeper inspection or refresh.

A subtree scan supplements the project baseline; it does not replace the need for a usable repository-level baseline.

## Procedure

1. Confirm that the existing project-level context remains usable outside the target area. If it does not, use the whole-repository or gap-fill mode instead.
2. Identify the target subtree from the active request, an upstream artifact, an active `PROJECT_CONTEXT` defect, or explicit human direction while Auditor owns `AUDITING`.
3. Inspect the target subtree and only the external code, shared packages, configuration, tests, or integrations needed to understand its real boundaries and dependencies.
4. Preserve still-valid global context. Replace or extend only the facts materially affected by the targeted scan.
5. Do not infer project-wide conventions from one subtree unless corroborating repository-level evidence establishes them.
6. Rewrite `.standards/CONTEXT.md` as one coherent baseline using `../template.md`; do not append a separate subtree audit log.

## Mode-specific completion condition

The project-level baseline remains intact, and the target area's relevant structure, behavior, constraints, dependencies, and evidence are accurate enough for the active cycle.
