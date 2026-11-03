import assert from 'node:assert/strict';
import test from 'node:test';

import { headings, insertToc, renderToc, slug } from '../src/toc.js';

test('slug lowercases and joins words with hyphens', () => {
  assert.equal(slug('Getting Started'), 'getting-started');
  assert.equal(slug('Use `--write`!'), 'use---write');
});

test('headings skips the title, deep levels, and fenced code', () => {
  const md = ['# Title', '## Install', '```', '## not a heading', '```', '### Options', '#### Deep'].join('\n');
  assert.deepEqual(headings(md, 3), [
    { depth: 2, text: 'Install' },
    { depth: 3, text: 'Options' },
  ]);
});

test('renderToc indents by depth and numbers repeated anchors', () => {
  const toc = renderToc([
    { depth: 2, text: 'Usage' },
    { depth: 3, text: 'Examples' },
    { depth: 2, text: 'API' },
    { depth: 3, text: 'Examples' },
  ]);
  assert.equal(toc, [
    '- [Usage](#usage)',
    '  - [Examples](#examples)',
    '- [API](#api)',
    '  - [Examples](#examples-1)',
  ].join('\n'));
});

test('renderToc uses the configured bullet', () => {
  assert.equal(renderToc([{ depth: 2, text: 'Usage' }], { bullet: '*' }), '* [Usage](#usage)');
});

test('insertToc replaces the text between the markers', () => {
  const md = '# Doc\n\n<!-- toc -->\nold\n<!-- tocstop -->\n\n## A\n';
  assert.equal(insertToc(md, '- [A](#a)'), '# Doc\n\n<!-- toc -->\n\n- [A](#a)\n\n<!-- tocstop -->\n\n## A\n');
  assert.throws(() => insertToc('# Doc\n', '- [A](#a)'), /markers/);
});
