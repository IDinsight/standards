---
title: Reviewer
description: Get an independent assessment of the implementation and final work.
---

Reviewer assesses whether work can move forward. It checks the requirements,
design, implementation, tests, and other relevant evidence for errors or gaps.
It explains concrete problems and who needs to fix them.

## Start in an independent session

When the workflow reaches a review state, open a fresh chat separate from the
conversations that created the work under review. This includes requirements,
design, context, tests, and documentation, as well as code.

For implementation review:

```text
Codex:       $reviewer Continue IMPLEMENTATION review from .standards/STATE.md.
Claude Code: /reviewer Continue IMPLEMENTATION review from .standards/STATE.md.
```

For final review, use `FINAL_DELIVERABLE` instead. During recovery, also ask
Reviewer to read the active recovery frame.

Ideally, choose a different model of equal or higher capability when those
details are known. This is advice, not a requirement. Reviewer can resume its
own assessment conversation. Unknown session or model details are disclosed
rather than guessed; see the
[independent-session rules](../../reference/protocol/#independent-reviewer-session).

## Inputs and output

Reviewer checks saved requirements and role reports against the actual files,
history, and results. A completion label or a passing command does not prove
that all required behavior is correct.

The [review reports](../../reference/templates/reviewer/) are saved under
`docs/reviews/<Active Work.Id>/`:

- `implementation.md` assesses the implementation in both cycle modes.
- `final-deliverable.md` assesses the assembled work in standard cycles only.

Each report records the work inspected, evidence, findings, unanswered
questions, and whether this review can pass.

## Modes

The saved state determines which review runs. Re-review uses the same mode:
Reviewer checks fixes and changed inputs before reusing earlier conclusions.
Only Reviewer resolves or withdraws its findings; an author's statement that a
problem is fixed is not enough.

### IMPLEMENTATION

In `REVIEWING_IMPLEMENTATION`, Reviewer checks the implementation against the
requirements and design, including Tester evidence in standard work. Expedited
review checks the bounded request and Developer's evidence.

### FINAL_DELIVERABLE

In `REVIEWING_FINAL`, Reviewer checks the assembled standard deliverable after
documentation, including whether earlier evidence still applies and all required
outcomes are supported.

## Understanding findings

A finding describes a concrete failure, its impact, supporting evidence, the
responsible role, and the correction needed. Severity indicates urgency:

- **P0:** immediate, severe consequences.
- **P1:** a serious failure in a core requirement or important protection.
- **P2:** a narrower but still significant defect that needs correction.

All unresolved findings at these levels prevent a pass. Cosmetic preferences and
speculative improvements are not findings. **No material findings** is a valid
outcome after sufficient assessment, but missing important evidence can still
prevent completion.

Reviewer assesses and reports; the responsible role makes the fix. See
[Handling Review Findings](../../guides/review-findings/).

## Completion and handoff

Reviewer explains whether work can move forward, what was checked, and what
remains unverified. A pass requires sufficient current evidence and no
unresolved material findings, assessment gaps, or blocking questions.

Standard implementation review normally goes to Documenter. A requirement that
depends on that later work can remain explicitly pending at this point. Final
review must have evidence for every current requirement and normally goes to
Synchronizer.

Expedited implementation review can go directly to your sign-off decision once
its narrower completion requirements are met. It does not claim the skipped
standard checks passed. If one becomes necessary, the cycle moves to standard
work. During corrections, [recovery](../../concepts/recovery/) determines the
next step instead.
