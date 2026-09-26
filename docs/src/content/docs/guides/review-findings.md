---
title: Handling Review Findings
description: Understand review findings and follow the correction handoffs.
---

When Reviewer finds a material problem, it records the evidence and identifies
the role that owns the fix. You do not need to classify findings, edit the
review report, or update workflow state. Follow the handoff to invoke the named
role; answer a question if a role needs your decision.

## Who fixes a finding?

Reviewer assigns each problem to the role responsible for the affected work:

| Problem                                   | Role that handles it |
| ----------------------------------------- | -------------------- |
| Code or Developer's plan is wrong         | Developer            |
| Design leaves required behavior undefined | Architect            |
| A requirement is unclear or incorrect     | Scoper               |
| Tests or formal verification are wrong    | Tester               |
| Required project context is incorrect     | Auditor              |
| Documentation is wrong or incomplete      | Documenter           |
| Review reasoning or a finding is wrong    | Reviewer             |

If you think a finding is mistaken, raise that concern. Reviewer checks the
evidence when review resumes and updates its own report if needed; the author of
the work cannot close a Reviewer finding on Reviewer’s behalf.

In expedited work, Developer handles implementation problems and Reviewer
corrects its own review. If a problem needs a role that expedited work skips,
the agent
[promotes the cycle to standard work](../../concepts/states-and-handoffs/#promote-an-expedited-cycle)
and hands off to Auditor. Skipped reports are not findings by themselves.

## Follow the handoff and return to review

Reviewer saves the finding and where its assessment should resume, then gives
you the next role to invoke. The responsible role fixes the problem and decides
which later checks must run again. For example, a corrected requirement may need
a revised design, code changes, and testing before review resumes. The agents
save this route in the workflow state; you do not manage it manually.

Invoke each role named by its handoff. When the workflow returns to Reviewer,
resume its independent review chat or open another eligible independent chat.
Reviewer checks the fix and any affected work before resolving the finding.
Other findings stay recorded while one correction is in progress. See
[Failure Recovery](../../concepts/recovery/) for how the return path works.

The [review report](../../reference/templates/reviewer/) records each finding's
severity, evidence, impact, owner, and needed correction. Material findings and
important unanswered questions block review. A review can also pass with no
material findings after sufficient assessment. See the
[Reviewer guide](../../roles/reviewer/) for what it checks.
