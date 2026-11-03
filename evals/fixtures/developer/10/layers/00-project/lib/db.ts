import { Pool } from "pg"

import type { Db } from "./db-types.ts"

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })

export const db: Db = {
  async query<Row>(text: string, params: unknown[] = []) {
    const result = await pool.query(text, params)
    return { rows: result.rows as Row[] }
  },
}
