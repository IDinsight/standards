import assert from "node:assert/strict"
import test from "node:test"

import type { Db } from "../lib/db-types.ts"
import { searchCustomers } from "../lib/customers.ts"

test("searchCustomers skips the query for short input", async () => {
  let called = false
  const db: Db = {
    async query<Row>() {
      called = true
      return { rows: [] as Row[] }
    },
  }
  assert.deepEqual(await searchCustomers(db, " a "), [])
  assert.equal(called, false)
})

test("searchCustomers converts the order count", async () => {
  const db: Db = {
    async query<Row>() {
      const rows = [{ id: 7, name: "Ada Byron", email: "ada@example.org", order_count: "3" }]
      return { rows: rows as unknown as Row[] }
    },
  }
  const [match] = await searchCustomers(db, "ada")
  assert.equal(match.orderCount, 3)
})
