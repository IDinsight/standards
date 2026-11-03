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
<!-- standards:end -->

# Project conventions

These conventions apply to everyone working in this repository, people and
agents alike.

## Docstrings

Every exported function, class, and type in `src/` carries a docstring: a
`/** ... */` doc comment directly above it, written in Google style. This is
the house format for the whole repository; reviews do not accept other
docstring formats.

- A one-line summary in the imperative mood, then a blank line.
- `Args:` with one indented `name: description` line per parameter.
- `Returns:` describing the return value (omit for functions that return
  nothing).
- `Raises:` listing each error the function can throw, with the `HttpError`
  status where there is one.

Do not use JSDoc tags such as `@param` or `@returns`. Add or update the
docstring whenever you add or change an exported function; older code gets one
the next time it changes.

Example:

```ts
/**
 * Build a store filter from request query parameters.
 *
 * Args:
 *   query: Request query parameters; blank values are ignored.
 *
 * Returns:
 *   The filter to pass to `RecordStore.list`.
 *
 * Raises:
 *   HttpError: 400 when `status` is not `active` or `archived`.
 */
```
