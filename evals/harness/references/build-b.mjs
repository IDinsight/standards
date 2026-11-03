// Builds version B of the reference evals (evals/README.md, "Reference
// evals"): release 0.15.0 without its 25 role references and without the lines
// that point to them (evals/references/version-b.patch).
//
//   pnpm evals references build-b [--check]
//
// The commit comes from fixed inputs only: the v0.15.0 tree, the patch, and a
// fixed author, date, and message. So every machine builds the same commit,
// and the build checks it against EXPECTED_SHA. It works in a temporary index:
// it never touches your files, your index, or a branch, and it adds only git
// objects and the local tag eval/noref-0.15.0. --check builds the commit in a
// throwaway object directory, prints its hash, and saves nothing; run it after
// changing the patch.
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EVALS_ROOT, REPO_ROOT } from '../lib/config.mjs';

// The commit the v0.15.0 tag points to: the release that version A runs. The
// pragmas keep detect-secrets from reading the two commit hashes as secrets.
export const BASE_COMMIT = '184b5b4170f170b2665b8661acce0cf06830b3c8'; // pragma: allowlist secret
export const TAG = 'eval/noref-0.15.0';
export const PATCH = path.join(EVALS_ROOT, 'references', 'version-b.patch');
// The commit this build must produce. It changes only when the patch or the
// commit details below change; a mismatch prints the new hash.
export const EXPECTED_SHA = '2bfc101c0a74bf2900b46673225b11e54f981455'; // pragma: allowlist secret
const REFERENCES = ':(glob)skills/*/references/**';
const REFERENCE_COUNT = 25;
const WHO = { name: 'STANDARDS evals', email: 'evals@example.invalid', date: '2026-11-01T00:00:00Z' };
const MESSAGE = 'eval: v0.15.0 without shipped role references (version B)\n\n'
  + 'Built by `pnpm evals references build-b` for the reference evals\n(evals/README.md). Local only: do not push.\n';

// Returns the commit's hash. Throws when v0.15.0 is missing, the patch does not
// apply, or the hash is not EXPECTED_SHA.
export function buildVersionB({ check = false } = {}) {
  const tmp = mkdtempSync(path.join(os.tmpdir(), 'standards-noref-'));
  const env = {
    ...process.env, GIT_INDEX_FILE: path.join(tmp, 'index'),
    GIT_AUTHOR_NAME: WHO.name, GIT_AUTHOR_EMAIL: WHO.email, GIT_AUTHOR_DATE: WHO.date,
    GIT_COMMITTER_NAME: WHO.name, GIT_COMMITTER_EMAIL: WHO.email, GIT_COMMITTER_DATE: WHO.date,
  };
  const git = (args, input) => execFileSync('git', args, { cwd: REPO_ROOT, env, input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trimEnd();
  try {
    if (check) {
      // New objects go to the throwaway directory; existing ones are read from the repository.
      env.GIT_ALTERNATE_OBJECT_DIRECTORIES = path.join(git(['rev-parse', '--path-format=absolute', '--git-common-dir']), 'objects');
      env.GIT_OBJECT_DIRECTORY = path.join(tmp, 'objects');
      mkdirSync(env.GIT_OBJECT_DIRECTORY);
    }
    try { git(['cat-file', '-e', `${BASE_COMMIT}^{commit}`]); } catch {
      throw new Error(`release 0.15.0 (commit ${BASE_COMMIT.slice(0, 7)}) is not in this clone; run: git fetch --tags`);
    }
    git(['read-tree', BASE_COMMIT]);
    const references = git(['ls-files', '-z', '--', REFERENCES]).split('\0').filter(Boolean);
    if (references.length !== REFERENCE_COUNT) throw new Error(`expected ${REFERENCE_COUNT} references in v0.15.0, found ${references.length}`);
    git(['update-index', '--force-remove', '-z', '--stdin'], `${references.join('\0')}\0`);
    // --whitespace=nowarn: a repository's apply.whitespace=fix would change the result.
    try { git(['apply', '--cached', '--whitespace=nowarn', PATCH]); } catch (error) {
      throw new Error(`${path.relative(REPO_ROOT, PATCH)} does not apply to v0.15.0: ${error.stderr.trim()}`, { cause: error });
    }
    const tree = git(['write-tree']);
    // Unsigned, and with no encoding header, whatever the repository's config says.
    const sha = git(['-c', 'i18n.commitEncoding=UTF-8', 'commit-tree', '--no-gpg-sign', '-p', BASE_COMMIT, '-F', '-', tree], MESSAGE);
    if (sha !== EXPECTED_SHA) {
      throw new Error(`built ${sha}, expected ${EXPECTED_SHA}. If you changed the patch on purpose, set EXPECTED_SHA in `
        + `${path.relative(REPO_ROOT, fileURLToPath(import.meta.url))} to ${sha}.`);
    }
    return sha;
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const check = process.argv.includes('--check');
  const git = (args) => execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
  try {
    const sha = buildVersionB({ check });
    if (check) {
      console.log(`Version B builds as ${sha}, the expected commit. Nothing was saved.`);
    } else {
      let tagged = null;
      try { tagged = git(['rev-parse', '-q', '--verify', `refs/tags/${TAG}^{commit}`]); } catch { /* no tag yet */ }
      if (tagged === sha) console.log(`Version B is already built: ${TAG} points to ${sha}.`);
      else if (tagged) throw new Error(`${TAG} points to ${tagged}, not ${sha}. Remove it with \`git tag -d ${TAG}\` and run this again.`);
      else {
        // update-ref, not `git tag`: a tag.gpgSign setting would make `git tag` sign
        // an annotated tag. The empty old value means the tag must not exist yet.
        git(['update-ref', `refs/tags/${TAG}`, sha, '']);
        console.log(`Built version B: ${sha}\nSaved as the local tag ${TAG}. Do not push it: anyone can build it again.`);
      }
    }
  } catch (error) {
    console.error(`build-b: ${error.message}`);
    process.exit(1);
  }
}
