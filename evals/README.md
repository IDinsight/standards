# STANDARDS skills evals

This directory holds the harness that runs the eval cases in
`skills/<role>/evals/evals.json` against a STANDARDS release and grades the
results. You run it from your own terminal; nothing here needs a Claude Code
session to drive it.

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
   (the full timeline, state before and after, changed files, the reply) plus
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

| Gate                   | What it checks                                                                                                                                                                                                                                                                                                    | Cost             | Code                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------- |
| 1. Build and structure | The spec has all its fields and one check for each assertion. The project builds, and STANDARDS installs. `check.mjs` gives the result the spec expects: no problems, or the exact problems of a fixture that is broken on purpose. The fixture's own self-checks pass in Docker (for example, "the tests pass"). | None             | `lib/spec.mjs`, `build-fixture.mjs`, `lib/selfcheck.mjs`      |
| 2. Stated facts        | Each fact in the case prompt is true in the built project. If the prompt says `WorkflowState` is `DEVELOPING`, `STATE.md` must say `DEVELOPING`. If the prompt names `AC-003`, a record must define it. If the prompt says a file is staged, git must show it staged.                                             | None             | `extract-facts.mjs`, `validate-fixture.mjs`                   |
| 3. Model review        | The reviewer (Opus 5.5 by default) reads the case, the spec, and the built project. It looks for anything that is not realistic, for hints that give away the answer, and for checks that could fail a correct run.                                                                                               | About $0.34 each | `review-fixture.mjs`, `prompts/reviewer.md`                   |
| 4. Your decision       | Gate 3 flags a fixture when it finds a problem. You then decide what to do: run it as it is, fix it, write it again, mark an assertion N/A, or leave the case out.                                                                                                                                                | None             | `flags.mjs` (lists what needs you), `decide.mjs` (records it) |

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
lists what it would do and what it would cost:

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
current release (an estimated $0.34 each with Opus 5.5), run
`pnpm evals fixtures review --carried-over --execute`.

## Run the evals

Check once that your key can call every model the harness calls through the API:
the judge, the second judge, the fixture writer, and the reviewer (a few cents):

```bash
pnpm evals preflight --execute
```

Try one role first. Without `--execute`, `run` builds each fixture and prints
the `docker` command it would run, which costs nothing:

```bash
pnpm evals run --role navigator
```

```bash
pnpm evals pipeline --role navigator --execute
```

`pipeline` runs the cases, judges the open assertions, runs the judge checks,
and writes the report, under one run id that it prints first. If it stops early
(a spend limit, Ctrl+C, a closed laptop), run the same command with
`--run-id <id>`: finished runs and verdicts are kept and not paid for again.
Ctrl+C also stops the run containers, so nothing keeps calling the model. The
same steps run one at a time:

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
`judge` takes `--mode batch` for the Batch API (half price, results within 24
hours) and `--retry-errors` to resend verdicts that came back as grader errors.

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

## Cost

These are only estimates:

| Item                                   | Estimate                                        |
| -------------------------------------- | ----------------------------------------------- |
| One role run (Sonnet 5.5, high effort) | $0.14 (Navigator) to $0.97 (Tester), mean $0.63 |
| One judged assertion, Opus 5.5 at high | $0.19                                           |
| One new fixture, written and reviewed  | about $1.30                                     |

For one full pass of 469 cases, that is about $290 for runs and about $200 for
judging (if about 70% of the 1,579 assertions need the judge). Release 0.15.0's
protocol and skill files are large, and each run reads them, so runs may cost
more. Start with one role and check `pnpm evals spend` before running
everything.

An organization spend limit (HTTP 429) stops calls; affected runs are recorded
as infrastructure errors. After raising the limit, rerun the same command with
the `--run-id` it printed to pick up where it stopped.

## Security

- The key is read from `.env` or your shell. It is never written to disk by the
  harness, and given only to the SDK and to each run's container through
  `docker run -e`. If both your shell and `.env` set it to different values, the
  harness refuses to run.
- A role could print the key from inside its container, so every run's files are
  scanned and redacted before grading, and the report tells you to rotate the
  key if that happened.
- The model under test runs with permission prompts off, but only inside a
  dispos`able container that sees a copy of the fixture, never this checkout.
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

| Path                                                 | Purpose                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `cli.mjs`                                            | the `pnpm evals` commands                                  |
| `harness/lib/config.mjs`                             | every setting and its default, `.env` loading              |
| `harness/run.mjs`                                    | builds fixtures, runs containers, grades with exact checks |
| `harness/grade.mjs`                                  | exact checks and judge requests                            |
| `harness/judge*.mjs`                                 | the judge, its runner, its checks, and the preflight       |
| `harness/generate-fixture.mjs`, `review-fixture.mjs` | fixture writing and gate-3 review                          |
| `harness/migrate-fixtures.mjs`, `lib/migrate.mjs`    | carrying fixtures to a newer release                       |
| `harness/lib/readiness.mjs`                          | whether each fixture can run, and why not                  |
| `harness/build-fixture.mjs`, `validate-fixture.mjs`  | gates 1 and 2                                              |
| `harness/container/`, `Dockerfile*`, `image.mjs`     | the runner images and what runs inside them                |
| `harness/summarize.mjs`, `spend.mjs`                 | reports and spend                                          |
| `catalog/`                                           | a review of each case, used by the fixture writer          |

`pnpm evals selftest` runs the harness's own tests (129 checks, no model and no
Docker): fixture builds, gates, git-command classification, grading of scripted
good and bad runs, the judge merge and checks against a fake API, key handling,
and the fixture migration.

## Known gaps

- Cases added after the catalog was written have no entry. The fixture writer
  and reviewer work from the case text alone, so whether an assertion depends on
  what the role read or ran is left to them rather than to the catalog's tags.
- Carried-over fixtures keep their earlier review. Gates 1 and 2 confirm they
  build, pass `check.mjs`, and match their prompts at the current release, but
  only a new review would catch a fixture that newer protocol rules make
  unrealistic.
- Codex is not supported; the runner drives Claude Code only.
