export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderToolbar() {
  return '<div class="toolbar"><button type="button" id="add-item">Add item</button></div>';
}

export function renderTable(items) {
  const header = '<tr><th>SKU</th><th>Name</th><th>Qty</th></tr>';
  const rows = items.map((item) => `<tr><td>${escapeHtml(item.sku)}</td>`
    + `<td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.qty)}</td></tr>`);
  return `<table><thead>${header}</thead><tbody>${rows.join('')}</tbody></table>`;
}
