// The protocol is split into PROTOCOL.md, which every workflow role reads, and
// chapters in protocol/, which a role reads only when the reading guide in
// PROTOCOL.md names them. These tests keep the two consistent.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';

const repo = new URL('../', import.meta.url);
const source = (relative) => readFileSync(new URL(relative, repo), 'utf8');
const chapters = readdirSync(new URL('protocol/', repo)).filter((name) => name.endsWith('.md')).sort();
const core = source('PROTOCOL.md');

// Heading names at the given levels, outside code blocks.
function headings(text, levels = [1, 2, 3, 4, 5, 6]) {
  let fence = false;
  const names = [];
  for (const line of text.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    const match = !fence && /^(#{1,6}) (.+)$/.exec(line);
    if (match && levels.includes(match[1].length)) names.push(match[2].trim());
  }
  return names;
}

// The reading-guide row for each chapter: `| \`name.md\` | sections | when |`.
function guideRows() {
  const rows = new Map();
  for (const line of core.split('\n')) {
    // Cell padding is formatting, not part of the guide contract.
    const match = /^\|\s*`([a-z-]+\.md)`\s*\|([^|]+)\|([^|]+)\|\s*$/.exec(line);
    if (match) rows.set(match[1], match[2].split(',').map((name) => name.trim()));
  }
  return rows;
}

test('every chapter is named in the reading guide and the AGENTS.md block', () => {
  assert.ok(chapters.length > 0, 'protocol/ has no chapters');
  assert.deepEqual([...guideRows().keys()].sort(), chapters);
  assert.match(source('templates/common/AGENTS.md').replace(/\s+/g, ' '), /each chapter in `\.standards\/protocol\/`/);
});

test('the reading guide lists exactly the sections each chapter holds', () => {
  const rows = guideRows();
  for (const name of chapters) {
    assert.deepEqual(rows.get(name), headings(source(`protocol/${name}`), [2, 3]), `reading guide row for ${name}`);
  }
});

test('no heading appears twice across the protocol and its chapters', () => {
  const all = [core, ...chapters.map((name) => source(`protocol/${name}`))].flatMap((text) => headings(text));
  const repeated = all.filter((name, index) => all.indexOf(name) !== index);
  assert.deepEqual(repeated, []);
});

test('a reference to a section in a chapter names that chapter', () => {
  const home = new Map();
  for (const name of chapters) {
    for (const heading of headings(source(`protocol/${name}`), [2, 3])) home.set(heading, name);
  }
  const skills = readdirSync(new URL('skills/', repo), { recursive: true })
    .filter((file) => file.endsWith('.md') && !file.split(/[\\/]/).includes('evals'))
    .map((file) => `skills/${file.split('\\').join('/')}`);
  const files = ['PROTOCOL.md', ...chapters.map((name) => `protocol/${name}`), 'templates/common/AGENTS.md', ...skills];
  const missing = [];
  for (const file of files) {
    const text = source(file);
    for (const match of text.matchAll(/\*\*([^*]+?)\*\*/gs)) {
      const chapter = home.get(match[1].replace(/\s+/g, ' ').trim());
      if (!chapter || file === `protocol/${chapter}`) continue;
      const start = text.lastIndexOf('\n\n', match.index) + 2;
      const end = text.indexOf('\n\n', match.index);
      const paragraph = text.slice(start, end === -1 ? undefined : end);
      if (!paragraph.includes(`.standards/protocol/${chapter}`)) missing.push(`${file}: **${match[1]}**`);
    }
  }
  assert.deepEqual(missing, [], 'each reference should name its chapter in the same paragraph');
});
