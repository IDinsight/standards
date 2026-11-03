// Check that relative Markdown links resolve to existing files.
// Usage: node scripts/check-links.mjs [file.md ...]
// Without arguments it checks README.md and every docs/*.md file.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const defaults = () => [
  'README.md',
  ...(existsSync('docs')
    ? readdirSync('docs').filter((name) => name.endsWith('.md')).sort().map((name) => `docs/${name}`)
    : []),
];

const files = process.argv.length > 2 ? process.argv.slice(2) : defaults();
let checked = 0;
const broken = [];

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    checked += 1;
    const resolved = path.join(path.dirname(file), target.split('#')[0]);
    if (!existsSync(resolved)) broken.push(`${file}: ${target}`);
  }
}

for (const entry of broken) console.error(`broken link ${entry}`);
console.log(`Checked ${checked} relative links in ${files.length} files; ${broken.length} broken.`);
process.exit(broken.length ? 1 : 0);
