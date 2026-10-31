// Check the Markdown documentation: relative links must point at existing
// files, and every `console` block must reproduce the output it shows when its
// commands are run from the repository root.
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const files = [
  'README.md',
  'CONTRIBUTING.md',
  ...readdirSync('docs').filter((name) => name.endsWith('.md')).sort().map((name) => `docs/${name}`),
];

let links = 0;
let examples = 0;
const failures = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');

  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    links += 1;
    const resolved = path.join(path.dirname(file), target.split('#')[0]);
    if (!existsSync(resolved)) failures.push(`${file}: link target ${target} does not exist`);
  }

  for (const block of text.matchAll(/^```console\n([\s\S]*?)^```$/gm)) {
    const runs = [];
    for (const line of block[1].split('\n')) {
      if (line.startsWith('$ ')) runs.push({ command: line.slice(2), expected: [] });
      else if (runs.length) runs.at(-1).expected.push(line);
    }
    for (const { command, expected } of runs) {
      examples += 1;
      const want = expected.join('\n').trimEnd();
      let actual;
      try {
        actual = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trimEnd();
      } catch (error) {
        failures.push(`${file}: "${command}" exited with status ${error.status}`);
        continue;
      }
      if (actual !== want) {
        failures.push(`${file}: "${command}" printed:\n${actual}\nbut the document shows:\n${want}`);
      }
    }
  }
}

for (const failure of failures) console.error(failure);
console.log(`Checked ${links} links and ${examples} examples in ${files.length} files.`);
process.exitCode = failures.length ? 1 : 0;
