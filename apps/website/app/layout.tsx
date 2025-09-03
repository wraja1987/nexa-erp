import './globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.nexaai.co.uk'),
  title: 'Nexa — AI-powered ERP',
  description: 'Run finance, operations, and analytics in one place.',
  alternates: { canonical: '/' }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b sticky top-0 z-50 bg-white/80 backdrop-blur">
          <div className="container flex items-center justify-between py-4">
            <a href="/" className="text-xl font-semibold">Nexa</a>
            <nav className="flex gap-4 text-sm">
              <a href="/solutions">Solutions</a>
              <a href="/industries">Industries</a>
              <a href="/features">Features</a>
              <a href="/docs">Docs</a>
              <a href="/contact" className="btn-primary">Book a demo</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-8 text-sm text-slate-600 flex items-center justify-between">
            <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
            <nav className="flex gap-4">
              <a href="/legal/privacy">Privacy</a>
              <a href="/legal/terms">Terms</a>
              <a href="/legal/cookies">Cookies</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  )
}
