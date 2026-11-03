<!-- STANDARDS
Artifact: DEVELOPMENT
Cycle: slug-generator-for-article-titles-20260922T141500Z-3e9a51c7
-->

# Development Plan

`Cycle`: `slug-generator-for-article-titles-20260922T141500Z-3e9a51c7` `Mode`: `CODE_WITH_ME`
`User Style`: `NONE` `User Style Locked`: `true`
`Status`: `APPROVED` `Verification Cadence`:
`AFTER_IMPLEMENTATION` `Current Increment`: `NONE`

## Implementation Contract

- `Scope`: `.standards/docs/scope/slug-generator-for-article-titles-20260922T141500Z-3e9a51c7.md`
- `Architecture`: `.standards/docs/specs/slug-generator-for-article-titles-20260922T141500Z-3e9a51c7.md`
- `Request`: `Slug generator for article titles: a library function and a command-line tool.`

## Build Steps

### DEV-001 — slugify with length limit

`Status`: `PENDING` `Depends On`: `NONE` `Acceptance`: `AC-001, AC-002`

**Goal**

Create the slug module with `slugify` as defined in the technical design.

**Affected Area**

New `src/slug.js`; new `package.json` declaring an ES module package.

**Expected Outcome**

`slugify` returns lowercase hyphenated ASCII slugs without accents, at most 60
characters, with no leading or trailing hyphen.

**Self-Check**

Planned: `node -e` sanity calls on a few titles from the project root. Not yet
run.

### DEV-002 — uniqueSlug suffixing

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-003`

**Goal**

Add `uniqueSlug` to the slug module.

**Affected Area**

`src/slug.js`.

**Expected Outcome**

`uniqueSlug` returns the base slug when free and otherwise the smallest free
`-N` suffix starting at 2.

**Self-Check**

Planned: `node -e` sanity calls with taken and free slugs. Not yet run.

### DEV-003 — command-line entry point

`Status`: `PENDING` `Depends On`: `DEV-001` `Acceptance`: `AC-004`

**Goal**

Add the shell entry point that prints a slug for a title.

**Affected Area**

New `src/cli.js`.

**Expected Outcome**

`node src/cli.js <title>` prints the slug; with no title it prints usage to
stderr and exits 1.

**Self-Check**

Planned: run `node src/cli.js 'Hello, World'` and `node src/cli.js` from the
project root and check output and exit status. Not yet run.

## Plan Notes

Code With Me: the user intends to write most of the code; Developer reviews
each step against the design when asked.
