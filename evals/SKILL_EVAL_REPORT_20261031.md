# STANDARDS skills eval results: release 0.15.0

This report tells how the STANDARDS role skills were tested at release 0.15.0
and what the tests showed. All runs took place on 31 October 2026. The report
for the earlier evaluation, at release 0.8.0, is
`evals/SKILL_EVAL_REPORT_20261003.md`.

- **Model under test:** Claude Sonnet 5.5 at high effort, run through Claude
  Code 2.1.283.
- **Framework:** release 0.15.0 (commit `184b5b4`) for every case.
- **Grading:** exact checks where possible. Claude Opus 5.5 at high effort is
  the judge for the other assertions. Claude Fable 5.1 at medium effort is a
  second judge that only checks the first judge.

## Summary

- **All 457 cases ran and have grades.** Each case starts from a fixture: a
  small git repository that matches the starting state that the case describes.
- **Sonnet 5.5 passes 95.9% of the graded assertions** (1,458 of 1,521). 415 of
  the 457 cases (91%) pass every assertion. Architect and Tester score highest
  (98.9%). Reviewer scores lowest (91.4%).
- **Most failures happen again.** Each case that failed ran two more times. 25
  of the 42 failing cases failed in all three runs. 8 failed only once.
- **The most frequent failure is a role that settles a problem itself.** This
  happens in 11 of the 25 cases that always fail. The role accepts weak
  evidence, or it decides or sends on work that belongs to another role or to
  the user.
- **The measurement is reliable, but the judge is strict on borderline
  assertions.** No run reached the time or usage limit, and no run read the eval
  cases. Ten runs that stopped for reasons outside the model ran again. The
  judge failed 70 of 72 deliberately wrong answers, and the two misses were
  faulty tests. A second, less strict judge agreed with 87% of a sample of
  grades. In each disagreement, the main judge gave FAIL.
- **Fifteen cases changed during the evaluation.** Most changes let a check
  accept any correct wording, or they corrected an error in a fixture. Each
  changed case that needed a new run ran again.

## What the suite tests

STANDARDS has nine role skills: Scoper, Architect, Auditor, Developer, Tester,
Reviewer, Documenter, Synchronizer and Navigator. Each skill has eval cases in
`skills/<role>/evals/evals.json`. A case has three parts:

- **`prompt`:** the situation, written as facts about the project and the
  workflow, and the request from the user;
- **`expected_output`:** what a correct run does, in one or two sentences;
- **`assertions`:** separate statements about a correct run. Each one can be
  checked by itself.

This report names a case as `<role>-<id>`. For example, `developer-26` is the
case with `"id": 26` in `skills/developer/evals/evals.json`. The 457 cases
contain 1,537 assertions.

The cases test how the roles follow the protocol. They do not test how well a
role writes code. They cover these subjects:

- **Ownership and routing:** which role must fix a problem, and how a role sends
  the problem to that role;
- **Workflow state and handoffs:** handoffs to the next role, the commands that
  start the next role, and checkpoints between Developer and Tester;
- **Recovery:** recovery frames, reruns, corrective returns and open
  obligations;
- **User decisions:** plan approval, saving a blocking question before asking
  it, cycle modes, and cancelling or resetting a cycle;
- **Completion policies:** finishing a cycle after the implementation review,
  and what that shorter route leaves out;
- **Documentation cycles:** cycles that change only documentation;
- **Expedited cycles:** what the shorter workflow leaves out, and when to change
  it to the full workflow;
- **Evidence and gates:** test evidence, review findings, documentation evidence
  and synchronization;
- **Independence:** separate chats for testing and review;
- **Records:** provenance blocks, existing files and stable identifiers;
- **User styles:** choosing and applying a style safely;
- **Navigator:** explaining work without changing anything;
- **Restricted environments:** unreadable files, no `.git`, blocked network
  hosts, hidden commands and files that change during a run.

The earlier evaluation had 363 cases. This harness cannot run 12 older cases, so
they were removed. 8 of them need the Codex client, and 4 depend on how a client
starts a skill.

## How each case runs

### 1. A fixture for every case

The prompt of a case states facts: the workflow state, the records that exist,
what they say, and the state of the git repository. A fixture makes those facts
true. It is a small git repository with:

- project code and tests;
- STANDARDS, installed from release 0.15.0;
- workflow records, such as `STATE.md`, a scope, a design, plans and reports;
- a commit history that leads to the stated state.

149 cases start from one of five shared base repositories. The bases are a small
CSV export service at different workflow stages.

Claude Opus 5.5 at high effort wrote the fixtures. Each fixture passed four
gates before it could run:

1. **Build and structure.** The fixture builds. The framework's `check` tool
   gives the expected result. The fixture's own self-checks pass in Docker, for
   example "the tests pass".
2. **Stated facts.** Code compares each fact in the prompt with the built
   repository.
3. **Model review.** Claude Opus 5.5 reviews the fixture. It looks for parts
   that are not realistic, hints that give away the answer, and checks that
   could fail a correct run.
4. **Maintainer decision.** The maintainer corrects, accepts or sets aside each
   fixture that the review flags. The harness records the decision.

358 fixtures came from the earlier evaluation. The harness rebuilt them at
release 0.15.0 and ran gates 1 and 2 again. The other 99 fixtures were written
or rewritten for this release and passed all four gates. Before the runs
started, the maintainer also corrected seven checks.

### 2. An isolated run

Each run starts a new Docker container, which is discarded after the run:

- The harness copies the fixture into the container. STANDARDS comes from the
  release package, which does not contain the eval cases.
- Claude Code runs with no user settings, no MCP servers and no web tools.
  GitHub is blocked. Thus the model cannot read the eval cases.
- The model gets one turn with no user interaction. The message is the role's
  skill command and a short request, for example `/developer Continue.` The
  repository holds everything else, so the model must find out the situation
  itself.
- Permission prompts are off in the container. The container is the security
  boundary. When a role needs the user, it ends its turn with a question.
- Each run has a 20-minute time limit and a usage limit of $50. Six runs go at
  the same time.

Some cases need a special setup:

- an earlier conversation that the run continues (29 cases);
- more blocked network hosts (24 cases);
- a `standards` command on the path (8 cases);
- unreadable files, hidden commands, or files that change during the run (3
  cases each);
- a project with no `.git` (1 case);
- a real browser (1 case, tester-25).

### 3. Grading

Each assertion gets a grade from what the run did:

- **Exact checks** go first. They read the workflow state with the framework's
  own parser. They also look at files, git state and the reply. When the exact
  checks fully decide an assertion, the judge does not grade it.
- **The judge** grades the other assertions. It sees the case, the assertion,
  facts about the fixture that the model never sees, and the evidence. The
  evidence includes a timeline of everything that the model did and wrote, and
  its final reply. It also includes the workflow state before and after, the
  changed files, and the files that Claude Code loads at startup. For these
  assertions, the exact checks are preconditions.
- **Invariants** apply to a full case, for example "Reviewer does not change git
  state". The report gives them separately.

The judge gave 71% of the counted grades (1,087 of 1,521). Exact checks gave the
other 29% (434).

The Navigator and Auditor runs were graded before the judge evidence included
the startup files (`CLAUDE.md` and the files that it imports). The runs of the
other seven roles were graded with these files.

### 4. Checks on the judge

Each batch of runs also tests the judge:

- **Known wrong answers.** The harness builds requests from real runs. It
  replaces the run with nothing, with a reply from a different role, or with a
  confident reply to a different question. The judge must grade each one FAIL.
- **Stability.** The judge grades a sample of requests again. At most 5% of the
  grades can change.
- **Second judge.** Claude Fable 5.1 grades a sample from the same evidence. It
  must agree with the main judge on at least 90% of the sample.

No human labeled grades, these were all LLM judges.

### How results are counted

- Each case counts once: its first run on its current fixture. When a fixture
  changed during the evaluation, the first run after the change counts.
- 16 assertions are N/A (not applicable) and do not count. 13 of them describe
  future, optional or "what if" behavior. The other 3 are explained under
  [Changes made during the evaluation](#changes-made-during-the-evaluation).
- Each case that failed its first run ran two more times. These repeats show if
  a failure happens again. They do not change the counted results.
- A failure is **consistent** when the case failed in all three runs.

## Results by role

| Role         | Cases   | Assertions passing        | Cases passing every assertion |
| ------------ | ------- | ------------------------- | ----------------------------- |
| Architect    | 18      | 87 / 88 (98.9%)           | 17                            |
| Tester       | 44      | 181 / 183 (98.9%)         | 42                            |
| Navigator    | 75      | 158 / 161 (98.1%)         | 72                            |
| Developer    | 71      | 312 / 320 (97.5%)         | 66                            |
| Scoper       | 29      | 121 / 125 (96.8%)         | 25                            |
| Documenter   | 84      | 199 / 212 (93.9%)         | 76                            |
| Auditor      | 16      | 75 / 80 (93.8%)           | 12                            |
| Synchronizer | 62      | 156 / 167 (93.4%)         | 56                            |
| Reviewer     | 58      | 169 / 185 (91.4%)         | 49                            |
| **All**      | **457** | **1,458 / 1,521 (95.9%)** | **415**                       |

## What the failures show

42 cases failed in their counted run. The two extra runs gave these results:

|                        | Failed in all 3 runs | Failed in 2 of 3 runs | Failed only in the first run |
| ---------------------- | -------------------- | --------------------- | ---------------------------- |
| Cases (42)             | 25                   | 9                     | 8                            |
| Failed assertions (63) | 40                   | 12                    | 11                           |

### The 25 consistent failures

They fall into five groups. See the appendix for every failing case.

1. **The role accepts weak or missing evidence (4).**
   - synchronizer-14 completes the synchronization, although test evidence was
     deleted.
   - synchronizer-39 uses its own check to close a gap in the documentation
     evidence.
   - synchronizer-46 treats a correction as done, although nothing verifies it.
   - reviewer-30 passes the review, although the tests against a real database
     could not run.
2. **The role decides or sends on work that belongs to another owner (7).**
   - developer-26 starts a cycle with a new ID. The user asked to reuse a
     cancelled ID, and the role must ask the user to resolve that conflict.
   - documenter-70 decides a question that belongs to Scoper.
   - documenter-63 returns the work to Developer while other work is still
     possible, and it saves no question about the boundary.
   - synchronizer-21 sends a review report that contradicts itself to Tester,
     not back to Reviewer.
   - reviewer-28 returns expedited work to Developer. It must change the cycle
     to a standard cycle instead.
   - reviewer-47 keeps the cycle at sign-off and does not send the affected work
     to its owners.
   - reviewer-56 moves the work to Scoper instead of saving the decision that
     the user must make.
3. **The role makes an error in workflow records or state (6).**
   - reviewer-24 gives a next-role command for a move that stays with Reviewer.
   - auditor-3 changes to gap-fill mode when the project baseline is wrong. That
     mode needs a usable baseline, so the role must do a whole-repository audit.
   - documenter-34 records only one of the known problems before it sends the
     first one on.
   - documenter-38 edits the guide and records a problem when no change is
     necessary.
   - tester-44 writes its test plan into the report only after it adds the
     tests. The Tester skill tells it to write the plan first.
   - scoper-12, in two runs, saves its reset-approval question in a form that
     the workflow cannot read. In the other run, it does not say that the
     project stays greenfield.
4. **The explanation leaves out a required point (6).**
   - navigator-66 does not say what the shorter completion policy leaves out.
   - navigator-79 uses statuses such as "Partial" in a security review that
     allows only four statuses.
   - architect-17 says that the user can choose a style now, although that is
     not known.
   - developer-56 says that it "applied" a schedule change that has no remaining
     effect.
   - documenter-72 does not tell a policy-only change apart from a change to the
     contract.
   - scoper-30 records the inferred maturity level as a constraint, not as an
     assumption. In one run, it asks questions instead of writing the scope.
5. **The role goes past a boundary (2).**
   - navigator-25 assumes that the latest commit is "the change" when no
     baseline is recorded.
   - developer-69 does not pin new GitHub Actions to full commit SHAs.

12 of these 25 cases also failed in every run of the earlier evaluation:
navigator-25, auditor-3, scoper-12, developer-26, reviewer-24, reviewer-28,
synchronizer-14, -21, -39 and -46, and documenter-63 and -70. Three cases that
always failed in the earlier evaluation now pass: reviewer-25, navigator-15 and
documenter-18. navigator-38 also passes now, but its earlier failure came from
the old harness. The two evaluations use different judges and partly different
cases, so their pass rates do not compare directly.

### Failures that do not always happen

Nine cases failed in two of three runs: auditor-7 and -11, scoper-20, tester-30,
reviewer-36, -42 and -53, synchronizer-4, and documenter-31.

Eight cases failed only in their first run: auditor-1, scoper-16, developer-31
and -52, reviewer-51, synchronizer-16, and documenter-19 and -54.

Many of these failures are borderline grades. 23 assertions failed in some runs
but not in all three. For 8 of them, the second judge or a repeated grade did
not agree with the FAIL. See
[Reliability of the measurement](#reliability-of-the-measurement).

synchronizer-2 passes in its counted run, but it failed one assertion in its
other two runs. In all three runs, it added a note about its own checks to a
record that needed no change. The Synchronizer template does not allow such
notes. The judge accepted the note only in the first run.

## Changes made during the evaluation

### Harness

- **A grader crash.** The grader stopped on a folder from a Python virtual
  environment (developer-68). It now skips such folders and accepts changed
  files that it cannot read. The case ran again.
- **A blocked model host.** The fixture for tester-44 blocked the host that
  Claude Code uses to reach the model, so its first two attempts failed. The
  fixture was corrected. Fixture checks now refuse to block that host.
- **Startup files for the judge.** The judge evidence now includes the files
  that Claude Code loads at startup. This change came after the Auditor runs and
  before the Architect runs.

### Cases and fixtures

After each role's runs, each failing case was examined for problems in the case
itself. These changes followed:

- **Checks that wanted exact wording (6 cases).** The protocol gives a sentence
  that tells the user to open a new chat for Tester or Reviewer. Models often
  say the same thing in different words. The checks in developer-63,
  synchronizer-34, documenter-82, tester-39 and synchronizer-21 now accept any
  wording that asks for a new chat. The check in reviewer-3 now catches only an
  instruction to open a new Reviewer chat, not a quote of the rule.
- **Errors in fixture files (5 cases).** In each case, the model found a real
  error that the fixture must not contain:
  - documenter-82: the guide did not correctly tell how the command handles
    quoted fields.
  - synchronizer-56: the command did not handle an output file that it cannot
    write, and the guide and records did not mention this case.
  - reviewer-45: the tests did not check the rounding rule, or thresholds that
    are not finite numbers.
  - reviewer-39: the corrected code waited for a stalled stream to close before
    it reported the timeout.
  - synchronizer-2: the record gave a wrong description of the commits it
    compared, and it did not include two fields that its template requires.
- **Unclear case text (1 case).** The request in scoper-5 now says that the idle
  limit still applies and that 8 hours is the longest session.
- **Assertions changed to N/A (3).**
  - navigator-78, assertion 1, asked for one specific reason. The fixture has
    other real gaps that support the same correct result.
  - scoper-12, assertion 3, repeats assertion 2 word for word.
  - developer-68, assertion 3, was N/A before the runs, because the run
    environment does not have the tools that it needs. Only the stated reason
    changed.

### Correction to the earlier report

The earlier report gives navigator-38 as an example of a model failure. That
failure came from the old harness. Its scan for API keys ran git commands that
could start the repository's own text-conversion program. That program creates
the file that the check looks for. The current harness turns off such programs
for these commands, and navigator-38 passes.

## Reliability of the measurement

| Check                                                 | Result                                                                                                                                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Graded runs                                           | 556 in total. 457 count. The others are repeats, and runs from before a fixture change.                                                                                                                               |
| Runs stopped by the time limit or the usage limit     | 0                                                                                                                                                                                                                     |
| Runs that did not finish and ran again                | 10: seven Scoper runs that stopped with an infrastructure error, one developer-68 run (the grader crash), and two tester-44 attempts (the blocked model host)                                                         |
| Runs that read the eval cases or exposed an API key   | 0                                                                                                                                                                                                                     |
| Known wrong answers graded FAIL                       | 70 of 72. Both misses used architect-17 assertion 1, which any reply satisfies, so those tests were faulty. Six more tests were weak by design and did not count.                                                     |
| Grades that changed when graded again                 | 3 of 230. All 3 are on borderline assertions.                                                                                                                                                                         |
| Agreement of the second judge                         | 141 of 162 (87%). In all 21 disagreements, the main judge gave FAIL and the second judge gave PASS. The case facts support the main judge in 12. 8 are borderline. In 1 (reviewer-51), the main judge was too strict. |
| Same grade in the two repeat runs of a case           | 141 of 158 assertions (89%). These are failing cases, so this sample is harder than average.                                                                                                                          |
| Judge grades with an empty or placeholder explanation | 18 of 1,321. 16 are PASS. Other runs of the same case support the 2 FAILs.                                                                                                                                            |
| Counted runs that broke a case invariant              | 3. tester-5 and tester-28 staged file changes with `git rm` and `git mv`, but pass every assertion. tester-30 changed `package.json` as part of a failure.                                                            |

One repeat run of reviewer-24 also broke an invariant, but only because it ran
`git checkout` in a scratch copy of the repository. That result is a false
alarm.

## Limitations

- **One model and one client.** Only Claude Sonnet 5.5 in Claude Code was
  tested. Other models, and other clients such as Codex, can behave differently.
- **A model judge.** The judge gave 71% of the counted grades, and no person
  checked them. On borderline assertions, the judge is stricter than the second
  judge. Some failures that happen in only some runs are borderline grades.
- **Different judge evidence for two roles.** The judge did not see the startup
  files for the Navigator and Auditor runs.
- **One counted run per case.** Only the failing cases ran again. A case that
  passed once can still fail in other runs, as synchronizer-2 shows.
- **Small, made-up projects.** A model wrote and reviewed each fixture. Some
  fixtures have known compromises. For example, the shared CSV export base
  describes the commits in some of its review and documentation records too
  loosely. Models now report this as a minor point.
- **These situations only.** The cases were written together with the framework.
  Passing them shows that the skills handle these situations, not every
  situation.
- **What is published.** The eval cases are in this repository. The fixtures and
  the harness are in a public archive that `evals/README.md` links to. The run
  records are not published.

## Cost

| Item                         | Cost        |
| ---------------------------- | ----------- |
| Model runs                   | $434.37     |
| Judge (1,321 grades)         | $132.35     |
| Judge checks                 | $85.61      |
| **Total for the evaluation** | **$652.34** |

Writing and reviewing the 99 new fixtures cost another $136.63.

## How to reproduce the results

`evals/README.md` tells how to set up and run the harness. The main commands
are:

- `pnpm evals pipeline --role <role> --execute`, once for each role;
- `pnpm evals pipeline --cases <case,case,...> --reps 2 --execute` for the
  repeat runs.

`pnpm evals report` can combine run folders. It counts a case two times when two
folders hold it. This report uses each case's counted run instead.

The run records stay on the machine that ran them. Each run ID has the form
`2026-10-31T<time>-184b5b4-claude-sonnet-5-5`. The ID of a role run also ends
with `-<role>`, for example
`2026-10-31T1134Z-184b5b4-claude-sonnet-5-5-navigator`.

## Appendix: cases that failed

"Runs failed" counts the failed runs out of three. "Borderline" means that the
second judge or a repeated grade did not agree with a FAIL.

| Case            | Runs failed | What went wrong                                                                                            | Note             |
| --------------- | ----------- | ---------------------------------------------------------------------------------------------------------- | ---------------- |
| navigator-25    | 3           | Assumes that the latest commit is "the change" when no baseline is recorded.                               |                  |
| navigator-66    | 3           | Does not say what the shorter completion policy leaves out.                                                |                  |
| navigator-79    | 3           | Uses statuses such as "Partial" where only four statuses are allowed.                                      |                  |
| auditor-1       | 1           | States some facts about the repository that it did not check.                                              |                  |
| auditor-3       | 3           | Changes to gap-fill mode instead of a whole-repository audit when the baseline is wrong.                   |                  |
| auditor-7       | 2           | Removes an old entry, but not because its cycle ID does not match.                                         | Borderline       |
| auditor-11      | 2           | Does not save a blocker for an incomplete reconciliation entry.                                            |                  |
| architect-17    | 3           | Says that the user can choose a style now, although that is not known.                                     |                  |
| scoper-12       | 3           | Saves its reset question in a form the workflow cannot read, or does not say the project stays greenfield. |                  |
| scoper-16       | 1           | Offers a new reset preview before the interrupted reset is resolved.                                       | Borderline       |
| scoper-20       | 2           | Numbers new acceptance conditions by hand, not with `id.mjs next AC`.                                      |                  |
| scoper-30       | 3           | Records the inferred maturity level as a constraint, not as an assumption.                                 |                  |
| developer-26    | 3           | Starts a cycle with a new ID instead of asking the user about reusing a cancelled ID.                      |                  |
| developer-31    | 1           | Does not say that conflicts outside the style layer follow the protocol's conflict rules.                  | Borderline       |
| developer-52    | 1           | Does not select the first increment of its plan.                                                           |                  |
| developer-56    | 3           | Says that it applied a schedule change that has no remaining effect.                                       |                  |
| developer-69    | 3           | Does not pin new GitHub Actions to full commit SHAs.                                                       |                  |
| tester-30       | 2           | Writes tests before it sends a defect in Developer's plan back to Developer.                               |                  |
| tester-44       | 3           | Writes its test plan into the report only after it adds the tests.                                         |                  |
| reviewer-24     | 3           | Gives a next-role command for a move that stays with Reviewer.                                             |                  |
| reviewer-28     | 3           | Returns expedited work to Developer instead of changing it to a standard cycle.                            |                  |
| reviewer-30     | 3           | Passes the review although the database tests could not run.                                               |                  |
| reviewer-36     | 2           | Repeats a technical line reference in its reply to a non-technical user.                                   | Borderline       |
| reviewer-42     | 2           | Numbers a finding by hand, or names other records only by blob ID.                                         |                  |
| reviewer-47     | 3           | Keeps the cycle at sign-off and does not send the affected work to its owners.                             |                  |
| reviewer-51     | 1           | Does not record that eligibility starts again at `NOT_ASSESSED`.                                           | Judge too strict |
| reviewer-53     | 2           | Dismisses an error in the synchronization record and moves to sign-off.                                    |                  |
| reviewer-56     | 3           | Moves the work to Scoper instead of saving the decision that the user must make.                           |                  |
| synchronizer-4  | 2           | Does not change the expedited cycle to a standard cycle and hand off to Auditor.                           |                  |
| synchronizer-14 | 3           | Completes the synchronization although test evidence was deleted.                                          |                  |
| synchronizer-16 | 1           | Does not keep the open question about the reviews as a separate problem.                                   | Borderline       |
| synchronizer-21 | 3           | Sends a review report that contradicts itself to Tester, not back to Reviewer.                             |                  |
| synchronizer-39 | 3           | Uses its own check to close a gap in the documentation evidence.                                           |                  |
| synchronizer-46 | 3           | Treats a correction as done, although nothing verifies it, and saves no blocker.                           |                  |
| documenter-19   | 1           | Applies a style file through a link that points outside the style folder.                                  |                  |
| documenter-31   | 2           | Does not record an out-of-date block of managed instructions.                                              | Borderline       |
| documenter-34   | 3           | Records only one of the known problems before it sends the first one on.                                   |                  |
| documenter-38   | 3           | Edits the guide and records a problem when no change is necessary.                                         |                  |
| documenter-54   | 1           | Does not say that the model and session details are unknown.                                               |                  |
| documenter-63   | 3           | Returns the work to Developer while other work is still possible.                                          |                  |
| documenter-70   | 3           | Decides a question that belongs to Scoper, and numbers its record entry wrongly.                           |                  |
| documenter-72   | 3           | Does not tell a policy-only change apart from a change to the contract.                                    |                  |
