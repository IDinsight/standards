// The protocol is split into PROTOCOL.md, which every workflow role reads, and
// chapters in protocol/, which a role reads only when the reading guide in
// PROTOCOL.md names them. These tests keep the two consistent.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { COMPLETION_POLICIES, HANDOFF_KINDS, STATES } from '../runtime/lib/core.mjs';

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

// Read a core section, including its subsections, without matching headings
// inside the persisted-state example's fenced Markdown.
function coreSection(title) {
  let fence = false;
  let collecting = false;
  const lines = [];
  for (const line of core.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    if (!fence && line.startsWith('## ')) {
      if (collecting) break;
      collecting = line === `## ${title}`;
    }
    if (collecting) lines.push(line);
  }
  assert.ok(lines.length > 0, `missing core section: ${title}`);
  return lines.join('\n');
}

function firstColumnValues(section) {
  return [...section.matchAll(/^\|\s*`([A-Z_]+)`\s*\|/gm)].map((match) => match[1]);
}

test('completion policy vocabulary, gate table, and persisted state agree', () => {
  const policies = coreSection('Completion Policies');
  const values = [...policies.matchAll(/^- ([A-Z_]+)$/gm)].map((match) => match[1]);
  assert.deepEqual(values, ['NONE', 'FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED']);
  assert.deepEqual(COMPLETION_POLICIES, values, 'runtime and protocol policy values must agree');
  assert.deepEqual(firstColumnValues(policies), values);
  assert.deepEqual(firstColumnValues(coreSection('Standard Cycle Completion')), values.slice(1));

  const saved = [...coreSection('Persisted Workflow State')
    .matchAll(/`CompletionPolicy`:\s*`([^`]+)`/g)].map((match) => match[1]);
  assert.deepEqual(saved, ['FULL_DELIVERABLE'], 'the active standard state example needs one explicit policy');
  assert.match(coreSection('Workflow State Reference'), /- `CompletionPolicy`:/);

  // New policy sections must not point at a gate or rule that has no canonical
  // definition, including the separately assessed early-closure gate.
  const defined = new Set([core, ...chapters.map((name) => source(`protocol/${name}`))].flatMap((text) => headings(text)));
  for (const section of [policies, coreSection('Standard Cycle Completion')]) {
    for (const match of section.matchAll(/\*\*([^*]+)\*\*/g)) {
      const title = match[1].replace(/\s+/g, ' ').trim();
      assert.ok(defined.has(title), `undefined completion-contract reference: ${title}`);
    }
  }
});

test('standard completion routes retain upstream phases and a user sign-off boundary', () => {
  const forward = coreSection('Forward Transitions');
  const routes = new Map([...forward.matchAll(/### ([^\n]+)\n([\s\S]*?)(?=\n### |$)/g)]
    .map(([, title, body]) => {
      const block = /```text\n([\s\S]*?)\n```/.exec(body);
      assert.ok(block, `missing route for ${title}`);
      return [title, block[1].split('\n').map((line) => line.replace(/^-> /, ''))];
    }));
  const short = routes.get('Standard Implementation-Reviewed Completion');
  assert.deepEqual(short, ['REVIEWING_IMPLEMENTATION', 'AWAITING_USER_SIGNOFF']);
  const fullTail = ['REVIEWING_IMPLEMENTATION', 'DOCUMENTING', 'REVIEWING_FINAL',
    'SYNCHRONIZING', 'AWAITING_USER_SIGNOFF'];
  for (const [title, prefix] of [
    ['Standard Greenfield', ['SCOPING', 'ARCHITECTING', 'AUDITING', 'DEVELOPING', 'TESTING']],
    ['Standard Brownfield', ['AUDITING', 'SCOPING', 'ARCHITECTING', 'DEVELOPING', 'TESTING']],
  ]) {
    assert.deepEqual(routes.get(title), [...prefix, ...fullTail], title);
  }
  assert.deepEqual(routes.get('Expedited Brownfield'),
    ['DEVELOPING', 'REVIEWING_IMPLEMENTATION', 'AWAITING_USER_SIGNOFF']);
});

test('runtime handoff kinds match the protocol vocabulary', () => {
  const reference = coreSection('Workflow State Reference');
  const vocabulary = /### Handoff\n\n([\s\S]*?)\. Use `NONE`/.exec(reference);
  assert.ok(vocabulary, 'missing canonical handoff vocabulary');
  const kinds = [...vocabulary[1].matchAll(/`([A-Z_]+)`/g)].map((match) => match[1]);
  assert.equal(kinds.length, new Set(kinds).size, 'handoff kinds must not be repeated');
  assert.deepEqual([...HANDOFF_KINDS].sort(), kinds.sort());
});

test('completion policy changes have only the documented boundary routes', () => {
  const chapter = source('protocol/user-decisions.md');
  const section = /## Change completion policy\n([\s\S]*?)(?=\n## )/.exec(chapter);
  assert.ok(section, 'missing completion-policy user decision');
  const rows = [...section[1].matchAll(/^[ \t]*\|\s*(`[^\n]+)\|$/gm)]
    .map((match) => match[1].split('|').map((cell) => cell.trim()));
  const codes = (cell) => [...cell.matchAll(/`([A-Z_]+)`/g)].map((match) => match[1]);
  assert.equal(rows.length, 3, 'one same-state rule and two state-changing boundaries');
  assert.deepEqual(codes(rows[0][0]),
    ['SCOPING', 'ARCHITECTING', 'AUDITING', 'DEVELOPING', 'TESTING', 'REVIEWING_IMPLEMENTATION']);
  assert.equal(rows[0][2], 'Same state');
  const routes = rows.slice(1).map(([from, policies, to]) => ({
    from: codes(from)[0], policies: codes(policies), to: codes(to)[0],
  }));
  assert.deepEqual(routes, [
    { from: 'DOCUMENTING', policies: ['FULL_DELIVERABLE', 'IMPLEMENTATION_REVIEWED'], to: 'REVIEWING_IMPLEMENTATION' },
    { from: 'AWAITING_USER_SIGNOFF', policies: ['IMPLEMENTATION_REVIEWED', 'FULL_DELIVERABLE'], to: 'DOCUMENTING' },
  ]);
  for (const { from, to } of routes) {
    assert.ok(STATES.has(from) && STATES.has(to), 'policy changes must use canonical workflow states');
  }
});

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
