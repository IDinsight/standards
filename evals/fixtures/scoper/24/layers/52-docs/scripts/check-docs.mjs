// Check that every page in docs/ has a title line and that links between pages resolve.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DOCS = 'docs';
const problems = [];
const names = readdirSync(DOCS).filter((name) => name.endsWith('.md')).sort();
for (const name of names) {
  const text = readFileSync(path.join(DOCS, name), 'utf8');
  if (!text.startsWith('# ')) problems.push(`${name}: first line must be a "# Title" heading`);
  for (const match of text.matchAll(/\]\(([^)#\s]+\.md)(#[^)]*)?\)/g)) {
    if (!existsSync(path.join(DOCS, match[1]))) problems.push(`${name}: link to missing page ${match[1]}`);
  }
}
if (problems.length) {
  process.stderr.write(`${problems.join('\n')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`docs ok: ${names.length} pages\n`);
}
