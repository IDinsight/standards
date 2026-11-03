import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"

import "./globals.css"

export const metadata: Metadata = {
  title: "Orders dashboard",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/orders">Orders</Link>
          <Link href="/customers">Customers</Link>
        </header>
        {children}
      </body>
    </html>
  )
}
