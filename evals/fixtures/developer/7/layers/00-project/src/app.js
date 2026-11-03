import { currentStaff } from './auth.js';
import { getOrder, listOrders } from './store.js';
import { notFound, orderList, orderPage } from './views.js';

const html = (status, body) => ({ status, headers: { 'content-type': 'text/html; charset=utf-8' }, body });
const text = (status, body) => ({ status, headers: { 'content-type': 'text/plain; charset=utf-8' }, body });

export function handle(req) {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/health') return text(200, 'ok');
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    if (!currentStaff(req)) {
      return { status: 302, headers: { location: `/login?next=${encodeURIComponent(url.pathname)}` }, body: '' };
    }
    return admin(url);
  }
  return html(404, notFound());
}

function admin(url) {
  if (url.pathname === '/admin' || url.pathname === '/admin/orders') return html(200, orderList(listOrders()));
  const match = /^\/admin\/orders\/(\d+)$/.exec(url.pathname);
  if (match) {
    const order = getOrder(Number(match[1]));
    return order ? html(200, orderPage(order)) : html(404, notFound());
  }
  return html(404, notFound());
}
