---
title: Tester
description: Independently verify behavior and record acceptance evidence.
---

Tester owns tests and formal verification in `TESTING` during a `STANDARD`
cycle. It checks implementation and Developer's completion claims against the
persisted contract, then records actual evidence and gaps.

## Start in a fresh chat

After the handoff enters `TESTING`, open a fresh chat separate from Developer's
implementation conversation and use the line for your client:

```text
Codex:       $tester Continue the active workflow from `.standards/STATE.md`.
Claude Code: /tester Continue the active workflow from `.standards/STATE.md`.
```

For recovery, ask Tester to read the active recovery frame too. The handoff must
persist the needed context before requesting this session. A skill cannot erase
chat history or prove freshness without client support. If Tester knows it is in
Developer's conversation, it stops before formal verification and asks for a
fresh chat. If session metadata is unavailable, it states that limitation and
reconstructs its assessment from files without a routine confirmation question.
See the
[canonical session rule](../../reference/protocol/#independent-tester-session).

## Inputs and output

Tester reads the protocol, mode, state, current scope, architecture, Auditor
context, development plan, relevant repository evidence, and existing tests.
Scope and architecture define intended behavior; their defects still go back to
their owners. Developer's plan maps the implementation but does not define
acceptance or supply formal verification proof.

The active change can include committed work and affected unchanged boundaries.
An empty working-tree diff does not mean there is nothing to verify.

The [verification report](../../reference/templates/tester/) lives at
`docs/verification/<Active Work.Id>.md`. Its `VERIFICATION` marker and visible
cycle ID must match active work. No new state field is needed to find it. Tests
remain in established repository locations and can be reused across cycles.

The report records assessed inputs, acceptance coverage, scenario allocations,
commands and results, limitations, unresolved findings, and a concrete resume or
handoff action. Every current `AC-NNN` and relevant technical criterion needs a
disposition. Tests merely written or checks not executed are not passing
evidence.

## Modes

- **VERIFY:** establish tests, acceptance coverage, and execution evidence.
  Resume it after an interrupted initial pass when assessed inputs are
  unchanged.
- **REVERIFY:** reconcile an existing assessment after implementation,
  requirements, design, context, tests, or execution conditions change, or a
  verification defect is reported. Preserve valid coverage and replace
  invalidated evidence.

Both modes use one shared procedure and completion gate. A new chat or an
existing partial report alone does not select REVERIFY. A changed acceptance set
requires reconciliation even when the application code is unchanged.

Unit, component, integration, CLI, and system tests are techniques available in
either mode. Choose the boundary that proves the behavior. Tester uses universal
and relevant test-specific styles, established commands, fixtures, and package
conventions; it has no personal-style layer.

## A ceiling, not a quota

The default is at most five added or materially expanded high-value scenarios
per source file for the active change. Reuse existing coverage first. Existing
unchanged tests do not consume new allowance and are never removed to fit five.
The budget does not restrict running the existing regression suite.

A scenario is an independently meaningful setup/input and observable outcome,
not a function or assertion count. Parameterized cases count separately; a
cross-file scenario counts once against each source file whose changed behavior
it materially verifies. Incidental imports do not count. For property-based
checks, record the distinct behavioral properties/partitions and bounded
sampling strategy. Several obligations hidden in one test still count
separately.

Allocations persist across interruptions, REVERIFY, and recovery. Correcting or
replacing a test for the same scenario reuses its allocation. New invocations,
file renames, or splitting test files do not grant another five. Tester records
targeted user additions in the report. If the ceiling prevents required
acceptance verification, it records the gap and asks for the smallest targeted
increase before adding that coverage or claiming completion.

## Execution and defects

Tester normally executes appropriate checks without a routine “run tests?”
approval gate, while respecting real permissions and environment constraints. If
execution is unavailable or prohibited, it records the limitation and exact
remaining checks. Required missing evidence blocks completion. It does not
invent successful results or classify an unavailable service as an application
bug without evidence.

Tester corrects defective tests, fixtures, and test-only configuration. It
routes implementation defects to Developer, scope defects to Scoper, design
defects to Architect, and context defects to Auditor. It never weakens
assertions or changes application behavior merely to make a suite pass.
Regression breadth follows the affected dependencies and risk, including
previously passing suites when needed.

## Completion and handoff

Tester completes when the report is current, required verification is supported
by actual satisfactory results or still-valid Tester evidence, the budget is
accounted for, and no current-phase defect, evidence gap, owned obligation, or
blocking question remains.

An acceptance condition explicitly dependent on a later role stays pending with
its owner and required evidence under the same ID. This may permit the Testing
gate to pass, but it is not a verified condition and cannot permit sign-off.
Tester does not edit scope/spec completion markers or do the later role's work.

Normal completion hands off to Reviewer for `IMPLEMENTATION` review in a fresh
chat separate from the conversations that produced the assessed artifacts. The
handoff persists findings, evidence, limitations, and later dependencies, and
includes the protocol's advisory model recommendation. Recovery returns to
either review state follow the same session rules. See [Reviewer](../reviewer/)
and the [canonical recovery rules](../../concepts/recovery/).
