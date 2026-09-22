---
title: Runtime Files
description:
  Find the authoritative record for each part of an installed workflow.
---

The runtime coordinates workflow execution. It does not replace scope, design,
implementation, or evidence artifacts.

## Protocol and installation

**`.standards/PROTOCOL.md`** is the installed framework contract. Installation
or upgrade updates it together with the skills; a workflow role must not edit it
to redefine transitions.

**`.standards/INSTALLATION.json`** records installer-owned client-setting
changes. It is used to preserve user settings during upgrades and bootstrap
resets. A compatible setting that already existed is not automatically
framework-owned.

## Project mode

**`.standards/MODE.md`** contains exactly one `ProjectMode`: `GREENFIELD` or
`BROWNFIELD`. Developer records the permanent transition to brownfield after the
first successful material implementation change in a greenfield cycle.

## Workflow state

**`.standards/STATE.md`** is version-controlled and contains exactly one
`WorkflowState` and one `CycleMode` (`STANDARD` or `EXPEDITED`), plus these
records:

- **Active Work:** cycle identity and request, scope and architecture paths,
  persistent `PromotionReason`, transient audit target when needed, and a
  blocking user question when present.
- **Handoff:** the latest transition kind, originating state, failure type, and
  concise reason.
- **Recovery:** an oldest-to-newest stack of outstanding corrective obligations.
  The last frame is active.

`UNSET` is allowed for the first request and identifier at installation. Replace
it before substantive workflow work. Use `NONE` for fields that do not apply; a
new cycle resets its artifact paths, promotion reason, and transient fields.
`PromotionReason` is otherwise retained for the remainder of a promoted cycle,
even after later handoffs replace `Handoff.Reason`. Expedited scope and
architecture paths intentionally remain `NONE` until promotion and the owning
roles create those artifacts. In terminal states, the retained cycle mode and
active work describe the completed or cancelled cycle.

The [persisted-state contract](../protocol/#persisted-workflow-state) defines
every field and its update rules.

## Project context

**`.standards/CONTEXT.md`** is Auditor-owned. It captures the relevant baseline,
commands, boundaries, constraints, and evidence for downstream work. Auditor
creates it; installation preserves an existing file and does not invent one.

Context consulted during an expedited cycle is prior evidence, not necessarily a
baseline refreshed for that cycle. Auditor records material tentative
implementation separately from established baseline. Those exclusions apply only
to their matching, nonterminal cycle and require reconciliation on later audits.
See [Auditor](../../roles/auditor/#promotion-and-cancellation-audits).

## Agent integration

**`AGENTS.md`** contains a bounded framework integration block alongside any
project-owned instructions. **`CLAUDE.md`** imports it for Claude Code.
Installation preserves content outside managed boundaries and reports unresolved
instruction conflicts rather than choosing precedence.

Scope and architecture live at the paths recorded in active work. Their fallback
locations, `docs/scope/` and `docs/specs/`, are paths in the host project, not
Starlight's published content collection.
