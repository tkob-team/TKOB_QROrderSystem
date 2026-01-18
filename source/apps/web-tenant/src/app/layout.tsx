import type { Metadata, Viewport } from 'next';
import { Inter, Poppins, Sour_Gummy } from 'next/font/google';
import { Providers } from './providers';
import { RouteChangeLogger } from '@/shared/dev/RouteChangeLogger';
import { UnhandledErrorHandler } from '@/shared/dev/UnhandledErrorHandler';
import '@/styles/globals.css';

// Load fonts using Next.js font loader (more reliable than CSS @import)
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const sourGummy = Sour_Gummy({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-sour-gummy',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TKOB Admin - Restaurant Management',
  description: 'Admin portal for restaurant management - menu, orders, tables, and staff',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${sourGummy.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <RouteChangeLogger />
          <UnhandledErrorHandler />
          {children}
        </Providers>
      </body>
    </html>
  );
}
