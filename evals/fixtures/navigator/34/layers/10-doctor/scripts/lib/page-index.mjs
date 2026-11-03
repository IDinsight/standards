// Page index used by the doctor: every Markdown file under content/ and the
// pages it links to. The index is saved under var/ so repeated runs on a large
// handbook skip rescanning when no page has changed.
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CACHE_FILE = path.join('var', 'page-index.json');
const LINK = /\]\(([^)\s#]+\.md)(?:#[^)\s]*)?\)/g;

// Links to other pages, as paths from the repository root.
export function linksIn(text) {
  return [...text.matchAll(LINK)]
    .filter((match) => !/^[a-z]+:/i.test(match[1]))
    .map((match) => path.posix.normalize(path.posix.join('content', match[1])));
}

async function readCache(root) {
  try {
    return JSON.parse(await readFile(path.join(root, CACHE_FILE), 'utf8'));
  } catch {
    return null;
  }
}

async function saveCache(root, data) {
  await mkdir(path.join(root, 'var'), { recursive: true });
  await writeFile(path.join(root, CACHE_FILE), `${JSON.stringify(data, null, 2)}\n`);
}

export async function loadIndex(root) {
  const files = (await readdir(path.join(root, 'content')))
    .filter((name) => name.endsWith('.md')).sort()
    .map((name) => `content/${name}`);
  const times = await Promise.all(files.map(async (file) => (await stat(path.join(root, file))).mtimeMs));
  const newest = Math.max(0, ...times);
  const cached = await readCache(root);
  if (cached && cached.newest >= newest
      && JSON.stringify(Object.keys(cached.pages).sort()) === JSON.stringify(files)) {
    return cached.pages;
  }
  const pages = {};
  for (const file of files) {
    pages[file] = { links: linksIn(await readFile(path.join(root, file), 'utf8')) };
  }
  await saveCache(root, { newest, pages });
  return pages;
}
