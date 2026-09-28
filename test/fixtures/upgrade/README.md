# Upgrade fixtures

Each folder holds a project's `.standards/` files and cycle records under
`docs/`, saved at a point in a workflow. `pnpm run check:release` installs the
previous release into a temporary project, copies these files in, and upgrades
to the current checkout. A minor or patch release must upgrade every fixture
without changing `STATE.md` or `CYCLE_IDS.md`, and `check.mjs` must report no
problems afterwards. That freezes the record formats within a major version.

Add a fixture when a release introduces a new kind of saved state or record.
