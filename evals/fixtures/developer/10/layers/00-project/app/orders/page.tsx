import { db } from "@/lib/db"
import { formatCents } from "@/lib/money"
import { listRecentOrders } from "@/lib/orders"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const orders = await listRecentOrders(db, { limit: 50 })

  return (
    <main className="page">
      <h1>Recent orders</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Order</th>
            <th scope="col">Placed</th>
            <th scope="col">Status</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.placedAt.toISOString().slice(0, 10)}</td>
              <td>{order.status}</td>
              <td>{formatCents(order.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
