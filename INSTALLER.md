# S.T.A.N.D.A.R.D.S. Installer Contract

This file defines what the `standards` CLI must do when it installs, upgrades,
or uninstalls STANDARDS in a project. It stays in this repository and is not
installed. Installed projects receive `.standards/PROTOCOL.md` and its chapters
in `.standards/protocol/`. The **Installed Runtime Contract** in
`.standards/protocol/installation.md` lists the installed files and their
owners, defines **Project Reset**, and sets the rules for agents that run the
CLI. A section name in bold refers to the protocol or its chapters unless this
file defines it.

## Installation Metadata and Versions

`.standards/INSTALLATION.json` is installer metadata, not workflow state: create
it on first installation, preserve/update it across normal reinstall or upgrade,
and record only mutations the installer actually created. Never retroactively
claim compatible pre-existing settings.

Record a client directory or settings file in `createdPaths` only if that exact
path was absent before installation created it. Supported paths are `.agents`,
`.agents/skills`, `.claude`, `.claude/skills`, `.claude/settings.json`,
`.codex`, and `.codex/hooks.json`. Preserve this record across reinstall and
upgrade.

`.standards/VERSION.json` records the installed framework release separately
from settings ownership and workflow state. Reinstallation with the same version
is allowed. An installer may upgrade to a newer minor or patch release within
the same major version after verifying the existing runtime; it must preserve
workflow data and update the recorded version with the framework assets. Reject
older versions and cross-major upgrades. A major release may be installed into a
fresh project. STANDARDS provides no migration between major versions: the only
route for an existing project is `standards uninstall`, which deletes
`.standards/` (including workflow state, Auditor context, cycle records, and
user styles), followed by a fresh installation. The framework maintainer chooses
the release version. Adding, removing, or renaming a role is a major change, and
so is any change to the runtime files or record formats that an existing
installation's files would no longer pass.

## Installer File Preservation

Installation must be idempotent and preserve project-owned instructions. Before
creating, replacing, updating, or removing a framework-controlled runtime path
or installed skill package, verify ownership deterministically.

Ownership rules:

- `.standards/` is framework-owned only when `.standards/PROTOCOL.md` contains
  `<!-- standards:framework-owned -->`. Otherwise report a path collision and do
  not adopt, overwrite, or remove it.
- An installed skill package is framework-owned only when its root `SKILL.md`
  carries the same marker. Otherwise report a skill collision and do not
  overwrite, merge, or remove it.
- Framework source `PROTOCOL.md` and root workflow `SKILL.md` files must retain
  the marker. Never infer ownership from names, paths, or similar content.

After ownership checks:

- Create `AGENTS.md` from `templates/common/AGENTS.md` if absent. Otherwise
  preserve existing content and add or update only the bounded block between
  `<!-- standards:start -->` and `<!-- standards:end -->`.
- Create `CLAUDE.md` from `templates/common/CLAUDE.md` if absent. If an existing
  user-owned unbounded `@AGENTS.md` import exists, preserve it and do not add a
  framework duplicate. Otherwise add or update a bounded integration block. If
  multiple unbounded imports exist, preserve them and report the conflict.
- Update `.standards/PROTOCOL.md`, and replace `.standards/protocol/` as a
  whole, from the installed framework version only after runtime ownership
  verification. Install or update each skill definition only after that
  destination skill package passes its ownership check. Update skill packages
  file by file: write every file the release ships, except the `evals/` folder
  used to develop the skill, and leave any other file in the folder unchanged.
  Keep the installed protocol aligned with the installed skills.
- A reinstall keeps the installed clients. The user may add a client; removing
  one requires uninstalling.
- Preserve Codex `allow_implicit_invocation: false`.
- For Claude Code, safely merge `.claude/settings.json` while preserving
  unrelated settings: add each missing required
  `skillOverrides.<skill>: "user-invocable-only"` and record that exact created
  key/value in `.standards/INSTALLATION.json`; preserve an already-compatible
  unowned value without claiming it; report conflicting unowned values rather
  than overriding them. On reinstall, restore any recorded key that was changed
  or removed, and show each restoration in the install preview.
- Hooks: unless the user declines them, add the STANDARDS hook groups to
  `.claude/settings.json` and `.codex/hooks.json` for the installed clients,
  creating `.codex/hooks.json` if needed. A STANDARDS hook is a hook handler
  whose command runs `.standards/bin/hook.mjs`; installation replaces or removes
  only those handlers and leaves every other hook unchanged. Record in
  `.standards/INSTALLATION.json` which files have STANDARDS hooks. A reinstall
  keeps the current hook choice unless the user makes another one, restores
  missing or edited STANDARDS hooks, and removes them when the user turns hooks
  off. Codex runs new or changed hooks only after the user trusts them with
  `/hooks`.
- Record ownership of newly created client directories, the Claude settings
  file, and the Codex hooks file separately from individual setting keys. Never
  record a pre-existing file or directory as created by the installer, even when
  it is empty or has only compatible values.
- Preserve an existing verified `.standards/INSTALLATION.json` and update only
  installer-owned metadata. If it is unexpectedly missing from an otherwise
  verified runtime, stop and report the incomplete runtime; never reconstruct
  ownership by inference.
- Require a valid `.standards/VERSION.json` in an existing verified runtime
  before replacing framework assets. If it is missing or invalid, stop and
  report the incomplete runtime; do not infer a version from file contents.
- Preserve existing `.standards/MODE.md` and `.standards/STATE.md` on normal
  reinstall; initialize them only on first install. Do not reset, reinterpret,
  or discard existing workflow state during upgrades. Missing required fields or
  invalid formats are runtime inconsistencies, not permission to add inferred
  defaults.
- Preserve `.standards/CONTEXT.md`; it is Auditor-owned, not installer-owned.
- Preserve `.standards/docs/` and every cycle record in it; the records are
  role-owned, not installer-owned.
- Preserve `.standards/user-styles/`; its files are user-owned.
- Preserve project-level instructions. When they materially conflict with the
  protocol, integration contract, workflow artifacts, or other authoritative
  constraints, follow **Instruction Layering and Conflicts**.
- Reinstallation must not duplicate managed blocks/imports, reset workflow
  mode/state, or erase project instructions.

Installation does not fabricate completed workflow artifacts such as scope,
technical design, project context, tests, reviews, or documentation.

## Project Uninstallation

An explicit `standards uninstall` removes the project's installed runtime and
all verified STANDARDS skill packages for Codex and Claude Code. It is allowed
in either project mode, with or without an active cycle. Removal ends the
runtime's lifetime; the command itself does not complete, sign off, cancel, or
revert project work. The globally installed CLI is unaffected.

- Default to the current directory; accept `--project <path>` for an existing
  project directory. Offer `--dry-run` to report every planned path removal or
  shared-file update without writing files. Help and preview output must explain
  that removing `.standards/` deletes saved workflow state, Auditor context,
  cycle records, user styles, and any other content in that directory. When
  `.standards/docs/` holds cycle records or `.standards/user-styles/` holds user
  styles, the preview must warn with their counts.
- Require the runtime ownership marker and a valid, supported
  `.standards/INSTALLATION.json` before removal. Do not infer settings ownership
  from current values. Unknown ownership records require an uninstaller that
  understands them. Missing or invalid workflow metadata does not prevent
  explicit removal when ownership is established; uninstall does not need a
  valid version, mode, or state and is not an upgrade.
- Discover marked skill packages under `.agents/skills/` and `.claude/skills/`,
  including marked roles absent from the current distribution. Remove their
  entire verified directories. Remove a recorded client parent directory only if
  it is empty after planned removals. Preserve unrecorded or nonempty client
  directories and unrelated skills; a folder whose `SKILL.md` is missing or a
  symlink is not a STANDARDS package and is skipped. Stop on a collision at a
  known framework role rather than adopting it.
- Remove only the bounded STANDARDS block from `AGENTS.md` and `CLAUDE.md`,
  together with the blank line and final newline that installation added around
  it. Preserve all other text, including unbounded `@AGENTS.md` imports. Delete
  either file only when its remaining content is whitespace. Malformed or
  duplicate boundaries must stop removal before mutation.
- Remove each recorded client setting only if its current value exactly matches
  the recorded installed value. Preserve changed values and report them; leave
  absent settings absent. Preserve compatible settings not recorded as owned,
  unrelated settings, and files or containers whose creation was not recorded.
  Remove every STANDARDS hook handler from `.claude/settings.json` and
  `.codex/hooks.json`, leaving other hooks in place. Remove
  `.claude/settings.json` only if its creation was recorded and, after reverting
  owned settings and hooks, it contains nothing but `$schema` and an empty
  `skillOverrides` object. Remove `.codex/hooks.json` only if its creation was
  recorded and nothing else remains in it. Otherwise retain the file and
  preserve unrelated or changed content. If `createdPaths` is absent, retain the
  file and parent directories even if they look like installer output.
- Validate all affected paths and settings before making changes. Refuse
  symlinks in affected paths or within directories to be removed. Do not follow
  unrelated skill symlinks. A missing runtime with remaining marked skills or
  integration blocks is an incomplete installation requiring ownership recovery,
  not permission to guess. With no runtime or identifiable remnants, report a
  no-op.
- Apply shared-file changes and skill removals before removing `.standards/`.
  Retain backups during the operation and restore prior files on an ordinary
  failure. If recovery fails, retain backups and report their location. An
  interrupted process may leave a partial operation; retain a mapping from
  backups to original paths and block install, reset, and uninstall until it is
  resolved. Do not claim atomicity across process interruption.
- Delete the cycle records under `.standards/docs/` with the runtime. Preserve
  implementation, tests, documentation, and reused project scope or design
  documents outside the removed runtime and verified skill directories. A later
  fresh installation starts a new runtime; artifacts and cycle markers outside
  the removed runtime still count when `cycle.mjs` checks a new ID.

There is no force removal or client-only uninstall. Removing one client while
retaining shared runtime ownership requires a separate contract.
