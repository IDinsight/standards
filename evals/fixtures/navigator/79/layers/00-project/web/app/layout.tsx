import Script from 'next/script';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Volunteer Portal',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const analyticsKey = process.env.NEXT_PUBLIC_ANALYTICS_KEY;
  return (
    <html lang="en">
      <body>
        {children}
        {analyticsKey ? (
          <Script
            src="https://cdn.usagepulse.io/v2/tag.js"
            data-key={analyticsKey}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
