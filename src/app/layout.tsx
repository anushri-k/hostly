import type { Metadata } from 'next'
import { Inter, Newsreader } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['italic'],
  weight: ['400', '500'],
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  title: 'Hostly — Restaurant OS',
  description: 'Run your restaurant: orders, menu, payments, tables and analytics.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${newsreader.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
