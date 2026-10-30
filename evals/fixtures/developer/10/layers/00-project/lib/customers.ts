import type { Db } from "./db-types.ts"
import { loadSql } from "./sql.ts"

export type CustomerMatch = {
  id: number
  name: string
  email: string
  orderCount: number
}

type CustomerRow = { id: number; name: string; email: string; order_count: string }

export async function searchCustomers(db: Db, text: string): Promise<CustomerMatch[]> {
  const query = text.trim()
  if (query.length < 2) return []
  const { rows } = await db.query<CustomerRow>(loadSql("search-customers"), [query])
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    orderCount: Number(r.order_count),
  }))
}
