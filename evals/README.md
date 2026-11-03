# STANDARDS skills evals

This directory holds the harness that runs the eval cases in
`skills/<role>/evals/evals.json` against a STANDARDS release and grades the
results. You run it from your own terminal; nothing here needs a Claude Code
session to drive it. The [reference evals](#reference-evals) use the same
harness to test whether the role references make the roles' work better.

| Setting                     | Default                             | Change it with                              |
| --------------------------- | ----------------------------------- | ------------------------------------------- |
| Framework release           | `v0.15.0`                           | `EVAL_COMMIT`                               |
| Model under test            | `claude-sonnet-5-5`, effort `high`  | `EVAL_MODEL`, `EVAL_EFFORT`                 |
| Client                      | Claude Code 2.1.283 in Docker       | `EVAL_CLAUDE_CODE_VERSION`                  |
| Judge                       | `claude-opus-5-5`, effort `high`    | `EVAL_JUDGE_MODEL`, `EVAL_JUDGE_EFFORT`     |
| Second judge (checks only)  | `claude-fable-5-1`, effort `medium` | `EVAL_SECOND_JUDGE_MODEL` (`none` skips it) |
| Fixture writer and reviewer | `claude-opus-5-5`, effort `high`    | `EVAL_GEN_MODEL`, `EVAL_REVIEW_MODEL`       |

Every setting is listed in `.template.env` at the repository root. The judge
must be a different model from the model under test, and the second judge a
different model from the judge: `pipeline`, `judge`, and `judge-checks` refuse
otherwise. To test Opus 5.5, set `EVAL_JUDGE_MODEL` to another model first.

## How a case is run and graded

1. **Fixture.** Each case has a fixture spec: a small git repository in the
   starting state the case's prompt describes (workflow state, records, code,
   git status). The harness builds it, installs STANDARDS from the release under
   test, and checks that it matches the prompt's stated facts before anything
   runs.
2. **Run.** A fresh Docker container gets a copy of the fixture and runs
   `claude -p "/<role> <utterance>"` once, with the model under test, no user
   settings, no MCP servers, no web tools, and GitHub blocked, so the model
   cannot read the eval cases. The container is the permission boundary, so
   Claude Code runs with permission prompts off. The harness records the full
   transcript, the files before and after, and the git state.
3. **Exact checks.** Code checks every assertion it can: the workflow state as
   the framework's own parser reads it, files, git, and the reply. An assertion
   the checks fully decide never reaches the judge.
4. **Judge.** Opus 5.5 grades each remaining assertion from the run's evidence
   (the full timeline, state before and after, changed files, the reply, and the
   files Claude Code loaded at startup: `CLAUDE.md` and its `@` imports) plus
   ground-truth facts about the fixture that the model under test never saw.
5. **Judge checks.** Each batch also tests the judge: known wrong answers must
   FAIL, re-judging a sample must give the same verdicts (at most 5% change),
   and a second judge must agree on at least 90% of a sample.

## Requirements

- macOS with Docker Desktop running. Linux is untested: the container setup
  assumes Docker Desktop's file ownership on mounted folders. Each run's
  container gets 2 CPUs and 4 GB of memory, and 6 run at once by default; use
  `--concurrency 2` or `3` on a smaller machine.
- Node 22.12 or newer and pnpm (`corepack enable`).
- This checkout with its release tags (`git fetch --tags`).
- An Anthropic API key with access to every model your settings name: by default
  Claude Sonnet 5.5, Claude Opus 5.5, and Claude Fable 5.1 (the second judge).
  Fable 5.1 is unavailable to organizations with zero data retention; if
  `pnpm evals preflight` reports `ZDR_BLOCKED` for a model, choose another one
  for that setting (`EVAL_SECOND_JUDGE_MODEL=none` skips the second judge).
- About 2 GB of disk for fixtures and a full set of runs.

## Set up once

```bash
cp .template.env .env
```

Paste your key after `ANTHROPIC_API_KEY=` in `.env`, then:

```bash
chmod 600 .env
```

```bash
pnpm install
```

```bash
pnpm evals image build
```

```bash
pnpm evals check
```

`image build` pulls `node:22-bookworm-slim`, pins it by digest, and builds two
images: `standards-eval:claude-2.1.283` and a `-browser` variant with Playwright
and Chromium for cases that need a real browser. `check` tests every
prerequisite, counts the fixtures that are ready, lists any fixture file git
would leave out, and says how to fix what is missing.

## Fixtures

Every case needs a fixture spec in `evals/fixtures/<role>/<id>/`: a `spec.json`,
the `layers/` of files the builder applies, and the gate-3 review
(`review.json`). Shared bases live in `evals/fixtures/_bases/`. Fixtures are
committed, so a fresh clone can run the evals as they are. Each fixture's
generation log (`gen/`) stays local and is not committed.

A fixture runs only if its build matches the build that was reviewed, byte for
byte. So:

- `evals/fixtures/` is kept out of the lint hooks (`.pre-commit-config.yaml`),
  prettier (`.prettierignore`), and line-ending conversion (`.gitattributes`).
- `evals/fixtures/.gitignore` takes back every file the repository's other
  ignore rules would skip (`.env` files, `results/`, and so on). A layer's own
  `.gitignore` can still hide files, for example `node_modules/` in a fixture
  that ships a package: `pnpm evals check` and `pnpm evals selftest` list them;
  add each with `git add -f`.
- The harness runs git with its own settings, not your global or system git
  config, so a fixture builds to the same hash on every machine.
- Finder's `.DS_Store` files are never part of a build.

### Fixture gates

A fixture must pass four gates before any case runs on it. The gates make sure
that the fixture builds, that it matches its case, and that it does not give
away the answer.

| Gate                   | What it checks                                                                                                                                                                                                                                                                                                    | Code                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1. Build and structure | The spec has all its fields and one check for each assertion. The project builds, and STANDARDS installs. `check.mjs` gives the result the spec expects: no problems, or the exact problems of a fixture that is broken on purpose. The fixture's own self-checks pass in Docker (for example, "the tests pass"). | `lib/spec.mjs`, `build-fixture.mjs`, `lib/selfcheck.mjs`      |
| 2. Stated facts        | Each fact in the case prompt is true in the built project. If the prompt says `WorkflowState` is `DEVELOPING`, `STATE.md` must say `DEVELOPING`. If the prompt names `AC-003`, a record must define it. If the prompt says a file is staged, git must show it staged.                                             | `extract-facts.mjs`, `validate-fixture.mjs`                   |
| 3. Model review        | The reviewer (Opus 5.5 by default) reads the case, the spec, and the built project. It looks for anything that is not realistic, for hints that give away the answer, and for checks that could fail a correct run.                                                                                               | `review-fixture.mjs`, `prompts/reviewer.md`                   |
| 4. Your decision       | Gate 3 flags a fixture when it finds a problem. You then decide what to do: run it as it is, fix it, write it again, mark an assertion N/A, or leave the case out.                                                                                                                                                | `flags.mjs` (lists what needs you), `decide.mjs` (records it) |

When the gates run:

- `fixtures generate` runs gates 1 and 2 on each new fixture. If one fails, it
  asks the model one time to repair the fixture.
- `fixtures review` is gate 3. A fixture that passes is ready; a flagged fixture
  waits for gate 4.
- `fixtures migrate` runs gates 1 and 2 only. A fixture that passes keeps its
  gate-3 review only if it still builds exactly what that review covered.
- `run` checks gate 2 again on the exact build it is about to run. It also
  refuses any build that is not byte for byte the build that passed the gates.

When a new release changes what a valid state looks like, carry the fixtures
forward instead of writing them again:

```bash
pnpm evals fixtures migrate --jobs 4
```

`migrate` makes no model call. `--jobs 4` spreads the specs over four worker
processes. First, before it edits anything, it rebuilds each reviewed spec at
the commit of its review and compares the result with the reviewed build. A spec
whose files or bases changed since its review (an edit, a reformat, a lost file)
has no review left to carry over.

Then, for each spec, it makes the mechanical updates the release needs:

- it adds 0.10.0's required `Active Work.CompletionPolicy` to each STATE.md, on
  its own line: `FULL_DELIVERABLE` for a standard cycle, `NONE` with no cycle or
  an expedited one. A finished or cancelled cycle keeps the policy it had: the
  one an earlier state of the same cycle shows, else `FULL_DELIVERABLE` if it
  was a standard cycle;
- where a layer replaces `AGENTS.md` with a copy of the older release's managed
  STANDARDS block, it swaps in the current block and keeps anything the case
  added to it (a block the case changed on purpose stays as it is);
- a stub `standards` CLI that reported the older release's version reports the
  new one.

It then runs gates 1 and 2 at the release: build, `check.mjs`, the fixture's own
self-checks in Docker, and the prompt's stated facts. The result:

| Spec                                                                  | After `migrate`                   |
| --------------------------------------------------------------------- | --------------------------------- |
| reviewed, still builds what was reviewed, and passes                  | keeps its review ("carried over") |
| reviewed, but its files changed since the review                      | waits for a new gate-3 review     |
| tied to a release (a stub `standards` CLI or a `VERSION.json` layer)  | waits for a new gate-3 review     |
| waiting for gate 3 or for your decision                               | still waiting                     |
| fails gate 1 or 2, or its case changed other than by added assertions | marked for regeneration           |

Each spec records what changed under `migrations`. With `--no-self-checks` (no
Docker), the self-checks do not run, and those fixtures are not ready until
`migrate` runs again with Docker.

```bash
pnpm evals fixtures status
```

`status` shows, per role, how many fixtures are in each state, and `--why` lists
the reason for each one that is not ready. `run`, `generate --needed`,
`review --needed`, and `check` all use the same states:

| State              | Meaning                                                          | Next step                    |
| ------------------ | ---------------------------------------------------------------- | ---------------------------- |
| `ready`            | can run                                                          | none                         |
| `migrate`          | reviewed at another release, or migrated without its self-checks | `fixtures migrate`           |
| `review`           | waiting for gate 3, or a base under it changed since its review  | `fixtures review --needed`   |
| `base`             | a shared base under it is not ready                              | fix the base first           |
| `regenerate`       | a migration found it failing gates 1 or 2                        | `fixtures generate --needed` |
| `stale`            | the case text changed since the fixture was written              | `fixtures generate --needed` |
| `missing`          | no fixture yet                                                   | `fixtures generate --needed` |
| `draft`, `flagged` | waiting for your decision                                        | `fixtures flags`             |
| `deferred`         | left out of runs (by `catalog/deferred.json` or by you)          | none                         |

Then write and review what is missing. Without `--execute` each command only
lists what it would do:

```bash
pnpm evals fixtures generate --needed --execute
```

```bash
pnpm evals fixtures review --needed --execute
```

```bash
pnpm evals fixtures flags
```

`generate` asks the fixture writer (Opus 5.5 by default) for each fixture,
applies gates 1 and 2, and makes one automatic repair call when a gate fails.
`review` is gate 3: the reviewer (Opus 5.5 by default) checks each new fixture
for realism, for hints that give the answer away, and for checks that could fail
a correct run. `flags` lists what needs your call; record each decision with
`pnpm evals fixtures decide <case> <action>`:

| Action       | Use when                                                                  |
| ------------ | ------------------------------------------------------------------------- |
| `run`        | the issue does not matter; run the fixture as it is                       |
| `fixed`      | you edited the spec's files (`--note` says what); gates 1 and 2 run again |
| `regenerate` | the fixture should be written again with the reviewer's notes             |
| `na`         | an assertion cannot be graded in this fixture (`--assertions 2,5`)        |
| `exempt`     | gate 2 misread a fact the prompt does not state (`--fact <id> --note`)    |
| `defer`      | leave the case out of runs                                                |

`regenerate` saves the reviewer's notes in
`evals/fixtures/regenerate-notes.json`; write the fixture again from them, then
review it:

```bash
pnpm evals fixtures generate <case> --execute \
  --notes evals/fixtures/regenerate-notes.json
```

Carried-over fixtures skip gate 3. To have the reviewer review them again at the
current release, run `pnpm evals fixtures review --carried-over --execute`.

## Run the evals

Check once that your key can call every model the harness calls through the API:
the judge, the second judge, the fixture writer, and the reviewer:

```bash
pnpm evals preflight --execute
```

Try one role first. Without `--execute`, `run` builds each fixture and prints
the `docker` command it would run, and calls no model:

```bash
pnpm evals run --role navigator
```

```bash
pnpm evals pipeline --role navigator --execute
```

`pipeline` runs the cases, judges the open assertions, runs the judge checks,
and writes the report, under one run id that it prints first. If it stops early
(an API limit, Ctrl+C, a closed laptop), run the same command with
`--run-id <id>`: finished runs and verdicts are kept and not run again. Ctrl+C
also stops the run containers, so nothing keeps calling the model. The same
steps run one at a time:

```bash
pnpm evals run --role navigator --run-id nav-1 --execute
```

```bash
pnpm evals judge nav-1 --execute
```

```bash
pnpm evals judge-checks nav-1 --execute
```

```bash
pnpm evals report nav-1
```

Select cases with `--role <role>`, `--all`, or `--cases developer-5,tester-12`.
`--reps 3` repeats each case. Running a command again with the same `--run-id`
keeps every finished run and retries only the ones that hit an infrastructure
error. Without `--run-id`, `run --execute` starts a new run and prints its id.
`judge` takes `--mode batch` for the Batch API (results within 24 hours) and
`--retry-errors` to resend verdicts that came back as grader errors.

The judge checks need a "different case" wrong answer for each role: a reply
from another role's run (from these runs or any other run under `evals/runs/`),
or, when only one role has been judged so far, from another case of the same
role. A case run alone gets no such check, and the output says so.

To combine runs into one report, for example one run per role:

```bash
pnpm evals report nav-1 dev-1 tester-1
```

## What you get

Everything below is gitignored.

| Path                                 | Contents                                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `evals/runs/<id>/summary.md`         | pass rates by role and case, failures with evidence, errors                                             |
| `evals/runs/<id>/cases/<case>/r<n>/` | `transcript.jsonl`, `reply.md`, `diff.patch`, `verdicts.json`, `usage.json`, before and after snapshots |
| `evals/judge-checks/<id>/summary.md` | the three judge checks against their targets                                                            |
| `evals/fixtures/**/gen/`             | each fixture's generation and review requests and responses                                             |
| `evals/spend.jsonl`                  | every API call the harness made, with its cost                                                          |

`pnpm evals spend <id>` totals measured spend, including the runs' own cost.

Each assertion gets PASS, FAIL, NA (future or counterfactual behavior), or
ERROR. ERROR is a grader or infrastructure problem: it is reported apart and
never counted as a model failure. A run that hits the 20-minute limit is
TIMEOUT. Claude Code's `--max-budget-usd 50` stops a stuck run, which is graded
as OVER_BUDGET.

An organization spend limit (HTTP 429) stops calls; affected runs are recorded
as infrastructure errors. After raising the limit, rerun the same command with
the `--run-id` it printed to pick up where it stopped.

## Reference evals

The reference evals ask one question: do the role references make the roles'
work better? A reference is an extra guide that a role reads only for some kinds
of work, for example `skills/developer/references/security-fastapi.md`. Release
0.15.0 ships 25 of them. The suite above checks that each role follows the
workflow. It never compares work done with a reference against work done without
it. The reference evals do that for 10 tasks.

### Two versions

| Version | What each run gets                                                                |
| ------- | --------------------------------------------------------------------------------- |
| A       | Release 0.15.0 as shipped (commit `184b5b4`), with the 25 references              |
| B       | Release 0.15.0 without the 25 references and without the lines that point to them |

Everything else is the same: the tasks, the fixtures, the model (Sonnet 5.5 at
high effort), Claude Code 2.1.283, the image, and the graders.

Version B is not on GitHub. You build it on your machine:

```bash
pnpm evals references build-b
```

This command starts from the `v0.15.0` tag. It removes the 25 references and
applies `evals/references/version-b.patch`, which removes the lines that point
to them. It commits the result with a fixed author, date, and message, so every
machine gets the same commit. It checks that the commit's hash is the expected
one (`2bfc101`) and saves the commit as the local tag `eval/noref-0.15.0`. It
works in a temporary git index, so it does not change your files or your branch.
Do not push the tag: anyone can build it again.

The fixtures are reviewed at 0.15.0, and version B runs on the same reviewed
fixtures. Before each version B run, the harness builds the fixture at both
versions. If anything other than the installed framework files differs, the run
stops with an error. Commit hashes differ, because the install commit differs,
and so do the file hashes that records cite. So the harness compares commits by
message and order, and ignores the other hashes.

### Tasks

In each task, a reference gives advice that the role's own instructions do not.
Each task runs 3 times in each version: 60 runs.

| Task | Case           | Role       | Reference                  | The work                                                             |
| ---- | -------------- | ---------- | -------------------------- | -------------------------------------------------------------------- |
| D1   | developer-901  | Developer  | `security-fastapi.md`      | Add account lockout to the login of a FastAPI service                |
| D2   | developer-902  | Developer  | `security-fastapi.md`      | Add basic security headers to a FastAPI service                      |
| D3   | developer-903  | Developer  | `github-actions-python.md` | Add CI for one service in a monorepo, tested on 3 Python versions    |
| D4   | developer-904  | Developer  | `github-actions-python.md` | Add a dependency audit and a failure notification                    |
| T1   | tester-901     | Tester     | `llm-api-testing.md`       | Test how the code handles cut-off replies, refusals, and rate limits |
| T2   | tester-902     | Tester     | `llm-api-testing.md`       | Test a streamed tool call that arrives in pieces                     |
| A1   | architect-901  | Architect  | `databases.md`             | Design database changes (migrations) that run on each deploy         |
| A2   | architect-902  | Architect  | `postgres.md`              | Design the move off PostgreSQL 14 before its end of life             |
| Doc1 | documenter-901 | Documenter | `readme.md`                | Document a changed import endpoint                                   |
| Doc2 | documenter-902 | Documenter | `readme.md`                | Handle an internal code change that needs no document changes        |

Two more sets run with the tasks. The summary shows them apart.

**documenter-38** is a suite case. It runs 3 times in each version. All 3 of its
runs failed on 31 October, and 2 of them read `readme.md`. If version B passes
where version A fails, the reference helped cause the failure.

**Five trigger cases** run 3 times each, in version A only. In each one, the
work looks close to a reference's topic but is not, so the role should leave
that reference alone. Code grades them from the transcript, with no judge.

| Case          | Role      | The work                                                                 | Expected                                                      |
| ------------- | --------- | ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| developer-911 | Developer | Move a helper module in a FastAPI service and update the imports         | Does not read `security-fastapi.md` or `fastapi.md`           |
| developer-912 | Developer | Add a lint job to the CI of a Node.js service                            | Does not read any `github-actions-*.md`                       |
| developer-913 | Developer | Add login rate limiting to a NestJS service (no reference covers NestJS) | Does not read `security-fastapi.md` or `fastapi.md`           |
| tester-911    | Tester    | Test a CSV export in a service that calls an LLM in other code           | Does not read `llm-api-testing.md`                            |
| architect-911 | Architect | Design request logging for a service that uses PostgreSQL                | Reads `observability.md`, not `databases.md` or `postgres.md` |

### How runs are graded

Code does most of the grading, with no model. After the runs, the graders run on
a copy of each finished project, in a new container with no network. The graders
live in `evals/references/graders/`, and no run can see them.

- **Outcome checks** give each run its score. They ask: is the work better in a
  way that a user or an operator would notice? For example, in D1, a login for
  an email that does not exist must also lock, and a broken lockout store must
  not let logins through. In the Tester tasks, one check is the share of broken
  copies of the code (mutants) that the new tests catch.
- **Reference checks** ask whether the work follows a rule that only the
  reference states, for example "each failed login starts the lockout window
  again". They show whether the reference changed the work at all.
- **Control checks** test rules that both versions have. Both versions should
  pass them equally. A gap means that something other than the references
  differs.
- **Workflow checks** are the suite's usual checks, such as no new commits, no
  git commands that change the repository, and a valid state file. They are
  reported, not scored.

**Reads.** For each run, code reads the transcript and records, for each
reference, whether the role read all of it, read part of it, only saw its name,
or never saw it. Reads by subagents count. This keeps "the role never opened the
reference" apart from "it read the reference, and the work was no better". A
name counts as seen only in a listing of the skill folders or in the line that
points to it, not in a list of every file in the project. Lines that a search of
the whole project happens to show do not count as reading the reference, but
they do count as seeing the rule on those lines.

**The judge** (Opus 5.5) grades only what code cannot, such as the Architect
designs. It sees only the finished work: a short task statement, facts about the
project, and the changed project files, plus any record that its rubric needs,
such as the Architect's design. It does not see the transcript, the reply, or
which version ran. Code replaces each reference's name with "[framework file]"
and blocks any request that still names one. The judge gets the runs of both
versions mixed, in random order.

documenter-38 keeps its suite assertions, which need the run's timeline. Its
judge requests leave out every tool call aimed at framework files: one whose
command or path names a framework file or its folder (not counting text that
`cat` or `tee` only writes to a file), or one that code shows reading such a
file. From the output of the other calls, they drop the lines that hold a
framework file's path, and they mask the other names the same way. The role's
own words can still mention a reference without naming its file, for example
"the README reference".

Each grader folder also holds known good and known bad solutions. Before the
first real run, every grader must fail the starting project, pass the good
solutions, and fail the bad ones. A check that a task passes by changing
nothing, such as Doc2's "no document changes", must pass the starting project
instead:

```bash
pnpm evals references check-graders
```

Without `--execute`, this runs only the code checks, in Docker, at no cost. Each
check runs twice and must give the same result. It also checks that the starting
project holds none of the strings the grader lists as leaks and no name that the
judge's masking would change, and that the judge's rubric names no framework
file. With `--execute`, the judge also grades the starting project and the known
solutions. The results go to `evals/runs/check-graders/<time>/summary.md`. The
real runs start only after every grader passes with `--execute`, as the grader,
its fixture (with the facts the judge gets), and the judge are now. A smoke test
can run before that.

On the real runs, the judge checks are the suite's: a re-graded sample may
change by at most 5%, and a second judge (Fable 5.1) must agree on at least 90%.
The starting projects and the known solutions take the place of the suite's
known wrong answers.

### Run the reference evals

First do the steps in [Set up once](#set-up-once) and the preflight in
[Run the evals](#run-the-evals). Then build version B and see what would run:

```bash
pnpm evals references build-b
```

```bash
pnpm evals references
```

Without `--execute`, `references` calls no model. It checks that version B and
every fixture are ready, then lists each run it would start and the estimated
cost. It builds each fixture in each version, as a real run does, so it takes a
few minutes.

Before the real runs, run a smoke test. It runs each task once, in version A
only, with the graders, read detection, and the judge, and writes the same
summary, for about $12–24 (estimate). Its runs never count. If a fixture or a
grader changes after it, review that fixture or grader again.

```bash
pnpm evals references --smoke --execute
```

To run the reference evals:

```bash
pnpm evals references --execute
```

It prints a run id first. Then it:

1. runs versions A and B at the same time, 3 runs at once in each, so any change
   in the API during the runs affects both versions the same way;
2. runs documenter-38 in both versions and the trigger cases in version A;
3. runs the graders, the judge, and the judge checks;
4. writes a side-by-side summary to `evals/runs/<id>/references-summary.md`.

If it stops early, run the same command with `--run-id <id>`. Finished runs are
kept and not run again. Each version stops starting new runs after its runs cost
$90, documenter-38 and the trigger cases included. A run that never reports its
cost counts as $50: one stopped by the time limit (as in the suite) or by
Ctrl+C. So after Ctrl+C, the rerun may need `--version-budget-usd <amount>` to
raise the limit.

| Part                                                   | Cost (estimate)    |
| ------------------------------------------------------ | ------------------ |
| 60 task runs, with the judge                           | $69–141            |
| documenter-38 (6 runs) and the trigger cases (15 runs) | $15–27             |
| Judge checks                                           | $6–12              |
| Graders                                                | none (Docker only) |
| **Total**                                              | **about $90–180**  |

The estimates come from the costs of the 31 October runs. All 81 runs and their
grading take about 1 to 3 hours (estimate).

### Read the results

A run's score is the mean of its task's outcome checks, from 0 to 1: a check
counts 1 when it passes and 0 when it fails, and the Tester tasks' mutant check
counts the share of mutants that the run's tests catch. For each task, the
summary shows:

- the score of every run in both versions;
- for each check, how many runs passed it in each version, for example 3 of 3
  against 0 of 3;
- which runs read the reference.

Then it gives the gap: version A's average score minus version B's, for each
task and for all 10 tasks together (each task counts the same). A 90% range
around the gap shows how sure the result is. The summary also gives the trigger
results, documenter-38, and the cost and time of each version. A run with no
score (one that never finished, or that a grader or the judge could not grade)
is listed under problems. Until every run has a score, the summary shows the
gaps so far and does not apply the rules below.

These rules are fixed before the first real run:

| Result                                                                                                                                             | Next step                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| The overall gap is +0.15 or more, its 90% range is above 0, and version A read the reference in at least 2 of 3 runs on at least 8 of the 10 tasks | Run a larger study: more references and tasks, 5 or more runs per version, and a second model                             |
| Version A read the reference in fewer than 2 of 3 runs on 3 or more tasks                                                                          | First fix how the role finds those references: the "Read when" line at the top of each one, or the lines that point to it |
| Version A read the references, and the 90% range is between −0.10 and +0.10                                                                        | No larger study for these references. Consider making them shorter, because reading them costs tokens                     |
| Version A is worse on one outcome check by 2 or more runs in any task                                                                              | Look for a misleading example in that reference before any more runs                                                      |
| Version A follows the references more, but its work is no better                                                                                   | The references change the work but not its quality here. A larger study needs harder tasks                                |

### Limits

- With 3 runs per version, only large differences show. A difference of one run
  in a task is within normal run-to-run noise.
- The tasks are chosen so that the references matter. The result is about these
  10 tasks, not about every reference or every use of one.
- It tests one model (Sonnet 5.5) in one client (Claude Code).
- The work itself can show which version made it, for example code copied from a
  reference. The judge cannot be blinded to that, and it is part of what these
  evals measure.

### Where the files live

| Path                                     | Contents                                                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `evals/references/cases/<role>.json`     | The cases, in the `evals.json` format. Tasks are numbered from 901 and trigger cases from 911, so they never clash with suite cases |
| `evals/references/catalog/<role>.json`   | Notes on each case for the fixture writer and reviewer, as in `evals/catalog/`, with what the hidden graders need from the fixture  |
| `evals/fixtures/references/<role>/<id>/` | The fixtures. They pass the same four gates as the suite's fixtures                                                                 |
| `evals/references/graders/<case>/`       | Hidden tests, mutants, file checks, the judge's rubric, and known good and bad solutions. Never copied into a run                   |
| `evals/references/version-b.patch`       | The edits that remove the lines that point to references                                                                            |
| `evals/harness/references/`              | The code: version B's build, the graders' runner, read detection, the blinded judge, and the summary                                |
| `evals/REFERENCE_EVAL_REPORT_<date>.md`  | The written report, committed like the suite's reports                                                                              |

As in the suite, runs, judge checks, and spend logs stay out of git. To write or
review these fixtures, run the [`fixtures` commands](#fixtures) through
`references`. It points them at the cases, catalog, and fixtures above, at
release 0.15.0 (it sets `EVAL_CASES_DIR`, `EVAL_CATALOG_DIR`,
`EVAL_FIXTURES_DIR`, and `EVAL_COMMIT`):

```bash
pnpm evals references fixtures status
```

```bash
pnpm evals references fixtures generate --needed --execute
```

```bash
pnpm evals references fixtures review --needed --execute
```

## Security

- The key is read from `.env` or your shell. It is never written to disk by the
  harness, and given only to the SDK and to each run's container through
  `docker run -e`. If both your shell and `.env` set it to different values, the
  harness refuses to run.
- A role could print the key from inside its container, so every run's files are
  scanned and redacted before grading, and the report tells you to rotate the
  key if that happened.
- The model under test runs with permission prompts off, but only inside a
  disposable container that sees a copy of the fixture, never this checkout.
- After a run, the harness reads the run's repository with git on your machine.
  It never uses the repository's own diff helpers (textconv, external diff) or
  its fsmonitor. A run that leaves git config that would run commands on your
  machine anyway (filters, includes) is stopped as an ERROR, and its project is
  kept for you to look at.
- Runs, judge checks, and spend logs stay out of git (`evals/.gitignore`).
  Fixtures are committed, including the grader-only facts in each `spec.json`.
  The cases' expected behavior is already public in `evals.json`, and runs block
  GitHub, so a model under test cannot read either.

## Harness layout

| Path                                                 | Purpose                                                                 |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `cli.mjs`                                            | the `pnpm evals` commands                                               |
| `harness/lib/config.mjs`                             | every setting and its default, `.env` loading                           |
| `harness/run.mjs`                                    | builds fixtures, runs containers, grades with exact checks              |
| `harness/grade.mjs`                                  | exact checks and judge requests                                         |
| `harness/judge*.mjs`                                 | the judge, its runner, its checks, and the preflight                    |
| `harness/generate-fixture.mjs`, `review-fixture.mjs` | fixture writing and gate-3 review                                       |
| `harness/migrate-fixtures.mjs`, `lib/migrate.mjs`    | carrying fixtures to a newer release                                    |
| `harness/lib/readiness.mjs`                          | whether each fixture can run, and why not                               |
| `harness/build-fixture.mjs`, `validate-fixture.mjs`  | gates 1 and 2                                                           |
| `harness/container/`, `Dockerfile*`, `image.mjs`     | the runner images and what runs inside them                             |
| `harness/summarize.mjs`, `spend.mjs`                 | reports and spend                                                       |
| `harness/references/`                                | the reference evals (see [Reference evals](#reference-evals))           |
| `catalog/`                                           | notes on each case for the fixture writer ([README](catalog/README.md)) |

`pnpm evals selftest` runs the harness's own tests (175 checks, no model and no
Docker): fixture builds, gates, git-command classification, grading of scripted
good and bad runs, the judge merge and checks against a fake API, key handling,
the fixture migration, and the reference evals' parts.

## Known gaps

- Catalog entries are written by hand or by an agent, and nothing warns when one
  is out of date. A case added or changed later needs its entry added or updated
  before its fixture is written (see [`catalog/README.md`](catalog/README.md)).
  Without one, the fixture writer and reviewer work from the case text alone.
- Carried-over fixtures keep their earlier review. Gates 1 and 2 confirm they
  build, pass `check.mjs`, and match their prompts at the current release, but
  only a new review would catch a fixture that newer protocol rules make
  unrealistic.
- Codex is not supported; the runner drives Claude Code only. Cases that needed
  Codex were removed from the suite (see `catalog/README.md`).
