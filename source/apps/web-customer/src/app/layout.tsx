import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/lib/providers'
import RouteEnterLogger from '@/shared/logging/RouteEnterLogger'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QR Dine - Restaurant Ordering System',
  description: 'Scan QR code to order food at your table',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <RouteEnterLogger />
          {children}
        </Providers>
      </body>
    </html>
  )
}
