import type { Db } from "./db-types.ts"
import { loadSql } from "./sql.ts"

export type Order = {
  id: number
  placedAt: Date
  status: string
  totalCents: number
}

type OrderRow = {
  id: number
  placed_at: Date
  status: string
  total_cents: number
}

export async function listRecentOrders(db: Db, options: { limit: number }): Promise<Order[]> {
  const { rows } = await db.query<OrderRow>(loadSql("recent-orders"), [options.limit])
  return rows.map((row) => ({
    id: row.id,
    placedAt: row.placed_at,
    status: row.status,
    totalCents: row.total_cents,
  }))
}
