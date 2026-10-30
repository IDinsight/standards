import { db } from "@/lib/db"
import { searchCustomers } from "@/lib/customers"

export const dynamic = "force-dynamic"

type Props = {
  searchParams: Promise<{ q?: string }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const { q = "" } = await searchParams
  const customers = await searchCustomers(db, q)

  return (
    <main className="page">
      <h1>Customers</h1>
      <form action="/customers">
        <label htmlFor="q">Name or email</label>{" "}
        <input id="q" name="q" type="search" defaultValue={q} />{" "}
        <button type="submit">Search</button>
      </form>
      {q && customers.length === 0 ? <p className="muted">No matches.</p> : null}
      {customers.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={i}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.orderCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </main>
  )
}
