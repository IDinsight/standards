<!-- standards:start -->

# S.T.A.N.D.A.R.D.S.

This project uses the S.T.A.N.D.A.R.D.S. workflow.

For invocation help, such as `/<role> help`, `$<role> help`, or a question only
about a role's modes, options, targets, or user styles, whether or not that role
was invoked, read the **Role Invocation Help** section of
`.standards/PROTOCOL.md` and the sections it names, and follow them. If that
section cannot be read, change nothing and present no option that discovery has
not verified.

Before acting on an invoked STANDARDS role skill other than Navigator, except
for a help-only request, or on any other STANDARDS workflow request (such as
choosing the next cycle's mode, changing completion policy, or switching
verification cadence; starting, reworking, promoting, cancelling, or signing off
a cycle; or resetting or uninstalling STANDARDS), read all of
`.standards/PROTOCOL.md` (in consecutive parts if a read shows only part of it)
and each chapter in `.standards/protocol/` that its reading guide names for the
current state or request, and follow them. Otherwise, do not change STANDARDS
workflow state or records.

All agents, including Navigator, must record the score of every quiz or
comprehension check, and a one-line summary of each explanation session, in
`.standards/quiz-scores.md` (date, topic, score or summary) before ending the
session.
<!-- standards:end -->

## Project notes

- Plain Node.js ES modules, no dependencies. Run tests with `npm test`.
- Keep `src/cli.js` thin; parsing lives in `src/parse.js` and aggregation in
  `src/summary.js`.
