const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (ch) => ENTITIES[ch]);
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

function layout(title, content) {
  return [
    '<!doctype html>',
    `<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>`,
    '<header><a href="/admin/orders">Orders</a></header>',
    `<main>${content}</main>`,
    '</body></html>',
  ].join('\n');
}

export function orderList(orders) {
  const rows = orders.map((order) => `<tr><td><a href="/admin/orders/${order.id}">#${order.id}</a></td>`
    + `<td>${escapeHtml(order.customer.name)}</td><td>${escapeHtml(order.status)}</td></tr>`).join('');
  return layout('Orders', '<h1>Orders</h1><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th></tr></thead>'
    + `<tbody>${rows}</tbody></table>`);
}

export function orderPage(order) {
  const { customer } = order;
  const items = order.items.map((item) => `<tr><td>${escapeHtml(item.name)}</td><td>${item.quantity}</td>`
    + `<td>${money(item.priceCents * item.quantity)}</td></tr>`).join('');
  const total = order.items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  return layout(`Order #${order.id}`, [
    `<h1>Order #${order.id}</h1>`,
    `<p>Status: ${escapeHtml(order.status)}</p>`,
    '<section class="customer"><h2>Customer</h2>',
    `<p>${escapeHtml(customer.name)}<br>${escapeHtml(customer.email)}<br>${escapeHtml(customer.phone)}</p>`,
    `<p>${escapeHtml(customer.address)}</p></section>`,
    `<table><thead><tr><th>Item</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${items}</tbody></table>`,
    `<p>Total: ${money(total)}</p>`,
  ].join('\n'));
}

export function notFound() {
  return layout('Not found', '<h1>Not found</h1>');
}
