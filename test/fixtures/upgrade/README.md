# Upgrade fixtures

Each folder holds a project's `.standards/` files, including its cycle records
under `.standards/docs/`, saved at a point in a workflow.
`pnpm run check:release` installs the previous release into a temporary project,
copies these files in, and upgrades to the current checkout. A minor or patch
release must upgrade every fixture without changing `STATE.md`, and `check.mjs`
must report no problems afterwards.

Maintain these scenarios against the current record contract. They exercise
installation and preservation of saved workflow data.

Add a fixture when a release introduces a new kind of saved state or record.
