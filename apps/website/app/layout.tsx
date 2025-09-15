import Analytics from "./Analytics";

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
              <a href="/pricing/">Pricing</a>
              <a href="/contact">Contact</a>
              <a href="/legal">Legal</a>
              <a href="/login" className="btn-primary">Login</a>
            </nav>
          </div>
        </header>
        <main className="container">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-10 text-sm text-slate-600 grid md:grid-cols-4 gap-6">
            <div>
              <h4 className="font-semibold mb-2">About Nexa</h4>
              <p className="leading-relaxed">Nexa ERP by Chief A.A Ltd is an AI-powered business management platform that helps organisations streamline operations, improve efficiency, and make smarter decisions with confidence.</p>
              <p className="mt-2">📧 info@chiefaa.com · 📞 +44 7398 975374</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Quick Links</h4>
              <ul className="space-y-1">
                <li><a href="/">Home</a></li>
                <li><a href="/solutions">Solutions</a></li>
                <li><a href="/industries">Industries</a></li>
                <li><a href="/features">Features</a></li>
                <li><a href="/pricing/">Pricing</a></li>
                <li><a href="/contact#demo">Book a demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Products</h4>
              <ul className="space-y-1">
                <li><a href="/solutions#inventory">Inventory</a></li>
                <li><a href="/solutions#finance">Finance</a></li>
                <li><a href="/solutions#manufacturing">Manufacturing</a></li>
                <li><a href="/solutions#projects">Projects</a></li>
                <li><a href="/solutions#payroll">Payroll</a></li>
                <li><a href="/features#ai">AI Assistants</a></li>
                <li><a href="/solutions#pos">Point of Sale (POS)</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Newsletter & Socials</h4>
              <div aria-disabled="true">
                <div className="flex gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" title="Instagram" aria-hidden />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" title="X" aria-hidden />
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300" title="LinkedIn" aria-hidden />
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex items-center justify-between pt-4 border-t mt-2">
              <p>© {new Date().getFullYear()} Chief A.A Ltd</p>
              <nav className="flex gap-4">
                <a href="/compliance/privacy">Privacy</a>
                <a href="/compliance/cookies">Cookies</a>
                <a href="/compliance/accessibility">Accessibility</a>
                <a href="/compliance/security">Security</a>
              </nav>
            </div>
          </div>
        </footer>
      <Analytics />
  </body>
    </html>
  )
}
