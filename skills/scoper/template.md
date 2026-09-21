# Scoper Artifact Template

This file is the authoritative artifact shape and authoring contract for the persisted scope owned by Scoper.

The scope defines **what must be built, why it matters, what is excluded, and what counts as done**. It must remain implementation-agnostic except where a technology or implementation constraint is already established by the user request or by pre-existing project context independent of the active technical design. A planned architectural constraint recorded in `.standards/CONTEXT.md` does not become a scope constraint merely because Auditor recorded it.

Both `PLAN` and `REPLAN` produce this same artifact shape. `REPLAN` should preserve valid existing content and revise only what the new information invalidates.

Omit empty sections. Add detail only when it materially reduces ambiguity.

---

# Project or Change Name

## Goal

Describe the intended outcome and why this work is needed. State the result the project or change must achieve without prescribing implementation.

## Constraints

- Required boundary, fixed condition, compatibility requirement, policy, platform limitation, performance bound, or other established constraint.
- Add only constraints that materially affect the scope.

## Non-goals

- Explicitly excluded outcome, capability, migration, integration, behavior, or adjacent work.
- Use this section to make important boundaries unambiguous.

## Work

### 1. Outcome-oriented work item

**Intent:** Explain why this work item exists and what user, system, or project outcome it serves.

**Done when:**
- Observable scope-level acceptance condition.
- Another externally verifiable behavior or required property, when needed.

**Depends on:** Other numbered work items, an established external dependency, or `None`.

### 2. Outcome-oriented work item

**Intent:** Why this work item exists.

**Done when:**
- Observable scope-level acceptance condition.

**Depends on:** Dependency or `None`.

## Assumptions

- Non-blocking assumption that is useful to preserve but is not yet established as fact.
- Do not record unresolved blocking decisions here; blocking questions belong in `Active Work.BlockedOn`.

---

## Authoring Rules

- Define **what** and **why**, not **how**.
- Keep work items coarse and outcome-oriented; do not turn the scope into a coding task list.
- Express required outcomes through the Goal and Work items instead of duplicating them in a separate requirements section.
- Write observable completion conditions. Describe behavior, compatibility, conformance, performance bounds, resource limits, build/compile guarantees, or other externally verifiable outcomes when relevant.
- Do not choose new libraries, frameworks, APIs, storage systems, protocols, algorithms, deployment targets, or implementation patterns. Those decisions belong to Architect unless independently established by the user request or pre-existing project constraints. Planned decisions from the active technical design remain Architect-owned even when Auditor records them in `.standards/CONTEXT.md`.
- Distinguish constraints, non-goals, and assumptions clearly.
- Record only non-blocking assumptions. Resolve blocking scope questions before Scoper completes.
- Record meaningful dependencies and ordering between work items.
- Preserve user intent and established boundaries during REPLAN. Do not silently expand, remove, or materially change requested outcomes.
- Keep the artifact concise. Add sections or detail only when they materially improve scope clarity.
