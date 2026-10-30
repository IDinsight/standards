import assert from 'node:assert/strict';
import test from 'node:test';

import { applyFixes, diagnose } from '../scripts/doctor.mjs';
import { linksIn } from '../scripts/lib/page-index.mjs';

const manifest = {
  title: 'Handbook',
  pages: [
    { slug: 'index', title: 'Welcome', file: 'content/index.md' },
    { slug: 'old', title: 'Old page', file: 'content/old.md' },
  ],
};
const index = {
  'content/index.md': { links: ['content/new.md', 'content/gone.md'] },
  'content/new.md': { links: [] },
};

test('reports listed pages whose file is missing', () => {
  const missing = diagnose(manifest, index).filter((problem) => problem.kind === 'missing-file');
  assert.deepEqual(missing.map((problem) => problem.file), ['content/old.md']);
});

test('reports pages missing from site.json', () => {
  const unlisted = diagnose(manifest, index).filter((problem) => problem.kind === 'unlisted-page');
  assert.deepEqual(unlisted.map((problem) => problem.file), ['content/new.md']);
});

test('reports links to pages that do not exist', () => {
  const broken = diagnose(manifest, index).filter((problem) => problem.kind === 'broken-link');
  assert.deepEqual(broken.map((problem) => problem.target), ['content/gone.md']);
  assert.equal(broken[0].fixable, false);
});

test('applyFixes drops missing pages and appends unlisted ones', () => {
  const fixed = applyFixes(manifest, diagnose(manifest, index).filter((problem) => problem.fixable));
  assert.deepEqual(fixed.pages.map((page) => page.slug), ['index', 'new']);
  assert.equal(fixed.title, 'Handbook');
});

test('linksIn resolves relative page links and ignores anchors and URLs', () => {
  const text = 'See [A](a.md), [B](b.md#part), and [site](https://example.com/c.md).';
  assert.deepEqual(linksIn(text), ['content/a.md', 'content/b.md']);
});
