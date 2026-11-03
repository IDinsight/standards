// Render every Markdown page in docs/ to site/<name>.html with shared navigation.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DOCS = 'docs';
const SITE = 'site';

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (text) => escape(text)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\[([^\]]+)\]\(([\w-]+)\.md(#[\w-]+)?\)/g, '<a href="$2.html$3">$1</a>');

function pages() {
  return readdirSync(DOCS)
    .filter((name) => name.endsWith('.md'))
    .sort((a, b) => (a === 'index.md' ? -1 : b === 'index.md' ? 1 : a.localeCompare(b)))
    .map((name) => {
      const text = readFileSync(path.join(DOCS, name), 'utf8');
      const title = /^# (.+)$/m.exec(text)?.[1] ?? name;
      return { slug: name.slice(0, -3), title, text };
    });
}

function body(text) {
  const out = [];
  let code = null;
  let list = false;
  const closeList = () => {
    if (list) out.push('</ul>');
    list = false;
  };
  for (const line of text.split('\n')) {
    if (code) {
      if (line.startsWith('```')) {
        out.push(`<pre><code>${escape(code.join('\n'))}</code></pre>`);
        code = null;
      } else {
        code.push(line);
      }
      continue;
    }
    if (line.startsWith('```')) {
      closeList();
      code = [];
      continue;
    }
    const heading = /^(#{1,3}) (.*)$/.exec(line);
    const item = /^- (.*)$/.exec(line);
    if (item) {
      if (!list) out.push('<ul>');
      list = true;
      out.push(`<li>${inline(item[1])}</li>`);
      continue;
    }
    closeList();
    if (heading) out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join('\n');
}

const all = pages();
const nav = all.map((page) => `<a href="${page.slug}.html">${escape(page.title)}</a>`).join(' | ');
mkdirSync(SITE, { recursive: true });
for (const page of all) {
  const html = `<!doctype html>\n<meta charset="utf-8">\n<title>${escape(page.title)}</title>\n<nav>${nav}</nav>\n<main>\n${body(page.text)}\n</main>\n`;
  writeFileSync(path.join(SITE, `${page.slug}.html`), html);
}
process.stdout.write(`Built ${all.length} pages into ${SITE}/\n`);
