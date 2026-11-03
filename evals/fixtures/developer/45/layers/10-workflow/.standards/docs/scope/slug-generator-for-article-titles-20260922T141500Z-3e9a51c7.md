<!-- STANDARDS
Artifact: SCOPE
Cycle: slug-generator-for-article-titles-20260922T141500Z-3e9a51c7
-->

# Article Title Slugs

## Goal

Give the publishing scripts a single, predictable way to turn article titles
into URL slugs, usable both from code and from the shell.

## Constraints

- Runs on Node.js 22 with no third-party dependencies.

## Non-goals

- Transliteration of non-Latin scripts.
- Storing or looking up existing slugs; callers supply the slugs already in use.

## Work

### 1. Slug generation

**Intent:** Produce stable, readable slugs from titles and avoid collisions
with slugs that are already published.

**Done when:**

- `AC-001`: A title becomes a slug of lowercase ASCII letters and digits, with each run of other characters replaced by a single hyphen and no leading or trailing hyphen; accented Latin letters lose their accents.
- `AC-002`: A slug is at most 60 characters long and never ends with a hyphen.
- `AC-003`: When the slug is already taken, the next free numeric suffix (-2, -3, and so on) is appended.

**Depends on:** None

### 2. Command-line tool

**Intent:** Let editors generate a slug from the shell.

**Done when:**

- `AC-004`: Running the command-line tool with a title prints its slug; running it without a title prints usage and exits with a nonzero status.

**Depends on:** 1
