#!/usr/bin/env node
// Checks every relative link and #anchor in README.md and the guides under
// docs/. External links (http, https, mailto) are not followed.
//
//   node docs/tools/check-links.mjs
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FENCE = /^```[\s\S]*?^```/gm;

function guides(dir) {
  return readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'tools' ? [] : guides(relative);
    return entry.name.endsWith('.md') ? [relative] : [];
  });
}

// GitHub-style heading anchors: lowercase, punctuation removed, spaces to hyphens.
function slug(heading) {
  return heading.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

function anchors(file) {
  const text = readFileSync(path.join(root, file), 'utf8').replace(FENCE, '');
  const seen = new Map();
  const found = new Set();
  for (const match of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const base = slug(match[1]);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    found.add(count ? `${base}-${count}` : base);
  }
  return found;
}

const files = ['README.md', ...guides('docs')];
const broken = [];
let count = 0;
for (const file of files) {
  const text = readFileSync(path.join(root, file), 'utf8').replace(FENCE, '').replace(/`[^`\n]*`/g, '');
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    if (/^(?:https?|mailto):/.test(target)) continue;
    count += 1;
    const hash = target.indexOf('#');
    const linked = hash === -1 ? target : target.slice(0, hash);
    const resolved = linked ? path.posix.normalize(path.posix.join(path.posix.dirname(file), linked)) : file;
    if (!existsSync(path.join(root, resolved))) {
      broken.push(`${file}: ${target} (no such file)`);
    } else if (hash !== -1 && resolved.endsWith('.md') && !anchors(resolved).has(target.slice(hash + 1))) {
      broken.push(`${file}: ${target} (no heading for #${target.slice(hash + 1)} in ${resolved})`);
    }
  }
}

if (broken.length) {
  console.error(`Broken links:\n${broken.map((line) => `- ${line}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${count} link${count === 1 ? '' : 's'} in ${files.length} files; all resolve.`);
}
