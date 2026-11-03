import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav>
        <Link href="/admin">Overview</Link> · <Link href="/admin/users">Users</Link> ·{' '}
        <Link href="/admin/events">Events</Link> · <Link href="/admin/settings">Settings</Link>
      </nav>
      <main>{children}</main>
    </div>
  );
}
