export type QueryResult<Row> = { rows: Row[] }

export type Db = {
  query<Row>(text: string, params?: unknown[]): Promise<QueryResult<Row>>
}
