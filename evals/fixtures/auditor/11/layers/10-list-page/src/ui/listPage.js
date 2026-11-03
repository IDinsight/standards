const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
}

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function renderListPage(items, { title = 'Catalog' } = {}) {
  const rows = items.map((item) => [
    '    <li class="item">',
    `      <span class="name">${escapeHtml(item.name)}</span>`,
    `      <span class="price">${formatPrice(item.priceCents)}</span>`,
    '    </li>',
  ].join('\n'));
  const body = rows.length
    ? `  <ul class="items">\n${rows.join('\n')}\n  </ul>`
    : '  <p class="empty">No items.</p>';
  return `<main>\n  <h1>${escapeHtml(title)}</h1>\n${body}\n</main>\n`;
}
