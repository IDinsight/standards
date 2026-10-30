import { listOrders } from '../handlers/orders.js';

export function openOrderCount() {
  return listOrders({ status: 'open' }).body.length;
}
