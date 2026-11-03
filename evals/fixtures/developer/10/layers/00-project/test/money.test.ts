import assert from "node:assert/strict"
import test from "node:test"

import { formatCents } from "../lib/money.ts"

test("formatCents formats dollars and cents", () => {
  assert.equal(formatCents(1999), "$19.99")
  assert.equal(formatCents(5), "$0.05")
  assert.equal(formatCents(123456789), "$1,234,567.89")
  assert.equal(formatCents(-250), "-$2.50")
})
