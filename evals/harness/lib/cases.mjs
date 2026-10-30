// Load eval cases from skills/<role>/evals/evals.json and give each a stable key
// and content hash. The hash lets a frozen fixture detect that its case's prompt
// or assertions changed after the fixture was reviewed.
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { DEFAULT_COMMIT, EVALS_ROOT, FIXTURES_ROOT, HARNESS_DIR, REPO_ROOT } from './config.mjs';

// Paths and the framework commit are settings (lib/config.mjs); re-exported
// here because most of the harness imports them from this module.
export { DEFAULT_COMMIT, EVALS_ROOT, FIXTURES_ROOT, REPO_ROOT };
// The three hand-written sample specs (developer-1, reviewer-2, navigator-3):
// the generator's format examples and the simulator's cases. They live apart
// from fixtures/, so generating a real developer-1 never overwrites them.
export const SAMPLES_ROOT = path.join(HARNESS_DIR, 'samples');

export const ROLES = readdirSync(path.join(REPO_ROOT, 'skills'))
  .filter((name) => !name.startsWith('.'))
  .sort();

// sha256 of a JSON value, truncated; key order is fixed by the source file.
export const hashOf = (value) => createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);

export function loadRole(role) {
  const file = path.join(REPO_ROOT, 'skills', role, 'evals', 'evals.json');
  const data = JSON.parse(readFileSync(file, 'utf8'));
  return data.evals.map((c) => ({
    key: `${role}-${c.id}`,
    role,
    id: c.id,
    prompt: c.prompt,
    expected: c.expected_output,
    assertions: c.assertions,
    // Only the fields that define the case contribute to the hash.
    hash: hashOf({ prompt: c.prompt, expected: c.expected_output, assertions: c.assertions }),
  }));
}

export const loadAll = () => ROLES.flatMap(loadRole);

// Accepts "developer-1", "developer:1", or "developer/1".
export function findCase(key) {
  const [role, id] = key.split(/[-:/]/);
  const found = loadRole(role).find((c) => String(c.id) === id);
  if (!found) throw new Error(`No case ${key}`);
  return found;
}
