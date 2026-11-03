import Link from 'next/link';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata = {
  title: 'Helpdesk Help Center',
  description: 'Answers to common questions about your Helpdesk account.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">Helpdesk</Link>
          <nav>
            <Link href="/">Articles</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
