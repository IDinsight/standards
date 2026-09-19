# S.T.A.N.D.A.R.D.S. — A Framework for Coding with Agents

- **S**coper
- **T**ester
- **A**rchitect
- **N**avigator
- **D**eveloper
- **A**uditor
- **R**eviewer
- **D**ocumenter
- **S**ynchronizer

## Global Invariants

1. The skill that discovers a problem does not automatically own the fix. It hands the problem back to the skill that owns the affected artifact or decision.
2. A forward transition only occurs when the current phase has completed successfully. Otherwise, use the appropriate failure handoff.

### Navigator

1. Strictly non-mutating.
2. Explains code, tests, documentation, Git history, and project context; traces execution; diagnoses issues; etc.
3. Can also grill you to ensure you have a solid understanding of your code.
4. Sits outside of standard flow and can be invoked at any time without changing workflow state.

## For Greenfield Projects

1. Scoper
2. Architect
3. Auditor
4. Developer -> Tester -> Reviewer -> Documenter -> Reviewer (Implementation cycle)
5. Synchronizer

## For Brownfield Projects

1. Auditor
2. Scoper
3. Architect
4. Developer -> Tester -> Reviewer -> Documenter -> Reviewer (Implementation cycle)
5. Synchronizer

## Allowed Transition States

1. Auditor -> Scoper (brownfield projects only)
2. Scoper -> Architect
3. Architect -> Auditor (greenfield/bootstrap projects only)
4. Architect -> Developer (brownfield or when project context is already current)
5. Auditor -> Developer
6. Developer -> Tester
7. Tester -> Reviewer (implementation review)
8. Reviewer -> Documenter
9. Documenter -> Reviewer (final deliverable review)
10. Reviewer -> Synchronizer
11. Synchronizer -> Human sign-off for next step

## Allowed Failure Handoffs

1. Code issue: Developer -> Tester -> Reviewer …
2. Test/verification issue: Tester -> Reviewer …
3. Architecture issue: Architect -> Developer -> Tester -> Reviewer …
4. Scoping issue: Scoper -> Architect -> Developer -> Tester -> Reviewer …
5. Documentation issue: Documenter -> Reviewer …
6. Project context/audit issue: Auditor -> Resume from the earliest affected owner/phase
