import { summarize } from './results.js';

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
}

export function renderAdminPage(survey, responses) {
  const sections = summarize(survey, responses).map((item) => {
    const rows = Object.entries(item.counts)
      .map(([option, count]) => `<tr><td>${escapeHtml(option)}</td><td>${count}</td></tr>`)
      .join('');
    return `<section><h2>${escapeHtml(item.text)}</h2><table>${rows}</table></section>`;
  }).join('\n');
  const title = escapeHtml(survey.title);
  return `<!doctype html>\n<html><head><title>${title} results</title></head><body>`
    + `<h1>${title}</h1><p>${responses.length} responses</p>\n${sections}\n</body></html>`;
}
