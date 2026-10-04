import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { checkClosureAssessment } from '../runtime/lib/review.mjs';
import { recordSection, recordSections } from '../runtime/lib/records.mjs';

const fields = {
  Policy: 'IMPLEMENTATION_REVIEWED', Eligibility: 'ELIGIBLE',
  'User Choice': 'User requested finishing after implementation review.', 'User Reason': 'NONE',
  'Assessed Inputs': 'Scope, design, implementation, full verification, configuration, and dependency content identities.',
  Evidence: 'Current acceptance assessment and owner evidence references.',
  'Unmet Requirements': 'NONE', 'Omitted Phases': 'DOCUMENTING, REVIEWING_FINAL, SYNCHRONIZING',
  'Omitted Guarantees': 'Normal documentation completion, final review, and independent synchronization omitted.',
};
const fieldText = (name, value) => `\`${name}\`: \`${value}\``;
const assessment = (values = fields) => '## Implementation-Reviewed Closure\n\n'
  + Object.entries(values).map(([name, value]) => fieldText(name, value)).join('\n') + '\n';
function check(text, options = {}) {
  const problems = [];
  checkClosureAssessment(text, { required: true, reviewKind: 'IMPLEMENTATION',
    ...options, problem: (message) => problems.push(message) });
  return problems;
}

test('eligible closure requires a separate assessment, while ordinary review does not', () => {
  assert.deepEqual(check(assessment()), []);
  assert.match(check('# Review Report\n`Status`: `COMPLETE`')[0], /requires an Implementation-Reviewed Closure assessment/);
  for (const reviewKind of ['IMPLEMENTATION', 'FINAL_DELIVERABLE']) {
    assert.deepEqual(check('# Review Report\n`Status`: `COMPLETE`', { required: false, reviewKind }), []);
  }
  assert.match(check(assessment(), { required: false, reviewKind: 'FINAL_DELIVERABLE' })[0], /belongs only in the implementation/);
});

test('unassessed and ineligible closure can accompany a passing ordinary review, but cannot establish readiness', () => {
  for (const Eligibility of ['NOT_ASSESSED', 'INELIGIBLE']) {
    const text = assessment({ ...fields, Eligibility,
      'Unmet Requirements': Eligibility === 'INELIGIBLE' ? 'Documenter: required guide evidence.' : 'NONE' });
    assert.deepEqual(check(text, { required: false }), []);
    assert.ok(check(text).some((message) => /requires Closure Eligibility ELIGIBLE/.test(message)));
  }
  assert.match(check(assessment({ ...fields, Eligibility: 'INELIGIBLE' }), { required: false })[0], /must identify the unmet requirements/);
});

test('closure fields are required, unique, concrete, and scoped to the current section', () => {
  for (const [name, value] of Object.entries(fields)) {
    for (const replacement of ['', fieldText(name, ''), fieldText(name, '   '), fieldText(name, '<fill in>'),
      fieldText(name, 'A | B'), `${fieldText(name, value)}\n${fieldText(name, value)}`]) {
      const text = assessment().replace(fieldText(name, value), replacement);
      assert.ok(check(text).some((message) => message.includes(`one concrete ${name} field`)), `${name}: ${replacement}`);
    }
    const missing = assessment().replace(fieldText(name, value), '');
    assert.ok(check(`${fieldText(name, value)}\n${missing}`).some((message) => message.includes(`one concrete ${name} field`)));
  }
});

test('eligibility cannot claim another policy, invent an outcome, omit guarantees, or leave owner work', () => {
  for (const Policy of ['NONE', 'FULL_DELIVERABLE', 'UNKNOWN']) {
    assert.match(check(assessment({ ...fields, Policy }))[0], /Policy must be IMPLEMENTATION_REVIEWED/);
  }
  assert.ok(check(assessment({ ...fields, Eligibility: 'PASSED' })).some((message) => /Closure Eligibility must be/.test(message)));
  for (const name of ['User Choice', 'Assessed Inputs', 'Evidence', 'Omitted Guarantees']) {
    assert.match(check(assessment({ ...fields, [name]: 'NONE' }))[0], new RegExp(`requires ${name}, not NONE`));
  }
  for (const value of ['NONE', 'DOCUMENTING', 'DOCUMENTING, REVIEWING_FINAL, REVIEWING_FINAL', `${fields['Omitted Phases']}, TESTING`]) {
    assert.match(check(assessment({ ...fields, 'Omitted Phases': value }))[0], /Omitted Phases must list/);
  }
  assert.match(check(assessment({ ...fields, 'Unmet Requirements': 'Tester must reverify current content.' }))[0], /Unmet Requirements NONE/);
});

test('commented and fenced examples cannot supply closure evidence; contradictory sections are rejected', () => {
  assert.match(check(`<!--\n${assessment()}-->`)[0], /requires an Implementation-Reviewed Closure assessment/);
  assert.match(check(`~~~markdown\n${assessment()}~~~`)[0], /requires an Implementation-Reviewed Closure assessment/);
  const example = assessment().replace(fieldText('Evidence', fields.Evidence),
    `<!-- ${fieldText('Evidence', fields.Evidence)} -->`);
  assert.ok(check(example).some((message) => /one concrete Evidence/.test(message)));
  assert.match(check(assessment() + assessment({ ...fields, Eligibility: 'INELIGIBLE' }))[0], /exactly one current/);
});

test('real comments cannot supply closure assessments, including indented and unclosed blocks', () => {
  for (const newline of ['\n', '\r\n']) {
    for (const indent of ['', ' ', '  ', '   ']) {
      for (const ending of ['-->', '']) {
        const text = `${indent}<!--\n${assessment()}${ending}`.replaceAll('\n', newline);
        assert.match(check(text)[0], /requires an Implementation-Reviewed Closure assessment/);
      }
    }
    const hidden = `<!--\n~~~\n${assessment()}-->\n\n${assessment()}`.replaceAll('\n', newline);
    assert.deepEqual(check(hidden), []);
  }
});

test('literal comment markers cannot hide a following assessment or a contradictory section', () => {
  const examples = [
    '~~~html\n<!--\n~~~',
    '```html\n<!--\n```',
    '````html\n```\n<!--\n````',
    '   ~~~html\n<!--\n   ~~~',
    'Example: `<!--`',
    'Example: ``a ` and <!--``',
    'Example: `first line\ncontinued <!--`',
    'Example: \\<!--',
    'Example: <!--',
    'Example:\n\uFEFF<!--',
    '    <!--',
    '\t<!--',
    '<span title="<!--">example</span>',
  ];
  for (const example of examples) {
    assert.deepEqual(check(`${example}\n\n${assessment()}`), [], example);
    const duplicate = `${assessment()}\n${example}\n\n${assessment({ ...fields, Eligibility: 'INELIGIBLE' })}`;
    assert.match(check(duplicate)[0], /exactly one current/, example);
  }
});

test('comment-looking text inside code-span fields remains literal and cannot manufacture eligibility', () => {
  for (const Eligibility of ['ELI<!-- note -->GIBLE', '<!-- note -->ELIGIBLE', 'ELIGIBLE<!-- note -->']) {
    assert.ok(check(assessment({ ...fields, Eligibility })).some((message) => /Closure Eligibility must be/.test(message)), Eligibility);
  }
  // A comment marker is legitimate narrative content inside a code-span value.
  assert.deepEqual(check(assessment({ ...fields, Evidence: 'Verified literal <!-- handling.' })), []);
});

test('comment masking preserves boundaries and ignores backticks inside real comments', () => {
  const splitHeading = assessment().replace('Implementation-Reviewed', 'Imple<!-- note -->mentation-Reviewed');
  assert.match(check(splitHeading)[0], /requires an Implementation-Reviewed Closure assessment/);
  const multiline = assessment().replace('\n\n', '\n<!-- a note\nwith a ` backtick -->\n');
  assert.deepEqual(check(multiline), []);
  const between = assessment().replace(fieldText('Eligibility', 'ELIGIBLE'),
    `${fieldText('Eligibility', 'ELIGIBLE')} <!-- an inline note -->`);
  assert.deepEqual(check(between), []);
  const hiddenField = assessment().replace(fieldText('Evidence', fields.Evidence),
    `<!-- ${fieldText('Evidence', fields.Evidence)} -->`);
  assert.ok(check(hiddenField).some((message) => /one concrete Evidence/.test(message)));
  // The closing line of a block comment is still part of that HTML block.
  assert.match(check(`<!-- note -->${assessment()}`)[0], /requires an Implementation-Reviewed Closure assessment/);
});

test('short comments and markers in HTML attributes cannot hide contradictory fields', () => {
  for (const prefix of ['<!-->', '<!--->', '<span title="<!--">example</span>']) {
    const text = `${assessment()}\nExample: ${prefix} ${fieldText('Evidence', 'Contradictory evidence.')} <!-- note -->\n`;
    assert.ok(check(text).some((message) => /one concrete Evidence/.test(message)), prefix);
  }
});

test('attributes on invalid closing tags cannot turn commented fields into evidence', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  for (const name of ['span', 'DIV', 'custom-element']) {
    for (const quote of ['"', "'"]) {
      for (const ending of ['>', '/>']) {
        const example = `Example: </${name} title=${quote}<!-- ${fieldText('Evidence', 'Hidden evidence.')} -->${quote}${ending}`;
        assert.ok(check(`${missing}\n${example}`).some((message) => /one concrete Evidence/.test(message)), example);
        assert.deepEqual(check(`${assessment()}\n${example}`), [], example);
      }
    }
    const comment = `Example: </${name} > <!-- ${fieldText('Evidence', 'Hidden evidence.')} -->`;
    assert.ok(check(`${missing}\n${comment}`).some((message) => /one concrete Evidence/.test(message)), comment);
  }
});

test('multiline raw HTML attributes cannot hide assessments or supply evidence', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  for (const newline of ['\n', '\r\n']) {
    for (const name of ['div', 'details', 'BLOCKQUOTE']) {
      for (const quote of ['"', "'"]) {
        const html = `<${name} title=${quote}\n<!-- marker\n${fieldText('Evidence', 'Attribute only.')}\n${quote}>\n</${name}>`;
        assert.deepEqual(check(`${html}\n\n${assessment()}`.replaceAll('\n', newline)), [], html);
        assert.match(check(`${assessment()}\n${html}\n\n${assessment({ ...fields, Eligibility: 'INELIGIBLE' })}`
          .replaceAll('\n', newline))[0], /exactly one current/, html);
        assert.ok(check(`${missing}\n${html}`.replaceAll('\n', newline))
          .some((message) => /one concrete Evidence/.test(message)), html);
      }
    }
    // Blank lines end ordinary HTML blocks; Markdown inside details still works.
    assert.deepEqual(check(`<details>\n\n${assessment()}\n</details>`.replaceAll('\n', newline)), []);
    // An incomplete inline tag does not start a raw HTML block. The following
    // unclosed comment is real and cannot supply the assessment below it.
    assert.match(check(`<span title="\n<!--\n">\n\n${assessment()}`.replaceAll('\n', newline))[0],
      /requires an Implementation-Reviewed Closure assessment/);
  }
});

test('raw HTML blocks use their own endings and stay within their containers', () => {
  const wrappers = [
    (text) => text,
    (text) => text.split('\n').map((line) => `> ${line}`).join('\n'),
    (text) => `- ${text.replaceAll('\n', '\n  ')}`,
  ];
  const delimiters = [['<pre>', '</pre>'], ['<SCRIPT>', '</SCRIPT>'], ['<style>', '</style>'],
    ['<textarea>', '</textarea>'], ['<?instruction', '?>'], ['<!DOCTYPE', '>'], ['<![CDATA[', ']]>']];
  for (const [open, close] of delimiters) {
    for (const wrap of wrappers) {
      const html = wrap(`${open}\n<!--\n\n${assessment()}${close}`);
      assert.match(check(html)[0], /requires an Implementation-Reviewed Closure assessment/, open);
      assert.deepEqual(check(`${html}\n\n${assessment()}`), [], open);
      assert.match(check(`${assessment()}\n${html}\n\n${assessment()}`)[0], /exactly one current/, open);
    }
  }
  for (const wrap of wrappers) {
    const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
    const html = wrap(`<custom-element title="<!--">\n${fieldText('Evidence', 'HTML only.')}`);
    assert.ok(check(`${missing}\n${html}`).some((message) => /one concrete Evidence/.test(message)), html);
    assert.deepEqual(check(`${html}\n\n${assessment()}`), [], html);
  }
  for (const opener of ['> <details title="', '- <details title="']) {
    assert.deepEqual(check(`${opener}\n\n${assessment()}`), [], opener);
  }
});

test('ordered markers only interrupt a continuing paragraph when they start with 1', () => {
  const contradictory = fieldText('Eligibility', 'INELIGIBLE');
  const wrappers = [
    (text) => text,
    (text) => text.split('\n').map((line) => `> ${line}`).join('\n'),
    (text) => `- ${text.replaceAll('\n', '\n  ')}`,
  ];
  for (const newline of ['\n', '\r\n']) {
    for (const marker of ['0.', '2.', '9)', '01.', '001)', '123456789.']) {
      const example = `Example: \`start\n${marker} <!-- marker\`\n${' '.repeat(marker.length + 1)}${contradictory}`;
      for (const wrap of wrappers) {
        assert.ok(check(`${assessment()}\n${wrap(example)}\n`.replaceAll('\n', newline))
          .some((message) => /one concrete Eligibility/.test(message)), wrap(example));
      }
      // Any start number remains valid after a blank line.
      const comment = `${marker} <!--\n${' '.repeat(marker.length + 1)}${contradictory}\n`;
      assert.deepEqual(check(`${assessment()}\n${comment}`.replaceAll('\n', newline)), [], marker);
    }
    // A new sibling item or a block outside a quote can start with another number.
    for (const prefix of ['1. ', '- ', '> ']) {
      const example = `${prefix}Example: \`start\n2. <!-- marker\`\n   ${contradictory}`;
      assert.deepEqual(check(`${assessment()}\n${example}`.replaceAll('\n', newline)), [], prefix);
    }
    for (const marker of ['1.', '1)']) {
      const example = `Example: \`start\n${marker} <!-- marker\`\n   ${contradictory}`;
      assert.deepEqual(check(`${assessment()}\n${example}`.replaceAll('\n', newline)), [], marker);
    }
  }
});

test('container comments cannot supply evidence or cross into a later block', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  const hidden = fieldText('Evidence', 'Only present in a comment.');
  const examples = [
    `- <!--\n  ${hidden}\n\n  -->`,
    `1. <!--\n\n   ${hidden}\n\n   -->`,
    `> <!--\n> ${hidden}\n>\n> -->`,
    `> - <!--\n>   ${hidden}\n>\n>   -->`,
    `- outer\n  - <!--\n    ${hidden}\n\n    -->`,
    `- Example: \`\n- <!-- ${hidden} -->`,
    `Example: \`\n> <!-- ${hidden} -->`,
    `Example: \`\n---\nExample: <!-- ${hidden} -->`,
  ];
  for (const newline of ['\n', '\r\n']) {
    for (const example of examples) {
      assert.ok(check(`${missing}\n${example}\n`.replaceAll('\n', newline))
        .some((message) => /one concrete Evidence/.test(message)), example);
      assert.deepEqual(check(`${assessment()}\n${example}\n`.replaceAll('\n', newline)), [], example);
    }
    for (const opener of ['- <!--', '> <!--', '> - <!--', '- outer\n  - <!--']) {
      assert.deepEqual(check(`${opener}\n\n${assessment()}`.replaceAll('\n', newline)), [], opener);
      assert.match(check(`${assessment()}\n${opener}\n\n${assessment()}`.replaceAll('\n', newline))[0],
        /exactly one current/, opener);
    }
  }
});

test('Unicode whitespace is content and cannot keep a list comment open outside its item', () => {
  const contradictory = fieldText('Eligibility', 'INELIGIBLE');
  for (const newline of ['\n', '\r\n']) {
    for (const whitespace of ['\u00a0', '\u2003', '\u2028', '\u2029', '\uFEFF']) {
      const outside = `- <!--\n${whitespace}\n  ${contradictory}\n`;
      assert.ok(check(`${assessment()}\n${outside}`.replaceAll('\n', newline))
        .some((message) => /one concrete Eligibility/.test(message)), JSON.stringify(whitespace));
      const inside = `- <!--\n  ${whitespace}\n  ${contradictory}\n`;
      assert.deepEqual(check(`${assessment()}\n${inside}`.replaceAll('\n', newline)), []);
      // A Unicode-only item is nonempty and can interrupt a paragraph.
      const item = `Example: \`start\n- ${whitespace}\n  <!-- marker\`\n  ${contradictory}\n`;
      assert.deepEqual(check(`${assessment()}\n${item}`.replaceAll('\n', newline)), []);
    }
    for (const blank of ['', ' ', '\t', ' \t ']) {
      const comment = `- <!--\n${blank}\n  ${contradictory}\n`;
      assert.deepEqual(check(`${assessment()}\n${comment}`.replaceAll('\n', newline)), []);
    }
  }
});

test('reference definitions cannot pair their backticks with the following paragraph', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  const hidden = fieldText('Evidence', 'Hidden evidence.');
  const definitions = [
    '[ref]: /url "Literal `"',
    "[ref]: /url 'Literal `'",
    '[ref]: /url (Literal `)',
    '[ref]: /url\n  "Literal `"',
    '[ref]:\n  /url "Literal `"',
    '[ref]: /url "Literal\ncontinued `"',
    '[ref`]: /url',
    '[ref]: /url`',
    '[ref]: <a ` destination>',
    '[ref]: /url(a(b)) "Literal `"',
    '[ref]: /url "Escaped \\" and `"',
    '[ref]: /url\n[second]: /other "Literal `"',
  ];
  const wrappers = [
    (text) => text,
    (text) => text.split('\n').map((line) => `> ${line}`).join('\n'),
    (text) => `- ${text.replaceAll('\n', '\n  ')}`,
  ];
  for (const newline of ['\n', '\r\n']) {
    for (const definition of definitions) {
      for (const wrap of wrappers) {
        const example = wrap(`${definition}\nExample: <!-- ${hidden} -->`);
        assert.ok(check(`${missing}\n${example}`.replaceAll('\n', newline))
          .some((message) => /one concrete Evidence/.test(message)), example);
        assert.deepEqual(check(`${assessment()}\n${example}`.replaceAll('\n', newline)), []);
      }
    }
    // Malformed definitions and definition-like text within a paragraph remain
    // literal, so their backticks can still form an ordinary inline code span.
    for (const literal of ['[ref]: /url "Literal `" trailing', '[ref]: /url(unbalanced "Literal `"',
      '[ref]: <unclosed "Literal `"', '[ ]: /url "Literal `"', 'Example:\n[ref]: /url "Literal `"']) {
      assert.deepEqual(check(`${missing}\n${literal}\nExample: <!-- ${hidden} -->`.replaceAll('\n', newline)), [], literal);
    }
    // A title on a later line may fail while the destination-only definition
    // remains valid; its backtick must not leak into the following paragraph.
    const fallback = `[ref\`]: /url\n"invalid title" trailing\nExample: <!-- ${hidden} -->`;
    assert.ok(check(`${missing}\n${fallback}`.replaceAll('\n', newline))
      .some((message) => /one concrete Evidence/.test(message)));
    const titleField = `[ref]: /url "${hidden}"`;
    assert.ok(check(`${missing}\n${titleField}`.replaceAll('\n', newline))
      .some((message) => /one concrete Evidence/.test(message)));
  }
});

test('both parsing stages keep mixed, short, and suffixed fence markers inside code', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  for (const fence of ['~~~', '```', '~~~~', '````']) {
    const invalid = [fence + (fence[0] === '~' ? '`' : '~'), fence + ' text', fence.slice(1)];
    for (const closer of invalid) {
      const example = `${fence}\nexample\n${closer}\n<!-- ${fieldText('Evidence', 'Example only.')} -->\n`;
      assert.ok(check(`${missing}\n${example}`).some((message) => /one concrete Evidence/.test(message)), closer);
      assert.deepEqual(check(`${assessment()}\n${example}`), [], closer);
      assert.equal(recordSections(`${example}${assessment()}`, 'Implementation-Reviewed Closure').length, 0, closer);
      assert.deepEqual(check(`${example}${fence}\n${assessment()}`), [], closer);
    }
  }
  // Backtick info strings containing backticks do not open a fence.
  assert.deepEqual(check('```invalid`info\n\n' + assessment()), []);
  assert.equal(recordSections('```invalid`info\n\n' + assessment(), 'Implementation-Reviewed Closure').length, 1);
});

test('Unicode separators in fence info cannot expose code examples as assessments', () => {
  for (const newline of ['\n', '\r\n']) {
    for (const fence of ['~~~', '```']) {
      for (const separator of ['\u2028', '\u2029']) {
        const example = `${fence}text${separator}example\n${assessment()}${fence}\n`;
        const text = example.replaceAll('\n', newline);
        assert.match(check(text)[0], /requires an Implementation-Reviewed Closure assessment/);
        assert.equal(recordSections(text, 'Implementation-Reviewed Closure').length, 0);
        assert.deepEqual(check(`${example}\n${assessment()}`.replaceAll('\n', newline)), []);
        // Neither Unicode character is valid trailing whitespace on a closer.
        const invalidCloser = `${fence}\n${fence}${separator}\n${assessment()}${fence}`.replaceAll('\n', newline);
        assert.equal(recordSections(invalidCloser, 'Implementation-Reviewed Closure').length, 0);
        assert.match(check(invalidCloser)[0], /requires an Implementation-Reviewed Closure assessment/);
      }
    }
  }
});

test('code examples inside containers cannot supply evidence or hide later sections', () => {
  const missing = assessment().replace(fieldText('Evidence', fields.Evidence), '');
  const hidden = fieldText('Evidence', 'Example only.');
  const examples = [
    `    <!--\n    ${hidden}`,
    `\t<!--\n\t${hidden}`,
    `-     <!--\n      ${hidden}`,
    `>     <!--\n>     ${hidden}`,
    `- ~~~\n  <!-- ${hidden} -->\n  ~~~`,
    `> ~~~\n> <!-- ${hidden} -->\n> ~~~`,
    `> - ~~~\n>   <!-- ${hidden} -->\n>   ~~~`,
  ];
  for (const example of examples) {
    assert.ok(check(`${missing}\n${example}`).some((message) => /one concrete Evidence/.test(message)), example);
    assert.deepEqual(check(`${assessment()}\n${example}`), [], example);
    assert.deepEqual(check(`${example}\n\n${assessment()}`), [], example);
    assert.match(check(`${assessment()}\n${example}\n\n${assessment()}`)[0], /exactly one current/, example);
  }
  // Lazy paragraph continuation keeps a multiline code span literal.
  for (const example of ['- Example: `first\ncontinued <!--`', '> Example: `first\ncontinued <!--`']) {
    assert.deepEqual(check(`${example}\n\n${assessment()}`), [], example);
  }
});

test('superseded conclusions stay outside the current section, including with CRLF and formatted headings', () => {
  const current = assessment().replace('## Implementation-Reviewed Closure', '## Implementation-Reviewed Closure: ##');
  const history = '\n## Closure Assessment History\n' + assessment({ ...fields, Eligibility: 'INELIGIBLE' })
    .replace('## Implementation-Reviewed Closure', '### Earlier assessment');
  const text = `\uFEFF# Review Report\n\n${current}${history}`.replaceAll('\n', '\r\n');
  assert.deepEqual(check(text), []);
  assert.equal(recordSections(text, 'Implementation-Reviewed Closure').length, 1);
  assert.equal(recordSection(text, 'Implementation-Reviewed Closure'), recordSections(text, 'Implementation-Reviewed Closure')[0]);
});

test('Reviewer template initializes an unassessed closure with the supported fields', () => {
  const template = readFileSync(new URL('../skills/reviewer/template.md', import.meta.url), 'utf8');
  const section = recordSection(template, 'Implementation-Reviewed Closure');
  // The template includes authoring prose with field examples; exercise its
  // initial field block as the role would copy it into a current report.
  const block = section.slice(section.indexOf('`Policy`:'), section.indexOf('Keep each field'));
  const text = `## Implementation-Reviewed Closure\n${block}`;
  assert.deepEqual(check(text, { required: false }), []);
  assert.ok(check(text).some((message) => /requires Closure Eligibility ELIGIBLE/.test(message)));
});
