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
        <nav style={{ padding: 12, borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ marginRight: 12 }}>Home</a>
          <a href="/solutions" style={{ marginRight: 12 }}>Solutions</a>
          <a href="/industries" style={{ marginRight: 12 }}>Industries</a>
          <a href="/features" style={{ marginRight: 12 }}>Features</a>
          <a href="/docs" style={{ marginRight: 12 }}>Docs</a>
          <a href="/contact">Contact</a>
        </nav>
        <main style={{ padding: 16 }}>{children}</main>
        <footer style={{ padding: 16, borderTop: '1px solid #eee', marginTop: 24 }}>
          <p>© {new Date().getFullYear()} Nexa. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}
