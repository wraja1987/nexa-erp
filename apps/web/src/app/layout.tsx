import ConsentBanner from '@/components/ConsentBanner';
import { cookies } from 'next/headers';
import './globals.css'
import '../styles/theme.css'
import type { Metadata } from 'next'
import { geistSans, geistMono } from './fonts'
import { AIProvider } from '../lib/ai/AIProvider'

export const metadata: Metadata = {
  title: 'Nexa ERP',
  description: 'Enterprise ERP — Phase 4 baseline',
}

function hasConsent(): boolean {
  try {
    const c = cookies?.();
    const v = c?.get?.('nexa_consent')?.value || '';
    return v === 'granted';
  } catch { return false; }
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Consent gate placeholder: integrate your CMP and set hasConsent accordingly.
  const hasConsent = false
  // if (hasConsent) { /* load analytics (e.g., Plausible) only after consent */ }
  return (
    <html lang="en-GB" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased selection:bg-sky-200 focus:outline-none">
        <AIProvider>
          {children}
        </AIProvider>
        <ConsentBanner />
  {hasConsent() ? (
    <>
      {/* Plausible loads only after consent */}
      <script defer data-domain="nexaai.co.uk" src="https://plausible.io/js/script.js"></script>
    </>
  ) : null}
</body>
    </html>
  )
}
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'default-no-store';
