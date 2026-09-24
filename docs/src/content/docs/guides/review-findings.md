---
title: Handling Review Findings
description: Send each review finding to the role responsible for fixing it.
---

Send each finding to the role responsible for the problem. Finding something
during review does not automatically make it a defect in the review itself.

## Check the cycle mode

In `EXPEDITED`, implementation problems go to Developer and mistakes in the
implementation review go to Reviewer. If the fix needs a skipped role,
[promote through Auditor](../../concepts/states-and-handoffs/#promote-an-expedited-cycle).
Missing files from deliberately skipped steps are not failures on their own.

## Classify a standard-cycle finding

| Problem                                     | Failure type      |
| ------------------------------------------- | ----------------- |
| Code does not follow the agreed design      | `IMPLEMENTATION`  |
| Design leaves required behavior undefined   | `ARCHITECTURE`    |
| A requirement is unclear or incorrect       | `SCOPING`         |
| A test or claim about verification is wrong | `VERIFICATION`    |
| Required project context is incorrect       | `PROJECT_CONTEXT` |
| Documentation is wrong or incomplete        | `DOCUMENTATION`   |
| The review itself contains a mistake        | `REVIEW`          |

For `REVIEW`, specify `IMPLEMENTATION` or `FINAL_DELIVERABLE` so the correction
returns to the right review.

## Return to the interrupted review

A failure handoff to another state records the interrupted review in `ResumeAt`.
The responsible role fixes the problem and decides what later work needs
repeating. For example, changed scope may require new design, code changes, and
testing before implementation review can resume.

Follow [Failure Recovery](../../concepts/recovery/) to keep track of those steps
and return to the review in an independent session. Reviewer rechecks the fix
and affected boundaries before resolving its finding; the author's status alone
is not enough. Other findings remain saved while one correction is routed.

Findings in the [review report](../../reference/templates/reviewer/) include
severity, precise evidence, a concrete failure case and impact, owner, and the
smallest correction. All unresolved material findings block the gate. Unresolved
material questions or missing evidence also block it, even if no defect has been
established. No material findings is a valid outcome after sufficient
assessment. See the [Reviewer procedure](../../roles/reviewer/).
