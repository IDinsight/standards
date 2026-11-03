import assert from "node:assert/strict"
import test from "node:test"

import type { Db } from "../lib/db-types.ts"
import { listRecentOrders } from "../lib/orders.ts"
import { loadSql } from "../lib/sql.ts"

function fakeDb(rows: unknown[]) {
  const calls: { text: string; params: unknown[] }[] = []
  const db: Db = {
    async query<Row>(text: string, params: unknown[] = []) {
      calls.push({ text, params })
      return { rows: rows as Row[] }
    },
  }
  return { db, calls }
}

test("listRecentOrders runs the recent-orders query with the limit first", async () => {
  const { db, calls } = fakeDb([])
  await listRecentOrders(db, { limit: 50 })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].text, loadSql("recent-orders"))
  assert.equal(calls[0].params[0], 50)
})

test("listRecentOrders maps rows to orders", async () => {
  const placed = new Date("2026-09-01T10:00:00Z")
  const { db } = fakeDb([{ id: 1042, placed_at: placed, status: "paid", total_cents: 1999 }])
  const [order] = await listRecentOrders(db, { limit: 50 })
  assert.equal(order.id, 1042)
  assert.equal(order.placedAt, placed)
  assert.equal(order.status, "paid")
  assert.equal(order.totalCents, 1999)
})
