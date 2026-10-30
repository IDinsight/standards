import type { ReactNode } from 'react';

import './globals.css';

export const metadata = {
  title: 'Portfolio API',
  description: 'Project records as JSON.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
