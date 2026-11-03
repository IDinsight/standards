// Run every `$ csvsum ...` line inside a ```console block of a Markdown file
// and compare its output with the lines that follow it in the block.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = process.argv[2] ?? 'docs/usage.md';
const text = readFileSync(path.resolve(root, file), 'utf8');

function examples(markdown) {
  const found = [];
  for (const [, block] of markdown.matchAll(/^```console\n([\s\S]*?)^```$/gm)) {
    let current = null;
    for (const line of block.replace(/\n$/, '').split('\n')) {
      if (line.startsWith('$ ')) {
        current = { command: line.slice(2), expected: [] };
        found.push(current);
      } else if (current) {
        current.expected.push(line);
      }
    }
  }
  return found;
}

function words(command) {
  return [...command.matchAll(/'([^']*)'|"([^"]*)"|(\S+)/g)].map((match) => match[1] ?? match[2] ?? match[3]);
}

let checked = 0;
let failed = 0;
for (const { command, expected } of examples(text)) {
  const [name, ...args] = words(command);
  if (name !== 'csvsum') continue;
  checked += 1;
  let actual;
  try {
    actual = execFileSync(process.execPath, [path.join(root, 'bin/csvsum.js'), ...args], {
      cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    actual = `${error.stdout ?? ''}${error.stderr ?? ''}`;
  }
  if (actual.trimEnd() !== expected.join('\n').trimEnd()) {
    failed += 1;
    process.stdout.write(`FAIL ${command}\n--- expected\n${expected.join('\n')}\n--- actual\n${actual.trimEnd()}\n`);
  }
}
process.stdout.write(`${checked} example(s) checked, ${failed} failed\n`);
process.exitCode = failed ? 1 : 0;
