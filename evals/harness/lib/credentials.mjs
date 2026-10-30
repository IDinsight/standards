// The API key for the harness and what keeps it out of saved results.
//
// The key comes from the root .env or the shell (lib/config.mjs). Docker gets
// it as `-e ANTHROPIC_API_KEY` with the value in the docker client's own
// environment (dockerKeyEnv), so it never appears in a command line, in
// run.json, or in a file the harness writes. The judge, generator, and
// reviewer pass it to the SDK client directly.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { apiKeyProblems, readApiKey } from './config.mjs';

export { apiKeyProblems, readApiKey };

// `docker run` arguments and the environment for the docker client process
// that hand the key to the container and nothing else.
export const DOCKER_KEY_ARGS = ['-e', 'ANTHROPIC_API_KEY'];
export const dockerKeyEnv = () => ({ ...process.env, ANTHROPIC_API_KEY: readApiKey() });

export const REDACTED = '[REDACTED_API_KEY]';

// The key is in the run container's environment, so a role can print it (`env`,
// a debug log). Every regular file under `dirs` is scanned and each occurrence
// replaced, before anything is graded, judged, or kept. `skip` names directory
// entries not to enter (.git: its objects are compressed; see gitHolds).
// Returns the files changed, never the key.
export function redactKey(dirs, { key = readApiKey(), skip = [] } = {}) {
  const needle = Buffer.from(key);
  const changed = [];
  const walk = (d) => {
    let entries;
    try { entries = readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const f = path.join(d, e.name);
      if (e.isSymbolicLink() || skip.includes(e.name)) continue;
      if (e.isDirectory()) { walk(f); continue; }
      let b;
      try { b = readFileSync(f); } catch { continue; } // unreadable (mode 000): restored later, never held output
      if (!b.includes(needle)) continue;
      writeFileSync(f, b.toString('latin1').split(key).join(REDACTED), 'latin1');
      changed.push(f);
    }
  };
  for (const d of dirs) if (existsSync(d)) walk(d);
  return changed;
}

// Whether a repository's history, index, or stashes hold the key (git objects
// are compressed, so a file scan cannot see them). The repository is the
// run's, so none of its own diff helpers may run here, on the host:
// --no-ext-diff and --no-textconv on every command that prints a patch.
export const NO_HELPERS = ['--no-ext-diff', '--no-textconv'];
export function gitHolds(repo, run, { key = readApiKey() } = {}) {
  for (const args of [['log', '--all', '-p', ...NO_HELPERS], ['diff', '--cached', ...NO_HELPERS], ['stash', 'list', '-p', ...NO_HELPERS]]) {
    let out;
    try { out = run(repo, args); } catch { continue; }
    if (out.includes(key)) return true;
  }
  return false;
}
