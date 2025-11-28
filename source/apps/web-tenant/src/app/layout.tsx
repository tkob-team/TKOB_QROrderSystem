import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'TKOB Admin - Restaurant Management',
  description: 'Admin portal for restaurant management - menu, orders, tables, and staff',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
