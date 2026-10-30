# Case catalog

The catalog is a set of notes about each eval case. It is not a record of runs.
Nothing in it comes from a model run, and no command writes run results here.
Runs are in `evals/runs/`, judge checks in `evals/judge-checks/`, and spend in
`evals/spend.jsonl`.

Each case is defined in `skills/<role>/evals/evals.json` as a prompt, an
expected output, and a list of assertions. A catalog entry reads that case and
says:

- what the user would really type, without the answer the prompt gives away;
- which facts the grader needs but the role must not see;
- what the test project (the fixture) must contain;
- which assertions code can decide, and which need the judge;
- what is wrong with the case, if anything.

## Files

| File            | What it holds                                     |
| --------------- | ------------------------------------------------- |
| `<role>.json`   | one entry per case for that role (nine files)     |
| `deferred.json` | cases that `run --role` and `run --all` leave out |

Every case at v0.15.0 has an entry.

## Who uses it

| Reader                                 | Use                                                                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `harness/generate-fixture.mjs`         | gives the case's entry to the fixture writer, so it writes a realistic project that does not hint at the answer                                   |
| `harness/review-fixture.mjs`           | gives the entry to the gate-3 reviewer                                                                                                            |
| `harness/lib/spec.mjs`                 | refuses a spec that lets code alone decide an assertion the entry sends to the judge (tagged `trace` or `judge`, or not `deterministic_complete`) |
| `harness/lib/readiness.mjs`, `run.mjs` | skip the cases in `deferred.json`                                                                                                                 |
| `harness/selftest.mjs`                 | checks a few entries and the deferred list                                                                                                        |

Do not delete these files. Without `deferred.json`, `status` and `run` fail.
Without a role file, `generate` and `review` fail for that role, and the
`lib/spec.mjs` guard stops working for it with no warning.

A case with no entry still works. The writer and reviewer are told "this case
was added after the catalog review" and work everything out from the case text.
The `lib/spec.mjs` guard does not cover that case.

## What an entry holds

A role file has `role`, `summary`, and `cases`. `summary` holds two suggested
first cases (`stage1_candidates`: one typical, one hard) and the role's
`top_issues`. Each item in `cases` has these fields:

| Field                 | Meaning                                                                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `id`                  | the case's `id` in `evals.json`                                                                                            |
| `utterance`           | what the user types after invoking the role, with no `/role` prefix and no state description; quoted user words stay exact |
| `grader_only_facts`   | facts in the prompt that are true for grading but must not reach the role (for example "No material defects exist")        |
| `fixture`             | what the project needs (see below)                                                                                         |
| `needs_history`       | true only when correct behavior depends on earlier turns in the same conversation                                          |
| `history_note`        | what those turns are                                                                                                       |
| `client_specific`     | `none`, `claude`, or `codex`: set when an assertion depends on the client                                                  |
| `external_dependency` | an outside tool or service the case needs, or empty                                                                        |
| `issues`              | real problems with the case, each with a `kind` and a one-sentence `detail`                                                |
| `assertions`          | one item per assertion (see below)                                                                                         |
| `catalog_note`        | optional: why an entry was written or changed later by hand                                                                |

`fixture` fields:

| Field                  | Values                                                                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `project_mode`         | `GREENFIELD`, `BROWNFIELD`, `UNSPECIFIED`                                                                                                                                                                              |
| `workflow_state`       | a WorkflowState, or `UNSPECIFIED`                                                                                                                                                                                      |
| `cycle_mode`           | `STANDARD`, `EXPEDITED`, `DOCUMENTATION` (added in later releases), `UNSET`, `UNSPECIFIED`                                                                                                                             |
| `recovery`             | `none`, `one-frame`, `nested`                                                                                                                                                                                          |
| `records`              | the cycle records that must exist: `scope`, `architecture`, `context`, `development`, `verification`, `review-implementation`, `review-final`, `documentation`, `synchronization`, `user-style`, `other-cycle-records` |
| `code`                 | `none`; `small` (a few files); `medium` (enough real logic for defects and tests to exist)                                                                                                                             |
| `git`                  | any of `committed`, `staged`, `unstaged`, `untracked`, `deleted`, `branch`, `conflict`                                                                                                                                 |
| `deliberately_invalid` | true when the case starts from a broken state on purpose, so `check.mjs` must report problems                                                                                                                          |
| `complexity`           | `S`: only STATE.md and record edits; `M`: records, a little code, simple git state; `L`: real code with planted defects, multi-step git state, nested recovery, or several records that must agree                     |

Each item in `assertions`:

| Field                    | Meaning                                                                        |
| ------------------------ | ------------------------------------------------------------------------------ |
| `i`                      | the assertion's index (from 0) in the case's `assertions` list in `evals.json` |
| `graders`                | every grader that applies, from the list below                                 |
| `deterministic_complete` | true when the graders other than `judge` decide the whole assertion            |
| `note`                   | what each grader checks, and what the fixture must do so the check is fair     |

| Grader  | Decides from                                                                          |
| ------- | ------------------------------------------------------------------------------------- |
| `state` | `.standards/STATE.md` and `MODE.md` before and after the run                          |
| `file`  | files created, changed, or deleted; record headers and numbered headings; git status  |
| `check` | `node .standards/bin/check.mjs --json` after the run                                  |
| `trace` | the tool calls: files read, commands run, their order, and commands that must not run |
| `reply` | a pattern in the final reply (for example an invocation line)                         |
| `judge` | a judgment about meaning or quality, made by the judge model                          |

Issue kinds: `untestable`, `contradicts-skill`, `ambiguous`, `underspecified`,
`not-observable`, `duplicate`, `prompt-leaks-answer`.

`deferred.json` has a `note` and a `deferred` object. Each key in `deferred` is
a case key and its value is the reason, as in
`"<role>-<id>": "<why it is left out>"`. It is empty now. A deferred case shows
as `deferred` in `fixtures status` and as `NOT_RUN` with the reason in a run's
`results.json`.

## How the catalog was made

Five read-only review agents wrote the role files before the first eval suite
(at v0.8.0) ran. Each agent read its roles' `evals.json`, `SKILL.md` (and the
mode and template files a case depends on), `PROTOCOL.md`, and `protocol/*.md`,
and wrote one JSON file. The agents called no model and changed no tracked file.
Seventeen entries were added or changed later, outside those agents, and carry a
`catalog_note`. These 363 entries describe the cases as they were at v0.8.0.

Later, six more read-only agents wrote entries for the 106 cases added between
v0.8.0 and v0.15.0, following "Write new entries" below. Their `catalog_note`
says so. A lead session then checked every entry against `evals.json` (ids,
assertion count and order, field values) and put back the `judge` tag on three
reviewer assertions where the reply could make the claim the assertion forbids.

Then 12 of those cases were removed from `evals.json`, with their entries,
because the runner cannot run them correctly. Eight needed Codex (architect-16,
auditor-17, developer-62, documenter-86, navigator-68, navigator-77,
reviewer-59, scoper-28). Three needed a message sent to a role that had not been
invoked, or a bare invocation (developer-70, navigator-67, navigator-69). One
invoked Scoper inside a Documenter case (documenter-78). The remaining cases
keep their ids, so the ids have gaps.

## Keep it up to date

Nothing warns you when an entry is out of date. A fixture's `caseHash` notices a
changed case, but catalog entries have no hash. So:

- When you change a case's prompt or assertions in `evals.json`, update its
  entry in the same change. Keep each `i` equal to the assertion's index. If you
  insert an assertion, move the `i` of the ones after it, and say so in
  `catalog_note`.
- When you add a case, add its entry before you generate its fixture. The
  fixture writer and the `lib/spec.mjs` guard then have it.
- To leave a case out of runs, add it to `deferred.json` with a reason.

## Write new entries

Write entries the way the first ones were written: one read-only pass per role,
by hand or by an agent (for example a Claude Code session). No `pnpm evals`
command does this. Give the writer these rules:

1. Read the case in `skills/<role>/evals/evals.json`. Read the role's
   `SKILL.md`, the mode and template files the case depends on, and the parts of
   `PROTOCOL.md` and `protocol/*.md` it touches, so you can tell when the case
   contradicts the skill.
2. Do not run any command that calls a model. Do not edit tracked files other
   than the role's catalog file.
3. Write one entry per case with every field in "What an entry holds". Add a
   `catalog_note` that says why the entry was written.
4. Move every fact that gives the answer away out of `utterance` and into
   `grader_only_facts`, and record it as a `prompt-leaks-answer` issue. If the
   prompt has no user words, write the shortest natural request it implies, such
   as "Continue." or "Implement it.".
5. Tag each assertion with every grader that applies. Set
   `deterministic_complete` to false when any part needs the judge. When in
   doubt, tag `judge`: a wrong `true` lets code alone pass a run the judge
   should fail.
6. List only real issues. Leave `issues` empty when the case is fine.
7. Keep `cases` sorted by `id`, and keep the file valid JSON.

Then check your work:

```bash
node -e 'JSON.parse(require("fs").readFileSync(process.argv[1]))' evals/catalog/<role>.json
```

```bash
pnpm evals selftest
```

A new or changed entry affects only fixtures written or reviewed after it. To
use it for an existing fixture, regenerate or review that fixture again
(`pnpm evals fixtures generate <case> --force --execute`, then
`pnpm evals fixtures review --needed --execute`).
