import './globals.css'
import '../styles/theme.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from './fonts'

export const metadata: Metadata = {
  title: 'Nexa ERP',
  description: 'Enterprise ERP — Phase 4 baseline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <link rel="manifest" href="/manifest.json" />
        {children}
      </body>
    </html>
  )
}
