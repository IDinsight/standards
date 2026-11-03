# STANDARDS reference eval results: release 0.15.0

STANDARDS is a set of instructions that gives an AI coding assistant roles, such
as Developer and Tester. Each role has its main instructions. A **reference** is
an extra guide that a role reads only for some kinds of work, for example
security for one kind of web service. Release 0.15.0 has 25 references.

This report tells how we tested whether six of these references make the roles'
work better, and what we found. The runs took place on 3 November 2026.

- **Model under test:** Claude Sonnet 5.5 at high effort, run through Claude
  Code 2.1.283.
- **Framework:** release 0.15.0 (commit `184b5b4`), with and without its 25
  references.
- **Grading:** code for most checks. Claude Opus 5.5 at high effort, which we
  call the judge, grades the checks that code cannot. It is not told which
  version did the work. Claude Fable 5.1 at medium effort, a second judge,
  grades a sample again to check the judge.

## Summary

**The result by the rules we fixed before the run:** no larger study for the six
references we tested, and consider making them shorter. The result only just
meets that rule, in two ways. The range of likely results reaches exactly the
rule's limit of +0.10. And the rule needs at least 8 of the 10 tasks to meet its
bar for reading the references: exactly 8 did.

**Our recommendation, which differs from that rule:** do not shorten these
references yet. This test used small, one-step tasks, and in 6 of the 10 tasks
the score could not show a difference. First run a different study, with harder
tasks that take several steps.

What we found:

- **With the references, the work scored only a little higher.** On a scale from
  0 to 1, it scored 0.05 higher on average: about 5 points out of 100.
- **Six of the 60 task runs make up the whole difference.** In four, the version
  with the references came out ahead: one Architect run, one Documenter run and
  two Tester runs. In two Tester runs, it came out a little behind. With so few
  runs, chance may explain part of the difference.
- **The clearest gain was in testing.** With the references, the Tester's tests
  replaced the real secret key with a fake one in 2 of 3 runs. Without them,
  they did so in none.
- **In one task, the work with the reference was a little worse.** The Tester's
  tests missed one of six bugs in 2 runs. One possible cause is advice in the
  reference to build test data from the AI provider's published examples.
- **The references changed some details of the work.** On checks for advice that
  only the references give, the work with them scored 0.13 higher. About a third
  of that comes from one task in which two runs passed those checks without
  opening the reference.
- **Some references were not opened.** In one task, the role never opened its
  reference. In another task, the role opened its reference in only 1 of 3 runs.
- **In the trigger cases, no role opened a reference that the case lists as one
  to leave alone.** These cases test whether the references cause extra reading.
- **The references cost a little more.** With them, a run cost about 8.5% more
  and took about 11% longer.

## How we tested

Our main tests, the skill eval suite, check that each role follows the workflow.
They never compare work done with a reference against work done without one.
This study does that.

### Two versions

| Version | What each run gets                                                        |
| ------- | ------------------------------------------------------------------------- |
| A       | Release 0.15.0 as shipped, with the 25 references                         |
| B       | The same release, without the references and the lines that point to them |

Everything else was the same in both versions: the tasks, the projects, the
model, the client and the grading.

### Ten tasks

We chose 10 tasks in which a reference gives advice that the role's main
instructions do not. Each task ran 3 times in each of the 2 versions, so there
were 60 task runs in total.

| Task | Role       | The work                                                          | Reference                  |
| ---- | ---------- | ----------------------------------------------------------------- | -------------------------- |
| A1   | Architect  | Design how database changes run on each release                   | `databases.md`             |
| A2   | Architect  | Plan the move off PostgreSQL 14, which reaches its end of life    | `postgres.md`              |
| D1   | Developer  | Lock an account after too many failed logins                      | `security-fastapi.md`      |
| D2   | Developer  | Add security headers to every response of a web service           | `security-fastapi.md`      |
| D3   | Developer  | Add automatic test runs (CI) for one service on 3 Python versions | `github-actions-python.md` |
| D4   | Developer  | Add a weekly check of dependencies and a chat alert when CI fails | `github-actions-python.md` |
| Doc1 | Documenter | Update the documents after a change to the service's interface    | `readme.md`                |
| Doc2 | Documenter | Handle a code change that needs no document changes               | `readme.md`                |
| T1   | Tester     | Test code that asks an AI model for ticket summaries              | `llm-api-testing.md`       |
| T2   | Tester     | Test code that reads an AI model's answer as it arrives in pieces | `llm-api-testing.md`       |

Each task is one step by one role in a small, made-up project. The earlier steps
were already done. For example, a Developer task started from a finished design.
The role did its step and stopped.

### How the work was graded

Each task has a **grader**: a set of hidden checks of the finished project. The
roles could not see them. There are three kinds of checks:

- **Outcome checks** ask whether the work is better in a way that a user or an
  operator would notice. For example: do five failed logins lock an email
  address, even one that has no account? These checks give each run its score.
- **Reference checks** ask whether the work follows advice that only the
  reference gives. They show whether the reference changed the work at all.
- **Control checks** test rules that both versions have. Both versions should
  pass them equally.

In the Tester tasks, we also made six copies of the code under test, each with
one bug that we put in on purpose (a **planted bug**). One outcome check counts
the share of these bugs that the new tests catch.

Code graded most checks. The judge graded the Architect designs and one
Documenter check, in Doc2. For these, the judge saw only the finished work. It
was not told which version made it, and every reference name was hidden from it.
For documenter-38 (see below), the judge also saw the steps of the run. The
steps that opened framework files were left out, and framework file names were
hidden.

We also recorded whether each run opened the reference. This separates "the role
never read the reference" from "the role read it, and the work was no better".

### How we scored the results

- A run's **score** is the average of its outcome checks, from 0 to 1. A check
  that passed counts 1, and a check that failed counts 0. The planted-bug check
  counts the share of bugs that the tests caught.
- The **gap** is version A's average score minus version B's. A positive gap
  means the work was better with the references. We give the gap for each task
  and for all 10 tasks together.
- The **90% range** shows how much the gap could change by chance. With only 3
  runs per version, luck plays a big part. We estimate the range by drawing new
  sets of 3 runs, again and again, from the runs we have. The middle 90% of
  those results is the range. With only 3 runs, this method tends to give too
  narrow a range, so treat it as a rough guide.

### Rules fixed before the run

We fixed these rules before the real run, so the result would choose the next
step and not us.

| If the result is this                                                                                                                              | The next step is this                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| The overall gap is +0.15 or more, its 90% range is above 0, and version A read the reference in at least 2 of 3 runs on at least 8 of the 10 tasks | Run a larger study                                                                                   |
| Version A read the reference in fewer than 2 of 3 runs on 3 or more tasks                                                                          | First fix how the roles find the references                                                          |
| Version A read the references as in the first row, and the 90% range of the overall gap is between −0.10 and +0.10 (both limits included)          | No larger study for these references. Consider making them shorter, because reading them costs money |
| In any task, version A is worse on one outcome check by 2 or more runs                                                                             | Look for a misleading example in that reference                                                      |
| The reference checks are better (their 90% range is above 0), but the outcome is no better (the 90% range of the overall gap reaches 0 or below)   | The references change the work but not its quality. A larger study needs harder tasks                |

For the Tester tasks' check on planted bugs, the fourth rule adds up the shares
of bugs that the runs caught, instead of counting runs that passed.

### Two extra sets

- **documenter-38** is a case from the skill eval suite. All three of its runs
  failed on 31 October, and two of those runs had read `readme.md`. We ran it in
  both versions to see whether the reference caused the failure.
- **Five trigger cases** ran in version A only. In each one, the work looks
  close to a reference's subject but is not. Each case lists the references that
  a role should leave alone. These cases show whether the references cause extra
  reading.

## Results

### Overall

| Checks    | Gap (A − B) | 90% range      | Tasks |
| --------- | ----------- | -------------- | ----- |
| Outcome   | +0.05       | +0.01 to +0.10 | 10    |
| Reference | +0.13       | +0.06 to +0.21 | 8     |
| Control   | +0.01       | +0.00 to +0.01 | 9     |

T1 and T2 have no reference checks, and Doc2 has no control checks.

The reference checks show a larger gap than the outcome checks. The outcome gap
is small, and its range almost reaches 0. About a third of the reference gap
comes from Doc2. There, two of the three version A runs passed the reference
check without opening the reference.

### By task

| Task | Version A read the reference | Score with (A) | Score without (B) | Gap   |
| ---- | ---------------------------- | -------------- | ----------------- | ----- |
| A1   | 2 of 3 runs                  | 0.67           | 0.67              | 0     |
| A2   | 3 of 3                       | 1.00           | 0.83              | +0.17 |
| D1   | 0 of 3                       | 0.89           | 0.89              | 0     |
| D2   | 2 of 3                       | 1.00           | 1.00              | 0     |
| D3   | 3 of 3                       | 1.00           | 1.00              | 0     |
| D4   | 3 of 3                       | 1.00           | 1.00              | 0     |
| Doc1 | 3 of 3                       | 1.00           | 0.79              | +0.21 |
| Doc2 | 1 of 3                       | 1.00           | 1.00              | 0     |
| T1   | 3 of 3                       | 0.89           | 0.67              | +0.22 |
| T2   | 3 of 3                       | 0.94           | 1.00              | −0.06 |

A run counts as reading the reference when it opened all or part of it. No
version B run could read one, because version B has none.

### Where the work with the references scored higher

T1 is the clearest case: 2 runs against 0, on a check that counts toward the
score. A2 and Doc1 each rest on one run, which is within normal variation from
run to run.

**T1: keeping a real key out of the tests.** The project reads a secret key for
the AI service from its settings. The reference says that test setup should
replace that key with a fake one before the settings load. Then a test that
reaches the real service by mistake fails at once, and it does not use a real
account. Version A did this in 2 of 3 runs. Version B did it in none. All six
runs caught every planted bug, so this one step is the whole difference. One
version A run read the full reference and still skipped this step.

**Doc1: keeping the service's interface description current.** The project has a
file that describes the service's interface for other programs. The code
changed, so that file had to change too. The reference says that the Documenter
keeps this file in step with the code. All three version A runs updated it. One
version B run saw that the file was out of date, decided that it was not the
Documenter's job, and sent it back to the Developer.

**A2: choosing the new database version.** Where the database keeps its data on
disk depends on the version. One version B run left the new version open, to be
chosen later, so its plan could not name the folder for the data. The other five
runs chose a version and the right folder. Four of them, two in each version,
chose PostgreSQL 17 and kept the current folder. The two version B runs that did
this knew about the folder change in version 18 without the reference. So this
gap does not show which advice in the reference, if any, made the difference.

### Where the references changed the work but not the score

These differences are in reference and control checks, which do not count toward
the score.

**D2: extra security headers.** Both versions set every header that the outcome
checks ask for. The reference also advises three more headers. Every run set one
of them, Strict-Transport-Security, which tells browsers to use only secure
connections, and set it in production only. The two version A runs that read the
reference also set the other two. The version A run that did not read it, and
all version B runs, did not set those two as the reference advises.

**D3: small details in the CI setup.** All version A runs used the test time
limit that the reference gives. One version B run used a shorter one. All
version A runs also installed dependencies in the strict, locked way. Two
version B runs did not. The Developer's own guide for CI, which both versions
have, also asks for this, and all three version B runs read that guide. This may
mean that the references also strengthen rules that the main instructions
already state, but it rests on two runs.

### Where the work with the reference scored lower

**T2: tests that missed one planted bug.** The code under test receives an AI
model's answer in pieces and joins them. One planted bug drops the first piece.
Two version A runs split their test data into real pieces, but always put an
empty piece first. When the first piece is empty, dropping it changes nothing,
so those tests did not catch that bug. In all three version B runs, at least one
test put real content in the first piece, and caught the bug.

The AI provider's own published example starts with an empty piece. The
reference tells testers to build test data from the provider's published
examples or from the types in the provider's code library. That is one possible
cause, but the runs do not say why they did this.

The fourth rule did not apply. It adds up the shares of bugs caught: version A's
runs caught 5/6, 5/6 and 6/6 of the bugs, and version B's runs caught 6/6 each
time. So version A was behind by a third of a run, not by 2 runs. But this is
the kind of problem that the rule looks for, so we suggest a small fix in
recommendation 4.

### Where the score could not show a difference

- **D2, D3, D4 and Doc2:** both versions passed every outcome check in every
  run. These tasks were too easy for this model to show a difference in the
  score.
- **A1:** the task's own scope said that "nobody has to remember a manual step",
  and it left deploy approvals out. The reference says that a person must start
  any change that deletes data, after a checked backup. The two version A runs
  that read the reference noticed the conflict and followed the scope, as the
  Architect's instructions require. So two of A1's checks could not pass in
  either version. This is a fault in our task, not in the reference. A third
  check also failed in every run of both versions: the reference advises a test
  database name that ends in `_test`, and every design kept the project's
  existing name.
- **D1:** version A never opened the reference. The Developer opens a reference
  only when a guide it has loaded, or the design, points to it. For this
  reference, that pointer is a line at the end of the Developer's guide for
  FastAPI projects (FastAPI is a common way to build web services in Python).
  Two of the three runs never opened that guide, although the Developer's
  instructions say to load it when the work changes FastAPI code, as every D1
  change did. The third run read the guide, pointer included, but did not open
  the reference.
- **A2's check on old-style (MD5) passwords:** no run passed it. The check asked
  for more than the reference says. This is a fault in our check, not in the
  reference.

### Did the roles open the references?

In 8 of the 10 tasks, version A read the reference in at least 2 of 3 runs. The
two exceptions:

- **D1 (0 of 3):** as described above. In D2, one run also read the pointer in
  the FastAPI guide and did not open the reference.
- **Doc2 (1 of 3):** the work needed no document changes. All three runs still
  passed every check.

### Did the roles leave references alone when they did not apply?

Yes, for the references that each case lists. All 15 trigger runs passed. No run
opened a reference that its case lists as one to leave alone, and the Architect
read the one reference it should read (on logging and monitoring) in all 3 of
its runs. One Architect run also opened parts of three other references: the
default technology stack and two Developer guides for FastAPI. The test did not
check whether those applied.

### documenter-38

In this case, the documents are already correct, so the right answer is to
change nothing.

| Version | Runs that passed |
| ------- | ---------------- |
| A       | 3 of 3           |
| B       | 1 of 3           |

The two failed version B runs changed the usage guide when they should not have.
On 31 October, version A failed all three runs of this case with the same kind
of change. So the failure also happens without the reference. This case gives
different results from run to run.

### What the rules say

The third rule applies: **no larger study for these six references, and consider
making them shorter.** The result is close to the edge in two ways:

- **The range:** the top of the 90% range is +0.10, exactly at the rule's limit.
  One more run in version A's favor would likely have taken it over the limit.
- **The reads:** the rule needs the reference read in at least 2 of 3 runs on at
  least 8 of the 10 tasks. Exactly 8 tasks met that. One more task with few
  reads would have started the second rule instead: first fix how the roles find
  the references.

The fifth rule just missed: the bottom of the outcome range is +0.01, a little
above 0. No other rule applies.

## What this test did not cover

- **Only 6 of the 25 references.** The 10 tasks use six references:
  `databases.md`, `postgres.md`, `security-fastapi.md`,
  `github-actions-python.md`, `readme.md` and `llm-api-testing.md`. We chose
  tasks in which these references should matter. The result is about these 10
  tasks, not about every use of these six references. It does not show whether
  the other 19 references make the work better. The trigger cases only checked
  whether four of them were opened or left alone.
- **Only small, one-step tasks.** On average, a run took 2.5 to 3 minutes. The
  earlier steps were already done, so the role made few large decisions. The
  references may matter more in longer work, where an early mistake carries
  through to later steps.
- **Tasks where the score could not differ.** In 6 of the 10 tasks, the score
  could not show a difference: both versions were perfect in four, our task
  blocked the reference's advice in one, and the role never opened the reference
  in one. The overall gap comes from the other four tasks.
- **Only 3 runs per version.** Only large differences show. A difference of one
  run in a task is within normal variation from run to run.
- **Only what we chose to check.** A reference can prevent mistakes that no
  check looks for.
- **One model and one client.** Only Claude Sonnet 5.5 in Claude Code was
  tested. A less capable model may gain more from the references, and a more
  capable one less.
- **Made-up projects.** An AI model wrote and reviewed each project. They are
  small and simple compared with real projects.
- **A judge that cannot be fully blind.** Sometimes the work itself shows which
  version made it, for example text copied from a reference.

## What we recommend

These are our recommendations, not the fixed rules. Recommendations 1 and 5 go
against the third rule. Our reason: in 6 of the 10 tasks, this test could not
show a difference in the score, so it says little about harder work.

1. **Do not shorten or remove these six references yet.** This test suggests
   that, on small tasks, this model already gets most outcomes right without
   them. It does not show what happens in longer or harder work.
2. **Look at how roles reach `security-fastapi.md`.** The roles opened it in
   only 2 of 6 runs across D1 and D2. The Developer reaches it through one line
   at the end of its FastAPI guide. Some runs never loaded that guide, and
   others read the line but did not follow it. A role on a real project could
   miss it in the same way.
3. **If the references are made shorter, keep the advice that helped.** The
   clearest gain came from advice that the model did not follow without the
   reference: replace the real key in tests. The gain in Doc1, on keeping the
   interface description current, rests on one run, but points the same way.
4. **Consider one more line in `llm-api-testing.md`.** It would say that at
   least one test must put real content in the first piece, so that the tests
   can catch a lost first piece.
5. **Run a study with harder tasks next.** We suggest:

   - medium-sized projects in which 2 or 3 roles work in turn, for example
     Architect, then Developer, then Tester, with the final project graded by
     hidden tests;
   - a first, cheap round that runs only version B, to keep only the tasks that
     version B often gets wrong;
   - no tasks that both versions always get right;
   - 5 or more runs per version.

   Such a study costs more per run, and its results vary more, so it needs more
   runs. It also makes it harder to tell which reference helped.

## Reliability of the measurement

| Check                                               | Result                                                                                                                                             |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runs graded                                         | 81 of 81: 60 task runs, 6 documenter-38 runs and 15 trigger runs                                                                                   |
| Runs that did not finish                            | 0                                                                                                                                                  |
| Graders tested before the run                       | Each grader gave the expected result on its starting project and on 63 sample solutions that we knew to be right or wrong (65 after the fix below) |
| Judge grades that changed when graded again         | 0 of 20                                                                                                                                            |
| Agreement of the second judge with the judge        | 10 of 10, including 5 FAIL grades                                                                                                                  |
| Faults in our tasks and graders found after the run | 3. The D2 grader error, fixed (see below). The A1 task and A2's MD5 check, left as they are (see "Where the score could not show a difference")    |

**One grader error.** In D2, one version A run turned on
Strict-Transport-Security only in production, which is correct. It stored the
result of the production check in a variable and passed the variable on. The
grader did not follow the variable, so it marked the run wrong. We fixed the
grader, added sample solutions that use the same pattern, tested the grader
again, and graded the six D2 runs again. Only that one result changed. The
reference gap rose from +0.12 to +0.13. The outcome gap and the rules did not
change.

**Workflow results.** These are reported, not scored.

- In all 6 T1 runs, in both versions, the Tester stopped before it handed the
  work on to the next role. It wanted more than its limit of five test scenarios
  for one file, and asked for approval. This is the same in both versions, so it
  does not affect the gap.
- In two trigger cases, the Developer did not hand the work on to the Tester. In
  one, the project's package lock file was incomplete, so the new check could
  not run. This is a fault in our project. In the other, the Developer did the
  work, then stopped to ask about the evidence it needed before handing on.
  Neither changes the reading results.
- One trigger run moved a file with a git command, which the case does not
  allow.

## Changes made during the evaluation

Three short trial runs came before the real run. They found problems in our
tasks and graders, not in STANDARDS:

- **Tasks that left key decisions open.** In D1, D2 and A2, the earlier steps
  left important decisions open. Under release 0.15.0, a role correctly refuses
  to start when an earlier step left such a decision open, so the roles sent the
  work back. We rewrote these tasks.
- **Project code that crashed.** In T1, the project's own code crashed on one
  kind of answer from the AI model. We fixed the project.
- **A review of all tasks.** After the second trial run, a review led to fixes
  in A1, A2, D1, D3, D4 and T1.
- **A grader that missed one design.** The third trial run showed that the D2
  grader missed one correct way to add the headers. We fixed it before the real
  run.

After the real run, we fixed the D2 grader error described above.

## Cost

| Item                                                | Cost       |
| --------------------------------------------------- | ---------- |
| Version A runs (task runs, documenter-38, triggers) | $52.34     |
| Version B runs (task runs, documenter-38)           | $36.83     |
| Judge                                               | $2.96      |
| Judge checks                                        | $2.09      |
| **Total for the evaluation**                        | **$94.21** |

The amounts are rounded, so the rows add up to $0.01 more than the total.

Per task run, version A cost $1.20 on average and version B $1.10. Version A's
task runs took 2.8 minutes and 32 turns on average, against 2.5 minutes and 29
turns for version B.

The preparation cost another $88.89: $50.66 to write and review the 15 projects
(rewrites included), $36.33 for the three trial runs, and $1.90 for the judge's
part of the grader tests.

## How to reproduce the results

`evals/README.md` tells how to set up and run the harness. The section
"Reference evals" describes this study. The main commands are:

- `pnpm evals references build-b`, which builds version B on your machine;
- `pnpm evals references check-graders --execute`, which tests every grader;
- `pnpm evals references --execute`, which runs both versions, grades the runs
  and writes the summary.

The run records stay on the machine that ran them. The ID of this run is
`2026-11-03T0214Z-references`. Its summary is
`evals/runs/2026-11-03T0214Z-references/references-summary.md`.

## Appendix: checks where the versions differed or no run passed

Each cell gives the number of runs that passed the check, out of 3.

| Task | Check                                                               | Kind      | A             | B        |
| ---- | ------------------------------------------------------------------- | --------- | ------------- | -------- |
| A1   | No automatic step deletes data without a person deciding to         | Outcome   | 0             | 0        |
| A1   | A checked backup comes before a person deletes data                 | Reference | 0             | 0        |
| A1   | The test database has a project-specific name ending in `_test`     | Reference | 0             | 0        |
| A2   | Local data is mounted where the new version's image keeps it        | Outcome   | 3             | 2        |
| A2   | Before the move, passwords stored with MD5 are found and changed    | Reference | 0             | 0        |
| D1   | Each failed login starts the 15-minute window again                 | Reference | 0             | 0        |
| D2   | Referrer-Policy is `strict-origin-when-cross-origin`                | Reference | 2             | 0        |
| D2   | A Permissions-Policy header is set                                  | Reference | 2             | 0        |
| D3   | The test job's time limit is 15 minutes                             | Reference | 3             | 2        |
| D3   | Dependencies install from the lock file only (`uv sync --frozen`)   | Control   | 3             | 1        |
| Doc1 | The interface description requires a sign-in token for imports      | Outcome   | 3             | 2        |
| Doc1 | It documents the optional Idempotency-Key header                    | Outcome   | 3             | 2        |
| Doc1 | It documents the 202 response and no longer the 201                 | Outcome   | 3             | 2        |
| Doc1 | It documents the 409 response                                       | Outcome   | 3             | 2        |
| Doc1 | It lists the four job statuses                                      | Outcome   | 3             | 2        |
| Doc1 | The 202 response points to the existing job description, not a copy | Reference | 3             | 2        |
| Doc2 | The record names each document checked and why it needs no change   | Reference | 3             | 2        |
| T1   | Test setup replaces the real key before the settings load           | Outcome   | 2             | 0        |
| T2   | Share of the 6 planted bugs that the tests catch, in each run       | Outcome   | 5/6, 5/6, 6/6 | 6/6 each |
