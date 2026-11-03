import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { createApp } from '../src/app.ts';
import type { User } from '../src/auth/users.ts';
import { expectedCsv, matchingSeed, type CaseQuery } from './helpers/export-fixture.ts';

// One test per case file in the configured directory. Each case is an export
// query run by an administrator against the seeded app.
type ExportCase = { name: string; query: CaseQuery };

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const config = JSON.parse(readFileSync(new URL('./export-cases.config.json', import.meta.url), 'utf8'));
const casesDir = path.resolve(projectRoot, config.casesDir);

const root = mkdtempSync(path.join(tmpdir(), 'records-cases-'));
after(() => rmSync(root, { recursive: true, force: true }));

const admin: User = { id: 1, name: 'Ada', role: 'admin' };
const fixedNow = () => new Date('2026-09-24T09:00:00Z');
const fileName = 'records-20260924T090000Z.csv';

for (const file of readdirSync(casesDir).filter((name) => name.endsWith('.json')).sort()) {
  const exportCase: ExportCase = JSON.parse(readFileSync(path.join(casesDir, file), 'utf8'));
  test(`export case ${file}: ${exportCase.name}`, () => {
    const exportDir = path.join(root, path.basename(file, '.json'));
    const response = createApp({ exportDir, now: fixedNow }).handle({
      method: 'POST', path: '/records/export', query: exportCase.query, user: admin,
    });
    assert.equal(response.status, 201);
    assert.equal(response.body, expectedCsv(matchingSeed(exportCase.query)));
    assert.equal(readFileSync(path.join(exportDir, fileName), 'utf8'), response.body);
  });
}
