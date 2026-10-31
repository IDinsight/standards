// Build a Markdown table of contents from ATX headings.

const START = '<!-- toc -->';
const END = '<!-- tocstop -->';

// GitHub-style anchor: lowercase, punctuation removed, spaces to hyphens.
export function slug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

// Level-2 and deeper headings up to maxDepth, skipping fenced code blocks.
export function headings(markdown, maxDepth = 3) {
  const found = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const match = /^(#{2,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match || match[1].length > maxDepth) continue;
    found.push({ depth: match[1].length, text: match[2] });
  }
  return found;
}

export function renderToc(items, { bullet = '-' } = {}) {
  const seen = new Map();
  const minDepth = Math.min(...items.map((item) => item.depth));
  return items
    .map(({ depth, text }) => {
      const base = slug(text);
      const count = seen.get(base) ?? 0;
      seen.set(base, count + 1);
      const anchor = count ? `${base}-${count}` : base;
      return `${'  '.repeat(depth - minDepth)}${bullet} [${text}](#${anchor})`;
    })
    .join('\n');
}

export function insertToc(markdown, toc) {
  const start = markdown.indexOf(START);
  const end = markdown.indexOf(END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`missing ${START} ... ${END} markers`);
  }
  return `${markdown.slice(0, start + START.length)}\n\n${toc}\n\n${markdown.slice(end)}`;
}
