# Long-horizon reference eval: design

## What this study tests

The [first reference eval](REFERENCE_EVAL_REPORT_20261103.md) gave each role one
small step, with the big decisions already made. This study runs whole projects,
from the request to sign-off, and the roles make the big decisions themselves.

It compares two versions of the same release: version A with the 25 references,
and version B without them or the lines that point to them. A program plays the
part of the operator. Hidden tests grade each finished project.

## Step 1: Isolate the run environment

Each run happens in a Docker container. Version B must not be able to read the
references, and no run may see the hidden tests. Today the container blocks only
GitHub, but the references are also on npm, in `@idinsight/standards`, and the
hidden tests are in the public eval archive on Google Drive. Runs in this study
also install packages, which the first study's small tasks did not.

The container gets three things:

1. **Access to the AI service only.** The container sits on its own internal
   Docker network, whose only way out is a small proxy, so a program that
   ignores proxy settings still cannot reach the internet. Claude Code reaches
   the AI service through the proxy (`ANTHROPIC_BASE_URL`). The container holds
   only a placeholder key, which the proxy replaces with the real one.
   Anthropic's SDKs read the same settings, so any program in the container
   could send requests the same way. The proxy therefore forwards only message
   and token-count requests that come from the pinned Claude Code, by their
   User-Agent, and only for the models it uses, including those of its built-in
   subagents. The step 1 check finds that list. It logs every refused request by
   run ID, and meters all spend against the run's limits (step 2). It refuses
   requests that use the API's own web search, web fetch, MCP servers or other
   tools that run on Anthropic's side, since those can reach the internet. Every
   session of both versions also runs with WebFetch and WebSearch turned off.
2. **A local package store.** Python and npm packages at fixed versions, which
   `uv`, `pip`, `pnpm` and `npm` use instead of the internet. It holds every
   Python and npm package the references name, so that version A can install
   what its references advise, and step 3 adds the packages of the good
   solutions. It also holds the most-downloaded public Python and npm packages,
   so that a sound choice either version makes is likely to be there. It holds
   no STANDARDS files. Failed installs are logged by run ID. The store may be
   widened after the practice runs, which cover both versions, and after
   screening, with the packages version B failed to install. It is then frozen
   before the main run.
3. **Fixed images.** Both images build on the first study's runner image, on a
   fixed version of its base, which holds Node 22, pnpm, the pinned Claude Code
   and git. STANDARDS' own tools and its stop hook run on Node. The `python`
   image adds Python 3.13, uv, PostgreSQL 18 with pgvector and Redis 8, with
   `vector` created in `template1` so that every new database has it: the app's
   role is not a superuser, so it could not create the extension itself. The
   `web` image adds Playwright with Chromium, and PostgreSQL 18. The `python`
   image also holds Python 3.11, 3.12 and 3.14: the references name all four,
   and uv cannot download a missing one inside. A run checks that it has the
   expected image. The databases and Redis run as their own system user and
   start with the run. The runner user may call their start and stop commands,
   which `docs/requirements.md` gives, but cannot write their files or act as a
   database superuser. So a role cannot fix a permission problem by hand in a
   way that the grading container would not have. Docker is not available
   inside.

**Done when** a check inside each image shows that the AI service answers;
GitHub, npm, PyPI and Google Drive do not, by proxy or by a direct connection; a
web search from a session fails, and so does an API request that asks for web
tools or an MCP server; no real API key is in the container; an SDK call from a
program the session starts is refused; allowed packages install from the store,
and `@idinsight/standards` does not; the databases start; in the `python` image,
a database the app's role creates has `vector`; the session cannot act as a
database superuser or write the databases' files; one run cannot see another
run's records or traffic; and a session runs `check`, fires the stop hook and
starts a built-in subagent, with every model call it makes forwarded.

**Cost:** under $1 for the one test session (estimate). The operator builds the
images and run the check.

## Step 2: Build the program that acts as the operator

In a real cycle, each role records its handoff in `.standards/STATE.md` and
names the next role. The operator starts that role, answers its questions,
approves the Developer's plan, commits, and signs off at the end. A program does
these things, the same way for both versions.

**Sessions.** A session is one Claude Code conversation with one role. It starts
with the role's command, such as `/developer`, and the program's replies
continue it. A run is all the sessions for one project on one version, from the
request to sign-off. All sessions of a run share one container, as a user's
sessions share one machine. Each new role starts in a fresh session. The first
is `/scoper <request>` for a new project, or `/auditor <request>` for existing
code. Between sessions, the program stops leftover processes such as dev
servers, restarts the databases and Redis, and commits every change as
`chore: save <role> work`. It keeps each session's transcript, cost and a
snapshot of the project and its database data.

**Next move.** After each session, the program reads `STATE.md` with the
release's own code and executes the first move that makes sense. A role records
each blocking question in the state (`Active Work.BlockedOn`), so the state
decides whether a question is open. The reply's text counts only when the state
holds none.

| After the session                                                       | The program                                                                       |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `STATE.md` is invalid                                                   | Sends the error back once. Still invalid: the run did not finish                  |
| The cycle is signed off                                                 | Stops. The run finished, unless the project has a second request (see **Limits**) |
| The cycle is cancelled                                                  | Stops. The run did not finish                                                     |
| The cycle awaits the operator's sign-off                                | Replies "I sign off."                                                             |
| The Developer still owns the work, and the state asks for plan approval | Replies "I approve the plan as proposed, including its user style."               |
| The same role still owns the work, and the state holds another question | Replies with the stand-in's answer                                                |
| Another role owns the work                                              | Starts that role in a fresh session                                               |
| The same role owns it, and its reply ends with a question               | Replies with the stand-in's answer                                                |
| The same role owns it, with no question                                 | Replies "Please continue."                                                        |

The program builds each new role's command from the state and never from the
previous reply, so the wording remains the same in every run. The STANDARDS stop
hook runs as it does for a real user. The program records its `check` result and
does not act on it.

**The stand-in.** Opus 5.5 acts as the human operator. It answers, as the
operator would, the questions that have no scripted reply in the table. It sees
the client documents both versions see, the project's brief (facts the client
knows but did not write down), the question, and the run's earlier answers.
Framework file names in the question are masked, so that the question does not
reveal the version. It does not see the version or the project's files. Every
brief holds the same standing answers for the following scenarios. Where more
than one fits, the first in the list applies:

1. The numbered requirements in `docs/requirements.md` are the whole scope. Each
   holds, whatever maturity level the request names, and the level adds nothing
   beyond them.
2. Anything outside the session, such as credentials, a real deploy or a step
   that needs the internet: "I can't do that here. Continue and record what is
   left for me."
3. A request to confirm a command that runs in the container and serves a
   numbered requirement, such as applying a migration to the local databases:
   "Yes, go ahead here."
4. A command of that kind that the role asks the operator to run: "Run it
   yourself here and record it."
5. Workflow options: keep the defaults. A Tester's request to go past its test
   budget: approve the smallest increase it names.
6. Technical choices: "I have no preference. Choose and record why."
7. Facts not in the brief: "I don't know. Make a reasonable assumption and
   record it."

Code checks each answer. An answer may contain only standing answers and brief
or requirement text quoted word for word, each with its source, and must not
name a reference. Any other text fails, including a technical suggestion such as
an index type. An answer that fails gets one retry, then falls back to the facts
it cited, word for word, or to "I don't know…" when it cited none. This keeps
the stand-in from making technical choices for either version, and from passing
reference advice to version B. The program signs off without trying the product.
The hidden tests do that.

**Limits.** For both versions (set from estimates): 40 sessions, 10 hours, $180
and 40 stand-in answers per run; 90 minutes and $40 per session. Spend is the
proxy's meter (step 1). A session that reaches its limit is paused, and its role
restarts as after an interruption. One project, P1, gets 70 sessions, 18 hours,
$300 and 70 stand-in answers. P1 is a new search service for evidence reports,
described with the other projects in step 3. After its first sign-off, the
program adds a new requirement to `docs/requirements.md` and its facts to the
brief, then gives a second request that changes the finished service. The second
request starts with `/auditor`, since the project counts as existing code after
its first cycle. The run ends at the second sign-off. After screening (step 5)
the limits may change once, from version B runs alone, and only upward, since
version A runs tend to take longer. The report says when a version A run stops
at a limit that no version B run came near.

**Runs that do not finish.** A run did not finish if it reaches a run limit,
keeps `STATE.md` invalid, is cancelled, stops twice with no handoff, question or
change, or repeats three sessions with no change to the state, the files or the
answers. It is still graded on what it left. A temporary infrastructure fault,
such as a 5xx, 429 or overloaded response, or a network or host failure, reruns
the session from the snapshot before it, at most twice. After that, the run is
an error and starts again. A lasting fault, such as the organization's spend
limit, pauses the whole study until it clears and counts against no run. An
error the session causes itself, such as a prompt that is too long or a process
it started running out of memory, and the proxy's limits and its refusals of
other programs' requests, are the session's own result under these rules. A
refused request is a defect in the environment (step 7) only when it was not
refused for a run or session limit, and the pinned Claude Code sent it without
the session naming its model or endpoint. Every other refusal is the session's
own result. The report shows reruns and restarted runs for each version.

**Done when** the program makes the right move on a set of saved states,
covering each row of the table, a pause and a loop, and the answer check rejects
planted leaks.

**Cost:** no model calls. The tests use saved states and saved answers.

## Step 3: Write the projects and their hidden tests

Five projects, P1 to P5, are written. Screening (step 5) keeps 3 to 5 of them.
Each project forces big decisions early that shape all later work, so that a
wrong early choice shows up in many checks. Each targets 2 to 5 references,
mostly ones the first study did not test.

| #   | Project                                                   | Start                           | Main references                                                                       |
| --- | --------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| P1  | Search service for an evidence library                    | New, in Python                  | `pgvector.md`, `databases.md`, `default-stack.md`, `llm-api-testing.md`               |
| P2  | Case-management web app for several organizations         | New, from a Next.js 16 scaffold | `databases.md`, `security-nextjs.md`, `github-actions-nextjs.md`, `nextjs-testing.md` |
| P3  | Moving a service to Google Cloud Run                      | Existing FastAPI service        | `deploy-gcp.md`, `observability.md`, `github-actions-python.md`, `fastapi-testing.md` |
| P4  | Caching, rate limits and exports for a busy directory API | Existing FastAPI service        | `redis.md`, `fastapi.md`, `security-fastapi.md`, `fastapi-testing.md`                 |
| P5  | AI case summaries that keep personal data private         | Existing FastAPI service        | `llm-api-testing.md`, `fastapi-testing.md`, `security-fastapi.md`                     |

P1's requirements name pgvector on the client's PostgreSQL as a numbered
requirement, which is a fact about the client's stack, not advice. So
`default-stack.md` is not tagged on the vector-store choice, and P1 measures
what `pgvector.md` adds: index types, dimension limits and filtered search.

P1's second request (step 2) switches the finished service to a larger embedding
model and re-embeds every report, with search working throughout. To grade it,
the hidden tests seed the database with the run's code at its first sign-off,
then run the final code's `migrate` and `worker` against that database while
they search. Its tests are proven the same way, starting from a good solution to
the first request.

P1 to P5 bring 17 of the 25 references into play. The other 8 are out: the five
Android references, `security-assessment.md` (used outside cycles),
`deploy-railway.md` (cheaper to fix than to measure) and `mongodb.md` (it needs
a database the images lack). P6, an offline Android survey app, stays optional
and would add the Android references. If it is added, it is written and frozen
here with the others, step 1 adds an Android image, and step 5 screens it with 3
more runs. It also needs an offline store of Gradle and Maven packages, an
x86_64 host for Android's build tools, and an Android practice project in
step 4.

**What each project holds.**

- A starting repository with STANDARDS installed, with `--mode greenfield` for
  P1 and P2 and `--mode brownfield` for P3 to P5. Left to itself, the installer
  would treat P1 and P2 as existing projects, because of their `docs/` folder
  and scaffold files. `.standards/MODE.md` is checked before the first run.
- The request, the run's first message. It names a maturity level (3 or 4) and
  points to `docs/requirements.md`.
- `docs/requirements.md`, the client's document, which both versions see. It
  numbers each requirement (R1, R2, ...), describes the environment (with no
  Docker and no internet), and sets the interface the hidden tests use (R0). The
  environment includes the database setup, the same in the run and grading
  containers: a database `app`, owned by a role that is not a superuser but may
  create databases, and the commands that start and stop the databases and
  Redis. It names no test database, since the test database's name and setting
  come from the references. Without it, the builder's choice of rights would
  decide whether version A's advice, such as creating a test database, can run.
  It also states that the numbered requirements are the whole scope: each holds,
  whatever maturity level the request names, and the level adds nothing beyond
  them. Without this line, both Scopers would turn the level into extra work,
  each in its own way: version A from `maturity-levels.md`, and version B from
  its own idea of the level. Some of that work, such as vulnerability scanning
  and branch protection, needs the internet or GitHub. Every requirement can be
  checked inside the run container, by running it or by reading files. Where a
  requirement involves a deploy, a CI run or an image build, the file says that
  none of these can happen here and that the requirement is checked from the
  files. Otherwise a Tester cannot pass a check it cannot run, and the run
  stalls before sign-off. The request says not to edit the file.
- The stand-in's brief: facts the client knows but did not write down, such as
  names, numbers and preferences. It covers every fact the requirements imply,
  because screening can add facts only from version B's questions. No outcome
  check or judge item may depend on a value found only in the brief: every value
  a check needs is in `docs/requirements.md`, which both versions see.
- The hidden tests.

No project file, request or brief may hold advice that only a reference gives. A
code scan also checks for it.

**The hidden tests.** They run on the finished project, in a fresh container
with empty databases. They start it through the scripts R0 names (`setup`,
`migrate`, `seed`, `serve`, `worker`, `test`) and then use it from outside, as a
client would. The project's own `test` script runs in a separate fresh
container, so that it cannot change the data the other checks use. That
container starts as a run did, with the databases up and `setup` and `migrate`
run first, and it has its own fresh fakes. They never import its code, so any
design passes when the behavior is right. They also cause the failures the
requirements name, such as an AI provider that returns errors, Redis stopping,
or a shutdown mid-request. A project that does not start will fail every
behavior check.

Each project has 20 to 40 outcome checks in 4 to 6 areas of similar size. A
blinded judge, as in the first study, adds 6 to 10 checkable facts about the
final documents, such as "the runbook gives the rollback command". Every outcome
check and judge item cites the requirement it tests, so the references can help
with how the work is done, never with what is required. A run's score is the
share of these it passes. Each outcome check also lists the references whose
advice bears on it. These tags, like everything else in this step, are frozen
before the practice runs (step 4).

Two other kinds of check are reported but not scored. Reference checks show
whether a reference's advice was followed, such as the vector index type.
Control checks cover rules both versions have, such as "no secret is committed".

Services that cannot run offline are replaced by local fakes: a fake AI
provider, a fake Cloud Run that records deploys, a local replay of the CI
workflows, and local error and log collectors. Each fake is tested against the
references' own examples, so that it supports what the references advise, and
runs in its own container, so that the roles see only its address, never its
code, which holds reference examples and the failures the hidden tests cause.
During runs, only the fake AI provider and the collectors are reachable, at
addresses `docs/requirements.md` gives, so that the roles can run and check the
service as the hidden tests do. The fake Cloud Run and the CI replay run only at
grading. The fakes count as part of the hidden tests: they are proven with them
below, and no fake changes after step 5's fixes. Each fake logs, by run ID,
every request it rejects and every request it fails on with an error of its own,
apart from the failures the hidden tests cause on purpose. A fake that stops
answering, unless a hidden test stopped it on purpose, is logged the same way
and restarted unchanged, during runs and before the next check at grading. Step
8 reports these for each version. Each run gets its own set on its own internal
network, so that no run can see another run's records or traffic. Grading gives
each run a fresh network with fresh fakes, the replay and the package store.
After the runs and before grading, every action that any run names is looked up
once against GitHub, outside the container, and the result applies to every run:
a `uses:` line whose action or version tag does not exist fails. For a line
pinned to a commit SHA, the lookup uses the version tag in its comment and
ignores the SHA: offline, only version A's references hold real SHAs, so whether
a SHA is real counts only as a reference check. A SHA line with no version
comment fails. Local actions and reusable workflows are checked against the
repository itself. A real action or step that the replay cannot run offline is
logged and treated as passing, the same way in every run of both versions. The
judge grades the deploy items in every run, from the workflow files and the
replay's log.

**Proving the tests.** Each project gets solutions written with the operator in
plain Claude Code sessions, not through STANDARDS cycles:

- one good solution;
- at least two more good solutions that make different sound choices, so the
  tests do not pass only one way of building it;
- 8 to 15 bad solutions, each a good one with one defect.

At least one good solution follows the references' advice where it applies, and
at least one is written without access to the references. Every good solution
must pass every threshold, such as P1's search time, so that the tests favor
neither way of building.

**Done when**, for each project, the starting repository fails every outcome
check for a new requirement and passes those for behavior it must keep, every
good solution passes them all, each bad solution fails exactly the checks it
targets, every check gives the same result twice, the judge passes each judge
item on every good solution's documents and fails it on each bad document that
targets it, each fake handles the references' examples, the scan finds no
reference advice, no starting repository's git history holds a solution or a
hidden test, version B's holds no reference, and the run container holds no
reference text outside version A's installed skill folders. The hashes of every
project, its tests and the blind review's setup (step 5) are then recorded,
which freezes them before the practice runs.

**Cost:** about $185–720 (estimate), mostly for writing the good solutions.

## Step 4: Run two practice projects

These are the study's first real runs. Two small practice projects run once on
each version, so that steps 1 and 2 meet real sessions on both images before any
study project runs: P0, a FastAPI service backed by PostgreSQL, and P0W, a
Next.js app backed by PostgreSQL. Each has its own request,
`docs/requirements.md`, brief and about 5 hidden tests. They are not part of the
study, and their results do not count in the final evaluation report.

The practice runs show whether:

- a whole run works: handoffs, replies, plan approval, sign-off, commits and
  pauses;
- the stand-in's real answers pass the leak check;
- the package store holds what the roles install;
- the hidden tests can grade a finished project;
- the program finds which references version A read, across all its sessions;
- a run's cost fits the estimate behind steps 5 and 7, about $25–90 per run, and
  its time fits the limits in step 2.

The practice projects stay outside the study because no version A run may touch
a study project before the main run (step 7). Choosing projects after seeing
version A work on them would bias the comparison. For the same reason, step 3's
projects and tests are frozen before these runs, so that seeing version A work
cannot shape which checks exist. The practice runs may change only the
environment, the package store, the program, the grading machinery and the text
every project shares: the environment section of each `docs/requirements.md` and
the standing answers in each brief. Shared text changes the same way in every
project, and each edit is logged. Each such edit may come with matching updates
to the proving solutions, such as a new start command, logged with it. Practice
never changes what a check tests, and never changes the limits: it only records
where runs reach them.

**Done when** each of the four runs reaches sign-off, or ends in another way
step 2 allows with no fault in the environment, the program or the tests behind
it, and that ending is recorded; the hidden tests grade them; and every fault
they found is fixed. A run that a fault stopped runs again. Step 3's **Done
when** then passes again on the changed environment, and new hashes are
recorded, with a diff that shows no check's definition changed and lists each
solution update. Step 1's check that one run cannot see another run's records or
traffic then passes again, with the fakes in place.

**Cost:** $80–360 for the four runs (estimate). The operator runs them.

## Step 5: Screen the projects on version B

Each of P1 to P5 runs 3 times on version B, for 15 runs in all. Screening shows
which projects version B gets wrong, so that the study measures the references
where they have room to help. It also finds faults in the projects and their
hidden tests before the main run.

Screening uses version B only. A version A run on a study project would let
version A's work decide which projects are chosen (step 4). Screening runs also
do not count in the final evaluation report. The main run gives version B fresh
runs, since counting the runs that made a project look hard would set version A
against version B's unlucky runs.

**What screening may change.**

- Faults in the hidden tests or the starting repositories. The fakes are also
  checked against version B's screening workflows. A test is fixed only when the
  fault can be shown on a proving solution, and is fixed as in the blind review
  (below).
- Faults in the images or the program, fixed for both versions.
- The package store: a store that is not serving correctly, and the packages
  version B failed to install, which are added for both versions.
- The limits, once and only upward (step 2).
- The brief, when a role asks for a fact the brief does not hold. The new fact
  must be one the operator would know, and never advice from a reference.
- `docs/requirements.md`, only to fix a mistake or an unclear line that the runs
  exposed, and never to add a requirement.

Any change means the project's tests are proven again, as in step 3. Before the
keep rules below apply, every screening run is graded again with the final
tests. A project where anything a run sees changed, such as its starting
repository, requirements, brief, a fake, the package store or the program, runs
its 3 screening runs again, once. Anything that rerun finds is fixed without
another round of reruns, so that the keep rules and the run-to-run spread come
from runs on the project as it then stands.

Screening finds test faults only in version B's work. So once screening's own
changes are made, and before the screening runs are graded again for the keep
rules, one blind review checks every scored test against the requirement it
cites, in both directions, so that no one chooses which tests to look into.
Judge items count as tests here: the review runs the frozen judge on the proving
solutions' documents. A fresh session does it from the test, the requirement and
the proving solutions alone, never from any run: for a test that may wrongly
pass, it builds a bad solution from a good one with one defect, and for a test
that may wrongly fail, a good solution that meets the requirement. Its prompt,
model, limits, tries per test and stopping rule are frozen with step 3's
projects, and the operator makes no choices in it. Every fault shown on a
proving solution must be fixed. The solution that shows the fault is first
confirmed by the frozen review setup, and then joins the proving solutions. A
new good solution is confirmed against every requirement. A new bad solution
lists as its targets the checks that test the behavior its defect breaks, and
must pass the rest. Before a fix is committed, the frozen review setup decides,
from each older bad solution's defect and the changed test alone, whether the
test checks behavior that the defect breaks, and updates that solution's targets
to match. The changed test then passes step 3's **Done when** again on all the
proving solutions, the new one included. If no change passes, the test is
dropped from the score. The fixes are committed before the main run starts, and
no test or fake changes after that. A test or fake that looks faulty during or
after the main run is reported as description and not fixed.

**What screening measures.** How much version B's scores vary from run to run,
which step 6 uses to set the run count; the share of runs that did not finish;
and each run's cost and time.

**Which projects stay.** A project stays when, over its 3 runs:

1. at least 2 runs finished;
2. the mean score is between 0.30 and 0.85, which leaves room to do better
   without being hopeless;
3. at least 2 outcome checks tagged with its main references (step 3) failed in
   at least 2 runs;
4. no hidden test still has a fault.

If 4 or 5 projects stay, the main run uses them. If only 3 stay, the main run
needs about 10 runs per version to find the gap that 6 runs find with five
projects (estimate). No replacement project is added, since it would be written
after the practice runs (step 4). With 3 projects, the result covers fewer kinds
of work, however many runs there are. If fewer than 3 stay, this study stops
before any main run. A new design would need projects written after the practice
runs, and would say so. If P6 is added and all six stay, the five with the most
failing checks under point 3 are kept.

Projects chosen for low version B scores will tend to score higher when version
B runs them again, since part of each low score was chance. So the main gap may
be smaller than screening suggests. This makes a gap harder to find, and does
not bias the result. The report says that the result applies to these projects,
which were chosen because version B gets them wrong.

**Done when** all 15 runs, and any reruns, are graded with the final tests,
every change is made and its tests are proven again, the blind review's fixes
are committed, and the projects that stay and the final limits are recorded.

**Cost:** about $450–1,650 for the 15 runs, with P1's second request included,
plus about $25–90 for each rerun ($40–150 for P1) (estimate). The operator runs
them.

## Step 6: Fix the rules and the run count

Before any main run, the rules that turn the result into a decision are written
into `evals/README.md` and committed, as in the first study. They use version
B's screening runs and nothing from version A, so they cannot be tuned to favor
either version.

**How many runs.** Three runs per version cannot reliably find a gap of the size
this study expects. With five projects and a run-to-run spread of 0.20, 3 runs
find a true gap of +0.10 only about 1 time in 3 (estimate). So screening sets
the count: the program takes the spread of version B's screening scores and
picks the smallest of 6, 8 or 10 runs per version that would find a true gap of
+0.15 at least 80% of the time. The count never goes above 10, and with only 3
projects left it is 10 (step 5).

**The main measure.** The gap is version A's mean score minus version B's, with
each project weighted equally. It comes with a 90% range from a pooled t
interval, since the first study's bootstrap range was too narrow for so few
runs. A permutation test that shuffles the version labels within each project
gives a second view. The same is done for the reference checks. The smallest gap
that matters is +0.10.

**The rules.** They apply in this order, and the first that fits sets the next
step. The others are still reported.

| #   | If the result is this                                                                                       | The next step is this                                                                                                                                                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The gap's whole range is below 0                                                                            | The references make long work worse. Find the cause in the references those runs read, and fix it before anything else                                                                                                          |
| 2   | In 2 or more projects, fewer than 2 in 3 version A runs read at least half of the project's main references | Fix how the roles find those references first. The result says little about content the roles did not read                                                                                                                      |
| 3   | The gap's range is above 0                                                                                  | The references help. If the whole range is below +0.10, the gain is real but small. Keep them, fix the routes to the least-read ones, and use the credit below to decide which to keep word for word. Next, test a second model |
| 4   | The gap's range reaches 0, and its top is below +0.10                                                       | No meaningful gain on these projects. If the reference checks' range is above 0, the references change the work but not its outcome. Consider shortening only the candidates below                                              |
| 5   | None of these                                                                                               | Inconclusive at this run count. The report claims neither a gain nor its absence. More runs would make a new study with its own rules                                                                                           |

**Credit per reference.** Each reference gets one measure over the outcome
checks tagged with it (step 3): how many more of those checks a version A run
passes than a version B run. Most references cannot reach a reliable answer at
these run counts. So a family of at most 4 references, picked by a power
calculation from their projects and tags, is fixed with the rules, and only the
family gets tests adjusted for testing several at once (Holm's method, 10%
overall). The expected family is `fastapi.md`, `security-fastapi.md`,
`databases.md` and `postgres.md`. A family member is kept word for word when its
test passes and, in most version A runs where it applies, a role read it. It is
a candidate to shorten only when its test does not pass, the top of its range is
below 1 check gained per run, and version A runs read it in at least half the
runs where it applies. Every other reference is described, never decided.

**Flags.** These appear beside the rule that applies and never override it:

- a family member whose test, run the other way, shows harm;
- version A finishing fewer runs than version B;
- a fake that failed on requests or stopped answering (step 3) in at least 2
  more runs of one version than of the other. Rejections are not counted, since
  a correct fake also rejects invalid requests;
- single checks where the versions differ by 2 or more runs. With 80 to 200
  checks, some will differ by chance.

**Done when** the run count, the rules, the smallest gap that matters, the
credit family and its bar, and each version's spend cap (step 7) are committed,
and the summary code passes its selftest: on simulated runs with a known gap,
its 90% range holds that gap in 88% to 92% of 4,000 simulated studies.

**Cost:** no model calls.

## Step 7: Run the study

The main run takes the projects that stayed in step 5 and runs each one, on each
version, the number of times step 6 set. It is the first time version A works on
a study project.

**The same conditions for both versions.** Every role runs on Sonnet 5.5 at high
effort in Claude Code 2.1.283, as in the first study, with the same program,
briefs, standing answers, images, package store and limits. Runs start in pairs:
one run per version for the same project and repetition, started together, with
the version that starts first alternating. So any change in the AI service
during the study reaches both versions alike. About 3 runs per version go at a
time, each with 4 CPUs and 8 GB (estimate).

**A spend cap per version.** Each version's cap, in dollars, is committed with
the rules in step 6. It is 1.5 times the sum, over the projects that stayed, of
version B's mean screening cost per run on that project, times the run count.
Both versions get the same cap, and its margin covers version A's longer runs.
Pairs start one repetition at a time across all projects, and a repetition
starts only when each version has at least 1.5 times that repetition's expected
cost left. So the cap can only drop whole repetitions, and every project keeps
the same number of runs on each version. Spend on runs that a fault forces to
run again does not count against the cap.

**Nothing changes during the main run.** The projects, tests, briefs, limits,
package store and program stay as screening left them. A lasting fault pauses
the study (step 2). If a defect in the program or the environment that needs a
code or configuration change shows up, the main run stops, the fault is fixed
for both versions, and every pair started before the fix runs again, as decided
before any run is graded. Temporary faults follow step 2. The program flags
store, proxy and infrastructure faults by run ID while the runs are going. A
failed install in the main run is the session's own result in both versions,
unless the store itself failed: it was unreachable, or did not serve a package
it lists. A missing package never counts as a store failure. Step 8 reports
failed installs for each version. Fakes count as hidden tests here, not as the
environment: no test or fake changes during or after the main run (steps 3 and
5). A fake's rejections, failures and stops are logged and handled as step 3
says, and reported, never fixed.

**Interruptions.** The program keeps a journal of finished sessions. Stopping it
ends the running session, so nothing keeps calling the model, and starting it
again continues from the journal.

**Done when** every pair has finished or the spend cap has stopped new pairs,
every run has its transcripts, snapshots and costs, and the actions that the
runs name have been looked up (step 3).

**Cost:** for five projects, with P1's second request included, about
$1,700–6,200 at 6 runs per version, $2,300–8,200 at 8, and $2,900–10,300 at 10
(estimates). Fewer projects cost less. The operator runs them.

## Step 8: Grade the runs and apply the rules

**Grading.** Each run is graded on the project as it left it, whether it
finished or not:

- The hidden tests run on its last snapshot in a fresh container (step 3). P1's
  second request is graded as step 3 describes.
- The blinded judge grades the final documents, as in the first study. Opus 5.5
  reads them with framework file names masked, in one mixed queue of both
  versions' runs. A regraded sample must change by at most 5%, and a second
  judge, Fable 5.1, must agree on at least 90% of a sample.
- The reference and control checks run, and the program records which references
  each role read in each session.

No test or fake changes after the main run starts. A test or fake that looks
faulty is reported as description (step 5).

**Applying the rules.** The committed code computes the gap and its range,
applies step 6's rules in order, and names the one that fits. It counts every
run, including runs that did not finish. A second view leaves those runs out,
and the share of runs that did not finish is compared between versions. If a
judge check fails, the report says so, and the rules are applied twice: once
with the judge's items in the score, and once on the hidden tests alone. The
result on the hidden tests alone then decides the next step.

**The report.** One report, in the shape of the first study's, holds:

- the rule that applies, the gap with its 90% range and the permutation test,
  and the same for the reference checks;
- every run's score in one table, with the runs that did not finish marked, and
  the results per project and per check, labeled as description;
- the credit per reference and the flags (step 6);
- how the roles worked, per version: which references each role read and when,
  rework between roles, the stand-in's answers by kind, and time, turns and cost
  per run;
- what the study's own setup did, per version, so that any effect it had shows:
  failed installs, refused proxy requests, the requests the fakes rejected,
  listed so that a reader can check them against the real service, the fakes'
  failures and stops, CI steps the replay could not run, scripts that call
  Docker or the internet, reruns and restarted runs, version A runs that stopped
  at a limit no version B run came near, and tests reported as faulty after the
  main run started.

The report also says that the result applies to these projects (step 5), and
what the study cannot show (below).

**Done when** every run is graded, the judge's checks have run, the rule that
applies is named, and the report is written.

**Cost:** about $2–4 per run for the judge and its checks (estimate), so about
$120–400 for 60 to 100 runs. The hidden tests make no model calls. The operator
runs the grading.

## What this study cannot show

- **How the references do on typical work.** The projects were chosen because
  the references cover them and version B gets them wrong (steps 3 and 5). The
  result applies to these projects only. With 3 to 5 projects, the study also
  cannot say how much the gap varies from one kind of project to another.
- **The effect of every reference.** Only the credit family (step 6) gets a
  decision. Every other reference, and every single project or check, is
  description. Eight references are not tested at all: the five Android
  references, `security-assessment.md`, `deploy-railway.md` and `mongodb.md`.
  `maturity-levels.md` is in play but has little room to act, since every
  project's requirements say the level adds nothing.
- **What version B would do without any knowledge of the references.** The
  references are public on npm, so the model may have learned some of their
  advice in training. Version B then already knows part of it, and the gap is
  smaller than the references' full effect.
- **Other models or clients.** The study tests Sonnet 5.5 in Claude Code
  2.1.283, as the first study did.
- **Work with a real operator.** The stand-in approves every plan, makes no
  technical choices and never tries the product. A real operator would catch
  some mistakes earlier. Both versions get the same stand-in, so this changes
  the scores more than the gap.
- **Work with the internet.** The runs are offline, with no web search, so the
  roles cannot look anything up. That may make the references look more useful
  than they are in real use.
- **Effects that show only on real platforms.** Deploys, CI runs and image
  builds are checked from files and against fakes, not on Google Cloud or
  GitHub. Advice that matters only on the real platform is checked by its form,
  not by its effect.
- **A fully blind judge.** A long design can paraphrase a reference without
  naming it, and masking cannot hide that. The judge's items are checkable
  facts, which limits the effect, as in the first study.
