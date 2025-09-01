import './globals.css'
import '../styles/theme.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from './fonts'
import { AIProvider } from '../lib/ai/AIProvider'
import NexaAIBar from '../components/ai/NexaAIBar'

export const metadata: Metadata = {
  title: 'Nexa ERP',
  description: 'Enterprise ERP — Phase 4 baseline',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AIProvider>
          <div style={{ padding: 12 }}>
            <NexaAIBar />
          </div>
          {children}
        </AIProvider>
      </body>
    </html>
  )
}
