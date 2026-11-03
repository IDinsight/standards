#!/usr/bin/env node
// Check that site.json and the pages under content/ agree.
//
//   npm run doctor               report problems and fix site.json
//   npm run doctor -- --dry-run  report problems without fixing them
//
// Exit code 0 means no problems remain; 1 means at least one does.
import { realpathSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadIndex } from './lib/page-index.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(root, 'site.json');

// Compare the manifest with the page index. Each problem says whether the
// doctor can fix it in site.json.
export function diagnose(manifest, index) {
  const problems = [];
  const listed = new Set(manifest.pages.map((page) => page.file));
  for (const page of manifest.pages) {
    if (!(page.file in index)) {
      problems.push({ kind: 'missing-file', file: page.file, slug: page.slug, fixable: true });
    }
  }
  for (const [file, entry] of Object.entries(index)) {
    if (!listed.has(file)) problems.push({ kind: 'unlisted-page', file, fixable: true });
    for (const target of entry.links) {
      if (!(target in index)) problems.push({ kind: 'broken-link', file, target, fixable: false });
    }
  }
  return problems;
}

// A new manifest with entries for missing files dropped and unlisted pages
// appended at the end.
export function applyFixes(manifest, problems) {
  const missing = new Set(problems.filter((problem) => problem.kind === 'missing-file').map((problem) => problem.file));
  const pages = manifest.pages.filter((page) => !missing.has(page.file));
  for (const problem of problems.filter((entry) => entry.kind === 'unlisted-page')) {
    const slug = path.posix.basename(problem.file, '.md');
    pages.push({ slug, title: slug, file: problem.file });
  }
  return { ...manifest, pages };
}

export function describe(problem) {
  switch (problem.kind) {
    case 'missing-file': return `${problem.file} is listed in site.json as "${problem.slug}" but does not exist`;
    case 'unlisted-page': return `${problem.file} is not listed in site.json`;
    default: return `${problem.file} links to ${problem.target}, which does not exist`;
  }
}

async function main(args) {
  const dryRun = args.includes('--dry-run');
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
  const index = await loadIndex(root);
  const problems = diagnose(manifest, index);
  if (problems.length === 0) {
    console.log('No problems found.');
    return 0;
  }
  for (const problem of problems) console.log(`- ${describe(problem)}`);
  if (dryRun) {
    console.log(`Dry run: ${problems.length} problem(s) found; site.json left as is.`);
    return 1;
  }
  const fixable = problems.filter((problem) => problem.fixable);
  if (fixable.length) {
    await writeFile(MANIFEST, `${JSON.stringify(applyFixes(manifest, fixable), null, 2)}\n`);
    console.log(`Updated site.json (${fixable.length} fix${fixable.length === 1 ? '' : 'es'}).`);
  }
  const remaining = problems.length - fixable.length;
  if (remaining) console.log(`${remaining} problem(s) need a manual fix.`);
  return remaining ? 1 : 0;
}

function isMain() {
  try {
    return Boolean(process.argv[1])
      && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMain()) {
  main(process.argv.slice(2)).then((code) => { process.exitCode = code; },
    (error) => { console.error(error.message); process.exitCode = 1; });
}
